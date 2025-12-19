/**
 * RxDB Database Configuration - VERSIÓN SEGURA
 * Base de datos local para operación offline-first CON ENCRIPTACIÓN
 * 
 * DECISIONES DE SEGURIDAD (Auditoría 13-Dic-2025):
 * - Opción 1A: Encriptación derivada de sesión de usuario
 * - Opción 2C: Conflict handler con estados terminales
 * - Opción 3B: Montos como strings + Decimal.js
 * 
 * @see ADR-004: Arquitectura Local-First Real con RxDB
 */

import { createRxDatabase, RxDatabase, addRxPlugin, removeRxDatabase, RxStorage } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema'
import { creditosSchema } from './schemas/creditos'
import { pagosSchema } from './schemas/pagos'
import { movimientosCajaSchema } from './schemas/movimientos-caja'
import { clientesSchema } from './schemas/clientes'
import { garantiasSchema } from './schemas/garantias'
import { createClient } from '@/lib/supabase/client'

// Habilitar plugins
if (process.env.NODE_ENV === 'development') {
    addRxPlugin(RxDBDevModePlugin)
}
addRxPlugin(RxDBQueryBuilderPlugin)
addRxPlugin(RxDBUpdatePlugin)
addRxPlugin(RxDBMigrationSchemaPlugin)

// Tipo de la base de datos
export type JuntayDatabase = RxDatabase

// Instancia singleton
let dbInstance: JuntayDatabase | null = null
let initPromise: Promise<JuntayDatabase> | null = null

// Salt de la aplicación (debe estar en variable de entorno en producción)
const APP_ENCRYPTION_SALT = process.env.NEXT_PUBLIC_APP_SECRET_SALT || 'juntay_secure_salt_2025'

/**
 * Obtiene las credenciales de base de datos del usuario actual
 */
async function getDatabaseCredentials(): Promise<{ password: string; userId: string }> {
    // Solo en cliente
    if (typeof window === 'undefined') {
        throw new Error('getDatabaseCredentials solo puede ejecutarse en el cliente')
    }

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.id) {
        // Para desarrollo, usar credenciales por defecto
        if (process.env.NODE_ENV === 'development') {
            console.warn('[RxDB] Sin sesión - usando credenciales de desarrollo')
            return {
                password: 'dev_password_' + APP_ENCRYPTION_SALT,
                userId: 'dev_user'
            }
        }
        throw new Error('Usuario no autenticado - no se puede desencriptar la base de datos local')
    }

    // Combinar ID del usuario con salt de la aplicación
    const password = session.user.id + APP_ENCRYPTION_SALT
    console.log('[RxDB] Credenciales derivadas para usuario:', session.user.id)

    return { password, userId: session.user.id }
}

/**
 * Inicializa la base de datos RxDB local con ENCRIPTACIÓN
 * Singleton con protección de condiciones de carrera (React Strict Mode)
 */
