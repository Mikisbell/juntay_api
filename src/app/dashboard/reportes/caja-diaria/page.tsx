import { obtenerCajaDiaria } from '@/lib/actions/reportes-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

export default async function ReporteCajaDiariaPage() {
    const reporte = await obtenerCajaDiaria()

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Reporte de Caja Diaria</h1>
                <p className="text-slate-500">Fecha: {new Date(reporte.fecha).toLocaleDateString('es-PE')}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">S/ {reporte.ingresos.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Egresos</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-600">S/ {reporte.egresos.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Neto</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">S/ {reporte.neto.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalle de Movimientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500 text-center py-8">
                        {reporte.movimientos.length} movimientos registrados hoy
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
