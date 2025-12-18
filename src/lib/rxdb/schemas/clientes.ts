/**
 * Schema RxDB para Clientes - Versión Offline-First
 * 
 * DECISIONES DE SEGURIDAD:
 * - `score_crediticio` encriptado (dato sensible)
 * - `numero_documento` encriptado (PII)
 * - Montos como STRING para precisión (Opción 3B)
 */

import { RxJsonSchema } from 'rxdb'

export interface ClienteDocument {
    id: string
    numero_documento: string
    tipo_documento: string
    nombres: string | null
    apellido_paterno: string | null
    apellido_materno: string | null
    telefono_principal: string | null
    telefono_secundario: string | null
    email: string | null
    direccion: string | null
    departamento: string | null
    provincia: string | null
    distrito: string | null
    ubigeo_cod: string | null
    score_crediticio: number | null
    activo: boolean
    persona_id: string | null
    empresa_id: string | null
    created_at: string | null
    // Campos RxDB para sincronización
    isDeleted: boolean
    updatedAt: string
}

export const clientesSchema: RxJsonSchema<ClienteDocument> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 36
        },
        // 🔒 Campo sensible - ENCRIPTADO (PII)
        numero_documento: {
            type: 'string',
            maxLength: 20
        },
        tipo_documento: {
            type: 'string',
            maxLength: 10,
            enum: ['DNI', 'RUC', 'CE', 'PASAPORTE']
        },
        nombres: {
            type: ['string', 'null'],
            maxLength: 100
        },
        apellido_paterno: {
            type: ['string', 'null'],
            maxLength: 50
        },
        apellido_materno: {
            type: ['string', 'null'],
            maxLength: 50
        },
        telefono_principal: {
            type: ['string', 'null'],
            maxLength: 20
        },
        telefono_secundario: {
            type: ['string', 'null'],
            maxLength: 20
        },
        email: {
            type: ['string', 'null'],
            maxLength: 100
        },
        direccion: {
            type: ['string', 'null'],
            maxLength: 500
        },
        departamento: {
            type: ['string', 'null'],
            maxLength: 50
        },
        provincia: {
            type: ['string', 'null'],
            maxLength: 50
        },
        distrito: {
            type: ['string', 'null'],
            maxLength: 50
        },
        ubigeo_cod: {
            type: ['string', 'null'],
            maxLength: 10
        },
        // 🔒 Campo sensible - ENCRIPTADO
        score_crediticio: {
            type: ['number', 'null']
        },
        activo: {
            type: 'boolean'
        },
        persona_id: {
            type: ['string', 'null'],
            maxLength: 36
        },
        empresa_id: {
            type: ['string', 'null'],
            maxLength: 36
        },
        created_at: {
            type: ['string', 'null'],
            maxLength: 30
        },
        // Campos de sincronización RxDB
        isDeleted: {
            type: 'boolean'
        },
        updatedAt: {
            type: 'string',
            maxLength: 30
        }
    },
    required: ['id', 'numero_documento', 'tipo_documento', 'activo', 'isDeleted', 'updatedAt'],
    indexes: [
        'numero_documento',
        'activo',
        'updatedAt'
    ],
    // 🔒 Campos que serán encriptados en IndexedDB
    encrypted: [
        'numero_documento',
        'score_crediticio'
    ]
}
