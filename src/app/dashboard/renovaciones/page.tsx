import Link from "next/link"
import { obtenerContratosRenovables, obtenerEstadisticasRenovaciones } from "@/lib/actions/renovaciones-actions"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Calendar, AlertTriangle } from "lucide-react"
import { TablaRenovaciones } from "@/components/renovaciones/TablaRenovaciones"

export default async function RenovacionesPage({
    searchParams,
}: {
    searchParams: Promise<{ filtro?: string; busqueda?: string }>
}) {
    const params = await searchParams
    const filtro = params.filtro || "todos"
    const busqueda = params.busqueda || ""

    // Obtener datos reales de la BD
    const contratos = await obtenerContratosRenovables(30)
    const stats = await obtenerEstadisticasRenovaciones()

    // Filtrar contratos
    const contratosFiltrados = contratos.filter(contrato => {
        const cumpleFiltro = filtro === "todos" ||
            (filtro === "urgentes" && contrato.dias_restantes <= 3) ||
            (filtro === "proximos" && contrato.dias_restantes > 3)

        const cumpleBusqueda = busqueda === "" ||
            contrato.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
            contrato.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())

        return cumpleFiltro && cumpleBusqueda
    })

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Renovaciones"
                description="Gestiona las renovaciones de contratos próximos a vencer"
            />

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vencen Hoy</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.hoy}</div>
                        <p className="text-xs text-muted-foreground">Requieren acción inmediata</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximos 7 Días</CardTitle>
                        <Calendar className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.semana}</div>
                        <p className="text-xs text-muted-foreground">Contratos por vencer pronto</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.mes}</div>
                        <p className="text-xs text-muted-foreground">Total en período</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle>Contratos por Vencer</CardTitle>
                    <CardDescription>
                        Filtra y busca contratos que requieren renovación
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por código o cliente..." name="busqueda" defaultValue={busqueda} className="pl-8" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/dashboard/renovaciones?filtro=todos">
                                <Button variant={filtro === "todos" ? "default" : "outline"} size="sm">Todos</Button>
                            </Link>
                            <Link href="/dashboard/renovaciones?filtro=urgentes">
                                <Button variant={filtro === "urgentes" ? "default" : "outline"} size="sm">Urgentes</Button>
                            </Link>
                            <Link href="/dashboard/renovaciones?filtro=proximos">
                                <Button variant={filtro === "proximos" ? "default" : "outline"} size="sm">Próximos</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Tabla de Contratos */}
                    <TablaRenovaciones contratos={contratosFiltrados} />
                </CardContent>
            </Card>
        </div>
    )
}
