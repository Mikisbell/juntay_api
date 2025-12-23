'use server'

import { createClient } from '@/lib/supabase/server'

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
    const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert({
            party_id: partyId,
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
    ordenarPor?: string,  // 'prioridad' | 'nombre' | 'deuda' | 'vencimiento' | 'estado'
    direccion?: 'asc' | 'desc'
}) {
    const supabase = await createClient()
    const page = filtros?.page || 1
    const pageSize = filtros?.pageSize || 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const ordenarPor = filtros?.ordenarPor || 'prioridad'
    const direccion = filtros?.direccion || 'asc'

    // 1. Query Base para Contar Total (sin paginación, pero con filtros de búsqueda si aplica)
    // NOTA: Para KPIs globales necesitamos TODOS los activos.
    // Para la tabla necesitamos PAGINADOS.
    // Estrategia:
    // A. Traer todos los activos para KPIs (costoso pero necesario para "Monto Total en Riesgo" global).
    // B. O traer solo los de la página.
    // Dado que el Dashboard Táctico muestra TOTALES DE CARTERA, necesitamos procesar todos los activos para los KPIs Cards,
    // pero solo devolver los registros de la página actual para la tabla.

    // Paso A: Obtener datos de TODOS los clientes (activos e inactivos) para KPIs Dashboard
    // IMPORTANTE: No filtramos por activo aquí para poder contar suspendidos y mostrarlos si se filtra
    const { data: todosClientesBase, error } = await supabase
        .from('clientes_completo')
        .select('id, nombre_completo, numero_documento, telefono_principal, nombres, activo')
        .order('created_at', { ascending: false })

    if (error) throw error

    // Contar clientes suspendidos (activo = false)
    const clientesSuspendidos = todosClientesBase.filter(c => !c.activo).length
    // Para KPIs, solo contamos activos como "cartera total"
    const clientesActivos = todosClientesBase.filter(c => c.activo)

    // 2. Obtener TODA la deuda vigente (Optimizado: Solo columnas de cálculo)
    const { data: creditosActivos } = await supabase
        .from('creditos')
        .select('cliente_id, saldo_pendiente, fecha_vencimiento, estado_detallado')
        .in('estado_detallado', ['vigente', 'por_vencer', 'vencido', 'en_mora'])

    // Estructuras de KPIs Globales
    const mapaDeuda = new Map<string, number>()
    const mapaVencimiento = new Map<string, string>()
    const mapaRiesgo = new Map<string, 'critico' | 'alerta' | 'normal'>()

    // Acumuladores KPI Dashboard (Globales)
    let clientesCriticos = 0
    let montoCritico = 0
    let vencimientosSemana = 0
    let montoPorVencer = 0

    const hoy = new Date()
    const en7dias = new Date()
    en7dias.setDate(hoy.getDate() + 7)

    // Agrupar créditos y calcular KPIs
    if (creditosActivos) {
        const creditosPorCliente = new Map<string, typeof creditosActivos>()
        creditosActivos.forEach(c => {
            const list = creditosPorCliente.get(c.cliente_id) || []
            list.push(c)
            creditosPorCliente.set(c.cliente_id, list)
        })

        creditosPorCliente.forEach((listaCreditos, clienteId) => {
            // IMPORTANTE: Solo contar en KPIs si el cliente está activo
            const clienteData = todosClientesBase.find(c => c.id === clienteId)
            const clienteActivo = clienteData?.activo ?? true

            let totalDeuda = 0
            let peorVencimiento: string | null = null
            let esCritico = false
            let esAlerta = false

            listaCreditos.forEach(c => {
                totalDeuda += Number(c.saldo_pendiente)
                // Vencimiento
                if (!peorVencimiento || new Date(c.fecha_vencimiento) < new Date(peorVencimiento)) {
                    peorVencimiento = c.fecha_vencimiento
                }
                // Estados
                if (['vencido', 'en_mora'].includes(c.estado_detallado)) esCritico = true
                if (new Date(c.fecha_vencimiento) <= en7dias && c.estado_detallado === 'vigente') esAlerta = true
            })

            mapaDeuda.set(clienteId, totalDeuda)
            if (peorVencimiento) mapaVencimiento.set(clienteId, peorVencimiento)

            if (esCritico) {
                mapaRiesgo.set(clienteId, 'critico')
                // Solo contar en KPIs si cliente está activo
                if (clienteActivo) {
                    clientesCriticos++
                    montoCritico += totalDeuda
                }
            } else if (esAlerta || (peorVencimiento && new Date(peorVencimiento!) <= en7dias)) {
                mapaRiesgo.set(clienteId, 'alerta')
                // Solo contar en KPIs si cliente está activo
                if (clienteActivo) {
                    vencimientosSemana++
                    montoPorVencer += totalDeuda
                }
            } else {
                mapaRiesgo.set(clienteId, 'normal')
            }
        })
    }

    // 3. Filtrado en Memoria (Búsqueda y Estado) sobre el universo total
    // Se hace en memoria porque los KPIs de riesgo son calculados, no están en BD base.
    let clientesFiltrados = todosClientesBase.map(c => ({
        ...c,
        deuda_total: mapaDeuda.get(c.id) || 0,
        proximo_vencimiento: mapaVencimiento.get(c.id) || null,
        riesgo_calculado: mapaRiesgo.get(c.id) || 'normal'
    }))

    // Filtros de búsqueda
    if (filtros?.busqueda) {
        const q = filtros.busqueda.toLowerCase()
        clientesFiltrados = clientesFiltrados.filter(c =>
            c.nombre_completo?.toLowerCase().includes(q) ||
            c.numero_documento?.includes(q) ||
            c.telefono_principal?.includes(q) ||
            c.nombres?.toLowerCase().includes(q)
        )
    }

    // Filtros de estado
    if (filtros?.estado) {
        if (filtros.estado === 'critico') {
            clientesFiltrados = clientesFiltrados.filter(c => c.riesgo_calculado === 'critico' && c.activo)
        } else if (filtros.estado === 'alerta') {
            clientesFiltrados = clientesFiltrados.filter(c => c.riesgo_calculado === 'alerta' && c.activo)
        } else if (filtros.estado === 'suspendido') {
            // NUEVO: Filtrar solo clientes suspendidos (activo = false)
            clientesFiltrados = clientesFiltrados.filter(c => !c.activo)
        } else if (filtros.estado === 'todos' || !filtros.estado) {
            // Por defecto mostrar solo activos
            clientesFiltrados = clientesFiltrados.filter(c => c.activo)
        }
    } else {
        // Sin filtro = mostrar solo activos
        clientesFiltrados = clientesFiltrados.filter(c => c.activo)
    }

    // 4. ORDENAMIENTO flexible basado en parámetros
    clientesFiltrados.sort((a, b) => {
        const dir = direccion === 'desc' ? -1 : 1

        switch (ordenarPor) {
            case 'nombre':
                const nombreA = a.nombre_completo?.toLowerCase() || ''
                const nombreB = b.nombre_completo?.toLowerCase() || ''
                return nombreA.localeCompare(nombreB) * dir

            case 'deuda':
                return ((a.deuda_total || 0) - (b.deuda_total || 0)) * dir

            case 'vencimiento':
                if (!a.proximo_vencimiento && !b.proximo_vencimiento) return 0
                if (!a.proximo_vencimiento) return 1 * dir
                if (!b.proximo_vencimiento) return -1 * dir
                return (new Date(a.proximo_vencimiento).getTime() - new Date(b.proximo_vencimiento).getTime()) * dir

            case 'estado':
                const estadoPrioridad = { 'critico': 0, 'alerta': 1, 'normal': 2 }
                const prioA = estadoPrioridad[a.riesgo_calculado] ?? 2
                const prioB = estadoPrioridad[b.riesgo_calculado] ?? 2
                return (prioA - prioB) * dir

            case 'prioridad':
            default:
                // Ordenamiento por prioridad de negocio (Críticos primero, Sin Créditos al final)
                const riesgoPrioridad = { 'critico': 0, 'alerta': 1, 'normal': 2 }
                const prioridadA = riesgoPrioridad[a.riesgo_calculado] ?? 2
                const prioridadB = riesgoPrioridad[b.riesgo_calculado] ?? 2
                if (prioridadA !== prioridadB) return (prioridadA - prioridadB) * dir

                // Los que tienen deuda antes que los sin deuda
                const tieneDeudaA = a.deuda_total > 0 ? 0 : 1
                const tieneDeudaB = b.deuda_total > 0 ? 0 : 1
                if (tieneDeudaA !== tieneDeudaB) return (tieneDeudaA - tieneDeudaB) * dir

                // Por vencimiento más próximo
                if (a.proximo_vencimiento && b.proximo_vencimiento) {
                    return (new Date(a.proximo_vencimiento).getTime() - new Date(b.proximo_vencimiento).getTime()) * dir
                }
                if (a.proximo_vencimiento) return -1 * dir
                if (b.proximo_vencimiento) return 1 * dir
                return 0
        }
    })

    // 5. Paginación
    const totalRecords = clientesFiltrados.length
    const totalPages = Math.ceil(totalRecords / pageSize)
    const clientesPaginados = clientesFiltrados.slice(from, to + 1) // slice end is exclusive, so to + 1

    // Recuperar datos completos solo para la página actual (Optimización final)
    // No necesitamos re-leer de BD porque clients_completo ya tiene casi todo,
    // pero si faltaran campos específicos, se haría un fetch aquí por IDs.
    // Como `todosClientesBase` ya tenía lo básico, y calculamos lo financiero,
    // solo nos falta, por ejemplo, `apellido_paterno` si no vino en el select inicial.
    // Para simplificar y asegurar datos, haremos un mapeo final enriquecido o asumimos `clientes_completo` tiene todo.
    // En el paso 1 pedimos select('*') en la version anterior. Ahora pedí select reducido.
    // CORRECCIÓN: Pedir todo en paso 1 es más simple si no son millones. Con 100-5000 registros es OK.
    // Revertimos a select('*') en paso 1 para simplificar, o hacemos fetch por IDs de la página.
    // Haremos fetch por IDs para ser puristas en performance si crece mucho.

    const idsPagina = clientesPaginados.map(c => c.id)
    const { data: detallesFinal } = await supabase
        .from('clientes_completo')
        .select('*')
        .in('id', idsPagina)
        .order('created_at', { ascending: false })

    // Mezclar detalles con cálculos
    const dataFinal = detallesFinal?.map(d => {
        const calculado = clientesPaginados.find(p => p.id === d.id)
        return {
            ...d,
            deuda_total: calculado?.deuda_total || 0,
            proximo_vencimiento: calculado?.proximo_vencimiento || null,
            riesgo_calculado: calculado?.riesgo_calculado || 'normal'
        }
    }) || []

    // DEBUG: Verificar que activo está presente
    if (dataFinal.length > 0) {
        console.log('[DEBUG listarClientes] filtro:', filtros?.estado, 'activo del primero:', dataFinal[0].activo, 'nombre:', dataFinal[0].nombre_completo?.slice(0, 20))
    }

    return {
        meta: {
            totalClientes: clientesActivos.length, // Solo activos para KPI de cartera
            clientesCriticos,
            montoCritico,
            vencimientosSemana,
            montoPorVencer,
            clientesSuspendidos, // NUEVO: Conteo de suspendidos
            pagination: {
                page,
                pageSize,
                totalPages,
                totalRecords
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
