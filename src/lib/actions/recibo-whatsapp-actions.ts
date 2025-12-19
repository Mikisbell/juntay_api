'use server'

/**
 * Server Actions para envío de recibos por WhatsApp
 * 
 * Flujo: PDF Blob → Base64 → WAHA sendFile → Historial
 */

import { createClient } from '@/lib/supabase/server'
import { sendFile } from '@/lib/actions/waha-actions'
import { generarNumeroRecibo, type DatosRecibo } from '@/lib/utils/recibo-pdf'
import { generarHashRecibo } from '@/lib/utils/recibo-hash'
import { jsPDF } from 'jspdf'

/**
 * Datos necesarios para enviar recibo por WhatsApp
 */
export interface DatosReciboWhatsApp extends Omit<DatosRecibo, 'numeroRecibo' | 'fecha'> {
    /** Teléfono del cliente (9 dígitos) */
    telefono: string
    /** ID del crédito (para historial) */
    creditoId?: string
    /** ID del cliente (para historial) */
    clienteId?: string
}

/**
 * Genera el PDF del recibo en base64 (server-side)
 */
function generarReciboPDFBase64(datos: DatosRecibo): string {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
    })

    const pageWidth = 80
    const margin = 5
    let y = 10

    // Helper para formatear montos
    const formatMonto = (monto: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)

    const formatFecha = (fecha: Date) =>
        fecha.toLocaleString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })

    // ===== HEADER =====
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('JUNTAY FINANCIERA', pageWidth / 2, y, { align: 'center' })

    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('COMPROBANTE DE PAGO', pageWidth / 2, y, { align: 'center' })

    y += 4
    doc.line(margin, y, pageWidth - margin, y)

    // ===== DATOS RECIBO =====
    y += 5
    doc.setFontSize(7)
    doc.text(`Recibo: ${datos.numeroRecibo}`, margin, y)
    y += 4
    doc.text(`Fecha: ${formatFecha(datos.fecha)}`, margin, y)

    y += 4
    doc.line(margin, y, pageWidth - margin, y)

    // ===== CLIENTE =====
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('CLIENTE', margin, y)

    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`${datos.clienteNombre}`, margin, y)
    y += 4
    doc.text(`Doc: ${datos.clienteDocumento}`, margin, y)

    y += 4
    doc.line(margin, y, pageWidth - margin, y)

    // ===== DETALLE =====
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('DETALLE', margin, y)

    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`Crédito: ${datos.codigoCredito}`, margin, y)

    y += 4
    const tipoLabels: Record<string, string> = {
        'RENOVACION': 'Renovación',
        'DESEMPENO': 'Desempeño',
        'PAGO_PARCIAL': 'Pago Parcial',
        'CONDONACION': 'Condonación'
    }
    doc.text(`Tipo: ${tipoLabels[datos.tipoPago] || datos.tipoPago}`, margin, y)

    // ===== MONTOS =====
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Monto Pagado:', margin, y)
    doc.text(formatMonto(datos.montoPagado), pageWidth - margin, y, { align: 'right' })

    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text('Saldo anterior:', margin, y)
    doc.text(formatMonto(datos.saldoAnterior), pageWidth - margin, y, { align: 'right' })

    y += 4
    doc.text('Nuevo saldo:', margin, y)
    doc.setFont('helvetica', 'bold')
    doc.text(formatMonto(datos.saldoNuevo), pageWidth - margin, y, { align: 'right' })

    // ===== FOOTER =====
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5)
    doc.text('Comprobante interno JUNTAY', pageWidth / 2, y, { align: 'center' })
    y += 3
    doc.text('Gracias por su preferencia', pageWidth / 2, y, { align: 'center' })

    // Retornar como base64
    return doc.output('datauristring').split(',')[1]
}

/**
 * Envía un recibo de pago por WhatsApp
 * 
 * Flujo:
 * 1. Genera PDF en base64
 * 2. Envía por WAHA sendFile
 * 3. Registra en historial (éxito o error)
 * 4. Retorna resultado
 */
