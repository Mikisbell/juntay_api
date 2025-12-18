'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
    PlusCircle, Wallet, Phone, AlertTriangle, CheckCircle2,
    Clock, ChevronRight, X, RefreshCw, ArrowUpRight, ArrowDownLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatearSoles } from '@/lib/utils/decimal'
import { CommandPalette, useCommandPalette } from '@/components/CommandPalette'
import { NotificationsSidebar, NotificationBell } from '@/components/NotificationsSidebar'
import { useUserRole, RoleGate } from '@/lib/hooks/useUserRole'
import { cn } from '@/lib/utils'

// Types
interface ContratoUrgente {
    id: string
    codigo: string
    clienteId: string
    clienteNombre: string
    clienteTelefono: string | null
    monto: number
    saldo: number
    fechaVencimiento: string
    diasVencido: number
    estado: 'vencido' | 'hoy' | 'manana' | 'semana'
}

interface CajaStats {
    abierta: boolean
    saldoInicial: number
    ingresos: number
    egresos: number
    saldoActual: number
    operaciones: number
}

interface CarteraResumen {
    alDia: { count: number; total: number }
    porVencer: { count: number; total: number }
    enMora: { count: number; total: number }
}

export default function DashboardPage() {
    const { isOpen: isPaletteOpen, close: closePalette } = useCommandPalette()
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const { role: userRole, isLoading: roleLoading } = useUserRole()

    const [contratosUrgentes, setContratosUrgentes] = useState<ContratoUrgente[]>([])
    const [caja, setCaja] = useState<CajaStats | null>(null)
    const [cartera, setCartera] = useState<CarteraResumen | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Load dashboard data
    const loadDashboardData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const hoy = new Date()
            const hoyStr = hoy.toISOString().split('T')[0]
            const mananaStr = new Date(hoy.getTime() + 86400000).toISOString().split('T')[0]
            const semanaStr = new Date(hoy.getTime() + 7 * 86400000).toISOString().split('T')[0]
            const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()

            // 1. CONTRATOS URGENTES (vencidos + vencen hoy + vencen mañana + vencen esta semana)
            const { data: contratos } = await supabase
                .from('creditos')
                .select(`
                    id,
                    codigo_credito,
                    monto_prestado,
                    saldo_pendiente,
                    fecha_vencimiento,
                    clientes!inner(id, nombres, apellido_paterno, telefono_principal)
                `)
                .lte('fecha_vencimiento', semanaStr)
                .in('estado_detallado', ['vigente', 'por_vencer', 'vencido', 'en_mora'])
                .order('fecha_vencimiento', { ascending: true })
                .limit(20)

            const contratosArray = (contratos || []).map((c: unknown) => {
                const contrato = c as {
                    id: string
                    codigo_credito: string
                    monto_prestado: number
                    saldo_pendiente: number
                    fecha_vencimiento: string
                    clientes: { id: string; nombres: string; apellido_paterno: string; telefono_principal: string | null }
                }
                const fechaVenc = new Date(contrato.fecha_vencimiento)
                const diasVencido = Math.floor((hoy.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24))

                let estado: ContratoUrgente['estado'] = 'semana'
                if (diasVencido > 0) estado = 'vencido'
                else if (diasVencido === 0) estado = 'hoy'
                else if (diasVencido === -1) estado = 'manana'

                return {
                    id: contrato.id,
                    codigo: contrato.codigo_credito,
                    clienteId: contrato.clientes.id,
                    clienteNombre: `${contrato.clientes.nombres} ${contrato.clientes.apellido_paterno}`,
                    clienteTelefono: contrato.clientes.telefono_principal,
                    monto: contrato.monto_prestado,
                    saldo: contrato.saldo_pendiente,
                    fechaVencimiento: contrato.fecha_vencimiento,
                    diasVencido,
                    estado
                }
            })

            setContratosUrgentes(contratosArray)

            // 2. CARTERA RESUMEN
            const { data: riskData } = await supabase.rpc('get_cartera_risk_summary')
            const riskArray = riskData || []
            const vigente = riskArray.find((r: { estado_grupo: string; cantidad: number; total_saldo: number }) => r.estado_grupo === 'VIGENTE')
            const porVencer = riskArray.find((r: { estado_grupo: string; cantidad: number; total_saldo: number }) => r.estado_grupo === 'POR_VENCER')
            const vencido = riskArray.find((r: { estado_grupo: string; cantidad: number; total_saldo: number }) => r.estado_grupo === 'VENCIDO')

            setCartera({
                alDia: { count: vigente?.cantidad || 0, total: vigente?.total_saldo || 0 },
                porVencer: { count: porVencer?.cantidad || 0, total: porVencer?.total_saldo || 0 },
                enMora: { count: vencido?.cantidad || 0, total: vencido?.total_saldo || 0 }
            })

            // 3. CAJA STATUS
            const { data: cajaData } = await supabase
                .from('cajas_operativas')
                .select('id, saldo_inicial, saldo_actual, estado')
                .eq('usuario_id', user.id)
                .eq('estado', 'abierta')
                .single()

            if (cajaData) {
                const cajaTyped = cajaData as { id: string; saldo_inicial: number; saldo_actual: number }
                const { data: movimientos } = await supabase
                    .from('movimientos_caja_operativa')
                    .select('tipo, monto')
                    .eq('caja_operativa_id', cajaTyped.id)
                    .gte('created_at', inicioHoy)

                const movArray = movimientos as Array<{ tipo: string; monto: number }> || []
                const ingresos = movArray.filter(m => m.tipo === 'INGRESO').reduce((acc, m) => acc + Number(m.monto), 0)
                const egresos = movArray.filter(m => m.tipo === 'EGRESO').reduce((acc, m) => acc + Number(m.monto), 0)

                setCaja({
                    abierta: true,
                    saldoInicial: cajaTyped.saldo_inicial || 0,
                    ingresos,
                    egresos,
                    saldoActual: cajaTyped.saldo_actual || 0,
                    operaciones: movArray.length
                })
            } else {
                setCaja({ abierta: false, saldoInicial: 0, ingresos: 0, egresos: 0, saldoActual: 0, operaciones: 0 })
            }

        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        loadDashboardData()
    }, [loadDashboardData])

    // Group contracts by status
    const vencidos = contratosUrgentes.filter(c => c.estado === 'vencido')
    const vencenHoy = contratosUrgentes.filter(c => c.estado === 'hoy')
    const vencenManana = contratosUrgentes.filter(c => c.estado === 'manana')
    const vencenSemana = contratosUrgentes.filter(c => c.estado === 'semana')

    const notificationCount = vencidos.length + vencenHoy.length

    // Render contract row
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
                        <span className="font-medium text-slate-900 truncate">{contrato.clienteNombre}</span>
                        <span className="text-xs text-slate-400">{contrato.codigo}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="font-semibold text-slate-700">{formatearSoles(String(contrato.saldo))}</span>
                        {contrato.diasVencido > 0 && (
                            <span className="text-red-600 text-xs font-medium">hace {contrato.diasVencido}d</span>
                        )}
                        {contrato.diasVencido === 0 && (
                            <span className="text-amber-600 text-xs font-medium">HOY</span>
                        )}
                        {contrato.diasVencido < 0 && (
                            <span className="text-blue-600 text-xs font-medium">en {Math.abs(contrato.diasVencido)}d</span>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    {contrato.clienteTelefono && (
                        <a
                            href={`https://wa.me/51${contrato.clienteTelefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            title="Llamar/WhatsApp"
                        >
                            <Phone className="h-4 w-4" />
                        </a>
                    )}
                    <Link
                        href={`/dashboard/clientes/${contrato.clienteId}`}
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

    if (loading) {
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
                    caja?.abierta ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-300'
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center',
                                caja?.abierta ? 'bg-emerald-500' : 'bg-slate-400'
                            )}>
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Mi Caja</p>
                                {caja?.abierta ? (
                                    <p className="text-2xl font-bold text-slate-900">{formatearSoles(String(caja.saldoActual))}</p>
                                ) : (
                                    <p className="text-lg font-medium text-slate-500">Cerrada</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {caja?.abierta && (
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
                                hasCritical={vencidos.length > 0}
                            />

                            {!caja?.abierta && (
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
                <div className="grid grid-cols-2 gap-4">
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
                        <div className="space-y-2">
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
                        <div className="space-y-2">
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
                        <div className="space-y-2">
                            {[...vencenManana, ...vencenSemana].slice(0, 5).map(c => (
                                <ContratoRow key={c.id} contrato={c} variant="info" />
                            ))}
                        </div>
                    </section>
                )}

                {/* ============ CARTERA RESUMEN (Compact) ============ */}
                <section className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-900">Resumen de Cartera</h2>
                        <RoleGate roles={['gerente', 'admin']} userRole={userRole}>
                            <Link href="/dashboard/reportes" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                Ver Analytics <ChevronRight className="h-4 w-4" />
                            </Link>
                        </RoleGate>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Link href="/dashboard/clientes?f=todos" className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-500">Al Día</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-700">{cartera?.alDia.count || 0}</p>
                            <p className="text-xs text-slate-400">{formatearSoles(String(cartera?.alDia.total || 0))}</p>
                        </Link>

                        <Link href="/dashboard/clientes?f=alerta" className="p-4 rounded-xl bg-amber-50 border border-amber-100 hover:border-amber-300 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-medium text-slate-500">Por Vencer</span>
                            </div>
                            <p className="text-xl font-bold text-amber-700">{cartera?.porVencer.count || 0}</p>
                            <p className="text-xs text-slate-400">{formatearSoles(String(cartera?.porVencer.total || 0))}</p>
                        </Link>

                        <Link href="/dashboard/clientes?f=critico" className="p-4 rounded-xl bg-red-50 border border-red-100 hover:border-red-300 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-xs font-medium text-slate-500">En Mora</span>
                            </div>
                            <p className="text-xl font-bold text-red-700">{cartera?.enMora.count || 0}</p>
                            <p className="text-xs text-slate-400">{formatearSoles(String(cartera?.enMora.total || 0))}</p>
                        </Link>
                    </div>
                </section>

                {/* ============ QUICK ACTIONS (Secondary) ============ */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                            <AlertTriangle className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                            <span className="text-sm font-medium text-slate-700">Reportes</span>
                        </Link>
                    </RoleGate>
                </section>

            </div>
        </div>
    )
}
