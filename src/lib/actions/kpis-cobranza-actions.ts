'use server'

/**
 * KPIs de Cobranza - Read-Only
 * 
 * Métricas claras sin afectar lógica de negocio.
 * Solo queries, no writes.
 */

import { createClient } from '@/lib/supabase/server'

// ============ TYPES ============

export interface KPIsCobranza {
    recaudacion: {
        hoy: number
        semana: number
        mes: number
    }
    mora: {
        porcentaje: number
        montoTotal: number
        creditosEnMora: number
    }
    creditos: {
        activos: number
        cerrados: number
        total: number
    }
    recibos: {
        emitidos: number
        enviados: number
        errores: number
    }
    ultimaActualizacion: string
}

// ============ MAIN QUERY ============

/**
 * Obtiene todos los KPIs de cobranza en una sola llamada
 */
export async function obtenerKPIsCobranza(): Promise<KPIsCobranza> {
    const supabase = await createClient()
    const ahora = new Date()

    // Fechas para filtros
    const hoy = ahora.toISOString().split('T')[0]
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - 7)
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    // Ejecutar todas las queries en paralelo
    const [
        recaudacionHoy,
        recaudacionSemana,
        recaudacionMes,
        creditosStats,
        moraStats,
        recibosStats
    ] = await Promise.all([
        // Recaudación HOY
        supabase
            .from('pagos')
            .select('monto')
            .gte('created_at', `${hoy}T00:00:00`)
            .lte('created_at', `${hoy}T23:59:59`),

        // Recaudación SEMANA
        supabase
            .from('pagos')
            .select('monto')
            .gte('created_at', inicioSemana.toISOString()),

        // Recaudación MES
        supabase
            .from('pagos')
            .select('monto')
            .gte('created_at', inicioMes.toISOString()),

        // Créditos stats
        supabase
            .from('creditos')
            .select('estado'),

        // Mora (créditos vencidos)
        supabase
            .from('creditos')
            .select('saldo_pendiente, fecha_vencimiento')
            .in('estado', ['vigente', 'vencido', 'en_mora'])
            .lt('fecha_vencimiento', hoy),

        // Recibos emitidos (notificaciones tipo RECIBO_PDF)
        supabase
            .from('notificaciones_enviadas')
            .select('estado')
            .eq('tipo_notificacion', 'RECIBO_PDF')
            .gte('created_at', inicioMes.toISOString())
    ])

    // Calcular recaudación
    const sumarMontos = (data: { monto: number }[] | null) =>
        (data || []).reduce((sum, p) => sum + (p.monto || 0), 0)

    const recaudacion = {
        hoy: sumarMontos(recaudacionHoy.data),
        semana: sumarMontos(recaudacionSemana.data),
        mes: sumarMontos(recaudacionMes.data)
    }

    // Calcular créditos
    const creditosData = creditosStats.data || []
    const activos = creditosData.filter(c =>
        ['vigente', 'pendiente', 'vencido', 'en_mora', 'por_vencer'].includes(c.estado)
    ).length
    const cerrados = creditosData.filter(c =>
        ['pagado', 'cancelado', 'recuperado'].includes(c.estado)
    ).length

    // Calcular mora
    const moraData = moraStats.data || []
    const montoMora = moraData.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
    const totalCartera = creditosData
        .filter(c => ['vigente', 'vencido', 'en_mora'].includes(c.estado))
        .length

    // Calcular recibos
    const recibosData = recibosStats.data || []
    const recibosEnviados = recibosData.filter(r => r.estado === 'enviado').length
    const recibosError = recibosData.filter(r => r.estado === 'error').length

    return {
        recaudacion,
        mora: {
            porcentaje: totalCartera > 0 ? (moraData.length / totalCartera) * 100 : 0,
            montoTotal: montoMora,
            creditosEnMora: moraData.length
        },
        creditos: {
            activos,
            cerrados,
            total: creditosData.length
        },
        recibos: {
            emitidos: recibosData.length,
            enviados: recibosEnviados,
            errores: recibosError
        },
        ultimaActualizacion: ahora.toISOString()
    }
}

// ============ INDIVIDUAL QUERIES (para cache granular) ============

export async function obtenerRecaudacionDiaria(): Promise<number> {
    const supabase = await createClient()
    const hoy = new Date().toISOString().split('T')[0]

    const { data } = await supabase
        .from('pagos')
        .select('monto')
        .gte('created_at', `${hoy}T00:00:00`)
        .lte('created_at', `${hoy}T23:59:59`)

    return (data || []).reduce((sum, p) => sum + (p.monto || 0), 0)
}

export async function obtenerMoraActual(): Promise<{ porcentaje: number; monto: number; count: number }> {
    const supabase = await createClient()
    const hoy = new Date().toISOString().split('T')[0]

    const [moraResult, totalResult] = await Promise.all([
        supabase
            .from('creditos')
            .select('saldo_pendiente')
            .in('estado', ['vigente', 'vencido', 'en_mora'])
            .lt('fecha_vencimiento', hoy),
        supabase
            .from('creditos')
            .select('id')
            .in('estado', ['vigente', 'vencido', 'en_mora'])
    ])

    const moraData = moraResult.data || []
    const totalData = totalResult.data || []
    const monto = moraData.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)

    return {
        porcentaje: totalData.length > 0 ? (moraData.length / totalData.length) * 100 : 0,
        monto,
        count: moraData.length
    }
}
