'use server'

import { createClient } from '@/lib/supabase/server'
import { verificarLimiteUsuarios } from './limites-actions'

export type EstadoEmpleado = 'ACTIVO' | 'LICENCIA' | 'SUSPENDIDO' | 'BAJA'

export interface EmpleadoCompleto {
    id: string
    party_id: string  // Antes: persona_id
    user_id: string | null
    cargo: string
    sucursal_id: string | null
    activo: boolean
    estado: EstadoEmpleado
    motivo_estado: string | null
    fecha_ingreso: string
    fecha_salida: string | null
    // Contacto de Emergencia
    nombre_contacto_emergencia: string | null
    parentesco_emergencia: string | null
    telefono_emergencia: string | null
    // Datos de persona
    tipo_documento: string
    numero_documento: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
    nombre_completo: string
    email: string | null
    telefono_principal: string | null
    telefono_secundario: string | null
    direccion: string | null
}

/**
 * Listar todos los empleados (Activos e Inactivos)
 */
export async function listarEmpleados() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('empleados_completo')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error

    return data as EmpleadoCompleto[]
}

/**
 * Actualizar datos de empleado
 */
export async function actualizarEmpleado(
    empleadoId: string,
    personaId: string,
    datos: {
        nombres: string
        apellido_paterno: string
        apellido_materno: string
        cargo: string
        telefono?: string
        telefono_secundario?: string
        email?: string
        direccion?: string
        // Nuevos campos KYE
        estado?: EstadoEmpleado
        motivo_estado?: string
        nombre_contacto_emergencia?: string
        parentesco_emergencia?: string
        telefono_emergencia?: string
    }
) {
    const supabase = await createClient()

    // 1. Actualizar Party (Datos personales)
    // Primero obtenemos el party_id del empleado
    const { data: empleado } = await supabase
        .from('empleados')
        .select('party_id')
        .eq('id', empleadoId)
        .single()

    const partyId = empleado?.party_id || personaId

    // Actualizar parties base
    const { error: errorParty } = await supabase
        .from('parties')
        .update({
            email: datos.email,
            telefono_principal: datos.telefono,
            telefono_secundario: datos.telefono_secundario,
            direccion: datos.direccion
        })
        .eq('id', partyId)

    if (errorParty) {
        console.error('Error actualizando party:', errorParty)
        throw errorParty
    }

    // Actualizar personas_naturales
    const { error: errorNatural } = await supabase
        .from('personas_naturales')
        .update({
            nombres: datos.nombres,
            apellido_paterno: datos.apellido_paterno,
            apellido_materno: datos.apellido_materno
        })
        .eq('party_id', partyId)
    if (errorNatural) {
        console.error('Error actualizando persona natural:', errorNatural)
        throw errorNatural
    }

    // 2. Actualizar Empleado (Cargo, Estado, Emergencia)
    const updateData: Record<string, unknown> = {
        cargo: datos.cargo
    }

    if (datos.estado) {
        updateData.estado = datos.estado
        updateData.activo = datos.estado === 'ACTIVO'
        if (datos.estado === 'BAJA') {
            updateData.fecha_salida = new Date().toISOString().split('T')[0]
        } else {
            updateData.fecha_salida = null
        }
    }
    if (datos.motivo_estado !== undefined) updateData.motivo_estado = datos.motivo_estado
    if (datos.nombre_contacto_emergencia !== undefined) updateData.nombre_contacto_emergencia = datos.nombre_contacto_emergencia
    if (datos.parentesco_emergencia !== undefined) updateData.parentesco_emergencia = datos.parentesco_emergencia
    if (datos.telefono_emergencia !== undefined) updateData.telefono_emergencia = datos.telefono_emergencia

    const { error: errorEmpleado } = await supabase
        .from('empleados')
        .update(updateData)
        .eq('id', empleadoId)

    if (errorEmpleado) throw errorEmpleado

    return { success: true }
}

/**
 * Reactivar empleado
 */
export async function reactivarEmpleado(empleadoId: string) {
    const supabase = await createClient()

    // 🆕 Verificar límites del plan
    const { permitido, mensaje } = await verificarLimiteUsuarios()
    if (!permitido) {
        throw new Error(mensaje)
    }

    const { error } = await supabase
        .from('empleados')
        .update({
            activo: true,
            fecha_salida: null
        })
        .eq('id', empleadoId)

    if (error) throw error

    return { success: true }
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
    // 🆕 Verificar límites del plan
    const { permitido, mensaje } = await verificarLimiteUsuarios()
    if (!permitido) {
        throw new Error(mensaje)
    }

    const supabase = await createClient()

    // 1. Crear o obtener party (persona natural)
    const { data: partyId, error: partyError } = await supabase.rpc('get_or_create_party', {
        p_party_type: 'NATURAL',
        p_tax_id_type: datos.tipo_documento,
        p_tax_id: datos.numero_documento,
        p_nombres: datos.nombres,
        p_apellido_paterno: datos.apellido_paterno,
        p_apellido_materno: datos.apellido_materno,
        p_email: datos.email || null,
        p_telefono: datos.telefono || null,
        p_direccion: datos.direccion || null
    })

    if (partyError) throw partyError

    // 2. Crear empleado
    const { data: empleado, error: empleadoError } = await supabase
        .from('empleados')
        .insert({
            party_id: partyId,
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
