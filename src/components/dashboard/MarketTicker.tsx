"use client"

import { TrendingUp, TrendingDown, DollarSign, Coins, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { getFinancialData } from "@/lib/actions/financial-actions"

export function MarketTicker() {
    const [data, setData] = useState<{
        usdPen: number;
        goldGram24k: number;
        goldGram18k: number;
        silverGram: number;
    } | null>(null)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getFinancialData()
                setData(result)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        // Refrescar cada 5 minutos
        const interval = setInterval(fetchData, 1000 * 60 * 5)
        return () => clearInterval(interval)
    }, [])

    if (loading || !data) {
        return (
            <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-muted-foreground border-l pl-6 ml-6 h-8 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-muted-foreground border-l pl-6 ml-6 h-8">
            <div className="flex items-center gap-2 group cursor-pointer hover:text-primary transition-colors">
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <DollarSign className="h-3 w-3" />
                </div>
                <span className="uppercase tracking-wider">USD</span>
                <span className="text-slate-900 dark:text-white font-bold">S/ {data.usdPen.toFixed(3)}</span>
            </div>

            <div className="ml-2">
                <RefreshCw className="h-3 w-3 text-muted-foreground/50 animate-spin-slow" />
            </div>
        </div>
    )
}
