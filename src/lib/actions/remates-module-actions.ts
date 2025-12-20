'use server'

/**
 * Módulo de Remates
 * 
 * - Catálogo de artículos a rematar
 * - Precio mínimo de venta
 * - Registro de ventas
 * - Cálculo de utilidad
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ TYPES ============

export type EstadoRemate = 'disponible' | 'reservado' | 'vendido' | 'retirado'

export interface ArticuloRemate {
    id: string
    inventarioId: string
    descripcion: string
    categoria: string
    precioMinimo: number
    precioSugerido: number
    valorOriginal: number  // Valor del empeño original
    estado: EstadoRemate
    diasEnRemate: number
    fotos: string[]
    creditoCodigo?: string
    fechaRemate: string
}

export interface VentaRemate {
    id: string
    articuloId: string
    precioVenta: number
    comprador?: string
    compradorTelefono?: string
    metodoPago: string
    vendedorId: string
    vendedorNombre: string
    fechaVenta: string
    utilidad: number
}

export interface ResumenRemates {
    totalDisponibles: number
    valorTotalInventario: number
    ventasDelMes: number
    utilidadDelMes: number
}

// ============ CATÁLOGO ============

/**
 * Obtiene artículos disponibles para remate
 */
export async function obtenerArticulosRemate(
    filtros?: { categoria?: string; estado?: EstadoRemate }
): Promise<ArticuloRemate[]> {
    const supabase = await createClient()

    // Artículos con créditos vencidos que pasaron a remate
    let query = supabase
        .from('inventario')
        .select(`
            id,
            descripcion,
            categoria,
            valor_tasado,
            estado,
            metadata,
            created_at,
            creditos(codigo, estado, fecha_vencimiento)
        `)
        .eq('para_remate', true)
        .order('created_at', { ascending: false })

    if (filtros?.categoria) {
        query = query.eq('categoria', filtros.categoria)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error obteniendo remates:', error)
        return []
    }

    const articulos: ArticuloRemate[] = []

    for (const item of (data || [])) {
        const metadata = (item.metadata || {}) as Record<string, unknown>
        const credito = item.creditos as unknown as {
            codigo: string;
            estado: string;
            fecha_vencimiento: string
        } | null

        const fechaRemate = metadata.fecha_remate as string || item.created_at
        const diasEnRemate = Math.floor(
            (Date.now() - new Date(fechaRemate).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Calcular precio sugerido (valor tasado + margen)
        const valorTasado = item.valor_tasado || 0
        const precioMinimo = metadata.precio_minimo as number || Math.round(valorTasado * 0.8)
        const precioSugerido = metadata.precio_sugerido as number || Math.round(valorTasado * 1.2)

        let estado: EstadoRemate = 'disponible'
        if (metadata.estado_remate) {
            estado = metadata.estado_remate as EstadoRemate
        }

        if (filtros?.estado && estado !== filtros.estado) {
            continue
        }

        articulos.push({
            id: item.id,
            inventarioId: item.id,
            descripcion: item.descripcion,
            categoria: item.categoria || 'otros',
            precioMinimo,
            precioSugerido,
            valorOriginal: valorTasado,
            estado,
            diasEnRemate,
            fotos: (metadata.fotos as Array<{ url: string }> || []).map(f => f.url),
            creditoCodigo: credito?.codigo,
            fechaRemate
        })
    }

    return articulos
}

/**
 * Marca un artículo para remate
 */
export async function marcarParaRemate(
    articuloId: string,
    params: { precioMinimo: number; precioSugerido?: number }
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: articulo } = await supabase
        .from('inventario')
        .select('metadata, valor_tasado')
        .eq('id', articuloId)
        .single()

    const metadata = (articulo?.metadata || {}) as Record<string, unknown>

    const { error } = await supabase
        .from('inventario')
        .update({
            para_remate: true,
            metadata: {
                ...metadata,
                fecha_remate: new Date().toISOString(),
                precio_minimo: params.precioMinimo,
                precio_sugerido: params.precioSugerido || Math.round(params.precioMinimo * 1.5),
                estado_remate: 'disponible'
            }
        })
        .eq('id', articuloId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/remates')
    return { success: true }
}

// ============ VENTAS ============

/**
 * Registra una venta de remate
 */
export async function registrarVentaRemate(params: {
    articuloId: string
    precioVenta: number
    comprador?: string
    compradorTelefono?: string
    metodoPago: string
    vendedorId: string
}): Promise<{ success: boolean; ventaId?: string; utilidad?: number; error?: string }> {
    const supabase = await createClient()

    // Obtener datos del artículo
    const { data: articulo } = await supabase
        .from('inventario')
        .select('valor_tasado, metadata')
        .eq('id', params.articuloId)
        .single()

    if (!articulo) {
        return { success: false, error: 'Artículo no encontrado' }
    }

    const valorOriginal = articulo.valor_tasado || 0
    const utilidad = params.precioVenta - valorOriginal

    // Registrar venta
    const { data: venta, error: ventaError } = await supabase
        .from('ventas_remates')
        .insert({
            articulo_id: params.articuloId,
            precio_venta: params.precioVenta,
            comprador: params.comprador,
            comprador_telefono: params.compradorTelefono,
            metodo_pago: params.metodoPago,
            vendedor_id: params.vendedorId,
            utilidad,
            valor_original: valorOriginal
        })
        .select('id')
        .single()

    if (ventaError) {
        console.error('Error registrando venta:', ventaError)
        return { success: false, error: ventaError.message }
    }

    // Actualizar estado del artículo
    const metadata = (articulo.metadata || {}) as Record<string, unknown>
    await supabase
        .from('inventario')
        .update({
            metadata: {
                ...metadata,
                estado_remate: 'vendido',
                venta_id: venta.id,
                fecha_venta: new Date().toISOString()
            }
        })
        .eq('id', params.articuloId)

    revalidatePath('/dashboard/remates')
    return { success: true, ventaId: venta.id, utilidad }
}

/**
 * Obtiene historial de ventas de remates
 */
export async function obtenerVentasRemates(
    filtros?: { desde?: string; hasta?: string }
): Promise<VentaRemate[]> {
    const supabase = await createClient()

    let query = supabase
        .from('ventas_remates')
        .select(`
            id,
            articulo_id,
            precio_venta,
            comprador,
            comprador_telefono,
            metodo_pago,
            vendedor_id,
            utilidad,
            created_at,
            empleados(nombres, apellido_paterno)
        `)
        .order('created_at', { ascending: false })

    if (filtros?.desde) {
        query = query.gte('created_at', filtros.desde)
    }
    if (filtros?.hasta) {
        query = query.lte('created_at', filtros.hasta)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error obteniendo ventas:', error)
        return []
    }

    return (data || []).map(v => {
        const empleado = v.empleados as unknown as { nombres: string; apellido_paterno: string } | null
        return {
            id: v.id,
            articuloId: v.articulo_id,
            precioVenta: v.precio_venta,
            comprador: v.comprador,
            compradorTelefono: v.comprador_telefono,
            metodoPago: v.metodo_pago,
            vendedorId: v.vendedor_id,
            vendedorNombre: empleado ? `${empleado.nombres} ${empleado.apellido_paterno}` : 'N/A',
            fechaVenta: v.created_at,
            utilidad: v.utilidad
        }
    })
}

// ============ RESUMEN ============

/**
 * Obtiene resumen del módulo de remates
 */
export async function obtenerResumenRemates(): Promise<ResumenRemates> {
    const supabase = await createClient()
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    // Artículos disponibles
    const { data: disponibles } = await supabase
        .from('inventario')
        .select('valor_tasado')
        .eq('para_remate', true)

    const totalDisponibles = (disponibles || []).length
    const valorTotalInventario = (disponibles || []).reduce((sum, a) => sum + (a.valor_tasado || 0), 0)

    // Ventas del mes
    const { data: ventas } = await supabase
        .from('ventas_remates')
        .select('precio_venta, utilidad')
        .gte('created_at', inicioMes.toISOString())

    const ventasDelMes = (ventas || []).reduce((sum, v) => sum + (v.precio_venta || 0), 0)
    const utilidadDelMes = (ventas || []).reduce((sum, v) => sum + (v.utilidad || 0), 0)

    return {
        totalDisponibles,
        valorTotalInventario,
        ventasDelMes,
        utilidadDelMes
    }
}
