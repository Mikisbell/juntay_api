'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'
import { enviarNotificacion } from '@/lib/actions/vencimientos-actions'
import { useRouter } from 'next/navigation'

type Props = {
    contratoId: string
    clienteTelefono: string
    clienteNombre: string
    codigoContrato: string
    monto: number
    dias: number
    fecha: string
}

export function BotonNotificarWhatsApp({
    contratoId,
    clienteTelefono,
    clienteNombre,
    codigoContrato,
    monto,
    dias,
    fecha
}: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleEnviar = async () => {
        setLoading(true)
        try {
            const tipo = dias === 0 ? 'vencimiento_hoy' : 'vencimiento_proximo'
            const result = await enviarNotificacion(
                clienteTelefono,
                clienteNombre,
                tipo,
                { codigo: codigoContrato, monto, dias, fecha }
            )

            if (result.success) {
                alert(`✅ ${result.mensaje}`)
            } else {
                alert(`❌ ${result.mensaje}`)
            }
        } catch (error) {
            alert('Error al enviar notificación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            variant="ghost"
            className="gap-2"
            onClick={handleEnviar}
            disabled={loading || !clienteTelefono}
            title={!clienteTelefono ? 'Cliente sin teléfono registrado' : 'Enviar recordatorio por WhatsApp'}
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                </>
            ) : (
                <>
                    <Send className="h-4 w-4" />
                    WhatsApp
                </>
            )}
        </Button>
    )
}
