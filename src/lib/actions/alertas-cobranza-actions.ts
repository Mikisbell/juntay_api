'use server'

/**
 * Alertas de Cobranza - Read-Only
 * 
 * Detecta condiciones de alerta basadas en umbrales.
 * Solo queries, no writes.
 */

import { createClient } from '@/lib/supabase/server'

// ============ TYPES ============

export type AlertaSeveridad = 'critica' | 'alta' | 'media' | 'baja'
export type AlertaTipo = 'mora' | 'recibos' | 'recaudacion' | 'vencimientos'

export interface AlertaCobranza {
    id: string
    tipo: AlertaTipo
    severidad: AlertaSeveridad
    titulo: string
    descripcion: string
    valor: number
    umbral: number
    fecha: string
}

export interface AlertasResumen {
    alertas: AlertaCobranza[]
    contadores: {
        critica: number
        alta: number
        media: number
        baja: number
    }
    ultimaActualizacion: string
}

// ============ UMBRALES ============

const UMBRALES = {
    mora: {
        critica: 15,    // >15% mora = crítica
        alta: 10,       // >10% mora = alta
        media: 5        // >5% mora = media
    },
    recibosError: {
        alta: 10,       // >10 errores hoy = alta
        media: 5        // >5 errores = media
    },
    recaudacionCaida: {
        alta: 50,       // -50% vs ayer = alta
        media: 25       // -25% vs ayer = media
    },
    vencimientosHoy: {
        alta: 10,       // >10 vencen hoy = alta
        media: 5        // >5 vencen hoy = media
    }
}

// ============ DETECCIÓN ============

/**
 * Detecta alertas de mora
 */
async function detectarAlertasMora(): Promise<AlertaCobranza[]> {
    const supabase = await createClient()
    const alertas: AlertaCobranza[] = []
    const hoy = new Date().toISOString().split('T')[0]

    // Contar créditos vencidos vs total
    const [vencidosResult, totalResult] = await Promise.all([
        supabase
            .from('creditos')
            .select('id')
            .in('estado', ['vencido', 'en_mora'])
            .lt('fecha_vencimiento', hoy),
        supabase
            .from('creditos')
            .select('id')
            .in('estado', ['vigente', 'vencido', 'en_mora', 'por_vencer'])
    ])

    const vencidos = vencidosResult.data?.length || 0
    const total = totalResult.data?.length || 0
    const porcentajeMora = total > 0 ? (vencidos / total) * 100 : 0

    if (porcentajeMora > UMBRALES.mora.critica) {
        alertas.push({
            id: `mora-critica-${Date.now()}`,
            tipo: 'mora',
            severidad: 'critica',
            titulo: 'Mora Crítica',
            descripcion: `La cartera en mora supera el ${UMBRALES.mora.critica}%`,
            valor: porcentajeMora,
            umbral: UMBRALES.mora.critica,
            fecha: new Date().toISOString()
        })
    } else if (porcentajeMora > UMBRALES.mora.alta) {
        alertas.push({
            id: `mora-alta-${Date.now()}`,
            tipo: 'mora',
            severidad: 'alta',
            titulo: 'Mora Alta',
            descripcion: `La cartera en mora supera el ${UMBRALES.mora.alta}%`,
            valor: porcentajeMora,
            umbral: UMBRALES.mora.alta,
            fecha: new Date().toISOString()
        })
    } else if (porcentajeMora > UMBRALES.mora.media) {
        alertas.push({
            id: `mora-media-${Date.now()}`,
            tipo: 'mora',
            severidad: 'media',
            titulo: 'Mora Moderada',
            descripcion: `La cartera en mora supera el ${UMBRALES.mora.media}%`,
            valor: porcentajeMora,
            umbral: UMBRALES.mora.media,
            fecha: new Date().toISOString()
        })
    }

    return alertas
}

/**
 * Detecta alertas de errores en recibos
 */
async function detectarAlertasRecibos(): Promise<AlertaCobranza[]> {
    const supabase = await createClient()
    const alertas: AlertaCobranza[] = []
    const hoy = new Date().toISOString().split('T')[0]

    const { data } = await supabase
        .from('notificaciones_enviadas')
        .select('id')
        .eq('tipo_notificacion', 'RECIBO_PDF')
        .eq('estado', 'error')
        .gte('created_at', `${hoy}T00:00:00`)

    const erroresHoy = data?.length || 0

    if (erroresHoy > UMBRALES.recibosError.alta) {
        alertas.push({
            id: `recibos-alta-${Date.now()}`,
            tipo: 'recibos',
            severidad: 'alta',
            titulo: 'Errores de Recibos',
            descripcion: `${erroresHoy} recibos fallaron hoy`,
            valor: erroresHoy,
            umbral: UMBRALES.recibosError.alta,
            fecha: new Date().toISOString()
        })
    } else if (erroresHoy > UMBRALES.recibosError.media) {
        alertas.push({
            id: `recibos-media-${Date.now()}`,
            tipo: 'recibos',
            severidad: 'media',
            titulo: 'Errores de Recibos',
            descripcion: `${erroresHoy} recibos fallaron hoy`,
            valor: erroresHoy,
            umbral: UMBRALES.recibosError.media,
            fecha: new Date().toISOString()
        })
    }

    return alertas
}

