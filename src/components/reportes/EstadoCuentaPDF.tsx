'use client'

/**
 * EstadoCuentaPDF - Client account statement generator
 * 
 * Generates a per-client PDF with:
 * - Client info
 * - Active credits
 * - Payment history
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import { obtenerEstadoCuentaCliente, DatosEstadoCuenta } from '@/lib/actions/reportes-pdf-actions'

interface EstadoCuentaPDFProps {
    clienteId: string
    clienteNombre?: string
    variant?: 'default' | 'outline' | 'secondary' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

function formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(monto)
}

function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

export function EstadoCuentaPDF({ clienteId, clienteNombre, variant = 'secondary', size = 'sm' }: EstadoCuentaPDFProps) {
    const [generating, setGenerating] = useState(false)

    const generatePDF = async () => {
        setGenerating(true)
        try {
            const datos = await obtenerEstadoCuentaCliente(clienteId)

            if (!datos) {
                console.error('No data found for client')
                return
            }

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const pageWidth = doc.internal.pageSize.getWidth()
            const margin = 15
            let y = 20

            // ===== HEADER =====
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(18)
            doc.text('ESTADO DE CUENTA', pageWidth / 2, y, { align: 'center' })

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(100, 100, 100)
            doc.text(`Generado: ${formatFecha(datos.fecha)}`, pageWidth - margin, y, { align: 'right' })

            doc.setTextColor(0, 0, 0)

            // Line
            y += 8
            doc.setLineWidth(0.5)
            doc.line(margin, y, pageWidth - margin, y)

            // ===== CLIENT INFO =====
            y += 10
            doc.setFillColor(249, 250, 251)
            doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 3, 3, 'F')

            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.text('DATOS DEL CLIENTE', margin + 5, y + 8)

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(`Nombre: ${datos.cliente.nombre}`, margin + 5, y + 15)
            doc.text(`Documento: ${datos.cliente.documento}`, margin + 5, y + 21)
            if (datos.cliente.telefono) {
                doc.text(`Teléfono: ${datos.cliente.telefono}`, margin + 100, y + 15)
            }
            if (datos.cliente.direccion) {
                doc.text(`Dirección: ${datos.cliente.direccion}`, margin + 100, y + 21)
            }

            // Saldo Total
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text('SALDO TOTAL:', pageWidth - margin - 50, y + 15)
            doc.setTextColor(datos.saldoTotal > 0 ? 220 : 16, datos.saldoTotal > 0 ? 38 : 185, datos.saldoTotal > 0 ? 38 : 129)
            doc.text(formatMonto(datos.saldoTotal), pageWidth - margin - 5, y + 15, { align: 'right' })
            doc.setTextColor(0, 0, 0)

            // ===== CREDITS TABLE =====
            y += 40
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.text('CRÉDITOS ACTIVOS', margin, y)

            y += 8
            if (datos.creditosActivos.length === 0) {
                doc.setFontSize(10)
                doc.setFont('helvetica', 'italic')
                doc.text('No tiene créditos activos', margin, y + 5)
                y += 15
            } else {
                // Table header
                doc.setFillColor(59, 130, 246)
                doc.rect(margin, y, pageWidth - margin * 2, 7, 'F')

                doc.setFontSize(8)
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(255, 255, 255)

                const creditCols = ['Código', 'Monto', 'Saldo', 'Tasa', 'Vencimiento', 'Estado']
                const colWidths = [30, 30, 30, 20, 35, 35]
                let colX = margin + 2
                creditCols.forEach((col, i) => {
                    doc.text(col, colX, y + 5)
                    colX += colWidths[i]
                })

                doc.setTextColor(0, 0, 0)
                y += 7

                // Rows
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')

                datos.creditosActivos.forEach((credito, i) => {
                    if (i % 2 === 0) {
                        doc.setFillColor(249, 250, 251)
                        doc.rect(margin, y, pageWidth - margin * 2, 6, 'F')
                    }

                    colX = margin + 2
                    doc.text(credito.codigo, colX, y + 4.5)
                    colX += colWidths[0]

                    doc.text(formatMonto(credito.monto), colX, y + 4.5)
                    colX += colWidths[1]

                    doc.text(formatMonto(credito.saldo), colX, y + 4.5)
                    colX += colWidths[2]

                    doc.text(`${credito.tasa}%`, colX, y + 4.5)
                    colX += colWidths[3]

                    doc.text(formatFecha(credito.fechaVencimiento), colX, y + 4.5)
                    colX += colWidths[4]

                    doc.text(credito.estado, colX, y + 4.5)

                    y += 6
                })

                y += 10
            }

            // ===== PAYMENT HISTORY =====
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.text('ÚLTIMOS PAGOS', margin, y)

            y += 8
            if (datos.historialPagos.length === 0) {
                doc.setFontSize(10)
                doc.setFont('helvetica', 'italic')
                doc.text('Sin pagos registrados', margin, y + 5)
            } else {
                // Table header
                doc.setFillColor(16, 185, 129)
                doc.rect(margin, y, pageWidth - margin * 2, 7, 'F')

                doc.setFontSize(8)
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(255, 255, 255)

                const payCols = ['Fecha', 'Monto', 'Tipo', 'Crédito']
                const payWidths = [40, 40, 50, 50]
                let payColX = margin + 2
                payCols.forEach((col, i) => {
                    doc.text(col, payColX, y + 5)
                    payColX += payWidths[i]
                })

                doc.setTextColor(0, 0, 0)
                y += 7

                // Rows
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')

                datos.historialPagos.slice(0, 10).forEach((pago, i) => {
                    if (i % 2 === 0) {
                        doc.setFillColor(236, 253, 245)
                        doc.rect(margin, y, pageWidth - margin * 2, 6, 'F')
                    }

                    payColX = margin + 2
                    doc.text(formatFecha(pago.fecha), payColX, y + 4.5)
                    payColX += payWidths[0]

                    doc.text(formatMonto(pago.monto), payColX, y + 4.5)
                    payColX += payWidths[1]

                    doc.text(pago.tipo, payColX, y + 4.5)
                    payColX += payWidths[2]

                    doc.text(pago.creditoCodigo, payColX, y + 4.5)

                    y += 6
                })
            }

            // ===== FOOTER =====
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.text(
                'Este documento es un resumen informativo - JUNTAY Financiera',
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            )

            // Save
            const filename = `Estado_Cuenta_${datos.cliente.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(filename)

        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button
            onClick={(e) => {
                e.stopPropagation()
                generatePDF()
            }}
            disabled={generating}
            variant={variant}
            size={size}
            className="gap-1"
        >
            {generating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <FileDown className="w-3 h-3" />
            )}
            {size === 'icon' ? null : (generating ? 'Generando...' : 'Estado de Cuenta')}
        </Button>
    )
}
