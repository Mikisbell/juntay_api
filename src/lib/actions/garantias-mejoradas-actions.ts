'use server'

/**
 * Gestión de Garantías Mejorada
 * 
 * - Galería de fotos por artículo
 * - Estado del artículo (nuevo/usado/dañado)
 * - Historial de tasaciones
 * - Pre-valoración automática por categoría
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ TYPES ============

export type EstadoArticulo = 'nuevo' | 'buen_estado' | 'usado' | 'danado' | 'para_remate'

export interface FotoGarantia {
    id: string
    url: string
    descripcion?: string
    esPrincipal: boolean
    fechaSubida: string
}

export interface Tasacion {
    id: string
    fecha: string
    valorEstimado: number
    valorOtorgado: number
    tasadorId: string
    tasadorNombre: string
    observaciones?: string
}

export interface GarantiaDetallada {
    id: string
    descripcion: string
    categoria: string
    estado: EstadoArticulo
    fotos: FotoGarantia[]
    tasaciones: Tasacion[]
    valorActual: number
    creditoId?: string
    codigoCredito?: string
}

// ============ PRE-VALORACIÓN POR CATEGORÍA ============

const PRECIOS_BASE_CATEGORIA: Record<string, { min: number; max: number; promedio: number }> = {
    'oro': { min: 100, max: 5000, promedio: 500 },
    'plata': { min: 20, max: 500, promedio: 100 },
    'electrodomesticos': { min: 50, max: 2000, promedio: 300 },
    'electronica': { min: 30, max: 3000, promedio: 400 },
    'celulares': { min: 50, max: 2000, promedio: 300 },
    'laptops': { min: 100, max: 3000, promedio: 500 },
    'televisores': { min: 50, max: 1500, promedio: 300 },
    'herramientas': { min: 20, max: 500, promedio: 100 },
    'vehiculos': { min: 500, max: 20000, promedio: 3000 },
    'joyas': { min: 50, max: 5000, promedio: 300 },
    'ropa': { min: 10, max: 200, promedio: 50 },
    'otros': { min: 10, max: 1000, promedio: 100 }
}

const FACTOR_ESTADO: Record<EstadoArticulo, number> = {
    'nuevo': 1.0,
    'buen_estado': 0.85,
    'usado': 0.65,
    'danado': 0.40,
    'para_remate': 0.25
}

/**
 * Obtiene pre-valoración sugerida basada en categoría y estado
 */
export async function obtenerPreValoracion(
    categoria: string,
    estado: EstadoArticulo
): Promise<{
    valorSugerido: number
    rangoMin: number
    rangoMax: number
    factorEstado: number
}> {
    const catNorm = categoria.toLowerCase().replace(/\s/g, '_')
    const base = PRECIOS_BASE_CATEGORIA[catNorm] || PRECIOS_BASE_CATEGORIA['otros']
    const factor = FACTOR_ESTADO[estado]

    return {
        valorSugerido: Math.round(base.promedio * factor),
        rangoMin: Math.round(base.min * factor),
        rangoMax: Math.round(base.max * factor),
        factorEstado: factor
    }
}

// ============ ESTADO DEL ARTÍCULO ============

/**
 * Actualiza el estado de un artículo de inventario
 */
export async function actualizarEstadoArticulo(
    articuloId: string,
    nuevoEstado: EstadoArticulo,
    observacion?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Obtener estado actual para el historial
    const { data: articulo } = await supabase
        .from('inventario')
        .select('estado, metadata')
        .eq('id', articuloId)
        .single()

    const estadoAnterior = articulo?.estado || 'desconocido'
    const metadata = (articulo?.metadata || {}) as Record<string, unknown>
    const historialEstados = (metadata.historial_estados || []) as Array<{
        fecha: string
        estadoAnterior: string
        estadoNuevo: string
        observacion?: string
    }>

    // Agregar al historial
    historialEstados.push({
        fecha: new Date().toISOString(),
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        observacion
    })

    // Actualizar
    const { error } = await supabase
        .from('inventario')
        .update({
            estado: nuevoEstado,
            metadata: {
                ...metadata,
                historial_estados: historialEstados
            }
        })
        .eq('id', articuloId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true }
}

/**
 * Obtiene el historial de estados de un artículo
 */
export async function obtenerHistorialEstados(articuloId: string): Promise<Array<{
    fecha: string
    estadoAnterior: string
    estadoNuevo: string
    observacion?: string
}>> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('inventario')
        .select('metadata')
        .eq('id', articuloId)
        .single()

    const metadata = (data?.metadata || {}) as Record<string, unknown>
    return (metadata.historial_estados || []) as Array<{
        fecha: string
        estadoAnterior: string
        estadoNuevo: string
        observacion?: string
    }>
}

// ============ GALERÍA DE FOTOS ============

/**
 * Registra una foto en el inventario (la URL viene de storage)
 */
