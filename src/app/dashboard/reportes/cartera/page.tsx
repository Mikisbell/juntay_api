import { obtenerCartera } from '@/lib/actions/reportes-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export default async function ReporteCarteraPage() {
    const stats = await obtenerCartera()

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Reporte de Cartera</h1>
                <p className="text-slate-500">Estado actual de créditos</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vigentes</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.vigentes}</div>
                        <p className="text-xs text-slate-500">Contratos activos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.vencidos}</div>
                        <p className="text-xs text-slate-500">Requieren acción</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                        <XCircle className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.cancelados}</div>
                        <p className="text-xs text-slate-500">Finalizados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Capital en Calle</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">S/ {stats.montoVigente.toFixed(0)}</div>
                        <p className="text-xs text-slate-500">Saldo pendiente</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Total desembolsado:</span>
                            <span className="font-bold">S/ {stats.montoTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Recuperado:</span>
                            <span className="font-bold text-green-600">S/ {(stats.montoTotal - stats.montoVigente).toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
