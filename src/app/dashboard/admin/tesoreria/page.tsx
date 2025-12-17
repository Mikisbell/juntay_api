
import { obtenerEstadoBoveda, obtenerMovimientosBoveda, obtenerDetalleCuentas, obtenerInversionistas, obtenerIndicadoresLiquidez } from '@/lib/actions/tesoreria-actions'
import { AccountsTable } from "@/components/dashboard/tesoreria/AccountsTable"
import { InversionistasList } from "@/components/dashboard/tesoreria/InversionistasList"
import { CapitalInjectionModal } from "@/components/dashboard/tesoreria/CapitalInjectionModal"
import { TransferModal } from "@/components/dashboard/tesoreria/TransferModal"
import { LiquidezIndicador } from "@/components/dashboard/tesoreria/LiquidezIndicador"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Landmark, TrendingUp, TrendingDown, DollarSign, Wallet, LayoutGrid, Users, History } from 'lucide-react'

export default async function TesoreriaPage() {
    const estadoBoveda = await obtenerEstadoBoveda()

    // Fetch paralelo de todo lo necesario para las pestañas
    const [movimientos, cuentas, inversionistas, indicadoresLiquidez] = await Promise.all([
        obtenerMovimientosBoveda(),
        obtenerDetalleCuentas(),
        obtenerInversionistas(),
        obtenerIndicadoresLiquidez()
    ])

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

                {/* Header Global */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tesorería Central</h2>
                        <p className="text-muted-foreground">Gestión integral de capital, cuentas e inversionistas.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Botones de Acción Global */}
                        <TransferModal cuentas={cuentas} />
                        <CapitalInjectionModal cuentas={cuentas} />
                    </div>
                </div>

                <Tabs defaultValue="resumen" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="resumen" className="gap-2"><LayoutGrid className="h-4 w-4" /> Resumen</TabsTrigger>
                        <TabsTrigger value="cuentas" className="gap-2"><Wallet className="h-4 w-4" /> Cuentas</TabsTrigger>
                        <TabsTrigger value="inversionistas" className="gap-2"><Users className="h-4 w-4" /> Inversionistas</TabsTrigger>
                    </TabsList>

                    {/* Pestaña: RESUMEN (KPIs + Auditoría) */}
                    <TabsContent value="resumen" className="space-y-6">
                        {/* Indicadores de Liquidez (Nuevo) */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="md:col-span-1">
                                <LiquidezIndicador {...indicadoresLiquidez} />
                            </div>
                            {/* Stats Cards (3 columnas restantes) */}
                            <div className="md:col-span-3 grid gap-4 md:grid-cols-3">
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
                        </div>

                        {/* Recent Transactions Audit */}
                        <Card className="glass-panel border-0 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Auditoría de Movimientos</CardTitle>
                                    <CardDescription>
                                        Registro de ingresos y egresos de la bóveda central.
                                    </CardDescription>
                                </div>
                                <History className="h-5 w-5 text-muted-foreground" />
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
                    </TabsContent>

                    {/* Pestaña: CUENTAS FINANCIERAS */}
                    <TabsContent value="cuentas">
                        <AccountsTable cuentas={cuentas} />
                    </TabsContent>

                    {/* Pestaña: INVERSIONISTAS */}
                    <TabsContent value="inversionistas">
                        <InversionistasList inversionistas={inversionistas} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
