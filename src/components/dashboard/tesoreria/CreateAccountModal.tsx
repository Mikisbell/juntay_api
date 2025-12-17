
'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { crearCuentaFinanciera } from "@/lib/actions/tesoreria-actions"
import { toast } from "sonner"
import { ArrowUpRight, Loader2 } from "lucide-react"

export function CreateAccountModal() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const result = await crearCuentaFinanciera(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Cuenta creada exitosamente")
            setOpen(false)
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Nueva Cuenta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nueva Cuenta Financiera</DialogTitle>
                    <DialogDescription>
                        Añade una nueva cuenta bancaria, billetera digital o caja fuerte.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nombre">Nombre de la Cuenta</Label>
                        <Input id="nombre" name="nombre" placeholder="ej. BCP Soles Principal" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tipo">Tipo de Cuenta</Label>
                        <Select name="tipo" required defaultValue="BANCO">
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BANCO">Cuenta Bancaria</SelectItem>
                                <SelectItem value="EFECTIVO">Bóveda / Caja Fuerte</SelectItem>
                                <SelectItem value="DIGITAL">Billetera Digital (Yape/Plin)</SelectItem>
                                <SelectItem value="PASARELA">Pasarela de Pagos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="moneda">Moneda</Label>
                        <Select name="moneda" required defaultValue="PEN">
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar moneda" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                <SelectItem value="USD">Dólares (USD)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="saldo">Saldo Inicial</Label>
                        <Input id="saldo" name="saldo" type="number" step="0.01" defaultValue="0" required />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Cuenta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
