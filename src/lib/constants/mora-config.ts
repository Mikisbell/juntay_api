/**
 * Configuración centralizada para cálculo de mora
 * 
 * FUENTE ÚNICA DE VERDAD para constantes de mora.
 * Si cambia la política de mora, solo modificar este archivo.
 * 
 * IMPORTANTE: Estas constantes DEBEN estar sincronizadas con cualquier
 * cálculo de mora en la base de datos (triggers, RPCs, etc.)
 */

export const MORA_CONFIG = {
    /** Días de gracia antes de aplicar mora (3 días sin penalidad) */
    PERIODO_GRACIA_DIAS: 3,

    /** Tasa de mora diaria: 0.3% */
    TASA_DIARIA: 0.003,

    /** Tope máximo de mora mensual: 10% del saldo */
    TOPE_MENSUAL: 0.10
} as const

/**
 * Calcula la mora pendiente de un crédito
 * 
 * @param saldoPendiente - Saldo actual del crédito
 * @param fechaVencimiento - Fecha de vencimiento del crédito
 * @returns Objeto con días de mora y monto de mora calculado
 * 
 * @example
 * const { diasMora, moraPendiente } = calcularMora(1000, new Date('2024-01-01'))
 */
export function calcularMora(
    saldoPendiente: number,
    fechaVencimiento: Date | string
): { diasMora: number; moraPendiente: number } {
    const hoy = new Date()
    const vencimiento = typeof fechaVencimiento === 'string'
        ? new Date(fechaVencimiento)
        : fechaVencimiento

    // Calcular días transcurridos desde vencimiento
    const diasVencido = Math.floor(
        (hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Solo aplica mora después del período de gracia
    const diasMora = Math.max(0, diasVencido - MORA_CONFIG.PERIODO_GRACIA_DIAS)

    // Calcular mora con tope mensual
    const moraSinTope = saldoPendiente * MORA_CONFIG.TASA_DIARIA * diasMora
    const moraMensualMaxima = saldoPendiente * MORA_CONFIG.TOPE_MENSUAL
    const moraPendiente = Math.min(moraSinTope, moraMensualMaxima)

    return {
        diasMora,
        moraPendiente: Math.round(moraPendiente * 100) / 100 // Redondear a 2 decimales
    }
}

/**
 * Agregar un mes calendario a una fecha
 * Maneja correctamente casos edge como Feb, meses de 30/31 días
 * 
 * @example
 * agregarUnMes(new Date('2024-01-31')) // Returns 2024-02-29 (año bisiesto)
 * agregarUnMes(new Date('2024-03-31')) // Returns 2024-04-30
 */
export function agregarUnMes(fecha: Date): Date {
    const resultado = new Date(fecha)
    const diaOriginal = resultado.getDate()

    // Avanzar al mes siguiente
    resultado.setMonth(resultado.getMonth() + 1)

    // Si el día cambió, significa que el mes siguiente tiene menos días
    // Ejemplo: 31 Ene → 3 Mar (porque Feb no tiene día 31)
    // En ese caso, retroceder al último día del mes correcto
    if (resultado.getDate() !== diaOriginal) {
        resultado.setDate(0) // Último día del mes anterior
    }

    return resultado
}
