'use client'

import { useState } from 'react'
import {
    Download,
    FileSpreadsheet,
    FileText,
    Loader2,
    Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

/**
 * Panel de Exportación de Reportes - Admin
 */
export function ReportesExportPanel() {
    const [downloading, setDownloading] = useState<string | null>(null)

    const descargarReporte = async (tipo: string, label: string) => {
        setDownloading(tipo)
        try {
            const response = await fetch(`/api/admin/reportes/${tipo}`)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Error descargando reporte')
            }

            // Obtener el blob y descargar
            const blob = await response.blob()
            const filename = response.headers.get('Content-Disposition')
                ?.split('filename="')[1]?.replace('"', '')
                || `reporte_${tipo}.csv`

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success(`${label} descargado`, {
                description: filename
            })
        } catch (error) {
            console.error('Error descargando:', error)
            toast.error('Error al descargar', {
                description: error instanceof Error ? error.message : 'Intenta de nuevo'
            })
        } finally {
            setDownloading(null)
        }
    }

    const reportes = [
        {
            tipo: 'kpis',
            label: 'KPIs de Cobranza',
            descripcion: 'Métricas actuales de recaudación, mora y riesgo',
            icon: FileSpreadsheet,
            color: 'text-green-600'
        },
        {
            tipo: 'recibos',
            label: 'Recibos del Mes',
            descripcion: 'Listado de recibos emitidos con estados',
            icon: FileText,
            color: 'text-blue-600'
        },
        {
            tipo: 'cartera',
            label: 'Cartera Vencida',
            descripcion: 'Créditos en mora con días de atraso',
            icon: Calendar,
            color: 'text-red-600'
        }
    ]

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Exportar Reportes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                    {reportes.map(reporte => {
                        const Icon = reporte.icon
                        const isDownloading = downloading === reporte.tipo

                        return (
                            <div
                                key={reporte.tipo}
                                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <Icon className={`h-8 w-8 ${reporte.color}`} />
                                    <div className="flex-1">
                                        <h4 className="font-medium">{reporte.label}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {reporte.descripcion}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-3"
                                    onClick={() => descargarReporte(reporte.tipo, reporte.label)}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4 mr-2" />
                                            Descargar CSV
                                        </>
                                    )}
                                </Button>
                            </div>
                        )
                    })}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                    Los reportes se generan en tiempo real con datos actuales
                </p>
            </CardContent>
        </Card>
    )
}
