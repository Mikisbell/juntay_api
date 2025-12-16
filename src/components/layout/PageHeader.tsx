import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    description: string
    icon?: LucideIcon
    action?: React.ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    action,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon className="h-8 w-8 text-blue-600" />}
                    <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                </div>
                <p className="text-base text-slate-600">{description}</p>
            </div>
            {action && (
                <div className="flex items-center gap-2">
                    {action}
                </div>
            )}
        </div>
    )
}
