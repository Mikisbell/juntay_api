"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    calcularWaterfallDistribution,
    redondear
} from "@/lib/utils/rendimientos-inversionista"

interface WaterfallProps {
    capitalInvertido: number
    hurdleRate: number // Porcentaje (ej: 8)
    carriedInterest: number // Porcentaje (ej: 20)
}

export function WaterfallDistributionSim({
    capitalInvertido = 100000,
    hurdleRate = 8,
    carriedInterest = 20
}: WaterfallProps) {
    const [utilidadNeta, setUtilidadNeta] = useState<string>("0")

    const utilidadNum = parseFloat(utilidadNeta) || 0

    const resultado = calcularWaterfallDistribution({
        capitalInvertido,
        gananciasTotales: utilidadNum,
        hurdleRate,
        carriedRate: carriedInterest
    })

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount)
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Simulador de Distribución (Waterfall) 🌊</CardTitle>
                <CardDescription>
                    Calcula cómo se reparten las utilidades bajo el modelo Private Equity.
                    <br />
                    Capital: <b>{formatMoney(capitalInvertido)}</b> | Hurdle: <b>{hurdleRate}%</b> | Carried: <b>{carriedInterest}%</b>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="utilidad">Utilidad Neta del Proyecto (Net Profit)</Label>
                    <Input
                        id="utilidad"
                        type="number"
                        placeholder="Ingrese la ganancia a repartir"
                        value={utilidadNeta}
                        onChange={(e) => setUtilidadNeta(e.target.value)}
                        className="text-lg font-bold"
                    />
                </div>

                <div className="rounded-md border">
                    <div className="grid grid-cols-4 bg-muted p-2 font-medium text-sm">
                        <div>Nivel (Tier)</div>
                        <div className="text-right">Monto Total</div>
                        <div className="text-right text-blue-600">Socio ({100 - carriedInterest}%)</div>
                        <div className="text-right text-green-600">Gestor ({carriedInterest}%)</div>
                    </div>

                    {/* Tier 1: Return of Capital */}
                    <div className="grid grid-cols-4 p-2 text-sm border-t items-center">
                        <div className="flex flex-col">
                            <span className="font-semibold">1. Retorno Capital</span>
                            <span className="text-xs text-muted-foreground">100% al Socio</span>
                        </div>
                        <div className="text-right">{formatMoney(resultado.retornoCapital)}</div>
                        <div className="text-right font-medium">{formatMoney(resultado.retornoCapital)}</div>
                        <div className="text-right text-muted-foreground">-</div>
                    </div>

                    {/* Tier 2: Hurdle */}
                    <div className="grid grid-cols-4 p-2 text-sm border-t items-center bg-slate-50">
                        <div className="flex flex-col">
                            <span className="font-semibold">2. Hurdle ({hurdleRate}%)</span>
                            <span className="text-xs text-muted-foreground">Retorno Preferente</span>
                        </div>
                        <div className="text-right">{formatMoney(resultado.hurdleReturn)}</div>
                        <div className="text-right font-medium">{formatMoney(resultado.hurdleReturn)}</div>
                        <div className="text-right text-muted-foreground">-</div>
                    </div>

                    {/* Tier 3: Catch Up */}
                    <div className="grid grid-cols-4 p-2 text-sm border-t items-center">
                        <div className="flex flex-col">
                            <span className="font-semibold">3. Catch Up</span>
                            <span className="text-xs text-muted-foreground">Ponerse al día (Gestor)</span>
                        </div>
                        <div className="text-right">{formatMoney(resultado.catchUp)}</div>
                        <div className="text-right text-muted-foreground">-</div>
                        <div className="text-right font-medium">{formatMoney(resultado.catchUp)}</div>
                    </div>

                    {/* Tier 4: Carried Interest */}
                    <div className="grid grid-cols-4 p-2 text-sm border-t items-center bg-slate-50">
                        <div className="flex flex-col">
                            <span className="font-semibold">4. Carried Interest</span>
                            <span className="text-xs text-muted-foreground">Reparto Final</span>
                        </div>
                        <div className="text-right">{formatMoney(Math.max(0, utilidadNum - resultado.retornoCapital - resultado.hurdleReturn - resultado.catchUp))}</div>
                        <div className="text-right">{formatMoney(resultado.totalInversionista - resultado.retornoCapital - resultado.hurdleReturn)}</div>
                        <div className="text-right">{formatMoney(resultado.carriedInterest - resultado.catchUp)}</div>
                    </div>

                    {/* TOTALS */}
                    <div className="grid grid-cols-4 p-3 text-base border-t bg-muted/50 font-bold mt-2">
                        <div>TOTAL</div>
                        <div className="text-right">{formatMoney(Math.min(utilidadNum, resultado.totalInversionista + resultado.totalEmpresa))}</div>
                        <div className="text-right text-blue-700">{formatMoney(resultado.totalInversionista)}</div>
                        <div className="text-right text-green-700">{formatMoney(resultado.totalEmpresa)}</div>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                    * Nota: El Gestor (Empresa) empieza a ganar solo después de que el Socio recupera su capital + {hurdleRate}% de interés.
                </div>

            </CardContent>
        </Card>
    )
}
