'use client'

import { FrecuenciaPago, Cuota } from '@/hooks/useCotizador'

/**
 * Tasas fraccionadas según frecuencia de pago
 * Base: 20% mensual
 */
const TASAS_FRACCIONADAS = {
    DIARIO: (tasaMensual: number) => tasaMensual / 30,
    SEMANAL: (tasaMensual: number) => tasaMensual / 4,
    QUINCENAL: (tasaMensual: number) => tasaMensual / 2,
    TRES_SEMANAS: (tasaMensual: number) => (tasaMensual / 4) * 3,
    MENSUAL: (tasaMensual: number) => tasaMensual
}

/**
 * Días entre pagos según frecuencia
 */
const DIAS_POR_FRECUENCIA: Record<FrecuenciaPago, number> = {
    DIARIO: 1,
    SEMANAL: 7,
    QUINCENAL: 15,
    TRES_SEMANAS: 21,
    MENSUAL: 30
}

/**
 * Calcula la tasa de interés fraccionada según frecuencia
 */
export function calcularInteresFraccionado(
    tasaMensual: number,
    frecuencia: FrecuenciaPago
): number {
    const calcular = TASAS_FRACCIONADAS[frecuencia]
    return Number(calcular(tasaMensual).toFixed(4))
}

/**
 * Genera el cronograma completo de pagos
 */
export function generarCronograma(
    montoPrestamo: number,
    tasaMensual: number, // porcentaje (ej: 20 para 20%)
    frecuencia: FrecuenciaPago,
    numeroCuotas: number,
    fechaInicio: Date
): Cuota[] {
    const cronograma: Cuota[] = []
    const tasaFraccionada = calcularInteresFraccionado(tasaMensual, frecuencia) / 100 // convertir a decimal
    const diasEntrePagos = DIAS_POR_FRECUENCIA[frecuencia]

    const capitalPorCuota = montoPrestamo / numeroCuotas
    let saldoRestante = montoPrestamo

    for (let i = 1; i <= numeroCuotas; i++) {
        // Calcular fecha de la cuota
        const fechaCuota = new Date(fechaInicio)
        fechaCuota.setDate(fechaCuota.getDate() + (i - 1) * diasEntrePagos)

        // Calcular interés sobre el saldo restante
        const interes = saldoRestante * tasaFraccionada
        const total = capitalPorCuota + interes
        saldoRestante -= capitalPorCuota

        cronograma.push({
            numero: i,
            fecha: fechaCuota,
            capital: Number(capitalPorCuota.toFixed(2)),
            interes: Number(interes.toFixed(2)),
            total: Number(total.toFixed(2)),
            saldo: Number(Math.max(0, saldoRestante).toFixed(2))
        })
    }

    return cronograma
}

/**
 * Calcula el total de intereses de un cronograma
 */
export function calcularTotalIntereses(cronograma: Cuota[]): number {
    return Number(
        cronograma.reduce((total, cuota) => total + cuota.interes, 0).toFixed(2)
    )
}

/**
 * Calcula el total a pagar
 */
export function calcularTotalAPagar(cronograma: Cuota[]): number {
    return Number(
        cronograma.reduce((total, cuota) => total + cuota.total, 0).toFixed(2)
    )
}

/**
 * Formatea una frecuencia para mostrar
 */
export function formatearFrecuencia(frecuencia: FrecuenciaPago): string {
    const nombres: Record<FrecuenciaPago, string> = {
        DIARIO: 'Diario',
        SEMANAL: 'Semanal',
        QUINCENAL: 'Quincenal',
        TRES_SEMANAS: 'Tres Semanas',
        MENSUAL: 'Mensual'
    }
    return nombres[frecuencia]
}

/**
 * Formatea una fecha para mostrar en cronograma
 */
export function formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(fecha)
}

/**
 * Formatea monto en soles
 */
export function formatearMonto(monto: number): string {
    return `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
