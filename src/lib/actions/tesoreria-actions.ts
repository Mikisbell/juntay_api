'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Service client para testing sin auth
const getServiceClient = () => {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function obtenerEstadoBoveda() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('boveda_central')
        .select('*')
        .single()

    if (error) {
        console.error('Error obteniendo bóveda:', error)
        return null
    }

    return {
        id: data.id,
        saldoTotal: data.saldo_total,
        saldoDisponible: data.saldo_disponible,
        saldoAsignado: data.saldo_asignado
    }
}

export async function inyectarCapitalAction(monto: number, origen: string, referencia: string, metadata?: Record<string, unknown>) {
    // TEMPORAL: Auth deshabilitado para testing
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return { error: 'No autenticado' }

    const supabase = getServiceClient()

    // En producción, validar rol de administrador aquí
    // const { data: userData } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
    // if (userData?.rol !== 'admin') return { error: 'No autorizado. Solo administradores.' }

    const { data, error } = await supabase.rpc('admin_inyectar_capital', {
        p_monto: monto,
        p_origen: origen,
        p_referencia: referencia,
        p_metadata: metadata || {}
    })

    if (error) {
        console.error('Error inyectando capital:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/admin/tesoreria')
    return { success: true, movimientoId: data }
}

export async function asignarCajaAction(cajeroId: string, monto: number, observacion: string) {
    // TEMPORAL: Auth deshabilitado para testing
    const supabase = getServiceClient()

    const { data, error } = await supabase.rpc('admin_asignar_caja', {
        p_usuario_cajero_id: cajeroId,
        p_monto: monto,
        p_observacion: observacion
    })

    if (error) {
        console.error('Error asignando caja:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/admin/tesoreria')
    revalidatePath('/dashboard/caja')
    return { success: true, cajaId: data }
}

export async function obtenerCajeros() {
    const supabase = await createClient()

    // Obtener usuarios que son cajeros (todos por ahora, en prod filtrar por rol)
    const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombres, apellido_paterno, apellido_materno, email')
        .limit(10)

    if (error) {
        console.error('Error obteniendo cajeros:', error)
        return []
    }

    return data || []
}

// Obtener movimientos recientes de bóveda para auditoría
export async function obtenerMovimientosBoveda(limite: number = 15) {
    const supabase = getServiceClient()

    const { data, error } = await supabase
        .from('movimientos_boveda_auditoria')
        .select(`
            id,
            tipo,
            monto,
            saldo_anterior,
            saldo_nuevo,
            referencia,
            metadata,
            fecha,
            usuario_responsable_id
        `)
        .order('fecha', { ascending: false })
        .limit(limite)

    if (error) {
        console.error('Error obteniendo movimientos:', error)
        return []
    }

    return data || []
}
