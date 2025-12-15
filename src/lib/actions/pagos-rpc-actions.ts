/// <reference types="node" />
'use server'

// Server Action for RPC-based payment processing

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Definir tipo de entrada estricto
export type PagoRPCInput = {
    creditoId: string
    monto: number
    tipo: 'RENOVACION' | 'DESEMPENO'
    metodo: 'EFECTIVO' | 'YAPE'
    metadata?: Record<string, unknown>
}

export async function registrarPagoRPCAction(input: PagoRPCInput) {
    const supabase = await createClient()

    try {
        // 1. Obtener usuario actual
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'No autenticado' }
        }

        // 2. Obtener ID de caja del usuario actual
        const { data: caja, error: cajaError } = await supabase
            .from('cajas_operativas')
            .select('id')
            .eq('estado', 'abierta')
            .eq('usuario_id', user.id)
            .single()

        if (cajaError || !caja) {
            return { success: false, error: 'No tienes caja abierta. Abre caja para procesar pagos.' }
        }

        // 3. Llamar al RPC seguro
        const { data, error: rpcError } = await supabase.rpc('registrar_pago_oficial', {
            p_caja_id: caja.id,
            p_credito_id: input.creditoId,
            p_monto_pago: input.monto,
            p_tipo_operacion: input.tipo,
            p_metodo_pago: input.metodo,
            p_metadata: input.metadata || {}
        })

        if (rpcError) {
            console.error('RPC Error:', rpcError)
            return { success: false, error: rpcError.message }
        }

        // 4. Actualizar UI
        revalidatePath('/dashboard/pagos')
        revalidatePath('/dashboard/caja')
        revalidatePath('/dashboard/inventario')
        revalidatePath('/dashboard/contratos')

        return {
            success: true,
            mensaje: data?.mensaje,
            data
        }
    } catch (error: unknown) {
        console.error('Error en registrarPagoRPCAction:', error)
        const err = error as Error
        return {
            success: false,
            error: err.message || 'Error inesperado al procesar pago'
        }
    }
}
