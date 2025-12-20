'use client'

import { useState } from 'react'
import {
    Package,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Tag
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
    actualizarEstadoArticulo,
    type EstadoArticulo
} from '@/lib/actions/garantias-mejoradas-actions'
import { cn } from '@/lib/utils'

interface EstadoArticuloBadgeProps {
    estado: EstadoArticulo
    articuloId?: string
    editable?: boolean
    onEstadoChange?: (nuevoEstado: EstadoArticulo) => void
}

const ESTADOS_CONFIG: Record<EstadoArticulo, {
    label: string
    color: string
    bgColor: string
    icon: typeof CheckCircle
}> = {
    'nuevo': {
        label: 'Nuevo',
        color: 'text-green-700',
        bgColor: 'bg-green-100 border-green-300',
        icon: CheckCircle
    },
    'buen_estado': {
        label: 'Buen Estado',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100 border-blue-300',
        icon: CheckCircle
    },
    'usado': {
        label: 'Usado',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100 border-yellow-300',
        icon: Package
    },
    'danado': {
        label: 'Dañado',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100 border-orange-300',
        icon: AlertTriangle
    },
    'para_remate': {
        label: 'Para Remate',
        color: 'text-red-700',
        bgColor: 'bg-red-100 border-red-300',
        icon: AlertCircle
    }
}

/**
 * Badge de Estado del Artículo
 */
export function EstadoArticuloBadge({
    estado,
    articuloId,
    editable = false,
    onEstadoChange
}: EstadoArticuloBadgeProps) {
    const [updating, setUpdating] = useState(false)
    const config = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG['usado']
    const Icon = config.icon

    const handleCambiarEstado = async (nuevoEstado: EstadoArticulo) => {
        if (!articuloId) return

        setUpdating(true)
        try {
            const result = await actualizarEstadoArticulo(articuloId, nuevoEstado)
            if (result.success) {
                toast.success('Estado actualizado')
                onEstadoChange?.(nuevoEstado)
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error actualizando estado')
        } finally {
            setUpdating(false)
        }
    }

    const badge = (
        <Badge
            variant="outline"
            className={cn(
                'gap-1',
                config.bgColor,
                config.color,
                updating && 'opacity-50'
            )}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    )

    if (!editable || !articuloId) {
        return badge
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                    {badge}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {Object.entries(ESTADOS_CONFIG).map(([key, cfg]) => {
                    const ItemIcon = cfg.icon
                    return (
                        <DropdownMenuItem
                            key={key}
                            onClick={() => handleCambiarEstado(key as EstadoArticulo)}
                            className={cn(
                                'gap-2',
                                key === estado && 'bg-muted'
                            )}
                        >
                            <ItemIcon className={cn('h-4 w-4', cfg.color)} />
                            <span>{cfg.label}</span>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/**
 * Selector de Estado (para formularios)
 */
export function EstadoArticuloSelector({
    value,
    onChange
}: {
    value: EstadoArticulo
    onChange: (estado: EstadoArticulo) => void
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Estado del Artículo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(ESTADOS_CONFIG).map(([key, cfg]) => {
                    const ItemIcon = cfg.icon
                    const isSelected = key === value
                    return (
                        <Button
                            key={key}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onChange(key as EstadoArticulo)}
                            className={cn(
                                'gap-1 justify-start',
                                isSelected && cfg.bgColor
                            )}
                        >
                            <ItemIcon className="h-3 w-3" />
                            {cfg.label}
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}
