'use client'

import { useState, useCallback } from 'react'
import { ContratoVencimiento, getNotificacionTipo } from '../types/contrato'
import { generarMensajeVencimiento } from '../templates/mensajes'
import { enviarNotificacion, verificarCooldownNotificacion, obtenerHistorialNotificaciones } from '@/lib/actions/vencimientos-actions'

type CooldownInfo = {
    puedeEnviar: boolean
    mensaje?: string
    ultimaNotificacion?: string
} | null

type HistorialItem = {
    fecha: string
    tipo: string
    estado: string
}

export function useWhatsAppModal(contrato: ContratoVencimiento) {
    const [isOpen, setIsOpen] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [cooldown, setCooldown] = useState<CooldownInfo>(null)
    const [historial, setHistorial] = useState<HistorialItem[]>([])

    const getMensajeDefault = useCallback(() => {
        return generarMensajeVencimiento(contrato)
    }, [contrato])

    const abrirModal = useCallback(async () => {
        if (!contrato.telefono) {
            alert('Este contrato no tiene número de teléfono registrado')
            return
        }

        setMensaje(getMensajeDefault())
        setIsOpen(true)
        setCargando(true)

        try {
            const [cooldownData, historialData] = await Promise.all([
                verificarCooldownNotificacion(contrato.id),
                obtenerHistorialNotificaciones(contrato.id)
            ])

            setCooldown(cooldownData as CooldownInfo)
            setHistorial(historialData || [])
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setCargando(false)
        }
    }, [contrato, getMensajeDefault])

    const cerrarModal = useCallback(() => {
        setIsOpen(false)
    }, [])

    const restaurarMensaje = useCallback(() => {
        setMensaje(getMensajeDefault())
    }, [getMensajeDefault])

    const enviar = useCallback(async () => {
        setEnviando(true)
        try {
            const tipo = getNotificacionTipo(contrato.diasRestantes)
            const resultado = await enviarNotificacion(
                contrato.telefono,
                contrato.cliente,
                tipo,
                {
                    creditoId: contrato.id,
                    clienteId: contrato.clienteId,
                    codigo: contrato.codigo,
                    fecha: contrato.fechaVencimiento,
                    monto: contrato.saldo,
                    dias: contrato.diasRestantes,
                    mensajePersonalizado: mensaje
                }
            )

            if (resultado.success) {
                alert(`✅ ${resultado.mensaje}`)
                setIsOpen(false)
                // Recargar historial
                const hist = await obtenerHistorialNotificaciones(contrato.id)
                setHistorial(hist || [])
            } else {
                alert(`❌ ${resultado.mensaje}`)
            }
        } catch (error) {
            console.error(error)
            alert('Error al enviar notificación')
        } finally {
            setEnviando(false)
        }
    }, [contrato, mensaje])

    const llamar = useCallback(() => {
        if (!contrato.telefono) {
            alert('Este contrato no tiene número de teléfono registrado')
            return
        }
        const tel = contrato.telefono.replace(/\D/g, '')
        window.location.href = `tel:${tel}`
    }, [contrato.telefono])

    return {
        // Estado
        isOpen,
        mensaje,
        enviando,
        cargando,
        cooldown,
        historial,
        // Acciones
        setMensaje,
        abrirModal,
        cerrarModal,
        restaurarMensaje,
        enviar,
        llamar,
        // Helpers
        puedeEnviar: !enviando && mensaje.trim() && (!cooldown || cooldown.puedeEnviar)
    }
}
