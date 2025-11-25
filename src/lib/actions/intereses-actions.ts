'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Interfaz para información de intereses
 */
export interface InteresInfo {
    dias_transcurridos: number
    interes_devengado_actual: number
    interes_total_vencimiento: number
    porcentaje_devengado: number
}

/**
 * Interfaz para proyección de intereses
 */
export interface ProyeccionInteres {
    dias_totales: number
    interes_proyectado: number
    total_a_pagar: number
}

/**
 * Calcula el interés actual devengado de un crédito
 */
export async function calcularInteresActual(
    creditoId: string,
    fechaCalculo?: string
): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('calcular_interes_actual', {
            p_credito_id: creditoId,
            p_fecha_calculo: fechaCalculo || new Date().toISOString().split('T')[0]
        })

    if (error) {
        console.error('Error calculando interés:', error)
        throw new Error('Error al calcular interés')
    }

    return data as number
}

/**
 * Proyecta el interés futuro agregando días adicionales
 */
export async function proyectarInteres(
    creditoId: string,
    diasAdicionales: number
): Promise<ProyeccionInteres> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('proyectar_interes', {
            p_credito_id: creditoId,
            p_dias_adicionales: diasAdicionales
        })

    if (error) {
        console.error('Error proyectando interés:', error)
        throw new Error('Error al proyectar interés')
    }

    return data[0] as ProyeccionInteres
}

/**
 * Obtiene información completa de intereses de un crédito
 */
export async function obtenerInfoIntereses(creditoId: string): Promise<InteresInfo | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vista_creditos_intereses')
        .select('dias_transcurridos, interes_devengado_actual, interes_total_vencimiento, porcentaje_devengado')
        .eq('id', creditoId)
        .single()

    if (error) {
        console.error('Error obteniendo info de intereses:', error)
        return null
    }

    return data as InteresInfo
}

/**
 * Obtiene todos los créditos con información de intereses
 */
export async function obtenerCreditosConIntereses(limite: number = 50) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vista_creditos_intereses')
        .select('*')
        .order('id', { ascending: false })
        .limit(limite)

    if (error) {
        console.error('Error obteniendo créditos con intereses:', error)
        throw new Error('Error al obtener créditos')
    }

    return data
}

/**
 * Refresca (actualiza) los valores de interés de un crédito
 * Esto fuerza la ejecución del trigger
 */
export async function refrescarIntereses(creditoId: string): Promise<boolean> {
    const supabase = await createClient()

    // Obtener el crédito actual
    const { data: credito, error: errorGet } = await supabase
        .from('creditos')
        .select('monto_prestado')
        .eq('id', creditoId)
        .single()

    if (errorGet || !credito) {
        console.error('Error obteniendo crédito:', errorGet)
        return false
    }

    // Actualizar con el mismo valor para activar el trigger
    const { error: errorUpdate } = await supabase
        .from('creditos')
        .update({ monto_prestado: credito.monto_prestado })
        .eq('id', creditoId)

    if (errorUpdate) {
        console.error('Error refrescando intereses:', errorUpdate)
        return false
    }

    return true
}
