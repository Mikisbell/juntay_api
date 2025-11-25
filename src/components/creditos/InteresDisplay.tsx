import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp, Calendar, Percent, DollarSign } from 'lucide-react'
import { formatearMonto } from '@/lib/utils'

interface InteresDisplayProps {
    montoPrestado: number
    tasaInteres: number
    diasTranscurridos: number
    interesDevengado: number
    interesTotalVencimiento: number
    porcentajeDevengado: number
    className?: string
}

export function InteresDisplay({
    montoPrestado,
    tasaInteres,
    diasTranscurridos,
    interesDevengado,
    interesTotalVencimiento,
    porcentajeDevengado,
    className
}: InteresDisplayProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Información de Intereses
                </CardTitle>
                <CardDescription>
                    Cálculo automático basado en {diasTranscurridos} días transcurridos
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Capital */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>Capital Prestado</span>
                    </div>
                    <span className="font-semibold">{formatearMonto(montoPrestado)}</span>
                </div>

                {/* Tasa */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Percent className="w-4 h-4" />
                        <span>Tasa Mensual</span>
                    </div>
                    <Badge variant="outline">{tasaInteres}%</Badge>
                </div>

                {/* Días */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Días Transcurridos</span>
                    </div>
                    <Badge variant="secondary">{diasTranscurridos} días</Badge>
                </div>

                <div className="border-t pt-4 space-y-3">
                    {/* Interés Devengado */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-help">
                                    <span className="text-sm font-medium text-blue-900">
                                        Interés Devengado
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatearMonto(interesDevengado)}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">
                                    Fórmula: {formatearMonto(montoPrestado)} × {tasaInteres}% × ({diasTranscurridos}/30)
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Interés Total al Vencimiento */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Al vencimiento</span>
                        <span className="font-medium">{formatearMonto(interesTotalVencimiento)}</span>
                    </div>

                    {/* Progreso */}
                    <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>Progreso del interés</span>
                            <span>{porcentajeDevengado.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(porcentajeDevengado, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Total a Pagar Hoy */}
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total a Pagar Hoy</span>
                        <span className="text-xl font-bold text-green-600">
                            {formatearMonto(montoPrestado + interesDevengado)}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Capital + Interés devengado hasta hoy
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

// Versión compacta para mostrar en listas
export function InteresCompact({
    interesDevengado,
    diasTranscurridos
}: {
    interesDevengado: number
    diasTranscurridos: number
}) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-600">
                            {formatearMonto(interesDevengado)}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">Interés devengado ({diasTranscurridos} días)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
