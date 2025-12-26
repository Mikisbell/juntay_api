'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Suscripción de empresa
 */
export interface Suscripcion {
    id: string
    empresa_id: string
    plan_id: string
    estado: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
    fecha_inicio: string
    fecha_fin: string | null
    fecha_proximo_cobro: string | null
    dias_trial: number
    created_at: string
}

/**
 * Obtener suscripción actual de la empresa
 */
export async function obtenerSuscripcion(): Promise<Suscripcion | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!usuario?.empresa_id) return null

    const { data, error } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('empresa_id', usuario.empresa_id)
        .single()

    if (error) {
        console.error('Error obteniendo suscripción:', error)
        return null
    }

    return data
}

/**
 * Crear suscripción inicial (trial)
 */
export async function crearSuscripcionTrial(empresaId: string, planId?: string): Promise<{
    success: boolean
    error?: string
    suscripcion?: Suscripcion
}> {
    const supabase = await createClient()

    // Si no se especifica plan, usar el básico
    if (!planId) {
        const { data: planBasico } = await supabase
            .from('planes_suscripcion')
            .select('id')
            .eq('nombre', 'basico')
            .single()

        planId = planBasico?.id
    }

    if (!planId) {
        return { success: false, error: 'No se encontró un plan válido' }
    }

    const { data, error } = await supabase
        .from('suscripciones')
        .insert({
            empresa_id: empresaId,
            plan_id: planId,
            estado: 'trial',
            fecha_inicio: new Date().toISOString().split('T')[0],
            dias_trial: 14
        })
        .select()
        .single()

    if (error) {
        console.error('Error creando suscripción:', error)
        return { success: false, error: error.message }
    }

    // También actualizar plan_id en empresa
    await supabase
        .from('empresas')
        .update({ plan_id: planId })
        .eq('id', empresaId)

    return { success: true, suscripcion: data }
}

/**
 * Cambiar plan de suscripción
 */
export async function cambiarPlan(nuevoPlanId: string): Promise<{
    success: boolean
    error?: string
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'No autenticado' }
    }

    const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id, rol')
        .eq('id', user.id)
        .single()

    if (!usuario?.empresa_id) {
        return { success: false, error: 'Usuario sin empresa' }
    }

    // Solo admins pueden cambiar plan
    if (!['ADMIN', 'SUPER_ADMIN'].includes(usuario.rol)) {
        return { success: false, error: 'Sin permisos para cambiar plan' }
    }

    // Verificar que el plan existe
    const { data: plan } = await supabase
        .from('planes_suscripcion')
        .select('id, nombre')
        .eq('id', nuevoPlanId)
        .eq('activo', true)
        .single()

    if (!plan) {
        return { success: false, error: 'Plan no encontrado' }
    }

    // Actualizar suscripción
    const { error: errorSuscripcion } = await supabase
        .from('suscripciones')
        .update({
            plan_id: nuevoPlanId,
            estado: 'active',  // Cambio de plan activa la suscripción
            updated_at: new Date().toISOString()
        })
        .eq('empresa_id', usuario.empresa_id)

    if (errorSuscripcion) {
        // Si no existe suscripción, crearla
        const resultado = await crearSuscripcionTrial(usuario.empresa_id, nuevoPlanId)
        if (!resultado.success) {
            return { success: false, error: resultado.error }
        }
    }

    // Actualizar plan_id en empresa
    await supabase
        .from('empresas')
        .update({ plan_id: nuevoPlanId })
        .eq('id', usuario.empresa_id)

    revalidatePath('/dashboard/admin/suscripcion')

    return { success: true }
}

/**
 * Cancelar suscripción
 */
export async function cancelarSuscripcion(): Promise<{
    success: boolean
    error?: string
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'No autenticado' }
    }

    const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id, rol')
        .eq('id', user.id)
        .single()

    if (!usuario?.empresa_id) {
        return { success: false, error: 'Usuario sin empresa' }
    }

    if (usuario.rol !== 'ADMIN' && usuario.rol !== 'SUPER_ADMIN') {
        return { success: false, error: 'Sin permisos' }
    }

    const { error } = await supabase
        .from('suscripciones')
        .update({
            estado: 'cancelled',
            fecha_fin: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
        })
        .eq('empresa_id', usuario.empresa_id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/suscripcion')

    return { success: true }
}

/**
 * Activar suscripción (después de pago)
 */
export async function activarSuscripcion(empresaId: string): Promise<{
    success: boolean
    error?: string
}> {
    const supabase = await createClient()

    const proximoCobro = new Date()
    proximoCobro.setMonth(proximoCobro.getMonth() + 1)

    const { error } = await supabase
        .from('suscripciones')
        .update({
            estado: 'active',
            fecha_proximo_cobro: proximoCobro.toISOString().split('T')[0],
            updated_at: new Date().toISOString()
        })
        .eq('empresa_id', empresaId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}
