'use client'

import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardData } from '@/lib/hooks/useDashboardData'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * KPI Widget que muestra el porcentaje de cartera en mora
 * 
 * Colores:
 * - Rojo: > 10%
 * - Amarillo: 5-10%
 * - Verde: < 5%
 */
export function KpiMoraWidget() {
    const { data, loading, error } = useDashboardData()

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cartera en Mora</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </CardContent>
            </Card>
        )
    }

    if (error || !data) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Cartera en Mora
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-500">Error al cargar datos</p>
                </CardContent>
            </Card>
        )
    }

    const { cartera } = data

    // Cálculo del porcentaje de mora
    const totalCreditos = cartera.al_dia.count + cartera.por_vencer.count + cartera.en_mora.count
    const creditosEnMora = cartera.en_mora.count
    const montoEnMora = cartera.en_mora.total

    const porcentajeMora = totalCreditos > 0
        ? (creditosEnMora / totalCreditos) * 100
        : 0

    // Determinar nivel de riesgo y colores
    const getNivelRiesgo = (porcentaje: number) => {
        if (porcentaje > 10) return {
            nivel: 'alto',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20',
            icon: AlertTriangle,
            label: 'Riesgo Alto'
        }
        if (porcentaje >= 5) return {
            nivel: 'medio',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            icon: TrendingUp,
            label: 'Precaución'
        }
        return {
            nivel: 'bajo',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
            icon: CheckCircle,
            label: 'Saludable'
        }
    }

    const riesgo = getNivelRiesgo(porcentajeMora)
    const IconComponent = riesgo.icon

    // Formatear monto en soles
    const formatMonto = (monto: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(monto)
    }

    return (
        <Card className={cn('transition-colors', riesgo.borderColor, 'border-2')}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Cartera en Mora
                    </CardTitle>
                    <div className={cn('p-1.5 rounded-full', riesgo.bgColor)}>
                        <IconComponent className={cn('h-4 w-4', riesgo.color)} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {/* Porcentaje principal */}
                    <div className="flex items-baseline gap-2">
                        <span className={cn('text-3xl font-bold', riesgo.color)}>
                            {porcentajeMora.toFixed(1)}%
                        </span>
                        <span className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            riesgo.bgColor,
                            riesgo.color
                        )}>
                            {riesgo.label}
                        </span>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Créditos en mora</span>
                            <span className="font-medium text-foreground">
                                {creditosEnMora} de {totalCreditos}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Monto comprometido</span>
                            <span className={cn('font-medium', riesgo.color)}>
                                {formatMonto(montoEnMora)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
