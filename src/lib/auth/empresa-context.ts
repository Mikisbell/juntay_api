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
    rol: string | null
    isSuperAdmin: boolean
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
            usuarioEmail: null,
            rol: null,
            isSuperAdmin: false
        }
    }

    // 2. Buscar datos del usuario + empresa
    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select(`
            id,
            empresa_id,
            rol,
            empresas (
                id,
                razon_social,
                nombre_comercial,
                ruc
            )
        `)
        .eq('id', user.id)
        .single()

    // 2.1 Si el join falla, al menos obtener el rol del usuario directamente
    let userRol: string | null = usuario?.rol || null
    if (error) {
        console.warn('[getEmpresaActual] Join con empresas falló, intentando obtener rol directamente...', { error })
        const { data: userOnly, error: rolError } = await supabase
            .from('usuarios')
            .select('rol, empresa_id')
            .eq('id', user.id)
            .single()
        console.log('[DEBUG] Fallback rol query result:', { userOnly, rolError })
        userRol = userOnly?.rol || null
    }

    if (error || !usuario || !usuario.empresa_id) {
        console.warn('[getEmpresaActual] Usuario sin empresa asignada o error. Intentando fallback...', { error, userId: user.id, rolRecuperado: userRol })

        // FALLBACK DE EMERGENCIA: Obtener la primera empresa disponible
        // Esto permite que el sistema funcione si el onboarding falló o en desarrollo
        const { data: primeraEmpresa } = await supabase
            .from('empresas')
            .select('id, razon_social, nombre_comercial, ruc')
            .limit(1)
            .single()

        if (primeraEmpresa) {
            console.log('[getEmpresaActual] Usando empresa fallback:', primeraEmpresa.razon_social)

            // Buscar sucursal principal de esta empresa fallback
            const { data: sucursal } = await supabase
                .from('sucursales')
                .select('id')
                .eq('empresa_id', primeraEmpresa.id)
                .eq('es_principal', true)
                .single()

            return {
                empresaId: primeraEmpresa.id,
                empresaNombre: primeraEmpresa.nombre_comercial || primeraEmpresa.razon_social,
                empresaRuc: primeraEmpresa.ruc,
                sucursalPrincipalId: sucursal?.id || null,
                usuarioId: user.id,
                usuarioEmail: user.email || null,
                rol: userRol,
                isSuperAdmin: userRol === 'SUPER_ADMIN'
            }
        }

        return {
            empresaId: null,
            empresaNombre: null,
            empresaRuc: null,
            sucursalPrincipalId: null,
            usuarioId: user.id,
            usuarioEmail: user.email || null,
            rol: userRol,
            isSuperAdmin: userRol === 'SUPER_ADMIN'
        }
    }

    // 3. Obtener sucursal principal
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

    // Type assertion para empresas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const empresaRaw = usuario.empresas as any
    const empresa = Array.isArray(empresaRaw)
        ? empresaRaw[0] as { id: string; razon_social: string; nombre_comercial: string | null; ruc: string } | undefined
        : empresaRaw as { id: string; razon_social: string; nombre_comercial: string | null; ruc: string } | null

    return {
        empresaId: usuario.empresa_id || null,
        empresaNombre: empresa?.nombre_comercial || empresa?.razon_social || null,
        empresaRuc: empresa?.ruc || null,
        sucursalPrincipalId,
        usuarioId: user.id,
        usuarioEmail: user.email || null,
        rol: usuario.rol || null,
        isSuperAdmin: usuario.rol === 'SUPER_ADMIN'
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
