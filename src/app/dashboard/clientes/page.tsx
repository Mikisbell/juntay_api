import { obtenerClientes } from '@/lib/actions/clientes-actions'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, AlertTriangle, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchInput } from "@/components/ui/search-input"

import { ClientesActions } from './ClientesActions'
import { ClienteRow } from './ClienteRow'

export default async function ClientesPage(props: {
    searchParams: Promise<{ q?: string, f?: string, page?: string }>
}) {
    const searchParams = await props.searchParams
    const query = searchParams.q || ""
    const filter = searchParams.f || "todos" // 'todos', 'critico', 'alerta'
    const page = Number(searchParams.page) || 1
    const pageSize = 10

    // Obtener datos con estructura { meta, data }
    const { meta, data: clientes } = await obtenerClientes({
        busqueda: query,
        estado: filter === 'todos' ? undefined : filter,
        page,
        pageSize
    })

    const totalPages = meta.pagination.totalPages

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-6 p-4 md:p-6 pt-4 animate-in-fade-slide">

                {/* Header Táctico */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Centro de Control</h2>
                        <p className="text-sm text-muted-foreground">Monitoreo de riesgo y recuperación.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClientesActions />
                    </div>
                </div>

                {/* KPI Cards: Triaje Financiero */}
                <div className="grid gap-3 md:grid-cols-3">
                    {/* Tarjeta 1: Cobranza Crítica (ROJO) */}
                    <Link href="/dashboard/clientes?f=critico" className="group">
                        <Card className={`relative overflow-hidden transition-all hover:shadow-md ${filter === 'critico' ? 'ring-2 ring-red-500 bg-red-50/50' : 'hover:bg-slate-50'}`}>
                            <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${filter === 'critico' ? 'opacity-20' : ''}`}>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium text-red-600 uppercase tracking-wider">
                                    Cobranza Crítica
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="text-xl font-bold text-red-700">S/ {meta.montoCritico.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                                <p className="text-[10px] text-red-600/80 mt-1 font-medium">
                                    {meta.clientesCriticos} deudores vencidos
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Tarjeta 2: Vencimientos Semanales (AMBAR) */}
                    <Link href="/dashboard/clientes?f=alerta" className="group">
                        <Card className={`relative overflow-hidden transition-all hover:shadow-md ${filter === 'alerta' ? 'ring-2 ring-amber-500 bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                            <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${filter === 'alerta' ? 'opacity-20' : ''}`}>
                                <Clock className="h-8 w-8 text-amber-600" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                                    Vencimientos (7d)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="text-xl font-bold text-amber-700">S/ {meta.montoPorVencer.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                                <p className="text-[10px] text-amber-600/80 mt-1 font-medium">
                                    {meta.vencimientosSemana} por vencer
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Tarjeta 3: Cartera Total (AZUL/NEUTRO) */}
                    <Link href="/dashboard/clientes?f=todos" className="group">
                        <Card className={`relative overflow-hidden transition-all hover:shadow-md ${filter === 'todos' ? 'ring-2 ring-slate-400 bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                            <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${filter === 'todos' ? 'opacity-20' : ''}`}>
                                <Users className="h-8 w-8 text-slate-600" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                                    Cartera Total
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="text-xl font-bold text-slate-700">{meta.totalClientes}</div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Clientes activos
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Main Table Section */}
                <Card className="glass-panel border-0 shadow-xl">
                    <CardHeader className="pb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {filter === 'critico' ? '🚨 Lista de Morosos' : filter === 'alerta' ? '⚠️ Próximos Vencimientos' : '📋 Carteras Activas'}
                                </CardTitle>
                                <CardDescription>
                                    Mostrando <b>{meta.pagination.totalRecords}</b> expedientes {filter !== 'todos' ? 'filtrados por prioridad' : ''}.
                                </CardDescription>
                            </div>
                            <SearchInput placeholder="Buscar por nombre, DNI o teléfono..." />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 relative">
                        {/* Loading State Overlay si fuera necesario, pero Next.js maneja loading.tsx */}

                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                                    <TableHead className="pl-6 w-[250px]">Cliente / Expediente</TableHead>
                                    <TableHead className="text-right text-red-700 font-semibold bg-red-50/30">Deuda Total</TableHead>
                                    <TableHead className="text-right font-medium">Próximo Vencimiento</TableHead>
                                    <TableHead>Contacto Directo</TableHead>
                                    <TableHead className="text-center w-[100px]">Estado</TableHead>
                                    <TableHead className="text-right pr-6 w-[80px]">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Search className="h-8 w-8 mb-2 opacity-20" />
                                                <p>No se encontraron resultados en esta categoría.</p>
                                                {filter !== 'todos' && (
                                                    <Link href="/dashboard/clientes" className="text-sm text-primary hover:underline mt-1">
                                                        Ver todos los clientes
                                                    </Link>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    clientes.map((cliente) => (
                                        <ClienteRow key={cliente.id} cliente={cliente} />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20">
                            <div className="text-xs text-muted-foreground">
                                Página <b>{page}</b> de <b>{totalPages}</b>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/dashboard/clientes?page=${page - 1}&q=${query}&f=${filter}`}
                                    className={`inline-flex items-center justify-center h-8 w-8 rounded hover:bg-slate-100 ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                                    aria-disabled={page <= 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={`/dashboard/clientes?page=${page + 1}&q=${query}&f=${filter}`}
                                    className={`inline-flex items-center justify-center h-8 w-8 rounded hover:bg-slate-100 ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                    aria-disabled={page >= totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

