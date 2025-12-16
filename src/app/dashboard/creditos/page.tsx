import { Suspense } from 'react'
import { obtenerTodosCreditos, obtenerResumenEstados } from '@/lib/actions/creditos-actions'
import { EstadoBadge } from '@/components/creditos/EstadoBadge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { formatearMonto } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const metadata = {
    title: 'Créditos | Juntay',
    description: 'Gestión de créditos y préstamos prendarios'
}

export default async function CreditosPage() {
    const creditos = await obtenerTodosCreditos(50)
    const resumen = await obtenerResumenEstados()

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Créditos</h1>
                <p className="text-muted-foreground">Gestión de préstamos prendarios</p>
            </div>

            {/* Resumen por Estados */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Vigentes</CardDescription>
                        <CardTitle className="text-2xl text-green-600">{resumen.vigente}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Por Vencer</CardDescription>
                        <CardTitle className="text-2xl text-yellow-600">{resumen.por_vencer}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Vencidos</CardDescription>
                        <CardTitle className="text-2xl text-orange-600">{resumen.vencido}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>En Mora</CardDescription>
                        <CardTitle className="text-2xl text-red-600">{resumen.en_mora}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pre-Remate</CardDescription>
                        <CardTitle className="text-2xl text-purple-600">{resumen.pre_remate}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Cancelados</CardDescription>
                        <CardTitle className="text-2xl text-gray-600">{resumen.cancelado}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Lista de Créditos */}
            <Card>
                <CardHeader>
                    <CardTitle>Todos los Créditos</CardTitle>
                    <CardDescription>
                        {resumen.total} créditos registrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<CreditosListSkeleton />}>
                        <div className="space-y-3">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {creditos.map((credito: any) => (
                                <Link
                                    key={credito.id}
                                    href={`/dashboard/creditos/${credito.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                        {/* Izquierda: Código y Cliente */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="font-mono">
                                                    {credito.codigo}
                                                </Badge>
                                                <EstadoBadge estado={credito.estado_detallado} />
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {credito.clientes?.nombres || 'Sin cliente'}
                                            </p>
                                        </div>

                                        {/* Centro: Montos */}
                                        <div className="hidden md:flex flex-col items-end mr-8">
                                            <p className="text-sm font-medium">
                                                {formatearMonto(credito.monto_prestado)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Saldo: {formatearMonto(credito.saldo_pendiente)}
                                            </p>
                                        </div>

                                        {/* Derecha: Fechas */}
                                        <div className="hidden lg:flex flex-col items-end text-xs text-muted-foreground">
                                            <p>Vence: {format(new Date(credito.fecha_vencimiento), 'dd MMM yyyy', { locale: es })}</p>
                                            <p>Tasa: {credito.tasa_interes}%</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

function CreditosListSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    )
}
