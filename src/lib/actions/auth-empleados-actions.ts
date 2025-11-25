'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Invitar empleado a crear cuenta en la plataforma
 */
export async function invitarEmpleado(empleadoId: string, email: string) {
    if (!email) {
        throw new Error('El empleado debe tener un email registrado')
    }

    const supabase = await createClient()

    // 1. Verificar que el empleado existe y está activo
    const { data: empleado, error: empleadoError } = await supabase
        .from('empleados_completo')
        .select('*')
        .eq('id', empleadoId)
        .eq('activo', true)
        .single()

    if (empleadoError || !empleado) {
        throw new Error('Empleado no encontrado')
    }

    // 2. Crear usuario en Supabase Auth (usando Admin API)
    // Nota: Esto requiere configurar las credenciales de servicio
    try {
        const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
                empleado_id: empleadoId,
                nombres: empleado.nombres,
                apellido_paterno: empleado.apellido_paterno,
                apellido_materno: empleado.apellido_materno,
                cargo: empleado.cargo
            }
        })

        if (authError) throw authError

        // 3. Vincular user_id al empleado
        if (authData.user) {
            await supabase
                .from('empleados')
                .update({ user_id: authData.user.id })
                .eq('id', empleadoId)
        }

        return { success: true, message: 'Invitación enviada al email del empleado' }
    } catch (error: any) {
        // Si el error es porque el email ya existe, intentar vincular
        if (error.message?.includes('already registered')) {
            const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)

            if (existingUser?.user) {
                await supabase
                    .from('empleados')
                    .update({ user_id: existingUser.user.id })
                    .eq('id', empleadoId)

                return { success: true, message: 'Empleado vinculado a cuenta existente' }
            }
        }

        throw error
    }
}

/**
 * Obtener empleado actual (desde sesión)
 */
export async function getEmpleadoActual() {
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // 2. Buscar empleado vinculado
    const { data: empleado } = await supabase
        .from('empleados_completo')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .single()

    return empleado
}

/**
 * Verificar permisos del empleado actual
 */
export async function verificarPermiso(permisoRequerido: 'admin' | 'gerente' | 'cajero' | 'tasador') {
    const empleado = await getEmpleadoActual()

    if (!empleado) {
        return false
    }

    // Jerarquía de permisos
    const jerarquia = {
        admin: 4,
        gerente: 3,
        tasador: 2,
        cajero: 1
    }

    const nivelEmpleado = jerarquia[empleado.cargo as keyof typeof jerarquia] || 0
    const nivelRequerido = jerarquia[permisoRequerido] || 0

    return nivelEmpleado >= nivelRequerido
}
