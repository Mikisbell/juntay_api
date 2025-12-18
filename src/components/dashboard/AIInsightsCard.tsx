'use client'

import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, Users, Calendar, AlertCircle, Lightbulb } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Insight {
    id: string
    type: 'opportunity' | 'warning' | 'info' | 'success'
    title: string
    description: string
    action?: {
        label: string
        url: string
    }
}

interface AIInsightsCardProps {
    className?: string
}

export function AIInsightsCard({ className = '' }: AIInsightsCardProps) {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        async function generateInsights() {
            try {
                const hoy = new Date()
                const hace7Dias = new Date(hoy)
                hace7Dias.setDate(hace7Dias.getDate() - 7)
                const hace14Dias = new Date(hoy)
                hace14Dias.setDate(hace14Dias.getDate() - 14)

                const generatedInsights: Insight[] = []

                // 1. Check for contracts expiring today
                const { count: expiringToday } = await supabase
                    .from('creditos')
                    .select('*', { count: 'exact', head: true })
                    .gte('fecha_vencimiento', hoy.toISOString().split('T')[0])
                    .lt('fecha_vencimiento', new Date(hoy.getTime() + 86400000).toISOString().split('T')[0])
                    .in('estado_detallado', ['vigente', 'por_vencer'])

                if (expiringToday && expiringToday > 0) {
                    generatedInsights.push({
                        id: 'expiring-today',
                        type: 'warning',
                        title: `${expiringToday} contratos vencen hoy`,
                        description: 'Estos clientes podrían necesitar renovación o recordatorio de pago.',
                        action: { label: 'Ver contratos', url: '/dashboard/clientes?f=alerta' }
                    })
                }

                // 2. Check mora trend
                const { data: riskData } = await supabase.rpc('get_cartera_risk_summary')
                const riskArray = riskData || []
                const vencidos = riskArray.find((r: { estado_grupo: string; total_saldo: number }) => r.estado_grupo === 'VENCIDO')
                const total = riskArray.reduce((acc: number, r: { total_saldo: number }) => acc + r.total_saldo, 0) || 1
                const moraPercentage = vencidos ? ((vencidos.total_saldo / total) * 100).toFixed(1) : 0

                if (Number(moraPercentage) > 10) {
                    generatedInsights.push({
                        id: 'high-mora',
                        type: 'warning',
                        title: `Mora al ${moraPercentage}% de cartera`,
                        description: 'El índice de mora está por encima del objetivo. Considere reforzar cobranza.',
                        action: { label: 'Ver mora', url: '/dashboard/clientes?f=critico' }
                    })
                } else if (Number(moraPercentage) < 5) {
                    generatedInsights.push({
                        id: 'low-mora',
                        type: 'success',
                        title: 'Cartera saludable',
                        description: `Solo ${moraPercentage}% de mora. Excelente gestión de cobranza.`
                    })
                }

                // 3. Check renewal opportunities
                const { count: nearExpiry } = await supabase
                    .from('creditos')
                    .select('*', { count: 'exact', head: true })
                    .gte('fecha_vencimiento', hoy.toISOString())
                    .lte('fecha_vencimiento', new Date(hoy.getTime() + 7 * 86400000).toISOString())
                    .in('estado_detallado', ['vigente', 'por_vencer'])

                if (nearExpiry && nearExpiry > 0) {
                    generatedInsights.push({
                        id: 'renewal-opportunity',
                        type: 'opportunity',
                        title: `${nearExpiry} oportunidades de renovación`,
                        description: 'Contratos próximos a vencer que podrían renovar generando nuevos ingresos.',
                        action: { label: 'Ver oportunidades', url: '/dashboard/clientes?f=alerta' }
                    })
                }

                // 4. Day of week insight
                const dayOfWeek = hoy.getDay()
                const bestDays = [1, 5] // Monday and Friday are typically best for collections
                if (bestDays.includes(dayOfWeek)) {
                    generatedInsights.push({
                        id: 'best-day',
                        type: 'info',
                        title: dayOfWeek === 1 ? 'Lunes: día de cobros' : 'Viernes: último día de la semana',
                        description: dayOfWeek === 1
                            ? 'Los lunes son ideales para contactar clientes sobre pagos pendientes.'
                            : 'Buen momento para cerrar cobros antes del fin de semana.'
                    })
                }

                // 5. Active clients without recent activity
                const { count: activeClients } = await supabase
                    .from('clientes')
                    .select('*', { count: 'exact', head: true })
                    .eq('activo', true)

                if (activeClients && activeClients > 0) {
                    generatedInsights.push({
                        id: 'active-base',
                        type: 'info',
                        title: `${activeClients} clientes activos`,
                        description: 'Tu base de clientes recurrentes para futuras operaciones.'
                    })
                }

                // Add default if no insights
                if (generatedInsights.length === 0) {
                    generatedInsights.push({
                        id: 'all-good',
                        type: 'success',
                        title: 'Todo en orden',
                        description: 'No hay alertas ni oportunidades urgentes en este momento.'
                    })
                }

                setInsights(generatedInsights)
            } catch (error) {
                console.error('Error generating insights:', error)
                setInsights([{
                    id: 'error',
                    type: 'info',
                    title: 'Analizando datos...',
                    description: 'No se pudieron generar insights en este momento.'
                }])
            } finally {
                setLoading(false)
            }
        }

        generateInsights()
    }, [supabase])

    // Auto-rotate insights
    useEffect(() => {
        if (insights.length <= 1) return
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % insights.length)
        }, 8000)
        return () => clearInterval(timer)
    }, [insights.length])

    const getIcon = (type: Insight['type']) => {
        switch (type) {
            case 'opportunity':
                return <TrendingUp className="h-5 w-5 text-blue-500" />
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-amber-500" />
            case 'success':
                return <Sparkles className="h-5 w-5 text-emerald-500" />
            default:
                return <Lightbulb className="h-5 w-5 text-purple-500" />
        }
    }

    const getBgColor = (type: Insight['type']) => {
        switch (type) {
            case 'opportunity':
                return 'bg-blue-50 border-blue-100'
            case 'warning':
                return 'bg-amber-50 border-amber-100'
            case 'success':
                return 'bg-emerald-50 border-emerald-100'
            default:
                return 'bg-purple-50 border-purple-100'
        }
    }

    if (loading) {
        return (
            <div className={cn('bg-slate-100 rounded-2xl p-5 animate-pulse', className)}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200" />
                    <div className="flex-1">
                        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                        <div className="h-3 w-48 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>
        )
    }

    const currentInsight = insights[currentIndex]

    return (
        <div className={cn(
            'rounded-2xl border p-5 transition-colors duration-500',
            getBgColor(currentInsight.type),
            className
        )}>
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    {getIcon(currentInsight.type)}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-3 w-3 text-slate-400" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Insight</span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{currentInsight.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{currentInsight.description}</p>
                    {currentInsight.action && (
                        <a
                            href={currentInsight.action.url}
                            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            {currentInsight.action.label} →
                        </a>
                    )}
                </div>
            </div>

            {/* Dots indicator */}
            {insights.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                    {insights.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                'w-1.5 h-1.5 rounded-full transition-all',
                                index === currentIndex ? 'w-4 bg-slate-400' : 'bg-slate-300'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
