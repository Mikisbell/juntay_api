'use client'

import { useState, useEffect } from 'react'
import {
    QrCode,
    Smartphone,
    Check,
    RefreshCw,
    Copy,
    CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
    generarDatosCobroQR,
    confirmarPagoDigital,
    obtenerConfigPagosDigitales,
    type DatosCobroQR
} from '@/lib/actions/pagos-digitales-actions'
import { cn } from '@/lib/utils'

interface CobroQRProps {
    creditoId: string
    monto: number
    onPagoConfirmado?: (pagoId: string) => void
    usuarioId: string
}

/**
 * Componente de Cobro con QR Yape/Plin
 */
export function CobroQRYapePlin({
    creditoId,
    monto,
    onPagoConfirmado,
    usuarioId
}: CobroQRProps) {
    const [datos, setDatos] = useState<DatosCobroQR | null>(null)
    const [loading, setLoading] = useState(true)
    const [confirmando, setConfirmando] = useState(false)
    const [confirmado, setConfirmado] = useState(false)
    const [metodoSeleccionado, setMetodoSeleccionado] = useState<'yape' | 'plin'>('yape')
    const [referencia, setReferencia] = useState('')
    const [config, setConfig] = useState<{
        numeroYape: string | null
        numeroPlin: string | null
        nombreTitular: string | null
    } | null>(null)

    useEffect(() => {
        const cargar = async () => {
            setLoading(true)
            try {
                const [resultado, configData] = await Promise.all([
                    generarDatosCobroQR(creditoId, monto),
                    obtenerConfigPagosDigitales()
                ])
                if (resultado.success && resultado.datos) {
                    setDatos(resultado.datos)
                }
                setConfig(configData)
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [creditoId, monto])

    const confirmarPago = async () => {
        setConfirmando(true)
        try {
            const resultado = await confirmarPagoDigital({
                creditoId,
                monto,
                metodo: metodoSeleccionado,
                referencia: referencia || undefined,
                usuarioId
            })

            if (resultado.success) {
                setConfirmado(true)
                toast.success('¡Pago confirmado!', {
                    description: `S/ ${monto.toFixed(2)} recibido por ${metodoSeleccionado.toUpperCase()}`
                })
                onPagoConfirmado?.(resultado.pagoId!)
            } else {
                toast.error('Error', { description: resultado.error })
            }
        } catch (err) {
            console.error('Error:', err)
            toast.error('Error confirmando pago')
        } finally {
            setConfirmando(false)
        }
    }

    const copiarNumero = () => {
        const numero = metodoSeleccionado === 'yape' ? config?.numeroYape : config?.numeroPlin
        if (numero) {
            navigator.clipboard.writeText(numero)
            toast.success('Número copiado')
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-48 h-48 bg-muted rounded-lg mb-4" />
                        <div className="h-6 w-32 bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (confirmado) {
        return (
            <Card className="border-green-300 bg-green-50">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-green-700 mb-2">
                            ¡Pago Confirmado!
                        </h3>
                        <p className="text-green-600 mb-4">
                            S/ {monto.toFixed(2)} recibido por {metodoSeleccionado.toUpperCase()}
                        </p>
                        <Badge variant="outline" className="bg-green-100">
                            Crédito: {datos?.codigoCredito}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const numeroActivo = metodoSeleccionado === 'yape' ? config?.numeroYape : config?.numeroPlin

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Cobro Yape/Plin
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selector de método */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant={metodoSeleccionado === 'yape' ? 'default' : 'outline'}
                        onClick={() => setMetodoSeleccionado('yape')}
                        className={cn(
                            metodoSeleccionado === 'yape' && 'bg-purple-600 hover:bg-purple-700'
                        )}
                    >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Yape
                    </Button>
                    <Button
                        variant={metodoSeleccionado === 'plin' ? 'default' : 'outline'}
                        onClick={() => setMetodoSeleccionado('plin')}
                        className={cn(
                            metodoSeleccionado === 'plin' && 'bg-green-600 hover:bg-green-700'
                        )}
                    >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Plin
                    </Button>
                </div>

                {/* Info del cobro */}
                <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold mb-1">
                        S/ {monto.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {datos?.concepto}
                    </div>
                </div>

                {/* Número destino */}
                {numeroActivo ? (
                    <div className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">
                            Número {metodoSeleccionado.toUpperCase()}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-lg font-bold">
                                {numeroActivo}
                            </span>
                            <Button variant="ghost" size="icon" onClick={copiarNumero}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        {config?.nombreTitular && (
                            <div className="text-sm text-muted-foreground mt-1">
                                {config.nombreTitular}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-3 border rounded-lg text-center text-muted-foreground">
                        <p>No hay número {metodoSeleccionado} configurado</p>
                        <p className="text-xs">Configúralo en Admin → Configuración</p>
                    </div>
                )}

                {/* Referencia opcional */}
                <div className="space-y-2">
                    <Label htmlFor="referencia">
                        Referencia (opcional)
                    </Label>
                    <Input
                        id="referencia"
                        placeholder="Ej: Número de operación"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                    />
                </div>

                {/* Botón confirmar */}
                <Button
                    className="w-full"
                    size="lg"
                    onClick={confirmarPago}
                    disabled={confirmando}
                >
                    {confirmando ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Confirmando...
                        </>
                    ) : (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Confirmar Pago Recibido
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    Solo confirma cuando hayas verificado que el pago llegó a tu {metodoSeleccionado.toUpperCase()}
                </p>
            </CardContent>
        </Card>
    )
}
