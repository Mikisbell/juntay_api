'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { XCircle, Wallet, Activity, Clock, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatearSoles } from '@/lib/utils/decimal'

interface EstadoCaja {
    cajaAbierta: boolean
    saldoDisponible: number
    operacionesHoy: number
    ultimaOperacion: string | null
}

export function EstadoCajaWidget() {
    const [estado, setEstado] = useState<EstadoCaja | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function cargarEstadoCaja() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const hoy = new Date()
                const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()

                // Buscar caja abierta
                const { data: cajaAbierta } = await supabase
                    .from('cajas_operativas')
                    .select('id, saldo_actual, usuario_id')
                    .eq('estado', 'abierta')
                    .eq('usuario_id', user.id)
                    .single()

                // Contar movimientos del día
                const { count: operacionesHoy } = await supabase
                    .from('movimientos_caja_operativa')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', inicioHoy)

                // Última operación
                const { data: ultimaOp } = await supabase
                    .from('movimientos_caja_operativa')
                    .select('created_at')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                setEstado({
                    cajaAbierta: !!cajaAbierta,
                    saldoDisponible: (cajaAbierta as { saldo_actual?: number } | null)?.saldo_actual || 0,
                    operacionesHoy: operacionesHoy || 0,
                    ultimaOperacion: (ultimaOp as { created_at?: string } | null)?.created_at || null
                })
            } catch (error) {
                console.error('Error cargando estado de caja:', error)
                setEstado({
                    cajaAbierta: false,
                    saldoDisponible: 0,
                    operacionesHoy: 0,
                    ultimaOperacion: null
                })
            } finally {
                setLoading(false)
            }
        }
        cargarEstadoCaja()
    }, [supabase])

    if (loading) {
        return (
            <div className="glass-card-premium p-6 h-[200px] animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-700 mb-4" />
                <div className="h-4 w-24 bg-slate-700 rounded mb-2" />
                <div className="h-10 w-40 bg-slate-700 rounded" />
            </div>
        )
    }

    return (
        <div className="glass-card-premium p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${estado?.cajaAbierta
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 glow-emerald'
                        : 'bg-gradient-to-br from-red-500 to-red-600 glow-red'
                        }`}>
                        {estado?.cajaAbierta
                            ? <Wallet className="h-6 w-6 text-white" />
                            : <XCircle className="h-6 w-6 text-white" />
                        }
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Estado de Caja</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full pulse-glow ${estado?.cajaAbierta ? 'bg-emerald-400' : 'bg-red-400'
                                }`} style={{ color: estado?.cajaAbierta ? '#34d399' : '#f87171' }}></span>
                            <span className={`font-medium ${estado?.cajaAbierta ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {estado?.cajaAbierta ? 'Abierta' : 'Cerrada'}
                            </span>
                        </div>
                    </div>
                </div>
                <Link href="/dashboard/caja" className="text-slate-500 hover:text-white transition-colors">
                    <ArrowUpRight className="h-5 w-5" />
                </Link>
            </div>
            <div className="mt-4">
                <p className="text-sm text-slate-500 mb-1">Disponible</p>
                <p className="text-4xl font-bold text-white number-animate">
                    {estado?.cajaAbierta ? (
                        <>S/ <span className="text-gradient-emerald">{formatearSoles(String(estado?.saldoDisponible || 0)).replace('S/ ', '')}</span></>
                    ) : (
                        <span className="text-slate-500">---</span>
                    )}
                </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm">
                <div>
                    <p className="text-slate-500">Operaciones</p>
                    <p className="text-white font-semibold">{estado?.operacionesHoy || 0} hoy</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-500">Última Op.</p>
                    <p className="text-white font-semibold">
                        {estado?.ultimaOperacion
                            ? new Date(estado.ultimaOperacion).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                            : '--:--'
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}
