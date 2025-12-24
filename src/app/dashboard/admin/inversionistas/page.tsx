
import { Suspense } from 'react'
import { obtenerInversionistas, obtenerDetalleCuentas } from '@/lib/actions/tesoreria-actions'
import { obtenerCronogramaGlobal } from '@/lib/actions/rendimientos-actions'
import { CronogramaPagosTable } from "@/components/dashboard/tesoreria/CronogramaPagosTable"

export const dynamic = 'force-dynamic'
import { InversionistasList } from "@/components/dashboard/tesoreria/InversionistasList"
import { RendimientosDashboard } from "@/components/dashboard/tesoreria/RendimientosDashboard"
import { WaterfallDistributionSim } from "@/components/dashboard/tesoreria/WaterfallDistributionSim"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContractPDFGenerator } from "@/components/dashboard/tesoreria/ContractPDFGenerator"
import { Users, TrendingUp, FileText, Settings, AlertCircle } from 'lucide-react'

// Loading skeleton for dashboard
function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted/50 rounded-lg" />
            ))}
        </div>
    )
}

export default async function InversionistasPage() {
    const inversionistas = await obtenerInversionistas()
    const cronogramaGlobal = await obtenerCronogramaGlobal()
    const cuentas = await obtenerDetalleCuentas()

    // Calcular métricas
    const totalSocios = inversionistas.filter(i => i.tipo_relacion === 'SOCIO').length
    const totalPrestamistas = inversionistas.filter(i => i.tipo_relacion === 'PRESTAMISTA').length
    const totalActivos = inversionistas.filter(i => i.activo).length

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50">
            {/* Header */}
            <div className="border-b bg-white dark:bg-slate-900">
                <div className="p-6 pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Portal de Inversionistas
                            </h1>
                            <p className="text-muted-foreground">
                                Gestión de Socios, Prestamistas y Rendimientos
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="py-1.5">
                                <Users className="w-3.5 h-3.5 mr-1.5" />
                                {totalActivos} Activos
                            </Badge>
                            <Badge className="bg-blue-500 py-1.5">
                                {totalSocios} Socios
                            </Badge>
                            <Badge className="bg-violet-500 py-1.5">
                                {totalPrestamistas} Prestamistas
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <div className="p-6">
                <Tabs defaultValue="resumen" className="space-y-6">
                    <TabsList className="bg-white dark:bg-slate-900 border shadow-sm">
                        <TabsTrigger value="resumen" className="gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Resumen
                        </TabsTrigger>
                        <TabsTrigger value="inversionistas" className="gap-2">
                            <Users className="w-4 h-4" />
                            Inversionistas
                        </TabsTrigger>
                        <TabsTrigger value="cronograma" className="gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Cronograma de Pagos
                        </TabsTrigger>
                        <TabsTrigger value="socios" className="gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Simulador Equity
                        </TabsTrigger>
                        <TabsTrigger value="documentos" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Documentos
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Resumen */}
                    <TabsContent value="resumen" className="space-y-6">
                        <Suspense fallback={<DashboardSkeleton />}>
                            <RendimientosDashboard />
                        </Suspense>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Distribución por Tipo</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{totalSocios}</div>
                                            <div className="text-xs text-muted-foreground">Socios</div>
                                        </div>
                                        <div className="h-12 w-px bg-border" />
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-violet-600">{totalPrestamistas}</div>
                                            <div className="text-xs text-muted-foreground">Prestamistas</div>
                                        </div>
                                        <div className="h-12 w-px bg-border" />
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-emerald-600">{totalActivos}</div>
                                            <div className="text-xs text-muted-foreground">Activos</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader className="pb-2">
                                    <CardDescription>Acciones Rápidas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-3">
                                        <button className="flex-1 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                                            <div className="font-medium text-sm">Registrar Pago</div>
                                            <div className="text-xs text-muted-foreground">Pagar rendimiento a inversionista</div>
                                        </button>
                                        <button className="flex-1 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                                            <div className="font-medium text-sm">Generar Reporte</div>
                                            <div className="text-xs text-muted-foreground">Estado de cuenta mensual</div>
                                        </button>
                                        <button className="flex-1 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                                            <div className="font-medium text-sm">Recalcular</div>
                                            <div className="text-xs text-muted-foreground">Actualizar rendimientos</div>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab: Lista de Inversionistas */}
                    <TabsContent value="inversionistas">
                        <InversionistasList inversionistas={inversionistas} />
                    </TabsContent>

                    {/* Tab: Cronograma de Pagos */}
                    <TabsContent value="cronograma">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Cronograma Global</h3>
                                <p className="text-sm text-muted-foreground">Próximos vencimientos y pagos programados.</p>
                            </div>
                            <CronogramaPagosTable
                                cronograma={cronogramaGlobal}
                                cuentas={cuentas}
                            />
                        </div>
                    </TabsContent>

                    {/* Tab: Documentos */}
                    <TabsContent value="documentos">
                        <Card>
                            <CardHeader>
                                <CardTitle>Documentos Generados</CardTitle>
                                <CardDescription>
                                    Contratos y adendas disponibles para descarga
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {inversionistas.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No hay documentos disponibles</p>
                                    ) : (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {inversionistas.map(inv => (
                                                <div key={inv.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-blue-600 dark:text-blue-400">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium group-hover:text-blue-600 transition-colors">
                                                            Contrato de Inversión - {inv.nombre_completo}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                                                            <span>PDF</span>
                                                            <span>•</span>
                                                            <span>{new Date(inv.fecha_ingreso).toLocaleDateString()}</span>
                                                            <span>•</span>
                                                            <span className="capitalize">{inv.tipo_relacion.toLowerCase()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ContractPDFGenerator
                                                            inversionista={inv}
                                                            variant="secondary"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Simulator Equity */}
                    <TabsContent value="socios">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Simulador de Distribución (Waterfall)</h3>
                                <p className="text-sm text-muted-foreground">Proyectar ganancias para socios bajo modelo Private Equity.</p>
                            </div>
                            <WaterfallDistributionSim
                                capitalInvertido={100000}
                                hurdleRate={8}
                                carriedInterest={20}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
