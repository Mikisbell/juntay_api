'use client'

import { useEffect, useState } from 'react'
import {
    Star,
    Shield,
    AlertTriangle,
    User,
    RefreshCw,
    TrendingUp,
    TrendingDown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
    calcularScoringCliente,
    type ScoringCliente,
    type CategoriaCliente
} from '@/lib/actions/scoring-cliente-actions'
import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
    clienteId: string
    compact?: boolean
    showTooltip?: boolean
}

/**
 * Badge de Score de Cliente
 * 
 * Muestra el puntaje y categoría del cliente
 */
export function ScoreBadgeCliente({
    clienteId,
    compact = false,
    showTooltip = true
}: ScoreBadgeProps) {
    const [scoring, setScoring] = useState<ScoringCliente | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            setLoading(true)
            try {
                const data = await calcularScoringCliente(clienteId)
                setScoring(data)
            } catch (err) {
                console.error('Error cargando scoring:', err)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [clienteId])

    if (loading) {
        return <Skeleton className={compact ? 'h-5 w-12' : 'h-6 w-20'} />
    }

    if (!scoring) return null

    const config = getCategoriaConfig(scoring.categoria)
    const Icon = config.icon

    const badge = (
        <Badge
            variant="outline"
            className={cn(
                'gap-1',
                config.bgColor,
                config.textColor,
                config.borderColor
            )}
        >
            <Icon className={cn('h-3 w-3', config.iconColor)} />
            {compact ? (
                <span className="font-bold">{scoring.puntaje}</span>
            ) : (
                <>
                    <span className="font-bold">{scoring.puntaje}</span>
                    <span className="text-xs">/ {scoring.categoria}</span>
                </>
            )}
        </Badge>
    )

    if (!showTooltip) return badge

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Icon className={cn('h-4 w-4', config.iconColor)} />
                            <span className="font-bold">{scoring.categoria}</span>
                            <span>({scoring.puntaje} pts)</span>
                        </div>

                        {scoring.tasaSugerida > 0 && (
                            <div className="text-green-600 text-sm">
                                ★ {scoring.tasaSugerida}% descuento en tasas
                            </div>
                        )}

                        {scoring.factoresPositivos.length > 0 && (
                            <div className="text-sm">
                                <span className="text-green-600">+</span>{' '}
                                {scoring.factoresPositivos.slice(0, 2).join(', ')}
                            </div>
                        )}

                        {scoring.factoresNegativos.length > 0 && (
                            <div className="text-sm text-red-600">
                                − {scoring.factoresNegativos.slice(0, 2).join(', ')}
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

/**
 * Panel completo de Score (para ficha de cliente)
 */
export function ScorePanelCliente({ clienteId }: { clienteId: string }) {
    const [scoring, setScoring] = useState<ScoringCliente | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            setLoading(true)
            try {
                const data = await calcularScoringCliente(clienteId)
                setScoring(data)
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [clienteId])

    const recargar = async () => {
        setLoading(true)
        try {
            const data = await calcularScoringCliente(clienteId)
            setScoring(data)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-4 border rounded-lg animate-pulse">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-20 w-full" />
            </div>
        )
    }

    if (!scoring) return null

    const config = getCategoriaConfig(scoring.categoria)
    const Icon = config.icon

    return (
        <div className={cn(
            'p-4 border rounded-lg',
            config.bgColor
        )}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon className={cn('h-5 w-5', config.iconColor)} />
                    <span className="font-bold">{scoring.categoria}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{scoring.puntaje}</span>
                    <span className="text-muted-foreground">/ 100</span>
                    <button onClick={recargar} className="p-1 hover:bg-muted rounded">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div
                    className={cn('h-full transition-all', config.barColor)}
                    style={{ width: `${scoring.puntaje}%` }}
                />
            </div>

            {/* Detalles */}
            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div className="text-center">
                    <div className="font-bold text-green-600">{scoring.detalles.pagosATiempo}</div>
                    <div className="text-xs text-muted-foreground">A tiempo</div>
                </div>
                <div className="text-center">
                    <div className="font-bold text-red-600">{scoring.detalles.pagosAtrasados}</div>
                    <div className="text-xs text-muted-foreground">Atrasados</div>
                </div>
                <div className="text-center">
                    <div className="font-bold">{scoring.detalles.creditosCompletados}</div>
                    <div className="text-xs text-muted-foreground">Completados</div>
                </div>
            </div>

            {/* Factores */}
            <div className="space-y-1 text-xs">
                {scoring.factoresPositivos.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        {f}
                    </div>
                ))}
                {scoring.factoresNegativos.slice(0, 2).map((f, i) => (
                    <div key={i} className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="h-3 w-3" />
                        {f}
                    </div>
                ))}
            </div>

            {/* Tasa VIP */}
            {scoring.tasaSugerida > 0 && (
                <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-800 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Elegible para {scoring.tasaSugerida}% descuento en tasas
                </div>
            )}
        </div>
    )
}

// ============ HELPERS ============

function getCategoriaConfig(categoria: CategoriaCliente) {
    switch (categoria) {
        case 'VIP':
            return {
                icon: Star,
                bgColor: 'bg-yellow-50',
                textColor: 'text-yellow-700',
                borderColor: 'border-yellow-300',
                iconColor: 'text-yellow-500',
                barColor: 'bg-yellow-500'
            }
        case 'BUENO':
            return {
                icon: Shield,
                bgColor: 'bg-green-50',
                textColor: 'text-green-700',
                borderColor: 'border-green-300',
                iconColor: 'text-green-500',
                barColor: 'bg-green-500'
            }
        case 'REGULAR':
            return {
                icon: User,
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                borderColor: 'border-blue-300',
                iconColor: 'text-blue-500',
                barColor: 'bg-blue-500'
            }
        case 'RIESGOSO':
            return {
                icon: AlertTriangle,
                bgColor: 'bg-red-50',
                textColor: 'text-red-700',
                borderColor: 'border-red-300',
                iconColor: 'text-red-500',
                barColor: 'bg-red-500'
            }
    }
}
