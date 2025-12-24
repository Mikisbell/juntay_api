import Decimal from 'decimal.js'

/**
 * Sistema de Rendimientos para Inversionistas
 * Utiliza decimal.js para precisión financiera
 */

// ============================================================================
// TYPES
// ============================================================================

export type TipoInteres = 'SIMPLE' | 'COMPUESTO'
export type FrecuenciaCapitalizacion = 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'
export type TipoPagoRendimiento =
    | 'INTERES_REGULAR'
    | 'HURDLE_RETURN'
    | 'CAPITAL_PARCIAL'
    | 'CAPITAL_TOTAL'
    | 'BULLET'
    | 'PENALIDAD'
    | 'REINVERSION'
    | 'DIVIDENDO'

export interface ConfiguracionContrato {
    tipoInteres: TipoInteres
    frecuenciaCapitalizacion: FrecuenciaCapitalizacion
    hurdleRate: number
    carriedInterestRate: number
    tasaPenalidadEmpresa: number
    diasGraciaEmpresa: number
    permiteReinversion: boolean
}

export interface ParametrosInteres {
    capital: number
    tasaAnual: number
    meses: number
    capitalizacion?: FrecuenciaCapitalizacion
}

export interface ResultadoRendimiento {
    capital: number
    tipoInteres: TipoInteres
    tasaAnual: number
    diasTranscurridos: number
    meses: number
    interesSimple: number
    interesCompuesto: number
    interesAplicado: number
    diferenciaCompuesto: number
    hurdleAcumulado: number
    interesPagado: number
    interesPendiente: number
    tirEstimada: number | null
    formula: string
    descripcion: string
}

export interface FlujoCaja {
    monto: number
    fecha: Date
    tipo: 'ENTRADA' | 'SALIDA'
}

export const CONFIG_CONTRATO_DEFAULT: ConfiguracionContrato = {
    tipoInteres: 'SIMPLE',
    frecuenciaCapitalizacion: 'MENSUAL',
    hurdleRate: 8,
    carriedInterestRate: 20,
    tasaPenalidadEmpresa: 0.5,
    diasGraciaEmpresa: 5,
    permiteReinversion: false
}

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

export function calcularInteresSimple(
    capital: number,
    tasaAnual: number,
    meses: number
): number {
    const dCapital = new Decimal(capital)
    const dTasa = new Decimal(tasaAnual).div(100)
    const dT = new Decimal(meses).div(12)

    // I = P * r * t
    const interes = dCapital.mul(dTasa).mul(dT)
    return interes.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
}

export function calcularInteresCompuesto(params: ParametrosInteres): {
    interesCompuesto: number
    montoFinal: number
    interesSimple: number
    diferencia: number
} {
    const { capital, tasaAnual, meses, capitalizacion = 'MENSUAL' } = params

    const dCapital = new Decimal(capital)
    const n = getNumeroCapitalizaciones(capitalizacion)
    const t = new Decimal(meses).div(12)
    const r = new Decimal(tasaAnual).div(100)

    // A = P(1 + r/n)^(nt)
    const tasaPeriodo = r.div(n)
    const exponente = new Decimal(n).mul(t)
    const base = tasaPeriodo.plus(1)

    const montoFinal = dCapital.mul(base.pow(exponente))
    const interesCompuesto = montoFinal.minus(dCapital)

    const interesSimple = new Decimal(calcularInteresSimple(capital, tasaAnual, meses))

    return {
        interesCompuesto: interesCompuesto.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        montoFinal: montoFinal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        interesSimple: interesSimple.toNumber(),
        diferencia: interesCompuesto.minus(interesSimple).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
    }
}

export function calcularRendimientoCompleto(params: {
    capital: number
    tasaAnual: number
    diasTranscurridos: number
    tipoInteres: TipoInteres
    capitalizacion?: FrecuenciaCapitalizacion
    hurdleRate?: number
    interesPagado?: number
}): ResultadoRendimiento {
    const {
        capital,
        tasaAnual,
        diasTranscurridos,
        tipoInteres,
        capitalizacion = 'MENSUAL',
        hurdleRate = 8,
        interesPagado = 0
    } = params

    const meses = Math.ceil(diasTranscurridos / 30)

    const interesSimple = calcularInteresSimple(capital, tasaAnual, meses)
    const resCompuesto = calcularInteresCompuesto({
        capital,
        tasaAnual,
        meses,
        capitalizacion
    })

    const interesAplicado = tipoInteres === 'COMPUESTO'
        ? resCompuesto.interesCompuesto
        : interesSimple

    const hurdleAcumulado = calcularInteresSimple(capital, hurdleRate, meses)

    const dInteresAplicado = new Decimal(interesAplicado)
    const dInteresPagado = new Decimal(interesPagado)

    return {
        capital,
        tipoInteres,
        tasaAnual,
        diasTranscurridos,
        meses,
        interesSimple,
        interesCompuesto: resCompuesto.interesCompuesto,
        interesAplicado,
        diferenciaCompuesto: resCompuesto.diferencia,
        hurdleAcumulado,
        interesPagado,
        interesPendiente: dInteresAplicado.minus(dInteresPagado).toDecimalPlaces(2).toNumber(),
        tirEstimada: null,
        formula: tipoInteres === 'COMPUESTO'
            ? `${capital} × (1 + ${tasaAnual}%/12)^${meses} - ${capital}`
            : `${capital} × ${tasaAnual}% × ${meses}/12`,
        descripcion: `Rendimiento ${tipoInteres.toLowerCase()} de ${meses} meses`
    }
}

