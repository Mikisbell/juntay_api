/**
 * Hooks de RxDB para Clientes - Offline-First
 * 
 * @example
 * const { clientes, isLoading } = useClientesLocales()
 * const cliente = useClientePorDocumento('12345678')
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { isDatabaseReady, getDatabase } from '../database'
import { ClienteDocument } from '../schemas/clientes'

/**
 * Hook para obtener todos los clientes activos desde RxDB
 */
export function useClientesLocales() {
    const [clientes, setClientes] = useState<ClienteDocument[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!isDatabaseReady()) {
            setIsLoading(false)
            return
        }

        const db = getDatabase()
        const subscription = db.clientes
            .find({
                selector: {
                    activo: true,
                    _deleted: false
                },
                sort: [{ _modified: 'desc' }]
            })
            .$.subscribe({
                next: (docs: any[]) => {
                    setClientes(docs.map(d => d.toJSON ? d.toJSON() : d))
                    setIsLoading(false)
                },
                error: (err: Error) => {
                    console.error('[useClientesLocales] Error:', err)
                    setError(err)
                    setIsLoading(false)
                }
            })

        return () => subscription.unsubscribe()
    }, [])

    return { clientes, isLoading, error }
}

/**
 * Hook para buscar cliente por número de documento
 */
export function useClientePorDocumento(numeroDocumento: string | null) {
    const [cliente, setCliente] = useState<ClienteDocument | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!numeroDocumento || !isDatabaseReady()) {
            setCliente(null)
            setIsLoading(false)
            return
        }

        const db = getDatabase()
        const subscription = db.clientes
            .findOne({
                selector: {
                    numero_documento: numeroDocumento,
                    _deleted: false
                }
            })
            .$.subscribe({
                next: (doc: any) => {
                    setCliente(doc ? (doc.toJSON ? doc.toJSON() : doc) : null)
                    setIsLoading(false)
                },
                error: (err: Error) => {
                    console.error('[useClientePorDocumento] Error:', err)
                    setIsLoading(false)
                }
            })

        return () => subscription.unsubscribe()
    }, [numeroDocumento])

    return { cliente, isLoading }
}

/**
 * Hook para crear cliente localmente (offline-first)
 */
export function useCrearClienteLocal() {
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const crearCliente = useCallback(async (data: Omit<ClienteDocument, 'id' | '_deleted' | '_modified'>) => {
        if (!isDatabaseReady()) {
            throw new Error('Base de datos local no disponible')
        }

        setIsCreating(true)
        setError(null)

        try {
            const db = getDatabase()
            const nuevoCliente: ClienteDocument = {
                id: crypto.randomUUID(),
                ...data,
                activo: data.activo ?? true,
                _deleted: false,
                _modified: new Date().toISOString()
            }

            await db.clientes.insert(nuevoCliente)
            console.log('[useCrearClienteLocal] Cliente creado offline:', nuevoCliente.id)
            return nuevoCliente
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err))
            console.error('[useCrearClienteLocal] Error:', error)
            setError(error)
            throw error
        } finally {
            setIsCreating(false)
        }
    }, [])

    return { crearCliente, isCreating, error }
}

/**
 * Hook para buscar clientes por texto (nombres, apellidos, documento)
 */
export function useBuscarClientes(query: string) {
    const [resultados, setResultados] = useState<ClienteDocument[]>([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        if (!query || query.length < 2 || !isDatabaseReady()) {
            setResultados([])
            return
        }

        setIsSearching(true)
        const db = getDatabase()

        // RxDB no soporta LIKE nativo, así que filtramos en memoria
        const subscription = db.clientes
            .find({
                selector: {
                    _deleted: false,
                    activo: true
                }
            })
            .$.subscribe({
                next: (docs: any[]) => {
                    const queryLower = query.toLowerCase()
                    const filtered = docs.filter((d: any) => {
                        const doc = d.toJSON ? d.toJSON() : d
                        return (
                            doc.numero_documento?.toLowerCase().includes(queryLower) ||
                            doc.nombres?.toLowerCase().includes(queryLower) ||
                            doc.apellido_paterno?.toLowerCase().includes(queryLower) ||
                            doc.apellido_materno?.toLowerCase().includes(queryLower)
                        )
                    }).slice(0, 20) // Limitar resultados

                    setResultados(filtered.map(d => d.toJSON ? d.toJSON() : d))
                    setIsSearching(false)
                },
                error: () => setIsSearching(false)
            })

        return () => subscription.unsubscribe()
    }, [query])

    return { resultados, isSearching }
}
