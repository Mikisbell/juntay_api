'use server'

import { createClient } from '@/lib/supabase/server'

export async function obtenerCajaDiaria(fecha?: string) {
    const supabase = await createClient()
    const fechaFiltro = fecha || new Date().toISOString().split('T')[0]

    const { data: movimientos } = await supabase
        .from('movimientos_caja_operativa')
        .select('tipo, monto, motivo')
        .gte('fecha', `${fechaFiltro} 00:00:00`)
        .lte('fecha', `${fechaFiltro} 23:59:59`)

    const ingresos = movimientos?.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.monto, 0) || 0
    const egresos = movimientos?.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.monto, 0) || 0

    return {
        fecha: fechaFiltro,
        ingresos,
        egresos,
        neto: ingresos - egresos,
        movimientos: movimientos || []
    }
}

export async function obtenerCartera() {
    const supabase = await createClient()

    const { data: creditos } = await supabase
        .from('creditos')
        .select('estado, saldo_pendiente, monto_prestado')

    const stats = {
        vigentes: creditos?.filter(c => c.estado === 'vigente').length || 0,
        vencidos: creditos?.filter(c => c.estado === 'vencido').length || 0,
        cancelados: creditos?.filter(c => c.estado === 'cancelado').length || 0,
        montoVigente: creditos?.filter(c => c.estado === 'vigente').reduce((sum, c) => sum + c.saldo_pendiente, 0) || 0,
        montoTotal: creditos?.reduce((sum, c) => sum + c.monto_prestado, 0) || 0
    }

    return stats
}
