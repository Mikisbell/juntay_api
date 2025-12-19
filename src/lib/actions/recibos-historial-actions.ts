'use server'

/**
 * Server Actions para Historial de Recibos por Cliente
 * 
 * Consulta notificaciones_enviadas con tipo_notificacion = 'RECIBO_PDF'
 * 
 * Reglas de Gobernanza:
 * - Historial es inmutable (nunca editar)
 * - Reenvío = nuevo registro
 * - PDF regenerado desde metadata, no recalculado
 */

import { createClient } from '@/lib/supabase/server'
import { enviarReciboPorWhatsApp } from '@/lib/actions/recibo-whatsapp-actions'
import { type DatosRecibo } from '@/lib/utils/recibo-pdf'

/**
 * DTO para mostrar en la tabla de historial
 */
export interface ReciboHistorial {
    id: string
    fecha: string              // Formateado para display
    fechaISO: string           // Para ordenamiento
    numeroRecibo: string
    codigoCredito: string
    monto: number
    montoFormateado: string    // "S/ 150.00"
    estado: 'enviado' | 'error' | 'pendiente'
    telefono: string
    // Datos para regenerar PDF
    creditoId: string | null
    clienteId: string | null
    clienteNombre?: string
    clienteDocumento?: string
}

/**
 * Obtiene el historial de recibos de un cliente
 */
export async function obtenerHistorialRecibos(clienteId: string): Promise<ReciboHistorial[]> {
    if (!clienteId) return []

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('notificaciones_enviadas')
        .select(`
            id,
            created_at,
            credito_id,
            cliente_id,
            telefono_destino,
            estado,
            metadata
        `)
        .eq('cliente_id', clienteId)
        .eq('tipo_notificacion', 'RECIBO_PDF')
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error obteniendo historial de recibos:', error)
        return []
    }

    // También obtener datos del cliente para regeneración
    const { data: cliente } = await supabase
        .from('clientes')
        .select('nombres, apellido_paterno, numero_documento')
        .eq('id', clienteId)
        .single()

    const nombreCliente = cliente
        ? `${cliente.nombres} ${cliente.apellido_paterno}`.trim()
        : 'Cliente'
    const documentoCliente = cliente?.numero_documento || ''

    return (data || []).map(row => {
        const metadata = row.metadata as {
            numero_recibo?: string
            codigo_credito?: string
            monto_pagado?: number
        } || {}

        const fecha = new Date(row.created_at)

        return {
            id: row.id,
            fecha: fecha.toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            fechaISO: row.created_at,
            numeroRecibo: metadata.numero_recibo || 'Sin número',
            codigoCredito: metadata.codigo_credito || 'N/A',
            monto: metadata.monto_pagado || 0,
            montoFormateado: new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN'
            }).format(metadata.monto_pagado || 0),
            estado: row.estado as 'enviado' | 'error' | 'pendiente',
            telefono: row.telefono_destino || '',
            creditoId: row.credito_id,
            clienteId: row.cliente_id,
            clienteNombre: nombreCliente,
            clienteDocumento: documentoCliente
        }
    })
}

/**
 * Regenera y descarga un PDF de recibo existente
 * 
 * Nota: Genera un NUEVO PDF con los datos guardados en metadata.
 * El archivo no se almacena, se genera on-demand.
 */
export async function descargarReciboPDF(notificacionId: string): Promise<{
    success: boolean
    error?: string
    datos?: DatosRecibo
}> {
    const supabase = await createClient()

    // Obtener datos del recibo
    const { data: notificacion, error } = await supabase
        .from('notificaciones_enviadas')
        .select(`
            metadata,
            created_at,
            cliente_id
        `)
        .eq('id', notificacionId)
        .eq('tipo_notificacion', 'RECIBO_PDF')
        .single()

    if (error || !notificacion) {
        return { success: false, error: 'Recibo no encontrado' }
    }

    const metadata = notificacion.metadata as {
        numero_recibo?: string
        codigo_credito?: string
        monto_pagado?: number
    } || {}

    // Obtener datos del cliente
    let clienteNombre = 'Cliente'
    let clienteDocumento = ''

    if (notificacion.cliente_id) {
        const { data: cliente } = await supabase
            .from('clientes')
            .select('nombres, apellido_paterno, numero_documento')
            .eq('id', notificacion.cliente_id)
            .single()

        if (cliente) {
            clienteNombre = `${cliente.nombres} ${cliente.apellido_paterno}`.trim()
            clienteDocumento = cliente.numero_documento
        }
    }

    // Preparar datos para regenerar PDF
    const datosRecibo: DatosRecibo = {
        numeroRecibo: metadata.numero_recibo || 'REC-REGENERADO',
        fecha: new Date(notificacion.created_at),
        clienteNombre,
        clienteDocumento,
        codigoCredito: metadata.codigo_credito || 'N/A',
        tipoPago: 'RENOVACION', // Default, no se guarda en metadata actual
        montoPagado: metadata.monto_pagado || 0,
        metodoPago: 'Efectivo', // Default
        saldoAnterior: 0,       // No guardado en metadata
        saldoNuevo: 0           // No guardado en metadata
    }

    return { success: true, datos: datosRecibo }
}

/**
 * Reenvía un recibo existente por WhatsApp
 * 
 * Nota: Crea un NUEVO registro en notificaciones_enviadas.
 * No modifica el registro original (historial inmutable).
 */
export async function reenviarReciboWhatsApp(notificacionId: string): Promise<{
    success: boolean
    error?: string
    nuevoNumeroRecibo?: string
}> {
    const supabase = await createClient()

    // Obtener datos del recibo original
    const { data: notificacion, error } = await supabase
        .from('notificaciones_enviadas')
        .select(`
            metadata,
            telefono_destino,
            cliente_id,
            credito_id
        `)
        .eq('id', notificacionId)
        .eq('tipo_notificacion', 'RECIBO_PDF')
        .single()

    if (error || !notificacion) {
        return { success: false, error: 'Recibo no encontrado' }
    }

    if (!notificacion.telefono_destino) {
        return { success: false, error: 'No hay teléfono registrado para este recibo' }
    }

    const metadata = notificacion.metadata as {
        numero_recibo?: string
        codigo_credito?: string
        monto_pagado?: number
    } || {}

    // Obtener datos del cliente
    let clienteNombre = 'Cliente'
    let clienteDocumento = ''

    if (notificacion.cliente_id) {
        const { data: cliente } = await supabase
            .from('clientes')
            .select('nombres, apellido_paterno, numero_documento')
            .eq('id', notificacion.cliente_id)
            .single()

        if (cliente) {
            clienteNombre = `${cliente.nombres} ${cliente.apellido_paterno}`.trim()
            clienteDocumento = cliente.numero_documento
        }
    }

    // Reenviar usando la función existente (crea nuevo registro)
    const resultado = await enviarReciboPorWhatsApp({
        telefono: notificacion.telefono_destino,
        clienteNombre,
        clienteDocumento,
        codigoCredito: metadata.codigo_credito || 'N/A',
        tipoPago: 'RENOVACION',
        montoPagado: metadata.monto_pagado || 0,
        metodoPago: 'Efectivo',
        saldoAnterior: 0,
        saldoNuevo: 0,
        creditoId: notificacion.credito_id || undefined,
        clienteId: notificacion.cliente_id || undefined
    })

    if (!resultado.success) {
        return { success: false, error: resultado.error }
    }

    return { success: true, nuevoNumeroRecibo: resultado.numeroRecibo }
}
