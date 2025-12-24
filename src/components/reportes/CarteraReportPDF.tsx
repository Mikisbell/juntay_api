'use client'

/**
 * CarteraReportPDF - Professional portfolio report generator
 * 
 * Generates a comprehensive PDF with:
 * - Company header
 * - KPI summary
 * - Full credits table
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import { obtenerDatosCarteraReporte, DatosCarteraReporte } from '@/lib/actions/reportes-pdf-actions'

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

export function CarteraReportPDF() {
    const [generating, setGenerating] = useState(false)

    const generatePDF = async () => {
        setGenerating(true)
        try {
            // Fetch data
            const datos = await obtenerDatosCarteraReporte()

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            })

            const pageWidth = doc.internal.pageSize.getWidth()
            const pageHeight = doc.internal.pageSize.getHeight()
            const margin = 15
            let y = 20

            // ===== HEADER =====
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(20)
            doc.text(datos.empresa.nombre, margin, y)

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            if (datos.empresa.ruc) {
                doc.text(`RUC: ${datos.empresa.ruc}`, margin, y + 6)
            }

            doc.setFontSize(16)
            doc.setFont('helvetica', 'bold')
            doc.text('REPORTE DE CARTERA', pageWidth / 2, y, { align: 'center' })

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(`Generado: ${formatFecha(datos.fecha)}`, pageWidth - margin, y, { align: 'right' })

            // Line separator
            y += 12
            doc.setLineWidth(0.5)
            doc.line(margin, y, pageWidth - margin, y)

            // ===== KPIs =====
            y += 10
            const kpiWidth = (pageWidth - margin * 2) / 4
            const kpis = [
                { label: 'Cartera Total', value: formatMonto(datos.resumen.totalCartera), color: '#3b82f6' },
                { label: 'Créditos Vigentes', value: datos.resumen.creditosVigentes.toString(), color: '#10b981' },
                { label: 'En Mora', value: datos.resumen.enMora.toString(), color: '#ef4444' },
                { label: 'Tasa Mora', value: `${datos.resumen.tasaMora}%`, color: '#f59e0b' }
            ]

            kpis.forEach((kpi, i) => {
                const x = margin + (i * kpiWidth)
                doc.setFillColor(245, 247, 250)
                doc.roundedRect(x, y, kpiWidth - 5, 20, 3, 3, 'F')

                doc.setFontSize(9)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(100, 100, 100)
                doc.text(kpi.label, x + 5, y + 7)

                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(0, 0, 0)
                doc.text(kpi.value, x + 5, y + 15)
            })

            doc.setTextColor(0, 0, 0)

            // ===== TABLE HEADER =====
            y += 30
            const cols = [
                { label: 'Código', width: 30 },
                { label: 'Cliente', width: 70 },
                { label: 'Monto', width: 35 },
                { label: 'Saldo', width: 35 },
                { label: 'Estado', width: 30 },
                { label: 'Vencimiento', width: 35 },
                { label: 'Días', width: 20 }
            ]

            // Header background
            doc.setFillColor(59, 130, 246)
            doc.rect(margin, y, pageWidth - margin * 2, 8, 'F')

            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(255, 255, 255)

            let colX = margin + 2
            cols.forEach(col => {
                doc.text(col.label, colX, y + 5.5)
                colX += col.width
            })

            doc.setTextColor(0, 0, 0)
            y += 8

            // ===== TABLE ROWS =====
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')

            const maxRows = 25 // Rows per page
            let rowIndex = 0

            for (const credito of datos.creditos) {
                if (rowIndex > 0 && rowIndex % maxRows === 0) {
                    // New page
                    doc.addPage()
                    y = 20

                    // Repeat header
                    doc.setFillColor(59, 130, 246)
                    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F')
                    doc.setFontSize(9)
                    doc.setFont('helvetica', 'bold')
                    doc.setTextColor(255, 255, 255)

                    colX = margin + 2
                    cols.forEach(col => {
                        doc.text(col.label, colX, y + 5.5)
                        colX += col.width
                    })
                    doc.setTextColor(0, 0, 0)
                    y += 8
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                }

                // Alternate row color
                if (rowIndex % 2 === 0) {
                    doc.setFillColor(249, 250, 251)
                    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F')
                }

                colX = margin + 2
                doc.text(credito.codigo, colX, y + 5)
                colX += cols[0].width

                // Truncate client name if too long
                const clienteName = credito.cliente.length > 40
                    ? credito.cliente.substring(0, 37) + '...'
                    : credito.cliente
                doc.text(clienteName, colX, y + 5)
                colX += cols[1].width

                doc.text(formatMonto(credito.monto), colX, y + 5)
                colX += cols[2].width

                doc.text(formatMonto(credito.saldo), colX, y + 5)
                colX += cols[3].width

                // Estado with color
                const estadoColor = credito.estado.includes('mora') || credito.estado === 'vencido'
                    ? [239, 68, 68]
                    : credito.estado === 'por_vencer'
                        ? [245, 158, 11]
                        : [16, 185, 129]
                doc.setTextColor(estadoColor[0], estadoColor[1], estadoColor[2])
                doc.text(credito.estado, colX, y + 5)
                doc.setTextColor(0, 0, 0)
                colX += cols[4].width

                doc.text(formatFecha(credito.fechaVencimiento), colX, y + 5)
                colX += cols[5].width

                doc.text(credito.diasVencido.toString(), colX, y + 5)

                y += 7
                rowIndex++
            }

            // ===== FOOTER =====
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.text(
                `Página ${doc.getCurrentPageInfo().pageNumber} - Generado automáticamente por JUNTAY`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            )

            // Save
            const filename = `Reporte_Cartera_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(filename)

        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button onClick={generatePDF} disabled={generating} className="gap-2">
            {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <FileDown className="w-4 h-4" />
            )}
            {generating ? 'Generando...' : 'Descargar Reporte Cartera'}
        </Button>
    )
}
