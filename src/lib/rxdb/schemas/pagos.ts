/**
 * Schema RxDB para Pagos - VERSIÓN SEGURA
 * 
 * Montos como STRING para precisión decimal (Opción 3B)
 */

import { RxJsonSchema } from 'rxdb'

export interface PagoDocument {
    id: string
    credito_id: string
    tipo: 'interes' | 'capital' | 'desempeno' | 'mora' | 'renovacion'
    monto: string  // 💰 String para precisión decimal
    metodo_pago: 'efectivo' | 'yape' | 'plin' | 'transferencia'
    caja_operativa_id?: string
    usuario_id?: string
    observaciones?: string
    created_at?: string
}

export const pagosSchema: RxJsonSchema<PagoDocument> = {
    version: 0, // Versión inicial
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
            enum: ['interes', 'capital', 'desempeno', 'mora', 'renovacion']
        },
        // 💰 Monto como STRING para precisión decimal
        monto: {
            type: 'string',
            maxLength: 20
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
            maxLength: 30  // Requerido para índice
        }
    },
    required: ['id', 'credito_id', 'tipo', 'monto', 'metodo_pago'],
    indexes: [
        'credito_id'
        // Nota: created_at no puede indexarse porque no es required (limitación Dexie DXE1)
    ]
}
