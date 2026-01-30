'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
    PlusCircle, Wallet, Phone, AlertTriangle, CheckCircle2,
    Clock, ChevronRight, RefreshCw, ArrowUpRight, ArrowDownLeft,
    TrendingUp, TrendingDown, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatearSoles } from '@/lib/utils/decimal'
import { CommandPalette, useCommandPalette } from '@/components/CommandPalette'
import { NotificationsSidebar, NotificationBell } from '@/components/NotificationsSidebar'
import { useUserRole, RoleGate } from '@/lib/hooks/useUserRole'
import { useDashboardData, computeDashboardMetrics, type ContratoUrgente } from '@/lib/hooks/useDashboardData'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function DashboardPage() {
    const { isOpen: isPaletteOpen, close: closePalette } = useCommandPalette()
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const { role: userRole } = useUserRole()

    // Single consolidated data fetch
    const { data, loading } = useDashboardData()
    const metrics = useMemo(() => computeDashboardMetrics(data), [data])

    // Render contract row component
    const ContratoRow = ({ contrato, variant }: { contrato: ContratoUrgente; variant: 'danger' | 'warning' | 'info' }) => {
        const colors = {
            danger: 'bg-red-50 border-red-200 hover:border-red-300',
            warning: 'bg-amber-50 border-amber-200 hover:border-amber-300',
            info: 'bg-blue-50 border-blue-200 hover:border-blue-300'
        }

        return (
            <div className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all', colors[variant])}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 truncate">{contrato.cliente_nombre}</span>
                        <span className="text-xs text-slate-400">{contrato.codigo}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="font-semibold text-slate-700">{formatearSoles(String(contrato.saldo))}</span>
                        {contrato.dias_vencido > 0 && (
                            <span className="text-red-600 text-xs font-medium">hace {contrato.dias_vencido}d</span>
                        )}
                        {contrato.dias_vencido === 0 && (
                            <span className="text-amber-600 text-xs font-medium">HOY</span>
                        )}
                        {contrato.dias_vencido < 0 && (
                            <span className="text-blue-600 text-xs font-medium">en {Math.abs(contrato.dias_vencido)}d</span>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    {contrato.cliente_telefono && (
                        <a
                            href={`https://wa.me/51${contrato.cliente_telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            title="Llamar/WhatsApp"
                        >
                            <Phone className="h-4 w-4" />
                        </a>
                    )}
                    <Link
                        href={`/dashboard/clientes/${contrato.cliente_id}`}
                        className={cn(
                            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                                variant === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                                    'bg-blue-600 text-white hover:bg-blue-700'
                        )}
                    >
                        Cobrar
                    </Link>
                </div>
            </div>
        )
    }

    if (loading || !data || !metrics) {
        return (
            <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse space-y-4 w-full max-w-2xl p-6">
                    <div className="h-20 bg-slate-200 rounded-xl" />
                    <div className="h-32 bg-slate-200 rounded-xl" />
                    <div className="h-48 bg-slate-200 rounded-xl" />
                </div>
            </div>
        )
    }

    const { caja, cartera } = data
    const { vencidos, vencenHoy, vencenManana, vencenSemana, notificationCount, trend7Dias, hasCritical } = metrics

    return (
        <div className="min-h-screen w-full bg-slate-50">
            {/* Command Palette */}
            <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />

            {/* Notifications Sidebar */}
            <NotificationsSidebar
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

                {/* ============ HEADER - CAJA STATUS ============ */}
                <header className={cn(
                    'rounded-2xl p-4 border-2 transition-all',
                    caja.abierta ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-300'
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center',
                                caja.abierta ? 'bg-emerald-500' : 'bg-slate-400'
                            )}>
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Mi Caja</p>
                                {caja.abierta ? (
                                    <p className="text-2xl font-bold text-slate-900">{formatearSoles(String(caja.saldo_actual))}</p>
                                ) : (
                                    <p className="text-lg font-medium text-slate-500">Cerrada</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {caja.abierta && (
                                <div className="hidden sm:flex items-center gap-4 mr-4 text-sm">
                                    <div className="text-center">
                                        <p className="text-emerald-600 font-medium flex items-center gap-1">
                                            <ArrowDownLeft className="h-3 w-3" />+{formatearSoles(String(caja.ingresos))}
                                        </p>
                                        <p className="text-xs text-slate-400">Ingresos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-red-600 font-medium flex items-center gap-1">
                                            <ArrowUpRight className="h-3 w-3" />-{formatearSoles(String(caja.egresos))}
                                        </p>
                                        <p className="text-xs text-slate-400">Egresos</p>
                                    </div>
                                </div>
                            )}

                            <NotificationBell
                                onClick={() => setIsNotificationsOpen(true)}
                                count={notificationCount}
                                hasCritical={hasCritical}
                            />

                            {!caja.abierta && (
                                <Link href="/dashboard/caja">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Abrir Caja
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* ============ MAIN ACTIONS ============ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/dashboard/clientes?f=critico"
                        className={cn(
                            'p-6 rounded-2xl border-2 transition-all hover:scale-[1.02]',
                            vencidos.length > 0
                                ? 'bg-red-500 border-red-600 text-white'
                                : 'bg-emerald-500 border-emerald-600 text-white'
                        )}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {vencidos.length > 0 ? (
                                <AlertTriangle className="h-6 w-6" />
                            ) : (
                                <CheckCircle2 className="h-6 w-6" />
                            )}
                            <span className="text-lg font-bold">
                                {vencidos.length > 0 ? 'COBRAR VENCIDOS' : 'SIN VENCIDOS'}
                            </span>
                        </div>
                        <p className="text-3xl font-bold">
                            {vencidos.length}
                        </p>
                        <p className="text-sm opacity-80 mt-1">
                            {vencidos.length > 0 ? 'contratos requieren atención' : 'cartera al día 🎉'}
                        </p>
                    </Link>

                    <Link
                        href="/dashboard/mostrador/nuevo-empeno"
                        className="p-6 rounded-2xl border-2 bg-blue-500 border-blue-600 text-white transition-all hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <PlusCircle className="h-6 w-6" />
                            <span className="text-lg font-bold">NUEVO EMPEÑO</span>
                        </div>
                        <p className="text-sm opacity-80 mt-1">
                            Crear nuevo contrato de crédito
                        </p>
                    </Link>
                </div>

                {/* ============ CONTRATOS URGENTES ============ */}
                {vencidos.length > 0 && (
                    <section className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Vencidos ({vencidos.length})
                            </h2>
                            <Link href="/dashboard/clientes?f=critico" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                Ver todos <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-2 overflow-x-auto">
                            {vencidos.slice(0, 5).map(c => (
                                <ContratoRow key={c.id} contrato={c} variant="danger" />
                            ))}
                            {vencidos.length > 5 && (
                                <Link
                                    href="/dashboard/clientes?f=critico"
                                    className="block text-center py-2 text-sm text-slate-500 hover:text-blue-600"
                                >
                                    +{vencidos.length - 5} más
                                </Link>
                            )}
                        </div>
                    </section>
                )}

                {vencenHoy.length > 0 && (
                    <section className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                Vencen Hoy ({vencenHoy.length})
                            </h2>
                        </div>
                        <div className="space-y-2 overflow-x-auto">
                            {vencenHoy.slice(0, 5).map(c => (
                                <ContratoRow key={c.id} contrato={c} variant="warning" />
                            ))}
                        </div>
                    </section>
                )}

                {(vencenManana.length > 0 || vencenSemana.length > 0) && (
                    <section className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Próximos Vencimientos ({vencenManana.length + vencenSemana.length})
                            </h2>
                        </div>
                        <div className="space-y-2 overflow-x-auto">
                            {[...vencenManana, ...vencenSemana].slice(0, 5).map(c => (
                                <ContratoRow key={c.id} contrato={c} variant="info" />
                            ))}
                        </div>
                    </section>
                )}

                {/* ============ CARTERA RESUMEN ============ */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-900">Resumen de Cartera</h2>
                        <RoleGate roles={['gerente', 'admin']} userRole={userRole}>
                            <Link href="/dashboard/reportes" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                Ver Analytics <ChevronRight className="h-4 w-4" />
                            </Link>
                        </RoleGate>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/dashboard/clientes?f=todos" className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-500">Al Día</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-700">{cartera.al_dia.count}</p>
                            <p className="text-xs text-slate-400">{formatearSoles(String(cartera.al_dia.total))}</p>
                        </Link>

                        <Link href="/dashboard/clientes?f=alerta" className="p-4 rounded-xl bg-amber-50 border border-amber-100 hover:border-amber-300 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-medium text-slate-500">Por Vencer</span>
                            </div>
                            <p className="text-xl font-bold text-amber-700">{cartera.por_vencer.count}</p>
                            <p className="text-xs text-slate-400">{formatearSoles(String(cartera.por_vencer.total))}</p>
                        </Link>

                        <Link href="/dashboard/clientes?f=critico" className="p-4 rounded-xl bg-red-50 border border-red-100 hover:border-red-300 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-xs font-medium text-slate-500">En Mora</span>
                            </div>
                            <p className="text-xl font-bold text-red-700">{cartera.en_mora.count}</p>
                            <p className="text-xs text-slate-400">{formatearSoles(String(cartera.en_mora.total))}</p>
                        </Link>
                    </div>
                </section>

                {/* ============ QUICK ACTIONS ============ */}
                <section className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link
                        href="/dashboard/clientes"
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-center"
                    >
                        <Wallet className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-700">Clientes</span>
                    </Link>

                    <Link
                        href="/dashboard/clientes?f=alerta"
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-center"
                    >
                        <RefreshCw className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-700">Renovar</span>
                    </Link>

                    <Link
                        href="/dashboard/caja"
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-center"
                    >
                        <Wallet className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                        <span className="text-sm font-medium text-slate-700">Caja</span>
                    </Link>

                    <RoleGate roles={['gerente', 'admin']} userRole={userRole} fallback={
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center opacity-50">
                            <AlertTriangle className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                            <span className="text-sm font-medium text-slate-500">Reportes</span>
                        </div>
                    }>
                        <Link
                            href="/dashboard/reportes"
                            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-center"
                        >
                            <BarChart3 className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                            <span className="text-sm font-medium text-slate-700">Reportes</span>
                        </Link>
                    </RoleGate>
                </section>

                {/* ============ CHARTS (Professional Design) ============ */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Análisis de Rendimiento
                        </h2>
                        <span className="text-xs text-slate-400">Actualizado ahora</span>
                    </div>

                    {/* Distribution Bar - Enhanced */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-slate-700">Distribución de Cartera</p>
                            <p className="text-sm text-slate-500">
                                {cartera.al_dia.count + cartera.por_vencer.count + cartera.en_mora.count} contratos
                            </p>
                        </div>
                        {(() => {
                            const total = cartera.al_dia.count + cartera.por_vencer.count + cartera.en_mora.count
                            if (total === 0) return (
                                <div className="h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm text-slate-400">
                                    Sin contratos
                                </div>
                            )
                            const alDiaPct = (cartera.al_dia.count / total) * 100
                            const porVencerPct = (cartera.por_vencer.count / total) * 100
                            const moraPct = (cartera.en_mora.count / total) * 100
                            return (
                                <div className="h-8 rounded-lg overflow-hidden flex shadow-inner">
                                    {alDiaPct > 0 && (
                                        <div
                                            className="bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold transition-all"
                                            style={{ width: `${alDiaPct}%` }}
                                        >
                                            {alDiaPct >= 15 && `${alDiaPct.toFixed(0)}%`}
                                        </div>
                                    )}
                                    {porVencerPct > 0 && (
                                        <div
                                            className="bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold transition-all"
                                            style={{ width: `${porVencerPct}%` }}
                                        >
                                            {porVencerPct >= 15 && `${porVencerPct.toFixed(0)}%`}
                                        </div>
                                    )}
                                    {moraPct > 0 && (
                                        <div
                                            className="bg-gradient-to-b from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-bold transition-all"
                                            style={{ width: `${moraPct}%` }}
                                        >
                                            {moraPct >= 15 && `${moraPct.toFixed(0)}%`}
                                        </div>
                                    )}
                                </div>
                            )
                        })()}
                        {/* Legend */}
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-sm text-slate-600">
                                    Al Día <span className="font-bold text-emerald-600">{cartera.al_dia.count}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-sm text-slate-600">
                                    Por Vencer <span className="font-bold text-amber-600">{cartera.por_vencer.count}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-sm text-slate-600">
                                    Mora <span className="font-bold text-red-600">{cartera.en_mora.count}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-6" />

                    {/* 7-Day Bar Chart - Professional */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-slate-700">Ingresos por Pagos (7 días)</p>
                            {(() => {
                                const todayTotal = trend7Dias[6]?.monto || 0
                                const yesterdayTotal = trend7Dias[5]?.monto || 0
                                const change = yesterdayTotal > 0
                                    ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
                                    : 0
                                return (
                                    <div className="flex items-center gap-3">
                                        {change !== 0 && (
                                            <span className={cn(
                                                'px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1',
                                                change > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            )}>
                                                {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {change > 0 ? '+' : ''}{change.toFixed(0)}% vs ayer
                                            </span>
                                        )}
                                    </div>
                                )
                            })()}
                        </div>

                        {/* Chart Container */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            {/* Grid background with bars */}
                            <div className="relative h-40">
                                {/* Horizontal grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="border-t border-slate-200 w-full" />
                                    ))}
                                </div>

                                {/* Bars */}
                                <div className="relative h-full flex items-end gap-2 px-2">
                                    {trend7Dias.map((day, i) => {
                                        const maxMonto = Math.max(...trend7Dias.map(d => d.monto), 100)
                                        const heightPct = (day.monto / maxMonto) * 100
                                        const isToday = i === 6
                                        const date = new Date(day.date + 'T12:00:00')
                                        const _dayName = date.toLocaleDateString('es-PE', { weekday: 'short' })

                                        return (
                                            <div key={day.date} className="flex-1 flex flex-col items-center">
                                                {/* Value label */}
                                                <div className={cn(
                                                    'text-xs font-bold mb-1 transition-all',
                                                    isToday ? 'text-blue-600' : 'text-slate-500',
                                                    day.monto === 0 && 'text-slate-300'
                                                )}>
                                                    {day.monto > 0 ? `S/${(day.monto / 1000).toFixed(1)}k` : '-'}
                                                </div>

                                                {/* Bar */}
                                                <div
                                                    className={cn(
                                                        'w-full rounded-t-lg transition-all duration-300',
                                                        isToday
                                                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-200'
                                                            : day.monto > 0
                                                                ? 'bg-gradient-to-t from-slate-400 to-slate-300'
                                                                : 'bg-slate-200'
                                                    )}
                                                    style={{
                                                        height: `${Math.max(heightPct, 8)}%`,
                                                        minHeight: '8px'
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Day labels */}
                            <div className="flex gap-2 px-2 mt-3 border-t border-slate-200 pt-3">
                                {trend7Dias.map((day, i) => {
                                    const date = new Date(day.date + 'T12:00:00')
                                    const dayName = date.toLocaleDateString('es-PE', { weekday: 'short' })
                                    const dayNum = date.getDate()
                                    const isToday = i === 6

                                    return (
                                        <div key={day.date} className="flex-1 text-center">
                                            <p className={cn(
                                                'text-xs font-semibold uppercase',
                                                isToday ? 'text-blue-600' : 'text-slate-500'
                                            )}>
                                                {dayName}
                                            </p>
                                            <p className={cn(
                                                'text-sm font-bold',
                                                isToday ? 'text-blue-700' : 'text-slate-700'
                                            )}>
                                                {dayNum}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-xl">
                            <span className="text-sm text-blue-700">Total de la semana</span>
                            <span className="text-lg font-bold text-blue-800">
                                {formatearSoles(String(trend7Dias.reduce((sum, d) => sum + d.monto, 0)))}
                            </span>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}
