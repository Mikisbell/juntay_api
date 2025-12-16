'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InventarioItem, cambiarEstadoGarantia } from "@/lib/actions/inventario-actions"
import { useState } from "react"
import { Loader2, Gavel, Archive } from "lucide-react"

export function TablaInventario({ items }: { items: InventarioItem[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}?`)) return

        setLoadingId(id)
        try {
            const res = await cambiarEstadoGarantia(id, nuevoEstado)
            if (!res.success) {
                alert('Error al actualizar estado')
            }
        } catch (error) {
            console.error(error)
            alert('Error inesperado')
        } finally {
            setLoadingId(null)
        }
    }

    const getBadgeVariant = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'custodia':
                return 'default' // Green - Active
            case 'vencido':
                return 'secondary' // Yellow - Warning
            case 'remate':
                return 'destructive' // Red - Critical
            case 'vendido':
                return 'outline' // Gray - Completed
            default:
                return 'outline'
        }
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Garantía</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Valor Tasación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                No hay items en el inventario con este filtro.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium font-mono">
                                    {item.contrato?.codigo || 'S/C'}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={item.descripcion}>
                                    {item.descripcion}
                                </TableCell>
                                <TableCell>
                                    {item.cliente
                                        ? `${item.cliente.nombres} ${item.cliente.apellido_paterno}`
                                        : 'Desconocido'}
                                </TableCell>
                                <TableCell>
                                    {item.contrato?.fecha_vencimiento
                                        ? new Date(item.contrato.fecha_vencimiento).toLocaleDateString('es-PE')
                                        : '-'}
                                </TableCell>
                                <TableCell>S/ {item.valor_tasacion.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={getBadgeVariant(item.estado)}>
                                        {item.estado.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {item.estado === 'custodia' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-rose-600 border-rose-200 hover:bg-rose-50"
                                            onClick={() => handleCambiarEstado(item.id, 'remate')}
                                            disabled={loadingId === item.id}
                                        >
                                            {loadingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4 mr-1" />}
                                            A Remate
                                        </Button>
                                    )}
                                    {item.estado === 'remate' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCambiarEstado(item.id, 'custodia')}
                                            disabled={loadingId === item.id}
                                        >
                                            <Archive className="h-4 w-4 mr-1" />
                                            Recuperar
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
