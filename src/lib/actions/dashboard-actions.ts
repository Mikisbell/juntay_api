'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Obtener contratos que vencen hoy o están vencidos
 * Para el panel de alertas del Dashboard
 */
export async function obtenerContratosUrgentes() {
    const supabase = await createClient()

    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59).toISOString()

    // Contratos que vencen hoy
    const { data: vencenHoy, error: errorHoy } = await supabase
        .from('creditos')
        .select(`
            id,
            codigo_credito,
            monto_prestado,
            saldo_pendiente,
            fecha_vencimiento,
            estado_detallado,
            cliente_id,
            clientes!inner(
                id,
                nombres,
                apellido_paterno,
                telefono_principal
            )
        `)
        .gte('fecha_vencimiento', inicioHoy)
        .lte('fecha_vencimiento', finHoy)
        .in('estado_detallado', ['vigente', 'por_vencer'])
        .order('fecha_vencimiento', { ascending: true })
        .limit(10)

    if (errorHoy) {
        console.error('[obtenerContratosUrgentes] Error vencen hoy:', errorHoy)
    }

    // Contratos vencidos (mora)
    const { data: vencidos, error: errorVencidos } = await supabase
        .from('creditos')
        .select(`
            id,
            codigo_credito,
            monto_prestado,
            saldo_pendiente,
            fecha_vencimiento,
            estado_detallado,
            cliente_id,
            clientes!inner(
                id,
                nombres,
                apellido_paterno,
                telefono_principal
            )
        `)
        .lt('fecha_vencimiento', inicioHoy)
        .in('estado_detallado', ['vencido', 'en_mora'])
        .order('fecha_vencimiento', { ascending: true })
        .limit(10)

    if (errorVencidos) {
        console.error('[obtenerContratosUrgentes] Error vencidos:', errorVencidos)
    }

    return {
        vencenHoy: vencenHoy || [],
        vencidos: vencidos || [],
        totalUrgentes: (vencenHoy?.length || 0) + (vencidos?.length || 0)
    }
}

/**
 * Resumen diario para el Dashboard
 */
export async function obtenerResumenDiario() {
    const supabase = await createClient()

    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59).toISOString()

    // Créditos otorgados hoy
    const { count: creditosHoy } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', inicioHoy)
        .lte('created_at', finHoy)

    // Pagos recibidos hoy
    const { data: pagosHoy } = await supabase
        .from('pagos')
        .select('monto')
        .gte('fecha_pago', inicioHoy)
        .lte('fecha_pago', finHoy)

    const montoPagosHoy = pagosHoy?.reduce((acc, p) => acc + Number(p.monto || 0), 0) || 0

    // Contratos que vencen hoy
    const { count: vencenHoy } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_vencimiento', inicioHoy)
        .lte('fecha_vencimiento', finHoy)
        .in('estado_detallado', ['vigente', 'por_vencer'])

    // Contratos en mora
    const { count: enMora } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .in('estado_detallado', ['vencido', 'en_mora'])

    return {
        creditosHoy: creditosHoy || 0,
        pagosHoy: pagosHoy?.length || 0,
        montoPagosHoy,
        vencenHoy: vencenHoy || 0,
        enMora: enMora || 0
    }
}
