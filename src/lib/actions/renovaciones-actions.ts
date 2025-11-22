'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function renovarContrato({
    creditoId,
    diasExtra,
    cajaOperativaId
}: {
    creditoId: string
    diasExtra: number
    cajaOperativaId: string
}) {
    const supabase = await createClient()

    // 1. Obtener crédito actual
    const { data: credito, error: creditoError } = await supabase
        .from('creditos')
        .select('*')
        .eq('id', creditoId)
        .single()

    if (creditoError || !credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    // 2. Calcular monto de renovación (interés acumulado)
    const montoRenovacion = credito.interes_acumulado

    if (montoRenovacion <= 0) {
        return { success: false, error: 'No hay interés acumulado para renovar' }
    }

    // 3. Calcular nueva fecha de vencimiento
    const fechaActual = new Date(credito.fecha_vencimiento)
    fechaActual.setDate(fechaActual.getDate() + diasExtra)
    const nuevaFecha = fechaActual.toISOString().split('T')[0]

    // 4. Registrar el pago de renovación
    const { error: pagoError } = await supabase
        .from('pagos')
        .insert({
            credito_id: creditoId,
            caja_operativa_id: cajaOperativaId,
            monto_total: montoRenovacion,
            desglose_capital: 0,
            desglose_interes: montoRenovacion,
            desglose_mora: 0,
            medio_pago: 'efectivo',
            metadata: { tipo: 'renovacion', dias_extra: diasExtra }
        })

    if (pagoError) {
        return { success: false, error: 'Error al registrar pago de renovación' }
    }

    // 5. Actualizar el crédito
    const { error: updateError } = await supabase
        .from('creditos')
        .update({
            fecha_vencimiento: nuevaFecha,
            interes_acumulado: 0,
            periodo_dias: credito.periodo_dias + diasExtra
        })
        .eq('id', creditoId)

    if (updateError) {
        return { success: false, error: 'Error al actualizar crédito' }
    }

    // 6. Registrar movimiento de caja (INGRESO)
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('saldo_actual')
        .eq('id', cajaOperativaId)
        .single()

    if (caja) {
        const nuevoSaldo = caja.saldo_actual + montoRenovacion

        await supabase.from('movimientos_caja_operativa').insert({
            caja_operativa_id: cajaOperativaId,
            tipo: 'INGRESO',
            motivo: 'RENOVACION',
            monto: montoRenovacion,
            saldo_anterior: caja.saldo_actual,
            saldo_nuevo: nuevoSaldo,
            referencia_id: creditoId,
            descripcion: `Renovación ${diasExtra} días - Contrato ${credito.codigo}`,
            usuario_id: credito.cliente_id
        })

        await supabase
            .from('cajas_operativas')
            .update({ saldo_actual: nuevoSaldo })
            .eq('id', cajaOperativaId)
    }

    revalidatePath('/dashboard/pagos')

    return {
        success: true,
        nuevaFecha,
        montoRenovacion
    }
}
