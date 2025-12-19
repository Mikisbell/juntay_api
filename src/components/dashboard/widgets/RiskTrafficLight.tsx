'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, ArrowUpRight, TrendingUp, Activity } from 'lucide-react'
import { formatearMonto } from '@/lib/utils/calculadora-credito'
import Link from 'next/link'

interface RiskSummary {
    estado_grupo: string
    cantidad: number
    total_saldo: number
}

export function RiskTrafficLight() {
    const [data, setData] = useState<RiskSummary[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase.rpc('get_cartera_risk_summary')
            if (error) {
                console.error('Error fetching risk summary:', error)
            }
            else setData(data || [])
            setLoading(false)
        }
        fetchData()
    }, [supabase])

    const getStats = (group: string) => {
        const item = data.find(d => d.estado_grupo === group)
        return {
            count: item?.cantidad || 0,
            amount: item?.total_saldo || 0
        }
    }

    const vigente = getStats('VIGENTE')
    const porVencer = getStats('POR_VENCER')
    const vencido = getStats('VENCIDO')

    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card-premium p-5 h-[140px] animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-slate-700 mb-3" />
                        <div className="h-4 w-20 bg-slate-700 rounded mb-2" />
                        <div className="h-8 w-28 bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
        )
    }

    const _totalCartera = vigente.amount + porVencer.amount + vencido.amount

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* Al Día */}
            <Link href="/dashboard/clientes?f=todos" className="glass-card-premium p-5 hover-lift group">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Al Día</p>
                <p className="text-2xl font-bold text-white number-animate">{formatearMonto(vigente.amount)}</p>
                <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {vigente.count} contratos
                </p>
            </Link>

            {/* Por Vencer */}
            <Link href="/dashboard/clientes?f=alerta" className="glass-card-premium p-5 hover-lift group">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Por Vencer</p>
                <p className="text-2xl font-bold text-white number-animate">{formatearMonto(porVencer.amount)}</p>
                <p className="text-amber-400 text-sm mt-2 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> {porVencer.count} contratos
                </p>
            </Link>

            {/* En Mora */}
            <Link href="/dashboard/clientes?f=critico" className="glass-card-premium p-5 hover-lift group border-l-2 border-l-red-500">
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center glow-red">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                </div>
                <p className="text-slate-400 text-sm mb-1">En Mora</p>
                <p className="text-2xl font-bold text-gradient-red number-animate">{formatearMonto(vencido.amount)}</p>
                <p className="text-red-400 text-sm mt-2">{vencido.count} contratos</p>
            </Link>
        </div>
    )
}
