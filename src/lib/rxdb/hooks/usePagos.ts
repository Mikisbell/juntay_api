/**
 * Hooks de RxDB para operaciones de pagos
 * 
 * VERSIÓN SEGURA - Usa strings para montos (Opción 3B)
 */

import { useState, useEffect, useCallback } from 'react'
import { useRxDB } from '@/components/providers/RxDBProvider'
import type { PagoDocument } from '@/lib/rxdb/schemas/pagos'
import { aString, dinero, restar, esMenor } from '@/lib/utils/decimal'

/**
 * Hook para obtener pagos de un crédito específico
 */
export function usePagosDeCredito(creditoId?: string) {
    const { db, isReady } = useRxDB()
    const [pagos, setPagos] = useState<PagoDocument[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isReady || !db || !creditoId) {
            setPagos([])
            setLoading(false)
            return
        }

        // Suscribirse a cambios reactivos
        const subscription = db.pagos
            .find()
            .where('credito_id').eq(creditoId)
            .$.subscribe((docs: any[]) => {
                setPagos(docs.map(d => d.toJSON()))
                setLoading(false)
            })

        return () => subscription.unsubscribe()
    }, [db, isReady, creditoId])

    return { pagos, loading }
}

/**
 * Hook para registrar un pago localmente
 * IMPORTANTE: El monto se convierte automáticamente a string
 */
export function useRegistrarPagoLocal() {
    const { db, isReady, isOnline } = useRxDB()
    const [isRegistering, setIsRegistering] = useState(false)

    const registrarPago = useCallback(async (pagoData: {
        credito_id: string
        monto: string | number
        tipo?: 'interes' | 'capital' | 'desempeno' | 'mora' | 'renovacion'
        metodo_pago?: 'efectivo' | 'yape' | 'plin' | 'transferencia'
        caja_operativa_id?: string
        usuario_id?: string
        observaciones?: string
        condonarInteres?: boolean
    }) => {
        if (!isReady || !db) {
            return { success: false, error: 'Base de datos local no disponible' }
        }

        if (!pagoData.credito_id) {
            return { success: false, error: 'Se requiere ID del crédito' }
        }

        setIsRegistering(true)
        try {
            // Convertir monto a string con precisión (Opción 3B)
            const montoString = String(pagoData.monto || "0.00")

            const nuevoPago: PagoDocument = {
                id: crypto.randomUUID(),
                credito_id: pagoData.credito_id,
                tipo: pagoData.tipo || 'interes',
                monto: montoString,  // String con precisión decimal
                metodo_pago: pagoData.metodo_pago || 'efectivo',
                caja_operativa_id: pagoData.caja_operativa_id,
                usuario_id: pagoData.usuario_id,
                observaciones: pagoData.observaciones,
                created_at: new Date().toISOString()
            }

            await db.pagos.insert(nuevoPago)

            // También actualizar el saldo del crédito localmente
            const credito = await db.creditos
                .findOne()
                .where('id').eq(pagoData.credito_id)
                .exec()

            if (credito) {
                // Usar Decimal.js para cálculo preciso
                const saldoActual = credito.saldo_pendiente || "0.00"
                let nuevoSaldo = saldoActual

                // Lógica según tipo de pago
                if (pagoData.tipo === 'renovacion') {
                    // RENOVACIÓN:
                    // RENOVACIÓN FLEXIBLE:
                    // 1. Validar que el pago cubra el INTERÉS BASE (ej: 20%)
                    //    Permite condonar/ignorar moras si el operador lo decide.

                    const saldoBase = parseFloat(credito.saldo_pendiente || "0")
                    const tasa = parseFloat(credito.tasa_interes || "0")
                    // Interés Base = Saldo * (Tasa / 100)
                    const interesBase = saldoBase * (tasa / 100)

                    // Margen de tolerancia pequeño (por redondeo)
                    const tolerancia = 0.50

                    if (esMenor(montoString, String(interesBase - tolerancia))) {
                        throw new Error(`Monto insuficiente para renovar. Mínimo (Interés Base): S/ ${interesBase.toFixed(2)}`)
                    }

                    // 2. NO baja capital (nuevoSaldo = saldoActual)
                    // 3. Extiende vencimiento 1 mes
                    // 4. Manejo de Interés Acumulado (CONDONACIÓN OPCIONAL)

                    let nuevoInteresAcumulado = 0
                    if (!pagoData.condonarInteres) {
                        // Si NO se condona, se mantiene la diferencia como deuda pendiente
                        // Ejemplo: Debía 250 (200 int + 50 mora), pagó 200. Quedan 50.
                        const interesPendiente = (credito.interes_acumulado || 0) - parseFloat(montoString)
                        nuevoInteresAcumulado = Math.max(0, interesPendiente)
                    }
                    // Si condonarInteres es TRUE, nuevoInteresAcumulado se queda en 0.

                    const fechaVencimientoActual = new Date(credito.fecha_vencimiento)
                    // Agregar 1 mes logic
                    const nuevaFecha = new Date(fechaVencimientoActual)
                    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1)
                    // Ajuste simple para días inválidos (ej: 31 Ene -> 28/29 Feb)
                    if (nuevaFecha.getDate() !== fechaVencimientoActual.getDate()) {
                        nuevaFecha.setDate(0) // Último día del mes anterior
                    }

                    await credito.update({
                        $set: {
                            fecha_vencimiento: nuevaFecha.toISOString().split('T')[0],
                            interes_acumulado: nuevoInteresAcumulado,
                            estado: 'vigente', // Reactivar si estaba vencido
                            updated_at: new Date().toISOString()
                        }
                    })

                } else {
                    // PAGO NORMAL (Amortización / Liquidación):
                    // Baja capital
                    const nuevoSaldoDecimal = restar(saldoActual, montoString)
                    const nuevoSaldoString = aString(nuevoSaldoDecimal)
                    nuevoSaldo = esMenor(nuevoSaldoString, "0.01") ? "0.00" : nuevoSaldoString

                    await credito.update({
                        $set: {
                            saldo_pendiente: nuevoSaldo,
                            updated_at: new Date().toISOString(),
                            ...(nuevoSaldo === "0.00" ? { estado: 'pagado' } : {})
                        }
                    })
                }
            }

            console.log('[useRegistrarPagoLocal] Pago registrado localmente:', nuevoPago.id)

            return {
                success: true,
                pago: nuevoPago,
                isOffline: !isOnline,
                message: isOnline
                    ? 'Pago registrado y sincronizado'
                    : '⚡ Pago guardado localmente. Se sincronizará cuando vuelva la conexión.'
            }
        } catch (err: any) {
            console.error('[useRegistrarPagoLocal] Error:', err)
            return {
                success: false,
                error: err.message
            }
        } finally {
            setIsRegistering(false)
        }
    }, [db, isReady, isOnline])

    return { registrarPago, isRegistering }
}

