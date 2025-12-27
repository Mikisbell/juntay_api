import { getGlobalUsageMetrics } from '@/lib/actions/analytics-actions'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { BarChart3 } from 'lucide-react'

export default async function AnalyticsPage() {
    const data = await getGlobalUsageMetrics()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                        Analytics de Uso
                    </h2>
                    <p className="text-muted-foreground">
                        Métricas de adopción y volumen financiero en tiempo real (Materialized Cache).
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Actualizado: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <AnalyticsDashboard data={data} />
        </div>
    )
}
