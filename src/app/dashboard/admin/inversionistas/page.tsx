
import { obtenerInversionistas } from '@/lib/actions/tesoreria-actions'
import { InversionistasList } from "@/components/dashboard/tesoreria/InversionistasList"
import { Users, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function InversionistasPage() {
    const inversionistas = await obtenerInversionistas()

    // Calcular KPIs rápidos
    const totalInvertido = inversionistas.reduce((acc, inv) => acc + (inv.total_invertido || 0), 0)
    const totalSocios = inversionistas.filter(i => i.tipo_relacion === 'SOCIO').length
    const totalPrestamistas = inversionistas.filter(i => i.tipo_relacion === 'PRESTAMISTA').length

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 p-8 pt-6 space-y-8 animate-in-fade-slide">

            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gestión de Inversionistas</h2>
                <p className="text-muted-foreground">Administración de Socios, Prestamistas y Contratos de Capital.</p>
            </div>

            {/* KPIs Rápidos */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-panel border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Capital Total Bajo Gestión</CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">S/ {totalInvertido.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">Activos totales fondeados</p>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Socios Activos</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSocios}</div>
                        <p className="text-xs text-muted-foreground">Accionistas con participación</p>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prestamistas Externos</CardTitle>
                        <TrendingUp className="h-4 w-4 text-violet-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPrestamistas}</div>
                        <p className="text-xs text-muted-foreground">Financiamiento de terceros</p>
                    </CardContent>
                </Card>
            </div>

            {/* Lista Principal */}
            <InversionistasList inversionistas={inversionistas} />
        </div>
    )
}
