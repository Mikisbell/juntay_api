/**
 * Schema RxDB para Pagos - ALINEADO CON BBDD (Supabase)
 * 
 * Correcciones:
 * 1. Incluye 'monto_total' y campos de desglose.
 * 2. Enum 'tipo' ampliado para incluir 'PAGO' (usado en seeding).
 * 3. maxLength de 'created_at' aumentado a 60 para timestamps ISO completos.
 * 4. Campos faltantes agregados (metadata, anulado, etc.)
 */

import { RxJsonSchema } from 'rxdb'

export interface PagoDocument {
    id: string
    credito_id: string
    tipo: 'interes' | 'capital' | 'desempeno' | 'mora' | 'renovacion' | 'PAGO'
    monto: string  // 💰 String para precisión decimal (mantiene convención RxDB)
    monto_total?: number | null // Campo de BBDD
    metodo_pago: 'efectivo' | 'yape' | 'plin' | 'transferencia'
    caja_operativa_id?: string
    usuario_id?: string
    observaciones?: string
    created_at?: string
    // Nuevos campos para coincidir con BBDD
    desglose_capital?: number | null
    desglose_interes?: number | null
    desglose_mora?: number | null
    fecha_pago?: string | null
    medio_pago?: string | null
    metadata?: Record<string, unknown> | null
    anulado?: boolean | null
    motivo_anulacion?: string | null
    anulado_por?: string | null
    anulado_at?: string | null
}

export const pagosSchema: RxJsonSchema<PagoDocument> = {
    version: 3,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 36
        },
        credito_id: {
            type: 'string',
            maxLength: 36
        },
        tipo: {
            type: 'string',
            maxLength: 20,
            // Agregado 'PAGO' que aparecía en los errores
            enum: ['interes', 'capital', 'desempeno', 'mora', 'renovacion', 'PAGO']
        },
        // 💰 Monto principal como STRING para manejo seguro de decimales en UI
        monto: {
            type: 'string',
            maxLength: 20
        },
        // Campo numérico directo de la base de datos
        monto_total: {
            type: ['number', 'null']
        },
        metodo_pago: {
            type: 'string',
            maxLength: 20,
            enum: ['efectivo', 'yape', 'plin', 'transferencia']
        },
        caja_operativa_id: {
            type: 'string',
            maxLength: 36
        },
        usuario_id: {
            type: 'string',
            maxLength: 36
        },
        observaciones: {
            type: 'string',
            maxLength: 1000
        },
        created_at: {
            type: 'string',
            // Aumentado de 30 a 60 para soportar timestamps ISO largos (ej: con microsegundos)
            maxLength: 60
        },
        // --- Campos faltantes agregados ---
        desglose_capital: {
            type: ['number', 'null']
        },
        desglose_interes: {
            type: ['number', 'null']
        },
        desglose_mora: {
            type: ['number', 'null']
        },
        fecha_pago: {
            type: ['string', 'null'],
            maxLength: 60
        },
        medio_pago: {
            type: ['string', 'null'],
            maxLength: 50
        },
        metadata: {
            type: ['object', 'null']
        },
        anulado: {
            type: ['boolean', 'null']
        },
        motivo_anulacion: {
            type: ['string', 'null'],
            maxLength: 500
        },
        anulado_por: {
            type: ['string', 'null'],
            maxLength: 36
        },
        anulado_at: {
            type: ['string', 'null'],
            maxLength: 60
        }
    },
    required: ['id', 'credito_id', 'tipo', 'monto', 'metodo_pago'],
    indexes: [
        'credito_id'
    ]
}