/**
 * Hook para obtener pagos del día (para caja)
 */
export function usePagosDelDia(cajaOperativaId?: string) {
    const { db, isReady } = useRxDB()
    const [pagosHoy, setPagosHoy] = useState<PagoDocument[]>([])
    const [totalIngresos, setTotalIngresos] = useState("0.00")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isReady || !db) return

        const hoyInicio = new Date()
        hoyInicio.setHours(0, 0, 0, 0)

        const subscription = db.pagos
            .find()
            .$.subscribe((docs: any[]) => {
                // Filtrar por fecha de hoy y caja (si se especifica)
                const pagosHoyFiltrados = docs.filter((d: any) => {
                    const fechaPago = new Date(d.created_at)
                    const esDeHoy = fechaPago >= hoyInicio
                    const esDeCaja = cajaOperativaId ? d.caja_operativa_id === cajaOperativaId : true
                    return esDeHoy && esDeCaja
                })

                setPagosHoy(pagosHoyFiltrados.map(d => d.toJSON()))

                // Calcular total usando Decimal.js
                let totalDecimal = dinero("0")
                for (const p of pagosHoyFiltrados) {
                    totalDecimal = totalDecimal.plus(dinero(p.monto || "0"))
                }
                setTotalIngresos(aString(totalDecimal))

                setLoading(false)
            })

        return () => subscription.unsubscribe()
    }, [db, isReady, cajaOperativaId])

    return { pagosHoy, totalIngresos, loading }
}

/**
 * Hook para contar pagos pendientes de sincronización
 */
export function usePagosPendientes() {
    const { db, isReady, isOnline } = useRxDB()
    const [pendientes, setPendientes] = useState(0)

    useEffect(() => {
        if (!isReady || !db || isOnline) {
            setPendientes(0)
            return
        }

        // La replicación de RxDB maneja esto internamente
        setPendientes(0) // Placeholder
    }, [db, isReady, isOnline])

    return { pendientes }
}
