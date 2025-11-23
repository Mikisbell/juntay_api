'use server'

import { createClient } from '@/lib/supabase/server'
import { EmpenoCompletoData } from '@/lib/validators/empeno-schemas'
import { revalidatePath } from 'next/cache'

export async function obtenerCajaAbierta(usuarioId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cajas_operativas')
        .select('id, numero_caja')
        .eq('usuario_id', usuarioId)
        .eq('estado', 'abierta')
        .single()

    if (error) {
        // Si no encuentra caja (PGRST116 es el código de 'no rows returned' en Postgrest)
        if (error.code !== 'PGRST116') {
            console.error('Error obteniendo caja abierta:', error)
        }
        return null
    }

    return data
}

export async function registrarEmpeno(data: EmpenoCompletoData) {
    const supabase = await createClient()

    // 1. Validar sesión
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('No autorizado. Por favor inicia sesión nuevamente.')
    }

    // 2. Obtener caja abierta
    const caja = await obtenerCajaAbierta(user.id)
    if (!caja) {
        throw new Error('No tienes una caja abierta. Debes abrir caja antes de registrar operaciones.')
    }

    // 3. Preparar datos para RPC

    // Inferir tipo de documento si no está explícito
    const docLength = data.cliente.dni.length
    const tipoDoc = docLength === 8 ? 'DNI' : docLength === 11 ? 'RUC' : 'CE'

    const garantiaData = {
        descripcion: data.detallesGarantia.descripcion || '',
        categoria: data.detallesGarantia.categoria,
        valor_tasacion: data.detallesGarantia.valorMercado,
        estado: data.detallesGarantia.estado_bien,
        marca: data.detallesGarantia.marca,
        modelo: data.detallesGarantia.modelo,
        serie: data.detallesGarantia.serie,
        fotos: data.detallesGarantia.fotos || []
    }

    // Calcular fecha de vencimiento
    const dias = calculateTotalDays(data.condicionesPago.numeroCuotas, data.condicionesPago.frecuenciaPago)
    const fechaInicio = new Date(data.condicionesPago.fechaInicio)
    const fechaVenc = new Date(fechaInicio)
    fechaVenc.setDate(fechaVenc.getDate() + dias)

    const contratoData = {
        monto: data.detallesGarantia.montoPrestamo,
        interes: data.detallesGarantia.tasaInteres,
        dias: dias,
        fecha_venc: fechaVenc.toISOString().split('T')[0] // YYYY-MM-DD
    }

    // 4. Llamar al RPC
    const { data: contratoId, error } = await supabase.rpc('crear_contrato_oficial', {
        p_caja_id: caja.id,
        p_cliente_doc_tipo: tipoDoc,
        p_cliente_doc_num: data.cliente.dni,
        p_cliente_nombre: `${data.cliente.nombres} ${data.cliente.apellidos}`.trim(),
        p_garantia_data: garantiaData,
        p_contrato_data: contratoData
    })

    if (error) {
        console.error('Error RPC crear_contrato_oficial:', error)
        throw new Error(`Error al registrar contrato: ${error.message}`)
    }

    revalidatePath('/dashboard')
    return contratoId
}

// Helpers
function getDiasPorFrecuencia(frecuencia: string): number {
    switch (frecuencia) {
        case 'DIARIO': return 1;
        case 'SEMANAL': return 7;
        case 'QUINCENAL': return 15;
        case 'TRES_SEMANAS': return 21;
        case 'MENSUAL': return 30;
        default: return 30;
    }
}

function calculateTotalDays(cuotas: number, frecuencia: string): number {
    return cuotas * getDiasPorFrecuencia(frecuencia);
}
