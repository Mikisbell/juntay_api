/**
 * Schema RxDB para Créditos - VERSIÓN SEGURA
 * 
 * DECISIONES DE SEGURIDAD (Auditoría 13-Dic-2025):
 * - Campos sensibles marcados con `encrypted: true`
 * - Montos almacenados como STRING para precisión decimal infinita (Opción 3B)
 * - Usar Decimal.js para todas las operaciones matemáticas
 */

import { RxJsonSchema } from 'rxdb'

export interface CreditoDocument {
    id: string
    codigo?: string // Added missing property matching schema
    codigo_credito: string
    cliente_id: string
    // 💰 Montos como string para precisión decimal (Opción 3B)
    monto_prestado: string      // Ej: "1500.00"
    saldo_pendiente: string     // Ej: "1800.00" 
    tasa_interes: string        // Ej: "20.00" (porcentaje)
    fecha_inicio: string
    fecha_vencimiento: string
    estado: 'aprobado' | 'vigente' | 'renovado' | 'vencido' | 'pagado' | 'remate' | 'vendido' | 'cancelado' | 'anulado'
    estado_detallado?: string
    usuario_id?: string
    caja_operativa_id?: string
    observaciones?: string
    created_at?: string
    updated_at?: string
    // Audit Fields
    created_by?: string
    updated_by?: string
    caja_origen_id?: string
    empresa_id?: string
    dias_transcurridos?: number
    periodo_dias?: number
    garantia_id?: string
    interes_devengado_actual?: string
    ip_creacion?: string
    user_agent_creacion?: string
    interes_acumulado?: number
    fecha_desembolso?: string

}

export const creditosSchema: RxJsonSchema<CreditoDocument> = {
    version: 3, // Added missing audit fields and fecha_desembolso
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 36
        },
        codigo: {
            type: 'string',
            maxLength: 50
        },
        codigo_credito: {
            type: 'string',
            maxLength: 50
        },
        // 🔒 Campo sensible - ENCRIPTADO
        cliente_id: {
            type: 'string',
            maxLength: 36
        },
        // 💰 Montos como STRING para precisión decimal (Opción 3B)
        monto_prestado: {
            type: 'string',
            maxLength: 20  // "999999999999.99"
        },
        saldo_pendiente: {
            type: 'string',
            maxLength: 20
        },
        tasa_interes: {
            type: 'string',
            maxLength: 10  // "99.99"
        },
        fecha_inicio: {
            type: 'string',
            maxLength: 30  // ISO date-time string
        },
        fecha_vencimiento: {
            type: 'string',
            maxLength: 30  // ISO date-time string (requerido para índice)
        },
        // Estados incluyendo terminales (para Opción 2C)
        estado: {
            type: 'string',
            maxLength: 20,  // Requerido para índice (SC34)
            // FIX: Added 'en_mora' and 'en_gracia' to prevent sync conflicts with Postgres
            enum: ['aprobado', 'vigente', 'renovado', 'vencido', 'pagado', 'remate', 'vendido', 'cancelado', 'anulado', 'en_mora', 'en_gracia']
        },
        estado_detallado: {
            type: 'string',
            maxLength: 50
        },
        usuario_id: {
            type: 'string',
            maxLength: 36
        },
        caja_operativa_id: {
            type: 'string',
            maxLength: 36
        },
        // 🔒 Campo sensible - contiene info del bien
        observaciones: {
            type: 'string',
            maxLength: 2000  // Limitar observaciones
        },
        created_at: {
            type: 'string',
            maxLength: 30
        },
        updated_at: {
            type: 'string',
            maxLength: 30
        },
        // Audit Fields
        created_by: { type: 'string', maxLength: 36 },
        updated_by: { type: 'string', maxLength: 36 },
        caja_origen_id: { type: 'string', maxLength: 36 },
        empresa_id: { type: 'string', maxLength: 36 },
        dias_transcurridos: { type: 'number' },
        periodo_dias: { type: 'number' },
        garantia_id: { type: 'string', maxLength: 36 },
        interes_devengado_actual: { type: 'string' }, // Numeric string
        interes_acumulado: { type: 'number' },
        fecha_desembolso: { type: 'string', maxLength: 30 },
        ip_creacion: { type: 'string' },
        user_agent_creacion: { type: 'string' }
    },
    required: ['id', 'codigo_credito', 'cliente_id', 'monto_prestado', 'saldo_pendiente', 'tasa_interes', 'fecha_inicio', 'fecha_vencimiento', 'estado'],
    indexes: [
        'cliente_id',
        'estado',
        'fecha_vencimiento',
        'codigo_credito'
    ],
    // 🔒 Campos que serán encriptados en IndexedDB
    encrypted: [
        'cliente_id',
        'observaciones'
    ]
}

/**
 * Estados terminales que siempre ganan en conflictos (Opción 2C)
 */
export const ESTADOS_TERMINALES = ['cancelado', 'vendido', 'remate', 'anulado', 'pagado'] as const

/**
 * Jerarquía de estados para resolución de conflictos
 * Mayor número = mayor prioridad
 */
export const ESTADO_PRIORIDAD: Record<string, number> = {
    'aprobado': 1,
    'vigente': 2,
    'por_vencer': 2,   // Added for completeness
    'en_gracia': 3,    // Added missing state
    'vencido': 3,
    'renovado': 4,
    'en_mora': 5,
    'pagado': 10,      // Terminal
    'remate': 11,      // Terminal
    'vendido': 12,     // Terminal
    'cancelado': 13,   // Terminal
    'anulado': 14      // Terminal (máxima prioridad)
}
