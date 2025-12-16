/**
 * Utilidades de Precisión Decimal para Operaciones Financieras
 * 
 * OPCIÓN 3B: Usar strings + Decimal.js para TODAS las operaciones matemáticas
 * 
 * PROBLEMA: JavaScript usa IEEE 754 floats donde 0.1 + 0.2 = 0.30000000000000004
 * SOLUCIÓN: Decimal.js maneja precisión arbitraria
 * 
 * @example
 * import { dinero, sumar, restar, calcularInteres, formatearSoles } from '@/lib/utils/decimal'
 * 
 * const monto = dinero("1500.00")
 * const interes = calcularInteres(monto, "20") // 20%
 * const total = sumar(monto, interes)
 * console.log(formatearSoles(total)) // "S/ 1,800.00"
 */

import Decimal from 'decimal.js'

// Configuración de Decimal.js para finanzas
Decimal.set({
    precision: 20,           // Máxima precisión
    rounding: Decimal.ROUND_HALF_UP,  // Redondeo bancario estándar
    toExpNeg: -9,            // Evitar notación exponencial para números pequeños
    toExpPos: 20             // Evitar notación exponencial para números grandes
})

/**
 * Crea un objeto Decimal a partir de un string o número
 * @param valor - Valor en formato string (recomendado) o número
 * @returns Decimal con precisión arbitraria
 */
export function dinero(valor: string | number): Decimal {
    if (typeof valor === 'number') {
        console.warn('[Decimal] Se recibió un número, usar strings para mayor precisión')
    }
    return new Decimal(valor || 0)
}

/**
 * Suma dos o más valores con precisión decimal
 */
export function sumar(...valores: (string | number | Decimal)[]): Decimal {
    let resultado = new Decimal(0)
    for (const val of valores) {
        resultado = resultado.plus(new Decimal(val.toString()))
    }
    return resultado
}

/**
 * Resta valores con precisión decimal (a - b - c - ...)
 */
export function restar(primero: string | number, ...resto: (string | number)[]): Decimal {
    let resultado = new Decimal(primero)
    for (const val of resto) {
        resultado = resultado.minus(new Decimal(val))
    }
    return resultado
}

/**
 * Multiplica valores con precisión decimal
 */
export function multiplicar(...valores: (string | number | Decimal)[]): Decimal {
    let resultado = new Decimal(1)
    for (const val of valores) {
        resultado = resultado.times(new Decimal(val.toString()))
    }
    return resultado
}

/**
 * Divide con precisión decimal
 */
export function dividir(dividendo: string | number, divisor: string | number): Decimal {
    return new Decimal(dividendo).dividedBy(new Decimal(divisor))
}

/**
 * Calcula el interés simple sobre un monto
 * @param monto - Monto base (ej: "1500.00")
 * @param tasa - Tasa de interés en porcentaje (ej: "20" para 20%)
 * @returns Decimal con el valor del interés
 */
export function calcularInteres(monto: string | number, tasa: string | number): Decimal {
    const montoDecimal = new Decimal(monto)
    const tasaDecimal = new Decimal(tasa).dividedBy(100)
    return montoDecimal.times(tasaDecimal)
}

/**
 * Calcula el monto total (capital + interés)
 */
export function calcularMontoPagar(monto: string | number, tasa: string | number): Decimal {
    const capital = new Decimal(monto)
    const interes = calcularInteres(monto, tasa)
    return capital.plus(interes)
}

/**
 * Calcula la mora basada en días de retraso
 * @param monto - Monto base
 * @param tasaMora - Tasa de mora mensual en porcentaje
 * @param diasRetraso - Número de días de retraso
 * @returns Decimal con el valor de la mora
 */
export function calcularMora(
    monto: string | number,
    tasaMora: string | number,
    diasRetraso: number
): Decimal {
    const montoDecimal = new Decimal(monto)
    const tasaDiaria = new Decimal(tasaMora).dividedBy(30).dividedBy(100)
    return montoDecimal.times(tasaDiaria).times(diasRetraso)
}

/**
 * Redondea a 2 decimales y devuelve como string
 * Usar para almacenar en base de datos
 */
export function aString(valor: Decimal): string {
    return valor.toFixed(2)
}

/**
 * Formatea un valor como moneda peruana
 * @returns String formateado (ej: "S/ 1,500.00")
 */
export function formatearSoles(valor: string | number | Decimal): string {
    const decimal = new Decimal(valor)
    const numero = decimal.toNumber()
    return `S/ ${numero.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
}

/**
 * Formatea solo el número sin símbolo de moneda
 * @returns String formateado (ej: "1,500.00")
 */
export function formatearNumero(valor: string | number | Decimal): string {
    const decimal = new Decimal(valor)
    const numero = decimal.toNumber()
    return numero.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

/**
 * Compara si dos valores son iguales
 */
export function esIgual(a: string | number, b: string | number): boolean {
    return new Decimal(a).equals(new Decimal(b))
}

/**
 * Compara si a > b
 */
export function esMayor(a: string | number, b: string | number): boolean {
    return new Decimal(a).greaterThan(new Decimal(b))
}

/**
 * Compara si a < b
 */
export function esMenor(a: string | number, b: string | number): boolean {
    return new Decimal(a).lessThan(new Decimal(b))
}

/**
 * Retorna el máximo de una lista de valores
 */
export function maximo(...valores: (string | number)[]): Decimal {
    return Decimal.max(...valores.map(v => new Decimal(v)))
}

/**
 * Retorna el mínimo de una lista de valores
 */
export function minimo(...valores: (string | number)[]): Decimal {
    return Decimal.min(...valores.map(v => new Decimal(v)))
}

/**
 * Convierte centavos a soles
 * Útil si en algún momento usas enteros internamente
 */
export function centavosASoles(centavos: number): string {
    return new Decimal(centavos).dividedBy(100).toFixed(2)
}

/**
 * Convierte soles a centavos (entero)
 * Útil para operaciones que requieren enteros
 */
export function solesACentavos(soles: string | number): number {
    return new Decimal(soles).times(100).round().toNumber()
}

// Re-exportar Decimal para casos avanzados
export { Decimal }
