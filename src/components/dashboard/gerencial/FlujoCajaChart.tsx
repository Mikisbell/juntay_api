'use client'

/**
 * FlujoCajaChart - Interactive line chart for cash flow
 * Shows ingresos vs egresos over time with animated transitions
 */

import { useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    ComposedChart
} from 'recharts'
import { formatearMonto } from '@/lib/utils'

interface FlujoCajaData {
    fecha: string
    ingresos: number
    egresos: number
    neto: number
}

interface FlujoCajaChartProps {
    data: FlujoCajaData[]
    showNeto?: boolean
}

export function FlujoCajaChart({ data, showNeto = false }: FlujoCajaChartProps) {
    // Format dates for display
    const chartData = useMemo(() => {
        return data.map(d => ({
            ...d,
            fechaLabel: new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short'
            })
        }))
    }, [data])

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
        if (!active || !payload) return null

        return (
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{formatearMonto(entry.value)}</span>
                    </p>
                ))}
            </div>
        )
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="gradientIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradientEgresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="fechaLabel"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '10px' }}
                        formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
                    />

                    {/* Areas under lines */}
                    <Area
                        type="monotone"
                        dataKey="ingresos"
                        stroke="transparent"
                        fill="url(#gradientIngresos)"
                    />
                    <Area
                        type="monotone"
                        dataKey="egresos"
                        stroke="transparent"
                        fill="url(#gradientEgresos)"
                    />

                    {/* Lines */}
                    <Line
                        type="monotone"
                        dataKey="ingresos"
                        name="Ingresos"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        animationDuration={1000}
                    />
                    <Line
                        type="monotone"
                        dataKey="egresos"
                        name="Egresos"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ fill: '#ef4444', r: 4, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                        animationDuration={1000}
                    />
                    {showNeto && (
                        <Line
                            type="monotone"
                            dataKey="neto"
                            name="Neto"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            animationDuration={1000}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
