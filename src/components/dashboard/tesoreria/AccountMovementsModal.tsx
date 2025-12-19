'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { obtenerMovimientosCuenta } from "@/lib/actions/tesoreria-actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Definimos un tipo locaL o importamos
interface Movimiento {
    id: string
    fecha: string
    descripcion: string
    monto: number
    tipo: string
    origen?: string
    destino?: string
}

interface AccountMovementsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    accountId: string
    accountName: string
}

export function AccountMovementsModal({ open, onOpenChange, accountId, accountName }: AccountMovementsModalProps) {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (open && accountId) {
            setIsLoading(true)
            obtenerMovimientosCuenta(accountId)
                .then(data => {
                    setMovimientos(data)
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false))
        }
    }, [open, accountId])

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Movimientos: {accountName}</DialogTitle>
                    <DialogDescription>
                        Historial reciente de transacciones de esta cuenta.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : movimientos.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                            No hay movimientos registrados recientemente.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Detalle</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movimientos.map((mov) => (
                                    <TableRow key={mov.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(mov.fecha), 'dd/MM/yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{mov.tipo}</span>
                                                <span className="text-xs text-muted-foreground">{mov.descripcion || 'Sin descripción'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {mov.origen && mov.origen !== accountName && <div>De: {mov.origen}</div>}
                                            {mov.destino && mov.destino !== accountName && <div>Para: {mov.destino}</div>}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${
                                            // Lógica visual simple: Si viene de otro lado es ingreso (green), si va a otro lado es egreso (red)
                                            // Esto requeriria comparar IDs, por simplicidad usamos color neutro o basado en tipo
                                            'text-slate-900 dark:text-slate-100'
                                            }`}>
                                            {formatMoney(mov.monto)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
