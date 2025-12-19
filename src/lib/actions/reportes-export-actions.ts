'use server'

/**
 * Exportación de Reportes - CSV
 * 
 * Genera archivos CSV descargables para KPIs y recibos.
 * Read-only, protegido.
 */

import { createClient } from '@/lib/supabase/server'
import { obtenerKPIsCobranza } from '@/lib/actions/kpis-cobranza-actions'
import { obtenerKPIsRiesgo } from '@/lib/actions/kpis-riesgo-actions'

// ============ TYPES ============

export interface ReporteConfig {
    tipo: 'kpis' | 'recibos' | 'cartera' | 'mora'
    fechaInicio?: string
    fechaFin?: string
}

// ============ CSV HELPERS ============

function escapeCsvValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

function arrayToCSV(headers: string[], rows: (string | number | null)[][]): string {
    const headerLine = headers.map(escapeCsvValue).join(',')
    const dataLines = rows.map(row => row.map(escapeCsvValue).join(','))
    return [headerLine, ...dataLines].join('\n')
}

// ============ REPORT GENERATORS ============

/**
 * Genera CSV de KPIs de cobranza actuales
 */
export async function generarReporteKPIs(): Promise<string> {
    const kpisCobranza = await obtenerKPIsCobranza()
    const kpisRiesgo = await obtenerKPIsRiesgo()

    const headers = ['Métrica', 'Valor', 'Detalle', 'Fecha']
    const rows: (string | number)[][] = [
        ['Recaudación Hoy', kpisCobranza.recaudacion.hoy, 'PEN', kpisCobranza.ultimaActualizacion],
        ['Recaudación Semana', kpisCobranza.recaudacion.semana, 'PEN', kpisCobranza.ultimaActualizacion],
        ['Recaudación Mes', kpisCobranza.recaudacion.mes, 'PEN', kpisCobranza.ultimaActualizacion],
        ['Mora %', kpisCobranza.mora.porcentaje, `${kpisCobranza.mora.creditosEnMora} créditos`, kpisCobranza.ultimaActualizacion],
        ['Mora Monto', kpisCobranza.mora.montoTotal, 'PEN', kpisCobranza.ultimaActualizacion],
        ['Créditos Activos', kpisCobranza.creditos.activos, `Total: ${kpisCobranza.creditos.total}`, kpisCobranza.ultimaActualizacion],
        ['Créditos Cerrados', kpisCobranza.creditos.cerrados, '', kpisCobranza.ultimaActualizacion],
        ['Recibos Emitidos', kpisCobranza.recibos.emitidos, `Enviados: ${kpisCobranza.recibos.enviados}`, kpisCobranza.ultimaActualizacion],
        ['Recibos Errores', kpisCobranza.recibos.errores, '', kpisCobranza.ultimaActualizacion],
        ['Provisión Sugerida', kpisRiesgo.provisiones.sugerida, 'PEN', kpisRiesgo.ultimaActualizacion],
        ['Concentración Top 10', kpisRiesgo.concentracion.porcentajeTop10, '%', kpisRiesgo.ultimaActualizacion]
    ]

    // Add aging buckets
    kpisRiesgo.aging.buckets.forEach(bucket => {
        rows.push([`Aging ${bucket.rango}`, bucket.monto, `${bucket.creditos} créditos (${bucket.porcentaje.toFixed(1)}%)`, kpisRiesgo.ultimaActualizacion])
    })

    return arrayToCSV(headers, rows)
}

/**
 * Genera CSV de recibos del mes
 */
export async function generarReporteRecibos(fechaInicio?: string, fechaFin?: string): Promise<string> {
    const supabase = await createClient()

    const hoy = new Date()
    const inicioMes = fechaInicio || new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
    const finMes = fechaFin || hoy.toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('notificaciones_enviadas')
        .select('created_at, telefono_destino, estado, metadata')
        .eq('tipo_notificacion', 'RECIBO_PDF')
        .gte('created_at', `${inicioMes}T00:00:00`)
        .lte('created_at', `${finMes}T23:59:59`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error obteniendo recibos:', error)
        return 'Error generando reporte'
    }

    const headers = ['Fecha', 'Número Recibo', 'Crédito', 'Monto', 'Teléfono', 'Estado']
    const rows: (string | number)[][] = (data || []).map(row => {
        const metadata = row.metadata as { numero_recibo?: string; codigo_credito?: string; monto_pagado?: number } || {}
        return [
            new Date(row.created_at).toLocaleString('es-PE'),
            metadata.numero_recibo || 'N/A',
            metadata.codigo_credito || 'N/A',
            metadata.monto_pagado || 0,
            row.telefono_destino || 'N/A',
            row.estado
        ]
    })

    return arrayToCSV(headers, rows)
}

/**
 * Genera CSV de cartera vencida
 */
export async function generarReporteCarteraVencida(): Promise<string> {
    const supabase = await createClient()
    const hoy = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('creditos')
        .select(`
            codigo,
            monto,
            saldo_pendiente,
            fecha_vencimiento,
            estado,
            clientes!inner(nombres, apellido_paterno, numero_documento)
        `)
        .in('estado', ['vencido', 'en_mora'])
        .lt('fecha_vencimiento', hoy)
        .order('fecha_vencimiento', { ascending: true })

    if (error) {
        console.error('Error obteniendo cartera:', error)
        return 'Error generando reporte'
    }

    const headers = ['Código', 'Cliente', 'Documento', 'Monto Original', 'Saldo Pendiente', 'Fecha Vencimiento', 'Días Vencido', 'Estado']
    const rows: (string | number)[][] = (data || []).map(row => {
        const cliente = row.clientes as unknown as { nombres: string; apellido_paterno: string; numero_documento: string } | null
        const diasVencido = Math.floor((new Date().getTime() - new Date(row.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24))
        return [
            row.codigo,
            cliente ? `${cliente.nombres} ${cliente.apellido_paterno}` : 'N/A',
            cliente?.numero_documento || 'N/A',
            row.monto,
            row.saldo_pendiente,
            row.fecha_vencimiento,
            diasVencido,
            row.estado
        ]
    })

    return arrayToCSV(headers, rows)
}

/**
 * Genera reporte según tipo
 */
export async function generarReporte(config: ReporteConfig): Promise<{
    success: boolean
    contenido?: string
    filename?: string
    error?: string
}> {
    try {
        let contenido: string
        let filename: string
        const fechaHoy = new Date().toISOString().split('T')[0]

        switch (config.tipo) {
            case 'kpis':
                contenido = await generarReporteKPIs()
                filename = `kpis_cobranza_${fechaHoy}.csv`
                break
            case 'recibos':
                contenido = await generarReporteRecibos(config.fechaInicio, config.fechaFin)
                filename = `recibos_${fechaHoy}.csv`
                break
            case 'cartera':
            case 'mora':
                contenido = await generarReporteCarteraVencida()
                filename = `cartera_vencida_${fechaHoy}.csv`
                break
            default:
                return { success: false, error: 'Tipo de reporte no válido' }
        }

        return { success: true, contenido, filename }
    } catch (error) {
        console.error('Error generando reporte:', error)
        return { success: false, error: 'Error generando reporte' }
    }
}
