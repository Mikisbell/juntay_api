/**
 * Configuración de Replicación RxDB <-> Supabase - VERSIÓN SEGURA
 * Sincronización bidireccional con la nube
 * 
 * DECISIONES DE SEGURIDAD (Auditoría 13-Dic-2025):
 * - Opción 2C: Resolución de conflictos vía PostgreSQL triggers
 *   El plugin replicateSupabase no soporta conflictHandler en cliente
 *   Se implementará con triggers BEFORE UPDATE en PostgreSQL que verifican estados terminales
 * 
 * @see ADR-004: Arquitectura Local-First Real con RxDB
 */

import { replicateSupabase } from 'rxdb/plugins/replication-supabase'
import { RxReplicationState } from 'rxdb/plugins/replication'
import { createClient } from '@supabase/supabase-js'
import { getDatabase, JuntayDatabase } from './database'
import { ESTADOS_TERMINALES } from './schemas/creditos'
import { toast } from 'sonner'

// Cliente Supabase para replicación (usa anon key, RLS protege los datos)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const replicationClient = createClient(supabaseUrl, supabaseAnonKey)

// Estado de las replicaciones
interface ReplicationStates {
    creditos: RxReplicationState<any, any> | null
    pagos: RxReplicationState<any, any> | null
    movimientos_caja: RxReplicationState<any, any> | null
}

let replications: ReplicationStates = {
    creditos: null,
    pagos: null,
    movimientos_caja: null
}

/**
 * Inicia la sincronización con Supabase
 * Debe llamarse después de initDatabase()
 * 
 * NOTA: La resolución de conflictos (Opción 2C) se implementa en PostgreSQL:
 * - Los estados terminales (ANULADO, VENDIDO, etc.) no pueden ser sobrescritos
 * - Los montos solo pueden ser actualizados por usuarios con permisos especiales
 * - Ver migración: supabase/migrations/20251213000003_conflict_resolution_triggers.sql
 */
