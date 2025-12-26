'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Uso actual de la empresa
 */
export interface UsageActual {
    usuarios: { actual: number; maximo: number; porcentaje: number }
    sucursales: { actual: number; maximo: number; porcentaje: number }
    creditosMes: { actual: number; maximo: number; porcentaje: number }
    creditosActivos: { actual: number; maximo: number; porcentaje: number }
}

/**
 * Obtener uso actual vs límites del plan
 */
export async function obtenerUsageActual(): Promise<UsageActual | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!usuario?.empresa_id) return null

    const empresaId = usuario.empresa_id

    // Obtener límites del plan
    const { data: suscripcion } = await supabase
        .from('suscripciones')
        .select(`
            plan:planes_suscripcion(
                max_usuarios,
                max_sucursales,
                max_creditos_mes,
                max_creditos_activos
            )
        `)
        .eq('empresa_id', empresaId)
        .single()

    const plan = suscripcion?.plan || {
        max_usuarios: 3,
        max_sucursales: 1,
        max_creditos_mes: 100,
        max_creditos_activos: 50
    }

    // Contar usuarios activos
    const { count: usuariosCount } = await supabase
        .from('empleados')
        .select('*, sucursales!inner(empresa_id)', { count: 'exact', head: true })
        .eq('sucursales.empresa_id', empresaId)
        .eq('estado', 'ACTIVO')

    // Contar sucursales
    const { count: sucursalesCount } = await supabase
        .from('sucursales')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)

    // Contar créditos del mes actual
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const { count: creditosMesCount } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .gte('created_at', inicioMes.toISOString())

    // Contar créditos activos (vigente, vencido)
    const { count: creditosActivosCount } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .in('estado', ['vigente', 'vencido'])

    // Calcular porcentajes (-1 = ilimitado)
    const calcPorcentaje = (actual: number, max: number) =>
        max === -1 ? 0 : Math.round((actual / max) * 100)

    return {
        usuarios: {
            actual: usuariosCount || 0,
            maximo: plan.max_usuarios,
            porcentaje: calcPorcentaje(usuariosCount || 0, plan.max_usuarios)
        },
        sucursales: {
            actual: sucursalesCount || 0,
            maximo: plan.max_sucursales,
            porcentaje: calcPorcentaje(sucursalesCount || 0, plan.max_sucursales)
        },
        creditosMes: {
            actual: creditosMesCount || 0,
            maximo: plan.max_creditos_mes,
            porcentaje: calcPorcentaje(creditosMesCount || 0, plan.max_creditos_mes)
        },
        creditosActivos: {
            actual: creditosActivosCount || 0,
            maximo: plan.max_creditos_activos,
            porcentaje: calcPorcentaje(creditosActivosCount || 0, plan.max_creditos_activos)
        }
    }
}

/**
 * Verificar si se puede crear un nuevo usuario
 */
export async function verificarLimiteUsuarios(): Promise<{
    permitido: boolean
    mensaje?: string
    actual: number
    maximo: number
}> {
    const usage = await obtenerUsageActual()

    if (!usage) {
        return { permitido: false, mensaje: 'Error obteniendo uso', actual: 0, maximo: 0 }
    }

    // -1 = ilimitado
    if (usage.usuarios.maximo === -1) {
        return { permitido: true, actual: usage.usuarios.actual, maximo: -1 }
    }

    if (usage.usuarios.actual >= usage.usuarios.maximo) {
        return {
            permitido: false,
            mensaje: `Has alcanzado el límite de ${usage.usuarios.maximo} usuarios. Actualiza tu plan para agregar más.`,
            actual: usage.usuarios.actual,
            maximo: usage.usuarios.maximo
        }
    }

    return { permitido: true, actual: usage.usuarios.actual, maximo: usage.usuarios.maximo }
}

/**
 * Verificar si se puede crear una nueva sucursal
 */
export async function verificarLimiteSucursales(): Promise<{
    permitido: boolean
    mensaje?: string
    actual: number
    maximo: number
}> {
    const usage = await obtenerUsageActual()

    if (!usage) {
        return { permitido: false, mensaje: 'Error obteniendo uso', actual: 0, maximo: 0 }
    }

    if (usage.sucursales.maximo === -1) {
        return { permitido: true, actual: usage.sucursales.actual, maximo: -1 }
    }

    if (usage.sucursales.actual >= usage.sucursales.maximo) {
        return {
            permitido: false,
            mensaje: `Has alcanzado el límite de ${usage.sucursales.maximo} sucursales. Actualiza tu plan para agregar más.`,
            actual: usage.sucursales.actual,
            maximo: usage.sucursales.maximo
        }
    }

    return { permitido: true, actual: usage.sucursales.actual, maximo: usage.sucursales.maximo }
}

/**
 * Verificar si se puede crear un nuevo crédito
 */
export async function verificarLimiteCreditos(): Promise<{
    permitido: boolean
    mensaje?: string
    creditosMes: { actual: number; maximo: number }
    creditosActivos: { actual: number; maximo: number }
}> {
    const usage = await obtenerUsageActual()

    if (!usage) {
        return {
            permitido: false,
            mensaje: 'Error obteniendo uso',
            creditosMes: { actual: 0, maximo: 0 },
            creditosActivos: { actual: 0, maximo: 0 }
        }
    }

    // Verificar límite mensual
    if (usage.creditosMes.maximo !== -1 && usage.creditosMes.actual >= usage.creditosMes.maximo) {
        return {
            permitido: false,
            mensaje: `Has alcanzado el límite de ${usage.creditosMes.maximo} créditos este mes. Actualiza tu plan.`,
            creditosMes: usage.creditosMes,
            creditosActivos: usage.creditosActivos
        }
    }

    // Verificar límite de activos
    if (usage.creditosActivos.maximo !== -1 && usage.creditosActivos.actual >= usage.creditosActivos.maximo) {
        return {
            permitido: false,
            mensaje: `Has alcanzado el límite de ${usage.creditosActivos.maximo} créditos activos. Actualiza tu plan.`,
            creditosMes: usage.creditosMes,
            creditosActivos: usage.creditosActivos
        }
    }

    return {
        permitido: true,
        creditosMes: usage.creditosMes,
        creditosActivos: usage.creditosActivos
    }
}

/**
 * Obtener alertas de límites cercanos
 */
export async function obtenerAlertasLimites(): Promise<{
    tipo: 'warning' | 'error'
    recurso: string
    mensaje: string
}[]> {
    const usage = await obtenerUsageActual()
    if (!usage) return []

    const alertas: { tipo: 'warning' | 'error'; recurso: string; mensaje: string }[] = []

    const checkLimit = (
        nombre: string,
        actual: number,
        max: number
    ) => {
        if (max === -1) return

        const porcentaje = (actual / max) * 100

        if (porcentaje >= 100) {
            alertas.push({
                tipo: 'error',
                recurso: nombre,
                mensaje: `Has alcanzado el límite de ${nombre.toLowerCase()}`
            })
        } else if (porcentaje >= 80) {
            alertas.push({
                tipo: 'warning',
                recurso: nombre,
                mensaje: `Estás cerca del límite de ${nombre.toLowerCase()} (${actual}/${max})`
            })
        }
    }

    checkLimit('Usuarios', usage.usuarios.actual, usage.usuarios.maximo)
    checkLimit('Sucursales', usage.sucursales.actual, usage.sucursales.maximo)
    checkLimit('Créditos del mes', usage.creditosMes.actual, usage.creditosMes.maximo)
    checkLimit('Créditos activos', usage.creditosActivos.actual, usage.creditosActivos.maximo)

    return alertas
}
