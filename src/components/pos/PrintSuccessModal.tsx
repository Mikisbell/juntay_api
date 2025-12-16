/**
 * PrintSuccessModal - Modal de éxito después de aprobar un crédito
 * 
 * REFACTORIZADO: Los documentos de impresión ahora están en archivos separados
 * para facilitar auditorías legales y mantenimiento.
 * 
 * @see /components/printing/documents/ContratoMutuo.ts
 * @see /components/printing/documents/TicketTermico.ts
 * @see /components/printing/documents/Pagare.ts
 */

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FileText, Printer, Plus, Scroll, Banknote, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { confirmarDesembolsoCredito } from "@/lib/actions/creditos-actions"

// Importar funciones de impresión desde documentos separados
import {
    imprimirContratoMutuo,
    imprimirTicketTermico,
    imprimirPagare,
    type PrintData as DocumentPrintData
} from "@/components/printing/documents"

// ============================================================================
// Tipos
// ============================================================================
interface PrintData {
    codigo?: string
    monto?: number
    cliente?: string
    clienteNombre?: string
    clienteDocumento?: string
    clienteDireccion?: string
    descripcion?: string
    garantiaDescripcion?: string
    garantiaEstado?: string
    valorTasacion?: number
    estado?: string
    tasaInteres?: number
    fotos?: string[]
    creditoId?: string
    // Campos del RPC
    fechaVencimiento?: string
    totalPagar?: number
    interes?: number
    fechaInicio?: Date | string
    periodoDias?: number
}

interface PrintSuccessModalProps {
    open: boolean
    data: PrintData | null
    onClose: () => void
    onReset: () => void
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export function PrintSuccessModal({ open, data, onClose, onReset }: PrintSuccessModalProps) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)

    if (!data) return null

    // Determinar si necesita confirmación de desembolso
    const needsDisbursementConfirmation = data.estado !== 'DESEMBOLSADO' && !isConfirmed

    // Función para confirmar el desembolso (después de que el cliente firma)
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

    // Handlers de impresión usando los nuevos módulos
    const handlePrintContract = () => imprimirContratoMutuo(data as DocumentPrintData)
    const handlePrintTicket = () => imprimirTicketTermico(data as DocumentPrintData)
    const handlePrintPagare = () => imprimirPagare(data as DocumentPrintData)

    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">¡Crédito Aprobado!</DialogTitle>
                            <p className="text-sm text-slate-500">
                                Contrato: <span className="font-mono font-bold">{data.codigo}</span>
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Resumen del Crédito */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">Cliente</span>
                        <span className="font-semibold">{data.clienteNombre || data.cliente}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">DNI</span>
                        <span className="font-mono">{data.clienteDocumento}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                        <span className="text-slate-600">Monto a Desembolsar</span>
                        <span className="text-2xl font-bold text-emerald-600">
                            S/ {data.monto?.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Artículo en Garantía */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-amber-600 font-medium mb-1">GARANTÍA RECIBIDA</p>
                    <p className="font-medium">{data.garantiaDescripcion || data.descripcion}</p>
                    {data.valorTasacion && (
                        <p className="text-sm text-amber-700 mt-1">
                            Tasación: S/ {data.valorTasacion.toFixed(2)}
                        </p>
                    )}
                </div>

                {/* Instrucción al Cajero */}
                {needsDisbursementConfirmation && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="font-bold text-blue-900">Flujo de Trabajo:</p>
                        <ol className="text-sm text-blue-800 list-decimal list-inside mt-2 space-y-1">
                            <li>Imprima los documentos legales</li>
                            <li>El cliente DEBE firmar contrato y pagaré</li>
                            <li>Después de la firma, presione &quot;Confirmar Desembolso&quot;</li>
                            <li>Entregue el efectivo al cliente</li>
                        </ol>
                    </div>
                )}

                {/* Botones de Impresión */}
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant="outline"
                        className="h-16 sm:h-20 flex-col gap-1 hover:bg-blue-50 border-2"
                        onClick={handlePrintContract}
                    >
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        <span className="text-[10px] sm:text-xs">Contrato A4</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-16 sm:h-20 flex-col gap-1 hover:bg-amber-50 border-2"
                        onClick={handlePrintPagare}
                    >
                        <Scroll className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                        <span className="text-[10px] sm:text-xs">Pagaré</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-16 sm:h-20 flex-col gap-1 hover:bg-emerald-50 border-2"
                        onClick={handlePrintTicket}
                    >
                        <Printer className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                        <span className="text-[10px] sm:text-xs">Ticket</span>
                    </Button>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3">
                    {/* Botón principal de confirmación de desembolso */}
                    {needsDisbursementConfirmation ? (
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
                                    <Banknote className="w-5 h-5 mr-2" />
                                    ✅ Documentos Firmados - Confirmar Desembolso
                                </>
                            )}
                        </Button>
                    ) : isConfirmed ? (
                        <div className="w-full p-4 bg-emerald-100 border-2 border-emerald-300 rounded-lg text-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <p className="text-emerald-800 font-semibold">
                                ¡Desembolso Confirmado!
                            </p>
                            <p className="text-emerald-700 text-lg font-bold">
                                Entregue S/{data.monto?.toFixed(2)} al cliente
                            </p>
                        </div>
                    ) : (
                        <div className="w-full p-3 bg-emerald-100 border border-emerald-200 rounded-lg text-center">
                            <p className="text-emerald-800 font-medium">
                                ✅ Desembolso automático completado
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2 w-full">
                        <Button variant="ghost" onClick={onClose} className="flex-1">
                            Cerrar
                        </Button>
                        <Button className="flex-1 bg-slate-900" onClick={() => {
                            onClose()
                            onReset()
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Cliente
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
