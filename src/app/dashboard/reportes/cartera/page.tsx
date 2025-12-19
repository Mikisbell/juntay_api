import { obtenerCartera } from '@/lib/actions/reportes-actions'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

export default async function ReporteCarteraPage() {
    const stats = await obtenerCartera()

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-8 p-8 pt-6 animate-in-fade-slide">

                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Análisis de Cartera</h2>
                    <p className="text-muted-foreground">Estado actual de los créditos y proyección de cobranza.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-panel border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Créditos Vigentes</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.vigentes}</div>
                            <p className="text-xs text-muted-foreground">Contratos activos al día</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Créditos Vencidos</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.vencidos}</div>
                            <p className="text-xs text-muted-foreground">Requieren gestión de cobranza</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Capital Colocado</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">S/ {stats.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">Total histórico prestado</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-panel border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Saldo por Cobrar</CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">S/ {stats.montoVigente.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">Capital pendiente de recuperación</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
