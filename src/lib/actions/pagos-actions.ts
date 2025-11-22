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

    // Calcular mora si está vencido
    const hoy = new Date()
    const vencimiento = new Date(credito.fecha_vencimiento)
    const diasMora = Math.max(0, Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24)))
    const moraPendiente = diasMora > 0 ? (credito.saldo_pendiente * 0.005 * diasMora) : 0 // 0.5% diario

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
        dias_mora: diasMora,
        mora_pendiente: moraPendiente
    }
}

export async function registrarPago({
    creditoId,
    tipoPago,
    montoPagado,
    cajaOperativaId
}: {
    creditoId: string
    tipoPago: 'interes' | 'desempeno'
    montoPagado: number
    cajaOperativaId: string
}) {
    const supabase = await createClient()

    // 1. Obtener datos del crédito
    const { data: credito, error: creditoError } = await supabase
        .from('creditos')
        .select('*, garantia:garantias(id)')
        .eq('id', creditoId)
        .single()

    if (creditoError || !credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    // 2. Validar monto según tipo de pago
    const totalAPagar = credito.saldo_pendiente + credito.interes_acumulado

    if (tipoPago === 'desempeno' && montoPagado < totalAPagar) {
        return { success: false, error: `Monto insuficiente. Total a pagar: S/ ${totalAPagar.toFixed(2)}` }
    }

    // 3. Registrar el pago
    const { error: pagoError } = await supabase
        .from('pagos')
        .insert({
            credito_id: creditoId,
            caja_operativa_id: cajaOperativaId,
            monto_total: montoPagado,
            desglose_capital: tipoPago === 'desempeno' ? credito.saldo_pendiente : 0,
            desglose_interes: tipoPago === 'interes' ? montoPagado : credito.interes_acumulado,
            desglose_mora: 0, // TODO: calcular mora
            medio_pago: 'efectivo'
        })

    if (pagoError) {
        return { success: false, error: 'Error al registrar pago' }
    }

    // 4. Actualizar el crédito
    if (tipoPago === 'desempeno') {
        // Desempeño: marcar como pagado y liberar garantía
        await supabase
            .from('creditos')
            .update({
                estado: 'cancelado',
                saldo_pendiente: 0,
                interes_acumulado: 0
            })
            .eq('id', creditoId)

        // Liberar garantía
        if (credito.garantia) {
            await supabase
                .from('garantias')
                .update({ estado: 'liberada' })
                .eq('id', credito.garantia.id)
        }
    } else {
        // Pago de interés: solo resetear interés acumulado
        await supabase
            .from('creditos')
            .update({ interes_acumulado: 0 })
            .eq('id', creditoId)
    }

    // 5. Registrar movimiento de caja (INGRESO)
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('saldo_actual')
        .eq('id', cajaOperativaId)
        .single()

    if (caja) {
        const nuevoSaldo = caja.saldo_actual + montoPagado

        await supabase.from('movimientos_caja_operativa').insert({
            caja_operativa_id: cajaOperativaId,
            tipo: 'INGRESO',
            motivo: tipoPago === 'desempeno' ? 'DESEMPENO' : 'PAGO_INTERES',
            monto: montoPagado,
            saldo_anterior: caja.saldo_actual,
            saldo_nuevo: nuevoSaldo,
            referencia_id: creditoId,
            descripcion: `Pago ${tipoPago} - Contrato ${credito.codigo}`,
            usuario_id: credito.cliente_id // TODO: get from auth
        })

        await supabase
            .from('cajas_operativas')
            .update({ saldo_actual: nuevoSaldo })
            .eq('id', cajaOperativaId)
    }

    revalidatePath('/dashboard/pagos')
    revalidatePath('/dashboard/inventario')

    return { success: true }
}
