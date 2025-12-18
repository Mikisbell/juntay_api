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
import Link from "next/link"
import { Search, AlertTriangle, Clock, Users, ChevronLeft, ChevronRight, UserX } from 'lucide-react'
import { SearchInput } from "@/components/ui/search-input"

import { ClientesActions } from './ClientesActions'
import { ClienteRow } from './ClienteRow'
import { SortableColumnHeader } from './SortableColumnHeader'

export default async function ClientesPage(props: {
    searchParams: Promise<{ q?: string, f?: string, page?: string, sort?: string, dir?: string }>
}) {
    const searchParams = await props.searchParams
    const query = searchParams.q || ""
    const filter = searchParams.f || "todos"
    const page = Number(searchParams.page) || 1
    const pageSize = 10
    const sort = searchParams.sort || 'prioridad'
    const dir = searchParams.dir || 'asc'

    const { meta, data: clientes } = await obtenerClientes({
        busqueda: query,
        estado: filter === 'todos' ? undefined : filter,
        page,
        pageSize,
        ordenarPor: sort,
        direccion: dir as 'asc' | 'desc'
    })

    const totalPages = meta.pagination.totalPages

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">

                {/* Header con gradiente sutil */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                    <div>
                        <Link href="/dashboard/clientes" className="group inline-block">
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all">
                                Gestión de Clientes
                            </h1>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                            Centro de control de cartera y riesgo crediticio
                            <span className="mx-2">•</span>
                            <Link href="/dashboard/contratos" className="text-primary hover:underline font-medium">
                                Ver todos los contratos →
                            </Link>
                        </p>
                    </div>
                    <ClientesActions />
                </div>

                {/* KPI Cards - Grid compacto con jerarquía visual */}
                <div className="grid gap-4 md:grid-cols-4">
                    {/* Card 1: Cobranza Crítica */}
                    <Link href="/dashboard/clientes?f=critico" className="group">
                        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${filter === 'critico'
                            ? 'ring-2 ring-red-500 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30'
                            : 'hover:bg-red-50/50 dark:hover:bg-red-950/30'
                            }`}>
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-500/10 blur-2xl group-hover:bg-red-500/20 transition-all" />
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <CardTitle className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                                        Crítico
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                    S/ {meta.montoCritico.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-xs text-red-600/70 mt-1 font-medium">
                                    {meta.clientesCriticos} clientes vencidos
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Card 2: Por Vencer */}
                    <Link href="/dashboard/clientes?f=alerta" className="group">
                        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${filter === 'alerta'
                            ? 'ring-2 ring-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30'
                            : 'hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
                            }`}>
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all" />
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <CardTitle className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                                        Por Vencer (7d)
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                    S/ {meta.montoPorVencer.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <p className="text-xs text-amber-600/70 mt-1 font-medium">
                                    {meta.vencimientosSemana} próximos a vencer
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Card 3: Cartera Total */}
                    <Link href="/dashboard/clientes?f=todos" className="group">
                        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${filter === 'todos'
                            ? 'ring-2 ring-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30'
                            : 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                            }`}>
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                                        <Users className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <CardTitle className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                                        Cartera Activa
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                    {meta.totalClientes}
                                </div>
                                <p className="text-xs text-emerald-600/70 mt-1 font-medium">
                                    Clientes vigentes
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Card 4: Suspendidos (Nuevo) */}
                    <Link href="/dashboard/clientes?f=suspendido" className="group">
                        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${filter === 'suspendido'
                            ? 'ring-2 ring-slate-500 bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-700/30'
                            : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                            }`}>
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-500/10 blur-2xl group-hover:bg-slate-500/20 transition-all" />
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                        <UserX className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Suspendidos
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                    {meta.clientesSuspendidos}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                    Bloqueados manualmente
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Tabla Principal */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {filter === 'critico' && '🚨 Cobranza Crítica'}
                                    {filter === 'alerta' && '⏰ Próximos Vencimientos'}
                                    {filter === 'suspendido' && '🚫 Clientes Suspendidos'}
                                    {filter === 'todos' && '📋 Todos los Clientes'}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {meta.pagination.totalRecords} registros encontrados
                                </CardDescription>
                            </div>
                            <div className="w-full md:w-80">
                                <SearchInput placeholder="Buscar por nombre, DNI o teléfono..." />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <TableHead className="pl-6 w-[280px]">
                                        <Link href={`/dashboard/clientes?f=${filter}&q=${query}&sort=nombre&dir=${sort === 'nombre' && dir === 'asc' ? 'desc' : 'asc'}`}
                                            className={`inline-flex items-center gap-1 hover:text-primary transition-colors ${sort === 'nombre' ? 'text-primary font-bold' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                            Cliente
                                            {sort === 'nombre' && <span className="text-xs">{dir === 'asc' ? '↑' : '↓'}</span>}
                                        </Link>
                                    </TableHead>
                                    <TableHead className="text-right w-[140px]">
                                        <Link href={`/dashboard/clientes?f=${filter}&q=${query}&sort=deuda&dir=${sort === 'deuda' && dir === 'asc' ? 'desc' : 'asc'}`}
                                            className={`inline-flex items-center gap-1 justify-end hover:text-primary transition-colors ${sort === 'deuda' ? 'text-primary font-bold' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                            Deuda
                                            {sort === 'deuda' && <span className="text-xs">{dir === 'asc' ? '↑' : '↓'}</span>}
                                        </Link>
                                    </TableHead>
                                    <TableHead className="text-right w-[120px]">
                                        <Link href={`/dashboard/clientes?f=${filter}&q=${query}&sort=vencimiento&dir=${sort === 'vencimiento' && dir === 'asc' ? 'desc' : 'asc'}`}
                                            className={`inline-flex items-center gap-1 justify-end hover:text-primary transition-colors ${sort === 'vencimiento' ? 'text-primary font-bold' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                            Vencimiento
                                            {sort === 'vencimiento' && <span className="text-xs">{dir === 'asc' ? '↑' : '↓'}</span>}
                                        </Link>
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[140px]">Contacto</TableHead>
                                    <TableHead className="text-center w-[100px]">
                                        <Link href={`/dashboard/clientes?f=${filter}&q=${query}&sort=estado&dir=${sort === 'estado' && dir === 'asc' ? 'desc' : 'asc'}`}
                                            className={`inline-flex items-center gap-1 justify-center hover:text-primary transition-colors ${sort === 'estado' ? 'text-primary font-bold' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                            Estado
                                            {sort === 'estado' && <span className="text-xs">{dir === 'asc' ? '↑' : '↓'}</span>}
                                        </Link>
                                    </TableHead>
                                    <TableHead className="text-right pr-6 w-[60px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                                                    <Search className="h-6 w-6 opacity-50" />
                                                </div>
                                                <p className="font-medium">No se encontraron clientes</p>
                                                <p className="text-sm mt-1">Intenta con otros criterios de búsqueda</p>
                                                {filter !== 'todos' && (
                                                    <Link href="/dashboard/clientes" className="text-sm text-primary hover:underline mt-3 font-medium">
                                                        Ver todos los clientes →
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

                    {/* Paginación mejorada */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                            <div className="text-sm text-muted-foreground">
                                Página <span className="font-medium text-slate-700 dark:text-slate-300">{page}</span> de <span className="font-medium text-slate-700 dark:text-slate-300">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Link
                                    href={`/dashboard/clientes?page=${page - 1}&q=${query}&f=${filter}`}
                                    className={`inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${page <= 1 ? 'pointer-events-none opacity-30' : ''}`}
                                    aria-disabled={page <= 1}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Link>
                                <Link
                                    href={`/dashboard/clientes?page=${page + 1}&q=${query}&f=${filter}`}
                                    className={`inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${page >= totalPages ? 'pointer-events-none opacity-30' : ''}`}
                                    aria-disabled={page >= totalPages}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}


