/**
 * Schema RxDB para Movimientos de Caja - VERSIÓN SEGURA
 * 
 * Montos como STRING para precisión decimal (Opción 3B)
 */

import { RxJsonSchema } from 'rxdb'

export interface MovimientoCajaDocument {
    id: string
    caja_operativa_id: string
    tipo: 'INGRESO' | 'EGRESO'
    monto: string  // 💰 String para precisión decimal
    motivo: string
    descripcion?: string
    referencia_id?: string
    referencia_tipo?: string
    usuario_id: string
    fecha: string
    anulado?: boolean
    empleado_id?: string
    caja_id?: string
    saldo_nuevo?: number
    saldo_anterior?: number
    es_reversion?: boolean
    metadata?: any
    // Audit & Reversion Fields
    anulado_at?: string
    anulado_por?: string
    motivo_anulacion?: string
    movimiento_original_id?: string
    movimiento_reversion_id?: string
    ip_origen?: string
    user_agent?: string

}

export const movimientosCajaSchema: RxJsonSchema<MovimientoCajaDocument> = {
    version: 2, // Bump version to include audit fields
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 36
        },
        caja_operativa_id: {
            type: 'string',
            maxLength: 36
        },
        tipo: {
            type: 'string',
            maxLength: 10,  // Requerido para índice
            enum: ['INGRESO', 'EGRESO']
        },
        // 💰 Monto como STRING para precisión decimal
        monto: {
            type: 'string',
            maxLength: 20
        },
        motivo: {
            type: 'string',
            maxLength: 200
        },
        descripcion: {
            type: 'string',
            maxLength: 1000
        },
        referencia_id: {
            type: 'string',
            maxLength: 36
        },
        referencia_tipo: {
            type: 'string',
            maxLength: 50
        },
        usuario_id: {
            type: 'string',
            maxLength: 36
        },
        fecha: {
            type: 'string',
            maxLength: 30  // Requerido para índice
        },
        anulado: {
            type: 'boolean'
        },
        empleado_id: {
            type: 'string',
            maxLength: 36
        },
        caja_id: { // Alias de caja_operativa_id o referencia relacional
            type: 'string',
            maxLength: 36
        },
        saldo_nuevo: {
            type: 'number',
            minimum: 0,
            multipleOf: 0.01
        },
        saldo_anterior: {
            type: 'number',
            minimum: 0,
            multipleOf: 0.01
        },
        es_reversion: {
            type: 'boolean'
        },
        metadata: {
            type: 'object'
        },
        // Audit & Reversion Fields
        anulado_at: { type: 'string', maxLength: 30 },
        anulado_por: { type: 'string', maxLength: 36 },
        motivo_anulacion: { type: 'string', maxLength: 200 },
        movimiento_original_id: { type: 'string', maxLength: 36 },
        movimiento_reversion_id: { type: 'string', maxLength: 36 },
        ip_origen: { type: 'string', maxLength: 45 },
        user_agent: { type: 'string' }
    },
    required: ['id', 'caja_operativa_id', 'tipo', 'monto', 'motivo', 'usuario_id', 'fecha'],
    indexes: [
        'caja_operativa_id',
        'fecha',
        'tipo'
    ]
}
