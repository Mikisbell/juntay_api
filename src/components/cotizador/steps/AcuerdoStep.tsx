'use client'

import { useCotizador } from '@/hooks/useCotizador'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useRef } from 'react'

export default function AcuerdoStep() {
    const {
        montoPrestamoMaximo,
        montoPrestamo, setMontoPrestamo,
        plazo, setPlazo
    } = useCotizador()

    // Ref to track if we've already initialized the monto
    const hasInitializedMontoRef = useRef(false)

    // Inicializar monto si es 0 (solo una vez cuando max es válido)
    useEffect(() => {
        if (montoPrestamoMaximo > 0 && montoPrestamo === 0 && !hasInitializedMontoRef.current) {
            hasInitializedMontoRef.current = true
            setMontoPrestamo(montoPrestamoMaximo)
        }
    }, [montoPrestamoMaximo, montoPrestamo, setMontoPrestamo])

    // Calcular interés (simulado 10% mensual)
    const interes = montoPrestamo * 0.10
    const totalPagar = montoPrestamo + interes
    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + plazo)

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-lg">Monto del Préstamo</Label>
                    <div className="relative w-40">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">S/</span>
                        <Input
                            type="number"
                            className="pl-8 font-bold text-right"
                            value={montoPrestamo}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                if (val <= montoPrestamoMaximo) setMontoPrestamo(val)
                            }}
                        />
                    </div>
                </div>

                <Slider
                    value={[montoPrestamo]}
                    max={montoPrestamoMaximo}
                    step={10}
                    onValueChange={(vals) => setMontoPrestamo(vals[0])}
                    className="py-4"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: S/ 50.00</span>
                    <span>Max: S/ {montoPrestamoMaximo.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Plazo del Contrato</Label>
                <Select value={plazo.toString()} onValueChange={(v) => setPlazo(parseInt(v))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione plazo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">7 Días (Semanal)</SelectItem>
                        <SelectItem value="15">15 Días (Quincenal)</SelectItem>
                        <SelectItem value="30">30 Días (Mensual)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-3">
                <h4 className="font-semibold text-amber-900 mb-4">Resumen Financiero</h4>

                <div className="flex justify-between text-sm">
                    <span className="text-amber-800">Capital Prestado:</span>
                    <span className="font-medium">S/ {montoPrestamo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-amber-800">Interés (10%):</span>
                    <span className="font-medium">S/ {interes.toFixed(2)}</span>
                </div>
                <div className="border-t border-amber-200 my-2 pt-2 flex justify-between font-bold text-amber-900">
                    <span>Total a Pagar:</span>
                    <span>S/ {totalPagar.toFixed(2)}</span>
                </div>
                <div className="text-xs text-right text-amber-700 mt-2">
                    Vence el: {fechaVencimiento.toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}