/**
 * Detecta caída en recaudación vs ayer
 */
async function detectarAlertasRecaudacion(): Promise<AlertaCobranza[]> {
    const supabase = await createClient()
    const alertas: AlertaCobranza[] = []

    const hoy = new Date()
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)

    const hoyStr = hoy.toISOString().split('T')[0]
    const ayerStr = ayer.toISOString().split('T')[0]

    const [hoyResult, ayerResult] = await Promise.all([
        supabase
            .from('pagos')
            .select('monto')
            .gte('created_at', `${hoyStr}T00:00:00`)
            .lte('created_at', `${hoyStr}T23:59:59`),
        supabase
            .from('pagos')
            .select('monto')
            .gte('created_at', `${ayerStr}T00:00:00`)
            .lte('created_at', `${ayerStr}T23:59:59`)
    ])

    const recaudacionHoy = (hoyResult.data || []).reduce((sum, p) => sum + (p.monto || 0), 0)
    const recaudacionAyer = (ayerResult.data || []).reduce((sum, p) => sum + (p.monto || 0), 0)

    if (recaudacionAyer > 0) {
        const caida = ((recaudacionAyer - recaudacionHoy) / recaudacionAyer) * 100

        if (caida > UMBRALES.recaudacionCaida.alta) {
            alertas.push({
                id: `recaudacion-alta-${Date.now()}`,
                tipo: 'recaudacion',
                severidad: 'alta',
                titulo: 'Caída de Recaudación',
                descripcion: `Recaudación cayó ${caida.toFixed(0)}% vs ayer`,
                valor: caida,
                umbral: UMBRALES.recaudacionCaida.alta,
                fecha: new Date().toISOString()
            })
        } else if (caida > UMBRALES.recaudacionCaida.media) {
            alertas.push({
                id: `recaudacion-media-${Date.now()}`,
                tipo: 'recaudacion',
                severidad: 'media',
                titulo: 'Baja en Recaudación',
                descripcion: `Recaudación cayó ${caida.toFixed(0)}% vs ayer`,
                valor: caida,
                umbral: UMBRALES.recaudacionCaida.media,
                fecha: new Date().toISOString()
            })
        }
    }

    return alertas
}

/**
 * Detecta vencimientos del día
 */
async function detectarAlertasVencimientos(): Promise<AlertaCobranza[]> {
    const supabase = await createClient()
    const alertas: AlertaCobranza[] = []
    const hoy = new Date().toISOString().split('T')[0]

    const { data } = await supabase
        .from('creditos')
        .select('id')
        .eq('fecha_vencimiento', hoy)
        .in('estado', ['vigente', 'por_vencer'])

    const vencenHoy = data?.length || 0

    if (vencenHoy > UMBRALES.vencimientosHoy.alta) {
        alertas.push({
            id: `vencimientos-alta-${Date.now()}`,
            tipo: 'vencimientos',
            severidad: 'alta',
            titulo: 'Alto Volumen de Vencimientos',
            descripcion: `${vencenHoy} créditos vencen hoy`,
            valor: vencenHoy,
            umbral: UMBRALES.vencimientosHoy.alta,
            fecha: new Date().toISOString()
        })
    } else if (vencenHoy > UMBRALES.vencimientosHoy.media) {
        alertas.push({
            id: `vencimientos-media-${Date.now()}`,
            tipo: 'vencimientos',
            severidad: 'media',
            titulo: 'Vencimientos del Día',
            descripcion: `${vencenHoy} créditos vencen hoy`,
            valor: vencenHoy,
            umbral: UMBRALES.vencimientosHoy.media,
            fecha: new Date().toISOString()
        })
    }

    return alertas
}

// ============ MAIN QUERY ============

/**
 * Obtiene todas las alertas de cobranza
 */
export async function obtenerAlertasCobranza(): Promise<AlertasResumen> {
    const [mora, recibos, recaudacion, vencimientos] = await Promise.all([
        detectarAlertasMora(),
        detectarAlertasRecibos(),
        detectarAlertasRecaudacion(),
        detectarAlertasVencimientos()
    ])

    const alertas = [...mora, ...recibos, ...recaudacion, ...vencimientos]
        .sort((a, b) => {
            const orden: Record<AlertaSeveridad, number> = { critica: 0, alta: 1, media: 2, baja: 3 }
            return orden[a.severidad] - orden[b.severidad]
        })

    return {
        alertas,
        contadores: {
            critica: alertas.filter(a => a.severidad === 'critica').length,
            alta: alertas.filter(a => a.severidad === 'alta').length,
            media: alertas.filter(a => a.severidad === 'media').length,
            baja: alertas.filter(a => a.severidad === 'baja').length
        },
        ultimaActualizacion: new Date().toISOString()
    }
}
