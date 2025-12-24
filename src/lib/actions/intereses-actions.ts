'use server'

import { createClient } from '@/lib/supabase/server'
import {
    ConfiguracionInteres,
    EstadoMora,
    calcularInteresCompleto,
    calcularDiasTranscurridos,
    calcularDiasPostVencimiento,
    getConfiguracionDefault
} from '@/lib/utils/interes-flexible'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Información básica de intereses (compatible con v1)
 */
export interface InteresInfo {
    dias_transcurridos: number
    interes_devengado_actual: number
    interes_total_vencimiento: number
    porcentaje_devengado: number
}

/**
 * Información completa de intereses con mora
 */
export interface InteresInfoCompleto {
    // Base
    credito_id: string
    monto_base: number
    tasa_interes: number

    // Días desglosados
    dias_transcurridos: number
    dias_regulares: number
    dias_en_gracia: number
    dias_en_mora: number

    // Intereses desglosados
    interes_regular: number
    interes_mora: number
    interes_total: number

    // Estado
    estado_mora: EstadoMora

    // Totales
    total_a_pagar: number

    // Config
    config_aplicada: ConfiguracionInteres
}

/**
 * Proyección de intereses
 */
export interface ProyeccionInteres {
    dias_totales: number
    interes_proyectado: number
    total_a_pagar: number
}

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Obtiene información completa de intereses con mora usando el nuevo sistema
 */
export async function obtenerInteresCompletoCredito(
    creditoId: string
): Promise<InteresInfoCompleto | null> {
    const supabase = await createClient()

    // Obtener crédito con datos necesarios
    const { data: credito, error } = await supabase
        .from('creditos')
        .select(`
            id,
            monto_prestado,
            tasa_interes,
            fecha_desembolso,
            fecha_vencimiento,
            saldo_pendiente,
            interes_capitalizado,
            empresa_id
        `)
        .eq('id', creditoId)
        .single()

    if (error || !credito) {
        console.error('Error obteniendo crédito:', error)
        return null
    }

    // Obtener configuración de la empresa
    const { data: empresa } = await supabase
        .from('empresas')
        .select('config_intereses')
        .eq('id', credito.empresa_id)
        .single()

    const configEmpresa = empresa?.config_intereses as Partial<ConfiguracionInteres> | undefined
    const config = { ...getConfiguracionDefault(), ...configEmpresa }

    // Calcular días
    const diasTranscurridos = calcularDiasTranscurridos(credito.fecha_desembolso)
    const diasPostVencimiento = calcularDiasPostVencimiento(credito.fecha_vencimiento)

    // Calcular intereses con el nuevo sistema
    const resultado = calcularInteresCompleto({
        montoPrestado: Number(credito.monto_prestado),
        tasaMensual: Number(credito.tasa_interes),
        diasTranscurridos,
        diasPostVencimiento,
        interesCapitalizado: Number(credito.interes_capitalizado || 0),
        config
    })

    return {
        credito_id: creditoId,
        monto_base: resultado.montoBase,
        tasa_interes: resultado.tasaAplicada,
        dias_transcurridos: resultado.diasTotales,
        dias_regulares: resultado.diasRegulares,
        dias_en_gracia: resultado.diasEnGracia,
        dias_en_mora: resultado.diasEnMora,
        interes_regular: resultado.interesRegular,
        interes_mora: resultado.interesMora,
        interes_total: resultado.interesTotal,
        estado_mora: resultado.estadoMora,
        total_a_pagar: Number(credito.saldo_pendiente) + resultado.interesTotal,
        config_aplicada: resultado.configAplicada
    }
}

/**
 * Calcula el interés usando la función RPC de la base de datos
 * Esto asegura consistencia con los triggers
 */
export async function calcularInteresConMoraDB(
    creditoId: string,
    fechaCalculo?: string
): Promise<InteresInfoCompleto | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('calcular_interes_completo', {
            p_credito_id: creditoId,
            p_fecha_calculo: fechaCalculo || new Date().toISOString().split('T')[0]
        })

    if (error) {
        console.error('Error calculando interés con mora:', error)
        return null
    }

    if (!data || data.length === 0) {
        return null
    }

    const row = data[0]
    return {
        credito_id: creditoId,
        monto_base: Number(row.monto_base),
        tasa_interes: Number(row.tasa_interes),
        dias_transcurridos: row.dias_desde_desembolso,
        dias_regulares: row.dias_regulares,
        dias_en_gracia: row.dias_en_gracia,
        dias_en_mora: row.dias_en_mora,
        interes_regular: Number(row.interes_regular),
        interes_mora: Number(row.interes_mora),
        interes_total: Number(row.interes_total),
        estado_mora: row.estado_mora as EstadoMora,
        total_a_pagar: Number(row.monto_base) + Number(row.interes_total),
        config_aplicada: row.config_aplicada as ConfiguracionInteres
    }
}

