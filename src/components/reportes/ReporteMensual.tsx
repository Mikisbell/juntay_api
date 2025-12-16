"use client"

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Package,
    Calendar,
    Download,
    FileSpreadsheet
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

interface DatosReporte {
    creditosOtorgados: number
    montoTotalPrestado: number
    creditosPagados: number
    montoRecuperado: number
    interesesGanados: number
    creditosVencidos: number
    prendasEjecutadas: number
    ventaPrendas: number
    clientesNuevos: number
    clientesRecurrentes: number
}

interface ReporteMensualProps {
    mes: Date
    datos: DatosReporte
    datosMesAnterior?: DatosReporte
}

export function ReporteMensual({ mes, datos, datosMesAnterior }: ReporteMensualProps) {
    const [vistaDetalle, setVistaDetalle] = useState(false)

    // Calcular porcentajes de cambio
    const calcularCambio = (actual: number, anterior?: number): { valor: number; positivo: boolean } | null => {
        if (!anterior || anterior === 0) return null
        const cambio = ((actual - anterior) / anterior) * 100
        return { valor: Math.abs(cambio), positivo: cambio >= 0 }
    }

    // Métricas Resumen
    const utilidadBruta = datos.interesesGanados + datos.ventaPrendas - datos.montoTotalPrestado
    const tasaRecuperacion = datos.creditosOtorgados > 0
        ? (datos.creditosPagados / datos.creditosOtorgados) * 100
        : 0
    const ticketPromedio = datos.creditosOtorgados > 0
        ? datos.montoTotalPrestado / datos.creditosOtorgados
        : 0

    const cambiosCreditosOtorgados = calcularCambio(datos.creditosOtorgados, datosMesAnterior?.creditosOtorgados)
    const cambiosMontoPrestado = calcularCambio(datos.montoTotalPrestado, datosMesAnterior?.montoTotalPrestado)
    const cambiosIntereses = calcularCambio(datos.interesesGanados, datosMesAnterior?.interesesGanados)

    const handleExportarExcel = () => {
        // TODO: Implementar exportación a Excel
        alert('Funcionalidad de exportación en desarrollo')
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Reporte de {format(mes, "MMMM yyyy", { locale: es })}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Del {format(startOfMonth(mes), "d")} al {format(endOfMonth(mes), "d 'de' MMMM", { locale: es })}
                    </p>
                </div>
                <Button variant="outline" onClick={handleExportarExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar Excel
                </Button>
            </div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Créditos Otorgados */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-slate-600">Créditos Otorgados</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">{datos.creditosOtorgados}</p>
                        {cambiosCreditosOtorgados && (
                            <div className={`flex items-center gap-1 text-xs ${cambiosCreditosOtorgados.positivo ? 'text-emerald-600' : 'text-red-600'}`}>
                                {cambiosCreditosOtorgados.positivo ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {cambiosCreditosOtorgados.valor.toFixed(1)}% vs mes anterior
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monto Prestado */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-amber-600" />
                            <span className="text-sm text-slate-600">Monto Prestado</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-800">S/ {datos.montoTotalPrestado.toLocaleString()}</p>
                        {cambiosMontoPrestado && (
                            <div className={`flex items-center gap-1 text-xs ${cambiosMontoPrestado.positivo ? 'text-emerald-600' : 'text-red-600'}`}>
                                {cambiosMontoPrestado.positivo ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {cambiosMontoPrestado.valor.toFixed(1)}% vs mes anterior
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Intereses Ganados */}
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm text-emerald-700">Intereses Ganados</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-700">S/ {datos.interesesGanados.toLocaleString()}</p>
                        {cambiosIntereses && (
                            <div className={`flex items-center gap-1 text-xs ${cambiosIntereses.positivo ? 'text-emerald-600' : 'text-red-600'}`}>
                                {cambiosIntereses.positivo ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {cambiosIntereses.valor.toFixed(1)}% vs mes anterior
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tasa de Recuperación */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-slate-600">Tasa Recuperación</span>
                        </div>
                        <p className={`text-3xl font-bold ${tasaRecuperacion >= 80 ? 'text-emerald-600' : tasaRecuperacion >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {tasaRecuperacion.toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-500">{datos.creditosPagados} de {datos.creditosOtorgados} pagados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Métricas Secundarias */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <Card>
                    <CardContent className="py-3 text-center">
                        <p className="text-xs text-slate-500">Ticket Promedio</p>
                        <p className="text-lg font-bold text-slate-700">S/ {ticketPromedio.toFixed(0)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 text-center">
                        <p className="text-xs text-slate-500">Clientes Nuevos</p>
                        <p className="text-lg font-bold text-blue-600">{datos.clientesNuevos}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 text-center">
                        <p className="text-xs text-slate-500">Clientes Recurrentes</p>
                        <p className="text-lg font-bold text-purple-600">{datos.clientesRecurrentes}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 text-center">
                        <p className="text-xs text-slate-500">Créditos Vencidos</p>
                        <p className="text-lg font-bold text-red-600">{datos.creditosVencidos}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 text-center">
                        <p className="text-xs text-slate-500">Prendas Ejecutadas</p>
                        <p className="text-lg font-bold text-amber-600">{datos.prendasEjecutadas}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-3 text-center">
                        <p className="text-xs text-slate-500">Venta Prendas</p>
                        <p className="text-lg font-bold text-emerald-600">S/ {datos.ventaPrendas.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Resumen Financiero */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                <CardContent className="py-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-slate-400 text-sm">Capital Invertido</p>
                            <p className="text-2xl font-bold">S/ {datos.montoTotalPrestado.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Capital Recuperado</p>
                            <p className="text-2xl font-bold text-emerald-400">S/ {datos.montoRecuperado.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Ganancia del Mes</p>
                            <p className="text-2xl font-bold text-amber-400">
                                S/ {(datos.interesesGanados + datos.ventaPrendas).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
