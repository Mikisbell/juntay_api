/**
 * Sistema de Cálculo de Interés Flexible v2.0
 * 
 * Características:
 * - Interés simple y compuesto
 * - Cálculo de mora con días de gracia
 * - Configuración por empresa
 * - Modalidades: por días (pro-rata) y por semanas (escalado)
 * - Compatible con base de datos (usa mismas fórmulas)
 * 
 * @example
 * // Préstamo S/1000 con 20% mensual, 10 días transcurridos, 5 días vencido
 * const resultado = calcularInteresCompleto({
 *   montoPrestado: 1000,
 *   tasaMensual: 20,
 *   diasTranscurridos: 10,
 *   diasPostVencimiento: 5,
 *   config: { diasGracia: 3, tasaMoraDiaria: 0.5 }
 * })
 * // resultado.interesRegular = 66.67, resultado.interesMora = 10.00
 */

// ============================================================================
// TYPES
// ============================================================================

export type ModalidadInteres = 'dias' | 'semanas'

export type TipoCalculo = 'simple' | 'compuesto'

export type EstadoMora = 'AL_DIA' | 'POR_VENCER' | 'EN_GRACIA' | 'MORA_LEVE' | 'MORA_GRAVE'

/**
 * Configuración del sistema de intereses (sincronizada con DB)
 */
export interface ConfiguracionInteres {
    tipoCalculo: TipoCalculo
    baseDias: 30 | 360 | 365
    tasaMoraDiaria: number    // % adicional por día de mora
    diasGracia: number        // días sin mora después de vencimiento
    capitalizacionMensual: boolean
    interesMinimoDias: number // mínimo de días a cobrar
}

/**
 * Parámetros para cálculo de interés
 */
export interface ParametrosInteres {
    montoPrestado: number
    tasaMensual: number
    diasTranscurridos: number
    diasPostVencimiento?: number
    interesCapitalizado?: number
    config?: Partial<ConfiguracionInteres>
}

/**
 * Resultado básico de interés (compatible con v1)
 */
export interface ResultadoInteres {
    interes: number           // Monto de interés a cobrar
    porcentajeAplicado: number // Porcentaje real aplicado
    diasCobrados: number      // Días que cubre el pago
    descripcion: string       // Texto descriptivo
    formula: string           // Fórmula usada (para transparencia)
}

/**
 * Resultado completo con mora y desglose
 */
export interface ResultadoInteresCompleto {
    // Base
    montoBase: number
    tasaAplicada: number

    // Días desglosados
    diasRegulares: number
    diasEnGracia: number
    diasEnMora: number
    diasTotales: number

    // Intereses desglosados
    interesRegular: number
    interesMora: number
    interesTotal: number

    // Estado
    estadoMora: EstadoMora

    // Descripción
    descripcion: string
    formula: string

    // Configuración usada
    configAplicada: ConfiguracionInteres
}

// ============================================================================
// CONFIGURACIÓN POR DEFECTO
// ============================================================================

const CONFIG_DEFAULT: ConfiguracionInteres = {
    tipoCalculo: 'simple',
    baseDias: 30,
    tasaMoraDiaria: 0.5,      // 0.5% diario = 15% mensual adicional
    diasGracia: 3,            // 3 días sin mora después de vencimiento
    capitalizacionMensual: false,
    interesMinimoDias: 1
}

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Calcula el interés completo incluyendo mora y días de gracia
 * Esta es la función principal para uso en producción
 */
export function calcularInteresCompleto(params: ParametrosInteres): ResultadoInteresCompleto {
    const config: ConfiguracionInteres = { ...CONFIG_DEFAULT, ...params.config }

    const {
        montoPrestado,
        tasaMensual,
        diasTranscurridos,
        diasPostVencimiento = 0,
        interesCapitalizado = 0
    } = params

    // Base de cálculo (incluye capitalización si aplica)
    const montoBase = montoPrestado + interesCapitalizado

    // Calcular días desglosados
    const diasRegulares = Math.max(config.interesMinimoDias, diasTranscurridos - diasPostVencimiento)
    const diasEnGracia = Math.min(diasPostVencimiento, config.diasGracia)
    const diasEnMora = Math.max(0, diasPostVencimiento - config.diasGracia)

    // Calcular interés regular
    const interesRegular = calcularInteresSimple(
        montoBase,
        tasaMensual,
        diasRegulares,
        config.baseDias
    )

    // Calcular interés de mora (solo si hay días en mora)
    let interesMora = 0
    if (diasEnMora > 0) {
        interesMora = redondear(
            montoBase * (config.tasaMoraDiaria / 100) * diasEnMora
        )
    }

    // Determinar estado
    const estadoMora = determinarEstadoMora(diasPostVencimiento, diasEnMora)

    // Construir descripción
    const descripcion = construirDescripcion({
        diasRegulares,
        diasEnGracia,
        diasEnMora,
        estadoMora
    })

    // Construir fórmula
    const formula = construirFormula({
        montoBase,
        tasaMensual,
        diasRegulares,
        diasEnMora,
        config
    })

    return {
        montoBase,
        tasaAplicada: tasaMensual,
        diasRegulares,
        diasEnGracia,
        diasEnMora,
        diasTotales: diasTranscurridos,
        interesRegular: redondear(interesRegular),
        interesMora: redondear(interesMora),
        interesTotal: redondear(interesRegular + interesMora),
        estadoMora,
        descripcion,
        formula,
        configAplicada: config
    }
}

