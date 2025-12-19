'use client'

import { useEffect, useState, useCallback } from 'react'
import { FileText, Send, Download, Loader2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    obtenerHistorialRecibos,
    descargarReciboPDF,
    reenviarReciboWhatsApp,
    type ReciboHistorial
} from '@/lib/actions/recibos-historial-actions'
import { generarReciboPDF } from '@/lib/utils/recibo-pdf'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface HistorialRecibosClienteProps {
    clienteId: string
    clienteNombre?: string
}

/**
 * Componente para mostrar el historial de recibos de un cliente
 * 
 * Permite:
 * - Ver todos los recibos emitidos
 * - Descargar PDF nuevamente  
 * - Reenviar por WhatsApp
 */
export function HistorialRecibosCliente({ clienteId, clienteNombre }: HistorialRecibosClienteProps) {
    const [recibos, setRecibos] = useState<ReciboHistorial[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const cargarHistorial = useCallback(async () => {
        if (!clienteId) return

        setLoading(true)
        try {
            const data = await obtenerHistorialRecibos(clienteId)
            setRecibos(data)
        } catch (error) {
            console.error('Error cargando historial:', error)
            toast.error('Error al cargar historial de recibos')
        } finally {
            setLoading(false)
        }
    }, [clienteId])

    useEffect(() => {
        cargarHistorial()
    }, [cargarHistorial])

    const handleDescargarPDF = async (recibo: ReciboHistorial) => {
        setActionLoading(`pdf-${recibo.id}`)
        try {
            const resultado = await descargarReciboPDF(recibo.id)

            if (resultado.success && resultado.datos) {
                generarReciboPDF(resultado.datos)
                toast.success('PDF descargado', {
                    description: `Recibo ${recibo.numeroRecibo}`
                })
            } else {
                toast.error('Error al descargar', {
                    description: resultado.error
                })
            }
        } catch (error) {
            console.error('Error descargando PDF:', error)
            toast.error('Error al descargar PDF')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReenviarWhatsApp = async (recibo: ReciboHistorial) => {
        if (!recibo.telefono) {
            toast.error('Sin teléfono', {
                description: 'Este recibo no tiene teléfono asociado'
            })
            return
        }

        setActionLoading(`wa-${recibo.id}`)
        try {
            const resultado = await reenviarReciboWhatsApp(recibo.id)

            if (resultado.success) {
                toast.success('Recibo reenviado', {
                    description: `Nuevo recibo: ${resultado.nuevoNumeroRecibo}`
                })
                // Recargar historial para mostrar el nuevo envío
                await cargarHistorial()
            } else {
                toast.error('Error al reenviar', {
                    description: resultado.error
                })
            }
        } catch (error) {
            console.error('Error reenviando:', error)
            toast.error('Error al reenviar por WhatsApp')
        } finally {
            setActionLoading(null)
        }
    }

    const getEstadoBadge = (estado: ReciboHistorial['estado']) => {
        switch (estado) {
            case 'enviado':
                return (
                    <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enviado
                    </Badge>
                )
            case 'error':
                return (
                    <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Error
                    </Badge>
                )
            default:
                return (
                    <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendiente
                    </Badge>
                )
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Historial de Recibos
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Historial de Recibos
                        {clienteNombre && (
                            <span className="text-muted-foreground font-normal text-sm">
                                - {clienteNombre}
                            </span>
                        )}
                        {recibos.length > 0 && (
                            <Badge variant="secondary">{recibos.length}</Badge>
                        )}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={cargarHistorial}
                        disabled={loading}
                    >
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {recibos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay recibos emitidos para este cliente</p>
                        <p className="text-xs mt-1">Los recibos enviados por WhatsApp aparecerán aquí</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>N° Recibo</TableHead>
                                    <TableHead>Crédito</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recibos.map(recibo => (
                                    <TableRow key={recibo.id}>
                                        <TableCell className="text-sm">
                                            {recibo.fecha}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {recibo.numeroRecibo}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {recibo.codigoCredito}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {recibo.montoFormateado}
                                        </TableCell>
                                        <TableCell>
                                            {getEstadoBadge(recibo.estado)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleDescargarPDF(recibo)}
                                                    disabled={actionLoading === `pdf-${recibo.id}`}
                                                    title="Descargar PDF"
                                                >
                                                    {actionLoading === `pdf-${recibo.id}` ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Download className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleReenviarWhatsApp(recibo)}
                                                    disabled={actionLoading === `wa-${recibo.id}` || !recibo.telefono}
                                                    title={recibo.telefono ? `Reenviar a ${recibo.telefono}` : 'Sin teléfono'}
                                                >
                                                    {actionLoading === `wa-${recibo.id}` ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Send className="h-4 w-4 text-green-600" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
