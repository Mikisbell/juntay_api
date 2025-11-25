'use server'

import { createClient } from '@/lib/supabase/server'

export interface EmpleadoCompleto {
    id: string
    persona_id: string
    user_id: string | null
    cargo: string
    sucursal_id: string | null
    activo: boolean
    fecha_ingreso: string
    fecha_salida: string | null
    // Datos de persona
    tipo_documento: string
    numero_documento: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    nombre_completo: string
    email: string | null
    telefono_principal: string | null
    direccion: string | null
}

/**
 * Listar todos los empleados
 */
export async function listarEmpleados() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('empleados_completo')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })

    if (error) throw error

    return data as EmpleadoCompleto[]
}

/**
 * Crear nuevo empleado
 */
export async function crearEmpleado(datos: {
    tipo_documento: string
    numero_documento: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    cargo: 'cajero' | 'gerente' | 'admin' | 'tasador'
    telefono?: string
    email?: string
    direccion?: string
}) {
    const supabase = await createClient()

    // 1. Crear o obtener persona
    const { data: personaId, error: personaError } = await supabase.rpc('get_or_create_persona', {
        p_tipo_documento: datos.tipo_documento,
        p_numero_documento: datos.numero_documento,
        p_nombres: datos.nombres,
        p_apellido_paterno: datos.apellido_paterno,
        p_apellido_materno: datos.apellido_materno,
        p_telefono: datos.telefono || null,
        p_email: datos.email || null,
        p_direccion: datos.direccion || null
    })

    if (personaError) throw personaError

    // 2. Crear empleado
    const { data: empleado, error: empleadoError } = await supabase
        .from('empleados')
        .insert({
            persona_id: personaId,
            cargo: datos.cargo,
            activo: true,
            fecha_ingreso: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

    if (empleadoError) throw empleadoError

    // 3. Retornar empleado completo
    const { data: empleadoCompleto } = await supabase
        .from('empleados_completo')
        .select('*')
        .eq('id', empleado.id)
        .single()

    return empleadoCompleto as EmpleadoCompleto
}

/**
 * Buscar empleado por DNI
 */
export async function buscarEmpleadoPorDNI(dni: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('empleados_completo')
        .select('*')
        .eq('numero_documento', dni)
        .eq('activo', true)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return { encontrado: false, empleado: null }
        }
        throw error
    }

    return { encontrado: true, empleado: data as EmpleadoCompleto }
}

/**
 * Desactivar empleado (baja)
 */
export async function darDeBajaEmpleado(empleadoId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('empleados')
        .update({
            activo: false,
            fecha_salida: new Date().toISOString().split('T')[0]
        })
        .eq('id', empleadoId)

    if (error) throw error

    return { success: true }
}
