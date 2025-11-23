import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DollarSign, Users, Activity, TrendingUp, Wallet, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatsGrid() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Capital Total - Premium Card */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-[1px] shadow-xl animate-in-fade-slide delay-100">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative h-full rounded-xl bg-slate-950/90 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Capital en Giro</p>
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold text-white tracking-tight">S/ 45,231.89</h3>
                        <div className="mt-1 flex items-center text-xs text-emerald-400">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            <span>+20.1%</span>
                            <span className="ml-1 text-slate-500">vs mes anterior</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cartera Activa - Glass Card */}
            <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-in-fade-slide delay-200 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                        Cartera Activa
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">2,350</div>
                    <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +180 <span className="text-muted-foreground ml-1 font-normal">nuevos contratos</span>
                    </div>
                </CardContent>
            </Card>

            {/* Caja Diaria - Glass Card */}
            <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-in-fade-slide delay-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                        Flujo de Caja
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">S/ 12,234.00</div>
                    <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +19% <span className="text-muted-foreground ml-1 font-normal">vs ayer</span>
                    </div>
                </CardContent>
            </Card>

            {/* Rendimiento - Glass Card */}
            <Card className="glass-panel border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-in-fade-slide delay-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider group-hover:text-purple-600 transition-colors">
                        Rendimiento
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight text-purple-700 dark:text-purple-400">S/ 573.00</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">24</span> operaciones hoy
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
