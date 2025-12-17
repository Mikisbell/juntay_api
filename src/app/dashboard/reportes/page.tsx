
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { PieChart, TrendingUp, History, CalendarDays } from 'lucide-react'

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
