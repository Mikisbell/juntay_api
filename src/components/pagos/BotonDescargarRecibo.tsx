'use client'

import { useState } from 'react'
import { Download, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    generarReciboPDF,
    generarNumeroRecibo,
    type DatosRecibo
} from '@/lib/utils/recibo-pdf'
import { toast } from 'sonner'

interface BotonDescargarReciboProps {
    /** Datos del pago para generar el recibo */
    datosPago: {
        clienteNombre: string
        clienteDocumento: string
        codigoCredito: string
        garantiaDescripcion?: string
        tipoPago: DatosRecibo['tipoPago']
        montoPagado: number
        metodoPago: string
        saldoAnterior: number
        saldoNuevo: number
        cajeroNombre?: string
        sucursal?: string
    }
    /** Variante del botón */
    variant?: 'default' | 'outline' | 'ghost' | 'secondary'
    /** Tamaño del botón */
    size?: 'default' | 'sm' | 'lg' | 'icon'
    /** Texto del botón (opcional) */
    label?: string
    /** Clase CSS adicional */
    className?: string
}

/**
 * Botón para descargar recibo de pago en PDF
 * 
 * Uso:
 * <BotonDescargarRecibo datosPago={...} />
 */
export function BotonDescargarRecibo({
    datosPago,
    variant = 'outline',
    size = 'sm',
    label = 'Descargar Recibo',
    className
}: BotonDescargarReciboProps) {
    const [generando, setGenerando] = useState(false)

    const handleDescargar = async () => {
        try {
            setGenerando(true)

            const datosRecibo: DatosRecibo = {
                numeroRecibo: generarNumeroRecibo(),
                fecha: new Date(),
                clienteNombre: datosPago.clienteNombre,
                clienteDocumento: datosPago.clienteDocumento,
                codigoCredito: datosPago.codigoCredito,
                garantiaDescripcion: datosPago.garantiaDescripcion,
                tipoPago: datosPago.tipoPago,
                montoPagado: datosPago.montoPagado,
                metodoPago: datosPago.metodoPago,
                saldoAnterior: datosPago.saldoAnterior,
                saldoNuevo: datosPago.saldoNuevo,
                cajeroNombre: datosPago.cajeroNombre,
                sucursal: datosPago.sucursal
            }

            generarReciboPDF(datosRecibo)

            toast.success('Recibo descargado', {
                description: `Recibo ${datosRecibo.numeroRecibo} generado exitosamente`
            })
        } catch (error) {
            console.error('Error generando recibo:', error)
            toast.error('Error al generar recibo', {
                description: 'Por favor intenta nuevamente'
            })
        } finally {
            setGenerando(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDescargar}
            disabled={generando}
            className={className}
        >
            {generando ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <FileText className="h-4 w-4 mr-2" />
                    {label}
                </>
            )}
        </Button>
    )
}

/**
 * Versión compacta (solo icono) para usar en tablas
 */
export function BotonDescargarReciboIcono({
    datosPago,
    className
}: Omit<BotonDescargarReciboProps, 'variant' | 'size' | 'label'>) {
    const [generando, setGenerando] = useState(false)

    const handleDescargar = async () => {
        try {
            setGenerando(true)

            const datosRecibo: DatosRecibo = {
                numeroRecibo: generarNumeroRecibo(),
                fecha: new Date(),
                clienteNombre: datosPago.clienteNombre,
                clienteDocumento: datosPago.clienteDocumento,
                codigoCredito: datosPago.codigoCredito,
                garantiaDescripcion: datosPago.garantiaDescripcion,
                tipoPago: datosPago.tipoPago,
                montoPagado: datosPago.montoPagado,
                metodoPago: datosPago.metodoPago,
                saldoAnterior: datosPago.saldoAnterior,
                saldoNuevo: datosPago.saldoNuevo,
                cajeroNombre: datosPago.cajeroNombre,
                sucursal: datosPago.sucursal
            }

            generarReciboPDF(datosRecibo)
        } catch (error) {
            console.error('Error generando recibo:', error)
            toast.error('Error al generar recibo')
        } finally {
            setGenerando(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDescargar}
            disabled={generando}
            className={className}
            title="Descargar recibo PDF"
        >
            {generando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
        </Button>
    )
}
