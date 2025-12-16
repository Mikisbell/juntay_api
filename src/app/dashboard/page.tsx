'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    PlusCircle,
    DollarSign,
    Package,
    ArrowRight,
    AlertTriangle,
    Bell,
    Search
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { DashboardCharts } from '@/components/dashboard/Charts'
import { KEYBOARD_SHORTCUTS } from '@/lib/constants/messages'
import { RiskTrafficLight } from '@/components/dashboard/widgets/RiskTrafficLight'
import { ExpirationTimeline } from '@/components/dashboard/widgets/ExpirationTimeline'

export default function DashboardPage() {
    const router = useRouter()

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === KEYBOARD_SHORTCUTS.nuevoEmpeno) {
                e.preventDefault()
                router.push('/dashboard/mostrador/nuevo-empeno')
            }
            if (e.key === KEYBOARD_SHORTCUTS.buscar) {
                e.preventDefault()
                router.push('/dashboard/buscar')
            }
            if (e.key === KEYBOARD_SHORTCUTS.caja) {
                e.preventDefault()
                router.push('/dashboard/caja')
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [router])

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-8 p-8 pt-6">

                {/* Header Section with Fade In */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in-fade-slide">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Visión General</h2>
                        <p className="text-muted-foreground">Resumen de posición financiera y operativa.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
                        </Button>
                        <Link href="/dashboard/mostrador/nuevo-empeno">
                            <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all px-6">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Nuevo Crédito
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Critical Alerts Section */}
                <div className="animate-in-fade-slide delay-100">
                    <Alert variant="destructive" className="border-red-200 bg-red-50/80 dark:bg-red-900/20 text-red-900 dark:text-red-200 [&>svg]:text-red-600 shadow-sm backdrop-blur-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Atención Requerida</AlertTitle>
                        <AlertDescription className="text-red-800 dark:text-red-300">
                            Hay <strong>3 contratos</strong> que vencen hoy y requieren gestión inmediata.
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Financial Position & Risk */}
                <RiskTrafficLight />

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-in-fade-slide delay-200">
                    {/* Charts Section */}
                    <div className="col-span-4 space-y-6">
                        <DashboardCharts />
                    </div>

                    {/* Right Column: Quick Actions & Notifications */}
                    <div className="col-span-3 space-y-6">

                        {/* Timeline Widget */}
                        <ExpirationTimeline />

                        {/* Quick Access */}
                        <Card className="glass-panel border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                    Accesos Directos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <Link href="/dashboard/caja">
                                    <div className="group flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform">
                                                <DollarSign className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">Terminal de Caja</p>
                                                <p className="text-xs text-muted-foreground">Apertura, cierre y movimientos</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>

                                <Link href="/dashboard/inventario">
                                    <div className="group flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                                                <Package className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">Bóveda de Garantías</p>
                                                <p className="text-xs text-muted-foreground">Consultar inventario físico</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
