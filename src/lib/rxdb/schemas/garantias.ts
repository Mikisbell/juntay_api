/**
 * Schema RxDB para Garantías - Versión Offline-First
 * 
 * DECISIONES DE SEGURIDAD:
 * - Montos como STRING para precisión decimal (Opción 3B)
 * - Usar Decimal.js para todas las operaciones matemáticas
 */

import { RxJsonSchema } from 'rxdb'

export interface GarantiaDocument {
    id: string
    cliente_id: string | null
    credito_id: string | null
    categoria_id: string | null
    descripcion: string
    marca: string | null
    modelo: string | null
    serie: string | null
    placa: string | null
    anio: number | null
    kilometraje: number | null
    peso: number | null
    area: number | null
    capacidad: string | null
    quilataje: string | null
    partida_registral: string | null
    estado: string | null
    estado_bien: string | null
    subcategoria: string | null
    ubicacion: string | null
    // 💰 Montos como STRING para precisión decimal (Opción 3B)
    valor_tasacion: string
    valor_prestamo_sugerido: string | null
    precio_venta: string | null
    fecha_venta: string | null
    // Fotos
    fotos: string[] | null
    fotos_urls: string[] | null
    // Timestamps
    created_at: string | null
    updated_at: string | null
    // Campos RxDB para sincronización
    isDeleted: boolean
    updatedAt: string
}

export const garantiasSchema: RxJsonSchema<GarantiaDocument> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 36
        },
        cliente_id: {
            type: ['string', 'null'],
            maxLength: 36
        },
        credito_id: {
            type: ['string', 'null'],
            maxLength: 36
        },
        categoria_id: {
            type: ['string', 'null'],
            maxLength: 36
        },
        descripcion: {
            type: 'string',
            maxLength: 1000
        },
        marca: {
            type: ['string', 'null'],
            maxLength: 100
        },
        modelo: {
            type: ['string', 'null'],
            maxLength: 100
        },
        serie: {
            type: ['string', 'null'],
            maxLength: 100
        },
        placa: {
            type: ['string', 'null'],
            maxLength: 20
        },
        anio: {
            type: ['number', 'null']
        },
        kilometraje: {
            type: ['number', 'null']
        },
        peso: {
            type: ['number', 'null']
        },
        area: {
            type: ['number', 'null']
        },
        capacidad: {
            type: ['string', 'null'],
            maxLength: 50
        },
        quilataje: {
            type: ['string', 'null'],
            maxLength: 20
        },
        partida_registral: {
            type: ['string', 'null'],
            maxLength: 50
        },
        estado: {
            type: ['string', 'null'],
            maxLength: 30,
            enum: ['custodia', 'en_prestamo', 'en_remate', 'vendido', 'devuelto', 'perdido', null]
        },
        estado_bien: {
            type: ['string', 'null'],
            maxLength: 30,
            enum: ['nuevo', 'excelente', 'bueno', 'regular', 'malo', null]
        },
        subcategoria: {
            type: ['string', 'null'],
            maxLength: 100
        },
        ubicacion: {
            type: ['string', 'null'],
            maxLength: 200
        },
        // 💰 Montos como STRING para precisión decimal (Opción 3B)
        valor_tasacion: {
            type: 'string',
            maxLength: 20
        },
        valor_prestamo_sugerido: {
            type: ['string', 'null'],
            maxLength: 20
        },
        precio_venta: {
            type: ['string', 'null'],
            maxLength: 20
        },
        fecha_venta: {
            type: ['string', 'null'],
            maxLength: 30
        },
        // Fotos (arrays de strings)
        fotos: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        fotos_urls: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        // Timestamps
        created_at: {
            type: ['string', 'null'],
            maxLength: 30
        },
        updated_at: {
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
    required: ['id', 'descripcion', 'valor_tasacion', 'isDeleted', 'updatedAt'],
    indexes: [
        'updatedAt'
    ]
}

/**
 * Estados de garantía que indican que ya no está disponible
 */
export const ESTADOS_GARANTIA_FINALES = ['vendido', 'devuelto', 'perdido'] as const
