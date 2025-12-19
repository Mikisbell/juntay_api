import { obtenerCajaDiaria } from '@/lib/actions/reportes-actions'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'

export default async function ReporteCajaDiariaPage() {
    const data = await obtenerCajaDiaria()

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-8 p-8 pt-6 animate-in-fade-slide">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Cierre de Caja Diario</h2>
                        <p className="text-muted-foreground">Resumen de operaciones del día {new Date().toLocaleDateString()}.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border shadow-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-panel border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Ingresos Totales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                S/ {data.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Egresos Totales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                                <TrendingDown className="h-5 w-5" />
                                S/ {data.egresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border-0 shadow-lg bg-slate-900 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300 uppercase">Balance Neto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                S/ {data.neto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card className="glass-panel border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle>Detalle de Movimientos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Tipo</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead className="text-right pr-6">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.movimientos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No hay movimientos registrados hoy.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    data.movimientos.map((mov: any, i: number) => (
                                        <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                            <TableCell className="pl-6">
                                                <Badge variant={mov.tipo === 'INGRESO' ? 'default' : 'destructive'} className="font-normal">
                                                    {mov.tipo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{mov.motivo}</TableCell>
                                            <TableCell className="text-right pr-6 font-bold">
                                                S/ {mov.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
