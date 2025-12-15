/**
 * Hooks de RxDB para operaciones de créditos
 * 
 * VERSIÓN SEGURA - Usa strings para montos (Opción 3B)
 * Todos los montos se manejan como strings y se procesan con Decimal.js
 */

import { useState, useEffect, useCallback } from 'react'
import { useRxDB } from '@/components/providers/RxDBProvider'
import type { CreditoDocument } from '@/lib/rxdb/schemas/creditos'
import { aString, dinero, sumar } from '@/lib/utils/decimal'

/**
 * Hook para buscar créditos localmente
 */
export function useCreditosLocales(clienteId?: string) {
    const { db, isReady } = useRxDB()
    const [creditos, setCreditos] = useState<CreditoDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isReady || !db) {
            return
        }

        const fetchCreditos = async () => {
            try {
                setLoading(true)

                let query = db.creditos.find()

                if (clienteId) {
                    query = query.where('cliente_id').eq(clienteId)
                }

                const results = await query.exec()
                setCreditos(results.map((doc: any) => doc.toJSON()))
                setError(null)
            } catch (err: any) {
                console.error('[useCreditosLocales] Error:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchCreditos()

        // Suscribirse a cambios
        const subscription = db.creditos
            .find()
            .$.subscribe((docs: any[]) => {
                let filtered = docs
                if (clienteId) {
                    filtered = docs.filter(d => d.cliente_id === clienteId)
                }
                setCreditos(filtered.map(d => d.toJSON()))
            })

        return () => subscription.unsubscribe()
    }, [db, isReady, clienteId])

    return { creditos, loading, error }
}

/**
 * Hook para crear un crédito localmente (se sincroniza después)
 * IMPORTANTE: Los montos deben pasarse como strings o numbers, 
 * se convertirán automáticamente a strings con 2 decimales
 */
export function useCrearCreditoLocal() {
    const { db, isReady, isOnline } = useRxDB()
    const [isCreating, setIsCreating] = useState(false)

    const crearCredito = useCallback(async (creditoData: Partial<CreditoDocument>) => {
        if (!isReady || !db) {
            throw new Error('Base de datos local no disponible')
        }

        setIsCreating(true)
        try {
            // Convertir montos a strings con precisión (Opción 3B)
            const montoPrestado = typeof creditoData.monto_prestado === 'number'
                ? aString(dinero(creditoData.monto_prestado))
                : creditoData.monto_prestado || "0.00"

            const saldoPendiente = typeof creditoData.saldo_pendiente === 'number'
                ? aString(dinero(creditoData.saldo_pendiente))
                : creditoData.saldo_pendiente || montoPrestado

            const tasaInteres = typeof creditoData.tasa_interes === 'number'
                ? aString(dinero(creditoData.tasa_interes))
                : creditoData.tasa_interes || "20.00"

            const nuevoCredito: CreditoDocument = {
                id: crypto.randomUUID(),
                codigo_credito: creditoData.codigo_credito || `EMC-${Date.now()}`,
                cliente_id: creditoData.cliente_id!,
                monto_prestado: montoPrestado,     // String con precisión decimal
                saldo_pendiente: saldoPendiente,   // String con precisión decimal
                tasa_interes: tasaInteres,         // String con precisión decimal
                fecha_inicio: creditoData.fecha_inicio || new Date().toISOString(),
                fecha_vencimiento: creditoData.fecha_vencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                estado: creditoData.estado || 'vigente',
                estado_detallado: creditoData.estado_detallado,
                usuario_id: creditoData.usuario_id,
                caja_operativa_id: creditoData.caja_operativa_id,
                observaciones: creditoData.observaciones,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            await db.creditos.insert(nuevoCredito)

            console.log('[useCrearCreditoLocal] Crédito creado localmente:', nuevoCredito.id)

            return {
                success: true,
                credito: nuevoCredito,
                isOffline: !isOnline
            }
        } catch (err: any) {
            console.error('[useCrearCreditoLocal] Error:', err)
            return {
                success: false,
                error: err.message
            }
        } finally {
            setIsCreating(false)
        }
    }, [db, isReady, isOnline])

    return { crearCredito, isCreating }
}

/**
 * Hook para buscar un crédito por código
 */
export function useCreditoPorCodigo(codigo?: string) {
    const { db, isReady } = useRxDB()
    const [credito, setCredito] = useState<CreditoDocument | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isReady || !db || !codigo) {
            setCredito(null)
            return
        }

        const fetchCredito = async () => {
            setLoading(true)
            try {
                const doc = await db.creditos
                    .findOne()
                    .where('codigo_credito').eq(codigo)
                    .exec()

                setCredito(doc ? doc.toJSON() : null)
            } catch (err) {
                console.error('[useCreditoPorCodigo] Error:', err)
                setCredito(null)
            } finally {
                setLoading(false)
            }
        }

        fetchCredito()
    }, [db, isReady, codigo])

    return { credito, loading }
}

/**
 * Hook para obtener créditos vigentes con vencimiento próximo
 */
export function useCreditosVigentes() {
    const { db, isReady } = useRxDB()
    const [creditosVigentes, setCreditosVigentes] = useState<CreditoDocument[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isReady || !db) return

        const subscription = db.creditos
            .find()
            .where('estado').in(['vigente', 'vencido', 'en_mora'])
            .$.subscribe((docs: any[]) => {
                setCreditosVigentes(docs.map(d => d.toJSON()))
                setLoading(false)
            })

        return () => subscription.unsubscribe()
    }, [db, isReady])

    return { creditosVigentes, loading }
}
