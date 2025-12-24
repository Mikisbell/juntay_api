'use server'

import { createClient } from '@/lib/supabase/server'
import { getEmpresaActual } from '@/lib/auth/empresa-context'

export async function getSaasMetrics() {
    const context = await getEmpresaActual()
    console.log('[DEBUG getSaasMetrics] Context:', {
        usuarioId: context.usuarioId,
        usuarioEmail: context.usuarioEmail,
        rol: context.rol,
        isSuperAdmin: context.isSuperAdmin
    })
    if (!context.isSuperAdmin) {
        throw new Error('Unauthorized: Requires SUPER_ADMIN role')
    }

    const supabase = await createClient()

    // 1. Total Empresas
    const { count: totalEmpresas } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true })

    // 2. Total Usuarios
    const { count: totalUsuarios } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })

    // 3. Empresas Activas (con movimientos recientes en caja)
    // Aproximación por ahora
    const { count: empresasActivas } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

    return {
        totalEmpresas: totalEmpresas || 0,
        totalUsuarios: totalUsuarios || 0,
        empresasActivas: empresasActivas || 0
    }
}

export async function getAllCompanies() {
    const { isSuperAdmin } = await getEmpresaActual()
    if (!isSuperAdmin) {
        throw new Error('Unauthorized: Requires SUPER_ADMIN role')
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('empresas')
        .select(`
            *,
            usuarios:usuarios(count)
        `)
        .order('created_at', { ascending: false })

    if (error) throw error

    return data
}

export async function switchCompany(targetEmpresaId: string) {
    const { isSuperAdmin, usuarioId } = await getEmpresaActual()
    if (!isSuperAdmin) {
        throw new Error('Unauthorized: Requires SUPER_ADMIN role')
    }

    const supabase = await createClient()

    // 1. Verify target company exists
    const { data: targetCompany, error: companyError } = await supabase
        .from('empresas')
        .select('id, nombre')
        .eq('id', targetEmpresaId)
        .single()

    if (companyError || !targetCompany) {
        throw new Error('Target company not found')
    }

    // 2. Update user's empresa_id
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({
            empresa_id: targetEmpresaId
        })
        .eq('id', usuarioId!)

    if (updateError) {
        throw new Error(`Failed to switch company: ${updateError.message}`)
    }

    return { success: true, newCompanyName: targetCompany.nombre }
}
