'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ContratoRenovable = {
    id: string
    codigo: string
    cliente_id: string
    cliente_nombre: string
    cliente_telefono: string
    fecha_vencimiento: string
    fecha_creacion: string      // NUEVO: Para calcular días transcurridos
    dias_restantes: number
    dias_transcurridos: number  // NUEVO: Días desde inicio
    monto_prestado: number
    tasa_interes: number        // NUEVO: Tasa mensual %
    interes_acumulado: number
    saldo_pendiente: number
    garantia_descripcion: string
    urgencia: 'alta' | 'media' | 'baja'
}

export async function obtenerContratosRenovables(dias: number = 30): Promise<ContratoRenovable[]> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase.rpc('get_contratos_renovables', {
            p_dias: dias
        })

        if (error) {
            console.error('Error obteniendo contratos renovables:', error)
            return []
        }

        return (data || []) as ContratoRenovable[]
    } catch (error) {
        console.error('Error inesperado:', error)
        return []
    }
}

/**
 * Renovar contrato - IMPLEMENTACIÓN REAL CON INTERÉS FLEXIBLE
 * 
 * Opciones:
 * - 'intereses': Cliente paga solo intereses, se extiende según modalidad
 * - 'total': Cliente paga todo (capital + intereses), se cierra el crédito
 * - 'parcial': Cliente paga parte del capital + intereses
 * 
 * Modalidades de interés:
 * - 'dias': Pro-rata diario (interés mensual ÷ 30 × días)
 * - 'semanas': Escalado fijo (25%, 50%, 75%, 100%)
 */
