'use client'

/**
 * ROSReportPDF - Reporte de Operación Sospechosa para UIF
 * Según Ley N.º 27693 y Resolución SBS N° 00650-2024
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2, Shield } from 'lucide-react'
import jsPDF from 'jspdf'
import { listarReportesROS } from '@/lib/actions/compliance-actions'

function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
}

function formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(monto)
}

interface Props {
    empresaId?: string
    reporteId?: string // If provided, generate single report
}

export function ROSReportPDF({ empresaId, reporteId }: Props) {
    const [generating, setGenerating] = useState(false)

    const generatePDF = async () => {
        setGenerating(true)
        try {
            const reportes = await listarReportesROS(empresaId)
            const filteredReportes = reporteId
                ? reportes.filter(r => r.id === reporteId)
                : reportes

            if (filteredReportes.length === 0) {
                alert('No hay reportes ROS para generar')
                setGenerating(false)
                return
            }

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const pageWidth = doc.internal.pageSize.getWidth()
            const margin = 15

            // Generate one page per ROS report
            filteredReportes.forEach((ros, index) => {
                if (index > 0) doc.addPage()

                let y = 20

                // ===== HEADER - CONFIDENTIAL =====
                doc.setFillColor(220, 38, 38) // Red
                doc.rect(0, 0, pageWidth, 35, 'F')

                doc.setFont('helvetica', 'bold')
                doc.setFontSize(10)
                doc.setTextColor(255, 255, 255)
                doc.text('🔒 DOCUMENTO CONFIDENCIAL', pageWidth / 2, 10, { align: 'center' })

                doc.setFontSize(16)
                doc.text('REPORTE DE OPERACIÓN SOSPECHOSA', pageWidth / 2, 20, { align: 'center' })

                doc.setFontSize(10)
                doc.text(`N° ${ros.numero_reporte}`, pageWidth / 2, 28, { align: 'center' })

                doc.setTextColor(0, 0, 0)
                y = 45

                // ===== LEGAL REFERENCE =====
                doc.setFillColor(254, 242, 242)
                doc.roundedRect(margin, y, pageWidth - margin * 2, 15, 2, 2, 'F')
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.text('Conforme a Ley N.º 27693 (UIF-Perú) y Resolución SBS N° 00650-2024', pageWidth / 2, y + 6, { align: 'center' })
                doc.text('Para uso exclusivo de la Unidad de Inteligencia Financiera del Perú', pageWidth / 2, y + 11, { align: 'center' })

                y += 25

                // ===== REPORT INFO =====
                doc.setFontSize(11)
                doc.setFont('helvetica', 'bold')
                doc.text('DATOS DEL REPORTE', margin, y)

                y += 8
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(10)

                const col1 = margin
                const col2 = pageWidth / 2

                doc.text(`Número: ${ros.numero_reporte}`, col1, y)
                doc.text(`Fecha Detección: ${formatFecha(ros.fecha_deteccion)}`, col2, y)
                y += 6
                doc.text(`Estado: ${ros.estado.toUpperCase()}`, col1, y)
                doc.text(`Tipo Operación: ${ros.tipo_operacion}`, col2, y)
                y += 6
                doc.text(`Monto: ${formatMonto(ros.monto)}`, col1, y)

                y += 15

                // ===== CLIENT INFO =====
                doc.setFillColor(239, 246, 255) // Light blue
                doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 2, 2, 'F')

                doc.setFont('helvetica', 'bold')
                doc.setFontSize(11)
                doc.text('DATOS DEL CLIENTE', margin + 5, y + 8)

                doc.setFont('helvetica', 'normal')
                doc.setFontSize(10)
                doc.text(`Nombre: ${ros.cliente_nombre}`, margin + 5, y + 16)
                doc.text(`DNI/RUC: ${ros.cliente_dni || 'No registrado'}`, margin + 5, y + 22)

                y += 35

                // ===== SUSPICION DETAILS =====
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(11)
                doc.text('MOTIVO DE SOSPECHA', margin, y)

                y += 8
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(10)

                // Word wrap for long text
                const maxWidth = pageWidth - margin * 2
                const lines = doc.splitTextToSize(ros.motivo_sospecha, maxWidth)
                doc.text(lines, margin, y)

                y += lines.length * 5 + 15

                // ===== FOOTER =====
                const footerY = doc.internal.pageSize.getHeight() - 25
                doc.setDrawColor(200, 200, 200)
                doc.setLineWidth(0.3)
                doc.line(margin, footerY, pageWidth - margin, footerY)

                doc.setFontSize(8)
                doc.setTextColor(120, 120, 120)
                doc.text(`Generado el ${new Date().toLocaleDateString('es-PE')}`, margin, footerY + 7)
                doc.text('Sistema JUNTAY - Cumplimiento SBS/UIF', pageWidth / 2, footerY + 7, { align: 'center' })
                doc.text(`Página ${index + 1} de ${filteredReportes.length}`, pageWidth - margin, footerY + 7, { align: 'right' })
            })

            // Save
            const filename = reporteId
                ? `ROS_${filteredReportes[0].numero_reporte}.pdf`
                : `ROS_Consolidado_${new Date().toISOString().split('T')[0]}.pdf`

            doc.save(filename)
        } catch (error) {
            console.error('Error generando PDF:', error)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button
            onClick={generatePDF}
            disabled={generating}
            variant="outline"
            className="gap-2"
        >
            {generating ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <Shield className="h-4 w-4" />
                    <FileDown className="h-4 w-4" />
                    {reporteId ? 'Descargar ROS' : 'Exportar Reportes ROS'}
                </>
            )}
        </Button>
    )
}
