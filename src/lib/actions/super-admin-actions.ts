'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ============================================================
// TYPES
// ============================================================

export interface EmpresaResumen {
    id: string
    razon_social: string
    nombre_comercial: string
    ruc: string | null
    email: string | null
    telefono: string | null
    activo: boolean
    plan_id: string | null
    created_at: string
}

export interface EmpresaDetalle extends EmpresaResumen {
    direccion: string | null
    total_sucursales: number
    total_empleados: number
    total_creditos_activos: number
    cartera_total: number
    cobranza_mes: number
    mora_porcentaje: number
}

export interface SucursalResumen {
    id: string
    codigo: string
    nombre: string
    direccion: string
    telefono: string | null
    activa: boolean
    departamento: string | null
    provincia: string | null
    distrito: string | null
    empleados_count: number
    cartera_total: number
}

export interface CreateEmpresaInput {
    razon_social: string
    nombre_comercial: string
    ruc: string
    email: string
    telefono?: string
    direccion?: string
    plan_id?: string
    admin_email?: string
    admin_password?: string
}

export interface CreateSucursalAdminInput {
    empresa_id: string
    codigo: string
    nombre: string
    direccion: string
    telefono?: string
    ubigeo_cod?: string
    departamento?: string
    provincia?: string
    distrito?: string
    tipo_sucursal?: 'principal' | 'secundaria' | 'express'
}

// ============================================================
// SECURITY CHECK
// ============================================================

async function verifySuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    // Verificar rol SUPER_ADMIN
    const { data: userData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (userData?.rol !== 'SUPER_ADMIN') {
        throw new Error('Acceso denegado: Se requiere rol SUPER_ADMIN')
    }

    return user
}

// ============================================================
// LIST OPERATIONS
// ============================================================

/**
 * Obtener listado global de empresas con métricas básicas
 */
export async function listarTodasLasEmpresas(): Promise<EmpresaResumen[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching global companies:', error)
        throw new Error('Error al obtener empresas')
    }

    return data as EmpresaResumen[]
}

/**
 * Obtener listado de empresas con métricas agregadas
 */
export async function listarEmpresasConMetricas(): Promise<(EmpresaResumen & {
    sucursales_count: number
    empleados_count: number
    cartera_total: number
})[]> {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    // Obtener empresas
    const { data: empresas, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error('Error al obtener empresas')

    // Obtener métricas para cada empresa
    const empresasConMetricas = await Promise.all(
        empresas.map(async (empresa) => {
            // Contar sucursales
            const { count: sucursalesCount } = await supabase
                .from('sucursales')
                .select('*', { count: 'exact', head: true })
                .eq('empresa_id', empresa.id)

            // Contar empleados (a través de sucursales)
            const { data: sucursales } = await supabase
                .from('sucursales')
                .select('id')
                .eq('empresa_id', empresa.id)

            let empleadosCount = 0
            let carteraTotal = 0

            if (sucursales && sucursales.length > 0) {
                const sucursalIds = sucursales.map(s => s.id)

                const { count: empCount } = await supabase
                    .from('empleados')
                    .select('*', { count: 'exact', head: true })
                    .in('sucursal_id', sucursalIds)
                    .eq('activo', true)

                empleadosCount = empCount || 0

                // Sumar cartera de créditos activos
                const { data: creditos } = await supabase
                    .from('creditos')
                    .select('saldo_capital')
                    .in('sucursal_id', sucursalIds)
                    .eq('estado', 'activo')

                carteraTotal = creditos?.reduce((sum, c) => sum + (c.saldo_capital || 0), 0) || 0
            }

            return {
                ...empresa,
                sucursales_count: sucursalesCount || 0,
                empleados_count: empleadosCount,
                cartera_total: carteraTotal
            }
        })
    )

    return empresasConMetricas
}

// ============================================================
// CREATE OPERATIONS
// ============================================================

/**
 * Crear nueva empresa desde panel Super Admin
 */
export async function crearEmpresaAdmin(input: CreateEmpresaInput): Promise<{
    success: boolean
    empresaId?: string
    sucursalId?: string
    error?: string
}> {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    try {
        // 1. Crear empresa
        const { data: empresa, error: empError } = await supabase
            .from('empresas')
            .insert({
                razon_social: input.razon_social,
                nombre_comercial: input.nombre_comercial,
                ruc: input.ruc,
                email: input.email,
                telefono: input.telefono || '',
                direccion: input.direccion || 'Dirección por registrar',
                activo: true,
                plan_id: input.plan_id || null
            })
            .select()
            .single()

        if (empError) throw new Error(`Error creando empresa: ${empError.message}`)

        // 2. Crear sucursal principal automáticamente
        const { data: sucursal, error: sucError } = await supabase
            .from('sucursales')
            .insert({
                empresa_id: empresa.id,
                codigo: `MAIN-${empresa.id.substring(0, 6).toUpperCase()}`,
                nombre: 'Sede Principal',
                direccion: input.direccion || 'Dirección por registrar',
                telefono: input.telefono || '',
                activa: true,
                tipo_sucursal: 'principal',
                ubigeo_cod: '150101', // Lima por defecto
                departamento: 'Lima',
                provincia: 'Lima',
                distrito: 'Cercado de Lima'
            })
            .select()
            .single()

        if (sucError) throw new Error(`Error creando sucursal: ${sucError.message}`)

        // 3. Si se proporcionó admin_email, crear usuario admin
        if (input.admin_email) {
            const password = input.admin_password || 'TempPass123!'

            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: input.admin_email,
                password: password,
                email_confirm: true,
                user_metadata: {
                    nombres: 'Administrador',
                    apellido_paterno: input.nombre_comercial,
                    rol: 'admin'
                }
            })

            if (!authError && authUser.user) {
                // Crear registro en usuarios públicos
                await supabase.from('usuarios').insert({
                    id: authUser.user.id,
                    email: input.admin_email,
                    empresa_id: empresa.id,
                    rol: 'admin',
                    nombres: 'Administrador',
                    apellido_paterno: input.nombre_comercial,
                    apellido_materno: '',
                    activo: true
                })
            }
        }

        console.log(`[SuperAdmin] Empresa creada: ${empresa.id}`)

        return {
            success: true,
            empresaId: empresa.id,
            sucursalId: sucursal.id
        }

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Error desconocido'
        console.error('[SuperAdmin] Error creando empresa:', errMsg)
        return { success: false, error: errMsg }
    }
}