export async function agregarFotoArticulo(
    articuloId: string,
    url: string,
    descripcion?: string,
    esPrincipal: boolean = false
): Promise<{ success: boolean; fotoId?: string; error?: string }> {
    const supabase = await createClient()

    // Obtener fotos actuales
    const { data: articulo } = await supabase
        .from('inventario')
        .select('metadata')
        .eq('id', articuloId)
        .single()

    const metadata = (articulo?.metadata || {}) as Record<string, unknown>
    const fotos = (metadata.fotos || []) as FotoGarantia[]

    // Si es principal, quitar principal de las demás
    if (esPrincipal) {
        for (const f of fotos) {
            f.esPrincipal = false
        }
    }

    // Agregar nueva foto
    const fotoId = `foto_${Date.now()}`
    fotos.push({
        id: fotoId,
        url,
        descripcion,
        esPrincipal: esPrincipal || fotos.length === 0, // Primera foto es principal por defecto
        fechaSubida: new Date().toISOString()
    })

    // Actualizar
    const { error } = await supabase
        .from('inventario')
        .update({
            metadata: {
                ...metadata,
                fotos
            }
        })
        .eq('id', articuloId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true, fotoId }
}

/**
 * Elimina una foto del artículo
 */
export async function eliminarFotoArticulo(
    articuloId: string,
    fotoId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: articulo } = await supabase
        .from('inventario')
        .select('metadata')
        .eq('id', articuloId)
        .single()

    const metadata = (articulo?.metadata || {}) as Record<string, unknown>
    let fotos = (metadata.fotos || []) as FotoGarantia[]

    // Filtrar la foto a eliminar
    const fotoEliminada = fotos.find(f => f.id === fotoId)
    fotos = fotos.filter(f => f.id !== fotoId)

    // Si era principal y quedan fotos, asignar nueva principal
    if (fotoEliminada?.esPrincipal && fotos.length > 0) {
        fotos[0].esPrincipal = true
    }

    const { error } = await supabase
        .from('inventario')
        .update({
            metadata: {
                ...metadata,
                fotos
            }
        })
        .eq('id', articuloId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true }
}

/**
 * Obtiene las fotos de un artículo
 */
export async function obtenerFotosArticulo(articuloId: string): Promise<FotoGarantia[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('inventario')
        .select('metadata')
        .eq('id', articuloId)
        .single()

    const metadata = (data?.metadata || {}) as Record<string, unknown>
    return (metadata.fotos || []) as FotoGarantia[]
}

// ============ HISTORIAL DE TASACIONES ============

/**
 * Registra una tasación
 */
export async function registrarTasacion(params: {
    articuloId: string
    valorEstimado: number
    valorOtorgado: number
    tasadorId: string
    tasadorNombre: string
    observaciones?: string
}): Promise<{ success: boolean; tasacionId?: string; error?: string }> {
    const supabase = await createClient()

    const { data: articulo } = await supabase
        .from('inventario')
        .select('metadata')
        .eq('id', params.articuloId)
        .single()

    const metadata = (articulo?.metadata || {}) as Record<string, unknown>
    const tasaciones = (metadata.tasaciones || []) as Tasacion[]

    const tasacionId = `tas_${Date.now()}`
    tasaciones.push({
        id: tasacionId,
        fecha: new Date().toISOString(),
        valorEstimado: params.valorEstimado,
        valorOtorgado: params.valorOtorgado,
        tasadorId: params.tasadorId,
        tasadorNombre: params.tasadorNombre,
        observaciones: params.observaciones
    })

    const { error } = await supabase
        .from('inventario')
        .update({
            metadata: {
                ...metadata,
                tasaciones
            },
            valor_tasado: params.valorOtorgado // Actualizar valor actual
        })
        .eq('id', params.articuloId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true, tasacionId }
}

/**
 * Obtiene el historial de tasaciones
 */
export async function obtenerHistorialTasaciones(articuloId: string): Promise<Tasacion[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('inventario')
        .select('metadata')
        .eq('id', articuloId)
        .single()

    const metadata = (data?.metadata || {}) as Record<string, unknown>
    return (metadata.tasaciones || []) as Tasacion[]
}

// ============ GARANTÍA DETALLADA ============

/**
 * Obtiene todos los detalles de una garantía
 */
export async function obtenerGarantiaDetallada(articuloId: string): Promise<GarantiaDetallada | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('inventario')
        .select(`
            id,
            descripcion,
            categoria,
            estado,
            valor_tasado,
            metadata,
            creditos(id, codigo)
        `)
        .eq('id', articuloId)
        .single()

    if (error || !data) return null

    const metadata = (data.metadata || {}) as Record<string, unknown>
    const credito = data.creditos as unknown as { id: string; codigo: string } | null

    return {
        id: data.id,
        descripcion: data.descripcion,
        categoria: data.categoria || 'otros',
        estado: (data.estado as EstadoArticulo) || 'usado',
        fotos: (metadata.fotos || []) as FotoGarantia[],
        tasaciones: (metadata.tasaciones || []) as Tasacion[],
        valorActual: data.valor_tasado || 0,
        creditoId: credito?.id,
        codigoCredito: credito?.codigo
    }
}
