'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

// ============================================================
// TYPES
// ============================================================

export interface AuditLog {
    id: string
    timestamp: string
    user_id: string | null
    user_email: string | null
    user_role: string | null
    empresa_id: string | null
    action: string
    entity_type: string
    entity_id: string | null
    old_values: Record<string, unknown> | null
    new_values: Record<string, unknown> | null
    metadata: Record<string, unknown> | null
    ip_address: string | null
    user_agent: string | null
    category: string
    severity: string
}

export interface AuditLogInput {
    action: string
    entityType: string
    entityId?: string
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    metadata?: Record<string, unknown>
    category?: 'auth' | 'financial' | 'config' | 'general'
    severity?: 'info' | 'warning' | 'critical'
}

export interface AuditLogFilters {
    empresaId?: string
    userId?: string
    action?: string
    entityType?: string
    category?: string
    severity?: string
    desde?: string
    hasta?: string
    limit?: number
    offset?: number
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function getRequestContext() {
    try {
        const headersList = await headers()
        return {
            ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
            userAgent: headersList.get('user-agent') || 'unknown'
        }
    } catch {
        return { ip: 'unknown', userAgent: 'unknown' }
    }
}

// ============================================================
// CREATE AUDIT LOG
// ============================================================

/**
 * Registrar una entrada en el log de auditoría
 */
export async function registrarAuditLog(input: AuditLogInput): Promise<{ success: boolean; id?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get user details
    let userEmail = user?.email || null
    let userRole = null
    let empresaId = null

    if (user) {
        const { data: userData } = await supabase
            .from('usuarios')
            .select('email, rol, empresa_id')
            .eq('id', user.id)
            .single()

        if (userData) {
            userEmail = userData.email
            userRole = userData.rol
            empresaId = userData.empresa_id
        }
    }

    const context = await getRequestContext()

    const { data, error } = await supabase
        .from('audit_logs')
        .insert({
            user_id: user?.id || null,
            user_email: userEmail,
            user_role: userRole,
            empresa_id: empresaId,
            action: input.action,
            entity_type: input.entityType,
            entity_id: input.entityId || null,
            old_values: input.oldValues || null,
            new_values: input.newValues || null,
            metadata: input.metadata || null,
            ip_address: context.ip,
            user_agent: context.userAgent,
            category: input.category || 'general',
            severity: input.severity || 'info'
        })
        .select('id')
        .single()

    if (error) {
        console.error('[Audit] Error registering log:', error)
        return { success: false }
    }

    return { success: true, id: data.id }
}

/**
 * Registrar audit log con bypass de autenticación (para acciones internas)
 */
export async function registrarAuditLogInterno(
    input: AuditLogInput & {
        userId?: string
        userEmail?: string
        empresaId?: string
    }
): Promise<{ success: boolean }> {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('audit_logs')
        .insert({
            user_id: input.userId || null,
            user_email: input.userEmail || 'SYSTEM',
            user_role: 'system',
            empresa_id: input.empresaId || null,
            action: input.action,
            entity_type: input.entityType,
            entity_id: input.entityId || null,
            old_values: input.oldValues || null,
            new_values: input.newValues || null,
            metadata: input.metadata || null,
            category: input.category || 'general',
            severity: input.severity || 'info'
        })

    if (error) {
        console.error('[Audit] Error registering internal log:', error)
        return { success: false }
    }

    return { success: true }
}

// ============================================================
// LIST AUDIT LOGS
// ============================================================

/**
 * Listar logs de auditoría con filtros
 */
export async function listarAuditLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLog[]
    total: number
}> {
    const supabase = await createClient()

    let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })

    // Apply filters
    if (filters.empresaId) {
        query = query.eq('empresa_id', filters.empresaId)
    }
    if (filters.userId) {
        query = query.eq('user_id', filters.userId)
    }
    if (filters.action) {
        query = query.ilike('action', `%${filters.action}%`)
    }
    if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType)
    }
    if (filters.category) {
        query = query.eq('category', filters.category)
    }
    if (filters.severity) {
        query = query.eq('severity', filters.severity)
    }
    if (filters.desde) {
        query = query.gte('timestamp', filters.desde)
    }
    if (filters.hasta) {
        query = query.lte('timestamp', filters.hasta)
    }

    // Pagination
    const limit = filters.limit || 50
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
        console.error('[Audit] Error listing logs:', error)
        return { logs: [], total: 0 }
    }

    return { logs: data as AuditLog[], total: count || 0 }
}

/**
 * Obtener logs de una entidad específica
 */
export async function obtenerAuditLogsPorEntidad(
    entityType: string,
    entityId: string
): Promise<AuditLog[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('timestamp', { ascending: false })
        .limit(100)

    if (error) {
        console.error('[Audit] Error fetching entity logs:', error)
        return []
    }

    return data as AuditLog[]
}

// ============================================================
// ANALYTICS
// ============================================================

/**
 * Obtener resumen de actividad de auditoría
 */
export async function obtenerResumenAuditoria(periodo: '24h' | '7d' | '30d' = '7d'): Promise<{
    totalAcciones: number
    accionesPorCategoria: Record<string, number>
    accionesPorSeveridad: Record<string, number>
    topAcciones: Array<{ action: string; count: number }>
    topUsuarios: Array<{ email: string; count: number }>
}> {
    const supabase = await createClient()

    // Calculate date range
    const now = new Date()
    let desde: Date
    switch (periodo) {
        case '24h':
            desde = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
        case '7d':
            desde = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
        case '30d':
            desde = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
    }

    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('action, category, severity, user_email')
        .gte('timestamp', desde.toISOString())

    if (error || !logs) {
        return {
            totalAcciones: 0,
            accionesPorCategoria: {},
            accionesPorSeveridad: {},
            topAcciones: [],
            topUsuarios: []
        }
    }

    // Calculate stats
    const categoryCounts: Record<string, number> = {}
    const severityCounts: Record<string, number> = {}
    const actionCounts: Record<string, number> = {}
    const userCounts: Record<string, number> = {}

    logs.forEach(log => {
        categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1
        severityCounts[log.severity] = (severityCounts[log.severity] || 0) + 1
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
        if (log.user_email) {
            userCounts[log.user_email] = (userCounts[log.user_email] || 0) + 1
        }
    })

    const topAcciones = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    const topUsuarios = Object.entries(userCounts)
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    return {
        totalAcciones: logs.length,
        accionesPorCategoria: categoryCounts,
        accionesPorSeveridad: severityCounts,
        topAcciones,
        topUsuarios
    }
}

// AUDIT_ACTIONS moved to @/lib/constants/audit-constants
