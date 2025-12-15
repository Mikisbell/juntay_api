'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type InventarioItem = {
    id: string
    descripcion: string
    estado: string
    estadoAnterior?: string
    valor_tasacion: number
    fotos?: string[]
    cliente: {
        nombres: string
        apellido_paterno: string
    } | null
    contrato: {
        codigo: string
        fecha_vencimiento: string
        monto_prestado: number
    } | null
    ultimoCambio?: {
        fecha: string
        usuario: string
        estadoAnterior: string
    }
}

// Estados válidos y transiciones permitidas
const TRANSICIONES_VALIDAS: Record<string, string[]> = {
    'custodia_caja': ['en_transito', 'custodia_boveda', 'devuelta'],
    'en_transito': ['custodia_caja', 'custodia_boveda'],
    'custodia_boveda': ['en_transito', 'custodia_caja', 'en_remate'],
    'en_remate': ['vendida', 'custodia_boveda'],
    'vendida': [], // Estado final
    'devuelta': [] // Estado final
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
            fotos,
            cliente:clientes(nombres, apellido_paterno),
            contrato:creditos(codigo_credito, fecha_vencimiento, monto_prestado)
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
        id: item.id,
        descripcion: item.descripcion,
        estado: item.estado,
        valor_tasacion: item.valor_tasacion,
        fotos: item.fotos || [],
        cliente: item.cliente,
        contrato: Array.isArray(item.contrato) ? item.contrato[0] : item.contrato
    }))
}

/**
 * Cambiar estado de garantía con validación y log de auditoría
 */
export async function cambiarEstadoGarantia(
    id: string,
    nuevoEstado: string,
    motivo?: string
) {
    const supabase = await createClient()

    // 1. Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // 2. Obtener estado actual de la garantía
    const { data: garantia, error: errorGarantia } = await supabase
        .from('garantias')
        .select('id, estado, descripcion, credito_id')
        .eq('id', id)
        .single()

    if (errorGarantia || !garantia) {
        return { success: false, error: 'Garantía no encontrada' }
    }

    const estadoActual = garantia.estado

    // 3. Validar transición permitida
    const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual] || []
    if (!transicionesPermitidas.includes(nuevoEstado)) {
        return {
            success: false,
            error: `Transición no permitida: ${estadoActual} → ${nuevoEstado}. Transiciones válidas: ${transicionesPermitidas.join(', ') || 'ninguna'}`
        }
    }

    // 4. Actualizar estado
    const { error: errorUpdate } = await supabase
        .from('garantias')
        .update({
            estado: nuevoEstado,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (errorUpdate) {
        return { success: false, error: errorUpdate.message }
    }

    // 5. Registrar en log de auditoría
    const { error: errorLog } = await supabase
        .from('audit_log')
        .insert({
            tabla: 'garantias',
            registro_id: id,
            accion: 'CAMBIO_ESTADO',
            usuario_id: user.id,
            datos_anteriores: { estado: estadoActual },
            datos_nuevos: { estado: nuevoEstado },
            metadata: {
                descripcion: garantia.descripcion,
                credito_id: garantia.credito_id,
                motivo: motivo || 'Sin especificar',
                ip: 'server-action'
            }
        })

    if (errorLog) {
        // No fallamos por error de log, pero lo reportamos
        console.error('Error registrando auditoría:', errorLog)
    }

    revalidatePath('/dashboard/inventario')

    return {
        success: true,
        mensaje: `Estado actualizado: ${estadoActual} → ${nuevoEstado}`,
        estadoAnterior: estadoActual,
        nuevoEstado
    }
}

/**
 * Obtener historial de cambios de una garantía
 */
export async function obtenerHistorialGarantia(garantiaId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('audit_log')
        .select(`
            id,
            accion,
            datos_anteriores,
            datos_nuevos,
            metadata,
            created_at,
            usuario:usuarios(nombres, apellido_paterno)
        `)
        .eq('tabla', 'garantias')
        .eq('registro_id', garantiaId)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error obteniendo historial:', error)
        return []
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data?.map((log: any) => {
        const usuario = Array.isArray(log.usuario) ? log.usuario[0] : log.usuario
        return {
            id: log.id,
            fecha: log.created_at,
            accion: log.accion,
            estadoAnterior: log.datos_anteriores?.estado,
            estadoNuevo: log.datos_nuevos?.estado,
            motivo: log.metadata?.motivo,
            usuario: usuario
                ? `${usuario.nombres} ${usuario.apellido_paterno}`
                : 'Sistema'
        }
    }) || []
}

/**
 * Obtener conteo por estado para KPIs
 */
export async function obtenerConteoEstados() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('garantias')
        .select('estado')

    if (error) return {}

    const conteo: Record<string, number> = {}
    data?.forEach(g => {
        conteo[g.estado] = (conteo[g.estado] || 0) + 1
    })

    return conteo
}
