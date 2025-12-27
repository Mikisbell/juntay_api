'use server'

/**
 * Sistema Multi-sucursal
 * 
 * - Gestión de sucursales
 * - Cada sucursal con su caja operativa
 * - Consolidación de reportes
 * - Transferencia de garantías
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { verificarLimiteSucursales } from './limites-actions'

// ============ TYPES ============

export interface Sucursal {
    id: string
    codigo: string
    nombre: string
    direccion: string
    telefono?: string
    activa: boolean
    createdAt: string
    cajasActivas: number
    empleados: number
}

export interface ResumenSucursal {
    sucursalId: string
    sucursalNombre: string
    creditosActivos: number
    carteraTotal: number
    cobranzaDelDia: number
    moraPorcentaje: number
}

export interface TransferenciaGarantia {
    id: string
    articuloId: string
    sucursalOrigenId: string
    sucursalDestinoId: string
    fecha: string
    motivo?: string
    usuarioId: string
}

// ============ CRUD SUCURSALES ============

/**
 * Lista todas las sucursales
 */
export async function listarSucursales(): Promise<Sucursal[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('sucursales')
        .select(`
            id,
            codigo,
            nombre,
            direccion,
            telefono,
            activa,
            created_at
        `)
        .order('nombre')

    if (error) {
        console.error('Error listando sucursales:', error)
        return []
    }

    // Obtener conteos
    const sucursales: Sucursal[] = []
    for (const s of (data || [])) {
        const { count: cajasCount } = await supabase
            .from('cajas_operativas')
            .select('*', { count: 'exact', head: true })
            .eq('sucursal_id', s.id)
            .eq('estado', 'abierta')

        const { count: empleadosCount } = await supabase
            .from('empleados')
            .select('*', { count: 'exact', head: true })
            .eq('sucursal_id', s.id)
            .eq('estado', 'activo')

        sucursales.push({
            id: s.id,
            codigo: s.codigo,
            nombre: s.nombre,
            direccion: s.direccion,
            telefono: s.telefono,
            activa: s.activa,
            createdAt: s.created_at,
            cajasActivas: cajasCount || 0,
            empleados: empleadosCount || 0
        })
    }

    return sucursales
}

/**
 * Crea una nueva sucursal
 */
