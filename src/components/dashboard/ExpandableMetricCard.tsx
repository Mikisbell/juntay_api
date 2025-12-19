'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpandableMetricCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon?: ReactNode
    iconBgColor?: string
    accentColor?: string
    trend?: {
        value: number
        label?: string
    }
    expandedContent?: ReactNode
    children?: ReactNode
    className?: string
    defaultExpanded?: boolean
}

export function ExpandableMetricCard({
    title,
    value,
    subtitle,
    icon,
    iconBgColor = 'bg-blue-100',
    accentColor = 'blue',
    trend,
    expandedContent,
    children,
    className = '',
    defaultExpanded = false
}: ExpandableMetricCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)
    const [isHovered, setIsHovered] = useState(false)

    const hasExpandableContent = expandedContent || children

    return (
        <div
            className={cn(
                'bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300',
                isHovered && hasExpandableContent && 'shadow-lg border-slate-300',
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main content */}
            <div
                className={cn(
                    'p-5 cursor-pointer',
                    hasExpandableContent && 'hover:bg-slate-50/50'
                )}
                onClick={() => hasExpandableContent && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        {icon && (
                            <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center',
                                iconBgColor
                            )}>
                                {icon}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-slate-500">{title}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                            {subtitle && (
                                <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {/* Trend indicator */}
                        {trend && (
                            <div className={cn(
                                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                                trend.value >= 0
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-700'
                            )}>
                                {trend.value >= 0 ? '↑' : '↓'}
                                {Math.abs(trend.value)}%
                                {trend.label && <span className="text-slate-500 ml-1">{trend.label}</span>}
                            </div>
                        )}

                        {/* Expand button */}
                        {hasExpandableContent && (
                            <button
                                className={cn(
                                    'p-1 rounded-lg transition-all',
                                    isHovered ? 'bg-slate-100 text-slate-600' : 'text-slate-300'
                                )}
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Expandable content */}
            {hasExpandableContent && (
                <div
                    className={cn(
                        'overflow-hidden transition-all duration-300 border-t border-slate-100',
                        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    )}
                >
                    <div className="p-5 pt-4 bg-slate-50/50">
                        {expandedContent || children}
                    </div>
                </div>
            )}
        </div>
    )
}

// Simple collapsible section
interface CollapsibleSectionProps {
    title: string
    icon?: ReactNode
    defaultOpen?: boolean
    children: ReactNode
    className?: string
    storageKey?: string
}

export function CollapsibleSection({
    title,
    icon,
    defaultOpen = true,
    children,
    className = '',
    storageKey
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(() => {
        if (storageKey && typeof window !== 'undefined') {
            const saved = localStorage.getItem(`section-${storageKey}`)
            return saved !== null ? saved === 'true' : defaultOpen
        }
        return defaultOpen
    })

    const toggle = () => {
        const newState = !isOpen
        setIsOpen(newState)
        if (storageKey && typeof window !== 'undefined') {
            localStorage.setItem(`section-${storageKey}`, String(newState))
        }
    }

    return (
        <div className={className}>
            <button
                onClick={toggle}
                className="w-full flex items-center justify-between py-3 group"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        {title}
                    </h2>
                </div>
                <ChevronDown className={cn(
                    'h-4 w-4 text-slate-400 transition-transform',
                    isOpen && 'rotate-180'
                )} />
            </button>
            <div className={cn(
                'transition-all duration-300 overflow-hidden',
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            )}>
                {children}
            </div>
        </div>
    )
}
