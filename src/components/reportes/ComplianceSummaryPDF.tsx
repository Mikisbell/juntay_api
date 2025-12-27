'use client'

/**
 * ComplianceSummaryPDF - Resumen de Cumplimiento SBS para auditorías
 * Genera un informe consolidado del estado de cumplimiento normativo
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2, ScrollText } from 'lucide-react'
import jsPDF from 'jspdf'
import { obtenerEstadisticasCumplimiento } from '@/lib/actions/compliance-actions'

function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
}

interface Props {
    empresaId: string
    empresaNombre?: string
}

export function ComplianceSummaryPDF({ empresaId, empresaNombre }: Props) {
    const [generating, setGenerating] = useState(false)

    const generatePDF = async () => {
        setGenerating(true)
        try {
            const stats = await obtenerEstadisticasCumplimiento(empresaId)

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const pageWidth = doc.internal.pageSize.getWidth()
            const margin = 15
            let y = 20

            // ===== HEADER =====
            doc.setFillColor(79, 70, 229) // Indigo
            doc.rect(0, 0, pageWidth, 40, 'F')

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(18)
            doc.setTextColor(255, 255, 255)
            doc.text('INFORME DE CUMPLIMIENTO', pageWidth / 2, 15, { align: 'center' })

            doc.setFontSize(12)
            doc.text('SBS / UIF - PERÚ', pageWidth / 2, 25, { align: 'center' })

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(empresaNombre || 'Empresa', pageWidth / 2, 35, { align: 'center' })

            doc.setTextColor(0, 0, 0)
            y = 55

            // ===== COMPLIANCE OFFICER =====
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('1. OFICIAL DE CUMPLIMIENTO', margin, y)

            y += 10
            if (stats.oficial) {
                doc.setFillColor(220, 252, 231) // Green light
                doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 2, 2, 'F')

                doc.setFont('helvetica', 'normal')
                doc.setFontSize(10)
                doc.text('✓ Oficial designado', margin + 5, y + 8)
                doc.text(`Nombre: ${stats.oficial.nombres} ${stats.oficial.apellidos}`, margin + 5, y + 15)
                doc.text(`DNI: ${stats.oficial.dni} | Email: ${stats.oficial.email}`, margin + 5, y + 22)
                doc.text(`Registrado UIF: ${stats.oficial.registrado_uif ? 'SÍ' : 'PENDIENTE'}`, margin + 120, y + 8)
            } else {
                doc.setFillColor(254, 226, 226) // Red light
                doc.roundedRect(margin, y, pageWidth - margin * 2, 15, 2, 2, 'F')
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(185, 28, 28)
                doc.text('⚠ SIN OFICIAL DE CUMPLIMIENTO DESIGNADO', margin + 5, y + 10)
                doc.setTextColor(0, 0, 0)
            }

            y += stats.oficial ? 40 : 25

            // ===== ROS STATS =====
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('2. REPORTES DE OPERACIÓN SOSPECHOSA (ROS)', margin, y)

            y += 10
            doc.setFillColor(254, 249, 195) // Yellow light
            doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 2, 2, 'F')

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            const rosCol = (pageWidth - margin * 2) / 3
            doc.text(`Total: ${stats.rosStats.total}`, margin + 10, y + 10)
            doc.text(`Borradores: ${stats.rosStats.borradores}`, margin + rosCol + 10, y + 10)
            doc.text(`Enviados UIF: ${stats.rosStats.enviados}`, margin + rosCol * 2 + 10, y + 10)

            y += 35

            // ===== KYC STATS =====
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('3. VERIFICACIÓN DE CLIENTES (KYC)', margin, y)

            y += 10
            doc.setFillColor(219, 234, 254) // Blue light
            doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 2, 2, 'F')

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            const kycCol = (pageWidth - margin * 2) / 4
            doc.text(`Total: ${stats.kycStats.total}`, margin + 5, y + 10)
            doc.text(`Verificados: ${stats.kycStats.verificados}`, margin + kycCol + 5, y + 10)
            doc.text(`Pendientes: ${stats.kycStats.pendientes}`, margin + kycCol * 2 + 5, y + 10)

            if (stats.kycStats.altoRiesgo > 0) {
                doc.setTextColor(185, 28, 28)
                doc.setFont('helvetica', 'bold')
            }
            doc.text(`Alto Riesgo: ${stats.kycStats.altoRiesgo}`, margin + kycCol * 3 + 5, y + 10)
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'normal')

            y += 35

            // ===== LEGAL FRAMEWORK =====
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text('4. MARCO NORMATIVO APLICABLE', margin, y)

            y += 8
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.text('• Resolución SBS N° 00650-2024 - Registro de Empresas', margin + 5, y)
            y += 5
            doc.text('• Ley N.º 27693 - Ley de la UIF-Perú', margin + 5, y)
            y += 5
            doc.text('• Decreto Supremo 010-2025-JUS - Política Nacional contra Lavado de Activos', margin + 5, y)
            y += 5
            doc.text('• Resolución SBS N° 00413-2025 - Supervisión reforzada', margin + 5, y)

            // ===== FOOTER =====
            const footerY = doc.internal.pageSize.getHeight() - 30
            doc.setDrawColor(79, 70, 229)
            doc.setLineWidth(0.5)
            doc.line(margin, footerY, pageWidth - margin, footerY)

            doc.setFontSize(9)
            doc.setTextColor(100, 100, 100)
            doc.text(`Informe generado el ${formatFecha(new Date().toISOString())}`, margin, footerY + 8)
            doc.text('Este documento es para uso interno y auditorías regulatorias', pageWidth / 2, footerY + 8, { align: 'center' })

            doc.setFontSize(8)
            doc.text('Sistema JUNTAY - Gestión de Cumplimiento SBS/UIF', pageWidth / 2, footerY + 15, { align: 'center' })

            // Save
            doc.save(`Cumplimiento_${empresaId.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`)
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
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
            {generating ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <ScrollText className="h-4 w-4" />
                    <FileDown className="h-4 w-4" />
                    Informe Cumplimiento
                </>
            )}
        </Button>
    )
}
