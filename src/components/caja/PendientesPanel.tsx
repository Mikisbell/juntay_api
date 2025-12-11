"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obtenerCreditosPendientesDesembolso, desembolsarCreditoPendiente } from '@/lib/actions/creditos-actions'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DollarSign, Clock, AlertTriangle, Banknote } from "lucide-react"
import { toast } from "sonner"
import { useState } from 'react'
import { PrintSuccessModal } from "@/components/pos/PrintSuccessModal"

interface CreditoPendiente {
    id: string
    monto_prestado: number
    codigo_credito?: string
    created_at: string
    clientes: any
    garantias: any
}

export function PendientesPanel({ cajaId, saldoCaja }: { cajaId: string; saldoCaja?: number }) {
    const queryClient = useQueryClient()
    const [successData, setSuccessData] = useState<any>(null)
    const [selectedCredito, setSelectedCredito] = useState<CreditoPendiente | null>(null)

    const { data: pendientes } = useQuery({
        queryKey: ['creditos', 'pendientes'],
        queryFn: () => obtenerCreditosPendientesDesembolso()
    })

    const { mutate: desembolsar, isPending } = useMutation({
        mutationFn: async (creditoId: string) => desembolsarCreditoPendiente(creditoId, cajaId),
        onSuccess: (_, creditoId) => {
            queryClient.invalidateQueries({ queryKey: ['creditos'] })
            queryClient.invalidateQueries({ queryKey: ['caja'] })

            const credito = pendientes?.find(p => p.id === creditoId)
            const cliente = Array.isArray(credito?.clientes) ? credito?.clientes[0] : credito?.clientes

            setSuccessData({
                estado: 'DESEMBOLSADO',
                codigo: credito?.codigo_credito,
                monto: credito?.monto_prestado,
                cliente: cliente?.nombres
            })
            setSelectedCredito(null)
        },
        onError: () => {
            toast.error("Error al desembolsar")
            setSelectedCredito(null)
        }
    })

    if (!pendientes || pendientes.length === 0) return null

    const handleConfirmDesembolso = () => {
        if (selectedCredito) {
            desembolsar(selectedCredito.id)
        }
    }

    const getCliente = (credito: CreditoPendiente) => {
        return Array.isArray(credito.clientes) ? credito.clientes[0] : credito.clientes
    }

    const getGarantia = (credito: CreditoPendiente) => {
        return Array.isArray(credito.garantias) ? credito.garantias[0] : credito.garantias
    }

    return (
        <>
            <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Pendientes de Desembolso ({pendientes.length})
                        {saldoCaja !== undefined && (
                            <Badge variant="outline" className="ml-auto bg-white">
                                Caja: S/ {saldoCaja.toLocaleString()}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-3">
                            {pendientes.map((credito) => {
                                const cliente = getCliente(credito)
                                const garantia = getGarantia(credito)
                                const nombreCliente = `${cliente?.nombres || ''} ${cliente?.apellido_paterno || ''}`.trim()
                                const saldoInsuficiente = saldoCaja !== undefined && saldoCaja < credito.monto_prestado

                                return (
                                    <div key={credito.id} className="bg-white p-3 rounded-lg border shadow-sm flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm text-slate-900">
                                                {nombreCliente || 'Cliente'}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {garantia?.descripcion || "Prenda sin descripción"}
                                            </div>
                                            <div className="text-xs font-mono text-slate-400 mt-1">
                                                {new Date(credito.created_at).toLocaleString('es-PE', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold ${saldoInsuficiente ? 'text-red-600' : 'text-emerald-700'}`}>
                                                S/ {credito.monto_prestado.toLocaleString()}
                                            </div>
                                            {saldoInsuficiente ? (
                                                <Badge variant="destructive" className="text-[10px] mt-1">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    Sin fondos
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs mt-1 bg-amber-600 hover:bg-amber-700"
                                                    onClick={() => setSelectedCredito(credito)}
                                                    disabled={isPending}
                                                >
                                                    <Banknote className="w-3 h-3 mr-1" />
                                                    Entregar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* DIÁLOGO DE CONFIRMACIÓN */}
            <AlertDialog open={!!selectedCredito} onOpenChange={(open) => !open && setSelectedCredito(null)}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-amber-700">
                            <Banknote className="w-5 h-5" />
                            Confirmar Entrega de Efectivo
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 pt-2">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Cliente:</span>
                                        <span className="font-semibold text-slate-900">
                                            {selectedCredito && getCliente(selectedCredito)?.nombres} {selectedCredito && getCliente(selectedCredito)?.apellido_paterno}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Monto a entregar:</span>
                                        <span className="font-bold text-xl text-emerald-700">
                                            S/ {selectedCredito?.monto_prestado.toLocaleString()}
                                        </span>
                                    </div>
                                    {saldoCaja !== undefined && selectedCredito && (
                                        <div className="flex justify-between pt-2 border-t border-amber-200">
                                            <span className="text-slate-600">Saldo caja después:</span>
                                            <span className="font-semibold text-blue-700">
                                                S/ {(saldoCaja - selectedCredito.monto_prestado).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-red-600 font-medium">
                                    ⚠️ Esta acción es irreversible. El dinero saldrá de tu caja.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDesembolso}
                            disabled={isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isPending ? 'Procesando...' : 'Confirmar Entrega'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <PrintSuccessModal
                open={!!successData}
                data={successData}
                onClose={() => setSuccessData(null)}
                onReset={() => setSuccessData(null)}
            />
        </>
    )
}
