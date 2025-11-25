'use server'

import { createClient } from '@/lib/supabase/server'
import { EmpenoCompletoData } from '@/lib/validators/empeno-schemas'
import { revalidatePath } from 'next/cache'

const DEV_USER_ID = '00000000-0000-0000-0000-000000000011' // Cajero from seed

export async function obtenerCajaAbierta(usuarioId: string) {
    const supabase = await createClient()

    let { data, error } = await supabase
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
        console.log('[INFO] No se encontró caja abierta para usuario:', usuarioId)
        return null
    }

    console.log('[INFO] Caja encontrada:', data)
    return data
}

export async function registrarEmpeno(data: EmpenoCompletoData) {
    const supabase = await createClient()

    // 1. Validar sesión
    let { data: { user }, error: authError } = await supabase.auth.getUser()

    // DEV MODE: Mock session
    if ((authError || !user) && process.env.NODE_ENV === 'development') {
        console.log('DEV MODE: Using mock user session')
        user = { id: DEV_USER_ID } as any
        authError = null
    }

    if (authError || !user) {
        throw new Error('No autorizado. Por favor inicia sesión nuevamente.')
    }

    // 2. Obtener caja abierta
    console.log('[DEV] Attempting to get caja for user:', user.id, '| NODE_ENV:', process.env.NODE_ENV)
    const caja = await obtenerCajaAbierta(user.id)
    console.log('[DEV] Caja result:', caja)

    if (!caja) {
        const errorMsg = process.env.NODE_ENV === 'development'
            ? `No tienes una caja abierta (User ID: ${user.id}). Auto-creación falló. Debes abrir caja manualmente.`
            : 'No tienes una caja abierta. Debes abrir caja antes de registrar operaciones.'
        throw new Error(errorMsg)
    }

    // 3. Preparar datos para RPC

    // Inferir tipo de documento si no está explícito
    const docLength = data.cliente.dni.length
    const tipoDoc = docLength === 8 ? 'DNI' : docLength === 11 ? 'RUC' : 'CE'

    // ⚠️ VALIDACIÓN CRÍTICA: valorMercado es NOT NULL en la BD
    // Asegurar que valorMercado tiene un valor válido antes de crear la garantía
    let valorMercado = data.detallesGarantia.valorMercado || 0
    const montoPrestamo = data.detallesGarantia.montoPrestamo || 0

    console.log('[DEBUG] valorMercado recibido:', valorMercado)
    console.log('[DEBUG] montoPrestamo recibido:', montoPrestamo)
    console.log('[DEBUG] detallesGarantia completo:', JSON.stringify(data.detallesGarantia, null, 2))

    if (!valorMercado || valorMercado === 0) {
        if (montoPrestamo && montoPrestamo > 0) {
            // Estimamos que el préstamo es ~65% del valor de mercado (LTV típico)
            valorMercado = Math.round(montoPrestamo / 0.65)
            console.log(`[AUTO-CALC] valorMercado estimado desde montoPrestamo: ${montoPrestamo} -> ${valorMercado}`)
        } else {
            // ❌ Error crítico: No podemos crear garantía sin valor de tasación
            console.error('[ERROR CRÍTICO] No hay valorMercado ni montoPrestamo:', {
                categoria: data.detallesGarantia.categoria,
                valorMercado: data.detallesGarantia.valorMercado,
                montoPrestamo: data.detallesGarantia.montoPrestamo
            })
            throw new Error(
                'Error en datos de tasación: Debe completar el valor de mercado del bien o el monto del préstamo. ' +
                'Verifique que haya seleccionado categoría, subcategoría y estado del bien en el paso de tasación.'
            )
        }
    }

    // ⚠️ Validación LTV (Loan-to-Value): Advertencia si excede, pero permite continuar
    if (montoPrestamo > valorMercado) {
        const ltv = ((montoPrestamo / valorMercado) * 100).toFixed(2)
        console.warn(`[WARNING LTV] Préstamo excede valor de mercado:`)
        console.warn(`  - Monto Préstamo: S/ ${montoPrestamo}`)
        console.warn(`  - Valor Mercado: S/ ${valorMercado}`)
        console.warn(`  - LTV: ${ltv}% (>100% - ALTO RIESGO)`)
        console.warn(`  - Cliente: ${data.cliente.nombres} ${data.cliente.apellido_paterno} ${data.cliente.apellido_materno}`)
        console.warn(`  - Categoría: ${data.detallesGarantia.categoria}`)
        console.warn(`  ⚠️ OPERACIÓN PERMITIDA - Revisar con gerencia si es necesario`)
        // NO lanzamos error, solo advertimos. El negocio puede decidir aprobar estos casos.
    }

    const garantiaData = {
        descripcion: data.detallesGarantia.descripcion || '',
        categoria: data.detallesGarantia.categoria,
        valor_tasacion: valorMercado,
        estado: data.detallesGarantia.estado_bien,
        marca: data.detallesGarantia.marca,
        modelo: data.detallesGarantia.modelo,
        serie: data.detallesGarantia.serie,
        subcategoria: (data.detallesGarantia as any).subcategoria || null,  // ✅ NUEVO CAMPO
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
        p_cliente_nombre: `${data.cliente.nombres} ${data.cliente.apellido_paterno} ${data.cliente.apellido_materno}`.trim(),
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
