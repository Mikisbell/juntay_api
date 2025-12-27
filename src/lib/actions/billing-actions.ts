'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================
// TYPES
// ============================================================

export interface FacturaSaas {
    id: string
    numero: string
    created_at: string
    empresa_id: string
    periodo_inicio: string
    periodo_fin: string
    plan_id: string | null
    plan_nombre: string | null
    subtotal: number
    descuento: number
    impuestos: number
    total: number
    moneda: string
    estado: FacturaEstado
    fecha_emision: string
    fecha_vencimiento: string
    fecha_pago: string | null
    metodo_pago: string | null
    referencia_pago: string | null
    items: FacturaItem[]
    notas: string | null
    empresa?: {
        nombre_comercial: string
        razon_social: string
        ruc: string | null
    }
}

export type FacturaEstado = 'borrador' | 'pendiente' | 'pagada' | 'vencida' | 'cancelada'

export interface FacturaItem {
    concepto: string
    descripcion?: string
    cantidad: number
    precio_unitario: number
    total: number
}

export interface CreateFacturaInput {
    empresaId: string
    periodoInicio: string
    periodoFin: string
    planId?: string
    planNombre?: string
    items: FacturaItem[]
    fechaVencimiento: string
    notas?: string
    descuento?: number
}

export interface BillingResumen {
    ingresosMes: number
    ingresosMesAnterior: number
    facturasPendientes: number
    facturasVencidas: number
    mrrActual: number
    empresasPagadas: number
    empresasPendientes: number
}

// ============================================================
// HELPERS
// ============================================================

