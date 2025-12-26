'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Plan de suscripción
 */
export interface Plan {
    id: string
    nombre: string
    nombre_display: string
    descripcion: string | null
    precio_mensual: number
    precio_anual: number | null
    moneda: string
    max_usuarios: number
    max_sucursales: number
    max_creditos_mes: number
    max_creditos_activos: number
    features: string[]
    orden: number
    activo: boolean
    destacado: boolean
}

/**
 * Obtener todos los planes activos
 */
export async function obtenerPlanes(): Promise<Plan[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('planes_suscripcion')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })

    if (error) {
        console.error('Error obteniendo planes:', error)
        return []
    }

    return data.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : []
    }))
}

/**
 * Obtener un plan por ID
 */
export async function obtenerPlanPorId(planId: string): Promise<Plan | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('planes_suscripcion')
        .select('*')
        .eq('id', planId)
        .single()

    if (error) {
        console.error('Error obteniendo plan:', error)
        return null
    }

    return {
        ...data,
        features: Array.isArray(data.features) ? data.features : []
    }
}

/**
 * Obtener plan actual de la empresa del usuario
 */
export async function obtenerPlanActual(): Promise<{
    plan: Plan | null
    suscripcion: {
        estado: string
        fecha_inicio: string
        fecha_fin: string | null
        dias_restantes_trial: number
    } | null
}> {
    const supabase = await createClient()

    // Obtener empresa_id del usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { plan: null, suscripcion: null }
    }

    const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!usuario?.empresa_id) {
        return { plan: null, suscripcion: null }
    }

    // Obtener suscripción con plan
    const { data: suscripcion } = await supabase
        .from('suscripciones')
        .select(`
            *,
            plan:planes_suscripcion(*)
        `)
        .eq('empresa_id', usuario.empresa_id)
        .single()

    if (!suscripcion) {
        // Si no hay suscripción, buscar plan en empresa directamente
        const { data: empresa } = await supabase
            .from('empresas')
            .select(`
                plan:planes_suscripcion(*)
            `)
            .eq('id', usuario.empresa_id)
            .single()

        if (empresa?.plan) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const planData = empresa.plan as any
            return {
                plan: {
                    ...planData,
                    features: Array.isArray(planData.features) ? planData.features : []
                },
                suscripcion: null
            }
        }

        return { plan: null, suscripcion: null }
    }

    // Calcular días restantes de trial
    let diasRestantesTrial = 0
    if (suscripcion.estado === 'trial' && suscripcion.fecha_inicio) {
        const inicio = new Date(suscripcion.fecha_inicio)
        const ahora = new Date()
        const diasTranscurridos = Math.floor((ahora.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
        diasRestantesTrial = Math.max(0, (suscripcion.dias_trial || 14) - diasTranscurridos)
    }

    return {
        plan: suscripcion.plan ? {
            ...suscripcion.plan,
            features: Array.isArray(suscripcion.plan.features) ? suscripcion.plan.features : []
        } : null,
        suscripcion: {
            estado: suscripcion.estado,
            fecha_inicio: suscripcion.fecha_inicio,
            fecha_fin: suscripcion.fecha_fin,
            dias_restantes_trial: diasRestantesTrial
        }
    }
}

/**
 * Comparar características de planes
 */
export async function obtenerComparativaPlanes(): Promise<{
    planes: Plan[]
    caracteristicas: {
        nombre: string
        basico: string | boolean
        pro: string | boolean
        enterprise: string | boolean
    }[]
}> {
    const planes = await obtenerPlanes()

    const caracteristicas = [
        { nombre: 'Usuarios', basico: '3', pro: '10', enterprise: 'Ilimitados' },
        { nombre: 'Sucursales', basico: '1', pro: '3', enterprise: 'Ilimitadas' },
        { nombre: 'Créditos/mes', basico: '100', pro: '500', enterprise: 'Ilimitados' },
        { nombre: 'Dashboard', basico: 'Básico', pro: 'Premium + KPIs', enterprise: 'Completo' },
        { nombre: 'WhatsApp', basico: 'Manual', pro: 'Automático', enterprise: 'Automático' },
        { nombre: 'Reportes PDF', basico: true, pro: true, enterprise: true },
        { nombre: 'Integración bancaria', basico: false, pro: true, enterprise: true },
        { nombre: 'API acceso', basico: false, pro: false, enterprise: true },
        { nombre: 'White-label', basico: false, pro: false, enterprise: true },
        { nombre: 'Soporte', basico: 'Email', pro: 'Prioritario', enterprise: 'Dedicado 24/7' },
    ]

    return { planes, caracteristicas }
}
