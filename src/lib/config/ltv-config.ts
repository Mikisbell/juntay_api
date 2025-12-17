/**
 * Configuración de LTV (Loan-to-Value) por categoría
 * 
 * Estos valores definen el porcentaje máximo del valor de mercado
 * que se puede prestar según la categoría del bien.
 * 
 * Rango permitido: 30% - 85% (según SYSTEM_BLUEPRINT)
 */

export interface LTVConfig {
    /** LTV sugerido por defecto para esta categoría */
    sugerido: number
    /** LTV mínimo permitido */
    minimo: number
    /** LTV máximo permitido */
    maximo: number
}

/**
 * Matriz de LTV por categoría de bien
 * Valores en porcentaje (0-100)
 */
export const LTV_POR_CATEGORIA: Record<string, LTVConfig> = {
    // Electrónicos - Alta depreciación
    electronica: { sugerido: 50, minimo: 30, maximo: 60 },

    // Joyería - Valor estable
    joyeria: { sugerido: 70, minimo: 50, maximo: 85 },

    // Vehículos - Valor documentado
    vehiculos: { sugerido: 60, minimo: 40, maximo: 70 },

    // Herramientas - Valor medio
    herramientas: { sugerido: 55, minimo: 35, maximo: 65 },

    // Electrodomésticos - Depreciación rápida
    electrodomesticos: { sugerido: 45, minimo: 30, maximo: 55 },

    // Instrumentos musicales - Valor variable
    instrumentos: { sugerido: 50, minimo: 35, maximo: 65 },

    // Artículos deportivos
    deportes: { sugerido: 45, minimo: 30, maximo: 55 },

    // Antigüedades - Alto valor potencial
    antiguedades: { sugerido: 60, minimo: 40, maximo: 80 },

    // Categoría "Otro" - Conservador por defecto
    otro: { sugerido: 40, minimo: 30, maximo: 50 },

    // Default para categorías no catalogadas
    default: { sugerido: 50, minimo: 30, maximo: 60 }
}

/**
 * Factor de ajuste por estado del bien
 */
export const FACTOR_POR_ESTADO: Record<string, number> = {
    'EXCELENTE': 1.0,   // 100% del LTV
    'BUENO': 0.90,      // 90% del LTV
    'REGULAR': 0.75,    // 75% del LTV
    'MALO': 0.50        // 50% del LTV
}

/**
 * Obtiene la configuración LTV para una categoría
 */
export function getLTVConfig(categoria: string): LTVConfig {
    const key = categoria.toLowerCase()
    return LTV_POR_CATEGORIA[key] || LTV_POR_CATEGORIA.default
}

/**
 * Calcula el LTV ajustado por estado del bien
 */
export function calcularLTVAjustado(
    categoria: string,
    estadoBien: string
): { ltv: number; factorEstado: number; config: LTVConfig } {
    const config = getLTVConfig(categoria)
    const factorEstado = FACTOR_POR_ESTADO[estadoBien] || FACTOR_POR_ESTADO.BUENO

    // LTV ajustado = sugerido * factor de estado
    const ltvAjustado = Math.round(config.sugerido * factorEstado)

    // Asegurar que esté dentro de los límites
    const ltv = Math.max(config.minimo, Math.min(config.maximo, ltvAjustado))

    return { ltv, factorEstado, config }
}

/**
 * Calcula el monto máximo de préstamo
 */
export function calcularMontoMaximo(
    valorMercado: number,
    categoria: string,
    estadoBien: string
): { montoMaximo: number; ltv: number; desglose: string } {
    const { ltv, factorEstado, config } = calcularLTVAjustado(categoria, estadoBien)
    const montoMaximo = Math.round(valorMercado * (ltv / 100))

    const desglose = `Valor: S/${valorMercado} × LTV ${config.sugerido}% × Estado ${Math.round(factorEstado * 100)}% = S/${montoMaximo}`

    return { montoMaximo, ltv, desglose }
}
