'use client'

import { useState } from 'react'
import { Send, Loader2, MessageSquare, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { enviarReciboPorWhatsApp, type DatosReciboWhatsApp } from '@/lib/actions/recibo-whatsapp-actions'
import { toast } from 'sonner'

interface BotonEnviarReciboWhatsAppProps {
    /** Datos del pago para generar y enviar el recibo */
    datosPago: Omit<DatosReciboWhatsApp, 'telefono'> & {
        telefono: string  // Required for WhatsApp
    }
    /** Variante del botón */
    variant?: 'default' | 'outline' | 'ghost' | 'secondary'
    /** Tamaño del botón */
    size?: 'default' | 'sm' | 'lg' | 'icon'
    /** Texto del botón (opcional) */
    label?: string
    /** Clase CSS adicional */
    className?: string
    /** Callback cuando se envía exitosamente */
    onSuccess?: (numeroRecibo: string) => void
    /** Callback cuando falla el envío */
    onError?: (error: string) => void
}

/**
 * Botón para enviar recibo de pago por WhatsApp
 * 
 * Uso:
 * <BotonEnviarReciboWhatsApp datosPago={...} />
 */
export function BotonEnviarReciboWhatsApp({
    datosPago,
    variant = 'default',
    size = 'sm',
    label = 'Enviar por WhatsApp',
    className,
    onSuccess,
    onError
}: BotonEnviarReciboWhatsAppProps) {
    const [enviando, setEnviando] = useState(false)
    const [enviado, setEnviado] = useState(false)

    const handleEnviar = async () => {
        if (!datosPago.telefono) {
            toast.error('Sin teléfono', {
                description: 'El cliente no tiene número de teléfono registrado'
            })
            return
        }

        try {
            setEnviando(true)

            const resultado = await enviarReciboPorWhatsApp(datosPago)

            if (resultado.success) {
                setEnviado(true)
                toast.success('Recibo enviado', {
                    description: `Recibo ${resultado.numeroRecibo} enviado a ${datosPago.telefono}`,
                    icon: <MessageSquare className="h-4 w-4 text-green-500" />
                })
                onSuccess?.(resultado.numeroRecibo!)

                // Reset estado después de 3 segundos
                setTimeout(() => setEnviado(false), 3000)
            } else {
                toast.error('Error al enviar', {
                    description: resultado.error || 'No se pudo enviar el recibo'
                })
                onError?.(resultado.error || 'Error desconocido')
            }
        } catch (error) {
            console.error('Error enviando recibo:', error)
            toast.error('Error de conexión', {
                description: 'Por favor verifica que WhatsApp esté conectado'
            })
            onError?.('Error de conexión')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Button
            variant={enviado ? 'secondary' : variant}
            size={size}
            onClick={handleEnviar}
            disabled={enviando || !datosPago.telefono}
            className={className}
        >
            {enviando ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                </>
            ) : enviado ? (
                <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Enviado
                </>
            ) : (
                <>
                    <Send className="h-4 w-4 mr-2" />
                    {label}
                </>
            )}
        </Button>
    )
}

/**
 * Versión compacta (solo icono) para usar en tablas
 */
export function BotonEnviarReciboWhatsAppIcono({
    datosPago,
    className,
    onSuccess,
    onError
}: Omit<BotonEnviarReciboWhatsAppProps, 'variant' | 'size' | 'label'>) {
    const [enviando, setEnviando] = useState(false)
    const [enviado, setEnviado] = useState(false)

    const handleEnviar = async () => {
        if (!datosPago.telefono) {
            toast.error('Sin teléfono registrado')
            return
        }

        try {
            setEnviando(true)
            const resultado = await enviarReciboPorWhatsApp(datosPago)

            if (resultado.success) {
                setEnviado(true)
                toast.success(`Recibo enviado a ${datosPago.telefono}`)
                onSuccess?.(resultado.numeroRecibo!)
                setTimeout(() => setEnviado(false), 3000)
            } else {
                toast.error(resultado.error || 'Error al enviar')
                onError?.(resultado.error || 'Error')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error de conexión')
            onError?.('Error de conexión')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleEnviar}
            disabled={enviando || !datosPago.telefono}
            className={className}
            title={datosPago.telefono ? `Enviar recibo a ${datosPago.telefono}` : 'Sin teléfono'}
        >
            {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : enviado ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Send className="h-4 w-4 text-green-600" />
            )}
        </Button>
    )
}
