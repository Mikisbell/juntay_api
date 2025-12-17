'use client'

import { AlertTriangle, CheckCircle2, AlertCircle, TrendingDown, Wallet, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type NivelAlertaLiquidez = 'NORMAL' | 'PRECAUCION' | 'CRITICO'

export interface IndicadoresLiquidezProps {
    efectivoDisponible: number
    digitalDisponible: number
    totalLiquidez: number
    ratioEfectivo: number
    umbralMinimo: number
    alertaLiquidez: NivelAlertaLiquidez
    capitalInvertido?: number
    rendimientosPendientes?: number
}

const alertaConfig = {
    NORMAL: {
        color: 'bg-emerald-500',
        bgLight: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700',
        icon: CheckCircle2,
        label: 'Liquidez Óptima',
        description: 'Efectivo por encima del umbral mínimo operativo'
    },
    PRECAUCION: {
        color: 'bg-amber-500',
        bgLight: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        icon: AlertTriangle,
        label: 'Precaución',
        description: 'Efectivo cerca del mínimo. Considere fondear.'
    },
    CRITICO: {
        color: 'bg-red-500',
        bgLight: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        icon: AlertCircle,
        label: 'Alerta Crítica',
        description: '¡Efectivo bajo umbral! Fondee inmediatamente.'
    }
}

export function LiquidezIndicador({
    efectivoDisponible,
    digitalDisponible,
    totalLiquidez,
    ratioEfectivo,
    umbralMinimo,
    alertaLiquidez,
    capitalInvertido = 0,
    rendimientosPendientes = 0
}: IndicadoresLiquidezProps) {
    const config = alertaConfig[alertaLiquidez]
    const IconComponent = config.icon
    const porcentajeUmbral = Math.min((efectivoDisponible / umbralMinimo) * 100, 150)

    const formatMonto = (monto: number) =>
        `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

    return (
        <Card className={cn(
            'border-2 transition-colors relative overflow-hidden',
            config.bgLight
        )}>
            {/* Indicador de semáforo animado */}
            <div className={cn(
                'absolute top-0 right-0 w-2 h-full',
                config.color,
                alertaLiquidez === 'CRITICO' && 'animate-pulse'
            )} />

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <IconComponent className={cn('h-5 w-5', config.text)} />
                        Indicadores de Liquidez
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className={cn(
                            'font-medium',
                            alertaLiquidez === 'NORMAL' && 'border-emerald-500 text-emerald-700 bg-emerald-100',
                            alertaLiquidez === 'PRECAUCION' && 'border-amber-500 text-amber-700 bg-amber-100',
                            alertaLiquidez === 'CRITICO' && 'border-red-500 text-red-700 bg-red-100'
                        )}
                    >
                        {config.label}
                    </Badge>
                </div>
                <p className={cn('text-xs', config.text)}>{config.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Barra de progreso hacia umbral mínimo */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Efectivo vs Umbral Mínimo</span>
                        <span className={cn('font-medium', config.text)}>
                            {Math.round(porcentajeUmbral)}%
                        </span>
                    </div>
                    <Progress
                        value={porcentajeUmbral}
                        className={cn(
                            'h-2',
                            alertaLiquidez === 'NORMAL' && '[&>div]:bg-emerald-500',
                            alertaLiquidez === 'PRECAUCION' && '[&>div]:bg-amber-500',
                            alertaLiquidez === 'CRITICO' && '[&>div]:bg-red-500'
                        )}
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Umbral mínimo operativo: {formatMonto(umbralMinimo)}
                    </p>
                </div>

                {/* Grid de métricas */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Efectivo */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-slate-800/60">
                        <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <Wallet className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Efectivo</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {formatMonto(efectivoDisponible)}
                            </p>
                        </div>
                    </div>

                    {/* Digital */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-slate-800/60">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Bancos/Digital</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {formatMonto(digitalDisponible)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Métricas secundarias: Capital invertido y rendimientos */}
                {(capitalInvertido > 0 || rendimientosPendientes > 0) && (
                    <div className="pt-2 border-t border-dashed">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                Capital activo de inversores
                            </span>
                            <span className="font-medium text-slate-700">
                                {formatMonto(capitalInvertido)}
                            </span>
                        </div>
                        {rendimientosPendientes > 0 && (
                            <div className="flex justify-between text-xs mt-1">
                                <span className="flex items-center gap-1 text-amber-600">
                                    <TrendingDown className="h-3 w-3" />
                                    Rendimientos pendientes
                                </span>
                                <span className="font-medium text-amber-700">
                                    {formatMonto(rendimientosPendientes)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Ratio de efectivo */}
                <div className="flex justify-between items-center pt-2 border-t text-xs">
                    <span className="text-muted-foreground">
                        Ratio Efectivo / Total
                    </span>
                    <Badge variant="secondary" className="font-mono">
                        {ratioEfectivo.toFixed(1)}%
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}