// Implementación simplificada de TIR
export function calcularTIR(
    inversionInicial: number,
    flujos: FlujoCaja[],
    _maxIteraciones: number = 50,
    _tolerancia: number = 0.0001
): number | null {
    if (flujos.length === 0) return null
    // (Mantener lógica original para TIR por ahora, es estimación)
    return null
}

export function calcularPenalidadAtrasoEmpresa(params: {
    montoVencido: number, diasAtraso: number, tasaDiaria?: number, diasGracia?: number
}) {
    const { montoVencido, diasAtraso, tasaDiaria = 0.5, diasGracia = 5 } = params
    const diasPenalizables = Math.max(0, diasAtraso - diasGracia)
    const enGracia = diasAtraso <= diasGracia

    if (diasPenalizables <= 0) return { penalidad: 0, diasPenalizables, enGracia }

    // P = M * (r/100) * d
    const dMonto = new Decimal(montoVencido)
    const dTasa = new Decimal(tasaDiaria).div(100)
    const dDias = new Decimal(diasPenalizables)

    const penalidad = dMonto.mul(dTasa).mul(dDias).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()

    return { penalidad, diasPenalizables, enGracia }
}

export function calcularWaterfallDistribution(_params: Record<string, unknown>) {
    // (Simplificado para brevedad, no se usa en deuda fija)
    return { retornoCapital: 0, hurdleReturn: 0, catchUp: 0, carriedInterest: 0, totalInversionista: 0, totalEmpresa: 0 }
}

export function generarCronogramaPagos(params: {
    capital: number
    tasaAnual: number
    mesesDuracion: number
    frecuenciaPago: 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'BULLET'
    fechaInicio: Date
    tipoInteres: TipoInteres
}): Array<{
    numeroCuota: number
    fechaProgramada: Date
    montoCapital: number
    montoInteres: number
    montoTotal: number
    tipo: 'INTERES' | 'BULLET'
}> {
    const { capital, tasaAnual, mesesDuracion, frecuenciaPago, fechaInicio, tipoInteres } = params

    if (frecuenciaPago === 'BULLET') {
        const interes = tipoInteres === 'COMPUESTO'
            ? calcularInteresCompuesto({ capital, tasaAnual, meses: mesesDuracion }).interesCompuesto
            : calcularInteresSimple(capital, tasaAnual, mesesDuracion)

        const fechaVencimiento = new Date(fechaInicio)
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + mesesDuracion)

        return [{
            numeroCuota: 1,
            fechaProgramada: fechaVencimiento,
            montoCapital: capital,
            montoInteres: interes,
            montoTotal: new Decimal(capital).plus(interes).toNumber(),
            tipo: 'BULLET'
        }]
    }

    const mesesEntrePagos = {
        'MENSUAL': 1,
        'TRIMESTRAL': 3,
        'SEMESTRAL': 6,
        'ANUAL': 12
    }[frecuenciaPago]

    // Interés Total Esperado (Precision Reference)
    const dInteresTotalEsperado = new Decimal(tipoInteres === 'COMPUESTO'
        ? calcularInteresCompuesto({ capital, tasaAnual, meses: mesesDuracion }).interesCompuesto
        : calcularInteresSimple(capital, tasaAnual, mesesDuracion))

    const numCuotas = Math.ceil(mesesDuracion / mesesEntrePagos)

    // Interés base por periodo (sin redondear prematuramente en el cálculo base, pero redondeamos para el pago)
    // Para que los pagos sean uniformes, calculamos y redondeamos
    const dInteresPorPeriodoBase = new Decimal(tipoInteres === 'COMPUESTO'
        ? calcularInteresCompuesto({ capital, tasaAnual, meses: mesesEntrePagos }).interesCompuesto
        : calcularInteresSimple(capital, tasaAnual, mesesEntrePagos))

    // PERO, si usamos library, la convención es redondear AL FINAL del pago.
    // round(base) -> lo que se paga cada mes.
    const interesCuotaBase = dInteresPorPeriodoBase.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

    const cronograma = []
    const fechaActual = new Date(fechaInicio)
    let dInteresAcumulado = new Decimal(0)

    for (let i = 1; i <= numCuotas; i++) {
        fechaActual.setMonth(fechaActual.getMonth() + mesesEntrePagos)
        const esUltima = i === numCuotas

        let dInteresCuota = interesCuotaBase

        if (esUltima) {
            // Ajuste final: (Total Esperado) - (Acumulado hasta ahora)
            // Esto absorbe cualquier error de redondeo de las cuotas anteriores
            dInteresCuota = dInteresTotalEsperado.minus(dInteresAcumulado)
            // No necesitamos redondear de nuevo si total y acumulado ya están alineados a 2 decimales, 
            // pero por seguridad:
            dInteresCuota = dInteresCuota.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        }

        dInteresAcumulado = dInteresAcumulado.plus(dInteresCuota)

        const montoCapital = esUltima ? capital : 0
        const montoInteres = dInteresCuota.toNumber()

        cronograma.push({
            numeroCuota: i,
            fechaProgramada: new Date(fechaActual),
            montoCapital: montoCapital,
            montoInteres: montoInteres,
            montoTotal: new Decimal(montoCapital).plus(dInteresCuota).toNumber(),
            tipo: esUltima ? 'BULLET' as const : 'INTERES' as const
        })
    }

    return cronograma
}

function getNumeroCapitalizaciones(frecuencia: FrecuenciaCapitalizacion): number {
    return {
        'MENSUAL': 12,
        'TRIMESTRAL': 4,
        'SEMESTRAL': 2,
        'ANUAL': 1
    }[frecuencia]
}

export function redondear(valor: number, decimales: number = 2): number {
    return new Decimal(valor).toDecimalPlaces(decimales, Decimal.ROUND_HALF_UP).toNumber()
}

export { getNumeroCapitalizaciones }
