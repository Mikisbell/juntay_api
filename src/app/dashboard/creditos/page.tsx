import { Suspense } from 'react'
import { obtenerTodosCreditos, obtenerResumenEstados } from '@/lib/actions/creditos-actions'
import { EstadoBadge } from '@/components/creditos/EstadoBadge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatearMonto } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Plus,
    Wallet,
    Clock,
    AlertTriangle,
    XCircle,
    CheckCircle2,
    ChevronRight
} from 'lucide-react'

export const metadata = {
    title: 'Gestión de Préstamos | Juntay',
    description: 'Administra y monitorea todos los préstamos prendarios activos e históricos'
}

export default async function CreditosPage() {
    const creditos = await obtenerTodosCreditos(50)
    const resumen = await obtenerResumenEstados()

    // Calculate mora percentage
    const tasaMora = resumen.total > 0
        ? ((resumen.en_mora / resumen.total) * 100).toFixed(1)
        : '0'

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header - Enhanced */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Préstamos</h1>
                    <p className="text-muted-foreground">
                        Administra y monitorea todos los préstamos prendarios activos e históricos.
                    </p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-fit">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Préstamo
                </Button>
            </div>

            {/* KPI Cards - Enhanced with icons and better colors */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Vigentes */}
                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <Wallet className="w-5 h-5 text-emerald-600" />
                            <span className="text-xs text-emerald-600 font-medium">Activos</span>
                        </div>
                        <CardTitle className="text-2xl text-emerald-600">{resumen.vigente}</CardTitle>
                        <CardDescription>Vigentes</CardDescription>
                    </CardHeader>
                </Card>

                {/* Por Vencer */}
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <span className="text-xs text-amber-600 font-medium">⚡ Atención</span>
                        </div>
                        <CardTitle className="text-2xl text-amber-600">{resumen.por_vencer}</CardTitle>
                        <CardDescription>Por Vencer</CardDescription>
                    </CardHeader>
                </Card>

                {/* Vencidos */}
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <CardTitle className="text-2xl text-orange-600">{resumen.vencido}</CardTitle>
                        <CardDescription>Vencidos</CardDescription>
                    </CardHeader>
                </Card>

                {/* En Mora */}
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-xs text-red-600 font-medium">{tasaMora}%</span>
                        </div>
                        <CardTitle className="text-2xl text-red-600">{resumen.en_mora}</CardTitle>
                        <CardDescription>En Mora</CardDescription>
                    </CardHeader>
                </Card>

                {/* Pre-Remate */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <AlertTriangle className="w-5 h-5 text-purple-600" />
                        </div>
                        <CardTitle className="text-2xl text-purple-600">{resumen.pre_remate}</CardTitle>
                        <CardDescription>Pre-Remate</CardDescription>
                    </CardHeader>
                </Card>

                {/* Cancelados */}
                <Card className="border-l-4 border-l-slate-400">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CheckCircle2 className="w-5 h-5 text-slate-500" />
                        </div>
                        <CardTitle className="text-2xl text-slate-600">{resumen.cancelado}</CardTitle>
                        <CardDescription>Cancelados</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Lista de Créditos - Enhanced */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Lista de Créditos</CardTitle>
                        <CardDescription>
                            {resumen.total} créditos registrados
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<CreditosListSkeleton />}>
                        {/* Table Header */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b mb-3">
                            <div className="col-span-4">Cliente / Código</div>
                            <div className="col-span-2 text-right">Monto</div>
                            <div className="col-span-2 text-center">Vencimiento</div>
                            <div className="col-span-2 text-center">Estado</div>
                            <div className="col-span-2 text-right">Tasa</div>
                        </div>

                        <div className="space-y-2">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {creditos.map((credito: any) => {
                                const isVencido = new Date(credito.fecha_vencimiento) < new Date()

                                return (
                                    <Link
                                        key={credito.id}
                                        href={`/dashboard/creditos/${credito.id}`}
                                        className="block"
                                    >
                                        <div className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all">
                                            {/* Cliente y Código */}
                                            <div className="col-span-12 md:col-span-4">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-semibold text-slate-600">
                                                        {credito.clientes?.nombres?.charAt(0).toUpperCase() || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {credito.clientes?.nombres || 'Sin cliente'}
                                                        </p>
                                                        <Badge variant="outline" className="font-mono text-xs mt-0.5">
                                                            {credito.codigo}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Monto */}
                                            <div className="hidden md:block col-span-2 text-right">
                                                <p className="font-semibold">{formatearMonto(credito.monto_prestado)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Saldo: {formatearMonto(credito.saldo_pendiente)}
                                                </p>
                                            </div>

                                            {/* Vencimiento */}
                                            <div className="hidden md:block col-span-2 text-center">
                                                <p className={`text-sm font-medium ${isVencido ? 'text-red-600' : ''}`}>
                                                    {format(new Date(credito.fecha_vencimiento), 'dd MMM yyyy', { locale: es })}
                                                </p>
                                            </div>

                                            {/* Estado */}
                                            <div className="col-span-8 md:col-span-2 flex justify-start md:justify-center">
                                                <EstadoBadge estado={credito.estado_detallado} />
                                            </div>

                                            {/* Tasa + Arrow */}
                                            <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {credito.tasa_interes}%
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
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
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>
            ))}
        </div>
    )
}
