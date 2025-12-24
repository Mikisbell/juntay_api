'use client'

/**
 * CarteraDonutChart - Animated pie chart for portfolio health
 * Shows Al día / Por vencer / En mora distribution
 */

import { useMemo } from 'react'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts'
import { formatearMonto } from '@/lib/utils'

interface CarteraDonutChartProps {
    alDia: number
    porVencer: number
    enMora: number
}

const COLORS = {
    alDia: '#10b981',      // Emerald
    porVencer: '#f59e0b',  // Amber
    enMora: '#ef4444'      // Red
}

export function CarteraDonutChart({ alDia, porVencer, enMora }: CarteraDonutChartProps) {
    const total = alDia + porVencer + enMora

    const data = useMemo(() => [
        { name: 'Al Día', value: alDia, color: COLORS.alDia },
        { name: 'Por Vencer', value: porVencer, color: COLORS.porVencer },
        { name: 'En Mora', value: enMora, color: COLORS.enMora }
    ].filter(d => d.value > 0), [alDia, porVencer, enMora])

    // Calculate percentages
    const alDiaPct = total > 0 ? ((alDia / total) * 100).toFixed(0) : '0'
    const enMoraPct = total > 0 ? ((enMora / total) * 100).toFixed(0) : '0'

    // Custom label
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
        cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number; percent?: number
    }): React.ReactNode => {
        if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent || percent < 0.05) return null
        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-sm font-bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
        if (!active || !payload?.length) return null
        const item = payload[0]

        return (
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium" style={{ color: item.payload.color }}>
                    {item.name}
                </p>
                <p className="text-lg font-bold text-slate-800">
                    {formatearMonto(item.value)}
                </p>
            </div>
        )
    }

    if (total === 0) {
        return (
            <div className="w-full h-[280px] flex items-center justify-center text-slate-400">
                Sin datos de cartera
            </div>
        )
    }

    return (
        <div className="relative w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                            <span className="text-sm text-slate-600">
                                {value} ({entry.payload && 'value' in entry.payload
                                    ? formatearMonto(entry.payload.value as number)
                                    : ''
                                })
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: '-18px' }}>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-lg font-bold text-slate-700">{formatearMonto(total)}</p>
            </div>
        </div>
    )
}

// Compact stats display below chart
export function CarteraStats({ alDia, porVencer, enMora }: CarteraDonutChartProps) {
    const total = alDia + porVencer + enMora

    return (
        <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 rounded-lg bg-emerald-50">
                <p className="text-xs text-emerald-600 font-medium">Saludable</p>
                <p className="text-lg font-bold text-emerald-700">
                    {total > 0 ? ((alDia / total) * 100).toFixed(0) : 0}%
                </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-amber-50">
                <p className="text-xs text-amber-600 font-medium">En Riesgo</p>
                <p className="text-lg font-bold text-amber-700">
                    {total > 0 ? ((porVencer / total) * 100).toFixed(0) : 0}%
                </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-50">
                <p className="text-xs text-red-600 font-medium">Mora</p>
                <p className="text-lg font-bold text-red-700">
                    {total > 0 ? ((enMora / total) * 100).toFixed(0) : 0}%
                </p>
            </div>
        </div>
    )
}
