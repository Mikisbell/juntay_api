'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EstadoCaja = {
    id: string
    estado: 'abierta' | 'cerrada'
    saldoActual: number
    fechaApertura: string
    numeroCaja: number
} | null

export async function obtenerEstadoCaja(): Promise<EstadoCaja> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Buscar caja abierta del usuario actual
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single()

    if (!caja) return null

    return {
        id: caja.id,
        estado: caja.estado,
        saldoActual: caja.saldo_actual,
        fechaApertura: caja.fecha_apertura,
        numeroCaja: caja.numero_caja
    }
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

    // Crear nueva sesión de caja
    const { data: nuevaCaja, error } = await supabase
        .from('cajas_operativas')
        .insert({
            usuario_id: user.id,
            numero_caja: 1, // TODO: Asignar dinámicamente
            estado: 'abierta',
            saldo_inicial: montoInicial,
            saldo_actual: montoInicial,
            fecha_apertura: new Date().toISOString()
        })
        .select()
        .single()

    if (error) return { error: error.message }

    // Registrar movimiento inicial si hay monto > 0
    if (montoInicial > 0) {
        await supabase.from('movimientos_caja_operativa').insert({
            caja_operativa_id: nuevaCaja.id,
            tipo: 'INGRESO',
            motivo: 'APERTURA',
            monto: montoInicial,
            saldo_anterior: 0,
            saldo_nuevo: montoInicial,
            descripcion: 'Saldo inicial de apertura',
            usuario_id: user.id
        })
    }

    revalidatePath('/dashboard')
    return { success: true, cajaId: nuevaCaja.id }
}

export async function cerrarCajaAction(montoFisico: number, observaciones?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Usuario no autenticado" }

    // 1. Obtener caja abierta del usuario
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single()

    if (!caja) return { error: "No tienes ninguna caja abierta para cerrar." }

    // 2. Ejecutar RPC de Cierre Ciego
    const { data, error } = await supabase.rpc('cerrar_caja_oficial', {
        p_caja_id: caja.id,
        p_monto_fisico: montoFisico,
        p_observaciones: observaciones || null
    })

    if (error) {
        console.error('Error cerrando caja:', error)
        return { error: error.message }
    }

    // 3. Revalidar para actualizar UI
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/caja')

    return { success: true, data }
}

