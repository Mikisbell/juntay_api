'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    UserCheck,
    AlertTriangle,
    FileWarning,
    GraduationCap,
    CheckCircle2,
    XCircle,
    Clock,
    Building2,
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Plus,
    RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    obtenerEstadisticasCumplimiento,
    listarReportesROS,
    obtenerUmbrales,
    type OficialCumplimiento,
    type ReporteOperacionSospechosa,
    type UmbralOperacion
} from '@/lib/actions/compliance-actions'
import { ROSReportPDF } from '@/components/reportes/ROSReportPDF'
import { ComplianceSummaryPDF } from '@/components/reportes/ComplianceSummaryPDF'

interface Props {
    empresaId?: string // If provided, show tenant view; otherwise, global view
}

export function ComplianceDashboard({ empresaId }: Props) {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<{
        oficial: OficialCumplimiento | null
        rosStats: { total: number; borradores: number; enviados: number }
        kycStats: { total: number; verificados: number; pendientes: number; altoRiesgo: number }
        capacitacionesVencidas: number
        reportesPendientes: number
    } | null>(null)
    const [reportesROS, setReportesROS] = useState<ReporteOperacionSospechosa[]>([])
    const [umbrales, setUmbrales] = useState<UmbralOperacion[]>([])

    const cargar = async () => {
        setLoading(true)
        try {
            const [statsData, rosData, umbralesData] = await Promise.all([
                obtenerEstadisticasCumplimiento(empresaId),
                listarReportesROS(empresaId),
                obtenerUmbrales(empresaId)
            ])
            setStats(statsData)
            setReportesROS(rosData)
            setUmbrales(umbralesData)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error cargando datos de cumplimiento')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empresaId])

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        Cumplimiento SBS/UIF
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Resolución SBS N° 00650-2024 | Ley N.º 27693
                    </p>
                </div>
                <div className="flex gap-2">
                    <ROSReportPDF empresaId={empresaId} />
                    {empresaId && <ComplianceSummaryPDF empresaId={empresaId} />}
                    <Button variant="outline" onClick={cargar}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Oficial de Cumplimiento Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={cn(
                    "border-l-4",
                    stats?.oficial ? "border-l-green-500" : "border-l-red-500"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    stats?.oficial ? "bg-green-100" : "bg-red-100"
                                )}>
                                    {stats?.oficial ? (
                                        <UserCheck className="h-8 w-8 text-green-600" />
                                    ) : (
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {stats?.oficial ? 'Oficial de Cumplimiento Designado' : '⚠️ Sin Oficial de Cumplimiento'}
                                    </h2>
                                    {stats?.oficial ? (
                                        <div className="text-muted-foreground space-y-1">
                                            <p className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {stats.oficial.nombres} {stats.oficial.apellidos}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                {stats.oficial.email}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-red-600 font-medium">
                                            Requerido por SBS antes de operar
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                {stats?.oficial?.registrado_uif ? (
                                    <Badge className="bg-green-500">Registrado UIF</Badge>
                                ) : (
                                    <Badge variant="destructive">Pendiente UIF</Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <FileWarning className="h-5 w-5 text-amber-500" />
                                <span className="text-xs text-amber-600">ROS</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-700">{stats?.rosStats.total || 0}</p>
                            <p className="text-xs text-amber-600">Reportes totales</p>
                            {stats?.rosStats.borradores ? (
                                <Badge variant="outline" className="mt-2 text-amber-700 border-amber-300">
                                    {stats.rosStats.borradores} borradores
                                </Badge>
                            ) : null}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <UserCheck className="h-5 w-5 text-blue-500" />
                                <span className="text-xs text-blue-600">KYC</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{stats?.kycStats.verificados || 0}</p>
                            <p className="text-xs text-blue-600">Verificados</p>
                            {stats?.kycStats.pendientes ? (
                                <Badge variant="outline" className="mt-2 text-blue-700 border-blue-300">
                                    {stats.kycStats.pendientes} pendientes
                                </Badge>
                            ) : null}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className={cn(
                        "border-0",
                        stats?.kycStats.altoRiesgo ? "bg-gradient-to-br from-red-50 to-red-100" : "bg-gradient-to-br from-green-50 to-green-100"
                    )}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <AlertTriangle className={cn(
                                    "h-5 w-5",
                                    stats?.kycStats.altoRiesgo ? "text-red-500" : "text-green-500"
                                )} />
                                <span className={cn(
                                    "text-xs",
                                    stats?.kycStats.altoRiesgo ? "text-red-600" : "text-green-600"
                                )}>Riesgo</span>
                            </div>
                            <p className={cn(
                                "text-2xl font-bold",
                                stats?.kycStats.altoRiesgo ? "text-red-700" : "text-green-700"
                            )}>{stats?.kycStats.altoRiesgo || 0}</p>
                            <p className={cn(
                                "text-xs",
                                stats?.kycStats.altoRiesgo ? "text-red-600" : "text-green-600"
                            )}>Alto riesgo / PEP</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <GraduationCap className="h-5 w-5 text-purple-500" />
                                <span className="text-xs text-purple-600">PLAFT</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-700">
                                {stats?.oficial?.horas_capacitacion || 0}h
                            </p>
                            <p className="text-xs text-purple-600">Capacitación acumulada</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs Content */}
            <Tabs defaultValue="ros" className="w-full">
                <TabsList>
                    <TabsTrigger value="ros">
                        <FileWarning className="h-4 w-4 mr-2" />
                        Reportes ROS
                    </TabsTrigger>
                    <TabsTrigger value="umbrales">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Umbrales
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ros" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Reportes de Operación Sospechosa</CardTitle>
                                    <CardDescription>
                                        Reportes para UIF-Perú según Ley N.º 27693
                                    </CardDescription>
                                </div>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo ROS
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {reportesROS.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay reportes ROS registrados</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reportesROS.map(ros => (
                                        <Card key={ros.id} className="border-l-4 border-l-amber-400">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{ros.numero_reporte}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {ros.cliente_nombre} - S/{ros.monto.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {ros.motivo_sospecha.substring(0, 100)}...
                                                        </p>
                                                    </div>
                                                    <Badge variant={
                                                        ros.estado === 'borrador' ? 'outline' :
                                                            ros.estado === 'enviado' ? 'default' :
                                                                ros.estado === 'confirmado' ? 'default' : 'secondary'
                                                    } className={
                                                        ros.estado === 'confirmado' ? 'bg-green-500' : ''
                                                    }>
                                                        {ros.estado}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="umbrales" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Umbrales de Operación</CardTitle>
                            <CardDescription>
                                Configuración de alertas automáticas por monto
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {umbrales.map(umbral => (
                                    <Card key={umbral.id} className={cn(
                                        "border-l-4",
                                        umbral.accion === 'ros_automatico' ? "border-l-red-500" :
                                            umbral.accion === 'alerta' ? "border-l-amber-500" :
                                                "border-l-blue-500"
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{umbral.nombre}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Tipo: {umbral.tipo_operacion} |
                                                        Umbral: {umbral.moneda} {umbral.monto_umbral.toLocaleString()}
                                                    </p>
                                                </div>
                                                <Badge variant={
                                                    umbral.accion === 'ros_automatico' ? 'destructive' :
                                                        umbral.accion === 'alerta' ? 'default' : 'secondary'
                                                }>
                                                    {umbral.accion.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
