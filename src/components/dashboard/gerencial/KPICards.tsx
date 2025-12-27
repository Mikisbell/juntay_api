'use client'

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Users, Wallet, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPIProps {
    data: {
        carteraTotal: number
        tasaMora: number
        ingresosMes: number
        egresosMes: number
        flujonetoMes: number
        clientesActivos: number
    }
    comparativa?: {
        variacion: {
            ingresos: number
            egresos: number
            neto: number
            creditos: number
        }
    }
}

export function KPICards({ data, comparativa }: KPIProps) {
    const formatter = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    })

    const kpis = [
        {
            title: "Ingresos Netos (Mes)",
            value: formatter.format(data.ingresosMes),
            icon: DollarSign,
            trend: comparativa?.variacion.ingresos,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Cartera Total",
            value: formatter.format(data.carteraTotal),
            icon: Wallet,
            trend: comparativa?.variacion.creditos,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Tasa de Mora",
            value: `${data.tasaMora}%`,
            icon: AlertTriangle,
            // Mora inversa: Si baja es bueno (verde), si sube es malo (rojo)
            trend: comparativa ? -1 * comparativa.variacion.creditos : 0,
            color: data.tasaMora > 10 ? "text-red-500" : "text-amber-500",
            bg: data.tasaMora > 10 ? "bg-red-500/10" : "bg-amber-500/10"
        },
        {
            title: "Clientes Activos",
            value: data.clientesActivos.toString(),
            icon: Users,
            trend: comparativa?.variacion.creditos, // Proxy
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, i) => (
                <Card key={i} className="border-border/50 bg-background/50 backdrop-blur-xl">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                {kpi.title}
                            </p>
                            <h3 className="text-2xl font-bold tracking-tight">
                                {kpi.value}
                            </h3>
                            {kpi.trend !== undefined && (
                                <div className={cn(
                                    "flex items-center text-xs mt-1 font-medium",
                                    kpi.trend > 0 ? "text-emerald-500" : kpi.trend < 0 ? "text-red-500" : "text-muted-foreground"
                                )}>
                                    {kpi.trend > 0 ? <ArrowUpIcon className="w-3 h-3 mr-1" /> :
                                        kpi.trend < 0 ? <ArrowDownIcon className="w-3 h-3 mr-1" /> : null}
                                    {Math.abs(kpi.trend)}% vs mes anterior
                                </div>
                            )}
                        </div>
                        <div className={cn("p-3 rounded-xl", kpi.bg)}>
                            <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
