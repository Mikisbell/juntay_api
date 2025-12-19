import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusAlertProps {
    variant: 'success' | 'warning' | 'error' | 'info'
    title: string
    description: string
    className?: string
}

const variantConfig = {
    success: {
        icon: CheckCircle,
        className: 'bg-emerald-50 border-emerald-200',
        iconColor: 'text-emerald-600',
        titleColor: 'text-emerald-800',
        descColor: 'text-emerald-700'
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-amber-50 border-amber-200',
        iconColor: 'text-amber-600',
        titleColor: 'text-amber-800',
        descColor: 'text-amber-700'
    },
    error: {
        icon: XCircle,
        className: 'bg-rose-50 border-rose-200',
        iconColor: 'text-rose-600',
        titleColor: 'text-rose-800',
        descColor: 'text-rose-700'
    },
    info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-200',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-800',
        descColor: 'text-blue-700'
    }
}

export function StatusAlert({
    variant,
    title,
    description,
    className
}: StatusAlertProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <Alert className={cn(config.className, className)}>
            <Icon className={cn("h-4 w-4", config.iconColor)} />
            <AlertTitle className={config.titleColor}>{title}</AlertTitle>
            <AlertDescription className={config.descColor}>
                {description}
            </AlertDescription>
        </Alert>
    )
}
