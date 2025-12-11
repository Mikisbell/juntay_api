import { PageHeader } from "@/components/layout/PageHeader"
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from "@/components/ui/card"
import { TablaVencimientos } from '@/components/vencimientos/TablaVencimientos'
import { AlertCircle, Calendar, Clock } from "lucide-react"

export default async function VencimientosPage() {
    const supabase = await createClient()

    // Obtener contratos que vencen en los próximos 30 días
    const { data, error } = await supabase.rpc('get_contratos_vencimientos', {
        p_dias: 30
    })

    if (error) {
        console.error('Error obteniendo vencimientos:', error)
    }

    const todosVencimientos = (data || []).map((v: any) => ({
        id: v.id,
        codigo: v.codigo,
        cliente: v.cliente,
        telefono: v.telefono || '',
        monto: v.monto,
        saldo: v.saldo,
        fechaVencimiento: v.fecha_vencimiento,
        diasRestantes: v.dias_restantes
    }))

    // Calcular KPIs
    const hoy = todosVencimientos.filter((c: any) => c.diasRestantes === 0).length
    const semana = todosVencimientos.filter((c: any) => c.diasRestantes > 0 && c.diasRestantes <= 7).length
    const mes = todosVencimientos.length

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Gestión de Vencimientos"
                description="Monitor de contratos que vencen y sistema de alertas automáticas"
            />

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Vencen HOY</p>
                                <p className="text-3xl font-bold text-red-600">{hoy}</p>
                                <p className="text-xs text-red-600 mt-1">Acción inmediata requerida</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                                <p className="text-3xl font-bold text-yellow-600">{semana}</p>
                                <p className="text-xs text-yellow-600 mt-1">Próximos 7 días</p>
                            </div>
                            <Calendar className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                                <p className="text-3xl font-bold text-blue-600">{mes}</p>
                                <p className="text-xs text-blue-600 mt-1">Próximos 30 días</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla profesional */}
            <TablaVencimientos contratos={todosVencimientos} />
        </div>
    )
}
