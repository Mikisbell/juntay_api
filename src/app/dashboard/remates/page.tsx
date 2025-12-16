import { obtenerInventario } from '@/lib/actions/inventario-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Gavel, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function RematesPage() {
    const items = await obtenerInventario('remate')

    return (
        <div className="container mx-auto py-8 max-w-[1600px]">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Gavel className="h-8 w-8 text-amber-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Remates</h1>
                </div>
                <p className="text-slate-500">Prendas vencidas disponibles para venta</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Prendas en Remate</span>
                        <Badge variant="secondary">{items.length} Items</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Valor Tasación</TableHead>
                                <TableHead>Contrato</TableHead>
                                <TableHead>En Remate Desde</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        <Package className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                        No hay prendas en remate actualmente.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.descripcion}</TableCell>
                                        <TableCell>
                                            {item.cliente
                                                ? `${item.cliente.nombres} ${item.cliente.apellido_paterno}`
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>S/ {item.valor_tasacion.toFixed(2)}</TableCell>
                                        <TableCell>{item.contrato?.codigo || 'N/A'}</TableCell>
                                        <TableCell>
                                            {item.contrato?.fecha_vencimiento
                                                ? new Date(item.contrato.fecha_vencimiento).toLocaleDateString('es-PE')
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge>En Proceso</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
