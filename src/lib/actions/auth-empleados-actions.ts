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
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
            empleado_id: empleadoId,
            persona_id: empleado.persona_id,
            nombres: empleado.nombres,
            apellido_paterno: empleado.apellido_paterno,
            cargo: empleado.cargo
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    })

    if (error) {
        // If email already registered, user needs to sign in first
        // TODO: Implement manual linking flow for existing users
        console.error('Error inviting user:', error)
        throw new Error(error.message || 'Error al enviar invitación')
    }

    // 3. Vincular user_id al empleado
    if (data.user) {
        await supabase
            .from('empleados')
            .update({ user_id: data.user.id })
            .eq('id', empleadoId)
    }

    return { success: true, message: 'Invitación enviada al email del empleado' }
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
