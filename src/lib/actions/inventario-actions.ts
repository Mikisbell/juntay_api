'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type InventarioItem = {
    id: string
    descripcion: string
    estado: string
    valor_tasacion: number
    cliente: {
        nombres: string
        apellido_paterno: string
    } | null
    contrato: {
        codigo: string
        fecha_vencimiento: string
        monto_prestado: number
    } | null
}

export async function obtenerInventario(filtroEstado?: string): Promise<InventarioItem[]> {
    const supabase = await createClient()

    let query = supabase
        .from('garantias')
        .select(`
      id,
      descripcion,
      estado,
      valor_tasacion,
      cliente:clientes(nombres, apellido_paterno),
      contrato:creditos(codigo, fecha_vencimiento, monto_prestado)
    `)
        .order('created_at', { ascending: false })

    if (filtroEstado && filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching inventory:', error)
        return []
    }

    // Transform data to match type (handling arrays from joins if necessary, though these should be 1:1 or N:1)
    return data.map((item: any) => ({
        id: item.id,
        descripcion: item.descripcion,
        estado: item.estado,
        valor_tasacion: item.valor_tasacion,
        cliente: item.cliente,
        // creditos might return an array if not careful, but usually 1 warranty -> 1 active credit. 
        // For simplicity in this v3 schema, we assume the latest credit or single credit relationship.
        // If the relationship in DB is 1:N, we might get an array. 
        // Let's assume for now we take the first one if it's an array, or it's an object.
        contrato: Array.isArray(item.contrato) ? item.contrato[0] : item.contrato
    }))
}

export async function cambiarEstadoGarantia(id: string, nuevoEstado: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('garantias')
        .update({ estado: nuevoEstado })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true }
}
