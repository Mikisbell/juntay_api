'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    Shield,
    RefreshCw,
    CreditCard,
    FileText,
    Bell,
    Wallet,
    Calendar,
    Filter,
    Hash,
    Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    obtenerAuditoria,
    verificarHashRecibo,
    type AuditoriaResumen,
    type EventoAuditoria,
    type TipoEvento
} from '@/lib/actions/auditoria-actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

/**
 * Panel de Auditoría - Admin
 */
export function AuditoriaPanel() {
    const [data, setData] = useState<AuditoriaResumen | null>(null)
    const [loading, setLoading] = useState(true)
    const [tipoFiltro, setTipoFiltro] = useState<TipoEvento | 'todos'>('todos')
    const [hashBusqueda, setHashBusqueda] = useState('')
    const [buscandoHash, setBuscandoHash] = useState(false)

    const cargarAuditoria = useCallback(async () => {
        setLoading(true)
        try {
            const auditoria = await obtenerAuditoria({
                tipo: tipoFiltro === 'todos' ? undefined : tipoFiltro
            })
            setData(auditoria)
        } catch (err) {
            console.error('Error cargando auditoría:', err)
        } finally {
            setLoading(false)
        }
    }, [tipoFiltro])

    useEffect(() => {
        cargarAuditoria()
    }, [cargarAuditoria])

    const buscarPorHash = async () => {
        if (!hashBusqueda || hashBusqueda.length < 10) {
            toast.error('Hash inválido', { description: 'Ingresa un hash válido' })
            return
        }

        setBuscandoHash(true)
        try {
            const resultado = await verificarHashRecibo(hashBusqueda)
            if (resultado.valido && resultado.recibo) {
                toast.success('Hash verificado', {
                    description: `Recibo encontrado: ${resultado.recibo.descripcion}`
                })
            } else {
                toast.error('Hash no encontrado', {
                    description: 'No existe recibo con este hash'
                })
            }
        } catch {
            toast.error('Error verificando hash')
        } finally {
            setBuscandoHash(false)
        }
    }

    const getTipoIcon = (tipo: TipoEvento) => {
        switch (tipo) {
            case 'pago': return <CreditCard className="h-4 w-4" />
            case 'recibo': return <FileText className="h-4 w-4" />
            case 'notificacion': return <Bell className="h-4 w-4" />
            case 'caja': return <Wallet className="h-4 w-4" />
            default: return <Shield className="h-4 w-4" />
        }
    }

    const getTipoColor = (tipo: TipoEvento) => {
        switch (tipo) {
            case 'pago': return 'bg-green-500/20 text-green-600'
            case 'recibo': return 'bg-blue-500/20 text-blue-600'
            case 'notificacion': return 'bg-yellow-500/20 text-yellow-600'
            case 'caja': return 'bg-purple-500/20 text-purple-600'
            default: return 'bg-gray-500/20 text-gray-600'
        }
    }

    if (loading && !data) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Auditoría
                        {data && <Badge variant="secondary">{data.total} eventos</Badge>}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={cargarAuditoria} disabled={loading}>
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                    </Button>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mt-3">
                    <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as TipoEvento | 'todos')}>
                        <SelectTrigger className="w-40">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pago">Pagos</SelectItem>
                            <SelectItem value="recibo">Recibos</SelectItem>
                            <SelectItem value="notificacion">Notificaciones</SelectItem>
                            <SelectItem value="caja">Caja</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-1 flex-1 max-w-xs">
                        <Input
                            placeholder="Verificar hash..."
                            value={hashBusqueda}
                            onChange={(e) => setHashBusqueda(e.target.value)}
                            className="text-xs"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={buscarPorHash}
                            disabled={buscandoHash}
                        >
                            {buscandoHash ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {!data || data.eventos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay eventos en el período seleccionado</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {data.eventos.map((evento: EventoAuditoria) => (
                            <div
                                key={evento.id}
                                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn('p-2 rounded-full', getTipoColor(evento.tipo))}>
                                        {getTipoIcon(evento.tipo)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm truncate">
                                                {evento.descripcion}
                                            </span>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {evento.tipo}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(evento.fecha).toLocaleString('es-PE')}
                                            </span>
                                            {evento.hash && (
                                                <span className="flex items-center gap-1 font-mono">
                                                    <Hash className="h-3 w-3" />
                                                    {evento.hash.substring(0, 12)}...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {data && (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Mostrando {data.eventos.length} de {data.total} eventos
                        ({data.filtros.fechaDesde} a {data.filtros.fechaHasta})
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
