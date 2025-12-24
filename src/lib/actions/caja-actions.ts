'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireEmpresaActual } from '@/lib/auth/empresa-context'

// Type for frontend caja state
export interface CajaCompleta {
    id: string
    usuarioId: string
    numeroCaja: string | number
    saldoInicial: number
    fechaApertura: string
    saldoActual: number
    ingresos: number
    egresos: number
    operaciones: number
    estado: string
    usuario: {
        nombres: string
    }
}

// Alias for compatibility
export async function obtenerEstadoCajaV2() {
    return verificarEstadoCaja()
}

// Retorna la caja formateada para el frontend o null
export async function verificarEstadoCaja() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const empresa = await requireEmpresaActual()

    const { data: caja, error } = await supabase
        .from('cajas_operativas')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('empresa_id', empresa.empresaId)
        .eq('estado', 'abierta')
        .single()

    if (error || !caja) return null

    // Get movements for today for stats
    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()

    const { data: movimientos } = await supabase
        .from('movimientos_caja_operativa')
        .select('tipo, monto')
        .eq('caja_operativa_id', caja.id)
        .gte('fecha', inicioHoy)
        .eq('anulado', false)

    const movArray = movimientos || []
    const ingresos = movArray.filter(m => m.tipo === 'INGRESO').reduce((acc, m) => acc + Number(m.monto), 0)
    const egresos = movArray.filter(m => m.tipo === 'EGRESO').reduce((acc, m) => acc + Number(m.monto), 0)

    const resultado = {
        id: caja.id,
        usuarioId: user.id,
        numeroCaja: caja.numero_caja || caja.id.slice(0, 8),
        saldoInicial: Number(caja.saldo_inicial || 0),
        fechaApertura: caja.fecha_apertura,
        saldoActual: Number(caja.saldo_actual || 0),
        ingresos,
        egresos,
        operaciones: movArray.length,
        estado: caja.estado
    }

    console.log('[verificarEstadoCaja] Resultado:', resultado)
    return resultado
}

export async function abrirCajaAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const empresa = await requireEmpresaActual()
    const montoInicial = parseFloat(formData.get('monto') as string || '0')

    // Verificar si ya tiene caja abierta
    const cajaAbierta = await verificarEstadoCaja()
    if (cajaAbierta) return { error: "Ya tienes una caja abierta" }

    // Generate sequential caja number
    const { data: lastCaja } = await supabase
        .from('cajas_operativas')
        .select('numero_caja')
        .eq('empresa_id', empresa.empresaId)
        .order('numero_caja', { ascending: false })
        .limit(1)
        .single()

    const nextNumber = (lastCaja?.numero_caja || 0) + 1

    const { data, error } = await supabase
        .from('cajas_operativas')
        .insert({
            usuario_id: user.id,
            numero_caja: nextNumber,
            saldo_inicial: montoInicial,
            saldo_actual: montoInicial,
            fecha_apertura: new Date().toISOString(),
            empresa_id: empresa.empresaId,
            estado: 'abierta'
        })
        .select()
        .single()

    if (error) {
        console.error("Error al abrir caja:", error)
        return { error: error.message }
    }

    // Registrar movimiento inicial si > 0
    if (montoInicial > 0) {
        await supabase.from('movimientos_caja_operativa').insert({
            caja_operativa_id: data.id,
            tipo: 'INGRESO',
            motivo: 'apertura',
            monto: montoInicial,
            saldo_anterior: 0,
            saldo_nuevo: montoInicial,
            descripcion: 'Apertura de caja',
            usuario_id: user.id,
            fecha: new Date().toISOString()
        })
    }

    revalidatePath('/dashboard')
    return { success: true, caja: data }
}

export async function cerrarCajaAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const empresa = await requireEmpresaActual()
    let cajaId = formData.get('cajaId') as string
    const montoFinal = parseFloat(formData.get('montoFinal') as string || '0')
    const observaciones = formData.get('observaciones') as string

    // If no cajaId provided, find current open caja for user
    if (!cajaId) {
        const { data: cajaAbierta } = await supabase
            .from('cajas_operativas')
            .select('id')
            .eq('usuario_id', user.id)
            .eq('empresa_id', empresa.empresaId)
            .eq('estado', 'abierta')
            .single()

        if (!cajaAbierta) return { error: "No tienes una caja abierta" }
        cajaId = cajaAbierta.id
    }

    // Validate caja ownership
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('*')
        .eq('id', cajaId)
        .eq('usuario_id', user.id)
        .eq('empresa_id', empresa.empresaId)
        .single()

    if (!caja) return { error: "Caja no encontrada o no te pertenece" }

    const saldoSistema = Number(caja.saldo_actual || 0)
    const diferencia = montoFinal - saldoSistema

    const { error } = await supabase
        .from('cajas_operativas')
        .update({
            fecha_cierre: new Date().toISOString(),
            saldo_final_cierre: montoFinal,
            diferencia_cierre: diferencia,
            observaciones_cierre: observaciones,
            estado: 'cerrada'
        })
        .eq('id', cajaId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function obtenerUltimaCaja() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const empresa = await requireEmpresaActual()

    const { data } = await supabase
        .from('cajas_operativas')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('empresa_id', empresa.empresaId)
        .order('fecha_apertura', { ascending: false })
        .limit(1)
        .single()

    return data
}

export async function obtenerCajaCompleta() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const empresa = await requireEmpresaActual()

    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select(`
            *,
            movimientos_caja_operativa (*)
        `)
        .eq('usuario_id', user.id)
        .eq('empresa_id', empresa.empresaId)
        .eq('estado', 'abierta')
        .single()

    return caja
}

export async function obtenerRolUsuario() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

    return data?.rol
}
