'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    Search,
    Filter,
    Download,
    User,
    Building2,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Info,
    RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    listarAuditLogs,
    obtenerResumenAuditoria,
    type AuditLog
} from '@/lib/actions/audit-actions'

export function AuditLogViewer() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [resumen, setResumen] = useState<{
        totalAcciones: number
        accionesPorCategoria: Record<string, number>
        topAcciones: Array<{ action: string; count: number }>
    } | null>(null)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('')
    const [severityFilter, setSeverityFilter] = useState<string>('')

    const cargar = async () => {
        setLoading(true)
        try {
            const [logsResult, resumenResult] = await Promise.all([
                listarAuditLogs({
                    category: categoryFilter || undefined,
                    severity: severityFilter || undefined,
                    limit: 100
                }),
                obtenerResumenAuditoria('7d')
            ])
            setLogs(logsResult.logs)
            setTotal(logsResult.total)
            setResumen(resumenResult)
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error cargando logs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFilter, severityFilter])

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical': return <Badge variant="destructive">Crítico</Badge>
            case 'warning': return <Badge className="bg-yellow-500">Advertencia</Badge>
            default: return <Badge variant="secondary">Info</Badge>
        }
    }

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            auth: 'bg-purple-100 text-purple-700',
            financial: 'bg-green-100 text-green-700',
            config: 'bg-blue-100 text-blue-700',
            general: 'bg-gray-100 text-gray-700'
        }
        return <Badge className={colors[category] || colors.general}>{category}</Badge>
    }

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                        <div className="p-2 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        Audit Logs
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Registro completo de actividad del sistema
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={cargar}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Stats */}
            {resumen && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950">
                            <CardContent className="p-4">
                                <p className="text-sm text-blue-600">Acciones (7 días)</p>
                                <p className="text-3xl font-bold text-blue-700">{resumen.totalAcciones}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    {Object.entries(resumen.accionesPorCategoria).slice(0, 3).map(([cat, count], idx) => (
                        <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (idx + 1) * 0.1 }}>
                            <Card className="border-0 bg-muted/50">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground capitalize">{cat}</p>
                                    <p className="text-2xl font-bold">{count}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por acción, usuario, entidad..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-[150px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="auth">Auth</SelectItem>
                                <SelectItem value="financial">Financiero</SelectItem>
                                <SelectItem value="config">Config</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={severityFilter || 'all'} onValueChange={(v) => setSeverityFilter(v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Severidad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Registros
                        <Badge variant="secondary" className="ml-2">{total}</Badge>
                    </CardTitle>
                    <CardDescription>
                        Mostrando {filteredLogs.length} de {total} registros
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {filteredLogs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No hay logs que mostrar</p>
                            </div>
                        ) : (
                            filteredLogs.map((log, idx) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className={cn(
                                        "p-3 rounded-lg border flex items-start gap-3 hover:bg-muted/50 transition-colors",
                                        log.severity === 'critical' && "border-l-4 border-l-red-500",
                                        log.severity === 'warning' && "border-l-4 border-l-yellow-500"
                                    )}
                                >
                                    {getSeverityIcon(log.severity)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-sm font-medium">{log.action}</span>
                                            {getCategoryBadge(log.category)}
                                            {getSeverityBadge(log.severity)}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {log.user_email || 'Sistema'}
                                            </span>
                                            {log.empresa_id && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {log.empresa_id.substring(0, 8)}...
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(log.timestamp).toLocaleString('es-PE')}
                                            </span>
                                        </div>
                                        {log.entity_type && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Entidad: {log.entity_type} {log.entity_id && `(${log.entity_id.substring(0, 8)}...)`}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
