'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EstadoCaja = {
    id: string
    estado: 'abierta' | 'cerrada'
    saldoActual: number
    saldoInicial: number
    fechaApertura: string
    numeroCaja: number
    usuarioId: string
} | null

export type MovimientoCaja = {
    id: string
    tipo: 'INGRESO' | 'EGRESO'
    monto: number
    concepto: string
    referencia: string | null
    createdAt: string
}

export type CajaCompleta = {
    // Datos de la caja
    id: string
    numeroCaja: number
    estado: 'abierta' | 'cerrada'
    saldoInicial: number
    saldoActual: number
    fechaApertura: string
    // Datos del usuario
    usuario: {
        id: string
        nombres: string
        apellidoPaterno: string
        rol: string
        email: string
    }
    // KPIs del turno
    totalIngresos: number
    totalEgresos: number
    cantidadOperaciones: number
    // Últimos movimientos
    ultimosMovimientos: MovimientoCaja[]
} | null

export async function obtenerEstadoCaja(): Promise<EstadoCaja> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Buscar caja abierta del usuario actual
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id, estado, saldo_actual, saldo_inicial, fecha_apertura, numero_caja')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single()

    if (!caja) return null

    return {
        id: caja.id,
        estado: caja.estado,
        saldoActual: caja.saldo_actual,
        saldoInicial: caja.saldo_inicial,
        fechaApertura: caja.fecha_apertura,
        numeroCaja: caja.numero_caja,
        usuarioId: user.id
    }
}

export async function obtenerCajaCompleta(): Promise<CajaCompleta> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 1. Obtener caja abierta con datos del usuario
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select(`
            *,
            usuarios (
                id,
                nombres,
                apellido_paterno,
                rol,
                email
            )
        `)
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single()

    if (!caja) return null

    // 2. Obtener movimientos del turno
    const { data: movimientos } = await supabase
        .from('movimientos_caja_operativa')
        .select('id, tipo, monto, motivo, descripcion, fecha')
        .eq('caja_operativa_id', caja.id)
        .order('fecha', { ascending: false })
        .limit(10)

    // 3. Calcular KPIs
    const { data: kpis } = await supabase
        .from('movimientos_caja_operativa')
        .select('tipo, monto')
        .eq('caja_operativa_id', caja.id)

    let totalIngresos = 0
    let totalEgresos = 0
    kpis?.forEach(m => {
        if (m.tipo === 'INGRESO') totalIngresos += Number(m.monto)
        else totalEgresos += Number(m.monto)
    })

    return {
        id: caja.id,
        numeroCaja: caja.numero_caja,
        estado: caja.estado,
        saldoInicial: caja.saldo_inicial,
        saldoActual: caja.saldo_actual,
        fechaApertura: caja.fecha_apertura,
        usuario: {
            id: caja.usuarios.id,
            nombres: caja.usuarios.nombres,
            apellidoPaterno: caja.usuarios.apellido_paterno,
            rol: caja.usuarios.rol,
            email: caja.usuarios.email
        },
        totalIngresos,
        totalEgresos,
        cantidadOperaciones: kpis?.length || 0,
        ultimosMovimientos: (movimientos || []).map(m => ({
            id: m.id,
            tipo: m.tipo,
            monto: m.monto,
            concepto: m.motivo || m.descripcion,
            referencia: null,
            createdAt: m.fecha
        }))
    }
}

export async function obtenerRolUsuario(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

    return data?.rol || null
}

