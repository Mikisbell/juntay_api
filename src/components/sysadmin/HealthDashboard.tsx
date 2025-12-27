'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Activity,
    Server,
    Database,
    Cpu,
    HardDrive,
    Users,
    Clock,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    RefreshCw,
    TrendingUp,
    Wifi
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    obtenerStatusActual,
    obtenerMetricasSalud,
    type CurrentStatus,
    type HealthMetrics,
    type SystemStatus
} from '@/lib/actions/health-actions'

export function HealthDashboard() {
    const [status, setStatus] = useState<CurrentStatus | null>(null)
    const [metrics, setMetrics] = useState<HealthMetrics[]>([])
    const [loading, setLoading] = useState(true)
    const [periodo, setPeriodo] = useState<'1h' | '24h' | '7d'>('24h')

    const cargar = async () => {
        setLoading(true)
        try {
            const [statusResult, metricsResult] = await Promise.all([
                obtenerStatusActual(),
                obtenerMetricasSalud(periodo)
            ])
            setStatus(statusResult)
            setMetrics(metricsResult)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error cargando métricas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
        // Refresh every 30 seconds
        const interval = setInterval(cargar, 30000)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodo])

    const getStatusIcon = (status: SystemStatus) => {
        switch (status) {
            case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-500" />
            case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'critical': return <XCircle className="h-5 w-5 text-red-500" />
        }
    }

    const getStatusColor = (status: SystemStatus) => {
        switch (status) {
            case 'healthy': return 'bg-green-500'
            case 'degraded': return 'bg-yellow-500'
            case 'critical': return 'bg-red-500'
        }
    }

    const getStatusBadge = (status: SystemStatus) => {
        switch (status) {
            case 'healthy': return <Badge className="bg-green-500">Saludable</Badge>
            case 'degraded': return <Badge className="bg-yellow-500">Degradado</Badge>
            case 'critical': return <Badge variant="destructive">Crítico</Badge>
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
        return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
    }

    if (loading && !status) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
                </div>
                <Skeleton className="h-64" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            status?.status === 'healthy' ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                                status?.status === 'degraded' ? "bg-gradient-to-br from-yellow-500 to-orange-500" :
                                    "bg-gradient-to-br from-red-500 to-red-600"
                        )}>
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        Health Dashboard
                        {status && getStatusBadge(status.status)}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoreo en tiempo real del sistema
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="flex border rounded-lg">
                        {(['1h', '24h', '7d'] as const).map(p => (
                            <Button
                                key={p}
                                variant={periodo === p ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setPeriodo(p)}
                                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                    <Button variant="outline" onClick={cargar}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Main Status Card */}
            {status && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={cn(
                        "border-l-4",
                        status.status === 'healthy' ? "border-l-green-500" :
                            status.status === 'degraded' ? "border-l-yellow-500" :
                                "border-l-red-500"
                    )}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center",
                                        status.status === 'healthy' ? "bg-green-100" :
                                            status.status === 'degraded' ? "bg-yellow-100" :
                                                "bg-red-100"
                                    )}>
                                        {status.status === 'healthy' ? (
                                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                                        ) : status.status === 'degraded' ? (
                                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                                        ) : (
                                            <XCircle className="h-8 w-8 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {status.status === 'healthy' ? 'Sistema Operativo' :
                                                status.status === 'degraded' ? 'Rendimiento Degradado' :
                                                    'Sistema Crítico'}
                                        </h2>
                                        <p className="text-muted-foreground">
                                            Última verificación: {new Date(status.lastCheck).toLocaleString('es-PE')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-green-600">
                                        {status.uptime.toFixed(1)}%
                                    </div>
                                    <p className="text-sm text-muted-foreground">Uptime 24h</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Metrics Grid */}
            {status && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <Cpu className="h-5 w-5 text-blue-500" />
                                    <span className="text-xs text-blue-600">API</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-700">{status.apiLatency.toFixed(0)}ms</p>
                                <p className="text-xs text-blue-600">Latencia promedio</p>
                                <Progress value={Math.min(status.apiLatency / 5, 100)} className="mt-2" />
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <Database className="h-5 w-5 text-purple-500" />
                                    <span className="text-xs text-purple-600">Database</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-700">{status.dbLatency.toFixed(0)}ms</p>
                                <p className="text-xs text-purple-600">Latencia promedio</p>
                                <Progress value={Math.min(status.dbLatency / 2, 100)} className="mt-2" />
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <Users className="h-5 w-5 text-green-500" />
                                    <span className="text-xs text-green-600">Usuarios</span>
                                </div>
                                <p className="text-2xl font-bold text-green-700">{status.activeUsers}</p>
                                <p className="text-xs text-green-600">Activos ahora</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card className={cn(
                            "border-0",
                            status.errorRate < 1 ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950" :
                                status.errorRate < 5 ? "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950" :
                                    "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950"
                        )}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <AlertTriangle className={cn(
                                        "h-5 w-5",
                                        status.errorRate < 1 ? "text-emerald-500" :
                                            status.errorRate < 5 ? "text-yellow-500" :
                                                "text-red-500"
                                    )} />
                                    <span className={cn(
                                        "text-xs",
                                        status.errorRate < 1 ? "text-emerald-600" :
                                            status.errorRate < 5 ? "text-yellow-600" :
                                                "text-red-600"
                                    )}>Errores</span>
                                </div>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    status.errorRate < 1 ? "text-emerald-700" :
                                        status.errorRate < 5 ? "text-yellow-700" :
                                            "text-red-700"
                                )}>{status.errorRate.toFixed(2)}%</p>
                                <p className={cn(
                                    "text-xs",
                                    status.errorRate < 1 ? "text-emerald-600" :
                                        status.errorRate < 5 ? "text-yellow-600" :
                                            "text-red-600"
                                )}>Tasa de error</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Components Status */}
            {status && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            Estado de Componentes
                        </CardTitle>
                        <CardDescription>
                            Salud de cada servicio del sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {status.components.map((comp, idx) => (
                                <motion.div
                                    key={comp.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className={cn(
                                        "border-l-4",
                                        comp.status === 'healthy' ? "border-l-green-500" :
                                            comp.status === 'degraded' ? "border-l-yellow-500" :
                                                "border-l-red-500"
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{comp.name}</span>
                                                {getStatusIcon(comp.status)}
                                            </div>
                                            {comp.latency !== undefined && (
                                                <p className="text-sm text-muted-foreground">
                                                    Latencia: {comp.latency.toFixed(0)}ms
                                                </p>
                                            )}
                                            {comp.message && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {comp.message}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Metrics History */}
            {metrics.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Historial de Métricas
                        </CardTitle>
                        <CardDescription>
                            Últimas {metrics.length} mediciones ({periodo})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Simple sparkline representation */}
                            <div className="flex items-end gap-1 h-20">
                                {metrics.slice(-30).map((m, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex-1 rounded-t transition-all",
                                            m.status === 'healthy' ? "bg-green-500" :
                                                m.status === 'degraded' ? "bg-yellow-500" :
                                                    "bg-red-500"
                                        )}
                                        style={{
                                            height: `${Math.max(20, 100 - (m.api_latency_avg || 0) / 2)}%`
                                        }}
                                        title={`${new Date(m.timestamp).toLocaleString()}: ${m.api_latency_avg?.toFixed(0)}ms`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{metrics.length > 0 && new Date(metrics[0].timestamp).toLocaleString('es-PE')}</span>
                                <span>{metrics.length > 0 && new Date(metrics[metrics.length - 1].timestamp).toLocaleString('es-PE')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Legend */}
            <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Saludable</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Degradado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Crítico</span>
                </div>
            </div>
        </div>
    )
}
