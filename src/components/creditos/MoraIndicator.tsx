'use client'

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EstadoMora } from '@/lib/utils/interes-flexible'

// ============================================================================
// TYPES
// ============================================================================

interface MoraIndicatorProps {
    estadoMora: EstadoMora
    diasEnMora?: number
    diasEnGracia?: number
    interesMora?: number
    className?: string
    showDetails?: boolean
}

// ============================================================================
// MORA INDICATOR COMPONENT
// ============================================================================

/**
 * Componente visual que indica el estado de mora de un crédito
 * 
 * Estados:
 * - AL_DIA: Verde, sin problemas
 * - EN_GRACIA: Amarillo, advertencia suave
 * - MORA_LEVE: Naranja, requiere atención
 * - MORA_GRAVE: Rojo, acción urgente
 */
export function MoraIndicator({
    estadoMora,
    diasEnMora = 0,
    diasEnGracia = 0,
    interesMora = 0,
    className,
    showDetails = true
}: MoraIndicatorProps) {
    const config = getEstadoConfig(estadoMora)

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <Badge
                variant="outline"
                className={cn(
                    'gap-1.5 font-medium text-sm px-2.5 py-1',
                    config.badgeClass
                )}
            >
                <config.icon className="h-3.5 w-3.5" />
                {config.label}
            </Badge>

            {showDetails && (estadoMora === 'EN_GRACIA' || estadoMora === 'MORA_LEVE' || estadoMora === 'MORA_GRAVE') && (
                <div className={cn('text-xs px-1', config.textClass)}>
                    {estadoMora === 'EN_GRACIA' && (
                        <span>
                            {diasEnGracia} día{diasEnGracia !== 1 ? 's' : ''} de gracia usados
                        </span>
                    )}
                    {(estadoMora === 'MORA_LEVE' || estadoMora === 'MORA_GRAVE') && (
                        <div className="space-y-0.5">
                            <div>{diasEnMora} día{diasEnMora !== 1 ? 's' : ''} en mora</div>
                            {interesMora > 0 && (
                                <div className="font-semibold">
                                    +S/ {interesMora.toFixed(2)} penalidad
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ============================================================================
// COMPACT MORA BADGE
// ============================================================================

/**
 * Versión compacta del indicador de mora (solo badge)
 */
export function MoraBadge({
    estadoMora,
    diasEnMora = 0,
    className
}: {
    estadoMora: EstadoMora
    diasEnMora?: number
    className?: string
}) {
    const config = getEstadoConfig(estadoMora)

    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1 text-xs px-1.5 py-0.5',
                config.badgeClass,
                className
            )}
        >
            <config.icon className="h-3 w-3" />
            <span className="sr-only">{config.label}</span>
            {diasEnMora > 0 ? `${diasEnMora}d` : config.shortLabel}
        </Badge>
    )
}

// ============================================================================
// MORA ALERT BANNER
// ============================================================================

/**
 * Banner de alerta para créditos en mora (para listas y detalles)
 */
export function MoraAlertBanner({
    estadoMora,
    diasEnMora = 0,
    diasEnGracia = 0,
    interesMora = 0,
    diasGraciaConfig = 3,
    className
}: MoraIndicatorProps & { diasGraciaConfig?: number }) {
    if (estadoMora === 'AL_DIA') return null

    const config = getEstadoConfig(estadoMora)
    const diasGraciaRestantes = Math.max(0, diasGraciaConfig - diasEnGracia)

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-3 rounded-lg border',
                config.bannerClass,
                className
            )}
        >
            <config.icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClass)} />
            <div className="flex-1 min-w-0">
                <div className={cn('font-semibold text-sm', config.textClass)}>
                    {config.alertTitle}
                </div>
                <div className={cn('text-xs mt-0.5', config.textClass)}>
                    {estadoMora === 'EN_GRACIA' && (
                        <>
                            El crédito venció hace {diasEnGracia} día{diasEnGracia !== 1 ? 's' : ''}.
                            Quedan <strong>{diasGraciaRestantes}</strong> días de gracia antes de aplicar mora.
                        </>
                    )}
                    {estadoMora === 'MORA_LEVE' && (
                        <>
                            {diasEnMora} día{diasEnMora !== 1 ? 's' : ''} en mora.
                            {interesMora > 0 && (
                                <> Penalidad acumulada: <strong>S/ {interesMora.toFixed(2)}</strong></>
                            )}
                        </>
                    )}
                    {estadoMora === 'MORA_GRAVE' && (
                        <>
                            <strong>{diasEnMora} días</strong> en mora grave.
                            {interesMora > 0 && (
                                <> Penalidad: <strong className="text-red-700">S/ {interesMora.toFixed(2)}</strong></>
                            )}
                            <div className="mt-1 font-medium">
                                ⚠️ Considerar acciones de cobranza o remate
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface EstadoConfig {
    label: string
    shortLabel: string
    alertTitle: string
    icon: typeof CheckCircle
    badgeClass: string
    bannerClass: string
    textClass: string
    iconClass: string
}

function getEstadoConfig(estado: EstadoMora): EstadoConfig {
    const configs: Record<EstadoMora, EstadoConfig> = {
        'AL_DIA': {
            label: 'Al día',
            shortLabel: '✓',
            alertTitle: '',
            icon: CheckCircle,
            badgeClass: 'bg-green-50 border-green-200 text-green-700',
            bannerClass: 'bg-green-50 border-green-200',
            textClass: 'text-green-700',
            iconClass: 'text-green-600'
        },
        'POR_VENCER': {
            label: 'Por vencer',
            shortLabel: '⏰',
            alertTitle: 'Próximo a vencer',
            icon: Clock,
            badgeClass: 'bg-blue-50 border-blue-200 text-blue-700',
            bannerClass: 'bg-blue-50 border-blue-200',
            textClass: 'text-blue-700',
            iconClass: 'text-blue-600'
        },
        'EN_GRACIA': {
            label: 'En gracia',
            shortLabel: '⚡',
            alertTitle: 'Período de Gracia',
            icon: AlertTriangle,
            badgeClass: 'bg-yellow-50 border-yellow-300 text-yellow-700',
            bannerClass: 'bg-yellow-50 border-yellow-200',
            textClass: 'text-yellow-800',
            iconClass: 'text-yellow-600'
        },
        'MORA_LEVE': {
            label: 'Mora leve',
            shortLabel: '⚠️',
            alertTitle: 'En Mora',
            icon: AlertTriangle,
            badgeClass: 'bg-orange-50 border-orange-300 text-orange-700',
            bannerClass: 'bg-orange-50 border-orange-200',
            textClass: 'text-orange-800',
            iconClass: 'text-orange-600'
        },
        'MORA_GRAVE': {
            label: 'Mora grave',
            shortLabel: '🔴',
            alertTitle: 'Mora Grave - Acción Requerida',
            icon: XCircle,
            badgeClass: 'bg-red-100 border-red-300 text-red-700 font-bold',
            bannerClass: 'bg-red-50 border-red-300',
            textClass: 'text-red-800',
            iconClass: 'text-red-600'
        }
    }

    return configs[estado]
}

// ============================================================================
// EXPORTS
// ============================================================================

export { getEstadoConfig }
export type { MoraIndicatorProps }
