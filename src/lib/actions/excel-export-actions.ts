'use server'

/**
 * Exportación a Excel (XLSX)
 * 
 * Genera archivos Excel descargables.
 */

import * as XLSX from 'xlsx'
import { obtenerKPIsCobranza } from '@/lib/actions/kpis-cobranza-actions'
import { obtenerKPIsRiesgo } from '@/lib/actions/kpis-riesgo-actions'
import { createClient } from '@/lib/supabase/server'

// ============ TYPES ============

export interface ExcelReporteConfig {
    tipo: 'kpis' | 'cartera' | 'pagos' | 'completo'
    fechaInicio?: string
    fechaFin?: string
}

// ============ HELPERS ============

function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE')
}

function formatMonto(monto: number): number {
    return Math.round(monto * 100) / 100
}

// ============ SHEET GENERATORS ============

/**
 * Genera hoja de KPIs
 */
async function generarSheetKPIs(): Promise<XLSX.WorkSheet> {
    const kpisCobranza = await obtenerKPIsCobranza()
    const kpisRiesgo = await obtenerKPIsRiesgo()

    const data = [
        ['REPORTE DE KPIs - JUNTAY', '', '', new Date().toLocaleDateString('es-PE')],
        [],
        ['RECAUDACIÓN'],
        ['Hoy', formatMonto(kpisCobranza.recaudacion.hoy)],
        ['Semana', formatMonto(kpisCobranza.recaudacion.semana)],
        ['Mes', formatMonto(kpisCobranza.recaudacion.mes)],
        [],
        ['MORA'],
        ['Porcentaje', `${kpisCobranza.mora.porcentaje.toFixed(1)}%`],
        ['Créditos en mora', kpisCobranza.mora.creditosEnMora],
        ['Monto total', formatMonto(kpisCobranza.mora.montoTotal)],
        [],
        ['CRÉDITOS'],
        ['Total', kpisCobranza.creditos.total],
        ['Activos', kpisCobranza.creditos.activos],
        ['Cerrados', kpisCobranza.creditos.cerrados],
        [],
        ['RECIBOS'],
        ['Emitidos', kpisCobranza.recibos.emitidos],
        ['Enviados', kpisCobranza.recibos.enviados],
        ['Errores', kpisCobranza.recibos.errores],
        [],
        ['AGING DE CARTERA'],
        ['Rango', 'Créditos', 'Monto', '%'],
        ...kpisRiesgo.aging.buckets.map(b => [
            b.rango,
            b.creditos,
            formatMonto(b.monto),
            `${b.porcentaje.toFixed(1)}%`
        ]),
        [],
        ['PROVISIÓN SUGERIDA', formatMonto(kpisRiesgo.provisiones.sugerida)]
    ]

    return XLSX.utils.aoa_to_sheet(data)
}

/**
 * Genera hoja de cartera vencida
 */
async function generarSheetCartera(): Promise<XLSX.WorkSheet> {
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
        .in('estado', ['vencido', 'en_mora', 'vigente', 'por_vencer'])
        .order('fecha_vencimiento', { ascending: true })
        .limit(200)

    if (error) {
        console.error('Error:', error)
        return XLSX.utils.aoa_to_sheet([['Error obteniendo datos']])
    }

    const rows = [
        ['CARTERA DE CRÉDITOS', '', '', '', '', '', formatFecha(hoy)],
        [],
        ['Código', 'Cliente', 'Documento', 'Monto Original', 'Saldo Pendiente', 'Vencimiento', 'Estado'],
        ...(data || []).map(c => {
            const cliente = c.clientes as unknown as { nombres: string; apellido_paterno: string; numero_documento: string } | null
            return [
                c.codigo,
                cliente ? `${cliente.nombres} ${cliente.apellido_paterno}` : 'N/A',
                cliente?.numero_documento || 'N/A',
                formatMonto(c.monto),
                formatMonto(c.saldo_pendiente),
                formatFecha(c.fecha_vencimiento),
                c.estado
            ]
        })
    ]

    return XLSX.utils.aoa_to_sheet(rows)
}

/**
 * Genera hoja de pagos del período
 */
async function generarSheetPagos(fechaInicio?: string, fechaFin?: string): Promise<XLSX.WorkSheet> {
    const supabase = await createClient()

    const hoy = new Date()
    const inicioMes = fechaInicio || new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
    const finMes = fechaFin || hoy.toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('pagos')
        .select(`
            id,
            created_at,
            monto,
            tipo,
            metodo_pago,
            creditos!inner(codigo)
        `)
        .gte('created_at', `${inicioMes}T00:00:00`)
        .lte('created_at', `${finMes}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(500)

    if (error) {
        console.error('Error:', error)
        return XLSX.utils.aoa_to_sheet([['Error obteniendo datos']])
    }

    const totalPagado = (data || []).reduce((sum, p) => sum + (p.monto || 0), 0)

    const rows = [
        ['PAGOS DEL PERÍODO', '', '', '', '', ''],
        ['Desde:', formatFecha(inicioMes), 'Hasta:', formatFecha(finMes)],
        ['Total:', formatMonto(totalPagado)],
        [],
        ['Fecha', 'Crédito', 'Monto', 'Tipo', 'Método'],
        ...(data || []).map(p => {
            const credito = p.creditos as unknown as { codigo: string } | null
            return [
                formatFecha(p.created_at),
                credito?.codigo || 'N/A',
                formatMonto(p.monto),
                p.tipo,
                p.metodo_pago
            ]
        })
    ]

    return XLSX.utils.aoa_to_sheet(rows)
}

// ============ MAIN EXPORT ============

/**
 * Genera reporte Excel
 */
export async function generarReporteExcel(config: ExcelReporteConfig): Promise<{
    success: boolean
    buffer?: Buffer
    filename?: string
    error?: string
}> {
    try {
        const workbook = XLSX.utils.book_new()
        const fechaHoy = new Date().toISOString().split('T')[0]

        switch (config.tipo) {
            case 'kpis':
                XLSX.utils.book_append_sheet(workbook, await generarSheetKPIs(), 'KPIs')
                break
            case 'cartera':
                XLSX.utils.book_append_sheet(workbook, await generarSheetCartera(), 'Cartera')
                break
            case 'pagos':
                XLSX.utils.book_append_sheet(workbook, await generarSheetPagos(config.fechaInicio, config.fechaFin), 'Pagos')
                break
            case 'completo':
                XLSX.utils.book_append_sheet(workbook, await generarSheetKPIs(), 'KPIs')
                XLSX.utils.book_append_sheet(workbook, await generarSheetCartera(), 'Cartera')
                XLSX.utils.book_append_sheet(workbook, await generarSheetPagos(config.fechaInicio, config.fechaFin), 'Pagos')
                break
        }

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
        const filename = `reporte_${config.tipo}_${fechaHoy}.xlsx`

        return { success: true, buffer, filename }
    } catch (error) {
        console.error('Error generando Excel:', error)
        return { success: false, error: 'Error generando reporte' }
    }
}
