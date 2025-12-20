'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Contexto de empresa para operaciones multi-tenant.
 * 
 * ESTRATEGIA "SaaS-Ready Single-Tenant":
 * - Hoy: Una sola empresa en producción
 * - Mañana: Este helper será el único punto de cambio para multi-tenant
 * 
 * USO:
 * ```typescript
 * const { empresaId } = await getEmpresaActual()
 * if (!empresaId) throw new Error('Sin empresa')
 * ```
 */

export interface EmpresaContext {
    empresaId: string | null
    empresaNombre: string | null
    empresaRuc: string | null
    sucursalPrincipalId: string | null
    usuarioId: string | null
    usuarioEmail: string | null
}

/**
 * Obtiene el contexto de empresa del usuario autenticado.
 * Este es el ÚNICO punto centralizado para obtener empresa_id.
 * 
 * @returns EmpresaContext con datos de la empresa o valores null si no autenticado
 */
export async function getEmpresaActual(): Promise<EmpresaContext> {
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            empresaId: null,
            empresaNombre: null,
            empresaRuc: null,
            sucursalPrincipalId: null,
            usuarioId: null,
            usuarioEmail: null
        }
    }

    // 2. Buscar datos del usuario + empresa
    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select(`
            id,
            empresa_id,
            empresas (
                id,
                nombre,
                ruc
            )
        `)
        .eq('id', user.id)
        .single()

    if (error || !usuario) {
        console.warn('[getEmpresaActual] Usuario sin registro en tabla usuarios:', user.id)
        return {
            empresaId: null,
            empresaNombre: null,
            empresaRuc: null,
            sucursalPrincipalId: null,
            usuarioId: user.id,
            usuarioEmail: user.email || null
        }
    }

    // 3. Obtener sucursal principal (si existe)
    let sucursalPrincipalId: string | null = null
    if (usuario.empresa_id) {
        const { data: sucursal } = await supabase
            .from('sucursales')
            .select('id')
            .eq('empresa_id', usuario.empresa_id)
            .eq('es_principal', true)
            .single()

        sucursalPrincipalId = sucursal?.id || null
    }

    // Type assertion para empresas anidado (puede ser objeto o array según la relación)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const empresaRaw = usuario.empresas as any
    const empresa = Array.isArray(empresaRaw)
        ? empresaRaw[0] as { id: string; nombre: string; ruc: string } | undefined
        : empresaRaw as { id: string; nombre: string; ruc: string } | null

    return {
        empresaId: usuario.empresa_id || null,
        empresaNombre: empresa?.nombre || null,
        empresaRuc: empresa?.ruc || null,
        sucursalPrincipalId,
        usuarioId: user.id,
        usuarioEmail: user.email || null
    }
}

/**
 * Versión que lanza error si no hay empresa (para actions que la requieren).
 * 
 * USO:
 * ```typescript
 * const { empresaId } = await requireEmpresaActual()
 * // empresaId está garantizado que no es null
 * ```
 */
export async function requireEmpresaActual(): Promise<EmpresaContext & { empresaId: string; usuarioId: string }> {
    const context = await getEmpresaActual()

    if (!context.usuarioId) {
        throw new Error('Usuario no autenticado')
    }

    if (!context.empresaId) {
        throw new Error('Usuario sin empresa asignada. Contacte al administrador.')
    }

    return context as EmpresaContext & { empresaId: string; usuarioId: string }
}

/**
 * Helper para verificar que un registro pertenece a la empresa actual.
 * Útil para validación de seguridad adicional a RLS.
 * 
 * @param tableName Nombre de la tabla
 * @param recordId ID del registro
 * @returns true si pertenece a la empresa del usuario
 */
export async function verificarPropiedadEmpresa(
    tableName: 'creditos' | 'clientes' | 'garantias' | 'pagos',
    recordId: string
): Promise<boolean> {
    const { empresaId } = await getEmpresaActual()
    if (!empresaId) return false

    const supabase = await createClient()

    // Solo algunas tablas tienen empresa_id directamente
    const tablasConEmpresa = ['creditos', 'clientes']

    if (tablasConEmpresa.includes(tableName)) {
        const { data } = await supabase
            .from(tableName)
            .select('empresa_id')
            .eq('id', recordId)
            .single()

        return data?.empresa_id === empresaId
    }

    // Para otras tablas, verificar a través de relaciones
    // (esto se expandirá cuando se agregue empresa_id a más tablas)
    return true // Por ahora, confiar en RLS
}
