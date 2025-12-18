'use client'

import { useMemo } from 'react'

interface DonutSegment {
    label: string
    value: number
    color: string
}

interface CarteraDonutProps {
    data: DonutSegment[]
    size?: number
    thickness?: number
    className?: string
    showCenter?: boolean
    centerLabel?: string
    centerValue?: string
}

export function CarteraDonut({
    data,
    size = 200,
    thickness = 30,
    className = '',
    showCenter = true,
    centerLabel = 'Total',
    centerValue
}: CarteraDonutProps) {
    const { segments, total } = useMemo(() => {
        const total = data.reduce((acc, item) => acc + item.value, 0)
        const radius = (size - thickness) / 2
        const circumference = 2 * Math.PI * radius

        let accumulatedOffset = 0
        const segments = data.map((item) => {
            const percentage = total > 0 ? item.value / total : 0
            const dashLength = percentage * circumference
            const dashOffset = -accumulatedOffset
            accumulatedOffset += dashLength

            return {
                ...item,
                percentage,
                dashArray: `${dashLength} ${circumference - dashLength}`,
                dashOffset,
                radius
            }
        })

        return { segments, total }
    }, [data, size, thickness])

    const center = size / 2

    // Format total as currency
    const formattedTotal = centerValue || new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(total)

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={(size - thickness) / 2}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={thickness}
                />

                {/* Segments */}
                {segments.map((segment, index) => (
                    <circle
                        key={index}
                        cx={center}
                        cy={center}
                        r={segment.radius}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth={thickness}
                        strokeDasharray={segment.dashArray}
                        strokeDashoffset={segment.dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                        style={{
                            filter: `drop-shadow(0 2px 4px ${segment.color}40)`
                        }}
                    />
                ))}
            </svg>

            {/* Center content */}
            {showCenter && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{centerLabel}</span>
                    <span className="text-xl font-bold text-slate-900">{formattedTotal}</span>
                </div>
            )}
        </div>
    )
}

// Compact horizontal legend
interface DonutLegendProps {
    data: DonutSegment[]
    className?: string
}

export function DonutLegend({ data, className = '' }: DonutLegendProps) {
    const total = data.reduce((acc, item) => acc + item.value, 0)

    return (
        <div className={`flex flex-wrap gap-4 ${className}`}>
            {data.map((item, index) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
                return (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-600">
                            {item.label}
                            <span className="text-slate-400 ml-1">({percentage}%)</span>
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
