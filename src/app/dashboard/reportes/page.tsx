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
    Download,
    Plus,
} from 'lucide-react'
import { CarteraReportPDF } from '@/components/reportes/CarteraReportPDF'
import { MoraReportPDF } from '@/components/reportes/MoraReportPDF'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ReportesPage() {
    const [period, setPeriod] = useState('este-mes')
    const [branch, setBranch] = useState('todas')
    const [type, setType] = useState('todos')

    const kpis = [
        {
            title: 'Cartera Total',
            value: 'S/ 458,230',
            trend: 'up',
            change: '+12.5%',
            color: 'emerald',
            icon: DollarSign
        },
        {
            title: 'Tasa de Mora',
            value: '8.2%',
            trend: 'down',
            change: '-2.1%',
            color: 'red',
            icon: AlertTriangle
        },
        {
            title: 'Créditos Activos',
            value: '342',
            trend: 'up',
            change: '+18',
            color: 'blue',
            icon: Activity
        },
        {
            title: 'Meta Mensual',
            value: '87%',
            trend: 'up',
            change: '+5%',
            color: 'emerald',
            icon: Target
        }
    ]

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
            red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600' },
            blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
        }
        return colors[color] || colors.emerald
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
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

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">PERÍODO:</span>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[140px]">
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
                        <SelectTrigger className="w-[160px]">
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
                        <SelectTrigger className="w-[160px]">
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
                <Button variant="link" className="text-emerald-600 text-sm ml-auto">
                    Limpiar Filtros
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => {
                    const colorClasses = getColorClasses(kpi.color)
                    const Icon = kpi.icon
                    return (
                        <Card key={kpi.title} className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.title}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
                                        <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {kpi.trend === 'up' ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                            <span>{kpi.change}</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
                                        <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Evolución de Cartera</CardTitle>
                        <CardDescription>Últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            <p>Gráfico de evolución (próximamente)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Composición por Tipo</CardTitle>
                        <CardDescription>Distribución de garantías</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                            <p>Gráfico de distribución (próximamente)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Export Section */}
            <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exportar Reportes
                    </CardTitle>
                    <CardDescription>Genera reportes PDF al instante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Reporte de Cartera</p>
                                <p className="text-xs text-slate-500">Estado completo de créditos activos</p>
                            </div>
                        </div>
                        <CarteraReportPDF />
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Reporte de Mora</p>
                                <p className="text-xs text-slate-500">Créditos vencidos y en riesgo</p>
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
    )
}
