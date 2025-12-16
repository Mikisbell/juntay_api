// ============================================================================
// Types: Créditos y Estados del Ciclo de Vida
// Fecha: 2025-11-24
// Descripción: Definiciones TypeScript para el sistema de préstamos
// ============================================================================

/**
 * Estados del ciclo vida de un crédito
 */
export enum EstadoCredito {
    VIGENTE = 'vigente',          // Crédito activo, al día
    AL_DIA = 'al_dia',            // Pagó última cuota puntualmente
    POR_VENCER = 'por_vencer',    // Falta menos de 7 días para vencimiento
    VENCIDO = 'vencido',          // Pasó fecha de vencimiento (1-15 días)
    EN_MORA = 'en_mora',          // Más de 15 días vencido
    EN_GRACIA = 'en_gracia',      // Periodo de gracia antes de remate (30-60 días)
    PRE_REMATE = 'pre_remate',    // Notificado para remate (60+ días)
    EN_REMATE = 'en_remate',      // Bien publicado para venta
    CANCELADO = 'cancelado',      // Pagado completamente
    RENOVADO = 'renovado',        // Renovado con nuevo plazo
    EJECUTADO = 'ejecutado',      // Bien vendido en remate
    ANULADO = 'anulado'           // Contrato anulado (error operativo)
}

/**
 * Interface completa del crédito
 */
export interface Credito {
    id: string
    codigo: string
    cliente_id: string
    garantia_id: string
    caja_origen_id: string
    empresa_id: string | null
    monto_prestado: number
    tasa_interes: number
    periodo_dias: number
    fecha_desembolso: string
    fecha_vencimiento: string
    saldo_pendiente: number
    interes_acumulado: number
    estado: string // Legacy field
    estado_detallado: EstadoCredito // ✨ NUEVO
    created_at: string
    frecuencia_pago: string | null
    cronograma: unknown | null
}

/**
 * Resumen de estados de la cartera
 */
export interface ResumenEstados {
    vigente: number
    al_dia: number
    por_vencer: number
    vencido: number
    en_mora: number
    en_gracia: number
    pre_remate: number
    en_remate: number
    cancelado: number
    renovado: number
    ejecutado: number
    anulado: number
    total: number
}

/**
 * Helper type para filtros de estado
 */
export type EstadoCreditoKey = keyof typeof EstadoCredito

/**
 * Configuración de visualización por estado
 */
export interface EstadoConfig {
    label: string
    color: string
    icon: string
    descripcion: string
}
