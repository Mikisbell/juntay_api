'use server'

import { createClient } from '@/lib/supabase/server'

export interface MovimientoDia {
    tipo_movimiento: string
    categoria: string
    cantidad_operaciones: number
    monto_total: number
    monto_promedio: number
}

export interface ResultadoConciliacion {
    cuadra: boolean
    diferencia: number
    saldo_esperado: number
    saldo_real: number
    detalle: {
        saldo_inicial: number
        prestamos: number
        pagos: number
        fecha: string
    }
}

export interface Descuadre {
    fecha: string
    diferencia: number
    saldo_esperado: number
    saldo_real: number
    caja_id: string
    cajero_nombre: string
}

/**
 * Obtener movimientos del día para conciliación
 */
export async function obtenerMovimientosDia(fecha: Date) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_movimientos_dia', {
        p_fecha: fecha.toISOString().split('T')[0]
    })

    if (error) throw error

    return data as MovimientoDia[]
}

/**
 * Conciliar caja del día
 */
export async function conciliarCajaDia(fecha: Date) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('conciliar_caja_dia', {
        p_fecha: fecha.toISOString().split('T')[0]
    })

    if (error) throw error

    return data[0] as ResultadoConciliacion
}

/**
 * Detectar descuadres pendientes
 */
export async function detectarDescuadres(ultimosDias: number = 7) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('detectar_descuadres', {
        p_ultimos_dias: ultimosDias
    })

    if (error) throw error

    return data as Descuadre[]
}

/**
 * Generar reporte de cierre del día
 */
export async function generarReporteCierre(fecha: Date) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('generar_reporte_cierre', {
        p_fecha: fecha.toISOString().split('T')[0]
    })

    if (error) throw error

    return data
}

/**
 * Enviar alerta de descuadre a gerencia
 */
export async function enviarAlertaDescuadre(descuadre: Descuadre) {
    // TODO: Integrar con servicio de email/SMS
    // Por ahora, solo registramos en consola
    console.warn('[ALERTA DESCUADRE]', {
        fecha: descuadre.fecha,
        diferencia: descuadre.diferencia,
        cajero: descuadre.cajero_nombre
    })

    // En producción: enviar email a gerencia
    // await enviarEmail({
    //     to: 'gerencia@juntay.pe',
    //     subject: `⚠️ Descuadre de caja detectado - ${descuadre.fecha}`,
    //     body: `...`
    // })

    return { success: true }
}
