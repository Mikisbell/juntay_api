"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, DollarSign } from "lucide-react"
import { registrarPagoCuota, CuentaFinancieraDetalle } from "@/lib/actions/tesoreria-actions"
import { toast } from "sonner"

interface PagarCuotaDialogProps {
    cuota: {
        id: string
        numero_cuota: number
        monto_total: number
        fecha_programada: string
        nombre_inversionista?: string
    }
    cuentas: CuentaFinancieraDetalle[]
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function PagarCuotaDialog({ cuota, cuentas, trigger, onSuccess }: PagarCuotaDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [cuentaId, setCuentaId] = useState<string>("")

    const handlePago = async () => {
        if (!cuentaId) {
            toast.error("Selecciona una cuenta de origen")
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("cuota_id", cuota.id)
            formData.append("cuenta_origen_id", cuentaId)
            formData.append("monto", cuota.monto_total.toString())

            const result = await registrarPagoCuota(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Pago registrado exitosamente")
                setOpen(false)
                onSuccess?.()
            }
        } catch (error) {
            toast.error("Error al procesar el pago")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Filtrar cuentas con saldo suficiente
    const cuentasDisponibles = cuentas.filter(c => c.saldo >= cuota.monto_total)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button size="sm">Pagar</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pago de Cuota #{cuota.numero_cuota}</DialogTitle>
                    <DialogDescription>
                        Confirmar el pago para {cuota.nombre_inversionista || 'Inversionista'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                        <span className="text-sm font-medium">Monto a Pagar:</span>
                        <span className="text-xl font-bold flex items-center text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                            {cuota.monto_total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="grid gap-2">
                        <Label>Cuenta de Origen</Label>
                        <Select value={cuentaId} onValueChange={setCuentaId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cuenta..." />
                            </SelectTrigger>
                            <SelectContent>
                                {cuentas.map(c => (
                                    <SelectItem
                                        key={c.id}
                                        value={c.id}
                                        disabled={c.saldo < cuota.monto_total}
                                        className="flex justify-between w-full"
                                    >
                                        <span>{c.nombre} ({c.tipo})</span>
                                        <span className="ml-2 text-muted-foreground">
                                            S/ {c.saldo.toLocaleString()}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {cuentasDisponibles.length === 0 && (
                            <p className="text-xs text-red-500">
                                No tienes cuentas con saldo suficiente.
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handlePago} disabled={loading || !cuentaId}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Confirmar Pago
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
