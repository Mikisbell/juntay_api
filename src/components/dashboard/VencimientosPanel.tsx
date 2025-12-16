"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Calendar, Clock, CheckCircle } from 'lucide-react'
import { differenceInDays, isToday, isTomorrow, addDays } from 'date-fns'

interface Credito {
    id: string
    codigo_credito?: string
    cliente: {
        nombres: string
        apellido_paterno: string
        numero_documento: string
        telefono?: string
    }
    monto_prestamo: number
    saldo_actual: number
    fecha_vencimiento: string
    estado: string
}

interface VencimientosPanelProps {
    creditos: Credito[]
}

export function VencimientosPanel({ creditos }: VencimientosPanelProps) {
    const categorized = useMemo(() => {
        const today = new Date()
        const in7Days = addDays(today, 7)

        const vencidos: Credito[] = []
        const hoy: Credito[] = []
        const manana: Credito[] = []
        const semana: Credito[] = []
        const alDia: Credito[] = []

        creditos.forEach(credito => {
            if (credito.estado === 'PAGADO' || credito.estado === 'CANCELADO') {
                return // Skip paid/cancelled
            }

            const fechaVenc = new Date(credito.fecha_vencimiento)
            const dias = differenceInDays(fechaVenc, today)

            if (dias < 0) {
                vencidos.push(credito)
            } else if (isToday(fechaVenc)) {
                hoy.push(credito)
            } else if (isTomorrow(fechaVenc)) {
                manana.push(credito)
            } else if (dias <= 7) {
                semana.push(credito)
            } else {
                alDia.push(credito)
            }
        })

        // Ordenar vencidos por días de mora (más antiguos primero)
        vencidos.sort((a, b) =>
            new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()
        )

        return { vencidos, hoy, manana, semana, alDia }
    }, [creditos])

    const totalPorCobrar = useMemo(() => {
        return [...categorized.vencidos, ...categorized.hoy].reduce(
            (sum, c) => sum + (c.saldo_actual || c.monto_prestamo), 0
        )
    }, [categorized])

    return (
        <div className="space-y-4">
            {/* Resumen en Tarjetas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Vencidos */}
                <Card className={`border-2 ${categorized.vencidos.length > 0 ? 'border-red-300 bg-red-50' : ''}`}>
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-5 w-5 ${categorized.vencidos.length > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                            <span className="text-sm font-medium text-slate-600">Vencidos</span>
                        </div>
                        <p className={`text-3xl font-bold ${categorized.vencidos.length > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                            {categorized.vencidos.length}
                        </p>
                    </CardContent>
                </Card>

                {/* Vencen Hoy */}
                <Card className={`border-2 ${categorized.hoy.length > 0 ? 'border-orange-300 bg-orange-50' : ''}`}>
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className={`h-5 w-5 ${categorized.hoy.length > 0 ? 'text-orange-600' : 'text-slate-400'}`} />
                            <span className="text-sm font-medium text-slate-600">Hoy</span>
                        </div>
                        <p className={`text-3xl font-bold ${categorized.hoy.length > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                            {categorized.hoy.length}
                        </p>
                    </CardContent>
                </Card>

                {/* Esta Semana */}
                <Card className={`border-2 ${categorized.semana.length + categorized.manana.length > 0 ? 'border-amber-300 bg-amber-50' : ''}`}>
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className={`h-5 w-5 ${categorized.semana.length + categorized.manana.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span className="text-sm font-medium text-slate-600">Esta Semana</span>
                        </div>
                        <p className={`text-3xl font-bold ${categorized.semana.length + categorized.manana.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {categorized.semana.length + categorized.manana.length}
                        </p>
                    </CardContent>
                </Card>

                {/* Al Día */}
                <Card className="border-2">
                    <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-medium text-slate-600">Al Día</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-600">
                            {categorized.alDia.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Total por Cobrar Urgente */}
            {totalPorCobrar > 0 && (
                <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                    <CardContent className="py-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80">Por cobrar urgente (vencidos + hoy)</p>
                            <p className="text-2xl font-bold">S/ {totalPorCobrar.toFixed(2)}</p>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30">
                            {categorized.vencidos.length + categorized.hoy.length} créditos
                        </Badge>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Vencidos */}
            {categorized.vencidos.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Créditos Vencidos ({categorized.vencidos.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {categorized.vencidos.slice(0, 5).map(credito => {
                                const diasMora = Math.abs(differenceInDays(new Date(credito.fecha_vencimiento), new Date()))
                                return (
                                    <div key={credito.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div>
                                            <p className="font-medium">{credito.cliente.nombres} {credito.cliente.apellido_paterno}</p>
                                            <p className="text-xs text-slate-500">#{credito.codigo_credito} • {diasMora} días en mora</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600">S/ {credito.saldo_actual?.toFixed(2) || credito.monto_prestamo.toFixed(2)}</p>
                                            {credito.cliente.telefono && (
                                                <a href={`tel:${credito.cliente.telefono}`} className="text-xs text-blue-600 hover:underline">
                                                    📞 {credito.cliente.telefono}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {categorized.vencidos.length > 5 && (
                                <p className="text-center text-sm text-slate-500">
                                    + {categorized.vencidos.length - 5} más...
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Hoy */}
            {categorized.hoy.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                            <Clock className="h-5 w-5" />
                            Vencen Hoy ({categorized.hoy.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {categorized.hoy.map(credito => (
                                <div key={credito.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div>
                                        <p className="font-medium">{credito.cliente.nombres} {credito.cliente.apellido_paterno}</p>
                                        <p className="text-xs text-slate-500">#{credito.codigo_credito}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-orange-600">S/ {credito.saldo_actual?.toFixed(2) || credito.monto_prestamo.toFixed(2)}</p>
                                        {credito.cliente.telefono && (
                                            <a href={`https://wa.me/51${credito.cliente.telefono}`} className="text-xs text-green-600 hover:underline">
                                                💬 WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Todo al día */}
            {categorized.vencidos.length === 0 && categorized.hoy.length === 0 && (
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                        <p className="text-lg font-medium text-emerald-800">¡Todo al día!</p>
                        <p className="text-sm text-emerald-600">No tienes créditos vencidos ni próximos a vencer hoy.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
