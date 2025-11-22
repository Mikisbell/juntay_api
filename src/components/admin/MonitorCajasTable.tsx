"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, TrendingDown, Activity, Users, Wallet } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { CajaActivaDetalle, ResumenConsolidado } from "@/lib/actions/monitor-cajas-actions"

interface Props {
    cajasIniciales: CajaActivaDetalle[]
    resumenInicial: ResumenConsolidado
    onRefresh: () => Promise<{ cajas: CajaActivaDetalle[], resumen: ResumenConsolidado }>
}

export function MonitorCajasTable({ cajasIniciales, resumenInicial, onRefresh }: Props) {
    const [cajas, setCajas] = useState(cajasIniciales)
    const [resumen, setResumen] = useState(resumenInicial)
    const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date())
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const interval = setInterval(async () => {
            setRefreshing(true)
            try {
                const data = await onRefresh()
                setCajas(data.cajas)
                setResumen(data.resumen)
                setUltimaActualizacion(new Date())
            } catch (error) {
                console.error('Error refrescando datos:', error)
            } finally {
                setRefreshing(false)
            }
        }, 30000) // 30 segundos

        return () => clearInterval(interval)
    }, [onRefresh])

    const formatCurrency = (amount: number) => {
        return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
    }

    return (
        <div className="space-y-6">
            {/* Header con tiempo de actualización */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>
                        Última actualización: {formatDistanceToNow(ultimaActualizacion, { addSuffix: true, locale: es })}
                    </span>
                    {refreshing && (
                        <Badge variant="outline" className="animate-pulse">
                            Actualizando...
                        </Badge>
                    )}
                </div>
            </div>

            {/* KPIs Consolidados */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Cajas Abiertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span className="text-2xl font-bold">{resumen.total_cajas_abiertas}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Efectivo Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-emerald-600" />
                            <span className="text-2xl font-bold">{formatCurrency(resumen.total_efectivo_cajas)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Transacciones Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <span className="text-2xl font-bold">{resumen.total_transacciones_hoy}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Empeños Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                            <span className="text-2xl font-bold">{resumen.total_empenos_hoy}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Pagos Hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            <span className="text-2xl font-bold">{resumen.total_pagos_hoy}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de Cajas Activas */}
            {cajas.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500">No hay cajas abiertas en este momento</p>
                        <p className="text-xs text-slate-400 mt-1">Las cajas aparecerán aquí cuando los cajeros inicien su turno</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Desglose por Cajero</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left p-4 text-xs font-medium text-slate-600 uppercase">Caja #</th>
                                        <th className="text-left p-4 text-xs font-medium text-slate-600 uppercase">Cajero</th>
                                        <th className="text-right p-4 text-xs font-medium text-slate-600 uppercase">Saldo Inicial</th>
                                        <th className="text-right p-4 text-xs font-medium text-slate-600 uppercase">Préstamos Hoy</th>
                                        <th className="text-right p-4 text-xs font-medium text-slate-600 uppercase">Cobros Hoy</th>
                                        <th className="text-right p-4 text-xs font-medium text-slate-600 uppercase">Saldo Actual</th>
                                        <th className="text-center p-4 text-xs font-medium text-slate-600 uppercase">TX</th>
                                        <th className="text-center p-4 text-xs font-medium text-slate-600 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cajas.map((caja) => {
                                        const variacion = caja.saldo_actual - caja.saldo_inicial
                                        const esPositivo = variacion >= 0

                                        return (
                                            <tr key={caja.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="p-4">
                                                    <Badge variant="outline" className="font-mono">
                                                        #{String(caja.numero_caja).padStart(3, '0')}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 font-medium">{caja.usuario_nombre}</td>
                                                <td className="p-4 text-right text-slate-600">
                                                    {formatCurrency(caja.saldo_inicial)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="text-red-600 font-semibold">
                                                        - {formatCurrency(caja.total_egresos_dia)}
                                                    </span>
                                                    <span className="text-xs text-slate-500 ml-2">({caja.num_empenos_dia})</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className="text-emerald-600 font-semibold">
                                                        + {formatCurrency(caja.total_ingresos_dia)}
                                                    </span>
                                                    <span className="text-xs text-slate-500 ml-2">({caja.num_pagos_dia})</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-lg">{formatCurrency(caja.saldo_actual)}</span>
                                                        <span className={`text-xs ${esPositivo ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {esPositivo ? '+' : ''}{formatCurrency(variacion)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Badge variant="secondary">{caja.num_transacciones_dia}</Badge>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                                                        ● Operativa
                                                    </Badge>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