export async function initDatabase(): Promise<JuntayDatabase> {
    // Si ya existe instancia, devolverla
    if (dbInstance) return dbInstance

    // Si hay una inicialización en curso, esperar a esa misma promesa
    if (initPromise) return initPromise

    console.log('[RxDB] Inicializando base de datos local ENCRIPTADA...')

    initPromise = (async () => {
        try {
            // Obtener credenciales
            const { password, userId } = await getDatabaseCredentials()

            // Storage base: Dexie.js (IndexedDB)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let baseStorage: RxStorage<any, any> = getRxStorageDexie()

            // En desarrollo, usar validación de schema (requerido por RxDB DVM1)
            if (process.env.NODE_ENV === 'development') {
                baseStorage = wrappedValidateAjvStorage({ storage: baseStorage })
            }

            // Storage encriptado usando crypto-js
            const encryptedStorage = wrappedKeyEncryptionCryptoJsStorage({
                storage: baseStorage
            })

            // ARQUITECTURA MULTI-USUARIO:
            // Cada usuario tiene su propia base de datos local aislada.
            // Esto evita el error DB1 (password mismatch) al cambiar de usuario.
            const dbNameBase = `juntay_encrypted_v1_${userId}`

            const createDB = async (name: string) => {
                return await createRxDatabase({
                    name: name,
                    storage: encryptedStorage,
                    password: password, // 🔒 Encriptación activada
                    multiInstance: true,
                    eventReduce: true,
                    ignoreDuplicate: true
                })
            }

            let instance: JuntayDatabase

            try {
                instance = await createDB(dbNameBase)
            } catch (err: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const error = err as any; // Cast for specific RxDB properties
                // Manejar error de contraseña incorrecta (DB1)
                if (error?.code === 'DB1' || error?.message?.includes('password') || error?.message?.includes('different password')) {
                    console.warn('[RxDB] Diferencia de contraseña crítica (DB1). Intentando recuperación...')

                    // Estrategia 1: Limpieza estándar (puede fallar si hay pestañas abiertas)
                    try {
                        await removeRxDatabase(dbNameBase, encryptedStorage)
                    } catch (e) {
                        console.warn('[RxDB] Limpieza estándar falló:', e)
                    }

                    // Estrategia 2: Nuevo nombre de base de datos (Bypass total)
                    const recoveryDbName = `${dbNameBase}_rec_${Date.now()}` // Timestamp único por sesión de recuperación
                    console.log(`[RxDB] Creando base de datos de recuperación: ${recoveryDbName}`)

                    try {
                        instance = await createDB(recoveryDbName)
                        console.log('[RxDB] ✅ Base de datos recuperada exitosamente (Instancia nueva)')

                        // Intentar limpieza de basura vieja en segundo plano
                        if (typeof window !== 'undefined' && window.indexedDB) {
                            setTimeout(async () => {
                                try {
                                    const dbs = await window.indexedDB.databases()
                                    // Borrar cualquier db vieja que no sea la actual
                                    dbs.forEach(db => {
                                        if (db.name && db.name.includes('juntay_encrypted') && db.name !== recoveryDbName) {
                                            console.log('[RxDB Cleanup] Borrando DB obsoleta:', db.name)
                                            window.indexedDB.deleteDatabase(db.name)
                                        }
                                    })
                                } catch (e) { console.error('Cleanup error', e) }
                            }, 5000)
                        }

                    } catch (recoveryErr) {
                        console.error('[RxDB] Falló incluso la recuperación con nueva DB:', recoveryErr)
                        throw recoveryErr
                    }
                } else {
                    console.error('[RxDB] Error fatal no recuperable:', err)
                    throw err
                }
            }

            if (!instance) {
                throw new Error('No se pudo inicializar la instancia de base de datos')
            }

            // Agregar colecciones con schemas actualizados
            try {
                await instance.addCollections({
                    creditos: {
                        schema: creditosSchema,
                        migrationStrategies: {
                            1: (oldDoc: unknown) => oldDoc, // Campos opcionales añadidos
                            2: (oldDoc: unknown) => oldDoc,  // Añadido campo 'codigo'
                            3: (oldDoc: unknown) => oldDoc   // Añadido 'fecha_desembolso' y 'interes_acumulado'
                        }
                    },
                    pagos: {
                        schema: pagosSchema,
                        migrationStrategies: {
                            // 1: Migración a versión 1 (Agregar campos faltantes y corregir tipos)
                            1: (oldDoc: unknown) => oldDoc,
                            // 2: Make monto_total optional
                            2: (oldDoc: unknown) => oldDoc,
                            // 3: Fix DB6 conflict
                            3: (oldDoc: unknown) => oldDoc
                        }
                    },
                    movimientos_caja: {
                        schema: movimientosCajaSchema,
                        migrationStrategies: {
                            // 1: Migración a versión 1 (Agregar campos faltantes como anulado, saldo_nuevo, etc)
                            1: (oldDoc: unknown) => oldDoc,
                            // 2: Migración a versión 2 (Agregar campos de auditoría)
                            2: (oldDoc: unknown) => oldDoc
                        }
                    },
                    clientes: {
                        schema: clientesSchema,
                        migrationStrategies: {}
                    },
                    garantias: {
                        schema: garantiasSchema,
                        migrationStrategies: {}
                    }
                })
            } catch (err: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const error = err as any
                // DM4: Error de migración
                // DB closed: Base de datos cerrada inesperadamente durante migración
                // DB6: Schema mismatch (otro tab o instancia creó coleccion con diferente schema)
                if (error?.code === 'DM4' || error?.code === 'DB6' || error?.message?.includes('closed')) {
                    console.error('[RxDB] Error CRÍTICO de esquema/migración. Reseteando base de datos local...', error)

                    try {
                        await instance.remove()
                        console.log('[RxDB] Base de datos eliminada por fallo de migración. Se recreará en la próxima recarga.')
                    } catch (removeErr) {
                        console.error('[RxDB] Error intentando eliminar DB corrupta:', removeErr)
                    }

                    // Lanzar error explicativo para el Provider
                    throw new Error('La base de datos local se ha reiniciado por una actualización de esquema. Por favor recarga la página.')
                }
                throw error
            }

            console.log('[RxDB] ✅ Base de datos local ENCRIPTADA inicializada correctamente')

            dbInstance = instance
            return dbInstance

        } catch (error) {
            console.error('[RxDB] Error inicializando base de datos:', error)
            initPromise = null // Permitir reintento si falla
            throw error
        }
    })()

    return initPromise
}

/**
 * Obtiene la instancia de la base de datos
 * @throws Error si la base de datos no ha sido inicializada
 */
export function getDatabase(): JuntayDatabase {
    if (!dbInstance) {
        throw new Error('La base de datos RxDB no ha sido inicializada. Llama a initDatabase() primero.')
    }
    return dbInstance
}

/**
 * Verifica si la base de datos está lista
 */
export function isDatabaseReady(): boolean {
    return dbInstance !== null
}

/**
 * Destruye la instancia de la base de datos (para testing o logout)
 * Al hacer logout, la base de datos encriptada no será accesible sin re-autenticar
 */
export async function destroyDatabase(): Promise<void> {
    if (dbInstance) {
        await dbInstance.remove()
        dbInstance = null
        console.log('[RxDB] Base de datos destruida (datos permanecen encriptados)')
    }
}

/**
 * Limpia completamente la base de datos local
 * Útil para logout completo o reset de datos
 */
export async function clearLocalDatabase(): Promise<void> {
    if (dbInstance) {
        await dbInstance.remove()
        dbInstance = null
    }

    // También limpiar IndexedDB directamente
    if (typeof window !== 'undefined' && window.indexedDB) {
        const databases = await window.indexedDB.databases()
        for (const db of databases) {
            if (db.name?.includes('juntay')) {
                window.indexedDB.deleteDatabase(db.name)
                console.log(`[RxDB] Eliminada base de datos: ${db.name}`)
            }
        }
    }
}
