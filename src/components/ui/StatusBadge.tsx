'use client'

/**
 * StatusBadge
 * 
 * A smart badge that automatically colors based on credit/garantia status
 */

import { Badge } from '@/components/ui/badge'
import { getCreditStatusVariant } from '@/lib/constants/prenda-icons'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    status: string | null | undefined
    className?: string
}

// Human-readable status labels
const STATUS_LABELS: Record<string, string> = {
    'aprobado': 'Aprobado',
    'vigente': 'Vigente',
    'activo': 'Activo',
    'por_vencer': 'Por Vencer',
    'vencido': 'Vencido',
    'en_mora': 'En Mora',
    'pagado': 'Pagado',
    'cancelado': 'Cancelado',
    'rechazado': 'Rechazado',
    'pendiente': 'Pendiente',
    'abierta': 'Abierta',
    'cerrada': 'Cerrada',
    // Garantías
    'en_custodia': 'En Custodia',
    'en_prestamo': 'En Préstamo',
    'para_remate': 'Para Remate',
    'vendido': 'Vendido',
    'devuelto': 'Devuelto'
}

function getStatusLabel(status: string | null | undefined): string {
    if (!status) return 'Desconocido'
    const normalized = status.toLowerCase().replace(/\s+/g, '_')
    return STATUS_LABELS[normalized] || status
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variant = getCreditStatusVariant(status) as "default" | "secondary" | "destructive" | "outline" | "activo" | "vigente" | "vencido" | "pagado" | "cancelado" | "por_vencer" | "en_mora" | "abierta" | "cerrada"
    const label = getStatusLabel(status)

    return (
        <Badge
            variant={variant}
            className={cn('capitalize', className)}
        >
            {label}
        </Badge>
    )
}

/**
 * PrendaIcon
 * 
 * Displays the appropriate icon for a prenda category
 */
import { getPrendaIcon } from '@/lib/constants/prenda-icons'

interface PrendaIconProps {
    categoria: string | null | undefined
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    className?: string
}

export function PrendaIcon({
    categoria,
    size = 'md',
    showLabel = false,
    className
}: PrendaIconProps) {
    const config = getPrendaIcon(categoria)
    const Icon = config.icon

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10'
    }

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className={cn(
                sizeClasses[size],
                config.bgColor,
                'rounded-lg flex items-center justify-center'
            )}>
                <Icon className={cn(iconSizes[size], config.color)} />
            </div>
            {showLabel && (
                <span className="text-sm text-slate-600">{config.label}</span>
            )}
        </div>
    )
}
