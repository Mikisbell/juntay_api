'use server'

import { createClient } from '@/lib/supabase/server'
import { EstadoCredito, Credito, ResumenEstados } from '../types/credito'

/**
 * Obtiene todos los créditos filtrados por estado
 */
export async function obtenerCreditosPorEstado(estado: EstadoCredito): Promise<Credito[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select(`
      *,
      clientes (
        nombres,
        numero_documento
      ),
      garantias (
        descripcion,
        valor_tasacion
      )
    `)
        .eq('estado_detallado', estado)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error obteniendo créditos por estado:', error)
        throw new Error('Error al obtener créditos')
    }

    return data as Credito[]
}

/**
 * Obtiene el conteo de créditos por cada estado
 */
export async function obtenerResumenEstados(): Promise<ResumenEstados> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select('estado_detallado')

    if (error) {
        console.error('Error obteniendo resumen de estados:', error)
        throw new Error('Error al obtener resumen')
    }

    // Inicializar conteos
    const resumen: ResumenEstados = {
        vigente: 0,
        al_dia: 0,
        por_vencer: 0,
        vencido: 0,
        en_mora: 0,
        en_gracia: 0,
        pre_remate: 0,
        en_remate: 0,
        cancelado: 0,
        renovado: 0,
        ejecutado: 0,
        anulado: 0,
        total: data.length
    }

    // Contar por estado
    data.forEach(credito => {
        const estado = credito.estado_detallado as keyof ResumenEstados
        if (estado in resumen) {
            resumen[estado]++
        }
    })

    return resumen
}

/**
 * Obtiene un crédito específico por ID
 */
export async function obtenerCreditoPorId(id: string): Promise<Credito | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select(`
      *,
      clientes (*),
      garantias (*),
      cajas_operativas (numero_caja)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error obteniendo crédito:', error)
        return null
    }

    return data as Credito
}

/**
 * Obtiene todos los créditos (con paginación opcional)
 */
export async function obtenerTodosCreditos(
    limit: number = 50,
    offset: number = 0
): Promise<Credito[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select(`
      *,
      clientes (
        nombres,
        numero_documento
      ),
      garantias (
        descripcion,
        valor_tasacion
      )
    `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error obteniendo créditos:', error)
        throw new Error('Error al obtener créditos')
    }

    return data as Credito[]
}

/**
 * Actualiza el estado de un crédito manualmente
 * (útil para casos especiales)
 */
export async function actualizarEstadoCredito(
    creditoId: string,
    nuevoEstado: EstadoCredito
): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('creditos')
        .update({ estado_detallado: nuevoEstado })
        .eq('id', creditoId)

    if (error) {
        console.error('Error actualizando estado:', error)
        return false
    }

    return true
}
