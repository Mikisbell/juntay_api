/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Hooks de RxDB para operaciones de caja
 * 
 * VERSIÓN SEGURA - Usa strings para montos (Opción 3B)
 */

import { useState, useEffect, useCallback } from 'react'
import { useRxDB } from '@/components/providers/RxDBProvider'
import type { MovimientoCajaDocument } from '@/lib/rxdb/schemas/movimientos-caja'
import { aString, dinero, sumar } from '@/lib/utils/decimal'

/**
 * Hook para obtener movimientos de la caja actual
 */
export function useMovimientosCaja(cajaOperativaId?: string) {
    const { db, isReady } = useRxDB()
    const [movimientos, setMovimientos] = useState<MovimientoCajaDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [totales, setTotales] = useState({ ingresos: "0.00", egresos: "0.00", saldo: "0.00" })

    useEffect(() => {
        if (!isReady || !db || !cajaOperativaId) {
            setMovimientos([])
            setLoading(false)
            return
        }

        const subscription = db.movimientos_caja
            .find()
            .where('caja_operativa_id').eq(cajaOperativaId)
            .$.subscribe((docs: any[]) => {
                const movs = docs.map(d => d.toJSON())
                setMovimientos(movs)

                // Calcular totales usando Decimal.js
                let ingresos = dinero("0")
                let egresos = dinero("0")

                for (const m of movs) {
                    const monto = dinero(m.monto || "0")
                    if (m.tipo === 'INGRESO') {
                        ingresos = ingresos.plus(monto)
                    } else {
                        egresos = egresos.plus(monto)
                    }
                }

                setTotales({
                    ingresos: aString(ingresos),
                    egresos: aString(egresos),
                    saldo: aString(ingresos.minus(egresos))
                })

                setLoading(false)
            })

        return () => subscription.unsubscribe()
    }, [db, isReady, cajaOperativaId])

    return { movimientos, totales, loading }
}

/**
 * Hook para registrar un movimiento de caja localmente
 * IMPORTANTE: El monto se convierte automáticamente a string
 */
export function useRegistrarMovimientoLocal() {
    const { db, isReady, isOnline } = useRxDB()
    const [isRegistering, setIsRegistering] = useState(false)

    const registrarMovimiento = useCallback(async (
        movimientoData: Partial<MovimientoCajaDocument> & { monto?: string | number }
    ) => {
        if (!isReady || !db) {
            return { success: false, error: 'Base de datos local no disponible' }
        }

        if (!movimientoData.caja_operativa_id) {
            return { success: false, error: 'Se requiere ID de caja operativa' }
        }

        setIsRegistering(true)
        try {
            // Convertir monto a string con precisión (Opción 3B)
            const montoString = typeof movimientoData.monto === 'number'
                ? aString(dinero(movimientoData.monto))
                : movimientoData.monto || "0.00"

            const nuevoMovimiento: MovimientoCajaDocument = {
                id: crypto.randomUUID(),
                caja_operativa_id: movimientoData.caja_operativa_id,
                tipo: movimientoData.tipo || 'INGRESO',
                monto: montoString,  // String con precisión decimal
                motivo: movimientoData.motivo || 'Movimiento manual',
                descripcion: movimientoData.descripcion,
                referencia_id: movimientoData.referencia_id,
                referencia_tipo: movimientoData.referencia_tipo,
                usuario_id: movimientoData.usuario_id!,
                fecha: new Date().toISOString()
            }

            await db.movimientos_caja.insert(nuevoMovimiento)

            console.log('[useRegistrarMovimientoLocal] Movimiento registrado:', nuevoMovimiento.id)

            return {
                success: true,
                movimiento: nuevoMovimiento,
                isOffline: !isOnline
            }
        } catch (err: any) {
            console.error('[useRegistrarMovimientoLocal] Error:', err)
            return { success: false, error: err.message }
        } finally {
            setIsRegistering(false)
        }
    }, [db, isReady, isOnline])

    return { registrarMovimiento, isRegistering }
}

/**
 * Hook para obtener resumen de caja del día
 */
export function useResumenCajaHoy(cajaOperativaId?: string) {
    const { movimientos, totales, loading } = useMovimientosCaja(cajaOperativaId)
    const [resumenHoy, setResumenHoy] = useState({
        ingresos: "0.00",
        egresos: "0.00",
        saldo: "0.00",
        cantidadOperaciones: 0
    })

    useEffect(() => {
        const hoyInicio = new Date()
        hoyInicio.setHours(0, 0, 0, 0)

        const movimientosHoy = movimientos.filter(m => {
            const fecha = new Date(m.fecha)
            return fecha >= hoyInicio
        })

        // Calcular con Decimal.js
        let ingresos = dinero("0")
        let egresos = dinero("0")

        for (const m of movimientosHoy) {
            const monto = dinero(m.monto || "0")
            if (m.tipo === 'INGRESO') {
                ingresos = ingresos.plus(monto)
            } else {
                egresos = egresos.plus(monto)
            }
        }

        setResumenHoy({
            ingresos: aString(ingresos),
            egresos: aString(egresos),
            saldo: aString(ingresos.minus(egresos)),
            cantidadOperaciones: movimientosHoy.length
        })
    }, [movimientos])

    return { resumenHoy, loading }
}
