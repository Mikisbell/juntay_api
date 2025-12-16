import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, AlertTriangle, DollarSign, Wallet } from "lucide-react"

export function DashboardStats() {
    // NOTA: Estos datos vendrían de tu base de datos (Server Actions)
    // Por ahora son estáticos para armar la UI oficial.
    const stats = [
        {
            title: "Caja Actual",
            value: "S/ 1,540.00",
            description: "+20% desde apertura",
            icon: Wallet,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100/50"
        },
        {
            title: "Préstamos Hoy",
            value: "S/ 850.00",
            description: "3 nuevos contratos",
            icon: ArrowUpRight,
            color: "text-blue-600",
            bgColor: "bg-blue-100/50"
        },
        {
            title: "Vencimientos",
            value: "5",
            description: "Requieren gestión hoy",
            icon: AlertTriangle,
            color: "text-amber-600",
            bgColor: "bg-amber-100/50"
        },
        {
            title: "Intereses Cobrados",
            value: "S/ 120.00",
            description: "En 4 operaciones",
            icon: DollarSign,
            color: "text-slate-600",
            bgColor: "bg-slate-100/50"
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            {stat.title}
                        </CardTitle>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
