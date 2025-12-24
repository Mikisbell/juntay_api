import { getAllCompanies, getSaasMetrics } from "@/lib/actions/saas-actions"
import { getEmpresaActual } from "@/lib/auth/empresa-context"
import { SaasCompanyList } from "./SaasCompanyList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Activity } from "lucide-react"

export const metadata = {
    title: 'SaaS Admin | Juntay',
}

export default async function SaasDashboardPage() {
    // DEBUG: Check session before any protected call
    const debugContext = await getEmpresaActual()
    console.log('[DEBUG SaasDashboardPage] Session context:', {
        usuarioId: debugContext.usuarioId,
        usuarioEmail: debugContext.usuarioEmail,
        rol: debugContext.rol,
        isSuperAdmin: debugContext.isSuperAdmin
    })

    // If not super admin, show a debug message instead of crashing
    if (!debugContext.isSuperAdmin) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
                <pre className="bg-gray-100 p-4 rounded text-left inline-block">
                    {JSON.stringify({
                        usuarioId: debugContext.usuarioId,
                        usuarioEmail: debugContext.usuarioEmail,
                        rol: debugContext.rol,
                        isSuperAdmin: debugContext.isSuperAdmin
                    }, null, 2)}
                </pre>
                <p className="mt-4 text-muted-foreground">
                    Si eres admin@juntay.com, cierra sesión y vuelve a iniciar.
                </p>
            </div>
        )
    }

    const metrics = await getSaasMetrics()
    const companies = await getAllCompanies()
    const { empresaId } = await getEmpresaActual()

    return (
        <div className="space-y-8 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Panel SaaS Master</h2>
                    <p className="text-muted-foreground">
                        Visión global de todas las empresas (Tenants) en la plataforma.
                    </p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalEmpresas}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.empresasActivas} activas actualmente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalUsuarios}</div>
                        <p className="text-xs text-muted-foreground">
                            En toda la plataforma
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">Operativo</div>
                        <p className="text-xs text-muted-foreground">
                            Todos los servicios online
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Companies List */}
            <Card>
                <CardHeader>
                    <CardTitle>Empresas Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                    <SaasCompanyList companies={companies as any} currentEmpresaId={empresaId} />
                </CardContent>
            </Card>
        </div>
    )
}
