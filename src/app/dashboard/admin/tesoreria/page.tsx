import { obtenerEstadoBoveda, obtenerMovimientosBoveda } from '@/lib/actions/tesoreria-actions'
import { TesoreriaClient } from '@/components/admin/TesoreriaClient'
import { TablaAuditoriaBoveda } from '@/components/admin/TablaAuditoriaBoveda'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Landmark, ArrowRightLeft, TrendingUp } from 'lucide-react'

export default async function TesoreriaPage() {
    const boveda = await obtenerEstadoBoveda()
    const movimientos = await obtenerMovimientosBoveda(15)

    if (!boveda) {
        return (
            <div className="container mx-auto py-8">
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="py-8 text-center">
                        <p className="text-red-700 font-medium">
                            Error: No se pudo cargar la información de la bóveda.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 max-w-7xl space-y-8">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Landmark className="h-8 w-8 text-blue-600" />
                        Tesorería Central
                    </h1>
                    <p className="text-slate-500 mt-1">Control maestro de capital y flujo de fondos</p>
                </div>
            </div>

            {/* KPI BÓVEDA */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-300 text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Capital Total (Patrimonio)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">S/ {boveda.saldoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-slate-400 mt-2">Activos líquidos de la empresa</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-700 text-sm font-medium flex items-center gap-2">
                            <Landmark className="h-4 w-4" /> En Bóveda (Disponible)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-900">
                            S/ {boveda.saldoDisponible.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-emerald-700 mt-2">Listo para asignar a cajas</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-blue-700 text-sm font-medium flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4" /> En Cajas (Operativo)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900">
                            S/ {boveda.saldoAsignado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-blue-700 mt-2">Dinero en manos de cajeros</p>
                    </CardContent>
                </Card>
            </div>

            {/* CLIENTE COMPONENT CON MODALES */}
            <TesoreriaClient bovedaDisponible={boveda.saldoDisponible} />

            {/* TABLA DE AUDITORÍA */}
            <TablaAuditoriaBoveda movimientos={movimientos} />
        </div>
    )
}
