
'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, TrendingUp } from "lucide-react"
import { CuentaFinancieraDetalle, InversionistaDetalle, inyectarCapitalAction, obtenerInversionistas } from "@/lib/actions/tesoreria-actions"

interface CapitalInjectionModalProps {
    cuentas: CuentaFinancieraDetalle[]
}

export function CapitalInjectionModal({ cuentas }: CapitalInjectionModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [inversionistas, setInversionistas] = useState<InversionistaDetalle[]>([])

    // Cargar inversionistas al abrir
    useEffect(() => {
        if (open) {
            obtenerInversionistas().then(setInversionistas)
        }
    }, [open])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const res = await inyectarCapitalAction(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Capital inyectado correctamente")
                setOpen(false)
            }
        } catch (_error) {
            toast.error("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20 bg-emerald-600 hover:bg-emerald-700">
                    <TrendingUp className="h-4 w-4" />
                    Inyectar Capital
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Inyectar Capital</DialogTitle>
                    <DialogDescription>
                        Registrar ingreso de capital operativo por socios o prestamistas.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Inversionista (Origen)</Label>
                        <Select name="inversionista_id" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar socio o prestamista" />
                            </SelectTrigger>
                            <SelectContent>
                                {inversionistas.map(inv => (
                                    <SelectItem key={inv.id} value={inv.id}>
                                        {inv.nombre_completo} ({inv.tipo_relacion})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Cuenta Destino</Label>
                        <Select name="destino_id" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cuenta de destino" />
                            </SelectTrigger>
                            <SelectContent>
                                {cuentas.filter(c => c.activo).map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.nombre} ({c.moneda})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Monto</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">S/</span>
                                <Input type="number" name="monto" step="0.01" min="0" className="pl-8" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Evidencia (URL/Ref)</Label>
                            <Input name="evidencia" placeholder="Voucher #12345" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea name="descripcion" placeholder="Detalles de la operación..." required />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Inyección
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
