'use client'

import { useMemo } from 'react'

interface SparklineChartProps {
    data: number[]
    width?: number
    height?: number
    color?: string
    fillColor?: string
    strokeWidth?: number
    showDots?: boolean
    className?: string
}

export function SparklineChart({
    data,
    width = 100,
    height = 32,
    color = '#3b82f6',
    fillColor,
    strokeWidth = 2,
    showDots = false,
    className = ''
}: SparklineChartProps) {
    const { path, areaPath, points } = useMemo(() => {
        if (!data || data.length === 0) {
            return { path: '', areaPath: '', points: [] }
        }

        const padding = 4
        const min = Math.min(...data)
        const max = Math.max(...data)
        const range = max - min || 1

        const xStep = (width - padding * 2) / (data.length - 1)
        const yScale = (height - padding * 2) / range

        const pts = data.map((value, index) => ({
            x: padding + index * xStep,
            y: height - padding - (value - min) * yScale
        }))

        // Smooth curve using cubic bezier
        let pathD = `M ${pts[0].x} ${pts[0].y}`
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1]
            const curr = pts[i]
            const cp1x = prev.x + (curr.x - prev.x) / 3
            const cp2x = prev.x + (curr.x - prev.x) * 2 / 3
            pathD += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`
        }

        // Area path for fill
        const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`

        return { path: pathD, areaPath: areaD, points: pts }
    }, [data, width, height])

    if (!data || data.length === 0) {
        return <div className={`w-[${width}px] h-[${height}px] bg-slate-100 rounded ${className}`} />
    }

    // Calculate trend
    const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0
    const trendColor = trend >= 0 ? '#10b981' : '#ef4444'

    return (
        <svg
            width={width}
            height={height}
            className={className}
            style={{ overflow: 'visible' }}
        >
            {/* Gradient fill */}
            {fillColor && (
                <>
                    <defs>
                        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={areaPath}
                        fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
                    />
                </>
            )}

            {/* Line */}
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Dots */}
            {showDots && points.map((point, index) => (
                <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={3}
                    fill="white"
                    stroke={color}
                    strokeWidth={1.5}
                />
            ))}

            {/* End dot with trend color */}
            {points.length > 0 && (
                <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r={4}
                    fill={trendColor}
                    stroke="white"
                    strokeWidth={2}
                />
            )}
        </svg>
    )
}

// Mini bar chart variant
interface MiniBarChartProps {
    data: number[]
    width?: number
    height?: number
    color?: string
    className?: string
}

export function MiniBarChart({
    data,
    width = 100,
    height = 32,
    color = '#3b82f6',
    className = ''
}: MiniBarChartProps) {
    if (!data || data.length === 0) {
        return <div className={`w-[${width}px] h-[${height}px] bg-slate-100 rounded ${className}`} />
    }

    const max = Math.max(...data)
    const barWidth = (width / data.length) - 2
    const padding = 2

    return (
        <svg width={width} height={height} className={className}>
            {data.map((value, index) => {
                const barHeight = max > 0 ? (value / max) * (height - padding * 2) : 0
                return (
                    <rect
                        key={index}
                        x={index * (barWidth + 2) + padding}
                        y={height - padding - barHeight}
                        width={barWidth}
                        height={barHeight}
                        rx={2}
                        fill={color}
                        opacity={0.3 + (index / data.length) * 0.7}
                    />
                )
            })}
        </svg>
    )
}
