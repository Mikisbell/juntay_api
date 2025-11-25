'use server'

import { createClient } from '@/lib/supabase/server'

export interface ClienteCompleto {
    id: string
    persona_id: string
    empresa_id: string | null
    score_crediticio: number
    activo: boolean
    created_at: string
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
 * Alias para compatibilidad con código existente
 */
export type PerfilCliente = ClienteCompleto


/**
 * Buscar cliente por DNI usando la vista clientes_completo
 */
export async function buscarClientePorDNI(dni: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clientes_completo')
        .select('*')
        .eq('numero_documento', dni)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return { encontrado: false, perfil: null }
        }
        throw error
    }

    return {
        encontrado: true,
        perfil: data as ClienteCompleto
    }
}

/**
 * Crear nuevo cliente (usando RPC que maneja personas)
 */
export async function crearCliente(datos: {
    tipo_documento: string
    numero_documento: string
    nombres: string
    apellido_paterno: string
    apellido_materno: string
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

    // 2. Crear cliente referenciando la persona
    const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert({
            persona_id: personaId,
            score_crediticio: 500, // Score inicial
            activo: true
        })
        .select()
        .single()

    if (clienteError) throw clienteError

    // 3. Retornar cliente completo
    const { data: clienteCompleto } = await supabase
        .from('clientes_completo')
        .select('*')
        .eq('id', cliente.id)
        .single()

    return clienteCompleto as ClienteCompleto
}

/**
 * Listar todos los clientes
 */
export async function listarClientes() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clientes_completo')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })

    if (error) throw error

    return data as ClienteCompleto[]
}

/**
 * Alias para compatibilidad con código existente
 */
export const obtenerClientes = listarClientes

/**
 * Crear cliente desde datos de entidad (RENIEC/SUNAT)
 */
export async function crearClienteDesdeEntidad(datos: {
    tipo_documento: string
    numero_documento: string
    nombre_completo: string
    nombres?: string
    apellido_paterno?: string
    apellido_materno?: string
    apellidos?: string
    telefono?: string
    email?: string
    direccion?: string
}) {
    // Extraer nombres y apellidos si no vienen separados
    let nombres = datos.nombres || ''
    let apellido_paterno = datos.apellido_paterno || ''
    let apellido_materno = datos.apellido_materno || ''

    // Si no hay nombres, intentar extraer de nombre_completo
    if (!nombres && datos.nombre_completo) {
        // Formato típico: "APELLIDO_PATERNO APELLIDO_MATERNO, NOMBRES"
        if (datos.nombre_completo.includes(',')) {
            const [apellidos, nombresStr] = datos.nombre_completo.split(',').map(s => s.trim())
            nombres = nombresStr
            const partesApellidos = apellidos.split(' ')
            apellido_paterno = partesApellidos[0] || ''
            apellido_materno = partesApellidos.slice(1).join(' ') || ''
        } else {
            // Formato: "NOMBRES APELLIDO_PATERNO APELLIDO_MATERNO"
            const partes = datos.nombre_completo.split(' ')
            if (partes.length >= 3) {
                nombres = partes[0] || ''
                apellido_paterno = partes[1] || ''
                apellido_materno = partes.slice(2).join(' ') || ''
            } else if (partes.length === 2) {
                nombres = partes[0] || ''
                apellido_paterno = partes[1] || ''
            } else {
                nombres = datos.nombre_completo
            }
        }
    }

    // Si vienen apellidos juntos, separarlos
    if (!apellido_paterno && !apellido_materno && datos.apellidos) {
        const partes = datos.apellidos.split(' ')
        apellido_paterno = partes[0] || ''
        apellido_materno = partes.slice(1).join(' ') || ''
    }

    return crearCliente({
        tipo_documento: datos.tipo_documento,
        numero_documento: datos.numero_documento,
        nombres: nombres || 'SIN NOMBRE',
        apellido_paterno: apellido_paterno || 'SIN APELLIDO',
        apellido_materno: apellido_materno || '',
        telefono: datos.telefono,
        email: datos.email,
        direccion: datos.direccion
    })
}
