'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { TenantMetrics } from '@/lib/actions/analytics-actions'

export function AnalyticsDashboard({ data }: { data: TenantMetrics[] }) {
    // Top 10 por Cartera
    const topByPortfolio = [...data]
        .sort((a, b) => b.monto_cartera_vigente - a.monto_cartera_vigente)
        .slice(0, 10)

    // Top 10 por Usuarios
    const topByUsers = [...data]
        .sort((a, b) => b.usuarios_activos - a.usuarios_activos)
        .slice(0, 10)

    // Aggregates
    const totalARR = data.reduce((acc, curr) => acc + curr.monto_cartera_vigente, 0)
    const totalUsers = data.reduce((acc, curr) => acc + curr.usuarios_activos, 0)
    const totalCredits = data.reduce((acc, curr) => acc + curr.creditos_vigentes, 0)

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Volumen Global (Cartera)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            S/ {totalARR.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">Capital total vigilado por SaaS</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">En toda la plataforma</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Créditos Vigentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCredits}</div>
                        <p className="text-xs text-muted-foreground">Operaciones activas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top 10 Empresas (Por Volumen)</CardTitle>
                        <CardDescription>Cartera Vigente en S/</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] relative">
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 24 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {topByPortfolio.some(i => i.monto_cartera_vigente > 0) ? (
                                    <BarChart data={topByPortfolio} layout="vertical" margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="nombre_empresa"
                                            type="category"
                                            width={140}
                                            tick={({ x, y, payload }) => (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={0} y={0} dy={4} textAnchor="end" fill="#64748b" fontSize={11}>
                                                        {payload.value.length > 18 ? `${payload.value.substring(0, 18)}...` : payload.value}
                                                    </text>
                                                </g>
                                            )}
                                            interval={0}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [`S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 'Cartera']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f1f5f9' }}
                                        />
                                        <Bar dataKey="monto_cartera_vigente" radius={[0, 4, 4, 0]}>
                                            {topByPortfolio.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index < 3 ? '#2563eb' : '#94a3b8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                        <p className="text-sm">Sin datos de cartera</p>
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top 10 Empresas (Por Usuarios)</CardTitle>
                        <CardDescription>Licencias Activas</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] relative">
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 24 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {topByUsers.some(i => i.usuarios_activos > 0) ? (
                                    <BarChart data={topByUsers} layout="vertical" margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="nombre_empresa"
                                            type="category"
                                            width={140}
                                            tick={({ x, y, payload }) => (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={0} y={0} dy={4} textAnchor="end" fill="#64748b" fontSize={11}>
                                                        {payload.value.length > 18 ? `${payload.value.substring(0, 18)}...` : payload.value}
                                                    </text>
                                                </g>
                                            )}
                                            interval={0}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f1f5f9' }}
                                        />
                                        <Bar dataKey="usuarios_activos" fill="#16a34a" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <div className="mb-2 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                        </div>
                                        <p className="text-sm font-medium">Sin actividad de usuarios</p>
                                    </div>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
