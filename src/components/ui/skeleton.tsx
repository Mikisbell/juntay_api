'use client'

import { cn } from '@/lib/utils'

/**
 * Skeleton - Componente base para estados de carga
 * 
 * Este es el componente primitivo usado por todos los demás skeletons.
 */
export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
                className
            )}
            {...props}
        />
    )
}