async function generarNumeroFactura(): Promise<string> {
    const supabase = createAdminClient()
    const year = new Date().getFullYear()

    // Get count for this year
    const { count } = await supabase
        .from('facturas_saas')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${year}-01-01`)

    const sequence = (count || 0) + 1
    return `INV-${year}-${String(sequence).padStart(5, '0')}`
}

// ============================================================
// CREATE INVOICE
// ============================================================

/**
 * Crear nueva factura SaaS
 */
export async function crearFactura(input: CreateFacturaInput): Promise<{
    success: boolean
    facturaId?: string
    numero?: string
    error?: string
}> {
    const supabase = createAdminClient()

    // Generate invoice number
    const numero = await generarNumeroFactura()

    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => sum + item.total, 0)
    const descuento = input.descuento || 0
    const impuestos = 0 // No IGV for SaaS services typically
    const total = subtotal - descuento + impuestos

    const { data, error } = await supabase
        .from('facturas_saas')
        .insert({
            numero,
            empresa_id: input.empresaId,
            periodo_inicio: input.periodoInicio,
            periodo_fin: input.periodoFin,
            plan_id: input.planId || null,
            plan_nombre: input.planNombre || null,
            subtotal,
            descuento,
            impuestos,
            total,
            estado: 'pendiente',
            fecha_vencimiento: input.fechaVencimiento,
            items: input.items,
            notas: input.notas || null
        })
        .select('id, numero')
        .single()

    if (error) {
        console.error('[Billing] Error creating invoice:', error)
        return { success: false, error: error.message }
    }

    return { success: true, facturaId: data.id, numero: data.numero }
}

/**
 * Generar factura mensual automática para una empresa
 */
export async function generarFacturaMensual(empresaId: string): Promise<{
    success: boolean
    facturaId?: string
    error?: string
}> {
    const supabase = createAdminClient()

    // Get empresa with plan
    const { data: empresa, error: empError } = await supabase
        .from('empresas')
        .select('*, plan:planes_suscripcion(*)')
        .eq('id', empresaId)
        .single()

    if (empError || !empresa) {
        return { success: false, error: 'Empresa no encontrada' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plan = (empresa as any).plan
    if (!plan) {
        return { success: false, error: 'Empresa sin plan asignado' }
    }

    // Calculate period (current month)
    const now = new Date()
    const periodoInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const periodoFin = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    // Due date: 15 days from now
    const fechaVencimiento = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const items: FacturaItem[] = [
        {
            concepto: `Plan ${plan.nombre} - ${now.toLocaleString('es', { month: 'long', year: 'numeric' })}`,
            cantidad: 1,
            precio_unitario: plan.precio_mensual || 99,
            total: plan.precio_mensual || 99
        }
    ]

    return crearFactura({
        empresaId,
        periodoInicio,
        periodoFin,
        planId: plan.id,
        planNombre: plan.nombre,
        items,
        fechaVencimiento
    })
}

// ============================================================
// LIST INVOICES
// ============================================================

/**
 * Listar facturas con filtros
 */
export async function listarFacturas(filters: {
    empresaId?: string
    estado?: FacturaEstado
    limit?: number
} = {}): Promise<FacturaSaas[]> {
    const supabase = await createClient()

    let query = supabase
        .from('facturas_saas')
        .select(`
            *,
            empresa:empresas(nombre_comercial, razon_social, ruc)
        `)
        .order('created_at', { ascending: false })

    if (filters.empresaId) {
        query = query.eq('empresa_id', filters.empresaId)
    }
    if (filters.estado) {
        query = query.eq('estado', filters.estado)
    }

    const limit = filters.limit || 50
    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
        console.error('[Billing] Error listing invoices:', error)
        return []
    }

    return data as FacturaSaas[]
}

/**
 * Obtener factura por ID
 */
export async function obtenerFactura(facturaId: string): Promise<FacturaSaas | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('facturas_saas')
        .select(`
            *,
            empresa:empresas(nombre_comercial, razon_social, ruc, email, direccion)
        `)
        .eq('id', facturaId)
        .single()

    if (error) {
        console.error('[Billing] Error fetching invoice:', error)
        return null
    }

    return data as FacturaSaas
}

// ============================================================
// UPDATE INVOICE STATUS
// ============================================================

/**
 * Marcar factura como pagada
 */
export async function marcarFacturaPagada(
    facturaId: string,
    metodoPago: string,
    referenciaPago: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('facturas_saas')
        .update({
            estado: 'pagada',
            fecha_pago: new Date().toISOString(),
            metodo_pago: metodoPago,
            referencia_pago: referenciaPago
        })
        .eq('id', facturaId)

    if (error) {
        console.error('[Billing] Error marking as paid:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

/**
 * Cancelar factura
 */
export async function cancelarFactura(facturaId: string, motivo?: string): Promise<{ success: boolean }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('facturas_saas')
        .update({
            estado: 'cancelada',
            notas: motivo ? `CANCELADA: ${motivo}` : 'CANCELADA'
        })
        .eq('id', facturaId)

    if (error) {
        console.error('[Billing] Error cancelling invoice:', error)
        return { success: false }
    }

    return { success: true }
}

/**
 * Actualizar facturas vencidas
 */
export async function actualizarFacturasVencidas(): Promise<{ actualizadas: number }> {
    const supabase = createAdminClient()

    const hoy = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('facturas_saas')
        .update({ estado: 'vencida' })
        .eq('estado', 'pendiente')
        .lt('fecha_vencimiento', hoy)
        .select('id')

    if (error) {
        console.error('[Billing] Error updating overdue invoices:', error)
        return { actualizadas: 0 }
    }

    return { actualizadas: data?.length || 0 }
}

// ============================================================
// BILLING ANALYTICS
// ============================================================

/**
 * Obtener resumen de facturación
 */
export async function obtenerResumenBilling(): Promise<BillingResumen> {
    const supabase = await createClient()

    const now = new Date()
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

    // Income this month
    const { data: facturasMes } = await supabase
        .from('facturas_saas')
        .select('total, estado')
        .gte('fecha_pago', inicioMes)
        .eq('estado', 'pagada')

    const ingresosMes = facturasMes?.reduce((sum, f) => sum + (f.total || 0), 0) || 0

    // Income last month
    const { data: facturasMesAnterior } = await supabase
        .from('facturas_saas')
        .select('total')
        .gte('fecha_pago', inicioMesAnterior)
        .lt('fecha_pago', finMesAnterior)
        .eq('estado', 'pagada')

    const ingresosMesAnterior = facturasMesAnterior?.reduce((sum, f) => sum + (f.total || 0), 0) || 0

    // Pending invoices
    const { count: facturasPendientes } = await supabase
        .from('facturas_saas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')

    // Overdue invoices
    const { count: facturasVencidas } = await supabase
        .from('facturas_saas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'vencida')

    // MRR calculation (active subscriptions)
    const { data: empresasConPlan } = await supabase
        .from('empresas')
        .select('plan:planes_suscripcion(precio_mensual)')
        .eq('activo', true)
        .not('plan_id', 'is', null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mrrActual = empresasConPlan?.reduce((sum, e) => sum + ((e as any).plan?.precio_mensual || 0), 0) || 0

    // Empresas by payment status
    const { count: empresasPagadas } = await supabase
        .from('facturas_saas')
        .select('empresa_id', { count: 'exact', head: true })
        .eq('estado', 'pagada')
        .gte('periodo_fin', inicioMes)

    const { count: empresasPendientesCount } = await supabase
        .from('facturas_saas')
        .select('empresa_id', { count: 'exact', head: true })
        .in('estado', ['pendiente', 'vencida'])

    return {
        ingresosMes,
        ingresosMesAnterior,
        facturasPendientes: facturasPendientes || 0,
        facturasVencidas: facturasVencidas || 0,
        mrrActual,
        empresasPagadas: empresasPagadas || 0,
        empresasPendientes: empresasPendientesCount || 0
    }
}

/**
 * Obtener ingresos por mes (últimos 12 meses)
 */
export async function obtenerIngresosPorMes(): Promise<Array<{
    mes: string
    ingresos: number
    facturas: number
}>> {
    const supabase = await createClient()

    const resultados: Array<{ mes: string; ingresos: number; facturas: number }> = []

    for (let i = 11; i >= 0; i--) {
        const fecha = new Date()
        fecha.setMonth(fecha.getMonth() - i)

        const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
        const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)

        const { data } = await supabase
            .from('facturas_saas')
            .select('total')
            .eq('estado', 'pagada')
            .gte('fecha_pago', inicioMes.toISOString())
            .lte('fecha_pago', finMes.toISOString())

        resultados.push({
            mes: inicioMes.toLocaleString('es', { month: 'short', year: '2-digit' }),
            ingresos: data?.reduce((sum, f) => sum + (f.total || 0), 0) || 0,
            facturas: data?.length || 0
        })
    }

    return resultados
}
