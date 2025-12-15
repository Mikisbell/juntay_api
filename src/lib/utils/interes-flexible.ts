/**
 * Cálculo de Interés Flexible
 * 
 * Dos modalidades:
 * 1. POR DÍAS: Pro-rata diario (interés mensual ÷ 30 × días)
 * 2. POR SEMANAS: Escalado fijo (25%, 50%, 75%, 100%)
 * 
 * @example
 * // Préstamo S/1000 con 20% mensual = S/200 interés mensual
 * calcularInteresFlexible(1000, 20, 4, 'dias')    // S/26.67 (4 días)
 * calcularInteresFlexible(1000, 20, 7, 'semanas') // S/50.00 (semana 1 = 25%)
 */

export type ModalidadInteres = 'dias' | 'semanas'

export interface ResultadoInteres {
    interes: number           // Monto de interés a cobrar
    porcentajeAplicado: number // Porcentaje real aplicado (ej: 6.67% para 10 días)
    diasCobrados: number      // Días que cubre el pago
    descripcion: string       // Texto descriptivo para mostrar al usuario
    formula: string           // Fórmula usada (para transparencia)
}

/**
 * Calcula el interés según la modalidad seleccionada
 * 
 * @param montoPrestado - Capital del préstamo
 * @param tasaMensual - Tasa de interés mensual (ej: 20 significa 20%)
 * @param diasTranscurridos - Días desde el inicio del préstamo
 * @param modalidad - 'dias' para pro-rata diario, 'semanas' para escalado semanal
 */
export function calcularInteresFlexible(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number,
    modalidad: ModalidadInteres
): ResultadoInteres {
    // Interés mensual completo
    const interesMensualCompleto = montoPrestado * (tasaMensual / 100)

    if (modalidad === 'dias') {
        return calcularPorDias(montoPrestado, tasaMensual, diasTranscurridos, interesMensualCompleto)
    } else {
        return calcularPorSemanas(montoPrestado, tasaMensual, diasTranscurridos, interesMensualCompleto)
    }
}

/**
 * Modalidad POR DÍAS: Pro-rata exacto
 * Fórmula: (Interés mensual ÷ 30) × días transcurridos
 */
function calcularPorDias(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number,
    interesMensualCompleto: number
): ResultadoInteres {
    // Mínimo 1 día
    const dias = Math.max(1, diasTranscurridos)

    // Interés diario
    const interesDiario = interesMensualCompleto / 30
    const interes = interesDiario * dias

    // Porcentaje efectivo aplicado
    const porcentajeAplicado = (tasaMensual / 30) * dias

    return {
        interes: redondear(interes),
        porcentajeAplicado: redondear(porcentajeAplicado, 4),
        diasCobrados: dias,
        descripcion: `Interés de ${dias} día${dias !== 1 ? 's' : ''} (pro-rata)`,
        formula: `S/${montoPrestado.toFixed(2)} × ${tasaMensual}% ÷ 30 × ${dias} días`
    }
}

/**
 * Modalidad POR SEMANAS: Escalado fijo
 * - Semana 1 (días 1-7): 25% del interés mensual
 * - Semana 2 (días 8-14): 50% del interés mensual
 * - Semana 3 (días 15-21): 75% del interés mensual
 * - Semana 4+ (días 22-30): 100% del interés mensual
 */
function calcularPorSemanas(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number,
    interesMensualCompleto: number
): ResultadoInteres {
    // Mínimo 1 día
    const dias = Math.max(1, diasTranscurridos)

    // Determinar en qué semana estamos
    let porcentajeSemana: number
    let numeroSemana: number
    let diasCobrados: number

    if (dias <= 7) {
        porcentajeSemana = 0.25
        numeroSemana = 1
        diasCobrados = 7
    } else if (dias <= 14) {
        porcentajeSemana = 0.50
        numeroSemana = 2
        diasCobrados = 14
    } else if (dias <= 21) {
        porcentajeSemana = 0.75
        numeroSemana = 3
        diasCobrados = 21
    } else {
        porcentajeSemana = 1.00
        numeroSemana = 4
        diasCobrados = 30
    }

    const interes = interesMensualCompleto * porcentajeSemana
    const porcentajeAplicado = tasaMensual * porcentajeSemana

    return {
        interes: redondear(interes),
        porcentajeAplicado: redondear(porcentajeAplicado, 4),
        diasCobrados,
        descripcion: `Semana ${numeroSemana} (${porcentajeSemana * 100}% del interés mensual)`,
        formula: `S/${montoPrestado.toFixed(2)} × ${tasaMensual}% × ${porcentajeSemana * 100}%`
    }
}

/**
 * Obtener preview de todas las opciones para mostrar al usuario
 */
export function obtenerOpcionesPago(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number
): {
    porDias: ResultadoInteres
    porSemanas: ResultadoInteres
    recomendacion: ModalidadInteres
    ahorro: number
} {
    const porDias = calcularInteresFlexible(montoPrestado, tasaMensual, diasTranscurridos, 'dias')
    const porSemanas = calcularInteresFlexible(montoPrestado, tasaMensual, diasTranscurridos, 'semanas')

    // Recomendar la opción más económica para el cliente
    const recomendacion: ModalidadInteres = porDias.interes <= porSemanas.interes ? 'dias' : 'semanas'
    const ahorro = Math.abs(porDias.interes - porSemanas.interes)

    return {
        porDias,
        porSemanas,
        recomendacion,
        ahorro
    }
}

/**
 * Calcular monto total a pagar según tipo de operación
 */
export function calcularTotalPago(
    montoPrestado: number,
    saldoPendiente: number,
    tasaMensual: number,
    diasTranscurridos: number,
    modalidad: ModalidadInteres,
    tipoPago: 'renovar' | 'amortizar' | 'liquidar',
    montoAmortizar?: number
): {
    interes: ResultadoInteres
    capital: number
    total: number
    descripcion: string
} {
    const interes = calcularInteresFlexible(montoPrestado, tasaMensual, diasTranscurridos, modalidad)

    switch (tipoPago) {
        case 'renovar':
            // Solo paga intereses, se extiende el plazo
            return {
                interes,
                capital: 0,
                total: redondear(interes.interes),
                descripcion: `Renovación: ${interes.descripcion}`
            }

        case 'amortizar':
            // Paga intereses + parte del capital
            const capitalAbonado = montoAmortizar || 0
            return {
                interes,
                capital: redondear(capitalAbonado),
                total: redondear(interes.interes + capitalAbonado),
                descripcion: `Amortización: ${interes.descripcion} + S/${capitalAbonado.toFixed(2)} capital`
            }

        case 'liquidar':
            // Paga todo: intereses + saldo pendiente
            return {
                interes,
                capital: redondear(saldoPendiente),
                total: redondear(interes.interes + saldoPendiente),
                descripcion: `Liquidación total: ${interes.descripcion} + S/${saldoPendiente.toFixed(2)} capital`
            }
    }
}

/**
 * Redondear a 2 decimales por defecto
 */
function redondear(valor: number, decimales: number = 2): number {
    const factor = Math.pow(10, decimales)
    return Math.round(valor * factor) / factor
}

/**
 * Días transcurridos desde una fecha
 */
export function calcularDiasTranscurridos(fechaInicio: Date | string): number {
    const inicio = new Date(fechaInicio)
    const hoy = new Date()

    // Diferencia en milisegundos
    const diffMs = hoy.getTime() - inicio.getTime()

    // Convertir a días (redondeando hacia arriba para cobrar día parcial)
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    // Mínimo 1 día
    return Math.max(1, dias)
}
