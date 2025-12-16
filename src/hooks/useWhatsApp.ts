import { useCallback } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const useWhatsApp = () => {
    const formatPhone = (phone: string) => {
        // Remove non-numeric chars
        const clean = phone.replace(/\D/g, '')
        // Add country code if missing (assuming PE +51)
        if (clean.length === 9) return `51${clean}`
        return clean
    }

    const sendReminder = useCallback((
        phone: string,
        nombre: string,
        bien: string,
        fechaVencimiento: Date,
        monto: number
    ) => {
        if (!phone) return

        const fechaStr = format(new Date(fechaVencimiento), 'dd/MM', { locale: es })
        const mensaje = `Hola ${nombre}, te saludamos de JUNTAY. 👋\n\nRecordamos que tu contrato por *${bien}* vence el *${fechaStr}*.\n\nMonto a pagar: S/ ${monto.toFixed(2)}\n\nEvita intereses moratorios renovando o cancelando a tiempo. 🏠`

        const url = `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(mensaje)}`
        window.open(url, '_blank')
    }, [])

    const sendCustomMessage = useCallback((phone: string, message: string) => {
        if (!phone) return
        const url = `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }, [])

    return {
        sendReminder,
        sendCustomMessage
    }
}
