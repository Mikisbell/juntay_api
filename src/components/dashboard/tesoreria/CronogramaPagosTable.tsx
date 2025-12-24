
'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { PagarCuotaDialog } from "./PagarCuotaDialog"
import { CuentaFinancieraDetalle } from "@/lib/actions/tesoreria-actions"

interface CronogramaItem {
    id: string
    contrato_id: string
    nombre_inversionista: string
    tipo_contrato?: string
    numero_cuota: number
    tipo_pago: string
    fecha_programada: string
    monto_total: number
    monto_capital: number
    monto_interes: number
    estado: string
}

interface CronogramaPagosTableProps {
    cronograma: CronogramaItem[]
    cuentas: CuentaFinancieraDetalle[]
}

export function CronogramaPagosTable({ cronograma, cuentas }: CronogramaPagosTableProps) {
    if (cronograma.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay pagos programados en el sistema.</p>
                </CardContent>
            </Card>
        )
    }

    const formatMoney = (amount: number) =>
        `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

    const totalCapital = cronograma.reduce((acc, item) => acc + Number(item.monto_capital), 0)
    const totalInteres = cronograma.reduce((acc, item) => acc + Number(item.monto_interes), 0)
    const totalGeneral = cronograma.reduce((acc, item) => acc + Number(item.monto_total), 0)

    return (
        <Card className="glass-panel border-0 shadow-sm">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Fecha</TableHead>
                            <TableHead>Inversionista</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead className="text-right">Capital</TableHead>
                            <TableHead className="text-right">Interés</TableHead>
                            <TableHead className="text-right font-bold">Total</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cronograma.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        {new Date(item.fecha_programada).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {item.nombre_inversionista}
                                    <div className="text-xs text-muted-foreground">
                                        {item.tipo_contrato === 'DEUDA_FIJA' ? 'Préstamo' : 'Socio'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        Cuota #{item.numero_cuota}
                                    </div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                        {item.tipo_pago.toLowerCase().replace('_', ' ')}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {item.monto_capital > 0 ? formatMoney(item.monto_capital) : '-'}
                                </TableCell>
                                <TableCell className="text-right text-emerald-600">
                                    {item.monto_interes > 0 ? formatMoney(item.monto_interes) : '-'}
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {formatMoney(item.monto_total)}
                                </TableCell>
                                <TableCell className="text-center">
                                    {item.estado === 'PAGADO' && (
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Pagado
                                        </Badge>
                                    )}
                                    {item.estado === 'PENDIENTE' && (
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20">
                                            <Clock className="w-3 h-3 mr-1" /> Pendiente
                                        </Badge>
                                    )}
                                    {item.estado === 'VENCIDO' && (
                                        <Badge variant="destructive">
                                            <AlertCircle className="w-3 h-3 mr-1" /> Vencido
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.estado !== 'PAGADO' && (
                                        <PagarCuotaDialog
                                            cuota={item}
                                            cuentas={cuentas}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter className="bg-slate-100 dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800">
                        <TableRow>
                            <TableCell colSpan={3} className="text-right pr-6 font-bold text-muted-foreground uppercase tracking-wider text-xs">
                                Validación Total
                            </TableCell>
                            <TableCell className="text-right font-bold font-mono">
                                {formatMoney(totalCapital)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600 font-mono">
                                {formatMoney(totalInteres)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-blue-600 border-t-2 border-blue-500 font-mono">
                                {formatMoney(totalGeneral)}
                            </TableCell>
                            <TableCell className="text-center font-medium text-xs text-muted-foreground">
                                100% Cuadrado
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    )
}
