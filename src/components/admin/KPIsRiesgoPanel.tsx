'use client'

import { useEffect, useState } from 'react'
import {
    AlertTriangle,
    TrendingDown,
    PieChart,
    Shield,
    RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { obtenerKPIsRiesgo, type KPIsRiesgo } from '@/lib/actions/kpis-riesgo-actions'
import { cn } from '@/lib/utils'

/**
 * Panel de KPIs de Riesgo - Admin
 * 
 * Aging de cartera, concentración, provisiones
 */
export function KPIsRiesgoPanel() {
    const [kpis, setKpis] = useState<KPIsRiesgo | null>(null)
    const [loading, setLoading] = useState(true)

    const cargarKPIs = async () => {
        setLoading(true)
        try {
            const data = await obtenerKPIsRiesgo()
            setKpis(data)
        } catch (err) {
            console.error('Error cargando KPIs riesgo:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarKPIs()
    }, [])

    const formatMonto = (monto: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)

    if (loading && !kpis) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2].map(i => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
                            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!kpis) return null

    const getRiskColor = (rango: string) => {
        switch (rango) {
            case 'Al día': return 'bg-green-500'
            case '1-30 días': return 'bg-yellow-400'
            case '31-60 días': return 'bg-orange-500'
            case '61-90 días': return 'bg-red-500'
            case '+90 días': return 'bg-red-700'
            default: return 'bg-gray-400'
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    KPIs de Riesgo
                </h2>
                <Button variant="ghost" size="sm" onClick={cargarKPIs} disabled={loading}>
                    <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                    Actualizar
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Aging de Cartera */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" />
                            Aging de Cartera
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {kpis.aging.buckets.map(bucket => (
                            <div key={bucket.rango} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className={cn('w-3 h-3 rounded-full', getRiskColor(bucket.rango))} />
                                        {bucket.rango}
                                    </span>
                                    <span className="font-medium">
                                        {bucket.creditos} • {formatMonto(bucket.monto)}
                                    </span>
                                </div>
                                <Progress
                                    value={bucket.porcentaje}
                                    className="h-2"
                                />
                                <span className="text-xs text-muted-foreground">
                                    {bucket.porcentaje.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                        <div className="pt-2 border-t">
                            <div className="flex justify-between font-medium">
                                <span>Total Vencido</span>
                                <span className="text-red-600">
                                    {formatMonto(kpis.aging.totalVencido)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Concentración + Provisiones */}
                <div className="space-y-4">
                    {/* Concentración */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <PieChart className="h-4 w-4" />
                                Concentración Top 10
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {kpis.concentracion.porcentajeTop10.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatMonto(kpis.concentracion.top10Monto)} de cartera
                            </p>
                            <Progress
                                value={kpis.concentracion.porcentajeTop10}
                                className="h-2 mt-2"
                            />
                        </CardContent>
                    </Card>

                    {/* Provisiones */}
                    <Card className="border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-500" />
                                Provisión Sugerida
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatMonto(kpis.provisiones.sugerida)}
                            </div>
                            <div className="mt-2 space-y-1 text-xs">
                                {kpis.provisiones.porBucket
                                    .filter(b => b.provision > 0)
                                    .map(b => (
                                        <div key={b.rango} className="flex justify-between">
                                            <span>{b.rango} ({b.tasaProvision}%)</span>
                                            <span>{formatMonto(b.provision)}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-right">
                Última actualización: {new Date(kpis.ultimaActualizacion).toLocaleString('es-PE')}
            </p>
        </div>
    )
}
