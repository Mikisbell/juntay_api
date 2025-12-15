'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * SISTEMA DE REVERSIONES
 * Como los bancos reales - nunca borrar, siempre reversar
 */

/**
 * Reversar un movimiento de caja
 * Crea movimiento inverso y marca original como anulado
 * 
 * @example
 * // Cajero digitó S/5000 en vez de S/500
 * await reversarMovimiento({
 *   movimientoId: "mov-123",
 *   motivo: "Monto incorrecto: eran S/500 no S/5000"
 * })
 */
export async function reversarMovimiento({
    movimientoId,
    motivo
}: {
    movimientoId: string
    motivo: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // Verificar permisos
    const { data: puedeAnular } = await supabase.rpc('puede_anular_movimiento', {
        p_movimiento_id: movimientoId,
        p_usuario_id: user.id
    })

    if (!puedeAnular) {
        return {
            success: false,
            error: 'No tienes permisos para anular este movimiento. Contacta a un supervisor.'
        }
    }

    // Ejecutar reversión
    const { data, error } = await supabase.rpc('reversar_movimiento', {
        p_movimiento_id: movimientoId,
        p_motivo: motivo,
        p_usuario_id: user.id
    })

    if (error) {
        console.error('Error reversando:', error)
        return { success: false, error: error.message }
    }

    const resultado = data?.[0]

    if (!resultado?.success) {
        return { success: false, error: resultado?.mensaje || 'Error desconocido' }
    }

    revalidatePath('/dashboard/caja')

    return {
        success: true,
        mensaje: resultado.mensaje,
        movimientoReversionId: resultado.movimiento_reversion_id
    }
}

/**
 * Anular un pago
 * Marca como anulado y revierte efecto en crédito
 */
export async function anularPago({
    pagoId,
    motivo
}: {
    pagoId: string
    motivo: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase.rpc('anular_pago', {
        p_pago_id: pagoId,
        p_motivo: motivo,
        p_usuario_id: user.id
    })

    if (error) {
        console.error('Error anulando pago:', error)
        return { success: false, error: error.message }
    }

    const resultado = data?.[0]

    revalidatePath('/dashboard/caja')
    revalidatePath('/dashboard/contratos')

    return {
        success: resultado?.success ?? false,
        mensaje: resultado?.mensaje
    }
}

/**
 * Obtener historial de movimientos con reversiones visibles
 */
export async function obtenerMovimientosConHistorial(cajaId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('movimientos_caja_operativa')
        .select(`
            *,
            usuario:usuarios(nombres, apellido_paterno),
            anulador:usuarios!anulado_por(nombres, apellido_paterno)
        `)
        .or(`caja_operativa_id.eq.${cajaId},caja_id.eq.${cajaId}`)
        .order('fecha', { ascending: false })

    if (error) {
        console.error('Error obteniendo movimientos:', error)
        return []
    }

    return data?.map(m => ({
        id: m.id,
        tipo: m.tipo,
        motivo: m.motivo,
        monto: m.monto,
        descripcion: m.descripcion,
        fecha: m.fecha,
        // Estado
        anulado: m.anulado,
        motivoAnulacion: m.motivo_anulacion,
        esReversion: m.es_reversion,
        movimientoOriginalId: m.movimiento_original_id,
        // Usuarios
        usuario: m.usuario,
        anulador: m.anulador,
        anuladoAt: m.anulado_at
    })) || []
}

/**
 * Obtener saldo efectivo (excluyendo anulados)
 */
export async function obtenerSaldoEfectivo(cajaId: string): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_saldo_caja_efectivo', {
        p_caja_id: cajaId
    })

    if (error) {
        console.error('Error calculando saldo:', error)
        return 0
    }

    return data || 0
}

/**
 * Verificar integridad: saldo almacenado vs saldo efectivo
 */
export async function verificarIntegridadCaja(cajaId: string) {
    const supabase = await createClient()

    // Saldo almacenado
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('saldo_actual')
        .eq('id', cajaId)
        .single()

    // Saldo calculado (excluye anulados)
    const saldoEfectivo = await obtenerSaldoEfectivo(cajaId)

    const saldoAlmacenado = caja?.saldo_actual || 0
    const diferencia = Math.abs(saldoAlmacenado - saldoEfectivo)

    return {
        saldoAlmacenado,
        saldoEfectivo,
        diferencia,
        esIntegro: diferencia < 0.01,
        mensaje: diferencia < 0.01
            ? '✅ Saldos coinciden'
            : `⚠️ Diferencia de S/${diferencia.toFixed(2)}`
    }
}

/**
 * Registrar evento (para auditoría opcional)
 */
export async function registrarEvento({
    agregadoTipo,
    agregadoId,
    eventoTipo,
    payload = {}
}: {
    agregadoTipo: 'CREDITO' | 'CAJA' | 'CLIENTE' | 'GARANTIA'
    agregadoId: string
    eventoTipo: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: Record<string, any>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.rpc('registrar_evento', {
        p_agregado_tipo: agregadoTipo,
        p_agregado_id: agregadoId,
        p_evento_tipo: eventoTipo,
        p_payload: payload,
        p_usuario_id: user?.id || null
    })

    if (error) {
        console.error('Error registrando evento:', error)
        return null
    }

    return data
}
