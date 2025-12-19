
import React, { useState, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { CreditCard, RefreshCw, Archive, DollarSign, Calculator, Lock, Clock } from 'lucide-react'
import { dinero, sumar, formatearSoles } from '@/lib/utils/decimal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ModalidadInteres, calcularInteresFlexible, calcularDiasTranscurridos } from '@/lib/utils/interes-flexible'

// Typed Contract interface for TransactionBuilder
interface ContractForPayment {
    id: string
    monto_prestado: number | string
    saldo_pendiente: number | string
    tasa_interes?: number | string
    created_at?: string
    dias_transcurridos?: number
}

interface TransactionBuilderProps {
    selectedContracts: ContractForPayment[]
    onProcessPayment: (data: { intent: string; amount: string; contracts: string[]; metadata: { condonarInteres: boolean } }) => void
}

type PaymentIntent = 'RENOVAR' | 'AMORTIZAR' | 'LIQUIDAR' | 'PAGO_LIBRE'

export function TransactionBuilder({ selectedContracts, onProcessPayment }: TransactionBuilderProps) {
    const [intent, setIntent] = useState<PaymentIntent>('RENOVAR')
    const [customAmount, setCustomAmount] = useState<string>('')
    const [condonarInteres, setCondonarInteres] = useState(false)
    const [modalidadInteres, setModalidadInteres] = useState<ModalidadInteres>('dias') // NUEVO: Por defecto días

    // 1. Calculate Aggregated Totals with FLEXIBLE INTEREST
    const totals = useMemo(() => {
        let totalCapital = dinero('0')
        let totalInteres = dinero('0')
        const totalMora = dinero('0')
        let totalSaldo = dinero('0')
        let totalDias = 0

        selectedContracts.forEach(c => {
            totalCapital = sumar(totalCapital, c.monto_prestado || '0')
            totalSaldo = sumar(totalSaldo, c.saldo_pendiente || '0')

            // NUEVO: Cálculo de interés FLEXIBLE basado en días transcurridos
            const diasTranscurridos = c.created_at
                ? calcularDiasTranscurridos(c.created_at)
                : (c.dias_transcurridos || 30)
            const tasaInteres = Number(c.tasa_interes) || 20
            const montoPrestado = Number(c.monto_prestado) || 0

            // Calcular interés según modalidad seleccionada
            const resultado = calcularInteresFlexible(montoPrestado, tasaInteres, diasTranscurridos, modalidadInteres)
            totalInteres = sumar(totalInteres, String(resultado.interes))

            if (diasTranscurridos > totalDias) totalDias = diasTranscurridos
        })

        return {
            capital: totalCapital,
            interes: totalInteres,
            mora: totalMora,
            saldo: totalSaldo,
            diasTranscurridos: totalDias
        }
    }, [selectedContracts, modalidadInteres])

    // 2. Calculate Final Amount based on Intent
    const finalAmount = useMemo(() => {
        if (selectedContracts.length === 0) return dinero('0')

        switch (intent) {
            case 'RENOVAR':
                // Pay only interest to extend date
                return totals.interes.plus(totals.mora)
            case 'LIQUIDAR':
                // Pay everything
                return totals.saldo.plus(totals.interes).plus(totals.mora)
            case 'AMORTIZAR':
                // Pay interest + custom capital
                // If custom amount is set, we assume it INCLUDES interest
                // Or we can say custom amount is ONLY capital. 
                // Let's assume standard amortization: Cover interest first, then capital.
                if (!customAmount) return totals.interes // Min payment is interest
                return dinero(customAmount)
            default:
                return dinero('0')
        }
    }, [intent, totals, customAmount, selectedContracts])

    // Shortcuts
    useHotkeys('r', () => setIntent('RENOVAR'), [intent])
    useHotkeys('a', () => setIntent('AMORTIZAR'), [intent])
    useHotkeys('l', () => setIntent('LIQUIDAR'), [intent])
    useHotkeys('enter', () => {
        if (selectedContracts.length > 0) handleProcess()
    }, [selectedContracts, intent, finalAmount])

    const handleProcess = () => {
        try {
            // console.log('[TransactionBuilder] handleProcess START')

            // Validate contracts
            if (!selectedContracts || selectedContracts.length === 0) {
                console.warn('[TransactionBuilder] No contracts selected')
                return
            }

            // Safe String Conversion
            const amountStr = finalAmount ? finalAmount.toFixed(2) : "0.00"
            const contractIds = selectedContracts.map(c => c.id)

            // console.log('[TransactionBuilder] Processing Payload:', {
            //     intent,
            //     amount: amountStr,
            //     contractIds
            // })

            if (onProcessPayment) {
                onProcessPayment({
                    intent,
                    amount: amountStr,
                    contracts: contractIds,
                    metadata: { condonarInteres } // Pass flag
                })
            } else {
                console.error('[TransactionBuilder] onProcessPayment prop is missing!')
            }
        } catch (err) {
            console.error('[TransactionBuilder] CRITICAL ERROR in handleProcess:', err)
            // Fallback alert just in case toast doesn't work
            alert('Error crítico al procesar: ' + (err instanceof Error ? err.message : String(err)))
        }
    }

    if (selectedContracts.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <CreditCard className="opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-slate-600">Carrito Vacío</h3>
                <p className="text-sm">Selecciona contratos para construir una transacción.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
                <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Constructor de Transacciones</h2>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold text-slate-800">
                        {formatearSoles(finalAmount)}
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">A PAGAR</span>
                </div>
            </div>

            {/* Breakdown */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">Desglose (Calculado)</h3>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Capital Pendiente</span>
                        <span className="font-mono text-slate-700">{formatearSoles(totals.saldo)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Interés Devengado</span>
                        <span className="font-mono text-amber-500">+{formatearSoles(totals.interes)}</span>
                    </div>

                    {/* NUEVO: Selector de Modalidad de Interés */}
                    <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-xs text-slate-500 mr-2">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {totals.diasTranscurridos} días
                        </span>
                        <button
                            onClick={() => setModalidadInteres('dias')}
                            className={cn(
                                "px-3 py-1 text-xs rounded-md font-medium transition-colors",
                                modalidadInteres === 'dias'
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            )}
                        >
                            Por Días
                        </button>
                        <button
                            onClick={() => setModalidadInteres('semanas')}
                            className={cn(
                                "px-3 py-1 text-xs rounded-md font-medium transition-colors",
                                modalidadInteres === 'semanas'
                                    ? "bg-purple-500 text-white"
                                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            )}
                        >
                            Por Semana
                        </button>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Mora / Penalidad</span>
                        <span className="font-mono text-red-500">+{formatearSoles(totals.mora)}</span>
                    </div>

                    <div className="h-px bg-slate-200 my-2" />

                    {/* NEW CONDONATION ROW */}
                    {intent === 'RENOVAR' && (
                        <div className="flex items-center space-x-2 py-2 animate-in fade-in slide-in-from-top-1">
                            <Checkbox
                                id="condonar"
                                checked={condonarInteres}
                                onCheckedChange={(c) => setCondonarInteres(!!c)}
                            />
                            <Label htmlFor="condonar" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
                                Condonar deuda restante (Perdonar mora)
                            </Label>
                        </div>
                    )}

                    <div className="flex justify-between text-base font-bold mt-2">
                        <span className="text-slate-800">Deuda Total</span>
                        <span className="font-mono text-slate-800">{formatearSoles(totals.saldo.plus(totals.interes).plus(totals.mora))}</span>
                    </div>
                </div>

                {/* Intent Selector */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">Intención de Pago</h3>

                    <div className="grid gap-3">
                        <Button
                            variant={intent === 'RENOVAR' ? 'default' : 'outline'}
                            className={cn(
                                "h-14 justify-between border-slate-200 hover:bg-slate-50 transition-all group",
                                intent === 'RENOVAR' && "bg-indigo-50 hover:bg-indigo-100 border-indigo-300 ring-1 ring-indigo-200 text-indigo-700"
                            )}
                            onClick={() => setIntent('RENOVAR')}
                        >
                            <div className="flex items-center gap-3">
                                <RefreshCw size={18} />
                                <div className="text-left">
                                    <div className="font-bold">Renovar</div>
                                    <div className="text-[10px] opacity-70">Pagar interés, extender fecha</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 group-hover:text-slate-700">[R]</span>
                        </Button>

                        <Button
                            variant={intent === 'AMORTIZAR' ? 'default' : 'outline'}
                            className={cn(
                                "h-14 justify-between border-slate-200 hover:bg-slate-50 transition-all group",
                                intent === 'AMORTIZAR' && "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 ring-1 ring-emerald-200 text-emerald-700"
                            )}
                            onClick={() => setIntent('AMORTIZAR')}
                        >
                            <div className="flex items-center gap-3">
                                <DollarSign size={18} />
                                <div className="text-left">
                                    <div className="font-bold">Amortizar</div>
                                    <div className="text-[10px] opacity-70">Capital + Interés</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 group-hover:text-slate-700">[A]</span>
                        </Button>

                        <Button
                            variant={intent === 'LIQUIDAR' ? 'default' : 'outline'}
                            className={cn(
                                "h-14 justify-between border-slate-200 hover:bg-slate-50 transition-all group",
                                intent === 'LIQUIDAR' && "bg-rose-50 hover:bg-rose-100 border-rose-300 ring-1 ring-rose-200 text-rose-700"
                            )}
                            onClick={() => setIntent('LIQUIDAR')}
                        >
                            <div className="flex items-center gap-3">
                                <Archive size={18} />
                                <div className="text-left">
                                    <div className="font-bold">Liquidar (Todo)</div>
                                    <div className="text-[10px] opacity-70">Cierra cancelando deuda</div>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 group-hover:text-slate-700">[L]</span>
                        </Button>
                    </div>
                </div>

                {/* Custom Input for Amortization */}
                {intent === 'AMORTIZAR' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs text-slate-400">Monto a abonar</label>
                        <div className="relative">
                            <input
                                type="number"
                                autoFocus
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                className="w-full bg-white border border-emerald-300 rounded-lg p-3 pl-10 text-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0.00"
                            />
                            <Calculator className="absolute left-3 top-3.5 text-emerald-500" size={18} />
                        </div>
                        <p className="text-[10px] text-slate-500">* Se prioriza interés, el resto a capital.</p>
                    </div>
                )}

            </div>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50">
                <Button
                    size="lg"
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/20"
                    onClick={handleProcess}
                >
                    <Lock size={16} className="mr-2" />
                    PROCESAR PAGO
                </Button>
            </div>
        </div>
    )
}
