'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    TrendingUp,
    TrendingDown,
    FileDown,
    AlertTriangle,
    Users,
    DollarSign,
    Activity,
    Target,
    MoreVertical,
    Download,
    Plus,
    Filter
} from 'lucide-react'
import { CarteraReportPDF } from '@/components/reportes/CarteraReportPDF'
import { MoraReportPDF } from '@/components/reportes/MoraReportPDF'
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, HoverCard } from '@/components/ui/motion'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'

// Mock data for the area chart
const evolutionData = [
    { month: 'Ene', value: 45000 },
    { month: 'Feb', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Abr', value: 61000 },
    { month: 'May', value: 55000 },
    { month: 'Jun', value: 67000 },
]

// Mock data for donut chart
const distributionData = [
    { name: 'Joyas y Oro', value: 60, color: '#6366f1' },
    { name: 'Electro', value: 25, color: '#a855f7' },
    { name: 'Vehículos', value: 15, color: '#06b6d4' },
]

// Mock KPIs
const kpis = [
    {
        title: 'Colocación Total',
        value: 'S/ 1,250,400',
        change: '+12.5%',
        trend: 'up',
        icon: DollarSign,
        color: 'emerald'
    },
    {
        title: 'Mora Promedio (>30d)',
        value: '5.2%',
        change: '-0.5%',
        trend: 'down',
        icon: AlertTriangle,
        color: 'red'
    },
    {
        title: 'Préstamos Activos',
        value: '842',
        change: '+5.0%',
        trend: 'up',
        icon: Activity,
        color: 'blue'
    },
    {
        title: 'Score Eficiencia',
        value: '94/100',
        change: 'Estable',
        trend: 'stable',
        icon: Target,
        color: 'emerald'
    },
]

// Mock report history
const reportHistory = [
    { name: 'Cierre Mensual - Junio', date: '01 Jul, 2023 - 08:30 AM', status: 'Completado', size: '2.4 MB' },
    { name: 'Reporte Mora Q2', date: '30 Jun, 2023 - 15:00 PM', status: 'Completado', size: '1.8 MB' },
    { name: 'Análisis Cartera', date: '28 Jun, 2023 - 10:15 AM', status: 'Completado', size: '3.1 MB' },
]

export default function ReportsPage() {
    const [period, setPeriod] = useState('este-mes')
    const [branch, setBranch] = useState('todas')
    const [type, setType] = useState('todos')

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; icon: string }> = {
            emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', icon: 'text-emerald-500' },
            red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', icon: 'text-red-500' },
            blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', icon: 'text-blue-500' },
        }
        return colors[color] || colors.emerald
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <FadeIn>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Reportes y Analíticas
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Supervisión de riesgo crediticio y eficiencia operativa en tiempo real.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                            <FileDown className="w-4 h-4" />
                            Exportar
                        </Button>
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                            <Plus className="w-4 h-4" />
                            Nuevo Reporte
                        </Button>
                    </div>
                </div>
            </FadeIn>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">PERÍODO:</span>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="hoy">Hoy</SelectItem>
                            <SelectItem value="esta-semana">Esta Semana</SelectItem>
                            <SelectItem value="este-mes">Este Mes</SelectItem>
                            <SelectItem value="ultimo-trimestre">Último Trimestre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">SUCURSAL:</span>
                    <Select value={branch} onValueChange={setBranch}>
                        <SelectTrigger className="w-[160px] bg-white dark:bg-slate-900">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todas">Todas (Lima)</SelectItem>
                            <SelectItem value="centro">Centro</SelectItem>
                            <SelectItem value="norte">Norte</SelectItem>
                            <SelectItem value="sur">Sur</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">TIPO:</span>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-[160px] bg-white dark:bg-slate-900">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="joyas">Joyas y Oro</SelectItem>
                            <SelectItem value="electro">Electro</SelectItem>
                            <SelectItem value="vehiculos">Vehículos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="link" className="text-emerald-600 text-sm">
                    Limpiar Filtros
                </Button>
            </div>
        </FadeIn>

            {/* KPI Cards */ }
    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
            const colorClasses = getColorClasses(kpi.color)
            return (
                <StaggerItem key={kpi.title}>
                    <HoverCard>
                        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Gradient accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-${kpi.color}-500 opacity-80`} />

                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.title}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{kpi.value}</p>
                                        <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-red-500' : 'text-slate-500'}`}>
                                            {kpi.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                                            {kpi.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                                            <span>{kpi.change} vs mes ant.</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-xl ${colorClasses.bg} group-hover:scale-110 transition-transform duration-300`}>
                                        <kpi.icon className={`w-6 h-6 ${colorClasses.icon}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </HoverCard>
                </StaggerItem>
            )
        })}
    </StaggerContainer>

    {/* Charts Row */ }
    <SlideUp delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart - Evolution */}
            <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-lg font-semibold">Evolución de Cartera Vencida</CardTitle>
                        <CardDescription>Últimos 6 meses • Expresado en Soles (S/)</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value: number) => [`S/ ${value.toLocaleString()}`, 'Monto']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#colorValue)"
                                    dot={{ r: 4, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Donut Chart - Distribution */}
            <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Distribución por Prenda</CardTitle>
                    <CardDescription>Valoración total por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [`${value}%`, 'Porcentaje']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center">
                        <div className="text-center -mt-20 relative z-10">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">1.2M</p>
                            <p className="text-sm text-slate-500">Total (S/)</p>
                        </div>
                    </div>
                    <div className="space-y-2 mt-6">
                        {distributionData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                                </div>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </SlideUp>

    {/* Report History & Quick Actions */ }
    <SlideUp delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report History */}
            <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">Historial de Reportes</CardTitle>
                    </div>
                    <Button variant="link" className="text-emerald-600">Ver todos</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 text-xs text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-700">
                            <div className="col-span-5">Nombre del Reporte</div>
                            <div className="col-span-3">Fecha Generado</div>
                            <div className="col-span-2">Estado</div>
                            <div className="col-span-2">Acción</div>
                        </div>
                        {reportHistory.map((report, i) => (
                            <div key={i} className="grid grid-cols-12 items-center text-sm py-2">
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <FileDown className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{report.name}</p>
                                        <p className="text-xs text-slate-500">PDF • {report.size}</p>
                                    </div>
                                </div>
                                <div className="col-span-3 text-slate-600 dark:text-slate-400">
                                    {report.date}
                                </div>
                                <div className="col-span-2">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        {report.status}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick PDF Downloads */}
            <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Descargas Rápidas</CardTitle>
                    <CardDescription>Genera reportes PDF al instante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Reporte de Cartera</p>
                                <p className="text-xs text-slate-500">Listado completo de créditos con KPIs</p>
                            </div>
                        </div>
                        <CarteraReportPDF />
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-100 dark:border-red-800">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Reporte de Mora</p>
                                <p className="text-xs text-slate-500">Créditos vencidos por prioridad</p>
                            </div>
                        </div>
                        <MoraReportPDF />
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            <Users className="w-5 h-5 text-slate-600" />
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Estado de Cuenta</p>
                                <p className="text-xs text-slate-500">Disponible desde el perfil del cliente</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/dashboard/clientes">Ir a Clientes →</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </SlideUp>
        </div >
    )
}
