'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================
// TYPES
// ============================================================

export interface AlertaSistema {
    id: string
    created_at: string
    updated_at: string
    empresa_id: string | null
    sucursal_id: string | null
    tipo: AlertType
    severidad: AlertSeverity
    titulo: string
    mensaje: string
    estado: AlertState
    visto_por: string | null
    visto_at: string | null
    resuelto_por: string | null
    resuelto_at: string | null
    notas_resolucion: string | null
    metadata: Record<string, unknown>
    accion_requerida: boolean
    accion_url: string | null
    empresa?: {
        nombre_comercial: string
    }
}

import type { AlertType } from '@/lib/constants/alert-constants'



export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertState = 'activa' | 'vista' | 'resuelta' | 'ignorada'

export interface CreateAlertInput {
    tipo: AlertType
    titulo: string
    mensaje: string
    empresaId?: string
    sucursalId?: string
    severidad?: AlertSeverity
    accionRequerida?: boolean
    accionUrl?: string
    metadata?: Record<string, unknown>
    expiresAt?: string
}

export interface AlertFilters {
    estado?: AlertState
    tipo?: AlertType
    severidad?: AlertSeverity
    empresaId?: string
    limit?: number
}

// ============================================================
// CREATE ALERT
// ============================================================

/**
 * Crear una nueva alerta en el sistema
 */
export async function crearAlerta(input: CreateAlertInput): Promise<{
    success: boolean
    alertaId?: string
    error?: string
}> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('alertas_sistema')
        .insert({
            tipo: input.tipo,
            titulo: input.titulo,
            mensaje: input.mensaje,
            empresa_id: input.empresaId || null,
            sucursal_id: input.sucursalId || null,
            severidad: input.severidad || 'warning',
            accion_requerida: input.accionRequerida || false,
            accion_url: input.accionUrl || null,
            metadata: input.metadata || {},
            expires_at: input.expiresAt || null,
            estado: 'activa'
        })
        .select('id')
        .single()

    if (error) {
        console.error('[Alertas] Error creating alert:', error)
        return { success: false, error: error.message }
    }

    return { success: true, alertaId: data.id }
}

/**
 * Crear alertas en batch
 */
export async function crearAlertasBatch(inputs: CreateAlertInput[]): Promise<{
    success: boolean
    created: number
}> {
    const supabase = createAdminClient()

    const records = inputs.map(input => ({
        tipo: input.tipo,
        titulo: input.titulo,
        mensaje: input.mensaje,
        empresa_id: input.empresaId || null,
        sucursal_id: input.sucursalId || null,
        severidad: input.severidad || 'warning',
        accion_requerida: input.accionRequerida || false,
        accion_url: input.accionUrl || null,
        metadata: input.metadata || {},
        estado: 'activa' as const
    }))

    const { data, error } = await supabase
        .from('alertas_sistema')
        .insert(records)
        .select('id')

    if (error) {
        console.error('[Alertas] Error creating batch:', error)
        return { success: false, created: 0 }
    }

    return { success: true, created: data.length }
}

// ============================================================
// LIST ALERTS
// ============================================================

/**
 * Listar alertas con filtros
 */
export async function listarAlertas(filters: AlertFilters = {}): Promise<AlertaSistema[]> {
    const supabase = await createClient()

    let query = supabase
        .from('alertas_sistema')
        .select(`
            *,
            empresa:empresas(nombre_comercial)
        `)
        .order('created_at', { ascending: false })

    if (filters.estado) {
        query = query.eq('estado', filters.estado)
    }
    if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
    }
    if (filters.severidad) {
        query = query.eq('severidad', filters.severidad)
    }
    if (filters.empresaId) {
        query = query.eq('empresa_id', filters.empresaId)
    }

    const limit = filters.limit || 50
    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
        console.error('[Alertas] Error listing:', error)
        return []
    }

    return data as AlertaSistema[]
}

/**
 * Obtener alertas activas (para badge en sidebar)
 */
export async function obtenerAlertasActivas(): Promise<AlertaSistema[]> {
    return listarAlertas({ estado: 'activa', limit: 20 })
}

/**
 * Obtener conteo de alertas por estado
 */
export async function obtenerConteoAlertas(): Promise<{
    activas: number
    criticas: number
    vistas: number
    total: number
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('alertas_sistema')
        .select('estado, severidad')

    if (error || !data) {
        return { activas: 0, criticas: 0, vistas: 0, total: 0 }
    }

    const activas = data.filter(a => a.estado === 'activa').length
    const criticas = data.filter(a => a.estado === 'activa' && a.severidad === 'critical').length
    const vistas = data.filter(a => a.estado === 'vista').length

    return {
        activas,
        criticas,
        vistas,
        total: data.length
    }
}

// ============================================================
// UPDATE ALERTS
// ============================================================

/**
 * Marcar alerta como vista
 */
export async function marcarAlertaVista(alertaId: string): Promise<{ success: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('alertas_sistema')
        .update({
            estado: 'vista',
            visto_por: user?.id || null,
            visto_at: new Date().toISOString()
        })
        .eq('id', alertaId)

    if (error) {
        console.error('[Alertas] Error marking as viewed:', error)
        return { success: false }
    }

    return { success: true }
}

