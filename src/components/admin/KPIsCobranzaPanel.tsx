'use client'

import { useEffect, useState } from 'react'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    FileText,
    RefreshCw,
    AlertTriangle,
    CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { obtenerKPIsCobranza, type KPIsCobranza } from '@/lib/actions/kpis-cobranza-actions'
import { cn } from '@/lib/utils'

/**
 * Panel de KPIs de Cobranza - Admin
 * 
 * UI mínima, read-only, datos en tiempo real
 */
export function KPIsCobranzaPanel() {
    const [kpis, setKpis] = useState<KPIsCobranza | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const cargarKPIs = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await obtenerKPIsCobranza()
            setKpis(data)
        } catch (err) {
            console.error('Error cargando KPIs:', err)
            setError('Error al cargar métricas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarKPIs()
        // Auto-refresh cada 5 minutos
        const interval = setInterval(cargarKPIs, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const formatMonto = (monto: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(monto)

    if (loading && !kpis) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Card className="border-red-200">
                <CardContent className="py-8 text-center text-red-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>{error}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={cargarKPIs}>
                        Reintentar
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (!kpis) return null

    const moraAlta = kpis.mora.porcentaje > 10
    const moraMedio = kpis.mora.porcentaje > 5 && kpis.mora.porcentaje <= 10

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">KPIs de Cobranza</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={cargarKPIs}
                    disabled={loading}
                >
                    <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                    Actualizar
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Recaudación Hoy */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recaudación Hoy</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatMonto(kpis.recaudacion.hoy)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Semana: {formatMonto(kpis.recaudacion.semana)}
                        </p>
                    </CardContent>
                </Card>

                {/* Mora */}
                <Card className={cn(
                    moraAlta && 'border-red-300',
                    moraMedio && 'border-yellow-300'
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mora Actual</CardTitle>
                        <TrendingDown className={cn(
                            'h-4 w-4',
                            moraAlta ? 'text-red-500' : moraMedio ? 'text-yellow-500' : 'text-green-500'
                        )} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            'text-2xl font-bold',
                            moraAlta ? 'text-red-600' : moraMedio ? 'text-yellow-600' : 'text-green-600'
                        )}>
                            {kpis.mora.porcentaje.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {kpis.mora.creditosEnMora} créditos • {formatMonto(kpis.mora.montoTotal)}
                        </p>
                    </CardContent>
                </Card>

                {/* Créditos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Créditos Activos</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpis.creditos.activos}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {kpis.creditos.cerrados} cerrados • {kpis.creditos.total} total
                        </p>
                    </CardContent>
                </Card>

                {/* Recibos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recibos (Mes)</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {kpis.recibos.emitidos}
                            {kpis.recibos.errores > 0 && (
                                <span className="text-xs text-red-500 font-normal">
                                    ({kpis.recibos.errores} error)
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {kpis.recibos.enviados} enviados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recaudación Mensual (extra) */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Recaudación del Mes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-primary">
                        {formatMonto(kpis.recaudacion.mes)}
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <p className="text-xs text-muted-foreground text-right">
                Última actualización: {new Date(kpis.ultimaActualizacion).toLocaleString('es-PE')}
            </p>
        </div>
    )
}
