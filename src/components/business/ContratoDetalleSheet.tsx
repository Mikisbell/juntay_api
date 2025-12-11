"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Package, AlertCircle } from "lucide-react"
import { registrarPagoRPCAction } from "@/lib/actions/pagos-wrapper"

// Tipo para el contrato completo
interface ContratoDetalle {
    id: string
    codigo: string
    estado: string
    monto_prestado: number
    saldo_pendiente: number
    interes_acumulado: number
    tasa_interes: number
    fecha_vencimiento: string
    periodo_dias: number
    cliente_nombre: string
    garantia_descripcion: string
    garantia_valor: number
}

interface Props {
    open: boolean
    onClose: () => void
    contrato: ContratoDetalle
}

export function ContratoDetalleSheet({ open, onClose, contrato }: Props) {
    const [accion, setAccion] = useState<'RENOVACION' | 'DESEMPENO' | null>(null)
    const [loading, setLoading] = useState(false)
    const [montoInput, setMontoInput] = useState<number>(0)

    // Cálculos financieros
    const deudaTotal = contrato.saldo_pendiente + contrato.interes_acumulado
    const soloInteres = contrato.interes_acumulado

    // Calcular días para vencimiento
    const diasParaVencimiento = Math.ceil(
        (new Date(contrato.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    const handlePago = async () => {
        if (!accion) return

        setLoading(true)
        try {
            const resultado = await registrarPagoRPCAction({
                creditoId: contrato.id,
                monto: montoInput,
                tipo: accion,
                metodo: 'EFECTIVO'
            })

            if (resultado.success) {
                alert(resultado.mensaje || 'Pago procesado exitosamente')
                onClose()
            } else {
                alert(resultado.error || 'Error al procesar pago')
            }
        } catch (e) {
            console.error(e)
            alert('Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    // Actualizar monto cuando cambia la acción
    const handleSelectAccion = (tipo: 'RENOVACION' | 'DESEMPENO') => {
        setAccion(tipo)
        setMontoInput(tipo === 'RENOVACION' ? soloInteres : deudaTotal)
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-2">
                        <Badge variant={contrato.estado === 'vigente' ? 'default' : 'destructive'}>
                            {contrato.estado.toUpperCase()}
                        </Badge>
                        <SheetTitle>Contrato #{contrato.codigo}</SheetTitle>
                    </div>
                    <SheetDescription>
                        Cliente: <span className="font-medium text-slate-900">{contrato.cliente_nombre}</span>
                    </SheetDescription>
                </SheetHeader>

                {/* RESUMEN DE LA PRENDA */}
                <Card className="bg-slate-50 p-4 mb-6 border-slate-200">
                    <div className="flex gap-3">
                        <div className="h-12 w-12 bg-white rounded-md border flex items-center justify-center text-slate-400">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-slate-900">{contrato.garantia_descripcion}</p>
                            <p className="text-xs text-slate-500">Tasación: S/ {contrato.garantia_valor.toFixed(2)}</p>
                        </div>
                    </div>
                </Card>

                {/* PESTAÑAS DE ACCIÓN */}
                <Tabs defaultValue="acciones" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="detalles">Detalles</TabsTrigger>
                        <TabsTrigger value="historial">Historial</TabsTrigger>
                        <TabsTrigger value="acciones" className="text-blue-600 font-semibold">Caja</TabsTrigger>
                    </TabsList>

                    <TabsContent value="detalles" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-slate-500">Préstamo Original</Label>
                                <p className="text-lg font-mono font-medium">S/ {contrato.monto_prestado.toFixed(2)}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500">Saldo Pendiente</Label>
                                <p className="text-lg font-mono font-medium text-rose-600">S/ {contrato.saldo_pendiente.toFixed(2)}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500">Interés Acumulado</Label>
                                <p className="text-lg font-mono font-medium">S/ {contrato.interes_acumulado.toFixed(2)}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500">Vencimiento</Label>
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3 text-red-500" />
                                    <p className="font-medium">{new Date(contrato.fecha_vencimiento).toLocaleDateString('es-PE')}</p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className={`p-3 rounded-md text-sm flex gap-2 ${diasParaVencimiento < 0
                            ? 'bg-red-50 text-red-700'
                            : diasParaVencimiento < 7
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                            <AlertCircle className="h-4 w-4 mt-0.5" />
                            <p>
                                {diasParaVencimiento < 0
                                    ? `Este contrato está vencido hace ${Math.abs(diasParaVencimiento)} días.`
                                    : diasParaVencimiento < 7
                                        ? `Este contrato vence en ${diasParaVencimiento} días. Se recomienda contactar al cliente.`
                                        : `Este contrato está vigente (vence en ${diasParaVencimiento} días).`
                                }
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="historial" className="mt-4">
                        <div className="text-center py-8 text-slate-500">
                            <p className="text-sm">Historial de pagos no implementado aún</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="acciones" className="mt-4 space-y-4">

                        {/* OPCIÓN 1: RENOVAR */}
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${accion === 'RENOVACION'
                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                : 'hover:border-slate-300'
                                }`}
                            onClick={() => handleSelectAccion('RENOVACION')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-900">🔄 Solo Renovar (Interés)</p>
                                    <p className="text-xs text-slate-500">Extiende el plazo {contrato.periodo_dias} días más.</p>
                                </div>
                                <p className="text-xl font-bold text-blue-600">S/ {soloInteres.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* OPCIÓN 2: DESEMPEÑAR */}
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${accion === 'DESEMPENO'
                                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                                : 'hover:border-slate-300'
                                }`}
                            onClick={() => handleSelectAccion('DESEMPENO')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-900">✅ Desempeñar (Retirar)</p>
                                    <p className="text-xs text-slate-500">Paga capital + interés. Finaliza contrato.</p>
                                </div>
                                <p className="text-xl font-bold text-emerald-600">S/ {deudaTotal.toFixed(2)}</p>
                            </div>
                        </div>

                        {accion && (
                            <div className="pt-4 animate-in slide-in-from-bottom-2 space-y-3">
                                <Label>Confirma el monto recibido</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="text-lg font-bold"
                                        value={montoInput}
                                        onChange={(e) => setMontoInput(parseFloat(e.target.value) || 0)}
                                    />
                                    <Button
                                        className={accion === 'RENOVACION' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                                        onClick={handlePago}
                                        disabled={loading || montoInput <= 0}
                                        title={montoInput <= 0 ? "Ingresa un monto mayor a 0" : loading ? "Procesando..." : "Confirmar pago"}
                                    >
                                        {loading ? 'Procesando...' : montoInput <= 0 ? 'Ingresa monto' : 'Confirmar'}
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {accion === 'RENOVACION'
                                        ? `Nueva fecha de vencimiento: ${new Date(new Date(contrato.fecha_vencimiento).setDate(new Date(contrato.fecha_vencimiento).getDate() + contrato.periodo_dias)).toLocaleDateString('es-PE')}`
                                        : 'La prenda será liberada automáticamente'
                                    }
                                </p>
                            </div>
                        )}

                    </TabsContent>
                </Tabs>

                <SheetFooter className="mt-8">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
