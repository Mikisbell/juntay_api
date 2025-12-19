'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { obtenerHistorialMensajesCliente, type MensajeHistorial } from '@/lib/actions/whatsapp-actions'

interface HistorialMensajesClienteProps {
    clienteId: string
    nombreCliente?: string
}

/**
 * Muestra el historial de mensajes WhatsApp enviados a un cliente
 */
export function HistorialMensajesCliente({ clienteId, nombreCliente }: HistorialMensajesClienteProps) {
    const [mensajes, setMensajes] = useState<MensajeHistorial[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function cargarHistorial() {
            if (!clienteId) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const data = await obtenerHistorialMensajesCliente(clienteId)
                setMensajes(data)
                setError(null)
            } catch (err) {
                console.error('Error cargando historial:', err)
                setError('Error al cargar el historial de mensajes')
            } finally {
                setLoading(false)
            }
        }

        cargarHistorial()
    }, [clienteId])

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getTipoLabel = (tipo: string) => {
        const tipos: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            'vencimiento_hoy': { label: 'Vence Hoy', variant: 'destructive' },
            'vencimiento_proximo': { label: 'Próximo Vencimiento', variant: 'secondary' },
            'cobranza': { label: 'Cobranza', variant: 'default' },
            'verificacion': { label: 'Verificación', variant: 'outline' }
        }
        return tipos[tipo] || { label: tipo, variant: 'outline' as const }
    }

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case 'enviado':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'pendiente':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'fallido':
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <MessageSquare className="h-4 w-4 text-muted-foreground" />
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Cargando historial...</span>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-red-500">
                    {error}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Historial de Mensajes
                    {nombreCliente && <span className="text-muted-foreground font-normal">- {nombreCliente}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {mensajes.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No hay mensajes enviados a este cliente</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mensajes.map((msg) => {
                            const tipoInfo = getTipoLabel(msg.tipo_notificacion)
                            return (
                                <div
                                    key={msg.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            {getEstadoIcon(msg.estado)}
                                            <Badge variant={tipoInfo.variant}>
                                                {tipoInfo.label}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {msg.medio.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatFecha(msg.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                                        {msg.mensaje}
                                    </p>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        📱 {msg.telefono_destino}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
