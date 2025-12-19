"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CheckCircle2, FileText, Printer, Plus, Scroll, Banknote, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { confirmarDesembolsoCredito } from "@/lib/actions/creditos-actions"
import { Separator } from "@/components/ui/separator"

// Importar funciones de impresión
import {
    imprimirContratoMutuo,
    imprimirTicketTermico,
    imprimirPagare,
    type PrintData as DocumentPrintData
} from "@/components/printing/documents"
import { PrintData } from "@/components/printing/documents/types"

interface TransactionSuccessViewProps {
    data: PrintData
    onReset: () => void
}

export function TransactionSuccessView({ data, onReset }: TransactionSuccessViewProps) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)

    // Determinar si necesita confirmación de desembolso (si no viene ya desembolsado del server)
    // El RPC devuelve 'DESEMBOLSADO' si hubo caja, 'PENDIENTE_CAJA' si no.
    // Si es PENDIENTE_CAJA, permitimos confirmar si el usuario abre caja ahora (raro) 
    // o simplemente es un estado informativo.
    // Asumiremos la lógica del modal original: permitir confirmar si no lo está.
    const needsDisbursementConfirmation = data.estado !== 'DESEMBOLSADO' && !isConfirmed

    const handleConfirmDisbursement = async () => {
        if (!data.creditoId) {
            toast.error("No se encontró el ID del crédito")
            return
        }

        setIsConfirming(true)
        try {
            const result = await confirmarDesembolsoCredito(data.creditoId)
            if (result.success) {
                setIsConfirmed(true)
                toast.success("✅ ¡Desembolso confirmado! Entregue S/" + data.monto + " al cliente")
            } else {
                toast.error(result.error || "Error al confirmar desembolso")
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || "Error al confirmar desembolso")
        } finally {
            setIsConfirming(false)
        }
    }

    // Handlers de impresión
    const handlePrintContract = () => imprimirContratoMutuo(data as DocumentPrintData)
    const handlePrintTicket = () => imprimirTicketTermico(data as DocumentPrintData)
    const handlePrintPagare = () => imprimirPagare(data as DocumentPrintData)

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
            <Card className="border-2 border-emerald-100 shadow-xl overflow-hidden">
                <div className="bg-emerald-600 p-8 text-white text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 p-1">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">¡Transacción Exitosa!</h1>
                    <p className="text-emerald-100 text-lg">
                        Operación #{data.codigo} registrada correctamente
                    </p>
                </div>

                <CardContent className="p-8 space-y-8">
                    {/* Resumen Principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4 tracking-wider">
                                    Detalle Financiero
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-600">Monto del Préstamo</span>
                                        <span className="text-3xl font-bold text-emerald-600">
                                            S/ {data.monto?.toFixed(2)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Interés ({data.tasaInteres}%)</span>
                                        <span className="font-medium">S/ {data.interes?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Total a Pagar</span>
                                        <span className="font-bold">S/ {data.totalPagar?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                <h3 className="text-sm font-semibold text-amber-700 uppercase mb-4 tracking-wider">
                                    Garantía en Custodia
                                </h3>
                                <div className="space-y-1">
                                    <p className="font-medium text-lg text-slate-800">
                                        {data.garantiaDescripcion || data.descripcion}
                                    </p>
                                    <p className="text-sm text-amber-800">
                                        Tasación: S/ {data.valorTasacion?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4 tracking-wider">
                                    Documentación y Firma
                                </h3>

                                {/* Botones de Impresión */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-24 flex-col gap-2 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-200 transition-all font-normal"
                                        onClick={handlePrintContract}
                                    >
                                        <FileText className="h-8 w-8 text-blue-600" />
                                        <span>Contrato</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-24 flex-col gap-2 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-200 transition-all font-normal"
                                        onClick={handlePrintPagare}
                                    >
                                        <Scroll className="h-8 w-8 text-amber-600" />
                                        <span>Pagaré</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-24 flex-col gap-2 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-200 transition-all font-normal"
                                        onClick={handlePrintTicket}
                                    >
                                        <Printer className="h-8 w-8 text-emerald-600" />
                                        <span>Ticket</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Zona de Desembolso */}
                            {needsDisbursementConfirmation ? (
                                <div className="space-y-3 pt-6 border-t">
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <p>Asegúrese de que el cliente haya firmado todos los documentos antes de entregar el dinero.</p>
                                    </div>
                                    <Button
                                        className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                                        onClick={handleConfirmDisbursement}
                                        disabled={isConfirming}
                                    >
                                        {isConfirming ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <Banknote className="w-6 h-6 mr-2" />
                                                Confirmar Entrega de Efectivo
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-6 bg-emerald-100 border-2 border-emerald-200 rounded-xl text-center mt-auto">
                                    <p className="text-emerald-800 font-bold flex items-center justify-center gap-2 text-lg">
                                        <CheckCircle2 className="w-6 h-6" />
                                        Desembolso Completado
                                    </p>
                                    <p className="text-emerald-700 text-sm mt-1">
                                        El efectivo ha sido descontado de caja correctamente.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                        Cliente: <span className="font-semibold text-slate-700">{data.clienteNombre}</span>
                    </div>

                    <Button
                        size="lg"
                        onClick={onReset}
                        className="bg-slate-900 hover:bg-slate-800 text-white min-w-[200px] shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Siguiente Cliente
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
