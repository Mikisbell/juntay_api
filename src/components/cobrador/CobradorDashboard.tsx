'use client'

import { useEffect, useState } from 'react'
import {
    MapPin,
    Phone,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Navigation,
    DollarSign,
    RefreshCw,
    User,
    ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
    obtenerCobrosDelDia,
    obtenerResumenCobrador,
    registrarVisita,
    registrarUbicacionCobrador,
    type CobroDelDia,
    type ResumenCobrador
} from '@/lib/actions/cobrador-movil-actions'
import { cn } from '@/lib/utils'

interface CobradorDashboardProps {
    cobradorId: string
    cobradorNombre: string
}

/**
 * Dashboard Principal del Cobrador Móvil
 */
export function CobradorDashboard({ cobradorId, cobradorNombre }: CobradorDashboardProps) {
    const [cobros, setCobros] = useState<CobroDelDia[]>([])
    const [resumen, setResumen] = useState<ResumenCobrador | null>(null)
    const [loading, setLoading] = useState(true)
    const [cobroActivo, setCobroActivo] = useState<CobroDelDia | null>(null)
    const [montoCobro, setMontoCobro] = useState('')
    const [registrando, setRegistrando] = useState(false)

    const cargarDatos = async () => {
        setLoading(true)
        try {
            const [cobrosData, resumenData] = await Promise.all([
                obtenerCobrosDelDia(cobradorId),
                obtenerResumenCobrador(cobradorId)
            ])
            setCobros(cobrosData)
            setResumen(resumenData)

            // Registrar ubicación
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        registrarUbicacionCobrador(cobradorId, {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        })
                    },
                    (err) => console.log('Geo error:', err)
                )
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error cargando datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const cargar = async () => {
            setLoading(true)
            try {
                const [cobrosData, resumenData] = await Promise.all([
                    obtenerCobrosDelDia(cobradorId),
                    obtenerResumenCobrador(cobradorId)
                ])
                setCobros(cobrosData)
                setResumen(resumenData)

                // Registrar ubicación
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            registrarUbicacionCobrador(cobradorId, {
                                lat: pos.coords.latitude,
                                lng: pos.coords.longitude
                            })
                        },
                        (err) => console.log('Geo error:', err)
                    )
                }
            } catch (err) {
                console.error('Error:', err)
                toast.error('Error cargando datos')
            } finally {
                setLoading(false)
            }
        }
        cargar()
        // Actualizar ubicación cada 5 minutos
        const interval = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        registrarUbicacionCobrador(cobradorId, {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        })
                    }
                )
            }
        }, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [cobradorId])

    const handleRegistrarCobro = async (resultado: 'cobrado' | 'promesa_pago' | 'no_encontrado') => {
        if (!cobroActivo) return

        setRegistrando(true)
        try {
            let ubicacion: { lat: number; lng: number } | undefined

            // Obtener ubicación actual
            if (navigator.geolocation) {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                }).catch(() => null)

                if (pos) {
                    ubicacion = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                }
            }

            const result = await registrarVisita(cobradorId, {
                creditoId: cobroActivo.creditoId,
                resultado,
                montoCobrado: resultado === 'cobrado' ? parseFloat(montoCobro) || 0 : undefined,
                ubicacion
            })

            if (result.success) {
                toast.success(
                    resultado === 'cobrado' ? '¡Cobro registrado!' : 'Visita registrada',
                    { description: cobroActivo.clienteNombre }
                )
                setCobroActivo(null)
                setMontoCobro('')
                cargarDatos()
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error registrando')
        } finally {
            setRegistrando(false)
        }
    }

    const formatMoney = (n: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

    const getEstadoBadge = (estado: CobroDelDia['estado']) => {
        switch (estado) {
            case 'cobrado':
                return <Badge className="bg-green-500">Cobrado</Badge>
            case 'visitado':
                return <Badge className="bg-blue-500">Visitado</Badge>
            case 'no_encontrado':
                return <Badge className="bg-orange-500">No encontrado</Badge>
            default:
                return <Badge variant="outline">Pendiente</Badge>
        }
    }

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <div className="animate-pulse h-24 bg-muted rounded-lg" />
                <div className="animate-pulse h-64 bg-muted rounded-lg" />
            </div>
        )
    }

    // Vista de cobro activo
    if (cobroActivo) {
        return (
            <div className="min-h-screen bg-background p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {cobroActivo.clienteNombre}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">Código:</span>
                                <div className="font-mono">{cobroActivo.codigoCredito}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Cuota:</span>
                                <div className="font-bold">{formatMoney(cobroActivo.montoCuota)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Vencido:</span>
                                <div className="font-bold text-red-600">{formatMoney(cobroActivo.montoVencido)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Días mora:</span>
                                <div className="font-bold text-red-600">{cobroActivo.diasVencido}</div>
                            </div>
                        </div>

                        {cobroActivo.clienteDireccion && (
                            <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <span className="text-sm">{cobroActivo.clienteDireccion}</span>
                            </div>
                        )}

                        {/* Acciones rápidas */}
                        <div className="flex gap-2">
                            {cobroActivo.clienteTelefono && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`tel:${cobroActivo.clienteTelefono}`}>
                                        <Phone className="h-4 w-4 mr-1" />
                                        Llamar
                                    </a>
                                </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(cobroActivo.clienteDireccion || '')}`}
                                    target="_blank"
                                >
                                    <Navigation className="h-4 w-4 mr-1" />
                                    Navegar
                                </a>
                            </Button>
                        </div>

                        {/* Monto a cobrar */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Monto a cobrar</label>
                            <Input
                                type="number"
                                placeholder={`Sugerido: ${formatMoney(cobroActivo.montoCuota)}`}
                                value={montoCobro}
                                onChange={(e) => setMontoCobro(e.target.value)}
                            />
                        </div>

                        {/* Botones de resultado */}
                        <div className="grid grid-cols-1 gap-2">
                            <Button
                                size="lg"
                                onClick={() => handleRegistrarCobro('cobrado')}
                                disabled={registrando || !montoCobro}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {registrando ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Registrar Cobro
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleRegistrarCobro('promesa_pago')}
                                disabled={registrando}
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Promesa de Pago
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleRegistrarCobro('no_encontrado')}
                                disabled={registrando}
                                className="text-orange-600"
                            >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                No Encontrado
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setCobroActivo(null)}
                        >
                            Volver a la lista
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Vista principal
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm opacity-80">Hola,</div>
                        <div className="font-bold">{cobradorNombre}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={cargarDatos}>
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Resumen */}
            {resumen && (
                <div className="grid grid-cols-2 gap-3 p-4">
                    <Card className="bg-green-50">
                        <CardContent className="p-3 text-center">
                            <DollarSign className="h-6 w-6 mx-auto text-green-600 mb-1" />
                            <div className="text-xl font-bold text-green-700">
                                {formatMoney(resumen.montoCobrado)}
                            </div>
                            <div className="text-xs text-green-600">Cobrado hoy</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                        <CardContent className="p-3 text-center">
                            <User className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                            <div className="text-xl font-bold text-blue-700">
                                {resumen.clientesPendientes}
                            </div>
                            <div className="text-xs text-blue-600">Pendientes</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Lista de cobros */}
            <div className="p-4 space-y-3">
                <h2 className="font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cobros del Día ({cobros.length})
                </h2>

                {cobros.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                        <p>¡Sin cobros pendientes!</p>
                    </Card>
                ) : (
                    cobros.map((cobro) => (
                        <Card
                            key={cobro.creditoId}
                            className={cn(
                                'cursor-pointer transition-colors hover:bg-muted/50',
                                cobro.estado === 'cobrado' && 'opacity-50'
                            )}
                            onClick={() => cobro.estado !== 'cobrado' && setCobroActivo(cobro)}
                        >
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                            {cobro.clienteNombre}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {cobro.codigoCredito}
                                        </div>
                                        {cobro.diasVencido > 0 && (
                                            <div className="text-xs text-red-600">
                                                {cobro.diasVencido} días vencido
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{formatMoney(cobro.montoCuota)}</div>
                                        {getEstadoBadge(cobro.estado)}
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
