'use server'

/**
 * Auditoría Read-Only
 * 
 * Logs verificables y trazabilidad de operaciones.
 * Solo queries, no writes.
 */

import { createClient } from '@/lib/supabase/server'

// ============ TYPES ============

export type TipoEvento = 'pago' | 'recibo' | 'notificacion' | 'credito' | 'caja'

export interface EventoAuditoria {
    id: string
    tipo: TipoEvento
    fecha: string
    usuario: string | null
    descripcion: string
    entidadId: string | null
    entidadTipo: string
    metadata: Record<string, unknown>
    hash?: string
}

export interface AuditoriaResumen {
    eventos: EventoAuditoria[]
    total: number
    pagina: number
    porPagina: number
    filtros: {
        tipo?: TipoEvento
        fechaDesde?: string
        fechaHasta?: string
    }
}

export interface FiltrosAuditoria {
    tipo?: TipoEvento
    fechaDesde?: string
    fechaHasta?: string
    pagina?: number
    porPagina?: number
}

// ============ QUERIES ============

/**
 * Obtiene eventos de auditoría de pagos
 */
async function obtenerEventosPagos(fechaDesde: string, fechaHasta: string): Promise<EventoAuditoria[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('pagos')
        .select(`
            id,
            created_at,
            monto,
            tipo,
            metodo_pago,
            credito_id,
            cajero_id
        `)
        .gte('created_at', `${fechaDesde}T00:00:00`)
        .lte('created_at', `${fechaHasta}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error obteniendo pagos:', error)
        return []
    }

    return (data || []).map(pago => ({
        id: `pago-${pago.id}`,
        tipo: 'pago' as TipoEvento,
        fecha: pago.created_at,
        usuario: pago.cajero_id,
        descripcion: `Pago ${pago.tipo}: S/${pago.monto} (${pago.metodo_pago})`,
        entidadId: pago.credito_id,
        entidadTipo: 'credito',
        metadata: { monto: pago.monto, tipo: pago.tipo, metodo: pago.metodo_pago }
    }))
}

/**
 * Obtiene eventos de auditoría de recibos
 */
async function obtenerEventosRecibos(fechaDesde: string, fechaHasta: string): Promise<EventoAuditoria[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('notificaciones_enviadas')
        .select(`
            id,
            created_at,
            estado,
            telefono_destino,
            enviado_por,
            credito_id,
            metadata
        `)
        .eq('tipo_notificacion', 'RECIBO_PDF')
        .gte('created_at', `${fechaDesde}T00:00:00`)
        .lte('created_at', `${fechaHasta}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error obteniendo recibos:', error)
        return []
    }

    return (data || []).map(recibo => {
        const meta = recibo.metadata as { numero_recibo?: string; qr_hash?: string; monto_pagado?: number } || {}
        return {
            id: `recibo-${recibo.id}`,
            tipo: 'recibo' as TipoEvento,
            fecha: recibo.created_at,
            usuario: recibo.enviado_por,
            descripcion: `Recibo ${meta.numero_recibo || 'N/A'} → ${recibo.telefono_destino} (${recibo.estado})`,
            entidadId: recibo.credito_id,
            entidadTipo: 'credito',
            metadata: meta,
            hash: meta.qr_hash
        }
    })
}

/**
 * Obtiene eventos de auditoría de notificaciones (recordatorios)
 */
