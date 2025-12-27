'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface CashFlowProps {
    data: {
        fecha: string
        ingresos: number
        egresos: number
        neto: number
    }[]
}

export function CashFlowChart({ data }: CashFlowProps) {
    // Format data for simpler date display (DD/MM)
    const chartData = data.map(item => ({
        ...item,
        displayDate: new Date(item.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
    }))

    const formatter = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0
    })

    return (
        <Card className="col-span-4 lg:col-span-3 border-border/50 bg-background/50 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Flujo de Caja (Últimos 30 días)</CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="displayDate"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `S/ ${value}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value: number) => formatter.format(value)}
                        />
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                        <Area
                            type="monotone"
                            dataKey="ingresos"
                            name="Ingresos"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorIngresos)"
                        />
                        <Area
                            type="monotone"
                            dataKey="egresos"
                            name="Egresos (Préstamos)"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEgresos)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
