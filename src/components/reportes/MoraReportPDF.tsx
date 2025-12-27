'use client'

/**
 * MoraReportPDF - Delinquency report generator
 * 
 * Generates a PDF with:
 * - Summary stats
 * - Priority-sorted delinquent credits
 * - Contact info for collection
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import { obtenerDatosMoraReporte } from '@/lib/actions/reportes-pdf-actions'

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

export function MoraReportPDF() {
    const [generating, setGenerating] = useState(false)

    const generatePDF = async () => {
        setGenerating(true)
        try {
            const datos = await obtenerDatosMoraReporte()

            let logoBase64: string | null = null
            if (datos.empresa.logoUrl) {
                try {
                    const response = await fetch(datos.empresa.logoUrl)
                    const blob = await response.blob()
                    logoBase64 = await new Promise((resolve) => {
                        const reader = new FileReader()
                        reader.onloadend = () => resolve(reader.result as string)
                        reader.readAsDataURL(blob)
                    })
                } catch (e) {
                    console.error('Error loading logo:', e)
                }
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
            if (logoBase64) {
                const imgProps = doc.getImageProperties(logoBase64)
                const imgWidth = 30
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width
                doc.addImage(logoBase64, 'PNG', margin, y, imgWidth, imgHeight)

                doc.setFont('helvetica', 'bold')
                doc.setFontSize(18)
                doc.setTextColor(220, 38, 38) // Red
                doc.text('⚠ REPORTE DE MORA', pageWidth / 2, y + 10, { align: 'center' })
                y += imgHeight + 5
            } else {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(18)
                doc.setTextColor(220, 38, 38) // Red
                doc.text('⚠ REPORTE DE MORA', pageWidth / 2, y, { align: 'center' })
            }

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(100, 100, 100)
            doc.text(`Generado: ${formatFecha(datos.fecha)}`, pageWidth / 2, y + 7, { align: 'center' })

            doc.setTextColor(0, 0, 0)

            // Line
            y += 15
            doc.setDrawColor(220, 38, 38)
            doc.setLineWidth(0.8)
            doc.line(margin, y, pageWidth - margin, y)

            // ===== SUMMARY =====
            y += 15
            doc.setFillColor(254, 242, 242) // Light red
            doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 3, 3, 'F')

            doc.setFontSize(11)
            doc.setFont('helvetica', 'bold')
            const summaryX = pageWidth / 3

            doc.text('Créditos en Mora', margin + 10, y + 10)
            doc.setFontSize(18)
            doc.setTextColor(220, 38, 38)
            doc.text(datos.resumen.totalEnMora.toString(), margin + 10, y + 20)

            doc.setTextColor(0, 0, 0)
            doc.setFontSize(11)
            doc.text('Clientes Afectados', summaryX + 10, y + 10)
            doc.setFontSize(18)
            doc.setTextColor(220, 38, 38)
            doc.text(datos.resumen.clientesEnMora.toString(), summaryX + 10, y + 20)

            doc.setTextColor(0, 0, 0)
            doc.setFontSize(11)
            doc.text('Monto en Riesgo', summaryX * 2 + 10, y + 10)
            doc.setFontSize(18)
            doc.setTextColor(220, 38, 38)
            doc.text(formatMonto(datos.resumen.montoEnRiesgo), summaryX * 2 + 10, y + 20)

            doc.setTextColor(0, 0, 0)

            // ===== TABLE =====
            y += 35
            const cols = [
                { label: 'Prioridad', width: 22 },
                { label: 'Código', width: 25 },
                { label: 'Cliente', width: 55 },
                { label: 'Teléfono', width: 30 },
                { label: 'Saldo', width: 28 },
                { label: 'Días', width: 20 }
            ]

            // Header
            doc.setFillColor(220, 38, 38)
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

            // Rows
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')

            datos.creditos.slice(0, 40).forEach((credito, i) => {
                if (i % 2 === 0) {
                    doc.setFillColor(254, 242, 242)
                    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F')
                }

                colX = margin + 2

                // Priority badge
                const prioColors: Record<string, [number, number, number]> = {
                    'ALTA': [220, 38, 38],
                    'MEDIA': [245, 158, 11],
                    'BAJA': [107, 114, 128]
                }
                const color = prioColors[credito.prioridad] || [107, 114, 128]
                doc.setTextColor(color[0], color[1], color[2])
                doc.setFont('helvetica', 'bold')
                doc.text(credito.prioridad, colX, y + 5)
                doc.setTextColor(0, 0, 0)
                doc.setFont('helvetica', 'normal')
                colX += cols[0].width

                doc.text(credito.codigo, colX, y + 5)
                colX += cols[1].width

                const clienteName = credito.cliente.length > 32
                    ? credito.cliente.substring(0, 29) + '...'
                    : credito.cliente
                doc.text(clienteName, colX, y + 5)
                colX += cols[2].width

                doc.text(credito.clienteTelefono || '-', colX, y + 5)
                colX += cols[3].width

                doc.text(formatMonto(credito.saldo), colX, y + 5)
                colX += cols[4].width

                doc.setFont('helvetica', 'bold')
                doc.text(credito.diasVencido.toString(), colX, y + 5)
                doc.setFont('helvetica', 'normal')

                y += 7
            })

            // Footer
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.text(
                'CONFIDENCIAL - Solo para uso interno',
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            )

            // Save
            const filename = `Reporte_Mora_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(filename)

        } catch (error) {
            console.error('Error generating PDF:', error)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button onClick={generatePDF} disabled={generating} variant="destructive" className="gap-2">
            {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <FileDown className="w-4 h-4" />
            )}
            {generating ? 'Generando...' : 'Descargar Reporte Mora'}
        </Button>
    )
}