async function obtenerEventosNotificaciones(fechaDesde: string, fechaHasta: string): Promise<EventoAuditoria[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('notificaciones_enviadas')
        .select(`
            id,
            created_at,
            tipo_notificacion,
            estado,
            telefono_destino,
            enviado_por,
            credito_id,
            mensaje
        `)
        .neq('tipo_notificacion', 'RECIBO_PDF')
        .gte('created_at', `${fechaDesde}T00:00:00`)
        .lte('created_at', `${fechaHasta}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error obteniendo notificaciones:', error)
        return []
    }

    return (data || []).map(notif => ({
        id: `notif-${notif.id}`,
        tipo: 'notificacion' as TipoEvento,
        fecha: notif.created_at,
        usuario: notif.enviado_por,
        descripcion: `${notif.tipo_notificacion} → ${notif.telefono_destino} (${notif.estado})`,
        entidadId: notif.credito_id,
        entidadTipo: 'credito',
        metadata: { tipo: notif.tipo_notificacion, mensaje: notif.mensaje?.substring(0, 50) }
    }))
}

/**
 * Obtiene eventos de movimientos de caja
 */
async function obtenerEventosCaja(fechaDesde: string, fechaHasta: string): Promise<EventoAuditoria[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('movimientos_caja_operativa')
        .select(`
            id,
            fecha,
            tipo_movimiento,
            monto,
            descripcion,
            usuario_id,
            caja_operativa_id
        `)
        .gte('fecha', `${fechaDesde}T00:00:00`)
        .lte('fecha', `${fechaHasta}T23:59:59`)
        .order('fecha', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error obteniendo movimientos caja:', error)
        return []
    }

    return (data || []).map(mov => ({
        id: `caja-${mov.id}`,
        tipo: 'caja' as TipoEvento,
        fecha: mov.fecha,
        usuario: mov.usuario_id,
        descripcion: `${mov.tipo_movimiento}: S/${mov.monto} - ${mov.descripcion || 'Sin descripción'}`,
        entidadId: mov.caja_operativa_id,
        entidadTipo: 'caja_operativa',
        metadata: { tipo: mov.tipo_movimiento, monto: mov.monto }
    }))
}

// ============ MAIN QUERY ============

/**
 * Obtiene eventos de auditoría con filtros
 */
export async function obtenerAuditoria(filtros: FiltrosAuditoria = {}): Promise<AuditoriaResumen> {
    const hoy = new Date()
    const hace7dias = new Date(hoy)
    hace7dias.setDate(hoy.getDate() - 7)

    const fechaDesde = filtros.fechaDesde || hace7dias.toISOString().split('T')[0]
    const fechaHasta = filtros.fechaHasta || hoy.toISOString().split('T')[0]
    const pagina = filtros.pagina || 1
    const porPagina = filtros.porPagina || 50

    let eventos: EventoAuditoria[] = []

    // Obtener según tipo o todos
    if (!filtros.tipo || filtros.tipo === 'pago') {
        eventos = [...eventos, ...(await obtenerEventosPagos(fechaDesde, fechaHasta))]
    }
    if (!filtros.tipo || filtros.tipo === 'recibo') {
        eventos = [...eventos, ...(await obtenerEventosRecibos(fechaDesde, fechaHasta))]
    }
    if (!filtros.tipo || filtros.tipo === 'notificacion') {
        eventos = [...eventos, ...(await obtenerEventosNotificaciones(fechaDesde, fechaHasta))]
    }
    if (!filtros.tipo || filtros.tipo === 'caja') {
        eventos = [...eventos, ...(await obtenerEventosCaja(fechaDesde, fechaHasta))]
    }

    // Ordenar por fecha descendente
    eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    // Paginar
    const inicio = (pagina - 1) * porPagina
    const eventosPaginados = eventos.slice(inicio, inicio + porPagina)

    return {
        eventos: eventosPaginados,
        total: eventos.length,
        pagina,
        porPagina,
        filtros: {
            tipo: filtros.tipo,
            fechaDesde,
            fechaHasta
        }
    }
}

/**
 * Verifica un hash de recibo
 */
export async function verificarHashRecibo(hash: string): Promise<{
    valido: boolean
    recibo?: EventoAuditoria
}> {
    if (!hash || hash.length !== 64) {
        return { valido: false }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('notificaciones_enviadas')
        .select('id, created_at, estado, telefono_destino, credito_id, metadata')
        .eq('tipo_notificacion', 'RECIBO_PDF')
        .filter('metadata->>qr_hash', 'eq', hash)
        .single()

    if (error || !data) {
        return { valido: false }
    }

    const meta = data.metadata as { numero_recibo?: string; qr_hash?: string } || {}

    return {
        valido: true,
        recibo: {
            id: `recibo-${data.id}`,
            tipo: 'recibo',
            fecha: data.created_at,
            usuario: null,
            descripcion: `Recibo ${meta.numero_recibo || 'N/A'}`,
            entidadId: data.credito_id,
            entidadTipo: 'credito',
            metadata: meta,
            hash: meta.qr_hash
        }
    }
}
