/**
 * Utilidad para generar recibos de pago en PDF
 * 
 * Usa jsPDF para generación client-side
 */

import { jsPDF } from 'jspdf'

/**
 * Datos necesarios para generar un recibo
 */
export interface DatosRecibo {
    // Identificación
    numeroRecibo: string
    fecha: Date

    // Cliente
    clienteNombre: string
    clienteDocumento: string

    // Crédito
    codigoCredito: string
    garantiaDescripcion?: string

    // Pago
    tipoPago: 'RENOVACION' | 'DESEMPENO' | 'PAGO_PARCIAL' | 'CONDONACION'
    montoPagado: number
    metodoPago: string

    // Saldos
    saldoAnterior: number
    saldoNuevo: number

    // Operador
    cajeroNombre?: string
    sucursal?: string
}

/**
 * Genera un número de recibo único basado en fecha y timestamp
 */
export function generarNumeroRecibo(): string {
    const ahora = new Date()
    const fecha = ahora.toISOString().split('T')[0].replace(/-/g, '')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `REC-${fecha}-${random}`
}

/**
 * Formatea un monto en soles
 */
function formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(monto)
}

/**
 * Formatea una fecha en formato legible
 */
function formatFecha(fecha: Date): string {
    return fecha.toLocaleString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

/**
 * Obtiene el label del tipo de pago
 */
function getTipoPagoLabel(tipo: DatosRecibo['tipoPago']): string {
    const labels: Record<DatosRecibo['tipoPago'], string> = {
        'RENOVACION': 'Renovación de Contrato',
        'DESEMPENO': 'Desempeño (Cancelación Total)',
        'PAGO_PARCIAL': 'Pago Parcial',
        'CONDONACION': 'Condonación de Mora'
    }
    return labels[tipo] || tipo
}

/**
 * Genera un PDF de recibo y lo descarga
 */
export function generarReciboPDF(datos: DatosRecibo): void {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Formato recibo térmico (80mm ancho)
    })

    const pageWidth = 80
    const margin = 5
    const _contentWidth = pageWidth - (margin * 2)
    let y = 10

    // Configuración de fuente
    doc.setFont('helvetica')

    // ===== HEADER =====
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('JUNTAY FINANCIERA', pageWidth / 2, y, { align: 'center' })

    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('COMPROBANTE DE PAGO', pageWidth / 2, y, { align: 'center' })

    // Línea separadora
    y += 4
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)

    // ===== DATOS DEL RECIBO =====
    y += 6
    doc.setFontSize(7)
    doc.text(`Recibo N°: ${datos.numeroRecibo}`, margin, y)

    y += 4
    doc.text(`Fecha: ${formatFecha(datos.fecha)}`, margin, y)

    if (datos.sucursal) {
        y += 4
        doc.text(`Sucursal: ${datos.sucursal}`, margin, y)
    }

    // Línea separadora
    y += 4
    doc.line(margin, y, pageWidth - margin, y)

    // ===== DATOS DEL CLIENTE =====
    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('CLIENTE', margin, y)

    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`Nombre: ${datos.clienteNombre}`, margin, y)

    y += 4
    doc.text(`Doc: ${datos.clienteDocumento}`, margin, y)

    // Línea separadora
    y += 4
    doc.line(margin, y, pageWidth - margin, y)

    // ===== DETALLE DEL PAGO =====
    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALLE DEL PAGO', margin, y)

    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`Crédito: ${datos.codigoCredito}`, margin, y)

    if (datos.garantiaDescripcion) {
        y += 4
        const garantiaText = datos.garantiaDescripcion.length > 35
            ? datos.garantiaDescripcion.substring(0, 32) + '...'
            : datos.garantiaDescripcion
        doc.text(`Garantía: ${garantiaText}`, margin, y)
    }

    y += 4
    doc.text(`Tipo: ${getTipoPagoLabel(datos.tipoPago)}`, margin, y)

    y += 4
    doc.text(`Método: ${datos.metodoPago}`, margin, y)

    // Línea separadora punteada
    y += 4
    doc.setLineDashPattern([1, 1], 0)
    doc.line(margin, y, pageWidth - margin, y)
    doc.setLineDashPattern([], 0)

    // ===== MONTOS =====
    y += 5
    doc.setFontSize(8)

    // Monto pagado (destacado)
    doc.setFont('helvetica', 'bold')
    doc.text('MONTO PAGADO:', margin, y)
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

    // Línea separadora
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.line(margin, y, pageWidth - margin, y)

    // ===== FOOTER =====
    y += 5
    doc.setFontSize(6)

    if (datos.cajeroNombre) {
        doc.text(`Atendido por: ${datos.cajeroNombre}`, margin, y)
        y += 3
    }

    y += 2
    doc.setFontSize(5)
    doc.text('Este documento es un comprobante interno', pageWidth / 2, y, { align: 'center' })
    y += 3
    doc.text('de JUNTAY Financiera', pageWidth / 2, y, { align: 'center' })

    y += 4
    doc.text('Gracias por su preferencia', pageWidth / 2, y, { align: 'center' })

    // ===== GUARDAR =====
    const filename = `recibo_${datos.codigoCredito}_${datos.fecha.toISOString().split('T')[0]}.pdf`
    doc.save(filename)
}

/**
 * Genera el PDF y retorna como Blob (para envío por WhatsApp u otros)
 */
export function generarReciboPDFBlob(datos: DatosRecibo): Blob {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
    })

    // [Mismo contenido que generarReciboPDF pero sin save()]
    // Por ahora, retornamos un blob básico - se puede expandir
    const pageWidth = 80
    const margin = 5
    let y = 10

    doc.setFont('helvetica')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('JUNTAY FINANCIERA', pageWidth / 2, y, { align: 'center' })

    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('COMPROBANTE DE PAGO', pageWidth / 2, y, { align: 'center' })

    y += 8
    doc.setFontSize(7)
    doc.text(`Recibo: ${datos.numeroRecibo}`, margin, y)
    y += 4
    doc.text(`Cliente: ${datos.clienteNombre}`, margin, y)
    y += 4
    doc.text(`Crédito: ${datos.codigoCredito}`, margin, y)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.text(`Monto: ${formatMonto(datos.montoPagado)}`, margin, y)

    return doc.output('blob')
}
