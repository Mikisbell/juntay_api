'use server'

/**
 * SBS/UIF Compliance Actions
 * Resolución SBS N° 00650-2024
 * Ley N.º 27693 (UIF-Perú)
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// =============================================================================
// TYPES
// =============================================================================

export interface OficialCumplimiento {
    id: string
    empresa_id: string
    nombres: string
    apellidos: string
    dni: string
    email: string
    telefono?: string
    fecha_designacion: string
    numero_resolucion?: string
    registrado_uif: boolean
    fecha_registro_uif?: string
    ultima_capacitacion?: string
    horas_capacitacion: number
    activo: boolean
    created_at: string
}

export interface ReporteOperacionSospechosa {
    id: string
    empresa_id: string
    numero_reporte: string
    fecha_deteccion: string
    cliente_nombre: string
    cliente_dni?: string
    tipo_operacion: string
    monto: number
    motivo_sospecha: string
    estado: 'borrador' | 'revision' | 'enviado' | 'confirmado'
    created_at: string
}

export interface VerificacionKYC {
    id: string
    cliente_id: string
    empresa_id: string
    estado: 'pendiente' | 'verificado' | 'rechazado' | 'vencido'
    nivel_riesgo: 'bajo' | 'normal' | 'alto' | 'pep'
    dni_verificado: boolean
    es_pep: boolean
    fecha_vencimiento?: string
}

export interface UmbralOperacion {
    id: string
    nombre: string
    tipo_operacion: string
    monto_umbral: number
    moneda: string
    accion: string
    activo: boolean
}

// =============================================================================
// OFICIAL DE CUMPLIMIENTO
// =============================================================================

export async function obtenerOficialCumplimiento(empresaId: string): Promise<OficialCumplimiento | null> {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
        .from('oficiales_cumplimiento')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('activo', true)
        .single()

    if (error) return null
    return data as OficialCumplimiento
}

export async function registrarOficialCumplimiento(input: {
    empresa_id: string
    nombres: string
    apellidos: string
    dni: string
    email: string
    telefono?: string
    fecha_designacion: string
    numero_resolucion?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = await createAdminClient()

    // Desactivar oficial anterior si existe
    await supabase
        .from('oficiales_cumplimiento')
        .update({ activo: false, fecha_baja: new Date().toISOString().split('T')[0] })
        .eq('empresa_id', input.empresa_id)
        .eq('activo', true)

    const { data, error } = await supabase
        .from('oficiales_cumplimiento')
        .insert([input])
        .select('id')
        .single()

    if (error) return { success: false, error: error.message }
    return { success: true, id: data.id }
}

// =============================================================================
// ROS (Reporte de Operación Sospechosa)
// =============================================================================

export async function listarReportesROS(
    empresaId?: string,
    estado?: string
): Promise<ReporteOperacionSospechosa[]> {
    const supabase = await createAdminClient()

    let query = supabase
        .from('reportes_operacion_sospechosa')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

    if (empresaId) query = query.eq('empresa_id', empresaId)
    if (estado) query = query.eq('estado', estado)

    const { data, error } = await query
    if (error) return []
    return data as ReporteOperacionSospechosa[]
}

export async function crearReporteROS(input: {
    empresa_id: string
    sucursal_id?: string
    cliente_id?: string
    cliente_nombre: string
    cliente_dni?: string
    tipo_operacion: string
    monto: number
    descripcion_operacion: string
    motivo_sospecha: string
    indicadores_alerta?: string[]
    detectado_por: string
}): Promise<{ success: boolean; id?: string; numero_reporte?: string; error?: string }> {
    const supabase = await createAdminClient()

    // Generate report number
    const fecha = new Date()
    const numero = `ROS-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-6)}`

    const { data, error } = await supabase
        .from('reportes_operacion_sospechosa')
        .insert([{
            ...input,
            numero_reporte: numero,
            fecha_deteccion: fecha.toISOString().split('T')[0],
            estado: 'borrador'
        }])
        .select('id, numero_reporte')
        .single()

    if (error) return { success: false, error: error.message }
    return { success: true, id: data.id, numero_reporte: data.numero_reporte }
}

export async function enviarReporteROS(
    reporteId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('reportes_operacion_sospechosa')
        .update({
            estado: 'enviado',
            fecha_reporte: new Date().toISOString().split('T')[0],
            enviado_uif_at: new Date().toISOString()
        })
        .eq('id', reporteId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// =============================================================================
// KYC VERIFICATION
// =============================================================================

export async function obtenerKYCCliente(
    clienteId: string,
    empresaId: string
): Promise<VerificacionKYC | null> {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
        .from('verificaciones_kyc')
        .select('*')
        .eq('cliente_id', clienteId)
        .eq('empresa_id', empresaId)
        .single()

    if (error) return null
    return data as VerificacionKYC
}

export async function actualizarKYC(
    clienteId: string,
    empresaId: string,
    updates: Partial<{
        estado: string
        nivel_riesgo: string
        dni_verificado: boolean
        es_pep: boolean
        origen_fondos_declarado: string
    }>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createAdminClient()

    // Upsert - create if not exists
    const { error } = await supabase
        .from('verificaciones_kyc')
        .upsert({
            cliente_id: clienteId,
            empresa_id: empresaId,
            ...updates,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'cliente_id,empresa_id'
        })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function verificarDNIConReniec(
    clienteId: string,
    empresaId: string,
    dni: string
): Promise<{ success: boolean; verificado: boolean; datos?: Record<string, unknown>; error?: string }> {
    // TODO: Integrar con API RENIEC real
    // Por ahora simulamos verificación

    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('verificaciones_kyc')
        .upsert({
            cliente_id: clienteId,
            empresa_id: empresaId,
            dni_verificado: true,
            dni_fecha_verificacion: new Date().toISOString(),
            dni_fuente: 'RENIEC', // Simulated
            estado: 'verificado'
        }, {
            onConflict: 'cliente_id,empresa_id'
        })

    if (error) return { success: false, verificado: false, error: error.message }

    return {
        success: true,
        verificado: true,
        datos: {
            dni,
            nombres: 'Verificación pendiente integración RENIEC',
            estado: 'simulated'
        }
    }
}

// =============================================================================
// OPERATION THRESHOLDS
// =============================================================================

export async function obtenerUmbrales(
    empresaId?: string
): Promise<UmbralOperacion[]> {
    const supabase = await createAdminClient()

    let query = supabase
        .from('umbrales_operacion')
        .select('*')
        .eq('activo', true)
        .order('monto_umbral', { ascending: true })

    // Get global + tenant-specific
    if (empresaId) {
        query = query.or(`empresa_id.is.null,empresa_id.eq.${empresaId}`)
    } else {
        query = query.is('empresa_id', null)
    }

    const { data, error } = await query
    if (error) return []
    return data as UmbralOperacion[]
}

export async function verificarOperacionContraUmbrales(
    monto: number,
    tipoOperacion: string,
    empresaId: string
): Promise<{
    requiereAccion: boolean
    acciones: string[]
    alertas: string[]
}> {
    const umbrales = await obtenerUmbrales(empresaId)

    const acciones: string[] = []
    const alertas: string[] = []

    for (const umbral of umbrales) {
        if (umbral.tipo_operacion !== 'all' && umbral.tipo_operacion !== tipoOperacion) {
            continue
        }

        if (monto >= umbral.monto_umbral) {
            acciones.push(umbral.accion)
            alertas.push(`${umbral.nombre}: Monto S/${monto.toFixed(2)} supera umbral de S/${umbral.monto_umbral}`)
        }
    }

    return {
        requiereAccion: acciones.length > 0,
        acciones: [...new Set(acciones)],
        alertas
    }
}

// =============================================================================
// COMPLIANCE DASHBOARD STATS
// =============================================================================

export async function obtenerEstadisticasCumplimiento(
    empresaId?: string
): Promise<{
    oficial: OficialCumplimiento | null
    rosStats: { total: number; borradores: number; enviados: number }
    kycStats: { total: number; verificados: number; pendientes: number; altoRiesgo: number }
    capacitacionesVencidas: number
    reportesPendientes: number
}> {
    const supabase = await createAdminClient()

    // Get compliance officer
    let oficial: OficialCumplimiento | null = null
    if (empresaId) {
        oficial = await obtenerOficialCumplimiento(empresaId)
    }

    // ROS stats
    let rosQuery = supabase.from('reportes_operacion_sospechosa').select('estado', { count: 'exact' })
    if (empresaId) rosQuery = rosQuery.eq('empresa_id', empresaId)
    const { data: rosData } = await rosQuery

    const rosStats = {
        total: rosData?.length || 0,
        borradores: rosData?.filter(r => r.estado === 'borrador').length || 0,
        enviados: rosData?.filter(r => r.estado === 'enviado' || r.estado === 'confirmado').length || 0
    }

    // KYC stats
    let kycQuery = supabase.from('verificaciones_kyc').select('estado, nivel_riesgo')
    if (empresaId) kycQuery = kycQuery.eq('empresa_id', empresaId)
    const { data: kycData } = await kycQuery

    const kycStats = {
        total: kycData?.length || 0,
        verificados: kycData?.filter(k => k.estado === 'verificado').length || 0,
        pendientes: kycData?.filter(k => k.estado === 'pendiente').length || 0,
        altoRiesgo: kycData?.filter(k => k.nivel_riesgo === 'alto' || k.nivel_riesgo === 'pep').length || 0
    }

    return {
        oficial,
        rosStats,
        kycStats,
        capacitacionesVencidas: 0, // TODO: Implement
        reportesPendientes: 0 // TODO: Implement
    }
}

// =============================================================================
// CAPACITACIONES
// =============================================================================

export async function registrarCapacitacion(input: {
    empresa_id: string
    usuario_id: string
    tipo: 'induccion' | 'anual' | 'actualizacion'
    tema: string
    fecha: string
    horas: number
    completado?: boolean
    proveedor?: string
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('capacitaciones_cumplimiento')
        .insert([input])

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function listarCapacitaciones(
    empresaId: string,
    usuarioId?: string
): Promise<unknown[]> {
    const supabase = await createAdminClient()

    let query = supabase
        .from('capacitaciones_cumplimiento')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha', { ascending: false })

    if (usuarioId) query = query.eq('usuario_id', usuarioId)

    const { data, error } = await query
    if (error) return []
    return data
}
