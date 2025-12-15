'use client'

/**
 * RxDBProvider - Inicializa RxDB solo en el cliente
 * 
 * IMPORTANTE: Este componente usa "suppressHydrationWarning" porque 
 * el estado de conexión solo puede determinarse en el cliente.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'sonner'

// Tipos
interface RxDBContextType {
    isReady: boolean
    isOnline: boolean
    isSyncing: boolean
    pendingChanges: number
    db: any | null
    forceSync: () => Promise<void>
}

const RxDBContext = createContext<RxDBContextType>({
    isReady: false,
    isOnline: true,
    isSyncing: false,
    pendingChanges: 0,
    db: null,
    forceSync: async () => { }
})

export function useRxDB() {
    return useContext(RxDBContext)
}

interface RxDBProviderProps {
    children: ReactNode
}

export function RxDBProvider({ children }: RxDBProviderProps) {
    // Inicializar con undefined para que useEffect lo setee en el cliente
    const [mounted, setMounted] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [isOnline, setIsOnline] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [pendingChanges, setPendingChanges] = useState(0)
    const [db, setDb] = useState<any | null>(null)
    const [initError, setInitError] = useState<string | null>(null)

    // Primer efecto: marcar como montado (evita hydration mismatch)
    useEffect(() => {
        setMounted(true)
        setIsOnline(navigator.onLine)
    }, [])

    // Segundo efecto: inicializar RxDB después de montar
    useEffect(() => {
        if (!mounted) return

        const handleOnline = () => {
            setIsOnline(true)
            toast.success('Conexión restaurada. Sincronizando...')
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast.warning('Sin conexión. Los cambios se guardarán localmente.')
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Inicializar RxDB
        const initRxDB = async () => {
            try {
                console.log('[RxDBProvider] Inicializando base de datos local...')

                // Importar dinámicamente para evitar problemas de SSR
                const { initDatabase } = await import('@/lib/rxdb/database')
                const database = await initDatabase()
                setDb(database)

                console.log('[RxDBProvider] Base de datos inicializada')

                // Iniciar replicación si estamos online
                if (navigator.onLine) {
                    setIsSyncing(true)
                    try {
                        const { startReplication } = await import('@/lib/rxdb/replication')
                        await startReplication()
                        console.log('[RxDBProvider] Replicación iniciada')
                    } catch (repError) {
                        console.warn('[RxDBProvider] Error iniciando replicación (continuando sin sync):', repError)
                    } finally {
                        setIsSyncing(false)
                    }
                }

                setIsReady(true)
                console.log('[RxDBProvider] ✅ Sistema offline-first listo')

            } catch (error: any) {
                console.error('[RxDBProvider] Error inicializando RxDB:', error)
                setInitError(error.message)
                // No bloquear la app si RxDB falla
                setIsReady(true)
            }
        }

        initRxDB()

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [mounted])

    // Función para forzar sincronización
    const forceSync = async () => {
        if (!db || !isOnline) {
            toast.error('No se puede sincronizar: sin conexión')
            return
        }

        setIsSyncing(true)
        try {
            const { forceSync: doSync } = await import('@/lib/rxdb/replication')
            await doSync()
            toast.success('Sincronización completada')
        } catch (error: any) {
            console.error('[RxDBProvider] Error en sync manual:', error)
            toast.error('Error al sincronizar: ' + error.message)
        } finally {
            setIsSyncing(false)
        }
    }

    // Si hay error de inicialización, mostrar aviso pero no bloquear
    useEffect(() => {
        if (initError && mounted) {
            toast.warning('Modo online: base de datos local no disponible')
        }
    }, [initError, mounted])

    return (
        <RxDBContext.Provider value={{
            isReady,
            isOnline,
            isSyncing,
            pendingChanges,
            db,
            forceSync
        }}>
            {children}
        </RxDBContext.Provider>
    )
}