/**
 * Crear sucursal para empresa específica (bypass RLS)
 */
export async function crearSucursalAdmin(input: CreateSucursalAdminInput): Promise<{
    success: boolean
    sucursalId?: string
    error?: string
}> {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    try {
        const { data: sucursal, error } = await supabase
            .from('sucursales')
            .insert({
                empresa_id: input.empresa_id,
                codigo: input.codigo.toUpperCase(),
                nombre: input.nombre,
                direccion: input.direccion,
                telefono: input.telefono || '',
                activa: true,
                tipo_sucursal: input.tipo_sucursal || 'secundaria',
                ubigeo_cod: input.ubigeo_cod || '150101',
                departamento: input.departamento || 'Lima',
                provincia: input.provincia || 'Lima',
                distrito: input.distrito || 'Lima'
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        return { success: true, sucursalId: sucursal.id }

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: errMsg }
    }
}

// ============================================================
// READ OPERATIONS
// ============================================================

/**
 * Obtener detalle completo de una empresa con métricas
 */
export async function obtenerDetalleEmpresa(empresaId: string): Promise<EmpresaDetalle | null> {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    // Obtener empresa
    const { data: empresa, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .single()

    if (error || !empresa) return null

    // Obtener sucursales
    const { data: sucursales } = await supabase
        .from('sucursales')
        .select('id')
        .eq('empresa_id', empresaId)

    const sucursalIds = sucursales?.map(s => s.id) || []

    // Métricas
    let totalEmpleados = 0
    let carteraTotal = 0
    let totalCreditosActivos = 0
    let cobranzaMes = 0

    if (sucursalIds.length > 0) {
        // Empleados
        const { count: empCount } = await supabase
            .from('empleados')
            .select('*', { count: 'exact', head: true })
            .in('sucursal_id', sucursalIds)
            .eq('activo', true)
        totalEmpleados = empCount || 0

        // Créditos activos
        const { data: creditos, count: credCount } = await supabase
            .from('creditos')
            .select('saldo_capital', { count: 'exact' })
            .in('sucursal_id', sucursalIds)
            .eq('estado', 'activo')

        totalCreditosActivos = credCount || 0
        carteraTotal = creditos?.reduce((sum, c) => sum + (c.saldo_capital || 0), 0) || 0

        // Cobranza del mes
        const inicioMes = new Date()
        inicioMes.setDate(1)
        inicioMes.setHours(0, 0, 0, 0)

        const { data: pagos } = await supabase
            .from('pagos')
            .select('monto_pagado, creditos!inner(sucursal_id)')
            .in('creditos.sucursal_id', sucursalIds)
            .gte('fecha_pago', inicioMes.toISOString())

        cobranzaMes = pagos?.reduce((sum, p) => sum + (p.monto_pagado || 0), 0) || 0
    }

    return {
        ...empresa,
        total_sucursales: sucursalIds.length,
        total_empleados: totalEmpleados,
        total_creditos_activos: totalCreditosActivos,
        cartera_total: carteraTotal,
        cobranza_mes: cobranzaMes,
        mora_porcentaje: 0 // TODO: Calcular mora real
    }
}

/**
 * Listar sucursales de una empresa con métricas
 */
export async function listarSucursalesDeEmpresa(empresaId: string): Promise<SucursalResumen[]> {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    const { data: sucursales, error } = await supabase
        .from('sucursales')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('tipo_sucursal', { ascending: true })
        .order('nombre', { ascending: true })

    if (error || !sucursales) return []

    // Agregar métricas a cada sucursal
    const sucursalesConMetricas = await Promise.all(
        sucursales.map(async (suc) => {
            const { count: empCount } = await supabase
                .from('empleados')
                .select('*', { count: 'exact', head: true })
                .eq('sucursal_id', suc.id)
                .eq('activo', true)

            const { data: creditos } = await supabase
                .from('creditos')
                .select('saldo_capital')
                .eq('sucursal_id', suc.id)
                .eq('estado', 'activo')

            const cartera = creditos?.reduce((sum, c) => sum + (c.saldo_capital || 0), 0) || 0

            return {
                id: suc.id,
                codigo: suc.codigo,
                nombre: suc.nombre,
                direccion: suc.direccion,
                telefono: suc.telefono,
                activa: suc.activa,
                departamento: suc.departamento,
                provincia: suc.provincia,
                distrito: suc.distrito,
                empleados_count: empCount || 0,
                cartera_total: cartera
            }
        })
    )

    return sucursalesConMetricas
}

// ============================================================
// UPDATE OPERATIONS
// ============================================================

/**
 * Toggle estado activo de una empresa
 */
export async function toggleEstadoEmpresa(empresaId: string, activo: boolean) {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('empresas')
        .update({ activo })
        .eq('id', empresaId)

    if (error) {
        console.error('Error updating company status:', error)
        throw error
    }

    return { success: true }
}

/**
 * Actualizar datos de empresa
 */
export async function actualizarEmpresa(
    empresaId: string,
    data: Partial<Omit<CreateEmpresaInput, 'admin_email' | 'admin_password'>>
): Promise<{ success: boolean; error?: string }> {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('empresas')
        .update({
            razon_social: data.razon_social,
            nombre_comercial: data.nombre_comercial,
            ruc: data.ruc,
            email: data.email,
            telefono: data.telefono,
            direccion: data.direccion,
            plan_id: data.plan_id
        })
        .eq('id', empresaId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

/**
 * Toggle estado de sucursal
 */
export async function toggleEstadoSucursal(sucursalId: string, activa: boolean) {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('sucursales')
        .update({ activa })
        .eq('id', sucursalId)

    if (error) throw error
    return { success: true }
}

// ============================================================
// DELETE OPERATIONS (Soft Delete)
// ============================================================

/**
 * Suspender empresa (Soft Delete)
 */
export async function suspenderEmpresa(empresaId: string, motivo: string): Promise<{
    success: boolean
    error?: string
}> {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    try {
        // Marcar empresa como inactiva
        await supabase
            .from('empresas')
            .update({
                activo: false,
                // metadata: { suspension_motivo: motivo, suspension_fecha: new Date().toISOString() }
            })
            .eq('id', empresaId)

        // Desactivar todas las sucursales
        await supabase
            .from('sucursales')
            .update({ activa: false })
            .eq('empresa_id', empresaId)

        console.log(`[SuperAdmin] Empresa suspendida: ${empresaId} - Motivo: ${motivo}`)
        return { success: true }

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: errMsg }
    }
}

// ============================================================
// ANALYTICS
// ============================================================

/**
 * Obtener KPIs globales del SaaS
 */
export async function obtenerKPIsGlobales(): Promise<{
    totalEmpresas: number
    empresasActivas: number
    empresasSuspendidas: number
    totalSucursales: number
    totalEmpleados: number
    carteraGlobal: number
    mrrEstimado: number
}> {
    await verifySuperAdmin()
    const supabase = createAdminClient()

    const { count: totalEmpresas } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true })

    const { count: empresasActivas } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

    const { count: totalSucursales } = await supabase
        .from('sucursales')
        .select('*', { count: 'exact', head: true })

    const { count: totalEmpleados } = await supabase
        .from('empleados')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

    const { data: creditos } = await supabase
        .from('creditos')
        .select('saldo_capital')
        .eq('estado', 'activo')

    const carteraGlobal = creditos?.reduce((sum, c) => sum + (c.saldo_capital || 0), 0) || 0

    // Estimar MRR basado en planes (simplificado)
    const mrrEstimado = (empresasActivas || 0) * 99 // Asume $99/empresa promedio

    return {
        totalEmpresas: totalEmpresas || 0,
        empresasActivas: empresasActivas || 0,
        empresasSuspendidas: (totalEmpresas || 0) - (empresasActivas || 0),
        totalSucursales: totalSucursales || 0,
        totalEmpleados: totalEmpleados || 0,
        carteraGlobal,
        mrrEstimado
    }
}
