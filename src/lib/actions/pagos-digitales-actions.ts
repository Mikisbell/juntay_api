'use server'

/**
 * Integración Yape/Plin - QR de Cobro
 * 
 * Genera QR informativos para cobros.
 * No requiere API externa - funciona con cualquier Yape/Plin.
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ TYPES ============

export interface DatosCobroQR {
    creditoId: string
    codigoCredito: string
    clienteNombre: string
    monto: number
    concepto: string
    numeroDestino?: string  // Número Yape/Plin de la empresa
}

export interface PagoDigitalRegistrado {
    id: string
    creditoId: string
    monto: number
    metodo: 'yape' | 'plin' | 'transferencia'
    referencia?: string
    fechaConfirmacion: string
    confirmadoPor: string
}

// ============ CONFIG ============

/**
 * Obtiene la configuración de números Yape/Plin de la empresa
 */
export async function obtenerConfigPagosDigitales(): Promise<{
    numeroYape: string | null
    numeroPlin: string | null
    nombreTitular: string | null
}> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('configuraciones')
        .select('valor')
        .eq('clave', 'pagos_digitales')
        .single()

    if (!data?.valor) {
        return {
            numeroYape: null,
            numeroPlin: null,
            nombreTitular: null
        }
    }

    const config = data.valor as {
        numero_yape?: string
        numero_plin?: string
        nombre_titular?: string
    }

    return {
        numeroYape: config.numero_yape || null,
        numeroPlin: config.numero_plin || null,
        nombreTitular: config.nombre_titular || null
    }
}

/**
 * Guarda la configuración de pagos digitales
 */
export async function guardarConfigPagosDigitales(config: {
    numeroYape?: string
    numeroPlin?: string
    nombreTitular?: string
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('configuraciones')
        .upsert({
            clave: 'pagos_digitales',
            valor: {
                numero_yape: config.numeroYape || null,
                numero_plin: config.numeroPlin || null,
                nombre_titular: config.nombreTitular || null
            },
            descripcion: 'Configuración de números Yape/Plin para cobros',
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'clave'
        })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/configuracion')
    return { success: true }
}

// ============ QR GENERATION ============

/**
 * Genera los datos para el QR de cobro
 */
export async function generarDatosCobroQR(
    creditoId: string,
    monto: number
): Promise<{ success: boolean; datos?: DatosCobroQR; error?: string }> {
    const supabase = await createClient()

    // Obtener datos del crédito
    const { data: credito, error } = await supabase
        .from('creditos')
        .select(`
            codigo,
            clientes!inner(nombres, apellido_paterno)
        `)
        .eq('id', creditoId)
        .single()

    if (error || !credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    const cliente = credito.clientes as unknown as { nombres: string; apellido_paterno: string }
    const config = await obtenerConfigPagosDigitales()

    const datos: DatosCobroQR = {
        creditoId,
        codigoCredito: credito.codigo,
        clienteNombre: `${cliente.nombres} ${cliente.apellido_paterno}`,
        monto,
        concepto: `Pago crédito ${credito.codigo}`,
        numeroDestino: config.numeroYape || config.numeroPlin || undefined
    }

    return { success: true, datos }
}

/**
 * Genera el texto para el QR (formato simple)
 */
export function generarTextoQR(datos: DatosCobroQR): string {
    const lineas = [
        `PAGO JUNTAY`,
        `Código: ${datos.codigoCredito}`,
        `Monto: S/ ${datos.monto.toFixed(2)}`,
        datos.numeroDestino ? `Yape/Plin: ${datos.numeroDestino}` : ''
    ].filter(Boolean)

    return lineas.join('\n')
}

// ============ CONFIRMACIÓN DE PAGO ============

/**
 * Confirma un pago digital (Yape/Plin)
 */
export async function confirmarPagoDigital(params: {
    creditoId: string
    monto: number
    metodo: 'yape' | 'plin' | 'transferencia'
    referencia?: string
    usuarioId: string
}): Promise<{ success: boolean; pagoId?: string; error?: string }> {
    const supabase = await createClient()

    // Verificar que el crédito existe y tiene saldo
    const { data: credito, error: creditoError } = await supabase
        .from('creditos')
        .select('id, saldo_pendiente, estado')
        .eq('id', params.creditoId)
        .single()

    if (creditoError || !credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    if (params.monto > credito.saldo_pendiente) {
        return { success: false, error: 'Monto excede saldo pendiente' }
    }

    // Registrar el pago
    const { data: pago, error: pagoError } = await supabase
        .from('pagos')
        .insert({
            credito_id: params.creditoId,
            monto: params.monto,
            tipo: 'abono',
            metodo_pago: params.metodo,
            referencia: params.referencia || null,
            usuario_id: params.usuarioId,
            metadata: {
                origen: 'pago_digital',
                metodo: params.metodo,
                confirmado_manualmente: true
            }
        })
        .select('id')
        .single()

    if (pagoError) {
        console.error('Error registrando pago:', pagoError)
        return { success: false, error: 'Error registrando pago' }
    }

    // Actualizar saldo del crédito
    const nuevoSaldo = credito.saldo_pendiente - params.monto
    const nuevoEstado = nuevoSaldo <= 0 ? 'cancelado' : credito.estado

    await supabase
        .from('creditos')
        .update({
            saldo_pendiente: nuevoSaldo,
            estado: nuevoEstado
        })
        .eq('id', params.creditoId)

    revalidatePath('/dashboard/pagos')
    revalidatePath('/dashboard/creditos')

    return { success: true, pagoId: pago.id }
}

// ============ CONCILIACIÓN ============

/**
 * Obtiene pagos digitales del día para conciliación
 */
export async function obtenerPagosDigitalesHoy(): Promise<{
    pagos: {
        id: string
        monto: number
        metodo: string
        referencia: string | null
        hora: string
        codigoCredito: string
    }[]
    totalYape: number
    totalPlin: number
    totalTransferencia: number
}> {
    const supabase = await createClient()
    const hoy = new Date().toISOString().split('T')[0]

    const { data: pagos } = await supabase
        .from('pagos')
        .select(`
            id,
            monto,
            metodo_pago,
            referencia,
            created_at,
            creditos!inner(codigo)
        `)
        .in('metodo_pago', ['yape', 'plin', 'transferencia'])
        .gte('created_at', `${hoy}T00:00:00`)
        .lte('created_at', `${hoy}T23:59:59`)
        .order('created_at', { ascending: false })

    const resultado = {
        pagos: (pagos || []).map(p => ({
            id: p.id,
            monto: p.monto,
            metodo: p.metodo_pago,
            referencia: p.referencia,
            hora: new Date(p.created_at).toLocaleTimeString('es-PE'),
            codigoCredito: (p.creditos as unknown as { codigo: string })?.codigo || 'N/A'
        })),
        totalYape: 0,
        totalPlin: 0,
        totalTransferencia: 0
    }

    for (const p of (pagos || [])) {
        if (p.metodo_pago === 'yape') resultado.totalYape += p.monto
        if (p.metodo_pago === 'plin') resultado.totalPlin += p.monto
        if (p.metodo_pago === 'transferencia') resultado.totalTransferencia += p.monto
    }

    return resultado
}
