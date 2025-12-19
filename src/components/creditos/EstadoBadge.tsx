import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EstadoCredito } from '@/lib/types/credito'
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    AlertCircle,
    RefreshCw,
    Store,
    Ban
} from 'lucide-react'

interface EstadoBadgeProps {
    estado: EstadoCredito
    className?: string
    showIcon?: boolean
}

const estadoConfig: Record<EstadoCredito, {
    label: string
    color: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any
    description: string
}> = {
    [EstadoCredito.VIGENTE]: {
        label: 'Vigente',
        color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
        icon: CheckCircle2,
        description: 'Crédito activo y al día'
    },
    [EstadoCredito.AL_DIA]: {
        label: 'Al Día',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
        icon: CheckCircle2,
        description: 'Última cuota pagada puntualmente'
    },
    [EstadoCredito.POR_VENCER]: {
        label: 'Por Vencer',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
        icon: Clock,
        description: 'Vence en menos de 7 días'
    },
    [EstadoCredito.VENCIDO]: {
        label: 'Vencido',
        color: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
        icon: AlertTriangle,
        description: 'Pasó la fecha de vencimiento'
    },
    [EstadoCredito.EN_MORA]: {
        label: 'En Mora',
        color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
        icon: AlertCircle,
        description: 'Más de 15 días vencido'
    },
    [EstadoCredito.EN_GRACIA]: {
        label: 'En Gracia',
        color: 'bg-red-200 text-red-900 border-red-300 hover:bg-red-300',
        icon: AlertCircle,
        description: 'Periodo de gracia antes de remate'
    },
    [EstadoCredito.PRE_REMATE]: {
        label: 'Pre-Remate',
        color: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
        icon: AlertTriangle,
        description: 'Notificado para remate'
    },
    [EstadoCredito.EN_REMATE]: {
        label: 'En Remate',
        color: 'bg-purple-200 text-purple-900 border-purple-300 hover:bg-purple-300',
        icon: Store,
        description: 'Bien publicado para venta'
    },
    [EstadoCredito.CANCELADO]: {
        label: 'Cancelado',
        color: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
        icon: CheckCircle2,
        description: 'Pagado completamente'
    },
    [EstadoCredito.RENOVADO]: {
        label: 'Renovado',
        color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
        icon: RefreshCw,
        description: 'Renovado con nuevo plazo'
    },
    [EstadoCredito.EJECUTADO]: {
        label: 'Ejecutado',
        color: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
        icon: Store,
        description: 'Bien vendido en remate'
    },
    [EstadoCredito.ANULADO]: {
        label: 'Anulado',
        color: 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300',
        icon: Ban,
        description: 'Contrato anulado'
    }
}

export function EstadoBadge({ estado, className, showIcon = true }: EstadoBadgeProps) {
    const config = estadoConfig[estado] || estadoConfig[EstadoCredito.VIGENTE]
    const Icon = config.icon

    return (
        <Badge
            variant="outline"
            className={cn(config.color, 'font-medium', className)}
            title={config.description}
        >
            {showIcon && <Icon className="w-3 h-3 mr-1.5" />}
            {config.label}
        </Badge>
    )
}