export async function abrirCajaAction(montoInicial: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Usuario no autenticado" }

    // Verificar si ya tiene caja abierta
    const { data: existente } = await supabase
        .from('cajas_operativas')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single()

    if (existente) return { error: "Ya tienes una caja abierta" }

    // PRODUCCIÓN: Usar RPC que deduce de bóveda atómicamente
    const { data: cajaId, error } = await supabase.rpc('admin_asignar_caja', {
        p_usuario_cajero_id: user.id,
        p_monto: montoInicial,
        p_observacion: 'Apertura desde dashboard'
    })

    if (error) {
        console.error('Error abriendo caja:', error)
        // Mensaje amigable para fondos insuficientes
        if (error.message.includes('Fondos insuficientes')) {
            return { error: "No hay fondos suficientes en la Bóveda Central. Contacta a un administrador." }
        }
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/caja')
    return { success: true, cajaId: cajaId }
}

export async function cerrarCajaAction(
    montoFisico: number,
    observaciones?: string,
    forzarCierreConPendientes?: boolean
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Usuario no autenticado" }

    // 1. Obtener caja abierta del usuario
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id, saldo_actual')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single()

    if (!caja) return { error: "No tienes ninguna caja abierta para cerrar." }

    // 2. VALIDACIÓN: Verificar créditos pendientes de desembolso
    const { data: creditosPendientes } = await supabase
        .from('creditos')
        .select('id, codigo_credito, monto_prestado')
        .eq('estado_detallado', 'aprobado')
        .limit(10)

    if (creditosPendientes && creditosPendientes.length > 0 && !forzarCierreConPendientes) {
        const montoTotal = creditosPendientes.reduce((sum, c) => sum + c.monto_prestado, 0)
        return {
            error: `Hay ${creditosPendientes.length} crédito(s) pendientes de desembolso por S/${montoTotal.toFixed(2)}. Desembolsa o cancela antes de cerrar.`,
            creditosPendientes: creditosPendientes.map(c => ({
                codigo: c.codigo_credito,
                monto: c.monto_prestado
            })),
            requiereForzar: true
        }
    }

    // 3. VALIDACIÓN: Verificar discrepancia significativa (>5%)
    const discrepancia = Math.abs(montoFisico - caja.saldo_actual)
    const porcentajeDiscrepancia = (discrepancia / caja.saldo_actual) * 100

    if (porcentajeDiscrepancia > 5 && !forzarCierreConPendientes) {
        return {
            error: `Discrepancia significativa: ${porcentajeDiscrepancia.toFixed(1)}% (S/${discrepancia.toFixed(2)}). Verifica el conteo.`,
            advertencia: true,
            saldoSistema: caja.saldo_actual,
            saldoFisico: montoFisico
        }
    }

    // 4. Ejecutar RPC de Cierre
    const observacionesFinales = creditosPendientes?.length
        ? `${observaciones || ''} [CIERRE FORZADO: ${creditosPendientes.length} créditos pendientes]`.trim()
        : observaciones

    const { data, error } = await supabase.rpc('cerrar_caja_oficial', {
        p_caja_id: caja.id,
        p_monto_fisico: montoFisico,
        p_observaciones: observacionesFinales || null
    })

    if (error) {
        console.error('Error cerrando caja:', error)
        return { error: error.message }
    }

    // 5. Registrar en auditoría si hubo anomalías
    if (porcentajeDiscrepancia > 2 || (creditosPendientes && creditosPendientes.length > 0)) {
        try {
            await supabase.from('audit_log').insert({
                tabla: 'cajas_operativas',
                registro_id: caja.id,
                accion: 'CIERRE_CAJA',
                usuario_id: user.id,
                datos_anteriores: { saldo_sistema: caja.saldo_actual },
                datos_nuevos: { saldo_fisico: montoFisico },
                metadata: {
                    discrepancia,
                    porcentaje_discrepancia: porcentajeDiscrepancia,
                    creditos_pendientes: creditosPendientes?.length || 0,
                    forzado: forzarCierreConPendientes || false
                }
            })
        } catch (err) {
            console.error('Error en audit_log:', err)
        }
    }

    // 6. Revalidar para actualizar UI
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/caja')

    return {
        success: true,
        data,
        advertencias: {
            discrepancia: porcentajeDiscrepancia > 2 ? `${porcentajeDiscrepancia.toFixed(1)}%` : null,
            creditosPendientes: creditosPendientes?.length || 0
        }
    }
}


