'use server'

import { createClient } from '@supabase/supabase-js'

// Service client para bypass auth en desarrollo
const getServiceClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export interface CajaActivaDetalle {
    id: string
    numero_caja: number
    usuario_id: string
    usuario_nombre: string
    saldo_inicial: number
    saldo_actual: number
    fecha_apertura: string
    // Resumen del día
    total_ingresos_dia: number
    total_egresos_dia: number
    num_transacciones_dia: number
    num_empenos_dia: number
    num_pagos_dia: number
}

export interface ResumenConsolidado {
    total_cajas_abiertas: number
    total_efectivo_cajas: number
    total_transacciones_hoy: number
    total_empenos_hoy: number
    total_pagos_hoy: number
}

/**
 * Obtiene todas las cajas abiertas con su resumen operativo del día
 */
export async function obtenerCajasActivas() {
    const supabase = getServiceClient()

    // 1. Obtener cajas abiertas con datos del cajero
    const { data: cajas, error: errorCajas } = await supabase
        .from('cajas_operativas')
        .select(`
      id,
      numero_caja,
      usuario_id,
      saldo_inicial,
      saldo_actual,
      fecha_apertura,
      usuarios:usuario_id (
        nombres,
        apellido_paterno
      )
    `)
        .eq('estado', 'abierta')
        .order('numero_caja', { ascending: true })

    if (errorCajas) {
        console.error('Error obteniendo cajas activas:', errorCajas)
        return []
    }

    if (!cajas || cajas.length === 0) {
        return []
    }

    // 2. Para cada caja, obtener resumen de movimientos del día
    const cajasConResumen: CajaActivaDetalle[] = await Promise.all(
        cajas.map(async (caja: any) => {
            const hoyInicio = new Date()
            hoyInicio.setHours(0, 0, 0, 0)

            const { data: movimientos } = await supabase
                .from('movimientos_caja_operativa')
                .select('tipo, motivo, monto')
                .eq('caja_operativa_id', caja.id)
                .gte('fecha', hoyInicio.toISOString())

            // Calcular totales
            const ingresos = movimientos
                ?.filter((m: any) => m.tipo === 'INGRESO')
                .reduce((sum: number, m: any) => sum + parseFloat(m.monto), 0) || 0

            const egresos = movimientos
                ?.filter((m: any) => m.tipo === 'EGRESO')
                .reduce((sum: number, m: any) => sum + Math.abs(parseFloat(m.monto)), 0) || 0

            const empenos = movimientos
                ?.filter((m: any) => m.tipo === 'EGRESO' && m.motivo === 'DESEMBOLSO_EMPENO')
                .length || 0

            const pagos = movimientos
                ?.filter((m: any) => m.tipo === 'INGRESO' && (m.motivo === 'PAGO_INTERES' || m.motivo === 'PAGO_CAPITAL'))
                .length || 0

            return {
                id: caja.id,
                numero_caja: caja.numero_caja,
                usuario_id: caja.usuario_id,
                usuario_nombre: `${caja.usuarios?.nombres || ''} ${caja.usuarios?.apellido_paterno || ''}`.trim(),
                saldo_inicial: parseFloat(caja.saldo_inicial),
                saldo_actual: parseFloat(caja.saldo_actual),
                fecha_apertura: caja.fecha_apertura,
                total_ingresos_dia: ingresos,
                total_egresos_dia: egresos,
                num_transacciones_dia: movimientos?.length || 0,
                num_empenos_dia: empenos,
                num_pagos_dia: pagos,
            }
        })
    )

    return cajasConResumen
}

/**
 * Obtiene resumen consolidado de todas las cajas activas
 */
export async function obtenerResumenConsolidado(): Promise<ResumenConsolidado> {
    const cajas = await obtenerCajasActivas()

    return {
        total_cajas_abiertas: cajas.length,
        total_efectivo_cajas: cajas.reduce((sum, c) => sum + c.saldo_actual, 0),
        total_transacciones_hoy: cajas.reduce((sum, c) => sum + c.num_transacciones_dia, 0),
        total_empenos_hoy: cajas.reduce((sum, c) => sum + c.num_empenos_dia, 0),
        total_pagos_hoy: cajas.reduce((sum, c) => sum + c.num_pagos_dia, 0),
    }
}
