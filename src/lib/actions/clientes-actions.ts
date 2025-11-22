'use server'

import { createClient } from '@supabase/supabase-js'
import { consultarEntidad, type DatosEntidad } from '@/lib/apis/consultasperu'

const getServiceClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export interface PerfilCliente {
    // Datos básicos
    id: string
    numero_documento: string
    tipo_documento: string
    nombre_completo: string
    nombres?: string
    apellido_paterno?: string
    apellido_materno?: string
    direccion?: string
    telefono?: string
    email?: string

    // Historial
    contratos: Array<{
        id: string
        numero_contrato: string
        monto_prestado: number
        estado: string
        fecha_inicio: string
        saldo_pendiente?: number
    }>

    // Estadísticas
    deuda_total: number
    total_contratos: number
    es_nuevo: boolean
    estado_crediticio: 'NUEVO' | 'BUEN_CLIENTE' | 'REGULAR' | 'CON_DEUDA' | 'MOROSO'

    // Metadata
    verificado_entidad: boolean
    fecha_registro: string
}

/**
 * Búsqueda inteligente de cliente:
 * 1. Busca en BD local
 * 2. Si no existe, consulta API de ConsultasPeru
 * 3. Retorna perfil completo o datos para crear nuevo cliente
 */
export async function buscarClientePorDNI(dni: string): Promise<{
    encontrado: boolean
    perfil?: PerfilCliente
    datos_reniec?: DatosEntidad
    error?: string
}> {
    const supabase = getServiceClient()

    // Validar formato DNI
    if (!/^\d{8}$/.test(dni)) {
        return { encontrado: false, error: 'DNI debe tener 8 dígitos' }
    }

    try {
        // 1. Buscar en BD local primero (más rápido)
        const { data: cliente, error: errorCliente } = await supabase
            .from('clientes')
            .select('*')
            .eq('numero_documento', dni) // CORREGIDO: numero_documento
            .eq('tipo_documento', 'DNI')
            .single()

        if (cliente) {
            // Cliente existe - obtener historial
            const { data: contratos } = await supabase
                .from('contratos_empeno')
                .select(`
          id,
          numero_contrato,
          monto_prestado,
          estado,
          fecha_inicio,
          saldo_pendiente
        `)
                .eq('cliente_id', cliente.id)
                .order('fecha_inicio', { ascending: false })
                .limit(5)

            // Calcular deuda pendiente
            const deudaTotal = contratos
                ?.filter((c: any) => ['VIGENTE', 'VENCIDO'].includes(c.estado))
                .reduce((sum: number, c: any) => sum + (c.saldo_pendiente || 0), 0) || 0

            const estadoCrediticio = calcularEstadoCrediticio(contratos || [], deudaTotal)

            // Construir nombre completo si no existe
            const nombreCompleto = cliente.nombre_completo ||
                `${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno}`.trim()

            const perfil: PerfilCliente = {
                ...cliente,
                numero_documento: cliente.numero_documento,
                nombre_completo: nombreCompleto,
                contratos: contratos || [],
                deuda_total: deudaTotal,
                total_contratos: contratos?.length || 0,
                es_nuevo: !contratos || contratos.length === 0,
                estado_crediticio: estadoCrediticio,
                verificado_entidad: true, // Asumimos verificado si ya está en BD
            }

            return { encontrado: true, perfil }
        }

        // 2. Cliente NO existe - consultar API
        console.log('Cliente no encontrado en BD, consultando API...')
        // Por defecto asumimos DNI si llamamos a esta función legacy
        const datosEntidad = await consultarEntidad('DNI', dni)

        if (datosEntidad) {
            return {
                encontrado: false,
                datos_reniec: datosEntidad,
            }
        }

        // 3. DNI no existe ni en BD ni en RENIEC
        return {
            encontrado: false,
            error: 'DNI no encontrado en RENIEC. Verifique el número.',
        }

    } catch (error) {
        console.error('Error buscando cliente:', error)
        return {
            encontrado: false,
            error: 'Error al buscar cliente. Intente nuevamente.',
        }
    }
}

/**
 * Crear cliente usando datos de Entidad (DNI/RUC)
 */
export async function crearClienteDesdeEntidad(datos: DatosEntidad) {
    const supabase = getServiceClient()

    let nombres = datos.nombres || ''
    let apellido_paterno = ''
    let apellido_materno = ''

    if (datos.tipo_documento === 'DNI' && datos.apellidos) {
        const partes = datos.apellidos.split(' ')
        apellido_paterno = partes[0]
        apellido_materno = partes.slice(1).join(' ')
    } else if (datos.tipo_documento === 'RUC') {
        // Para RUC, usamos nombre_completo como razón social en "nombres" o un campo específico
        // Como la tabla clientes está diseñada para personas, adaptamos:
        nombres = datos.nombre_completo
    }

    const { data, error } = await supabase
        .from('clientes')
        .insert({
            tipo_documento: datos.tipo_documento,
            numero_documento: datos.numero_documento,
            nombres: nombres,
            apellido_paterno: apellido_paterno,
            apellido_materno: apellido_materno,
            // nombre_completo se genera, pero si queremos guardarlo explícitamente:
            // nombre_completo: datos.nombre_completo, 
            direccion: datos.direccion,
            // verificado_reniec: true, // No existe en tabla, usar metadata si se requiere
            // metadata: {
            //     ubigeo: datos.ubigeo,
            //     departamento: datos.departamento,
            //     provincia: datos.provincia,
            //     distrito: datos.distrito,
            //     estado_ruc: datos.estado,
            //     condicion_ruc: datos.condicion
            // },
        })
        .select()
        .single()

    if (error) {
        console.error('Error creando cliente:', error)
        return { success: false, error: error.message }
    }

    return { success: true, cliente: data }
}

function calcularEstadoCrediticio(
    contratos: any[],
    deuda: number
): 'NUEVO' | 'BUEN_CLIENTE' | 'REGULAR' | 'CON_DEUDA' | 'MOROSO' {
    if (!contratos || contratos.length === 0) return 'NUEVO'

    const tieneDeuda = deuda > 0
    const vencidos = contratos.filter((c) => c.estado === 'VENCIDO').length
    const desempenos = contratos.filter((c) => c.estado === 'DESEMPEÑADO').length

    if (vencidos > 0) return 'MOROSO'
    if (tieneDeuda) return 'CON_DEUDA'
    if (desempenos >= 3) return 'BUEN_CLIENTE'
    return 'REGULAR'
}
