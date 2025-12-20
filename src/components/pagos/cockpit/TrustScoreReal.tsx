'use client'

import { useState, useEffect } from 'react'
import { Shield, TrendingUp, AlertTriangle, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
    calcularScoringCliente,
    type CategoriaCliente
} from '@/lib/actions/scoring-cliente-actions'

interface TrustScoreRealProps {
    clienteId: string
    compact?: boolean
}

const CATEGORIA_CONFIG: Record<CategoriaCliente, {
    label: string
    color: string
    bgColor: string
    icon: typeof Star
    gradient: string
}> = {
    'VIP': {
        label: 'VIP',
        color: 'text-amber-700',
        bgColor: 'bg-amber-100 border-amber-300',
        icon: Star,
        gradient: 'from-amber-400 to-amber-600'
    },
    'BUENO': {
        label: 'Bueno',
        color: 'text-green-700',
        bgColor: 'bg-green-100 border-green-300',
        icon: TrendingUp,
        gradient: 'from-green-400 to-green-600'
    },
    'REGULAR': {
        label: 'Regular',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100 border-blue-300',
        icon: Shield,
        gradient: 'from-blue-400 to-blue-600'
    },
    'RIESGOSO': {
        label: 'Riesgoso',
        color: 'text-red-700',
        bgColor: 'bg-red-100 border-red-300',
        icon: AlertTriangle,
        gradient: 'from-red-400 to-red-600'
    }
}

/**
 * TrustScore que obtiene datos reales del servidor
 */
export function TrustScoreReal({ clienteId, compact = false }: TrustScoreRealProps) {
    const [loading, setLoading] = useState(true)
    const [score, setScore] = useState<number>(0)
    const [categoria, setCategoria] = useState<CategoriaCliente>('REGULAR')
    const [detalles, setDetalles] = useState<{
        pagosATiempo: number
        creditosCompletados: number
    } | null>(null)

    useEffect(() => {
        const fetchScore = async () => {
            setLoading(true)
            try {
                const result = await calcularScoringCliente(clienteId)
                setScore(result.puntaje)
                setCategoria(result.categoria)
                setDetalles({
                    pagosATiempo: result.detalles.pagosATiempo,
                    creditosCompletados: result.detalles.creditosCompletados
                })
            } catch (err) {
                console.error('Error fetching score:', err)
                // Fallback seguro
                setScore(50)
                setCategoria('REGULAR')
            } finally {
                setLoading(false)
            }
        }

        if (clienteId) {
            fetchScore()
        }
    }, [clienteId])

    const config = CATEGORIA_CONFIG[categoria]
    const Icon = config.icon

    if (loading) {
        return compact ? (
            <Skeleton className="h-6 w-16" />
        ) : (
            <Skeleton className="h-20 w-32" />
        )
    }

    // Vista compacta (para tablas)
    if (compact) {
        return (
            <Badge variant="outline" className={cn('gap-1', config.bgColor, config.color)}>
                <Icon className="h-3 w-3" />
                {score}
            </Badge>
        )
    }

    // Vista completa (para cockpit)
    return (
        <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
                <Icon className={cn('h-5 w-5', config.color)} />
                <span className={cn('text-sm font-bold', config.color)}>
                    {config.label}
                </span>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-slate-100 p-3 min-w-[100px]">
                <div
                    className={cn(
                        'absolute inset-0 opacity-20 bg-gradient-to-r',
                        config.gradient
                    )}
                    style={{ width: `${score}%` }}
                />
                <div className="relative z-10 text-center">
                    <div className={cn('text-3xl font-black', config.color)}>
                        {score}
                    </div>
                    <div className="text-xs text-slate-500">Trust Score</div>
                </div>
            </div>
            {detalles && (
                <div className="mt-1 text-xs text-slate-500">
                    {detalles.pagosATiempo} pagos • {detalles.creditosCompletados} créditos
                </div>
            )}
        </div>
    )
}