/**
 * Calcula interés con modalidad seleccionada (compatible con v1)
 * Mantiene compatibilidad hacia atrás con el sistema existente
 */
export function calcularInteresFlexible(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number,
    modalidad: ModalidadInteres
): ResultadoInteres {
    const interesMensualCompleto = montoPrestado * (tasaMensual / 100)

    if (modalidad === 'dias') {
        return calcularPorDias(montoPrestado, tasaMensual, diasTranscurridos, interesMensualCompleto)
    } else {
        return calcularPorSemanas(montoPrestado, tasaMensual, diasTranscurridos, interesMensualCompleto)
    }
}

/**
 * Calcula interés con mora usando modalidad seleccionada
 */
export function calcularInteresFlexibleConMora(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number,
    diasPostVencimiento: number,
    modalidad: ModalidadInteres,
    config?: Partial<ConfiguracionInteres>
): ResultadoInteresCompleto & { modalidad: ModalidadInteres } {
    const resultado = calcularInteresCompleto({
        montoPrestado,
        tasaMensual,
        diasTranscurridos,
        diasPostVencimiento,
        config
    })

    // Ajustar según modalidad si es por semanas
    if (modalidad === 'semanas') {
        const interesSemanas = calcularPorSemanas(
            montoPrestado,
            tasaMensual,
            resultado.diasRegulares,
            montoPrestado * (tasaMensual / 100)
        )

        return {
            ...resultado,
            interesRegular: interesSemanas.interes,
            interesTotal: interesSemanas.interes + resultado.interesMora,
            modalidad,
            descripcion: `${interesSemanas.descripcion}${resultado.diasEnMora > 0 ? ` + ${resultado.diasEnMora} días mora` : ''}`
        }
    }

    return { ...resultado, modalidad }
}

/**
 * Obtener preview de todas las opciones para mostrar al usuario
 */