export async function renovarContrato(
    creditoId: string,
    opcion: 'total' | 'intereses' | 'parcial',
    montoPagado: number,
    cajaOperativaId?: string,
    modalidadInteres: 'dias' | 'semanas' = 'semanas' // Default: por semanas
) {
    // Importar helper de interés flexible
    const { calcularInteresFlexible, calcularDiasTranscurridos } = await import('@/lib/utils/interes-flexible')

    const supabase = await createClient()

    // 1. Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, mensaje: 'Usuario no autenticado' }
    }

    // 2. Obtener datos del crédito
    const { data: credito, error: errorCredito } = await supabase
        .from('creditos')
        .select(`
            id,
            codigo_credito,
            cliente_id,
            monto_prestado,
            tasa_interes,
            interes_acumulado,
            saldo_pendiente,
            fecha_vencimiento,
            estado,
            periodo_dias,
            created_at
        `)
        .eq('id', creditoId)
        .single()

    if (errorCredito || !credito) {
        return { success: false, mensaje: 'Crédito no encontrado' }
    }

    // 3. Validar que el crédito esté vigente
    if (credito.estado !== 'vigente') {
        return { success: false, mensaje: `El crédito no está vigente (estado: ${credito.estado})` }
    }

    // 4. Calcular interés FLEXIBLE según modalidad seleccionada
    const diasTranscurridos = calcularDiasTranscurridos(credito.created_at)
    const resultadoInteres = calcularInteresFlexible(
        credito.monto_prestado,
        credito.tasa_interes,
        diasTranscurridos,
        modalidadInteres
    )

    const interesDelPeriodo = resultadoInteres.interes
    const periodoDias = credito.periodo_dias || 30

    // 5. Procesar según opción
    let nuevoSaldo = credito.saldo_pendiente
    const nuevaFechaVencimiento = new Date(credito.fecha_vencimiento)
    let nuevoEstado = 'vigente'
    let mensajeExito = ''

    if (opcion === 'intereses') {
        // Solo paga intereses - se extiende el plazo
        if (montoPagado < interesDelPeriodo) {
            return {
                success: false,
                mensaje: `Monto insuficiente. Interés mínimo a pagar: S/${interesDelPeriodo.toFixed(2)}`
            }
        }

        // Calcular nueva fecha (extender período)
        nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + periodoDias)

        // El saldo se mantiene (solo se paga interés)
        nuevoSaldo = credito.monto_prestado // Reinicia a capital original
        mensajeExito = `Renovación exitosa. Nuevo vencimiento: ${nuevaFechaVencimiento.toLocaleDateString('es-PE')}`

    } else if (opcion === 'total') {
        // Paga todo - se cierra el crédito
        const totalAdeudado = credito.saldo_pendiente

        if (montoPagado < totalAdeudado) {
            return {
                success: false,
                mensaje: `Monto insuficiente para cancelación total. Deuda: S/${totalAdeudado.toFixed(2)}`
            }
        }

        nuevoSaldo = 0
        nuevoEstado = 'cancelado'
        mensajeExito = `Crédito cancelado exitosamente. Se pagó S/${montoPagado.toFixed(2)}`

    } else if (opcion === 'parcial') {
        // Paga parte del capital + intereses obligatorios
        if (montoPagado < interesDelPeriodo) {
            return {
                success: false,
                mensaje: `Monto mínimo: S/${interesDelPeriodo.toFixed(2)} (intereses)`
            }
        }

        // Lo que excede los intereses va a capital
        const abonoCapital = montoPagado - interesDelPeriodo
        nuevoSaldo = Math.max(0, credito.saldo_pendiente - abonoCapital)

        // Extender plazo
        nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + periodoDias)

        if (nuevoSaldo === 0) {
            nuevoEstado = 'cancelado'
            mensajeExito = `Crédito cancelado. Abono a capital: S/${abonoCapital.toFixed(2)}`
        } else {
            mensajeExito = `Renovación parcial. Nuevo saldo: S/${nuevoSaldo.toFixed(2)}, Vence: ${nuevaFechaVencimiento.toLocaleDateString('es-PE')}`
        }
    }

    // 6. Actualizar crédito en base de datos
    const { error: errorUpdate } = await supabase
        .from('creditos')
        .update({
            saldo_pendiente: nuevoSaldo,
            fecha_vencimiento: nuevaFechaVencimiento.toISOString(),
            estado: nuevoEstado,
            estado_detallado: nuevoEstado,
            interes_acumulado: opcion === 'intereses' ? 0 : credito.interes_acumulado,
            observaciones: `Renovación ${opcion} (${modalidadInteres === 'dias' ? 'pro-rata' : 'semanal'}) el ${new Date().toLocaleDateString('es-PE')} - Pagó S/${montoPagado.toFixed(2)} (${resultadoInteres.descripcion})`
        })
        .eq('id', creditoId)

    if (errorUpdate) {
        console.error('Error actualizando crédito:', errorUpdate)
        return { success: false, mensaje: 'Error al actualizar el crédito' }
    }

    // 7. Registrar el pago
    const { error: errorPago } = await supabase
        .from('pagos')
        .insert({
            credito_id: creditoId,
            monto: montoPagado,
            tipo: opcion === 'total' ? 'DESEMPENO' : 'RENOVACION',
            metodo_pago: 'EFECTIVO',
            observaciones: `Renovación ${opcion}`,
            usuario_id: user.id
        })

    if (errorPago) {
        console.error('Error registrando pago:', errorPago)
        // No fallamos, el crédito ya se actualizó
    }

    // 8. Registrar movimiento de caja si hay caja abierta
    if (cajaOperativaId) {
        const { data: caja } = await supabase
            .from('cajas_operativas')
            .select('saldo_actual')
            .eq('id', cajaOperativaId)
            .single()

        if (caja) {
            await supabase.from('movimientos_caja_operativa').insert({
                caja_operativa_id: cajaOperativaId,
                tipo: 'INGRESO',
                motivo: opcion === 'total' ? 'DESEMPENO' : 'RENOVACION_INTERESES',
                monto: montoPagado,
                saldo_anterior: caja.saldo_actual,
                saldo_nuevo: caja.saldo_actual + montoPagado,
                referencia_id: creditoId,
                descripcion: `Renovación ${opcion} - Crédito #${credito.codigo_credito}`,
                usuario_id: user.id
            })

            await supabase
                .from('cajas_operativas')
                .update({ saldo_actual: caja.saldo_actual + montoPagado })
                .eq('id', cajaOperativaId)
        }
    }

    // 9. Si es cancelación total, liberar garantía
    if (nuevoEstado === 'cancelado') {
        await supabase
            .from('garantias')
            .update({ estado: 'devuelta' })
            .eq('credito_id', creditoId)
    }

    revalidatePath('/dashboard/renovaciones')
    revalidatePath('/dashboard/inventario')
    revalidatePath('/dashboard/caja')

    return {
        success: true,
        mensaje: mensajeExito,
        nuevoSaldo,
        nuevaFecha: nuevaFechaVencimiento.toISOString()
    }
}

export async function obtenerEstadisticasRenovaciones() {
    try {
        const contratos = await obtenerContratosRenovables(30)

        const hoy = contratos.filter(c => c.dias_restantes === 0).length
        const semana = contratos.filter(c => c.dias_restantes > 0 && c.dias_restantes <= 7).length
        const mes = contratos.length

        return { hoy, semana, mes }
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error)
        return { hoy: 0, semana: 0, mes: 0 }
    }
}
