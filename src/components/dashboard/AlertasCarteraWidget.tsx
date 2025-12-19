'use client'

import { useMemo } from 'react'
import { AlertTriangle, Clock, Calendar, Phone, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDashboardData, type ContratoUrgente } from '@/lib/hooks/useDashboardData'
import { cn } from '@/lib/utils'

interface AlertaCategoria {
    label: string
    color: string
    bgColor: string
    borderColor: string
    icon: typeof AlertTriangle
}

const CATEGORIAS: Record<string, AlertaCategoria> = {
    vencido: {
        label: 'Vencido',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        icon: AlertTriangle
    },
    hoy: {
        label: 'Vence HOY',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        icon: Clock
    },
    manana: {
        label: 'Mañana',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        icon: Calendar
    },
    semana: {
        label: 'Esta semana',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        icon: Calendar
    }
}

function getCategoria(diasVencido: number): keyof typeof CATEGORIAS {
    if (diasVencido > 0) return 'vencido'
    if (diasVencido === 0) return 'hoy'
    if (diasVencido === -1) return 'manana'
    return 'semana'
}

function getDiasLabel(diasVencido: number): string {
    if (diasVencido > 0) return `${diasVencido} día${diasVencido > 1 ? 's' : ''} vencido`
    if (diasVencido === 0) return 'Vence hoy'
    if (diasVencido === -1) return 'Vence mañana'
    return `Vence en ${Math.abs(diasVencido)} días`
}

interface AlertaItemProps {
    contrato: ContratoUrgente
}

function AlertaItem({ contrato }: AlertaItemProps) {
    const categoria = getCategoria(contrato.dias_vencido)
    const config = CATEGORIAS[categoria]
    const IconComponent = config.icon

    const formatMonto = (monto: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(monto)
    }

    const whatsappUrl = contrato.cliente_telefono
        ? `https://wa.me/51${contrato.cliente_telefono.replace(/\D/g, '')}`
        : null

    return (
        <div className={cn(
            'p-3 rounded-lg border transition-colors hover:bg-muted/50',
            config.borderColor
        )}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className={cn('p-1 rounded', config.bgColor)}>
                        <IconComponent className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm truncate">
                                {contrato.cliente_nombre}
                            </span>
                            <Badge variant="outline" className="text-xs">
                                #{contrato.codigo}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className={cn('font-medium', config.color)}>
                                {getDiasLabel(contrato.dias_vencido)}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">
                                {formatMonto(contrato.saldo)}
                            </span>
                        </div>
                    </div>
                </div>

                {whatsappUrl && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        asChild
                    >
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Contactar por WhatsApp"
                        >
                            <Phone className="h-4 w-4 text-green-500" />
                        </a>
                    </Button>
                )}
            </div>
        </div>
    )
}

interface AlertasCarteraWidgetProps {
    maxAlertas?: number
}

/**
 * Widget que muestra alertas priorizadas de cartera vencida
 * 
 * Prioridad:
 * 1. Vencidos (días > 0) - Rojo
 * 2. Vence Hoy (días = 0) - Amarillo
 * 3. Vence Mañana (días = -1) - Naranja
 * 4. Esta semana (días < -1) - Azul
 */
export function AlertasCarteraWidget({ maxAlertas = 8 }: AlertasCarteraWidgetProps) {
    const { data, loading, error } = useDashboardData()

    const alertasOrdenadas = useMemo(() => {
        if (!data?.contratos_urgentes) return []

        // Ordenar por urgencia: vencidos primero, luego por días
        return [...data.contratos_urgentes]
            .sort((a, b) => b.dias_vencido - a.dias_vencido)
            .slice(0, maxAlertas)
    }, [data?.contratos_urgentes, maxAlertas])

    const conteosCategorias = useMemo(() => {
        if (!data?.contratos_urgentes) return { vencidos: 0, hoy: 0, total: 0 }

        const vencidos = data.contratos_urgentes.filter(c => c.dias_vencido > 0).length
        const hoy = data.contratos_urgentes.filter(c => c.dias_vencido === 0).length

        return { vencidos, hoy, total: data.contratos_urgentes.length }
    }, [data?.contratos_urgentes])

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Alertas de Cartera</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (error || !data) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Alertas de Cartera
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-500">Error al cargar alertas</p>
                </CardContent>
            </Card>
        )
    }

    const hasCritical = conteosCategorias.vencidos > 0 || conteosCategorias.hoy > 0

    return (
        <Card className={cn(
            hasCritical && 'border-red-500/30 border-2'
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {hasCritical && (
                            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                        )}
                        Alertas de Cartera
                        {conteosCategorias.total > 0 && (
                            <Badge variant={hasCritical ? 'destructive' : 'secondary'}>
                                {conteosCategorias.total}
                            </Badge>
                        )}
                    </CardTitle>

                    {conteosCategorias.total > maxAlertas && (
                        <Button variant="ghost" size="sm" className="text-xs" asChild>
                            <a href="/dashboard/vencimientos">
                                Ver todos
                                <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        </Button>
                    )}
                </div>

                {hasCritical && (
                    <div className="flex gap-2 mt-2">
                        {conteosCategorias.vencidos > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {conteosCategorias.vencidos} vencido{conteosCategorias.vencidos > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {conteosCategorias.hoy > 0 && (
                            <Badge className="bg-yellow-500 text-xs">
                                {conteosCategorias.hoy} vence{conteosCategorias.hoy > 1 ? 'n' : ''} hoy
                            </Badge>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {alertasOrdenadas.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay alertas pendientes</p>
                        <p className="text-xs mt-1">✓ Cartera saludable</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-2">
                        <div className="space-y-2">
                            {alertasOrdenadas.map(contrato => (
                                <AlertaItem key={contrato.id} contrato={contrato} />
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