/**
 * Obtiene créditos con información completa de intereses (vista mejorada)
 */
export async function obtenerCreditosConInteresesV2(limite: number = 50) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vista_creditos_intereses_v2')
        .select('*')
        .order('_modified', { ascending: false })
        .limit(limite)

    if (error) {
        // Fallback a la vista antigua si la nueva no existe
        console.warn('Vista v2 no disponible, usando vista v1:', error.message)
        return obtenerCreditosConIntereses(limite)
    }

    return data
}

/**
 * Obtiene créditos en mora (para alertas y gestión)
 */
export async function obtenerCreditosEnMora() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vista_creditos_intereses_v2')
        .select('*')
        .in('estado_mora', ['MORA_LEVE', 'MORA_GRAVE'])
        .order('dias_en_mora', { ascending: false })

    if (error) {
        console.error('Error obteniendo créditos en mora:', error)
        return []
    }

    return data || []
}

/**
 * Obtiene créditos próximos a vencer (para alertas preventivas)
 */
export async function obtenerCreditosPorVencer(diasAnticipacion: number = 5) {
    const supabase = await createClient()

    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion)

    const { data, error } = await supabase
        .from('creditos')
        .select(`
            id,
            codigo_credito,
            monto_prestado,
            saldo_pendiente,
            tasa_interes,
            fecha_vencimiento,
            cliente:clientes(nombres, numero_documento)
        `)
        .eq('estado', 'vigente')
        .lte('fecha_vencimiento', fechaLimite.toISOString().split('T')[0])
        .gte('fecha_vencimiento', new Date().toISOString().split('T')[0])
        .order('fecha_vencimiento', { ascending: true })

    if (error) {
        console.error('Error obteniendo créditos por vencer:', error)
        return []
    }

    return data || []
}

/**
 * Ejecuta el recálculo diario de todos los intereses (para cron job)
 */
export async function ejecutarRecalculoDiario(): Promise<{
    creditos_actualizados: number
    errores: number
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('recalcular_intereses_diarios')

    if (error) {
        console.error('Error en recálculo diario:', error)
        return { creditos_actualizados: 0, errores: 1 }
    }

    return data?.[0] || { creditos_actualizados: 0, errores: 0 }
}

/**
 * Obtiene configuración de intereses de la empresa actual
 */
export async function obtenerConfiguracionIntereses(
    empresaId: string
): Promise<ConfiguracionInteres> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('empresas')
        .select('config_intereses')
        .eq('id', empresaId)
        .single()

    if (error || !data?.config_intereses) {
        return getConfiguracionDefault()
    }

    return { ...getConfiguracionDefault(), ...data.config_intereses }
}

/**
 * Actualiza configuración de intereses de la empresa
 */
export async function actualizarConfiguracionIntereses(
    empresaId: string,
    config: Partial<ConfiguracionInteres>
): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('empresas')
        .update({
            config_intereses: { ...getConfiguracionDefault(), ...config },
            updated_at: new Date().toISOString()
        })
        .eq('id', empresaId)

    if (error) {
        console.error('Error actualizando configuración:', error)
        return false
    }

    return true
}

// ============================================================================
// FUNCIONES LEGACY (compatibilidad hacia atrás)
// ============================================================================

/**
 * @deprecated Usar obtenerInteresCompletoCredito en su lugar
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
 * @deprecated Usar calcularInteresConMoraDB con proyección en su lugar
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
 * @deprecated Usar obtenerCreditosConInteresesV2 en su lugar
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
 * @deprecated Usar obtenerCreditosConInteresesV2 en su lugar
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

    const { data: credito, error: errorGet } = await supabase
        .from('creditos')
        .select('monto_prestado')
        .eq('id', creditoId)
        .single()

    if (errorGet || !credito) {
        console.error('Error obteniendo crédito:', errorGet)
        return false
    }

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
