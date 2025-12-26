'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Factura
 */
export interface Factura {
    id: string
    numero: string
    empresa_id: string
    suscripcion_id: string | null
    subtotal: number
    igv: number
    total: number
    moneda: string
    estado: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
    fecha_emision: string
    fecha_vencimiento: string | null
    fecha_pago: string | null
    pdf_url: string | null
    concepto: string
    notas: string | null
}

/**
 * Obtener facturas de la empresa
 */
export async function obtenerFacturas(limit: number = 10): Promise<Factura[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!usuario?.empresa_id) return []

    const { data, error } = await supabase
        .from('facturas')
        .select('*')
        .eq('empresa_id', usuario.empresa_id)
        .order('fecha_emision', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error obteniendo facturas:', error)
        return []
    }

    return data
}

/**
 * Obtener una factura por ID
 */
export async function obtenerFacturaPorId(facturaId: string): Promise<Factura | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', facturaId)
        .single()

    if (error) {
        console.error('Error obteniendo factura:', error)
        return null
    }

    return data
}

/**
 * Crear factura manual (para pago registrado)
 */
export async function crearFactura(datos: {
    empresaId: string
    suscripcionId?: string
    subtotal: number
    concepto: string
    notas?: string
}): Promise<{
    success: boolean
    error?: string
    factura?: Factura
}> {
    const supabase = await createClient()

    // Calcular IGV (18% en Perú)
    const igv = datos.subtotal * 0.18
    const total = datos.subtotal + igv

    // Fecha de vencimiento: 15 días
    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 15)

    const { data, error } = await supabase
        .from('facturas')
        .insert({
            empresa_id: datos.empresaId,
            suscripcion_id: datos.suscripcionId,
            subtotal: datos.subtotal,
            igv: igv,
            total: total,
            concepto: datos.concepto,
            notas: datos.notas,
            fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
            estado: 'pending'
        })
        .select()
        .single()

    if (error) {
        console.error('Error creando factura:', error)
        return { success: false, error: error.message }
    }

    return { success: true, factura: data }
}

/**
 * Marcar factura como pagada
 */
export async function marcarFacturaPagada(facturaId: string): Promise<{
    success: boolean
    error?: string
}> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('facturas')
        .update({
            estado: 'paid',
            fecha_pago: new Date().toISOString()
        })
        .eq('id', facturaId)

    if (error) {
        console.error('Error marcando factura:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

/**
 * Obtener resumen de facturación
 */
export async function obtenerResumenFacturacion(): Promise<{
    totalPagado: number
    facturasPendientes: number
    ultimaFactura: Factura | null
}> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { totalPagado: 0, facturasPendientes: 0, ultimaFactura: null }
    }

    const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!usuario?.empresa_id) {
        return { totalPagado: 0, facturasPendientes: 0, ultimaFactura: null }
    }

    // Total pagado
    const { data: pagadas } = await supabase
        .from('facturas')
        .select('total')
        .eq('empresa_id', usuario.empresa_id)
        .eq('estado', 'paid')

    const totalPagado = pagadas?.reduce((sum, f) => sum + (f.total || 0), 0) || 0

    // Facturas pendientes
    const { count: facturasPendientes } = await supabase
        .from('facturas')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', usuario.empresa_id)
        .eq('estado', 'pending')

    // Última factura
    const { data: ultimaFactura } = await supabase
        .from('facturas')
        .select('*')
        .eq('empresa_id', usuario.empresa_id)
        .order('fecha_emision', { ascending: false })
        .limit(1)
        .single()

    return {
        totalPagado,
        facturasPendientes: facturasPendientes || 0,
        ultimaFactura
    }
}
