/**
 * Hooks de RxDB para Garantías - Offline-First
 * 
 * @example
 * const { garantias } = useGarantiasDeCredito(creditoId)
 * const { crearGarantia } = useCrearGarantiaLocal()
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { isDatabaseReady, getDatabase } from '../database'
import { GarantiaDocument } from '../schemas/garantias'

/**
 * Hook para obtener garantías de un crédito específico
 */
export function useGarantiasDeCredito(creditoId: string | null) {
    const [garantias, setGarantias] = useState<GarantiaDocument[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!creditoId || !isDatabaseReady()) {
            setGarantias([])
            setIsLoading(false)
            return
        }

        const db = getDatabase()
        const subscription = db.garantias
            .find({
                selector: {
                    credito_id: creditoId,
                    isDeleted: false
                }
            })
            .$.subscribe({
                next: (docs: any[]) => {
                    setGarantias(docs.map(d => d.toJSON ? d.toJSON() : d))
                    setIsLoading(false)
                },
                error: (err: Error) => {
                    console.error('[useGarantiasDeCredito] Error:', err)
                    setIsLoading(false)
                }
            })

        return () => subscription.unsubscribe()
    }, [creditoId])

    return { garantias, isLoading }
}

/**
 * Hook para obtener garantías de un cliente específico
 */
export function useGarantiasDeCliente(clienteId: string | null) {
    const [garantias, setGarantias] = useState<GarantiaDocument[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!clienteId || !isDatabaseReady()) {
            setGarantias([])
            setIsLoading(false)
            return
        }

        const db = getDatabase()
        const subscription = db.garantias
            .find({
                selector: {
                    cliente_id: clienteId,
                    isDeleted: false
                },
                sort: [{ updatedAt: 'desc' }]
            })
            .$.subscribe({
                next: (docs: any[]) => {
                    setGarantias(docs.map(d => d.toJSON ? d.toJSON() : d))
                    setIsLoading(false)
                },
                error: (err: Error) => {
                    console.error('[useGarantiasDeCliente] Error:', err)
                    setIsLoading(false)
                }
            })

        return () => subscription.unsubscribe()
    }, [clienteId])

    return { garantias, isLoading }
}

/**
 * Hook para crear garantía localmente (offline-first)
 */
export function useCrearGarantiaLocal() {
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const crearGarantia = useCallback(async (data: Omit<GarantiaDocument, 'id' | 'isDeleted' | 'updatedAt'>) => {
        if (!isDatabaseReady()) {
            throw new Error('Base de datos local no disponible')
        }

        setIsCreating(true)
        setError(null)

        try {
            const db = getDatabase()
            const nuevaGarantia: GarantiaDocument = {
                id: crypto.randomUUID(),
                ...data,
                estado: data.estado ?? 'custodia',
                created_at: data.created_at ?? new Date().toISOString(),
                isDeleted: false,
                updatedAt: new Date().toISOString()
            }

            await db.garantias.insert(nuevaGarantia)
            console.log('[useCrearGarantiaLocal] Garantía creada offline:', nuevaGarantia.id)
            return nuevaGarantia
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            console.error('[useCrearGarantiaLocal] Error:', error)
            setError(error)
            throw error
        } finally {
            setIsCreating(false)
        }
    }, [])

    return { crearGarantia, isCreating, error }
}

/**
 * Hook para obtener una garantía por ID
 */
export function useGarantiaPorId(garantiaId: string | null) {
    const [garantia, setGarantia] = useState<GarantiaDocument | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!garantiaId || !isDatabaseReady()) {
            setGarantia(null)
            setIsLoading(false)
            return
        }

        const db = getDatabase()
        const subscription = db.garantias
            .findOne({
                selector: {
                    id: garantiaId,
                    isDeleted: false
                }
            })
            .$.subscribe({
                next: (doc: any) => {
                    setGarantia(doc ? (doc.toJSON ? doc.toJSON() : doc) : null)
                    setIsLoading(false)
                },
                error: (err: Error) => {
                    console.error('[useGarantiaPorId] Error:', err)
                    setIsLoading(false)
                }
            })

        return () => subscription.unsubscribe()
    }, [garantiaId])

    return { garantia, isLoading }
}

/**
 * Hook para garantías en custodia (disponibles para préstamo)
 */
export function useGarantiasEnCustodia() {
    const [garantias, setGarantias] = useState<GarantiaDocument[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!isDatabaseReady()) {
            setIsLoading(false)
            return
        }

        const db = getDatabase()
        const subscription = db.garantias
            .find({
                selector: {
                    estado: 'custodia',
                    isDeleted: false
                },
                sort: [{ updatedAt: 'desc' }]
            })
            .$.subscribe({
                next: (docs: any[]) => {
                    setGarantias(docs.map(d => d.toJSON ? d.toJSON() : d))
                    setIsLoading(false)
                },
                error: (err: Error) => {
                    console.error('[useGarantiasEnCustodia] Error:', err)
                    setIsLoading(false)
                }
            })

        return () => subscription.unsubscribe()
    }, [])

    return { garantias, isLoading }
}
