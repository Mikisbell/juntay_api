'use client'

/**
 * Dashboard Gerencial Premium
 * 
 * Executive-level dashboard with:
 * - Animated KPI cards with trends
 * - Cash flow line chart
 * - Portfolio health donut
 * - Top 10 clients ranking
 */

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { FlujoCajaChart } from '@/components/dashboard/gerencial/FlujoCajaChart'
import { CarteraDonutChart, CarteraStats } from '@/components/dashboard/gerencial/CarteraDonutChart'
import { TopClientesTable } from '@/components/dashboard/gerencial/TopClientesTable'
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard'
import {
    obtenerFlujoCaja,
    obtenerTop10Clientes,
    obtenerKPIsGerenciales,
    obtenerComparativaMensual
} from '@/lib/actions/dashboard-gerencial-actions'
import { formatearMonto } from '@/lib/utils'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Users,
    AlertTriangle,
    BarChart3,
    RefreshCw,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

type PeriodOption = 7 | 30 | 90

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export default function GerencialPage() {
    const [periodo, setPeriodo] = useState<PeriodOption>(30)

    // Fetch KPIs
    const { data: kpis, isLoading: loadingKpis } = useQuery({
        queryKey: ['gerencial-kpis'],
        queryFn: obtenerKPIsGerenciales
    })

    // Fetch cash flow
    const { data: flujoCaja, isLoading: loadingFlujo, refetch: refetchFlujo } = useQuery({
        queryKey: ['gerencial-flujo', periodo],
        queryFn: () => obtenerFlujoCaja(periodo)
    })

    // Fetch top clients
    const { data: topClientes, isLoading: loadingClientes } = useQuery({
        queryKey: ['gerencial-top-clientes'],
        queryFn: obtenerTop10Clientes
    })

    // Fetch month comparison
    const { data: comparativa } = useQuery({
        queryKey: ['gerencial-comparativa'],
        queryFn: obtenerComparativaMensual
    })

    // Trend indicator component
    const TrendBadge = ({ value, label = 'vs mes anterior' }: { value: number; label?: string }) => {
        const isPositive = value >= 0
        return (
            <div className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                isPositive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
            )}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{value}% {label}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Dashboard Gerencial
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Visión ejecutiva del negocio en tiempo real
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetchFlujo()}
                            className="gap-1"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualizar
                        </Button>
                        <Link href="/dashboard/reportes">
                            <Button variant="outline" size="sm" className="gap-1">
                                Ver Reportes
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* AI Insights Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <AIInsightsCard className="bg-white/90 backdrop-blur shadow-sm border-indigo-100" />
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Cartera Total */}
                        <motion.div variants={item}>
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-blue-100">
                                            <Wallet className="w-5 h-5 text-blue-600" />
                                        </div>
                                        {comparativa && (
                                            <TrendBadge value={comparativa.variacion.ingresos} />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loadingKpis ? (
                                        <Skeleton className="h-8 w-32" />
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold text-slate-800">
                                                {formatearMonto(kpis?.carteraTotal || 0)}
                                            </p>
                                            <p className="text-sm text-slate-500">Cartera Total</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Flujo Neto Mes */}
                        <motion.div variants={item}>
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className={cn(
                                            'p-2 rounded-lg',
                                            (kpis?.flujonetoMes || 0) >= 0 ? 'bg-emerald-100' : 'bg-red-100'
                                        )}>
                                            <BarChart3 className={cn(
                                                'w-5 h-5',
                                                (kpis?.flujonetoMes || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                                            )} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loadingKpis ? (
                                        <Skeleton className="h-8 w-32" />
                                    ) : (
                                        <>
                                            <p className={cn(
                                                'text-2xl font-bold',
                                                (kpis?.flujonetoMes || 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                                            )}>
                                                {(kpis?.flujonetoMes || 0) >= 0 ? '+' : ''}
                                                {formatearMonto(kpis?.flujonetoMes || 0)}
                                            </p>
                                            <p className="text-sm text-slate-500">Flujo Neto (Mes)</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Tasa de Mora */}
                        <motion.div variants={item}>
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className={cn(
                                            'p-2 rounded-lg',
                                            (kpis?.tasaMora || 0) > 10 ? 'bg-red-100' : 'bg-amber-100'
                                        )}>
                                            <AlertTriangle className={cn(
                                                'w-5 h-5',
                                                (kpis?.tasaMora || 0) > 10 ? 'text-red-600' : 'text-amber-600'
                                            )} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loadingKpis ? (
                                        <Skeleton className="h-8 w-32" />
                                    ) : (
                                        <>
                                            <p className={cn(
                                                'text-2xl font-bold',
                                                (kpis?.tasaMora || 0) > 10 ? 'text-red-700' : 'text-amber-700'
                                            )}>
                                                {kpis?.tasaMora || 0}%
                                            </p>
                                            <p className="text-sm text-slate-500">Tasa de Mora</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Clientes Activos */}
                        <motion.div variants={item}>
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-purple-100">
                                            <Users className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loadingKpis ? (
                                        <Skeleton className="h-8 w-32" />
                                    ) : (
                                        <>
                                            <p className="text-2xl font-bold text-slate-800">
                                                {kpis?.clientesActivos || 0}
                                            </p>
                                            <p className="text-sm text-slate-500">Clientes Activos</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cash Flow Chart */}
                        <motion.div variants={item} className="lg:col-span-2">
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                                Flujo de Caja
                                            </CardTitle>
                                            <CardDescription>Ingresos vs Egresos</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                            {([7, 30, 90] as PeriodOption[]).map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => setPeriodo(p)}
                                                    className={cn(
                                                        'px-3 py-1 rounded-md text-sm font-medium transition-all',
                                                        periodo === p
                                                            ? 'bg-white text-blue-600 shadow'
                                                            : 'text-slate-500 hover:text-slate-700'
                                                    )}
                                                >
                                                    {p}d
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loadingFlujo ? (
                                        <Skeleton className="h-[300px] w-full" />
                                    ) : (
                                        <FlujoCajaChart data={flujoCaja || []} />
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Portfolio Donut */}
                        <motion.div variants={item}>
                            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Wallet className="w-5 h-5 text-emerald-500" />
                                            Salud de Cartera
                                        </CardTitle>
                                        {loadingKpis ? null : (
                                            <span className="text-xs font-medium text-slate-400">
                                                Total: {formatearMonto(kpis?.carteraTotal || 0)}
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription>Distribución por estado actual</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loadingKpis ? (
                                        <Skeleton className="h-[280px] w-full rounded-2xl" />
                                    ) : (
                                        <>
                                            <CarteraDonutChart
                                                alDia={kpis?.carteraAlDia || 0}
                                                porVencer={kpis?.carteraPorVencer || 0}
                                                enMora={kpis?.carteraEnMora || 0}
                                            />
                                            <CarteraStats
                                                alDia={kpis?.carteraAlDia || 0}
                                                porVencer={kpis?.carteraPorVencer || 0}
                                                enMora={kpis?.carteraEnMora || 0}
                                            />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Top Clients */}
                    <motion.div variants={item}>
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            🏆 Top 10 Clientes
                                        </CardTitle>
                                        <CardDescription>Por monto total pagado</CardDescription>
                                    </div>
                                    <Link href="/dashboard/clientes">
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            Ver todos
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loadingClientes ? (
                                    <div className="space-y-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <TopClientesTable clientes={topClientes || []} />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    )
}
