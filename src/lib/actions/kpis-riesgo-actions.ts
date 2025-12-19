'use server'

/**
 * KPIs de Riesgo - Read-Only
 * 
 * Aging de cartera y métricas de riesgo crediticio.
 * Solo queries, no writes.
 */

import { createClient } from '@/lib/supabase/server'

// ============ TYPES ============

export interface AgingBucket {
    rango: string
    creditos: number
    monto: number
    porcentaje: number
}

export interface KPIsRiesgo {
    aging: {
        buckets: AgingBucket[]
        totalVencido: number
        totalCartera: number
    }
    concentracion: {
        top10Monto: number
        porcentajeTop10: number
    }
    provisiones: {
        sugerida: number
        porBucket: {
            rango: string
            provision: number
            tasaProvision: number
        }[]
    }
    ultimaActualizacion: string
}

// ============ AGING ANALYSIS ============

/**
 * Calcula el aging de cartera por buckets
 */
export async function calcularAgingCartera(): Promise<{
    buckets: AgingBucket[]
    totalVencido: number
    totalCartera: number
}> {
    const supabase = await createClient()
    const hoy = new Date()

    // Obtener créditos activos con fecha de vencimiento
    const { data, error } = await supabase
        .from('creditos')
        .select('id, saldo_pendiente, fecha_vencimiento')
        .in('estado', ['vigente', 'vencido', 'en_mora', 'por_vencer'])

    if (error || !data) {
        console.error('Error obteniendo cartera:', error)
        return { buckets: [], totalVencido: 0, totalCartera: 0 }
    }

    // Inicializar buckets
    const buckets = {
        alDia: { creditos: 0, monto: 0 },      // No vencido
        d0_30: { creditos: 0, monto: 0 },      // 1-30 días
        d31_60: { creditos: 0, monto: 0 },     // 31-60 días
        d61_90: { creditos: 0, monto: 0 },     // 61-90 días
        d90_plus: { creditos: 0, monto: 0 }    // +90 días
    }

    let totalCartera = 0

    for (const credito of data) {
        const saldo = credito.saldo_pendiente || 0
        totalCartera += saldo

        if (!credito.fecha_vencimiento) {
            buckets.alDia.creditos++
            buckets.alDia.monto += saldo
            continue
        }

        const fechaVenc = new Date(credito.fecha_vencimiento)
        const diasVencido = Math.floor((hoy.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24))

        if (diasVencido <= 0) {
            buckets.alDia.creditos++
            buckets.alDia.monto += saldo
        } else if (diasVencido <= 30) {
            buckets.d0_30.creditos++
            buckets.d0_30.monto += saldo
        } else if (diasVencido <= 60) {
            buckets.d31_60.creditos++
            buckets.d31_60.monto += saldo
        } else if (diasVencido <= 90) {
            buckets.d61_90.creditos++
            buckets.d61_90.monto += saldo
        } else {
            buckets.d90_plus.creditos++
            buckets.d90_plus.monto += saldo
        }
    }

    const totalVencido = buckets.d0_30.monto + buckets.d31_60.monto +
        buckets.d61_90.monto + buckets.d90_plus.monto

    const formatBucket = (rango: string, bucket: { creditos: number; monto: number }): AgingBucket => ({
        rango,
        creditos: bucket.creditos,
        monto: bucket.monto,
        porcentaje: totalCartera > 0 ? (bucket.monto / totalCartera) * 100 : 0
    })

    return {
        buckets: [
            formatBucket('Al día', buckets.alDia),
            formatBucket('1-30 días', buckets.d0_30),
            formatBucket('31-60 días', buckets.d31_60),
            formatBucket('61-90 días', buckets.d61_90),
            formatBucket('+90 días', buckets.d90_plus)
        ],
        totalVencido,
        totalCartera
    }
}

// ============ CONCENTRACIÓN ============

/**
 * Calcula concentración de riesgo (Top 10 clientes)
 */
async function calcularConcentracion(): Promise<{
    top10Monto: number
    porcentajeTop10: number
}> {
    const supabase = await createClient()

    // Total cartera
    const { data: totalData } = await supabase
        .from('creditos')
        .select('saldo_pendiente')
        .in('estado', ['vigente', 'vencido', 'en_mora'])

    const totalCartera = (totalData || []).reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)

    // Top 10 por saldo
    const { data: top10Data } = await supabase
        .from('creditos')
        .select('saldo_pendiente')
        .in('estado', ['vigente', 'vencido', 'en_mora'])
        .order('saldo_pendiente', { ascending: false })
        .limit(10)

    const top10Monto = (top10Data || []).reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)

    return {
        top10Monto,
        porcentajeTop10: totalCartera > 0 ? (top10Monto / totalCartera) * 100 : 0
    }
}

// ============ PROVISIONES ============

/**
 * Calcula provisiones sugeridas según aging
 * Tasas basadas en regulación SBS Perú (aproximadas)
 */
function calcularProvisiones(buckets: AgingBucket[]): {
    sugerida: number
    porBucket: { rango: string; provision: number; tasaProvision: number }[]
} {
    // Tasas de provisión por bucket (SBS aproximado)
    const tasas: Record<string, number> = {
        'Al día': 0.01,       // 1% preventivo
        '1-30 días': 0.05,    // 5%
        '31-60 días': 0.25,   // 25%
        '61-90 días': 0.60,   // 60%
        '+90 días': 1.00      // 100%
    }

    const porBucket = buckets.map(bucket => {
        const tasa = tasas[bucket.rango] || 0
        return {
            rango: bucket.rango,
            provision: bucket.monto * tasa,
            tasaProvision: tasa * 100
        }
    })

    const sugerida = porBucket.reduce((sum, b) => sum + b.provision, 0)

    return { sugerida, porBucket }
}

// ============ MAIN QUERY ============

/**
 * Obtiene todos los KPIs de riesgo en una sola llamada
 */
export async function obtenerKPIsRiesgo(): Promise<KPIsRiesgo> {
    const [aging, concentracion] = await Promise.all([
        calcularAgingCartera(),
        calcularConcentracion()
    ])

    const provisiones = calcularProvisiones(aging.buckets)

    return {
        aging,
        concentracion,
        provisiones,
        ultimaActualizacion: new Date().toISOString()
    }
}
