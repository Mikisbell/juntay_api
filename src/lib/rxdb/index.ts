/**
 * RxDB - Base de datos local para operación offline-first
 * 
 * Exporta todas las funciones necesarias para usar RxDB en la aplicación.
 * 
 * @example
 * import { initDatabase, startReplication, getDatabase } from '@/lib/rxdb'
 * 
 * // Al inicio de la app
 * await initDatabase()
 * startReplication()
 * 
 * // Para usar la base de datos
 * const db = getDatabase()
 * const creditos = await db.creditos.find().exec()
 * 
 * // O usar hooks en componentes React
 * import { useCreditosLocales, useRegistrarPagoLocal } from '@/lib/rxdb/hooks'
 */

export {
    initDatabase,
    getDatabase,
    isDatabaseReady,
    destroyDatabase,
    type JuntayDatabase
} from './database'

export {
    startReplication,
    stopReplication,
    getReplicationState,
    forceSync
} from './replication'

// Schemas (para tipado)
export type { CreditoDocument } from './schemas/creditos'
export type { PagoDocument } from './schemas/pagos'
export type { MovimientoCajaDocument } from './schemas/movimientos-caja'

// Re-exportar hooks para acceso directo
export * from './hooks'
