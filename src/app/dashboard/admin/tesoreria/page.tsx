import { obtenerEstadoBoveda, obtenerMovimientosBoveda } from '@/lib/actions/tesoreria-actions'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Landmark, TrendingUp, TrendingDown, ArrowRightLeft, DollarSign, Wallet } from 'lucide-react'
import { Separator } from "@/components/ui/separator"

export default async function TesoreriaPage() {
    const estadoBoveda = await obtenerEstadoBoveda()
    const movimientos = await obtenerMovimientosBoveda()

    if (!estadoBoveda) {
        return (
            <div className="p-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                    Error al cargar información de bóveda. Contacte a soporte.
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-8 p-8 pt-6 animate-in-fade-slide">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tesorería Central</h2>
                        <p className="text-muted-foreground">Gestión de capital, inyecciones y flujo de efectivo mayor.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2">
                            <ArrowRightLeft className="h-4 w-4" />
                            Transferir
                        </Button>
                        <Button className="gap-2 shadow-lg shadow-primary/20">
                            <TrendingUp className="h-4 w-4" />
                            Inyectar Capital
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-panel border-0 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Landmark className="h-24 w-24 text-primary" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Saldo en Bóveda
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                S/ {estadoBoveda.saldoDisponible.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Capital disponible para asignación inmediata
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-0 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="h-24 w-24 text-blue-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Asignado a Cajas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                S/ {estadoBoveda.saldoAsignado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dinero en poder de cajeros operativos
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-0 shadow-lg bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90" />
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign className="h-24 w-24 text-emerald-400" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-slate-300 uppercase tracking-wider">
                                Capital Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-white">
                                S/ {estadoBoveda.saldoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Patrimonio líquido total del sistema
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card className="glass-panel border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle>Movimientos Recientes</CardTitle>
                        <CardDescription>
                            Auditoría de ingresos y egresos de la bóveda central.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                    <TableHead className="pl-6">Tipo</TableHead>
                                    <TableHead>Referencia</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right pr-6">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movimientos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No hay movimientos registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    movimientos.map((mov) => (
                                        <TableRow key={mov.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {mov.tipo === 'INGRESO' ? (
                                                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-slate-900 dark:text-white">
                                                        {mov.tipo}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{mov.referencia}</span>
                                                    <span className="text-xs text-muted-foreground">ID: {mov.id.slice(0, 8)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(mov.fecha).toLocaleString()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <span className={`font-bold ${mov.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                                    {mov.tipo === 'INGRESO' ? '+' : '-'} S/ {mov.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                </span>
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
