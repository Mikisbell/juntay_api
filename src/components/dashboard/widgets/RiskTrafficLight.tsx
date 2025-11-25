'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { formatearMonto } from '@/lib/utils/calculadora-credito'

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
            if (error) console.error('Error fetching risk summary:', error)
            else setData(data || [])
            setLoading(false)
        }
        fetchData()
    }, [])

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

    if (loading) return <div className="h-32 animate-pulse bg-slate-100 rounded-xl" />

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-950 dark:to-green-900/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Vigente (Al día)
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatearMonto(vigente.amount)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {vigente.count} contratos activos
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-white to-yellow-50/50 dark:from-slate-950 dark:to-yellow-900/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Por Vencer (7 días)
                    </CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatearMonto(porVencer.amount)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {porVencer.count} contratos próximos
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-white to-red-50/50 dark:from-slate-950 dark:to-red-900/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Vencido / Mora
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatearMonto(vencido.amount)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {vencido.count} contratos en riesgo
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
