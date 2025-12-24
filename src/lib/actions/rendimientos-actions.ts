'use server'

import { createClient } from '@/lib/supabase/server'
import {
    ConfiguracionContrato,
    TipoInteres,
    FrecuenciaCapitalizacion,
    TipoPagoRendimiento,
    ResultadoRendimiento,
    calcularInteresCompuesto,
    calcularRendimientoCompleto,
    calcularPenalidadAtrasoEmpresa,
    CONFIG_CONTRATO_DEFAULT
} from '@/lib/utils/rendimientos-inversionista'

// ============================================================================
// TYPES
// ============================================================================

export interface RendimientoContrato {
    contrato_id: string
    monto_capital: number
    tipo_interes: TipoInteres
    tasa_retorno: number
    dias_transcurridos: number
    interes_simple: number
    interes_compuesto: number
    interes_aplicado: number
    hurdle_acumulado: number
    interes_pagado: number
    interes_pendiente: number
    penalidad_acumulada: number
    tir_estimada: number | null
    proxima_cuota_fecha: string | null
    proxima_cuota_monto: number | null
}

export interface CronogramaCuota {
    id: string
    contrato_id: string
    numero_cuota: number
    tipo_pago: string
    fecha_programada: string
    fecha_pago_real: string | null
    monto_capital: number
    monto_interes: number
    monto_total: number
    estado: string
    dias_atraso: number
    penalidad: number
}

export interface RegistroPago {
    cuota_id: string
    monto_capital: number
    monto_interes: number
    monto_penalidad: number
    medio_pago: string
    referencia?: string
    notas?: string
}

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Obtiene rendimiento completo de un contrato usando la función RPC
 */
export async function obtenerRendimientoContrato(
    contratoId: string
): Promise<RendimientoContrato | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('calcular_rendimiento_profesional', {
            p_contrato_id: contratoId,
            p_fecha_calculo: new Date().toISOString().split('T')[0]
        })

    if (error) {
        console.error('Error calculando rendimiento:', error)

        // Fallback: calcular en cliente
        return await calcularRendimientoLocal(contratoId)
    }

    if (!data || data.length === 0) {
        return null
    }

    return {
        contrato_id: contratoId,
        ...data[0]
    }
}

/**
 * Fallback: calcula rendimiento localmente si la RPC no está disponible
 */
