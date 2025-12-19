"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calculator, Calendar, TrendingDown } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface LiquidacionCalculatorProps {
    capital: number
    tasaMensual: number // En porcentaje (ej: 20 = 20%)
    fechaDesembolso: Date
    fechaVencimiento: Date
}

export function LiquidacionCalculator({
    capital,
    tasaMensual,
    fechaDesembolso,
    fechaVencimiento
}: LiquidacionCalculatorProps) {
    const [fechaPago, setFechaPago] = useState<Date>(new Date())

    const liquidacion = useMemo(() => {
        const diasTranscurridos = Math.max(0, differenceInDays(fechaPago, fechaDesembolso))
        const diasVencimiento = differenceInDays(fechaVencimiento, fechaDesembolso)
        const diasMora = Math.max(0, differenceInDays(fechaPago, fechaVencimiento))

        // Tasa proporcional al tiempo transcurrido
        const porcentajeTranscurrido = Math.min(diasTranscurridos / diasVencimiento, 1)
        const tasaProporcional = tasaMensual * porcentajeTranscurrido

        // Calcular interés compensatorio proporcional
        const interesCompensatorio = capital * (tasaProporcional / 100)

        // Calcular interés moratorio (solo si hay mora)
        const tasaMoratoriaDiaria = 0.3 // 0.3% diario
        const interesMoratorio = diasMora > 0
            ? capital * (tasaMoratoriaDiaria / 100) * diasMora
            : 0

        // Total a pagar
        const totalPagar = capital + interesCompensatorio + interesMoratorio

        // Ahorro respecto al vencimiento completo
        const interesCompleto = capital * (tasaMensual / 100)
        const ahorro = diasMora === 0 ? interesCompleto - interesCompensatorio : 0

        return {
            diasTranscurridos,
            diasMora,
            tasaProporcional: tasaProporcional.toFixed(1),
            interesCompensatorio: interesCompensatorio.toFixed(2),
            interesMoratorio: interesMoratorio.toFixed(2),
            totalPagar: totalPagar.toFixed(2),
            ahorro: ahorro.toFixed(2),
            estaVencido: diasMora > 0
        }
    }, [capital, tasaMensual, fechaDesembolso, fechaVencimiento, fechaPago])

    return (
        <Card className="border-2">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Calculadora de Liquidación
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selector de Fecha de Pago */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de Pago
                    </Label>
                    <Input
                        type="date"
                        value={format(fechaPago, 'yyyy-MM-dd')}
                        onChange={(e) => setFechaPago(new Date(e.target.value))}
                        className="w-full"
                    />
                    <p className="text-xs text-slate-500">
                        {liquidacion.diasTranscurridos} días desde el desembolso
                        {liquidacion.estaVencido && (
                            <span className="text-red-600 font-bold"> • {liquidacion.diasMora} días en mora</span>
                        )}
                    </p>
                </div>

                {/* Estado */}
                <div className="flex justify-center">
                    {liquidacion.estaVencido ? (
                        <Badge variant="destructive" className="text-sm px-4 py-1">
                            ⚠️ CRÉDITO VENCIDO ({liquidacion.diasMora} días)
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-sm px-4 py-1 bg-emerald-100 text-emerald-800">
                            ✓ Dentro del plazo
                        </Badge>
                    )}
                </div>

                {/* Desglose */}
                <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Capital:</span>
                        <span className="font-medium">S/ {capital.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Interés ({liquidacion.tasaProporcional}%):</span>
                        <span className="font-medium">S/ {liquidacion.interesCompensatorio}</span>
                    </div>
                    {liquidacion.estaVencido && (
                        <div className="flex justify-between text-sm text-red-600">
                            <span>Interés Moratorio:</span>
                            <span className="font-medium">S/ {liquidacion.interesMoratorio}</span>
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className={`p-4 rounded-lg text-center ${liquidacion.estaVencido ? 'bg-red-50' : 'bg-emerald-50'}`}>
                    <p className="text-xs text-slate-500 uppercase">Total a Pagar HOY</p>
                    <p className={`text-2xl font-bold ${liquidacion.estaVencido ? 'text-red-600' : 'text-emerald-600'}`}>
                        S/ {liquidacion.totalPagar}
                    </p>
                </div>

                {/* Ahorro (solo si no está vencido) */}
                {!liquidacion.estaVencido && parseFloat(liquidacion.ahorro) > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <TrendingDown className="h-5 w-5 text-amber-600" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">
                                ¡Ahorra S/ {liquidacion.ahorro}!
                            </p>
                            <p className="text-xs text-amber-600">
                                Pagando hoy en vez de al vencimiento
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
