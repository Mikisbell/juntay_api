// Templates de mensajes centralizados para notificaciones WhatsApp
// Permite modificar mensajes en un solo lugar

import { ContratoVencimiento } from '../types/contrato'

const FIRMA_EMPRESA = 'JUNTAY - Casa de Empeños'

export function generarMensajeVencimientoHoy(contrato: ContratoVencimiento): string {
    return `Estimado/a ${contrato.cliente},

Le recordamos que su contrato ${contrato.codigo} vence HOY.

Monto pendiente: S/. ${contrato.saldo.toFixed(2)}

Por favor, acérquese a nuestras oficinas para regularizar su situación.

Gracias por su preferencia.
${FIRMA_EMPRESA}`
}

export function generarMensajeVencimientoProximo(contrato: ContratoVencimiento): string {
    const diasTexto = contrato.diasRestantes === 1 ? 'día' : 'días'
    const fechaFormateada = new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE', {
        dateStyle: 'long'
    })

    return `Estimado/a ${contrato.cliente},

Le recordamos que su contrato ${contrato.codigo} vence en ${contrato.diasRestantes} ${diasTexto}.

📅 Fecha de vencimiento: ${fechaFormateada}
💰 Monto pendiente: S/. ${contrato.saldo.toFixed(2)}

Le invitamos a acercarse a nuestras oficinas antes del vencimiento.

Gracias por su preferencia.
${FIRMA_EMPRESA}`
}

export function generarMensajeCobranza(contrato: ContratoVencimiento, diasMora: number): string {
    return `Estimado/a ${contrato.cliente},

Su contrato ${contrato.codigo} se encuentra vencido hace ${diasMora} días.

Monto pendiente: S/. ${contrato.saldo.toFixed(2)}

Por favor, acérquese a nuestras oficinas a la brevedad para evitar acciones adicionales.

${FIRMA_EMPRESA}`
}

// Función principal que selecciona el template correcto
export function generarMensajeVencimiento(contrato: ContratoVencimiento): string {
    if (contrato.diasRestantes === 0) {
        return generarMensajeVencimientoHoy(contrato)
    }
    if (contrato.diasRestantes < 0) {
        return generarMensajeCobranza(contrato, Math.abs(contrato.diasRestantes))
    }
    return generarMensajeVencimientoProximo(contrato)
}
