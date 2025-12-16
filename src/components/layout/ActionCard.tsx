import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionCardProps {
    title: string
    description: string
    icon: LucideIcon
    href: string
    color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo'
    className?: string
}

const colorVariants = {
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-600 hover:text-white',
        border: 'hover:border-blue-200'
    },
    emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        hover: 'hover:bg-emerald-600 hover:text-white',
        border: 'hover:border-emerald-200'
    },
    purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-600 hover:text-white',
        border: 'hover:border-purple-200'
    },
    amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        hover: 'hover:bg-amber-600 hover:text-white',
        border: 'hover:border-amber-200'
    },
    rose: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        hover: 'hover:bg-rose-600 hover:text-white',
        border: 'hover:border-rose-200'
    },
    indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        hover: 'hover:bg-indigo-600 hover:text-white',
        border: 'hover:border-indigo-200'
    }
}

export function ActionCard({
    title,
    description,
    icon: Icon,
    href,
    color = 'blue',
    className
}: ActionCardProps) {
    const colors = colorVariants[color]

    return (
        <Link href={href} className={cn("group", className)}>
            <div className={cn(
                "flex h-full flex-col justify-between rounded-xl border bg-white p-6",
                "shadow-sm transition-all duration-200",
                colors.border,
                "hover:shadow-md",
                className
            )}>
                <div className="space-y-2">
                    <div className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                        colors.bg,
                        colors.text,
                        colors.hover
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
        </Link>
    )
}
