'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    TrendingUp,
    Users,
    Calendar,
    AlertCircle,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react'
import { obtenerResumenInversionistas, obtenerAlertasPagosPendientes } from '@/lib/actions/rendimientos-actions'

// ============================================================================
// TYPES
// ============================================================================

interface ResumenTotales {
    capitalTotal: number
    rendimientoDevengado: number
    rendimientoPagado: number
    rendimientoPendiente: number
    numInversionistas: number
}

interface AlertaPago {
    id: string
    contrato_id: string
    inversionista: string
    fecha_programada: string
    monto: number
    tipo: string
    diasParaPago: number
    estado: 'VENCIDO' | 'URGENTE' | 'PROXIMO'
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RendimientosDashboard() {
    const [loading, setLoading] = useState(true)
    const [totales, setTotales] = useState<ResumenTotales | null>(null)
    const [alertas, setAlertas] = useState<AlertaPago[]>([])

    useEffect(() => {
        async function cargarDatos() {
            try {
                const [resumenData, alertasData] = await Promise.all([
                    obtenerResumenInversionistas(),
                    obtenerAlertasPagosPendientes()
                ])

                if (resumenData) {
                    setTotales(resumenData.totales)
                }
                setAlertas(alertasData as AlertaPago[])
            } catch (error) {
                console.error('Error cargando datos:', error)
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="h-32 bg-muted/50" />
                ))}
            </div>
        )
    }

    const formatCurrency = (value: number) =>
        `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Capital Total */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-600 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Capital Invertido
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">
                            {formatCurrency(totales?.capitalTotal || 0)}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                            {totales?.numInversionistas || 0} inversionistas activos
                        </p>
                    </CardContent>
                </Card>

                {/* Rendimiento Devengado */}
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-600 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Rendimiento Devengado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">
                            {formatCurrency(totales?.rendimientoDevengado || 0)}
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">
                            Acumulado hasta hoy
                        </p>
                    </CardContent>
                </Card>

                {/* Rendimiento Pagado */}
                <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-violet-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Rendimiento Pagado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-violet-900">
                            {formatCurrency(totales?.rendimientoPagado || 0)}
                        </div>
                        <p className="text-xs text-violet-600 mt-1">
                            Ya entregado a inversionistas
                        </p>
                    </CardContent>
                </Card>

                {/* Pendiente */}
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-600 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Por Pagar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">
                            {formatCurrency(totales?.rendimientoPendiente || 0)}
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                            Rendimiento pendiente de pago
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alertas de Pagos */}
            {alertas.length > 0 && (
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Alertas de Pagos
                            <Badge variant="destructive">{alertas.length}</Badge>
                        </CardTitle>
                        <CardDescription>
                            Pagos próximos o vencidos a inversionistas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {alertas.map(alerta => (
                                <div
                                    key={alerta.id}
                                    className={`p-3 rounded-lg border flex items-center justify-between ${alerta.estado === 'VENCIDO'
                                            ? 'bg-red-50 border-red-200'
                                            : alerta.estado === 'URGENTE'
                                                ? 'bg-amber-50 border-amber-200'
                                                : 'bg-blue-50 border-blue-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${alerta.estado === 'VENCIDO'
                                                ? 'bg-red-100'
                                                : alerta.estado === 'URGENTE'
                                                    ? 'bg-amber-100'
                                                    : 'bg-blue-100'
                                            }`}>
                                            {alerta.estado === 'VENCIDO'
                                                ? <XCircle className="w-4 h-4 text-red-600" />
                                                : <Calendar className="w-4 h-4 text-amber-600" />
                                            }
                                        </div>
                                        <div>
                                            <div className="font-medium">{alerta.inversionista}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {alerta.tipo} - {new Date(alerta.fecha_programada).toLocaleDateString('es-PE')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {formatCurrency(alerta.monto)}
                                        </div>
                                        <Badge
                                            variant={
                                                alerta.estado === 'VENCIDO'
                                                    ? 'destructive'
                                                    : alerta.estado === 'URGENTE'
                                                        ? 'secondary'
                                                        : 'outline'
                                            }
                                            className="text-xs"
                                        >
                                            {alerta.estado === 'VENCIDO'
                                                ? `Vencido hace ${Math.abs(alerta.diasParaPago)} días`
                                                : alerta.estado === 'URGENTE'
                                                    ? `En ${alerta.diasParaPago} días`
                                                    : `En ${alerta.diasParaPago} días`
                                            }
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