export async function enviarReciboPorWhatsApp(datos: DatosReciboWhatsApp): Promise<{
    success: boolean
    error?: string
    numeroRecibo?: string
}> {
    const numeroRecibo = generarNumeroRecibo()
    const fecha = new Date()

    try {
        // 1. Validar teléfono
        const telefonoLimpio = datos.telefono.replace(/\D/g, '')
        if (!/^9\d{8}$/.test(telefonoLimpio)) {
            return { success: false, error: 'Número de teléfono inválido (debe ser 9 dígitos)' }
        }

        // 2. Generar PDF en base64
        const datosRecibo: DatosRecibo = {
            numeroRecibo,
            fecha,
            clienteNombre: datos.clienteNombre,
            clienteDocumento: datos.clienteDocumento,
            codigoCredito: datos.codigoCredito,
            garantiaDescripcion: datos.garantiaDescripcion,
            tipoPago: datos.tipoPago,
            montoPagado: datos.montoPagado,
            metodoPago: datos.metodoPago,
            saldoAnterior: datos.saldoAnterior,
            saldoNuevo: datos.saldoNuevo,
            cajeroNombre: datos.cajeroNombre,
            sucursal: datos.sucursal
        }

        const pdfBase64 = generarReciboPDFBase64(datosRecibo)

        // 3. Preparar mensaje de caption
        const caption = `📄 *RECIBO DE PAGO*

Hola ${datos.clienteNombre.split(' ')[0]},

Te enviamos tu comprobante:
• Recibo: ${numeroRecibo}
• Crédito: ${datos.codigoCredito}
• Monto pagado: S/ ${datos.montoPagado.toFixed(2)}
• Fecha: ${fecha.toLocaleDateString('es-PE')}

Gracias por tu preferencia.
— JUNTAY Financiera`

        // 4. Enviar por WhatsApp
        const resultado = await sendFile(
            telefonoLimpio,
            {
                filename: `recibo_${datos.codigoCredito}_${fecha.toISOString().split('T')[0]}.pdf`,
                mimetype: 'application/pdf',
                base64: pdfBase64
            },
            caption
        )

        // 5. Registrar en historial (siempre, éxito o error)
        await registrarEnvioRecibo({
            creditoId: datos.creditoId,
            clienteId: datos.clienteId,
            telefono: telefonoLimpio,
            numeroRecibo,
            codigoCredito: datos.codigoCredito,
            montoPagado: datos.montoPagado,
            clienteNombre: datos.clienteNombre,
            fecha,
            exito: resultado.success,
            error: resultado.error
        })

        if (!resultado.success) {
            return {
                success: false,
                error: resultado.error || 'Error enviando WhatsApp',
                numeroRecibo
            }
        }

        return { success: true, numeroRecibo }

    } catch (error) {
        console.error('Error en enviarReciboPorWhatsApp:', error)

        // Registrar error en historial
        await registrarEnvioRecibo({
            creditoId: datos.creditoId,
            clienteId: datos.clienteId,
            telefono: datos.telefono,
            numeroRecibo,
            codigoCredito: datos.codigoCredito,
            montoPagado: datos.montoPagado,
            clienteNombre: datos.clienteNombre,
            fecha,
            exito: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        })

        return {
            success: false,
            error: 'Error generando o enviando el recibo',
            numeroRecibo
        }
    }
}

/**
 * Registra el envío de recibo en el historial de notificaciones
 */
async function registrarEnvioRecibo(datos: {
    creditoId?: string
    clienteId?: string
    telefono: string
    numeroRecibo: string
    codigoCredito: string
    montoPagado: number
    clienteNombre: string
    fecha: Date
    exito: boolean
    error?: string
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        await supabase.from('notificaciones_enviadas').insert({
            credito_id: datos.creditoId || null,
            cliente_id: datos.clienteId || null,
            tipo_notificacion: 'RECIBO_PDF',
            mensaje: `Recibo ${datos.numeroRecibo} - Crédito ${datos.codigoCredito} - S/${datos.montoPagado.toFixed(2)}`,
            telefono_destino: datos.telefono,
            enviado_por: user?.id || null,
            estado: datos.exito ? 'enviado' : 'error',
            medio: 'whatsapp',
            metadata: {
                numero_recibo: datos.numeroRecibo,
                codigo_credito: datos.codigoCredito,
                monto_pagado: datos.montoPagado,
                cliente_nombre: datos.clienteNombre,
                qr_hash: generarHashRecibo({
                    numeroRecibo: datos.numeroRecibo,
                    codigoCredito: datos.codigoCredito,
                    montoPagado: datos.montoPagado,
                    fecha: datos.fecha
                }),
                error: datos.error || null
            }
        })
    } catch (err) {
        // No fallar si el registro en historial falla
        console.error('Error registrando envío de recibo:', err)
    }
}
