/**
 * Utilidades para generación de hash de verificación de recibos
 * 
 * Hash: SHA256 completo (64 hex chars)
 * Payload: numero_recibo|codigo_credito|monto_pagado|created_at
 * 
 * REGLAS DE GOBERNANZA:
 * - Hash se genera UNA SOLA VEZ al emitir recibo
 * - Hash es inmutable
 * - Solo se usa para verificación (nunca modifica)
 */

import { createHash } from 'crypto'

/**
 * Genera hash SHA256 completo para verificación de recibo
 * 
 * @param datos - Datos del recibo para hashear
 * @returns Hash SHA256 de 64 caracteres hexadecimales
 */
export function generarHashRecibo(datos: {
    numeroRecibo: string
    codigoCredito: string
    montoPagado: number
    fecha: Date
}): string {
    const payload = [
        datos.numeroRecibo,
        datos.codigoCredito,
        datos.montoPagado.toFixed(2),
        datos.fecha.toISOString()
    ].join('|')

    return createHash('sha256').update(payload).digest('hex')
}

/**
 * Genera la URL pública de verificación
 */
export function generarUrlVerificacion(hash: string, baseUrl?: string): string {
    const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://juntay.app'
    return `${base}/verificar/${hash}`
}

/**
 * Oculta parcialmente un nombre para privacidad
 * "Juan Pérez García" → "Juan P***z G***a"
 */
export function ocultarNombre(nombre: string): string {
    return nombre
        .split(' ')
        .map((palabra, index) => {
            if (index === 0) return palabra // Primer nombre visible
            if (palabra.length <= 2) return palabra
            return palabra[0] + '***' + palabra[palabra.length - 1]
        })
        .join(' ')
}