export async function startReplication(): Promise<void> {
    const db = getDatabase()

    console.log('[RxDB Replication] Iniciando sincronización con Supabase...')

    // Replicación de Créditos
    replications.creditos = replicateSupabase({
        replicationIdentifier: 'creditos-supabase-v2',
        collection: db.creditos,
        client: replicationClient,
        tableName: 'creditos',
        live: true,
        pull: {
            batchSize: 100,
            modifier: (doc) => {
                // Mapear campos null a undefined para RxDB
                Object.keys(doc).forEach(key => {
                    if (doc[key] === null) delete doc[key]
                })
                // Convertir montos numéricos a strings si vienen de Supabase
                if (typeof doc.monto_prestado === 'number') {
                    doc.monto_prestado = doc.monto_prestado.toFixed(2)
                }
                if (typeof doc.saldo_pendiente === 'number') {
                    doc.saldo_pendiente = doc.saldo_pendiente.toFixed(2)
                }
                if (typeof doc.tasa_interes === 'number') {
                    doc.tasa_interes = doc.tasa_interes.toFixed(2)
                }
                return doc
            }
        },
        push: {
            batchSize: 50,
            modifier: (doc) => {
                // FIX: Removed parseFloat to preserve Decimal.js 128-bit precision
                // Supabase handles string-to-numeric casting automatically or we should use string in Postgres if needed.
                // However, since Postgres is numeric, we send the string. 
                // Postgres 'numeric' type can accept string representations of numbers in JSON/Insert.
                const supabaseDoc = { ...doc }

                // Ensure we are sending valid strings for numeric fields
                // We do NOT convert to JS number to avoid IEEE 754 errors
                return supabaseDoc
            }
        }
    })

    // Manejar errores de replicación
    replications.creditos.error$.subscribe(err => {
        console.error('[RxDB Replication] Error en créditos:', err)

        // Si es un error de conflicto, puede ser que el servidor rechazó el cambio
        // (por ejemplo, intentar modificar un crédito terminado)
        if (err.code === 'CONFLICT' || err.message?.includes('estado terminal')) {
            console.warn('[RxDB Replication] Conflicto detectado - el servidor rechazó el cambio')
            toast.error('Conflicto de sincronización: El servidor rechazó el cambio (Posible estado terminal o bloqueo de seguridad).')
        }
    })

    // Replicación de Pagos
    replications.pagos = replicateSupabase({
        replicationIdentifier: 'pagos-supabase-v2',
        collection: db.pagos,
        client: replicationClient,
        tableName: 'pagos',
        live: true,
        pull: {
            batchSize: 100,
            modifier: (doc) => {
                // Remove null values
                Object.keys(doc).forEach(key => {
                    if (doc[key] === null) delete doc[key]
                })
                // Convert monto to string
                if (typeof doc.monto === 'number') {
                    doc.monto = doc.monto.toFixed(2)
                }
                // If monto is missing but monto_total exists, use it
                if (!doc.monto && doc.monto_total) {
                    doc.monto = typeof doc.monto_total === 'number'
                        ? doc.monto_total.toFixed(2)
                        : String(doc.monto_total)
                }
                // Strip extra columns that Supabase returns but RxDB doesn't have
                delete doc.monto_total
                delete doc.fecha_pago
                delete doc.anulado
                delete doc.motivo_anulacion
                delete doc.anulado_por
                delete doc.anulado_at
                delete doc.desglose_capital
                delete doc.desglose_interes
                delete doc.desglose_mora
                delete doc.medio_pago
                delete doc.metadata
                return doc
            }
        },
        push: {
            batchSize: 50,
            modifier: (doc) => {
                const supabaseDoc = { ...doc }
                // FIX: Preserving precision by sending strings
                return supabaseDoc
            }
        }
    })

    replications.pagos.error$.subscribe(err => {
        console.error('[RxDB Replication] Error en pagos:', err)
    })

    // Replicación de Movimientos de Caja
    replications.movimientos_caja = replicateSupabase({
        replicationIdentifier: 'movimientos-caja-supabase-v2',
        collection: db.movimientos_caja,
        client: replicationClient,
        tableName: 'movimientos_caja_operativa',
        live: true,
        pull: {
            batchSize: 100,
            modifier: (doc) => {
                Object.keys(doc).forEach(key => {
                    if (doc[key] === null) delete doc[key]
                })
                if (typeof doc.monto === 'number') {
                    doc.monto = doc.monto.toFixed(2)
                }
                return doc
            }
        },
        push: {
            batchSize: 50,
            modifier: (doc) => {
                const supabaseDoc = { ...doc }
                // FIX: Preserving precision by sending strings
                return supabaseDoc
            }
        }
    })

    replications.movimientos_caja.error$.subscribe(err => {
        console.error('[RxDB Replication] Error en movimientos de caja:', err)
    })

    // Esperar a que la primera sincronización se complete
    try {
        await Promise.all([
            replications.creditos.awaitInitialReplication(),
            replications.pagos.awaitInitialReplication(),
            replications.movimientos_caja.awaitInitialReplication()
        ])
        console.log('[RxDB Replication] ✅ Sincronización inicial completada')
    } catch (error) {
        console.error('[RxDB Replication] Error en sincronización inicial:', error)
        // No lanzar error, la app debe funcionar offline
    }
}

/**
 * Detiene todas las replicaciones
 */
export async function stopReplication(): Promise<void> {
    console.log('[RxDB Replication] Deteniendo sincronización...')

    await Promise.all([
        replications.creditos?.cancel(),
        replications.pagos?.cancel(),
        replications.movimientos_caja?.cancel()
    ])

    replications = {
        creditos: null,
        pagos: null,
        movimientos_caja: null
    }

    console.log('[RxDB Replication] Sincronización detenida')
}

/**
 * Obtiene el estado actual de la replicación
 */
export function getReplicationState(): {
    isActive: boolean
    pendingChanges: number
    lastSync: Date | null
} {
    const isActive = replications.creditos !== null

    return {
        isActive,
        pendingChanges: 0, // TODO: Implementar conteo real
        lastSync: null
    }
}

/**
 * Fuerza una sincronización inmediata
 */
export async function forceSync(): Promise<void> {
    if (replications.creditos) {
        await replications.creditos.reSync()
    }
    if (replications.pagos) {
        await replications.pagos.reSync()
    }
    if (replications.movimientos_caja) {
        await replications.movimientos_caja.reSync()
    }
}
