'use client'

/**
 * StatusFilterTabs
 * 
 * A reusable tab filter component for filtering by status
 * Matches the reference design with pill-style buttons
 */

import { cn } from '@/lib/utils'

export interface FilterOption {
    value: string
    label: string
    count?: number
    dotColor?: string
}

interface StatusFilterTabsProps {
    options: FilterOption[]
    selected: string
    onChange: (value: string) => void
    className?: string
}

export function StatusFilterTabs({
    options,
    selected,
    onChange,
    className
}: StatusFilterTabsProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        'flex items-center gap-2',
                        selected === option.value
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    )}
                >
                    {option.dotColor && (
                        <span
                            className={cn(
                                'w-2 h-2 rounded-full',
                                option.dotColor
                            )}
                        />
                    )}
                    {option.label}
                    {option.count !== undefined && (
                        <span className={cn(
                            'text-xs px-1.5 py-0.5 rounded-full',
                            selected === option.value
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-500'
                        )}>
                            {option.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}

/**
 * Pre-configured credit status filter options
 */
export const CREDIT_FILTER_OPTIONS: FilterOption[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'activos', label: 'Activos', dotColor: 'bg-emerald-500' },
    { value: 'vencidos', label: 'Vencidos', dotColor: 'bg-red-500' },
    { value: 'pagados', label: 'Pagados', dotColor: 'bg-slate-400' }
]

/**
 * Pre-configured garantía status filter options
 */
export const GARANTIA_FILTER_OPTIONS: FilterOption[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'en_custodia', label: 'En Custodia', dotColor: 'bg-emerald-500' },
    { value: 'para_remate', label: 'Para Remate', dotColor: 'bg-amber-500' },
    { value: 'vendido', label: 'Vendido', dotColor: 'bg-slate-400' }
]