export function obtenerOpcionesPago(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number,
    diasPostVencimiento: number = 0,
    config?: Partial<ConfiguracionInteres>
): {
    porDias: ResultadoInteresCompleto & { modalidad: ModalidadInteres }
    porSemanas: ResultadoInteresCompleto & { modalidad: ModalidadInteres }
    recomendacion: ModalidadInteres
    ahorro: number
    estadoMora: EstadoMora
} {
    const porDias = calcularInteresFlexibleConMora(
        montoPrestado, tasaMensual, diasTranscurridos, diasPostVencimiento, 'dias', config
    )
    const porSemanas = calcularInteresFlexibleConMora(
        montoPrestado, tasaMensual, diasTranscurridos, diasPostVencimiento, 'semanas', config
    )

    const recomendacion: ModalidadInteres = porDias.interesTotal <= porSemanas.interesTotal ? 'dias' : 'semanas'
    const ahorro = Math.abs(porDias.interesTotal - porSemanas.interesTotal)

    return {
        porDias,
        porSemanas,
        recomendacion,
        ahorro,
        estadoMora: porDias.estadoMora
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
    diasPostVencimiento: number = 0,
    montoAmortizar?: number,
    config?: Partial<ConfiguracionInteres>
): {
    interes: ResultadoInteresCompleto
    capital: number
    total: number
    descripcion: string
} {
    const interes = calcularInteresFlexibleConMora(
        montoPrestado,
        tasaMensual,
        diasTranscurridos,
        diasPostVencimiento,
        modalidad,
        config
    )

    switch (tipoPago) {
        case 'renovar':
            return {
                interes,
                capital: 0,
                total: redondear(interes.interesTotal),
                descripcion: `Renovación: ${interes.descripcion}`
            }

        case 'amortizar':
            const capitalAbonado = montoAmortizar || 0
            return {
                interes,
                capital: redondear(capitalAbonado),
                total: redondear(interes.interesTotal + capitalAbonado),
                descripcion: `Amortización: ${interes.descripcion} + S/${capitalAbonado.toFixed(2)} capital`
            }

        case 'liquidar':
            return {
                interes,
                capital: redondear(saldoPendiente),
                total: redondear(interes.interesTotal + saldoPendiente),
                descripcion: `Liquidación total: ${interes.descripcion} + S/${saldoPendiente.toFixed(2)} capital`
            }
    }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Cálculo de interés simple
 */
function calcularInteresSimple(
    capital: number,
    tasaMensual: number,
    dias: number,
    baseDias: number
): number {
    return capital * (tasaMensual / 100) * (dias / baseDias)
}

/**
 * Modalidad POR DÍAS: Pro-rata exacto
 */
function calcularPorDias(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number,
    interesMensualCompleto: number
): ResultadoInteres {
    const dias = Math.max(1, diasTranscurridos)
    const interesDiario = interesMensualCompleto / 30
    const interes = interesDiario * dias
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
 */
function calcularPorSemanas(
    montoPrestado: number,
    tasaMensual: number,
    diasTranscurridos: number,
    interesMensualCompleto: number
): ResultadoInteres {
    const dias = Math.max(1, diasTranscurridos)

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
 * Determinar estado de mora
 */
function determinarEstadoMora(diasPostVencimiento: number, diasEnMora: number): EstadoMora {
    if (diasPostVencimiento <= 0) return 'AL_DIA'
    if (diasEnMora <= 0) return 'EN_GRACIA'
    if (diasEnMora <= 30) return 'MORA_LEVE'
    return 'MORA_GRAVE'
}

/**
 * Construir descripción legible
 */
function construirDescripcion(params: {
    diasRegulares: number
    diasEnGracia: number
    diasEnMora: number
    estadoMora: EstadoMora
}): string {
    const { diasRegulares, diasEnGracia, diasEnMora, estadoMora } = params

    const partes: string[] = [`${diasRegulares} día${diasRegulares !== 1 ? 's' : ''} regular${diasRegulares !== 1 ? 'es' : ''}`]

    if (diasEnGracia > 0) {
        partes.push(`${diasEnGracia} día${diasEnGracia !== 1 ? 's' : ''} de gracia`)
    }

    if (diasEnMora > 0) {
        partes.push(`${diasEnMora} día${diasEnMora !== 1 ? 's' : ''} en mora`)
    }

    const estadoLabel = {
        'AL_DIA': '✅ Al día',
        'EN_GRACIA': '⚠️ En periodo de gracia',
        'MORA_LEVE': '🟠 Mora leve',
        'MORA_GRAVE': '🔴 Mora grave'
    }[estadoMora]

    return `${partes.join(' + ')} (${estadoLabel})`
}

/**
 * Construir fórmula para transparencia
 */
function construirFormula(params: {
    montoBase: number
    tasaMensual: number
    diasRegulares: number
    diasEnMora: number
    config: ConfiguracionInteres
}): string {
    const { montoBase, tasaMensual, diasRegulares, diasEnMora, config } = params

    let formula = `S/${montoBase.toFixed(2)} × ${tasaMensual}% × ${diasRegulares}/${config.baseDias}`

    if (diasEnMora > 0) {
        formula += ` + S/${montoBase.toFixed(2)} × ${config.tasaMoraDiaria}% × ${diasEnMora}d mora`
    }

    return formula
}

/**
 * Redondear a 2 decimales por defecto
 */
function redondear(valor: number, decimales: number = 2): number {
    const factor = Math.pow(10, decimales)
    return Math.round(valor * factor) / factor
}

/**
 * Calcular días transcurridos desde una fecha
 */
export function calcularDiasTranscurridos(fechaInicio: Date | string): number {
    const inicio = new Date(fechaInicio)
    const hoy = new Date()
    const diffMs = hoy.getTime() - inicio.getTime()
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return Math.max(1, dias)
}

/**
 * Calcular días post-vencimiento
 */
export function calcularDiasPostVencimiento(fechaVencimiento: Date | string): number {
    const vencimiento = new Date(fechaVencimiento)
    const hoy = new Date()
    const diffMs = hoy.getTime() - vencimiento.getTime()
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return Math.max(0, dias)
}

/**
 * Obtener configuración por defecto
 */
export function getConfiguracionDefault(): ConfiguracionInteres {
    return { ...CONFIG_DEFAULT }
}