async function calcularRendimientoLocal(
    contratoId: string
): Promise<RendimientoContrato | null> {
    const supabase = await createClient()

    const { data: contrato, error } = await supabase
        .from('contratos_fondeo')
        .select('*')
        .eq('id', contratoId)
        .single()

    if (error || !contrato) return null

    const diasTranscurridos = Math.max(0,
        Math.floor((new Date().getTime() - new Date(contrato.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24))
    )

    const resultado = calcularRendimientoCompleto({
        capital: Number(contrato.monto_pactado),
        tasaAnual: Number(contrato.tasa_retorno),
        diasTranscurridos,
        tipoInteres: (contrato.tipo_interes as TipoInteres) || 'SIMPLE',
        capitalizacion: (contrato.frecuencia_capitalizacion as FrecuenciaCapitalizacion) || 'MENSUAL',
        hurdleRate: Number(contrato.hurdle_rate) || 8,
        interesPagado: Number(contrato.monto_rendimientos_pagados) || 0
    })

    return {
        contrato_id: contratoId,
        monto_capital: resultado.capital,
        tipo_interes: resultado.tipoInteres,
        tasa_retorno: resultado.tasaAnual,
        dias_transcurridos: resultado.diasTranscurridos,
        interes_simple: resultado.interesSimple,
        interes_compuesto: resultado.interesCompuesto,
        interes_aplicado: resultado.interesAplicado,
        hurdle_acumulado: resultado.hurdleAcumulado,
        interes_pagado: resultado.interesPagado,
        interes_pendiente: resultado.interesPendiente,
        penalidad_acumulada: 0,
        tir_estimada: resultado.tirEstimada,
        proxima_cuota_fecha: null,
        proxima_cuota_monto: null
    }
}

/**
 * Obtiene cronograma de pagos con estados actualizados
 */
export async function obtenerCronogramaConEstados(
    contratoId: string
): Promise<CronogramaCuota[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cronograma_pagos_fondeo')
        .select('*')
        .eq('contrato_id', contratoId)
        .order('numero_cuota', { ascending: true })

    if (error) {
        console.error('Error obteniendo cronograma:', error)
        return []
    }

    const hoy = new Date()

    return (data || []).map(cuota => {
        const fechaProgramada = new Date(cuota.fecha_programada)
        const diasAtraso = cuota.estado === 'PENDIENTE' && fechaProgramada < hoy
            ? Math.floor((hoy.getTime() - fechaProgramada.getTime()) / (1000 * 60 * 60 * 24))
            : 0

        const { penalidad } = calcularPenalidadAtrasoEmpresa({
            montoVencido: Number(cuota.monto_total),
            diasAtraso,
            tasaDiaria: 0.5,
            diasGracia: 5
        })

        return {
            id: cuota.id,
            contrato_id: cuota.contrato_id,
            numero_cuota: cuota.numero_cuota,
            tipo_pago: cuota.tipo_pago,
            fecha_programada: cuota.fecha_programada,
            fecha_pago_real: cuota.fecha_pago_real,
            monto_capital: Number(cuota.monto_capital),
            monto_interes: Number(cuota.monto_interes),
            monto_total: Number(cuota.monto_total),
            estado: diasAtraso > 5 ? 'VENCIDO' : cuota.estado,
            dias_atraso: diasAtraso,
            penalidad
        }
    })
}

/**
 * Registra un pago de rendimiento a inversionista
 */
export async function registrarPagoRendimiento(
    pago: RegistroPago
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Obtener cuota
    const { data: cuota, error: errorCuota } = await supabase
        .from('cronograma_pagos_fondeo')
        .select('*, contratos_fondeo(*)')
        .eq('id', pago.cuota_id)
        .single()

    if (errorCuota || !cuota) {
        return { success: false, error: 'Cuota no encontrada' }
    }

    const montoTotal = pago.monto_capital + pago.monto_interes + pago.monto_penalidad

    // Calcular días de atraso
    const fechaProgramada = new Date(cuota.fecha_programada)
    const hoy = new Date()
    const diasAtraso = Math.max(0, Math.floor((hoy.getTime() - fechaProgramada.getTime()) / (1000 * 60 * 60 * 24)))

    // Registrar pago en historial
    const { error: errorPago } = await supabase
        .from('pagos_rendimientos')
        .insert({
            contrato_id: cuota.contrato_id,
            cuota_id: pago.cuota_id,
            tipo_pago: cuota.tipo_pago,
            monto_capital: pago.monto_capital,
            monto_interes: pago.monto_interes,
            monto_penalidad: pago.monto_penalidad,
            monto_total: montoTotal,
            fecha_programada: cuota.fecha_programada,
            fecha_pago: hoy.toISOString().split('T')[0],
            dias_atraso: diasAtraso,
            medio_pago: pago.medio_pago,
            referencia_transaccion: pago.referencia,
            notas: pago.notas
        })

    if (errorPago) {
        console.error('Error registrando pago:', errorPago)
        return { success: false, error: 'Error al registrar pago' }
    }

    // Actualizar estado de cuota
    await supabase
        .from('cronograma_pagos_fondeo')
        .update({
            estado: 'PAGADO',
            fecha_pago_real: hoy.toISOString().split('T')[0],
            monto_pagado: montoTotal,
            updated_at: new Date().toISOString()
        })
        .eq('id', pago.cuota_id)

    // Actualizar totales en contrato
    await supabase
        .from('contratos_fondeo')
        .update({
            monto_rendimientos_pagados: (cuota.contratos_fondeo?.monto_rendimientos_pagados || 0) + pago.monto_interes,
            updated_at: new Date().toISOString()
        })
        .eq('id', cuota.contrato_id)

    return { success: true }
}

/**
 * Compara interés simple vs compuesto para preview
 */
export async function compararIntereses(params: {
    capital: number
    tasaAnual: number
    meses: number
}): Promise<{
    simple: number
    compuesto: number
    diferencia: number
    descripcion: string
}> {
    const resultado = calcularInteresCompuesto({
        capital: params.capital,
        tasaAnual: params.tasaAnual,
        meses: params.meses,
        capitalizacion: 'MENSUAL'
    })

    return {
        simple: resultado.interesSimple,
        compuesto: resultado.interesCompuesto,
        diferencia: resultado.diferencia,
        descripcion: resultado.diferencia > 0
            ? `Con interés compuesto ganas S/${resultado.diferencia.toFixed(2)} más`
            : 'Ambos tipos generan el mismo rendimiento'
    }
}

/**
 * Obtiene alertas de pagos pendientes (para dashboard)
 */
export async function obtenerAlertasPagosPendientes() {
    const supabase = await createClient()

    const hoy = new Date()
    const en7Dias = new Date()
    en7Dias.setDate(en7Dias.getDate() + 7)

    const { data, error } = await supabase
        .from('cronograma_pagos_fondeo')
        .select(`
            *,
            contratos_fondeo(
                inversionista_id,
                inversionistas(
                    persona_id,
                    personas(nombres, apellido_paterno)
                )
            )
        `)
        .eq('estado', 'PENDIENTE')
        .lte('fecha_programada', en7Dias.toISOString().split('T')[0])
        .order('fecha_programada', { ascending: true })

    if (error) {
        console.error('Error obteniendo alertas:', error)
        return []
    }

    return (data || []).map(cuota => {
        const fechaProgramada = new Date(cuota.fecha_programada)
        const diasParaPago = Math.floor((fechaProgramada.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

        return {
            id: cuota.id,
            contrato_id: cuota.contrato_id,
            inversionista: cuota.contratos_fondeo?.inversionistas?.personas
                ? `${cuota.contratos_fondeo.inversionistas.personas.nombres} ${cuota.contratos_fondeo.inversionistas.personas.apellido_paterno}`
                : 'Desconocido',
            fecha_programada: cuota.fecha_programada,
            monto: Number(cuota.monto_total),
            tipo: cuota.tipo_pago,
            diasParaPago,
            estado: diasParaPago < 0 ? 'VENCIDO' : diasParaPago <= 3 ? 'URGENTE' : 'PROXIMO'
        }
    })
}

/**
 * Obtiene resumen de todos los inversionistas (para dashboard ejecutivo)
 */
export async function obtenerResumenInversionistas() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vista_inversionistas_profesional')
        .select('*')

    if (error) {
        console.error('Error obteniendo resumen:', error)
        return null
    }

    const totales = (data || []).reduce((acc, inv) => ({
        capitalTotal: acc.capitalTotal + Number(inv.capital_total || 0),
        rendimientoDevengado: acc.rendimientoDevengado + Number(inv.rendimiento_devengado || 0),
        rendimientoPagado: acc.rendimientoPagado + Number(inv.rendimiento_pagado || 0),
        numInversionistas: acc.numInversionistas + 1
    }), {
        capitalTotal: 0,
        rendimientoDevengado: 0,
        rendimientoPagado: 0,
        numInversionistas: 0
    })

    return {
        inversionistas: data,
        totales: {
            ...totales,
            rendimientoPendiente: totales.rendimientoDevengado - totales.rendimientoPagado
        }
    }
}

/**
 * Obtiene el cronograma global de todos los pagos (para la pestaña Cronograma)
 */
export async function obtenerCronogramaGlobal(limite: number = 50) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cronograma_pagos_fondeo')
        .select(`
            *,
            contratos_fondeo(
                tipo,
                inversionista_id,
                inversionistas(
                    persona_id,
                    personas(nombres, apellido_paterno)
                )
            )
        `)
        .order('fecha_programada', { ascending: true })
        .limit(limite)

    if (error) {
        console.error('Error obteniendo cronograma global:', error)
        return []
    }

    return (data || []).map(cuota => {
        const inv = cuota.contratos_fondeo?.inversionistas?.personas
        const nombreInversionista = inv ? `${inv.nombres} ${inv.apellido_paterno}` : 'Desconocido'

        return {
            id: cuota.id,
            contrato_id: cuota.contrato_id,
            nombre_inversionista: nombreInversionista,
            tipo_contrato: cuota.contratos_fondeo?.tipo,
            numero_cuota: cuota.numero_cuota,
            tipo_pago: cuota.tipo_pago,
            fecha_programada: cuota.fecha_programada,
            monto_total: Number(cuota.monto_total),
            monto_capital: Number(cuota.monto_capital),
            monto_interes: Number(cuota.monto_interes),
            estado: cuota.estado
        }
    })
}
