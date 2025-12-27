'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Bell,
    AlertTriangle,
    CheckCircle2,
    Eye,
    X,
    Filter,
    RefreshCw,
    Building2,
    Clock,
    ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    listarAlertas,
    obtenerConteoAlertas,
    marcarAlertaVista,
    resolverAlerta,
    ignorarAlerta,
    type AlertaSistema,
    type AlertState,
    type AlertSeverity
} from '@/lib/actions/alertas-actions'
import {
    ALERT_TYPE_LABELS,
    type AlertType
} from '@/lib/constants/alert-constants'

export function AlertsCenter() {
    const [alertas, setAlertas] = useState<AlertaSistema[]>([])
    const [loading, setLoading] = useState(true)
    const [conteo, setConteo] = useState({ activas: 0, criticas: 0, vistas: 0, total: 0 })

    // Filters
    const [estadoFilter, setEstadoFilter] = useState<AlertState | ''>('')
    const [tipoFilter, setTipoFilter] = useState<AlertType | ''>('')

    // Resolve dialog
    const [resolveDialog, setResolveDialog] = useState<AlertaSistema | null>(null)
    const [resolveNotes, setResolveNotes] = useState('')

    const cargar = async () => {
        setLoading(true)
        try {
            const [alertasResult, conteoResult] = await Promise.all([
                listarAlertas({
                    estado: estadoFilter || undefined,
                    tipo: tipoFilter || undefined,
                    limit: 50
                }),
                obtenerConteoAlertas()
            ])
            setAlertas(alertasResult)
            setConteo(conteoResult)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error cargando alertas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estadoFilter, tipoFilter])

    const handleMarkViewed = async (alerta: AlertaSistema) => {
        await marcarAlertaVista(alerta.id)
        toast.success('Alerta marcada como vista')
        cargar()
    }

    const handleResolve = async () => {
        if (!resolveDialog) return
        await resolverAlerta(resolveDialog.id, resolveNotes)
        toast.success('Alerta resuelta')
        setResolveDialog(null)
        setResolveNotes('')
        cargar()
    }

    const handleIgnore = async (alerta: AlertaSistema) => {
        await ignorarAlerta(alerta.id)
        toast.success('Alerta ignorada')
        cargar()
    }

    const getSeverityStyles = (severity: AlertSeverity) => {
        switch (severity) {
            case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
            case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
            default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
        }
    }

    const getEstadoBadge = (estado: AlertState) => {
        switch (estado) {
            case 'activa': return <Badge className="bg-red-500">Activa</Badge>
            case 'vista': return <Badge className="bg-yellow-500">Vista</Badge>
            case 'resuelta': return <Badge className="bg-green-500">Resuelta</Badge>
            case 'ignorada': return <Badge variant="secondary">Ignorada</Badge>
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                            <Bell className="h-6 w-6 text-white" />
                        </div>
                        Centro de Alertas
                        {conteo.criticas > 0 && (
                            <Badge variant="destructive" className="animate-pulse">
                                {conteo.criticas} críticas
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoreo y gestión de alertas del sistema
                    </p>
                </div>
                <Button onClick={cargar}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950">
                        <CardContent className="p-4 text-center">
                            <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                            <p className="text-3xl font-bold text-red-700">{conteo.activas}</p>
                            <p className="text-sm text-red-600">Activas</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950">
                        <CardContent className="p-4 text-center">
                            <Bell className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                            <p className="text-3xl font-bold text-orange-700">{conteo.criticas}</p>
                            <p className="text-sm text-orange-600">Críticas</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950">
                        <CardContent className="p-4 text-center">
                            <Eye className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                            <p className="text-3xl font-bold text-yellow-700">{conteo.vistas}</p>
                            <p className="text-sm text-yellow-600">Vistas</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950">
                        <CardContent className="p-4 text-center">
                            <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <p className="text-3xl font-bold text-green-700">{conteo.total}</p>
                            <p className="text-sm text-green-600">Total</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <Select value={estadoFilter || 'all'} onValueChange={v => setEstadoFilter(v === 'all' ? '' : v as AlertState)}>
                    <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="activa">Activas</SelectItem>
                        <SelectItem value="vista">Vistas</SelectItem>
                        <SelectItem value="resuelta">Resueltas</SelectItem>
                        <SelectItem value="ignorada">Ignoradas</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={tipoFilter || 'all'} onValueChange={v => setTipoFilter(v === 'all' ? '' : v as AlertType)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {Object.entries(ALERT_TYPE_LABELS).map(([key, val]) => (
                            <SelectItem key={key} value={key}>
                                {val.icon} {val.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Alerts List */}
            <Card>
                <CardHeader>
                    <CardTitle>Alertas</CardTitle>
                    <CardDescription>
                        {alertas.length} alertas encontradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {alertas.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                            <p className="text-lg font-medium">¡Sin alertas!</p>
                            <p className="text-muted-foreground">El sistema está funcionando correctamente</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alertas.map((alerta, idx) => (
                                <motion.div
                                    key={alerta.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                    <Card className={cn(
                                        "border-l-4 transition-all hover:shadow-md",
                                        getSeverityStyles(alerta.severidad)
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-lg">
                                                            {ALERT_TYPE_LABELS[alerta.tipo]?.icon || '⚠️'}
                                                        </span>
                                                        <span className="font-bold">{alerta.titulo}</span>
                                                        {getEstadoBadge(alerta.estado)}
                                                        <Badge variant="outline">
                                                            {ALERT_TYPE_LABELS[alerta.tipo]?.label || alerta.tipo}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {alerta.mensaje}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        {alerta.empresa && (
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="h-3 w-3" />
                                                                {alerta.empresa.nombre_comercial}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(alerta.created_at).toLocaleString('es-PE')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {alerta.accion_url && (
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={alerta.accion_url}>
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {alerta.estado === 'activa' && (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={() => handleMarkViewed(alerta)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => setResolveDialog(alerta)}>
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" onClick={() => handleIgnore(alerta)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resolve Dialog */}
            <Dialog open={!!resolveDialog} onOpenChange={() => setResolveDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolver Alerta</DialogTitle>
                        <DialogDescription>
                            Marca esta alerta como resuelta y añade notas opcionales.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Notas de resolución (opcional)..."
                        value={resolveNotes}
                        onChange={e => setResolveNotes(e.target.value)}
                        rows={3}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResolveDialog(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleResolve} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Resolver
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
