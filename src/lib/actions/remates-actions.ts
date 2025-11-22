'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function venderPrenda({
    garantiaId,
    precioVenta,
    cajaOperativaId
}: {
    garantiaId: string
    precioVenta: number
    cajaOperativaId: string
}) {
    const supabase = await createClient()

    // 1. Obtener datos de la garantía y crédito asociado
    const { data: garantia, error: garantiaError } = await supabase
        .from('garantias')
        .select('*, creditos(*)')
        .eq('id', garantiaId)
        .single()

    if (garantiaError || !garantia) {
        return { success: false, error: 'Garantía no encontrada' }
    }

    const credito = Array.isArray(garantia.creditos) ? garantia.creditos[0] : garantia.creditos

    // 2. Marcar garantía como vendida
    await supabase
        .from('garantias')
        .update({ estado: 'vendida' })
        .eq('id', garantiaId)

    // 3. Calcular excedente (si lo hay)
    const totalAdeudado = credito.saldo_pendiente + credito.interes_acumulado
    const excedente = Math.max(0, precioVenta - totalAdeudado)

    // 4. Registrar movimiento de caja (INGRESO)
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('saldo_actual')
        .eq('id', cajaOperativaId)
        .single()

    if (caja) {
        const nuevoSaldo = caja.saldo_actual + precioVenta

        await supabase.from('movimientos_caja_operativa').insert({
            caja_operativa_id: cajaOperativaId,
            tipo: 'INGRESO',
            motivo: 'VENTA_REMATE',
            monto: precioVenta,
            saldo_anterior: caja.saldo_actual,
            saldo_nuevo: nuevoSaldo,
            referencia_id: credito.id,
            descripcion: `Venta en remate - ${garantia.descripcion}`,
            usuario_id: credito.cliente_id,
            metadata: { excedente, garantia_id: garantiaId }
        })

        await supabase
            .from('cajas_operativas')
            .update({ saldo_actual: nuevoSaldo })
            .eq('id', cajaOperativaId)
    }

    // 5. Marcar crédito como rematado
    await supabase
        .from('creditos')
        .update({ estado: 'rematado' })
        .eq('id', credito.id)

    revalidatePath('/dashboard/remates')
    revalidatePath('/dashboard/inventario')

    return {
        success: true,
        excedente
    }
}