/**
 * Marcar múltiples alertas como vistas
 */
export async function marcarAlertasVistas(alertaIds: string[]): Promise<{ success: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('alertas_sistema')
        .update({
            estado: 'vista',
            visto_por: user?.id || null,
            visto_at: new Date().toISOString()
        })
        .in('id', alertaIds)

    if (error) {
        console.error('[Alertas] Error marking batch as viewed:', error)
        return { success: false }
    }

    return { success: true }
}

/**
 * Resolver una alerta
 */
export async function resolverAlerta(
    alertaId: string,
    notasResolucion?: string
): Promise<{ success: boolean }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('alertas_sistema')
        .update({
            estado: 'resuelta',
            resuelto_por: user?.id || null,
            resuelto_at: new Date().toISOString(),
            notas_resolucion: notasResolucion || null
        })
        .eq('id', alertaId)

    if (error) {
        console.error('[Alertas] Error resolving:', error)
        return { success: false }
    }

    return { success: true }
}

/**
 * Ignorar una alerta
 */
export async function ignorarAlerta(alertaId: string): Promise<{ success: boolean }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('alertas_sistema')
        .update({ estado: 'ignorada' })
        .eq('id', alertaId)

    if (error) {
        console.error('[Alertas] Error ignoring:', error)
        return { success: false }
    }

    return { success: true }
}

// ============================================================
// AUTOMATIC ALERT GENERATION
// ============================================================

/**
 * Generar alertas automáticas basadas en métricas del sistema
 */
export async function generarAlertasAutomaticas(): Promise<{
    alertasCreadas: number
}> {
    const supabase = createAdminClient()
    let alertasCreadas = 0

    // 1. Empresas con mora alta (> 15%)
    const { data: empresasMoraAlta } = await supabase
        .from('empresas')
        .select(`
            id, 
            nombre_comercial,
            sucursales (
                creditos (
                    estado,
                    dias_mora
                )
            )
        `)
        .eq('activo', true)

    if (empresasMoraAlta) {
        for (const empresa of empresasMoraAlta) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sucursales = (empresa as any).sucursales || []
            let creditosActivos = 0
            let creditosEnMora = 0

            for (const suc of sucursales) {
                for (const cred of suc.creditos || []) {
                    if (cred.estado === 'activo') {
                        creditosActivos++
                        if (cred.dias_mora > 0) creditosEnMora++
                    }
                }
            }

            if (creditosActivos > 0) {
                const porcentajeMora = (creditosEnMora / creditosActivos) * 100

                if (porcentajeMora > 15) {
                    // Check if alert already exists
                    const { data: existing } = await supabase
                        .from('alertas_sistema')
                        .select('id')
                        .eq('empresa_id', empresa.id)
                        .eq('tipo', 'mora_alta')
                        .eq('estado', 'activa')
                        .single()

                    if (!existing) {
                        await crearAlerta({
                            tipo: 'mora_alta',
                            titulo: `Mora alta: ${empresa.nombre_comercial}`,
                            mensaje: `La empresa tiene ${porcentajeMora.toFixed(1)}% de cartera en mora (${creditosEnMora}/${creditosActivos} créditos)`,
                            empresaId: empresa.id,
                            severidad: porcentajeMora > 25 ? 'critical' : 'warning',
                            accionRequerida: true,
                            metadata: { porcentajeMora, creditosActivos, creditosEnMora }
                        })
                        alertasCreadas++
                    }
                }
            }
        }
    }

    // 2. Facturas SaaS vencidas
    const { data: facturasVencidas } = await supabase
        .from('facturas_saas')
        .select('id, numero, empresa_id, total, fecha_vencimiento, empresas(nombre_comercial)')
        .eq('estado', 'pendiente')
        .lt('fecha_vencimiento', new Date().toISOString().split('T')[0])

    if (facturasVencidas) {
        for (const factura of facturasVencidas) {
            const { data: existing } = await supabase
                .from('alertas_sistema')
                .select('id')
                .eq('tipo', 'billing')
                .eq('estado', 'activa')
                .contains('metadata', { facturaId: factura.id })
                .single()

            if (!existing) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const empresaNombre = (factura as any).empresas?.nombre_comercial || 'Desconocida'
                await crearAlerta({
                    tipo: 'billing',
                    titulo: `Factura vencida: ${factura.numero}`,
                    mensaje: `La factura de ${empresaNombre} por $${factura.total} está vencida desde ${factura.fecha_vencimiento}`,
                    empresaId: factura.empresa_id,
                    severidad: 'critical',
                    accionRequerida: true,
                    metadata: { facturaId: factura.id, monto: factura.total }
                })
                alertasCreadas++
            }
        }
    }

    console.log(`[Alertas] Generated ${alertasCreadas} automatic alerts`)
    return { alertasCreadas }
}

// ============================================================
// ALERT TYPE LABELS
// ============================================================

// ALERT_TYPE_LABELS moved to @/lib/constants/alert-constants
