'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ContratoParaPago = {
    id: string
    codigo: string
    cliente: {
        nombre: string
        documento: string
    }
    monto_prestado: number
    saldo_pendiente: number
    tasa_interes: number
    fecha_vencimiento: string
    interes_acumulado: number
    dias_mora: number
    mora_pendiente: number
}

export async function buscarContratoPorCodigo(codigo: string): Promise<ContratoParaPago | null> {
    const supabase = await createClient()

    const { data: credito, error } = await supabase
        .from('creditos')
        .select(`
      id,
      codigo,
      monto_prestado,
      saldo_pendiente,
      tasa_interes,
      fecha_vencimiento,
      interes_acumulado,
      estado,
      cliente:clientes(nombres, apellido_paterno, numero_documento)
    `)
        .eq('codigo', codigo.toUpperCase())
        .eq('estado', 'vigente')
        .single()

    if (error || !credito) return null

    // Handle cliente data (might be array from join)
    const clienteData = Array.isArray(credito.cliente) ? credito.cliente[0] : credito.cliente

    // Calcular mora con período de gracia y tasa unificada
    const PERIODO_GRACIA_DIAS = 3      // 3 días sin mora
    const TASA_MORA_DIARIA = 0.003     // 0.3% diario (unificado con RPC)
    const TOPE_MORA_MENSUAL = 0.10     // Máximo 10% mensual

    const hoy = new Date()
    const vencimiento = new Date(credito.fecha_vencimiento)
    const diasVencido = Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24))

    // Solo aplica mora después del período de gracia
    const diasMoraEfectivos = Math.max(0, diasVencido - PERIODO_GRACIA_DIAS)

    // Calcular mora con tope mensual
    const moraSinTope = credito.saldo_pendiente * TASA_MORA_DIARIA * diasMoraEfectivos
    const moraMensualMaxima = credito.saldo_pendiente * TOPE_MORA_MENSUAL
    const moraPendiente = Math.min(moraSinTope, moraMensualMaxima)

    return {
        id: credito.id,
        codigo: credito.codigo,
        cliente: {
            nombre: `${clienteData.nombres} ${clienteData.apellido_paterno}`,
            documento: clienteData.numero_documento
        },
        monto_prestado: credito.monto_prestado,
        saldo_pendiente: credito.saldo_pendiente,
        tasa_interes: credito.tasa_interes,
        fecha_vencimiento: credito.fecha_vencimiento,
        interes_acumulado: credito.interes_acumulado,
        dias_mora: diasMoraEfectivos,
        mora_pendiente: moraPendiente
    }
}

export async function registrarPago({
    creditoId,
    tipoPago,
    montoPagado,
    cajaOperativaId,
    metodoPago = 'efectivo',
    metadata = {}
}: {
    creditoId: string
    tipoPago: 'interes' | 'desempeno'
    montoPagado: number
    cajaOperativaId: string
    metodoPago?: string
    metadata?: any
}) {
    const supabase = await createClient()

    // Mapear tipoPago a tipo esperado por RPC
    const tipoOperacion = tipoPago === 'desempeno' ? 'DESEMPENO' : 'RENOVACION'

    // PRODUCCIÓN: Usar RPC atómica que maneja todo en una transacción
    const { data, error } = await supabase.rpc('registrar_pago_oficial', {
        p_caja_id: cajaOperativaId,
        p_credito_id: creditoId,
        p_monto_pago: montoPagado,
        p_tipo_operacion: tipoOperacion,
        p_metodo_pago: metodoPago.toUpperCase(),
        p_metadata: metadata
    })

    if (error) {
        console.error('Error registrando pago:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/pagos')
    revalidatePath('/dashboard/inventario')
    revalidatePath('/dashboard/caja')

    return {
        success: true,
        mensaje: data?.mensaje || 'Pago registrado exitosamente',
        nuevoSaldoCaja: data?.nuevo_saldo_caja
    }
}

/**
 * Condonar mora de un crédito (perdonar deuda de mora)
 * Uso: Retención de clientes, situaciones especiales, errores del sistema
 */
export async function condonarMora({
    creditoId,
    motivo,
    montoCondonado
}: {
    creditoId: string
    motivo: string
    montoCondonado: number
}) {
    const supabase = await createClient()

    // Obtener usuario actual para auditoría
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // Obtener crédito actual
    const { data: credito, error: errorCredito } = await supabase
        .from('creditos')
        .select('id, codigo_credito, saldo_pendiente, cliente_id')
        .eq('id', creditoId)
        .single()

    if (errorCredito || !credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    // Registrar la condonación como un movimiento/nota
    // Nota: Esto se puede hacer como un registro en una tabla de auditoría
    // Por ahora usamos la tabla de pagos con tipo especial
    const { error: errorRegistro } = await supabase
        .from('pagos')
        .insert({
            credito_id: creditoId,
            monto: 0, // No hay pago real
            tipo: 'CONDONACION_MORA',
            metodo_pago: 'CONDONACION',
            observaciones: `MORA CONDONADA: S/${montoCondonado.toFixed(2)} - Motivo: ${motivo}`,
            usuario_id: user.id
        })

    if (errorRegistro) {
        console.error('Error registrando condonación:', errorRegistro)
        // Intentar registrar en otra forma si la tabla pagos no acepta el tipo
    }

    // Actualizar el saldo del crédito restando la mora condonada
    const nuevoSaldo = Math.max(0, credito.saldo_pendiente - montoCondonado)

    const { error: errorUpdate } = await supabase
        .from('creditos')
        .update({
            saldo_pendiente: nuevoSaldo,
            observaciones: `Mora condonada S/${montoCondonado.toFixed(2)} el ${new Date().toLocaleDateString('es-PE')} - ${motivo}`
        })
        .eq('id', creditoId)

    if (errorUpdate) {
        console.error('Error actualizando crédito:', errorUpdate)
        return { success: false, error: 'Error al actualizar el crédito' }
    }

    revalidatePath('/dashboard/pagos')
    revalidatePath('/dashboard/contratos')
    revalidatePath('/dashboard/vencimientos')

    return {
        success: true,
        mensaje: `Mora de S/${montoCondonado.toFixed(2)} condonada exitosamente`,
        nuevoSaldo
    }
}

/**
 * Extender período de gracia (dar más días sin mora)
 */
export async function extenderVencimiento({
    creditoId,
    diasExtension,
    motivo
}: {
    creditoId: string
    diasExtension: number
    motivo: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // Obtener crédito actual
    const { data: credito } = await supabase
        .from('creditos')
        .select('fecha_vencimiento')
        .eq('id', creditoId)
        .single()

    if (!credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    // Calcular nueva fecha
    const fechaActual = new Date(credito.fecha_vencimiento)
    fechaActual.setDate(fechaActual.getDate() + diasExtension)

    const { error } = await supabase
        .from('creditos')
        .update({
            fecha_vencimiento: fechaActual.toISOString(),
            observaciones: `Extensión de ${diasExtension} días el ${new Date().toLocaleDateString('es-PE')} - ${motivo}`
        })
        .eq('id', creditoId)

    if (error) {
        return { success: false, error: 'Error al extender vencimiento' }
    }

    revalidatePath('/dashboard/vencimientos')
    revalidatePath('/dashboard/contratos')

    return {
        success: true,
        mensaje: `Vencimiento extendido ${diasExtension} días`,
        nuevaFecha: fechaActual.toISOString()
    }
}
