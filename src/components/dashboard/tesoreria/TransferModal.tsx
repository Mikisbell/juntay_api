
'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, ArrowRightLeft } from "lucide-react"
import { CuentaFinancieraDetalle, transferirFondosAction } from "@/lib/actions/tesoreria-actions"

interface TransferModalProps {
    cuentas: CuentaFinancieraDetalle[]
}

export function TransferModal({ cuentas }: TransferModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [origenId, setOrigenId] = useState<string>("")

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const res = await transferirFondosAction(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Transferencia realizada correctamente")
                setOpen(false)
            }
        } catch (error) {
            toast.error("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transferir
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Transferencia de Fondos</DialogTitle>
                    <DialogDescription>
                        Mover dinero entre cuentas internas (Bancos ↔ Bóvedas).
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Cuenta Origen</Label>
                        <Select name="origen_id" onValueChange={setOrigenId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar origen" />
                            </SelectTrigger>
                            <SelectContent>
                                {cuentas.filter(c => c.activo && c.saldo > 0).map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.nombre} (S/ {c.saldo})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Cuenta Destino</Label>
                        <Select name="destino_id" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar destino" />
                            </SelectTrigger>
                            <SelectContent>
                                {cuentas.filter(c => c.activo && c.id !== origenId).map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Monto a Transferir</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">S/</span>
                            <Input type="number" name="monto" step="0.01" min="0" className="pl-8" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo / Descripción</Label>
                        <Textarea name="descripcion" placeholder="Ej: Fondeo semanal de caja chica" required />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Realizar Transferencia
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