export async function crearSucursal(params: {
    codigo: string
    nombre: string
    direccion: string
    telefono?: string
    // Geographic location (Hybrid Pattern)
    ubigeo_cod?: string
    departamento?: string
    provincia?: string
    distrito?: string
}): Promise<{ success: boolean; sucursalId?: string; error?: string }> {
    // 🆕 Verificar límites del plan
    const { permitido, mensaje } = await verificarLimiteSucursales()
    if (!permitido) {
        return { success: false, error: mensaje }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('sucursales')
        .insert({
            codigo: params.codigo.toUpperCase(),
            nombre: params.nombre,
            direccion: params.direccion,
            telefono: params.telefono,
            ubigeo_cod: params.ubigeo_cod,
            departamento: params.departamento,
            provincia: params.provincia,
            distrito: params.distrito,
            activa: true
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error creando sucursal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/sucursales')
    return { success: true, sucursalId: data.id }
}

/**
 * Actualiza una sucursal
 */
export async function actualizarSucursal(
    sucursalId: string,
    params: Partial<{
        nombre: string
        direccion: string
        telefono: string
        activa: boolean
        // Geographic location (Hybrid Pattern)
        ubigeo_cod: string
        departamento: string
        provincia: string
        distrito: string
    }>
): Promise<{ success: boolean; error?: string }> {
    // 🆕 Verificar límites si se está activando
    if (params.activa === true) {
        const { permitido, mensaje } = await verificarLimiteSucursales()
        if (!permitido) {
            return { success: false, error: mensaje }
        }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('sucursales')
        .update(params)
        .eq('id', sucursalId)

    if (error) {
        console.error('Error actualizando sucursal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/sucursales')
    return { success: true }
}

// ============ REPORTES CONSOLIDADOS ============

/**
 * Obtiene resumen consolidado de todas las sucursales
 */
export async function obtenerResumenConsolidadoSucursales(): Promise<ResumenSucursal[]> {
    const supabase = await createClient()
    const hoy = new Date().toISOString().split('T')[0]

    const { data: sucursales } = await supabase
        .from('sucursales')
        .select('id, nombre')
        .eq('activa', true)

    const resumen: ResumenSucursal[] = []

    for (const sucursal of (sucursales || [])) {
        // Créditos activos de la sucursal
        const { data: creditos } = await supabase
            .from('creditos')
            .select('saldo_pendiente, estado')
            .eq('sucursal_id', sucursal.id)
            .in('estado', ['vigente', 'vencido', 'en_mora'])

        const creditosActivos = (creditos || []).length
        const carteraTotal = (creditos || []).reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
        const enMora = (creditos || []).filter(c => c.estado === 'en_mora' || c.estado === 'vencido').length
        const moraPorcentaje = creditosActivos > 0 ? (enMora / creditosActivos) * 100 : 0

        // Cobranza del día
        const { data: pagos } = await supabase
            .from('pagos')
            .select('monto')
            .eq('sucursal_id', sucursal.id)
            .gte('created_at', `${hoy}T00:00:00`)
            .lte('created_at', `${hoy}T23:59:59`)

        const cobranzaDelDia = (pagos || []).reduce((sum, p) => sum + (p.monto || 0), 0)

        resumen.push({
            sucursalId: sucursal.id,
            sucursalNombre: sucursal.nombre,
            creditosActivos,
            carteraTotal,
            cobranzaDelDia,
            moraPorcentaje: Math.round(moraPorcentaje * 10) / 10
        })
    }

    return resumen
}

// ============ TRANSFERENCIA DE GARANTÍAS ============

/**
 * Transfiere una garantía a otra sucursal
 */
export async function transferirGarantia(params: {
    articuloId: string
    sucursalDestinoId: string
    motivo?: string
    usuarioId: string
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Obtener sucursal actual del artículo
    const { data: articulo } = await supabase
        .from('inventario')
        .select('sucursal_id')
        .eq('id', params.articuloId)
        .single()

    if (!articulo) {
        return { success: false, error: 'Artículo no encontrado' }
    }

    const sucursalOrigenId = articulo.sucursal_id

    if (sucursalOrigenId === params.sucursalDestinoId) {
        return { success: false, error: 'El artículo ya está en esa sucursal' }
    }

    // Registrar transferencia
    const { error: logError } = await supabase
        .from('transferencias_garantias')
        .insert({
            articulo_id: params.articuloId,
            sucursal_origen_id: sucursalOrigenId,
            sucursal_destino_id: params.sucursalDestinoId,
            motivo: params.motivo,
            usuario_id: params.usuarioId
        })

    if (logError) {
        console.error('Error registrando transferencia:', logError)
        return { success: false, error: logError.message }
    }

    // Actualizar ubicación del artículo
    const { error: updateError } = await supabase
        .from('inventario')
        .update({ sucursal_id: params.sucursalDestinoId })
        .eq('id', params.articuloId)

    if (updateError) {
        console.error('Error actualizando artículo:', updateError)
        return { success: false, error: updateError.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true }
}

/**
 * Obtiene historial de transferencias
 */
export async function obtenerHistorialTransferencias(
    filtros?: { sucursalId?: string; articuloId?: string }
): Promise<TransferenciaGarantia[]> {
    const supabase = await createClient()

    let query = supabase
        .from('transferencias_garantias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    if (filtros?.sucursalId) {
        query = query.or(`sucursal_origen_id.eq.${filtros.sucursalId},sucursal_destino_id.eq.${filtros.sucursalId}`)
    }

    if (filtros?.articuloId) {
        query = query.eq('articulo_id', filtros.articuloId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error obteniendo transferencias:', error)
        return []
    }

    return (data || []).map(t => ({
        id: t.id,
        articuloId: t.articulo_id,
        sucursalOrigenId: t.sucursal_origen_id,
        sucursalDestinoId: t.sucursal_destino_id,
        fecha: t.created_at,
        motivo: t.motivo,
        usuarioId: t.usuario_id
    }))
}

// ============ PERMISOS POR SUCURSAL ============

/**
 * Obtiene la sucursal del usuario actual
 */
export async function obtenerSucursalUsuario(userId: string): Promise<string | null> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('empleados')
        .select('sucursal_id')
        .eq('user_id', userId)
        .single()

    return data?.sucursal_id || null
}

/**
 * Verifica si el usuario tiene acceso a una sucursal
 */
export async function tieneAccesoSucursal(userId: string, sucursalId: string): Promise<boolean> {
    const supabase = await createClient()

    // Verificar si es admin (acceso a todas)
    const { data: empleado } = await supabase
        .from('empleados')
        .select('rol, sucursal_id')
        .eq('user_id', userId)
        .single()

    if (!empleado) return false

    // Admin tiene acceso a todas
    if (empleado.rol === 'admin' || empleado.rol === 'gerente') {
        return true
    }

    // Otros solo a su sucursal
    return empleado.sucursal_id === sucursalId
}
