'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Registra una categoría/subcategoría/marca personalizada cuando el usuario usa "Otro"
 * Esto permite detectar nuevas categorías frecuentes para agregar al catálogo
 */
export async function registrarCategoriaOtro(
    tipo: 'categoria' | 'subcategoria' | 'marca',
    texto: string
) {
    if (!texto || texto.trim().length < 2) return { success: false }

    const supabase = await createClient()

    const { error } = await supabase.rpc('registrar_categoria_otro', {
        p_tipo: tipo,
        p_texto: texto.trim()
    })

    if (error) {
        console.error('[registrarCategoriaOtro] Error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

/**
 * Obtiene las categorías sugeridas pendientes de promoción
 * Para uso en dashboard de admin
 */
export async function obtenerCategoriasSugeridas() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('categorias_pendientes_promocion')
        .select('*')
        .order('prioridad_orden', { ascending: true })
        .order('veces_usado', { ascending: false })
        .limit(50)

    if (error) {
        console.error('[obtenerCategoriasSugeridas] Error:', error)
        return []
    }

    return data
}

/**
 * Promociona una categoría sugerida al catálogo oficial
 */
export async function promoverCategoriaSugerida(
    id: number,
    promovidoA: string
) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('promover_categoria_sugerida', {
        p_id: id,
        p_promovido_a: promovidoA
    })

    if (error) {
        console.error('[promoverCategoriaSugerida] Error:', error)
        return { success: false, error: error.message }
    }

    return { success: data }
}
