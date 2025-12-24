'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireEmpresaActual } from '@/lib/auth/empresa-context'

// Alias for compatibility
export async function obtenerEstadoCaja() {
    return verificarEstadoCaja()
}

export async function verificarEstadoCaja() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { isOpen: false, caja: null }

    const empresa = await requireEmpresaActual()

    const { data: caja } = await supabase
        .from('cajas')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('empresa_id', empresa.empresaId)
        .is('fecha_cierre', null)
        .single()

    return {
        isOpen: !!caja,
        caja
    }
}

export async function abrirCajaAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const empresa = await requireEmpresaActual()
    const montoInicial = parseFloat(formData.get('monto') as string || '0')
    const sucursalId = formData.get('sucursalId') as string

    // Verificar si ya tiene caja abierta
    const estado = await verificarEstadoCaja()
    if (estado.isOpen) return { error: "Ya tienes una caja abierta" }

    const { data, error } = await supabase
        .from('cajas')
        .insert({
            usuario_id: user.id,
            monto_apertura: montoInicial,
            fecha_apertura: new Date().toISOString(),
            sucursal_id: sucursalId, // Should validate sucursal belongs to empresa
            empresa_id: empresa.empresaId,
            estado: 'ABIERTA'
        })
        .select()
        .single()

    if (error) {
        console.error("Error al abrir caja:", error)
        return { error: error.message }
    }

    // Registrar movimiento inicial si > 0
    if (montoInicial > 0) {
        await supabase.from('movimientos_caja').insert({
            caja_id: data.id,
            tipo: 'INGRESO',
            monto: montoInicial,
            concepto: 'APERTURA DE CAJA',
            usuario_id: user.id,
            empresa_id: empresa.empresaId, // Add tenant id
            fecha_movimiento: new Date().toISOString()
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
    const cajaId = formData.get('cajaId') as string
    const montoFinal = parseFloat(formData.get('montoFinal') as string || '0')
    const observaciones = formData.get('observaciones') as string

    // Validar propiedad de la caja
    const { data: caja } = await supabase
        .from('cajas')
        .select('*')
        .eq('id', cajaId)
        .eq('usuario_id', user.id)
        .single()

    if (!caja) return { error: "Caja no encontrada o no te pertenece" }

    // Calcular diferencias (Sistema vs Real)
    // TODO: Obtener saldo del sistema sumando movimientos
    // Por ahora, confiamos en el input del usuario o el sistema calcula en la UI
    // Idealmente el backend recalcula:
    const { data: movimientos } = await supabase
        .from('movimientos_caja')
        .select('monto, tipo')
        .eq('caja_id', cajaId)

    let saldoSistema = caja.monto_apertura
    movimientos?.forEach(m => {
        if (m.tipo === 'INGRESO') saldoSistema += m.monto
        if (m.tipo === 'EGRESO') saldoSistema -= m.monto
    })

    const diferencia = montoFinal - saldoSistema

    const { error } = await supabase
        .from('cajas')
        .update({
            fecha_cierre: new Date().toISOString(),
            monto_cierre: montoFinal,
            diferencia: diferencia, // Guardar cuadre
            observaciones,
            estado: 'CERRADA'
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
        .from('cajas')
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
        .from('cajas')
        .select(`
            *,
            movimientos_caja (*)
        `)
        .eq('usuario_id', user.id)
        .eq('empresa_id', empresa.empresaId)
        .is('fecha_cierre', null)
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
