
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { TrendingUp, History, CalendarDays, FileDown, AlertTriangle, Users } from 'lucide-react'
import { CarteraReportPDF } from '@/components/reportes/CarteraReportPDF'
import { MoraReportPDF } from '@/components/reportes/MoraReportPDF'

const reports = [
    {
        title: "Cierre Diario",
        description: "Arqueo de caja, reporte de ingresos y egresos del día.",
        icon: CalendarDays,
        href: "/dashboard/reportes/caja-diaria",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
        title: "Análisis de Cartera",
        description: "Estado de créditos, morosidad y proyecciones.",
        icon: TrendingUp,
        href: "/dashboard/reportes/cartera",
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
        title: "Historial de Transacciones",
        description: "Log completo de todas las operaciones realizadas.",
        icon: History,
        href: "/dashboard/reportes/transacciones",
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/20"
    }
]

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Centro de Reportes</h2>
                <p className="text-muted-foreground">
                    Seleccione un reporte para visualizar indicadores clave.
                </p>
            </div>

            {/* PDF Downloads Section */}
            <Card className="border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileDown className="w-5 h-5 text-blue-500" />
                        <CardTitle>Descargas PDF</CardTitle>
                    </div>
                    <CardDescription>
                        Genera reportes profesionales en formato PDF listos para imprimir o compartir.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col items-start gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">Reporte de Cartera</span>
                            </div>
                            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mb-2">
                                Listado completo de créditos con KPIs
                            </p>
                            <CarteraReportPDF />
                        </div>

                        <div className="flex flex-col items-start gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">Reporte de Mora</span>
                            </div>
                            <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-2">
                                Créditos vencidos por prioridad
                            </p>
                            <MoraReportPDF />
                        </div>

                        <div className="flex flex-col items-start gap-2 p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">Estado de Cuenta</span>
                            </div>
                            <p className="text-xs text-slate-600/70 dark:text-slate-400/70 mb-2">
                                Disponible desde la ficha del cliente
                            </p>
                            <Link
                                href="/dashboard/clientes"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Ir a Clientes →
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                    <Link href={report.href} key={report.href}>
                        <Card className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer h-full border-slate-200 shadow-sm hover:shadow-md">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className={`p-2 rounded-lg ${report.bg}`}>
                                    <report.icon className={`w-8 h-8 ${report.color}`} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{report.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    {report.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
