'use server'

import { createClient } from '@/lib/supabase/server'
import { getEmpresaActual } from '@/lib/auth/empresa-context'

export interface ClienteCompleto {
    id: string
    party_id: string  // Antes: persona_id
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
    razon_social: string | null  // Para personas jurídicas
    party_type: 'NATURAL' | 'JURIDICA'
    email: string | null
    telefono_principal: string | null
    telefono_secundario: string | null
    parentesco_referencia: string | null
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
        .select('id, party_id, empresa_id, score_crediticio, activo, created_at, tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, nombre_completo, razon_social, party_type, email, telefono_principal, telefono_secundario, direccion')
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
 * Buscar cliente por ID (UUID)
 */
export async function getClienteById(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clientes_completo')
        .select('id, party_id, empresa_id, score_crediticio, activo, created_at, tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, nombre_completo, razon_social, party_type, email, telefono_principal, telefono_secundario, direccion')
        .eq('id', id)
        .single()

    if (error) return null

    return data as ClienteCompleto
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
    telefono_secundario?: string  // Teléfono referencia/familiar
    parentesco_referencia?: string // Parentesco: Esposa, Padre, etc.
    email?: string
    direccion?: string
    ubigeo_cod?: string
    departamento?: string
    provincia?: string
    distrito?: string
}) {
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

    // 1.5. Verificar si el CLIENTE ya existe (aunque la persona exista, el registro de cliente podría existir o no)
    const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('numero_documento', datos.numero_documento)
        .maybeSingle()

    if (clienteExistente) {
        // Retornar cliente existente sin error
        const { data: clienteCompleto } = await supabase
            .from('clientes_completo')
            .select('*')
            .eq('id', clienteExistente.id)
            .single()

        return clienteCompleto as ClienteCompleto
    }

    // 2. Crear cliente referenciando la persona
    // CRÍTICO: Obtener empresa_id del usuario actual para cumplir con RLS
    const { empresaId } = await getEmpresaActual()

    if (!empresaId) {
        throw new Error('No se pudo determinar la empresa del usuario. Verifica que tu usuario esté correctamente configurado.')
    }

    const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert({
            party_id: partyId,
            empresa_id: empresaId, // CRÍTICO: Requerido por RLS
            // CRÍTICO: Estos campos son NOT NULL en la tabla clientes
            tipo_documento: datos.tipo_documento,
            numero_documento: datos.numero_documento,
            nombres: datos.nombres,
            apellido_paterno: datos.apellido_paterno,
            apellido_materno: datos.apellido_materno,
            email: datos.email || null,
            telefono_principal: datos.telefono || null,
            telefono_secundario: datos.telefono_secundario || null,
            parentesco_referencia: datos.parentesco_referencia || null,
            direccion: datos.direccion || null,
            score_crediticio: 500, // Score inicial
            activo: true,
            ubigeo_cod: datos.ubigeo_cod,
            departamento: datos.departamento,
            provincia: datos.provincia,
            distrito: datos.distrito
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
// Definición de tipos de respuesta
export interface ResumenCartera {
    totalClientes: number
    clientesCriticos: number
    montoCritico: number
    vencimientosSemana: number
    montoPorVencer: number
    clientesSuspendidos: number // NUEVO: Conteo de clientes suspendidos
    pagination: {
        page: number
        pageSize: number
        totalPages: number
        totalRecords: number
    }
}

/**
 * Listar clientes con KPIs, filtros avanzados y paginación
 */
export async function listarClientes(filtros?: {
    busqueda?: string,
    estado?: string,
    page?: number,
    pageSize?: number,
    ordenarPor?: string,
    direccion?: 'asc' | 'desc'
}) {
    const supabase = await createClient()
    const page = filtros?.page || 1
    const pageSize = filtros?.pageSize || 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const ordering = filtros?.ordenarPor || 'prioridad'
    const direction = filtros?.direccion || 'asc'
    const busqueda = filtros?.busqueda?.toLowerCase().trim() || ''

    // 1. KPI Queries (Parallel execution)
    // We optimized this to NOT fetch all clients. We use count() and aggregations.

    // A. Count Suspended & Total Activos
    const countPromise = supabase
        .from('clientes')
        .select('activo, id', { count: 'exact', head: true })

    // B. Financial KPIs (from Credits)
    // We still fetch active credits to aggregate risk, but we only select necessary columns.
    const creditsPromise = supabase
        .from('creditos')
        .select('cliente_id, saldo_pendiente, fecha_vencimiento, estado_detallado')
        .in('estado_detallado', ['vigente', 'por_vencer', 'vencido', 'en_mora'])

    // C. Main List Query (Paginated)
    let query = supabase
        .from('clientes_completo')
        .select('*', { count: 'exact' })

    // Apply Search Filters
    if (busqueda) {
        query = query.or(`nombre_completo.ilike.%${busqueda}%,numero_documento.ilike.%${busqueda}%,nombres.ilike.%${busqueda}%`)
    }

    // Apply State Filters (Requires specialized logic if filtering by 'critico' which is a calculated field)
    // If filtering by calculated risk, we must fetch IDs from credits first.
    // For simple 'suspendido', we use the column.

    let filterIds: string[] | null = null

    // Run parallel fetches for KPIs
    const [countsResult, creditsResult] = await Promise.all([
        supabase.from('clientes').select('activo', { count: 'exact' }).eq('activo', false), // Just count suspended
        creditsPromise
    ])

    const clientesSuspendidos = countsResult.count || 0
    const creditosActivos = creditsResult.data || []

    // Process Financial KPIs in Memory (Node.js is fast at this loop)
    const mapaDeuda = new Map<string, number>()
    const mapaVencimiento = new Map<string, string>()
    const mapaRiesgo = new Map<string, 'critico' | 'alerta' | 'normal'>()

    let clientesCriticos = 0
    let montoCritico = 0
    let vencimientosSemana = 0
    let montoPorVencer = 0
    const activeClientIds = new Set<string>() // To accurate count active clients with debt

    const en7dias = new Date()
    en7dias.setDate(new Date().getDate() + 7)

    // Group credits by client
    const creditosPorCliente = new Map<string, typeof creditosActivos>()
    creditosActivos.forEach(c => {
        const list = creditosPorCliente.get(c.cliente_id) || []
        list.push(c)
        creditosPorCliente.set(c.cliente_id, list)
    })

    creditosPorCliente.forEach((lista, clienteId) => {
        let totalDeuda = 0
        let peorVencimiento: string | null = null
        let esCritico = false
        let esAlerta = false

        lista.forEach(c => {
            totalDeuda += Number(c.saldo_pendiente)
            if (!peorVencimiento || new Date(c.fecha_vencimiento) < new Date(peorVencimiento)) {
                peorVencimiento = c.fecha_vencimiento
            }
            if (['vencido', 'en_mora'].includes(c.estado_detallado)) esCritico = true
            if (new Date(c.fecha_vencimiento) <= en7dias && c.estado_detallado === 'vigente') esAlerta = true
        })

        mapaDeuda.set(clienteId, totalDeuda)
        if (peorVencimiento) mapaVencimiento.set(clienteId, peorVencimiento)

        let riesgo: 'critico' | 'alerta' | 'normal' = 'normal'
        if (esCritico) {
            riesgo = 'critico'
            clientesCriticos++
            montoCritico += totalDeuda
        } else if (esAlerta || (peorVencimiento && new Date(peorVencimiento!) <= en7dias)) {
            riesgo = 'alerta'
            vencimientosSemana++
            montoPorVencer += totalDeuda
        }
        mapaRiesgo.set(clienteId, riesgo)
    })

    // Apply Complex Filters to the Query
    if (filtros?.estado) {
        if (filtros.estado === 'suspendido') {
            query = query.eq('activo', false)
        } else if (['critico', 'alerta'].includes(filtros.estado)) {
            // Filter by calculated risk using IDs
            const targetRisk = filtros.estado
            const ids = Array.from(mapaRiesgo.entries())
                .filter(([_, risk]) => risk === targetRisk)
                .map(([id, _]) => id)

            // If no IDs found, force empty result
            if (ids.length === 0) query = query.in('id', ['00000000-0000-0000-0000-000000000000'])
            else query = query.in('id', ids)

            query = query.eq('activo', true)
        } else {
            // Default or 'todos': show actives
            query = query.eq('activo', true)
        }
    } else {
        query = query.eq('activo', true)
    }

    // Apply Sorting
    // Note: sorting by calculated fields (deuda, vencimiento) works poorly with server-side pagination.
    // We prioritize DB sortable fields. For 'prioridad', we fall back to 'created_at' or simple Logic.
    // If the user REALLY needs sort by Debt, we might need a hybrid approach or a materialized column.
    // For now, we map 'prioridad' to 'created_at' desc as a safe fallback for speed.

    if (ordering === 'nombre') {
        query = query.order('nombre_completo', { ascending: direction === 'asc' })
    } else if (ordering === 'prioridad') {
        // Business Logic: We can't sort efficiently by computed priority in SQL without a view column.
        // Fallback: Sort by name or created_at
        query = query.order('created_at', { ascending: false })
    } else {
        query = query.order('created_at', { ascending: false })
    }

    // Execute Main Query
    query = query.range(from, to)
    const { data: clientesPaginados, count: totalRecordsQuery, error: queryError } = await query

    if (queryError) {
        console.error('Error listing clients:', queryError)
        throw queryError
    }

    // Merge Calculated Fields
    const dataFinal = (clientesPaginados || []).map(c => ({
        ...c,
        deuda_total: mapaDeuda.get(c.id) || 0,
        proximo_vencimiento: mapaVencimiento.get(c.id) || null,
        riesgo_calculado: mapaRiesgo.get(c.id) || 'normal'
    }))

    // Sort In-Memory for current page (Partial sort) if ordered by computed fields
    if (ordering === 'deuda') {
        dataFinal.sort((a, b) => (a.deuda_total - b.deuda_total) * (direction === 'desc' ? -1 : 1))
    } else if (ordering === 'prioridad') {
        // Re-apply visual priority sort on the fetched page
        const prioridad = { 'critico': 0, 'alerta': 1, 'normal': 2 }
        dataFinal.sort((a, b) => {
            const pa = prioridad[a.riesgo_calculado as 'critico' | 'alerta' | 'normal'] ?? 2
            const pb = prioridad[b.riesgo_calculado as 'critico' | 'alerta' | 'normal'] ?? 2
            return (pa - pb)
        })
    }

    return {
        meta: {
            totalClientes: totalRecordsQuery || 0, // Approximate total based on query
            clientesCriticos,
            montoCritico,
            vencimientosSemana,
            montoPorVencer,
            clientesSuspendidos,
            pagination: {
                page,
                pageSize,
                totalPages: Math.ceil((totalRecordsQuery || 0) / pageSize),
                totalRecords: totalRecordsQuery || 0
            }
        },
        data: dataFinal as (ClienteCompleto & { deuda_total: number, proximo_vencimiento: string | null, riesgo_calculado: string })[]
    }
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
    telefono_secundario?: string  // Teléfono referencia/familiar
    email?: string
    direccion?: string
    ubigeo_cod?: string
    departamento?: string
    provincia?: string
    distrito?: string
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
        telefono_secundario: datos.telefono_secundario,
        email: datos.email,
        direccion: datos.direccion,
        ubigeo_cod: datos.ubigeo_cod,
        departamento: datos.departamento,
        provincia: datos.provincia,
        distrito: datos.distrito
    })
}

/**
 * Obtener resumen financiero del cliente para el Centro de Comunicación
 */
export async function getClienteResumenFinanciero(clienteId: string) {
    const supabase = await createClient()

    // 1. Obtener TODOS los créditos (activos e históricos) para saber si es nuevo y para buscar pagos
    const { data: todosCreditos, error: creditosError } = await supabase
        .from('creditos')
        .select('id, saldo_pendiente, fecha_vencimiento, estado_detallado, monto_prestado')
        .eq('cliente_id', clienteId)

    if (creditosError) {
        console.error('Error fetching creditos:', creditosError)
        return null
    }

    // Filtrar vigentes
    const creditosVigentes = todosCreditos.filter(c =>
        ['vigente', 'por_vencer', 'vencido', 'en_mora'].includes(c.estado_detallado)
    )

    // Calcular deuda
    const deudaTotal = creditosVigentes.reduce((sum, c) => sum + Number(c.saldo_pendiente), 0)

    // Próximo vencimiento (solo de vigentes)
    let proximoVencimiento = null
    let diasParaVencimiento = null

    if (creditosVigentes.length > 0) {
        const ordenados = [...creditosVigentes].sort((a, b) =>
            new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()
        )
        const masProximo = ordenados[0]
        proximoVencimiento = masProximo.fecha_vencimiento

        const hoy = new Date()
        const venc = new Date(masProximo.fecha_vencimiento)
        const diffTime = venc.getTime() - hoy.getTime()
        diasParaVencimiento = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    // Último pago (buscar en tabla pagos filtrando por los IDs de todos los créditos del cliente)
    let ultimoPago = null
    if (todosCreditos.length > 0) {
        const creditosIds = todosCreditos.map(c => c.id)

        const { data: pagos } = await supabase
            .from('pagos')
            .select('fecha_pago, monto_total')
            .in('credito_id', creditosIds)
            .order('fecha_pago', { ascending: false })
            .limit(1)

        if (pagos && pagos.length > 0) {
            ultimoPago = {
                fecha: new Date(pagos[0].fecha_pago).toLocaleDateString('es-PE'),
                monto: Number(pagos[0].monto_total)
            }
        }
    }

    return {
        creditosActivos: creditosVigentes.length,
        deudaTotal,
        proximoVencimiento: proximoVencimiento ? new Date(proximoVencimiento).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
        diasParaVencimiento,
        esClienteNuevo: todosCreditos.length === 0,
        ultimoPago
    }
}
/**
 * Eliminar un cliente por ID
 * Valida que no tenga créditos activos antes de eliminar.
 */
export async function eliminarCliente(id: string) {
    const supabase = await createClient()

    // 1. Validar si tiene créditos (activos o históricos)
    // Se es estricto: Si tiene CUALQUIER historial, mejor no borrar para auditoría.
    // O si el usuario pide "eliminar", asumimos que sabe lo que hace si no hay deuda VIGENTE?
    // Regla de negocio segura: No eliminar si tiene créditos VIGENTES o con DEUDA.
    // Si tiene créditos pagados, se podría permitir (aunque perdemos historia).
    // Para MVP: No eliminar si existe CUALQUIER registro en creditos para evitar integrity errors.

    const { count, error: countError } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', id)

    if (countError) throw countError

    if (count && count > 0) {
        return {
            success: false,
            message: 'No se puede eliminar el cliente porque tiene historial de créditos. Considere desactivarlo.'
        }
    }

    // 2. Eliminar (Cascada debería manejar lo demás si está configurado, sino error)
    // Intentamos eliminar.
    const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

    if (error) throw error

    return { success: true, message: 'Cliente eliminado correctamente' }
}

/**
 * Activar o desactivar un cliente
 */
export async function toggleClienteActivo(id: string, nuevoEstado: boolean) {
    const supabase = await createClient()

    // Actualizar solo el campo activo (no _modified que no existe en clientes)
    const { data, error } = await supabase
        .from('clientes')
        .update({ activo: nuevoEstado })
        .eq('id', id)
        .select('id, activo')
        .single()

    if (error) {
        console.error('[toggleClienteActivo] Error:', error)
        throw error
    }

    console.log('[toggleClienteActivo] Updated cliente:', id, 'activo:', data?.activo)

    return {
        success: true,
        message: nuevoEstado ? 'Cliente reactivado correctamente' : 'Cliente suspendido correctamente',
        activo: data?.activo
    }
}

/**
 * Obtener historial de pagos REALES de un cliente
 * Incluye todos los pagos a todos sus créditos
 */
export async function getClientePagosHistorial(clienteId: string, limite: number = 20) {
    const supabase = await createClient()

    // Primero obtener todos los créditos del cliente
    const { data: creditos } = await supabase
        .from('creditos')
        .select('id, codigo_credito')
        .eq('cliente_id', clienteId)

    if (!creditos || creditos.length === 0) {
        return []
    }

    const creditoIds = creditos.map(c => c.id)
    const codigosMap = new Map(creditos.map(c => [c.id, c.codigo_credito]))

    // Obtener todos los pagos de esos créditos
    // NOTA: Columnas pueden variar según schema - usando solo las básicas
    const { data: pagos, error } = await supabase
        .from('pagos')
        .select('*')
        .in('credito_id', creditoIds)
        .order('fecha_pago', { ascending: false })
        .limit(limite)

    if (error) {
        console.error('[getClientePagosHistorial] Error:', error.message, error.code, error.details)
        return []
    }

    // Mapear con código de crédito - manejar columnas opcionales
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (pagos || []).filter((p: any) => !p.anulado).map((p: any) => ({
        id: p.id,
        credito_id: p.credito_id,
        codigo_credito: codigosMap.get(p.credito_id) || 'N/A',
        monto_total: Number(p.monto_total || 0),
        // Usar nombres correctos de DB: desglose_* (con fallback a monto_* por compatibilidad)
        monto_capital: Number(p.desglose_capital || p.monto_capital || 0),
        monto_interes: Number(p.desglose_interes || p.monto_interes || 0),
        monto_mora: Number(p.desglose_mora || p.monto_mora || 0),
        metodo_pago: p.metodo_pago || p.medio_pago || 'Efectivo',
        fecha_pago: p.fecha_pago || p.created_at,
        created_at: p.created_at
    }))
}

/**
 * Obtener datos extendidos del cliente para perfil 360
 * Incluye: datos personales, referencia, resumen financiero, stats
 */
export async function getClienteExtended(clienteId: string) {
    const supabase = await createClient()

    // 1. Datos base del cliente con referencia
    const { data: cliente, error } = await supabase
        .from('clientes_completo')
        .select('*')
        .eq('id', clienteId)
        .single()

    if (error || !cliente) {
        return null
    }

    // 2. Estadísticas de créditos
    const { data: creditos } = await supabase
        .from('creditos')
        .select('id, estado, monto_prestado, saldo_pendiente, fecha_vencimiento, estado_detallado')
        .eq('cliente_id', clienteId)

    const creditosData = creditos || []
    const totalCreditos = creditosData.length
    const creditosPagados = creditosData.filter(c =>
        c.estado === 'cancelado' || c.estado_detallado === 'cancelado'
    ).length
    const creditosActivos = creditosData.filter(c =>
        ['vigente', 'pendiente', 'por_vencer', 'vencido', 'en_mora'].includes(c.estado_detallado || '')
    ).length
    const creditosVencidos = creditosData.filter(c =>
        c.estado_detallado === 'vencido' || c.estado_detallado === 'en_mora'
    ).length

    const totalPrestado = creditosData.reduce((sum, c) => sum + Number(c.monto_prestado || 0), 0)
    const deudaActual = creditosData
        .filter(c => ['vigente', 'pendiente', 'por_vencer', 'vencido', 'en_mora'].includes(c.estado_detallado || ''))
        .reduce((sum, c) => sum + Number(c.saldo_pendiente || 0), 0)

    // 3. Contar pagos totales
    const creditoIds = creditosData.map(c => c.id)
    let totalPagos = 0
    let montoTotalPagado = 0

    if (creditoIds.length > 0) {
        const { data: pagos } = await supabase
            .from('pagos')
            .select('monto_total')
            .in('credito_id', creditoIds)
            .eq('anulado', false)

        totalPagos = pagos?.length || 0
        montoTotalPagado = (pagos || []).reduce((sum, p) => sum + Number(p.monto_total || 0), 0)
    }

    // 4. Próximo vencimiento
    const creditosVigentes = creditosData.filter(c =>
        ['vigente', 'por_vencer', 'vencido'].includes(c.estado_detallado || '')
    )
    const proximoVencimiento = creditosVigentes
        .map(c => c.fecha_vencimiento)
        .filter(Boolean)
        .sort()[0] || null

    let diasParaVencimiento: number | null = null
    if (proximoVencimiento) {
        const hoy = new Date()
        const venc = new Date(proximoVencimiento)
        diasParaVencimiento = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    }

    // 5. Determinar estado de riesgo
    let estadoRiesgo: 'critico' | 'alerta' | 'normal' | 'sin_deuda' = 'sin_deuda'
    if (creditosVencidos > 0) {
        estadoRiesgo = 'critico'
    } else if (diasParaVencimiento !== null && diasParaVencimiento <= 7 && diasParaVencimiento >= 0) {
        estadoRiesgo = 'alerta'
    } else if (creditosActivos > 0) {
        estadoRiesgo = 'normal'
    }

    return {
        // Datos personales
        id: cliente.id,
        party_id: cliente.party_id ?? cliente.persona_id,
        nombres: cliente.nombres,
        apellido_paterno: cliente.apellido_paterno,
        apellido_materno: cliente.apellido_materno,
        nombre_completo: cliente.nombre_completo,
        tipo_documento: cliente.tipo_documento,
        numero_documento: cliente.numero_documento,
        telefono_principal: cliente.telefono_principal,
        email: cliente.email,
        direccion: cliente.direccion,
        activo: cliente.activo,
        created_at: cliente.created_at,
        score_crediticio: cliente.score_crediticio,

        // Datos de referencia/emergencia
        telefono_secundario: cliente.telefono_secundario,
        parentesco_referencia: cliente.parentesco_referencia,

        // Estadísticas
        stats: {
            totalCreditos,
            creditosPagados,
            creditosActivos,
            creditosVencidos,
            totalPrestado,
            deudaActual,
            totalPagos,
            montoTotalPagado
        },

        // Estado actual
        proximoVencimiento,
        diasParaVencimiento,
        estadoRiesgo
    }
}

/**
 * Actualizar datos de un cliente
 */
export async function actualizarCliente(clienteId: string, personaId: string, datos: {
    nombres?: string
    apellido_paterno?: string
    apellido_materno?: string
    telefono_principal?: string
    telefono_secundario?: string
    parentesco_referencia?: string
    email?: string
    direccion?: string
}) {
    const supabase = await createClient()

    // Actualizar persona (los datos personales están en tabla personas)
    const { error } = await supabase
        .from('personas')
        .update({
            nombres: datos.nombres,
            apellido_paterno: datos.apellido_paterno,
            apellido_materno: datos.apellido_materno,
            telefono_principal: datos.telefono_principal,
            telefono_secundario: datos.telefono_secundario,
            parentesco_referencia: datos.parentesco_referencia,
            email: datos.email,
            direccion: datos.direccion
        })
        .eq('id', personaId)

    if (error) {
        console.error('[actualizarCliente] Error:', error)
        throw error
    }

    return { success: true, message: 'Cliente actualizado correctamente' }
}
