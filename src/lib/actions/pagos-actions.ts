'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ContratoParaPago = {
    id: string
    codigo: string
    cliente: {
        nombre: string
        documento: string
    }
    garantia?: string  // Descripción del bien empeñado
    monto_prestado: number
    saldo_pendiente: number
    tasa_interes: number
    fecha_vencimiento: string
    interes_acumulado: number
    dias_mora: number
    mora_pendiente: number
}

export async function buscarContratoPorCodigo(codigo: string): Promise<ContratoParaPago | null> {
    const supabase = await createClient()

    const { data: credito, error } = await supabase
        .from('creditos')
        .select(`
      id,
      codigo_credito,
      monto_prestado,
      saldo_pendiente,
      tasa_interes,
      fecha_vencimiento,
      interes_acumulado,
      estado,
      estado_detallado,
      cliente:clientes(nombres, apellido_paterno, numero_documento)
    `)
        .eq('codigo_credito', codigo.toUpperCase())
        .in('estado', ['vigente', 'pendiente'])
        .single()

    if (error || !credito) return null

    // Handle cliente data (might be array from join)
    const clienteData = Array.isArray(credito.cliente) ? credito.cliente[0] : credito.cliente

    // Calcular mora con período de gracia y tasa unificada
    const PERIODO_GRACIA_DIAS = 3      // 3 días sin mora
    const TASA_MORA_DIARIA = 0.003     // 0.3% diario (unificado con RPC)
    const TOPE_MORA_MENSUAL = 0.10     // Máximo 10% mensual

    const hoy = new Date()
    const vencimiento = new Date(credito.fecha_vencimiento)
    const diasVencido = Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24))

    // Solo aplica mora después del período de gracia
    const diasMoraEfectivos = Math.max(0, diasVencido - PERIODO_GRACIA_DIAS)

    // Calcular mora con tope mensual
    const moraSinTope = credito.saldo_pendiente * TASA_MORA_DIARIA * diasMoraEfectivos
    const moraMensualMaxima = credito.saldo_pendiente * TOPE_MORA_MENSUAL
    const moraPendiente = Math.min(moraSinTope, moraMensualMaxima)

    return {
        id: credito.id,
        codigo: credito.codigo_credito,
        cliente: {
            nombre: `${clienteData.nombres} ${clienteData.apellido_paterno}`,
            documento: clienteData.numero_documento
        },
        monto_prestado: credito.monto_prestado,
        saldo_pendiente: credito.saldo_pendiente,
        tasa_interes: credito.tasa_interes,
        fecha_vencimiento: credito.fecha_vencimiento,
        interes_acumulado: credito.interes_acumulado,
        dias_mora: diasMoraEfectivos,
        mora_pendiente: moraPendiente
    }
}

// Tipo para cliente en búsqueda
export type ClienteBusqueda = {
    id: string
    nombre: string
    documento: string
    contratosVigentes: number
}

/**
 * Buscar clientes por DNI o nombre
 * Retorna lista de clientes con cantidad de contratos vigentes
 *
 * OPTIMIZADO: Una sola query con conteo incluido (antes hacía N+1 queries)
 */
export async function buscarClientes(query: string): Promise<ClienteBusqueda[]> {
    const supabase = await createClient()

    const searchTerm = query.trim()
    if (!searchTerm) return []

    // Determinar si es búsqueda por DNI (solo números) o por nombre
    const isDNI = /^\d+$/.test(searchTerm)

    // Una sola query: clientes + conteo de créditos vigentes usando RPC
    const { data, error } = await supabase.rpc('buscar_clientes_con_creditos', {
        p_search_term: searchTerm,
        p_is_dni: isDNI,
        p_limit: 15
    })

    if (error) {
        // Fallback a método simple si el RPC no existe aún
        console.error('Error en RPC buscar_clientes_con_creditos:', error.message)
        return buscarClientesFallback(supabase, searchTerm, isDNI)
    }

    if (!data?.length) return []

    type ClienteRow = {
        id: string
        nombres: string
        apellido_paterno: string
        apellido_materno: string | null
        numero_documento: string
        contratos_vigentes: number
    }

    // Mapear resultado del RPC al tipo esperado
    const clientesConContratos: ClienteBusqueda[] = (data as unknown as ClienteRow[]).map((row) => ({
        id: row.id,
        nombre: `${row.nombres} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
        documento: row.numero_documento,
        contratosVigentes: row.contratos_vigentes || 0
    }))

    // Ordenar: primero los que tienen contratos vigentes
    return clientesConContratos.sort((a, b) => b.contratosVigentes - a.contratosVigentes)
}

/**
 * Fallback si el RPC no está disponible (migración pendiente)
 * Usa una sola query con subquery para el conteo
 */
async function buscarClientesFallback(
    supabase: Awaited<ReturnType<typeof createClient>>,
    searchTerm: string,
    isDNI: boolean
): Promise<ClienteBusqueda[]> {
    let clientesQuery = supabase
        .from('clientes')
        .select(`
            id,
            nombres,
            apellido_paterno,
            apellido_materno,
            numero_documento,
            creditos!left(id, estado)
        `)

    if (isDNI) {
        clientesQuery = clientesQuery.ilike('numero_documento', `%${searchTerm}%`)
    } else {
        clientesQuery = clientesQuery.or(`nombres.ilike.%${searchTerm}%,apellido_paterno.ilike.%${searchTerm}%,apellido_materno.ilike.%${searchTerm}%`)
    }

    const { data: clientes, error } = await clientesQuery.limit(15)

    if (error || !clientes?.length) return []

    // Contar créditos vigentes del JOIN (ahora es cálculo local, no N queries)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientesConContratos: ClienteBusqueda[] = clientes.map((cliente: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const creditosVigentes = (cliente.creditos || []).filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (c: any) => c.estado === 'vigente' || c.estado === 'pendiente'
        ).length

        return {
            id: cliente.id,
            nombre: `${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno || ''}`.trim(),
            documento: cliente.numero_documento,
            contratosVigentes: creditosVigentes
        }
    })

    return clientesConContratos.sort((a, b) => b.contratosVigentes - a.contratosVigentes)
}

/**
 * Buscar contratos vigentes de un cliente específico por ID
 */
export async function buscarContratosPorClienteId(clienteId: string): Promise<ContratoParaPago[]> {
    const supabase = await createClient()

    // Obtener datos del cliente
    const { data: cliente } = await supabase
        .from('clientes')
        .select('id, nombres, apellido_paterno, apellido_materno, numero_documento')
        .eq('id', clienteId)
        .single()

    if (!cliente) return []

    // Obtener créditos vigentes Y pendientes de desembolso
    const queryBuilder = supabase
        .from('creditos')
        .select(`
            id,
            codigo_credito,
            monto_prestado,
            saldo_pendiente,
            tasa_interes,
            fecha_vencimiento,
            interes_acumulado,
            estado,
            estado_detallado,
            garantias:garantias!creditos_garantia_id_fkey(descripcion, subcategoria)
        `)
        .eq('cliente_id', clienteId)
        .in('estado', ['vigente', 'pendiente', 'vencido', 'en_mora', 'renovado', 'por_vencer'])
        .order('fecha_vencimiento', { ascending: true })

    const { data: creditos, error } = await queryBuilder

    if (error || !creditos?.length) return []

    const hoy = new Date()
    const PERIODO_GRACIA_DIAS = 3
    const TASA_MORA_DIARIA = 0.003
    const TOPE_MORA_MENSUAL = 0.10

    return creditos.map(credito => {
        const vencimiento = new Date(credito.fecha_vencimiento)
        const diasVencido = Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24))
        const diasMoraEfectivos = Math.max(0, diasVencido - PERIODO_GRACIA_DIAS)
        const moraSinTope = credito.saldo_pendiente * TASA_MORA_DIARIA * diasMoraEfectivos
        const moraMensualMaxima = credito.saldo_pendiente * TOPE_MORA_MENSUAL
        const moraPendiente = Math.min(moraSinTope, moraMensualMaxima)

        const garantia = Array.isArray(credito.garantias) ? credito.garantias[0] : credito.garantias

        return {
            id: credito.id,
            codigo: credito.codigo_credito,
            cliente: {
                nombre: `${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno || ''}`.trim(),
                documento: cliente.numero_documento
            },
            garantia: garantia?.descripcion || garantia?.subcategoria || 'Sin descripción',
            monto_prestado: credito.monto_prestado,
            saldo_pendiente: credito.saldo_pendiente,
            tasa_interes: credito.tasa_interes,
            fecha_vencimiento: credito.fecha_vencimiento,
            interes_acumulado: credito.interes_acumulado,
            dias_mora: diasMoraEfectivos,
            mora_pendiente: moraPendiente
        }
    })
}

/**
 * Buscar contratos por DNI o nombre del cliente
 * Búsqueda inteligente: si es numérico busca por DNI, sino por nombre
 */
export async function buscarContratosPorCliente(query: string): Promise<ContratoParaPago[]> {
    const supabase = await createClient()

    const searchTerm = query.trim()
    if (!searchTerm) return []

    // Determinar si es búsqueda por DNI (solo números) o por nombre
    const isDNI = /^\d+$/.test(searchTerm)

    let clientesQuery = supabase
        .from('clientes')
        .select('id, nombres, apellido_paterno, apellido_materno, numero_documento')

    if (isDNI) {
        clientesQuery = clientesQuery.ilike('numero_documento', `%${searchTerm}%`)
    } else {
        // Buscar en nombres o apellidos
        clientesQuery = clientesQuery.or(`nombres.ilike.%${searchTerm}%,apellido_paterno.ilike.%${searchTerm}%,apellido_materno.ilike.%${searchTerm}%`)
    }

    const { data: clientes, error: errorClientes } = await clientesQuery.limit(10)

    if (errorClientes || !clientes?.length) return []

    // Obtener créditos vigentes de estos clientes
    const clienteIds = clientes.map(c => c.id)

    const { data: creditos, error: errorCreditos } = await supabase
        .from('creditos')
        .select(`
            id,
            codigo_credito,
            monto_prestado,
            saldo_pendiente,
            tasa_interes,
            fecha_vencimiento,
            interes_acumulado,
            estado,
            estado_detallado,
            cliente_id,
            garantias:garantias!creditos_garantia_id_fkey(descripcion, subcategoria)
        `)
        .in('cliente_id', clienteIds)
        .in('estado', ['vigente', 'pendiente'])
        .order('fecha_vencimiento', { ascending: true })

    if (errorCreditos || !creditos?.length) return []

    // Combinar datos
    const hoy = new Date()
    const PERIODO_GRACIA_DIAS = 3
    const TASA_MORA_DIARIA = 0.003
    const TOPE_MORA_MENSUAL = 0.10

    return creditos.map(credito => {
        const cliente = clientes.find(c => c.id === credito.cliente_id)!
        const vencimiento = new Date(credito.fecha_vencimiento)
        const diasVencido = Math.floor((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24))
        const diasMoraEfectivos = Math.max(0, diasVencido - PERIODO_GRACIA_DIAS)
        const moraSinTope = credito.saldo_pendiente * TASA_MORA_DIARIA * diasMoraEfectivos
        const moraMensualMaxima = credito.saldo_pendiente * TOPE_MORA_MENSUAL
        const moraPendiente = Math.min(moraSinTope, moraMensualMaxima)

        // Get garantia description
        const garantia = Array.isArray(credito.garantias) ? credito.garantias[0] : credito.garantias

        return {
            id: credito.id,
            codigo: credito.codigo_credito,
            cliente: {
                nombre: `${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno || ''}`.trim(),
                documento: cliente.numero_documento
            },
            garantia: garantia?.descripcion || garantia?.subcategoria || 'Sin descripción',
            monto_prestado: credito.monto_prestado,
            saldo_pendiente: credito.saldo_pendiente,
            tasa_interes: credito.tasa_interes,
            fecha_vencimiento: credito.fecha_vencimiento,
            interes_acumulado: credito.interes_acumulado,
            dias_mora: diasMoraEfectivos,
            mora_pendiente: moraPendiente
        }
    })
}

/**
 * Agregar un mes calendario a una fecha (maneja Feb, meses cortos, etc.)
 * Ejemplos:
 * - 31 Ene + 1 mes = 28/29 Feb
 * - 31 Mar + 1 mes = 30 Abr
 * - 28 Feb + 1 mes = 28 Mar
 */
function agregarUnMes(fecha: Date): Date {
    const resultado = new Date(fecha)
    const diaOriginal = resultado.getDate()

    // Avanzar al mes siguiente
    resultado.setMonth(resultado.getMonth() + 1)

    // Si el día cambió, significa que el mes siguiente tiene menos días
    // Ejemplo: 31 Ene → 3 Mar (porque Feb no tiene día 31)
    // En ese caso, retroceder al último día del mes correcto
    if (resultado.getDate() !== diaOriginal) {
        resultado.setDate(0) // Último día del mes anterior
    }

    return resultado
}

/**
 * Renovar contrato: Paga interés + mora y extiende 1 mes calendario
 */
export async function renovarContratoAction({
    creditoId,
    cajaId,
    montoPagado
}: {
    creditoId: string
    cajaId: string
    montoPagado: number
}): Promise<{ success: boolean; error?: string; mensaje?: string; nuevaFecha?: string }> {
    const supabase = await createClient()

    // 1. Obtener crédito actual
    const { data: credito, error: errorCredito } = await supabase
        .from('creditos')
        .select('id, codigo_credito, fecha_vencimiento, saldo_pendiente, tasa_interes, interes_acumulado')
        .eq('id', creditoId)
        .single()

    if (errorCredito || !credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    // 1.5 Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // 2. Registrar el pago de interés
    const { error: errorPago } = await supabase.rpc('registrar_pago_oficial', {
        p_caja_id: cajaId,
        p_credito_id: creditoId,
        p_monto_pago: montoPagado,
        p_tipo_operacion: 'RENOVACION',
        p_metodo_pago: 'EFECTIVO',
        p_metadata: { tipo: 'renovacion_mensual' },
        p_usuario_id: user.id
    })

    if (errorPago) {
        console.error('Error registrando pago de renovación:', errorPago)
        return { success: false, error: errorPago.message }
    }

    // 3. Calcular nueva fecha de vencimiento (1 mes calendario)
    const fechaActual = new Date(credito.fecha_vencimiento)
    const nuevaFecha = agregarUnMes(fechaActual)

    // 4. Actualizar crédito con nueva fecha y resetear interés acumulado
    const nuevoInteres = credito.saldo_pendiente * (credito.tasa_interes / 100)

    const { error: errorUpdate } = await supabase
        .from('creditos')
        .update({
            fecha_vencimiento: nuevaFecha.toISOString().split('T')[0],
            interes_acumulado: nuevoInteres, // Interés del nuevo período
            observaciones: `Renovado el ${new Date().toLocaleDateString('es-PE')} - Nuevo vencimiento: ${nuevaFecha.toLocaleDateString('es-PE')}`
        })
        .eq('id', creditoId)

    if (errorUpdate) {
        return { success: false, error: 'Error al actualizar fecha de vencimiento' }
    }

    revalidatePath('/dashboard/pagos')
    revalidatePath('/dashboard/contratos')
    revalidatePath('/dashboard/vencimientos')
    revalidatePath('/dashboard/caja')

    return {
        success: true,
        mensaje: `Contrato renovado. Nuevo vencimiento: ${nuevaFecha.toLocaleDateString('es-PE')}`,
        nuevaFecha: nuevaFecha.toISOString()
    }
}

export async function registrarPago({
    creditoId,
    tipoPago,
    montoPagado,
    cajaOperativaId,
    metodoPago = 'efectivo',
    metadata = {}
}: {
    creditoId: string
    tipoPago: 'interes' | 'desempeno'
    montoPagado: number
    cajaOperativaId: string
    metodoPago?: string
    metadata?: Record<string, unknown>
}) {
    try {
        const supabase = await createClient()

        // Mapear tipoPago a tipo esperado por RPC
        const tipoOperacion = tipoPago === 'desempeno' ? 'DESEMPENO' : 'RENOVACION'

        // 1. Validar sesión
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Usuario no autenticado' }
        }

        // PRODUCCIÓN: Usar RPC atómica que maneja todo en una transacción
        const { data, error } = await supabase.rpc('registrar_pago_oficial', {
            p_caja_id: cajaOperativaId,
            p_credito_id: creditoId,
            p_monto_pago: montoPagado,
            p_tipo_operacion: tipoOperacion,
            p_metodo_pago: metodoPago.toUpperCase(),
            p_metadata: metadata,
            p_usuario_id: user.id
        })

        if (error) {
            console.error('Error registrando pago:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/pagos')
        revalidatePath('/dashboard/inventario')
        revalidatePath('/dashboard/caja')

        return {
            success: true,
            mensaje: data?.mensaje || 'Pago registrado exitosamente',
            nuevoSaldoCaja: data?.nuevo_saldo_caja
        }
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Error crítico en registrarPago:', error);

        // Auth check fallback (simulated)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al procesar pago'
        };
    }
}

/**
 * Condonar mora de un crédito (perdonar deuda de mora)
 * Uso: Retención de clientes, situaciones especiales, errores del sistema
 */
export async function condonarMora({
    creditoId,
    motivo,
    montoCondonado
}: {
    creditoId: string
    motivo: string
    montoCondonado: number
}) {
    const supabase = await createClient()

    // Obtener usuario actual para auditoría
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // Obtener crédito actual
    const { data: credito, error: errorCredito } = await supabase
        .from('creditos')
        .select('id, codigo_credito, saldo_pendiente, cliente_id')
        .eq('id', creditoId)
        .single()

    if (errorCredito || !credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    // Registrar la condonación como un movimiento/nota
    // Nota: Esto se puede hacer como un registro en una tabla de auditoría
    // Por ahora usamos la tabla de pagos con tipo especial
    const { error: errorRegistro } = await supabase
        .from('pagos')
        .insert({
            credito_id: creditoId,
            monto: 0, // No hay pago real
            tipo: 'CONDONACION_MORA',
            metodo_pago: 'CONDONACION',
            observaciones: `MORA CONDONADA: S/${montoCondonado.toFixed(2)} - Motivo: ${motivo}`,
            usuario_id: user.id
        })

    if (errorRegistro) {
        console.error('Error registrando condonación:', errorRegistro)
        // Intentar registrar en otra forma si la tabla pagos no acepta el tipo
    }

    // Actualizar el saldo del crédito restando la mora condonada
    const nuevoSaldo = Math.max(0, credito.saldo_pendiente - montoCondonado)

    const { error: errorUpdate } = await supabase
        .from('creditos')
        .update({
            saldo_pendiente: nuevoSaldo,
            observaciones: `Mora condonada S/${montoCondonado.toFixed(2)} el ${new Date().toLocaleDateString('es-PE')} - ${motivo}`
        })
        .eq('id', creditoId)

    if (errorUpdate) {
        console.error('Error actualizando crédito:', errorUpdate)
        return { success: false, error: 'Error al actualizar el crédito' }
    }

    revalidatePath('/dashboard/pagos')
    revalidatePath('/dashboard/contratos')
    revalidatePath('/dashboard/vencimientos')

    return {
        success: true,
        mensaje: `Mora de S/${montoCondonado.toFixed(2)} condonada exitosamente`,
        nuevoSaldo
    }
}

/**
 * Extender período de gracia (dar más días sin mora)
 */
export async function extenderVencimiento({
    creditoId,
    diasExtension,
    motivo
}: {
    creditoId: string
    diasExtension: number
    motivo: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // Obtener crédito actual
    const { data: credito } = await supabase
        .from('creditos')
        .select('fecha_vencimiento')
        .eq('id', creditoId)
        .single()

    if (!credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    // Calcular nueva fecha
    const fechaActual = new Date(credito.fecha_vencimiento)
    fechaActual.setDate(fechaActual.getDate() + diasExtension)

    const { error } = await supabase
        .from('creditos')
        .update({
            fecha_vencimiento: fechaActual.toISOString(),
            observaciones: `Extensión de ${diasExtension} días el ${new Date().toLocaleDateString('es-PE')} - ${motivo}`
        })
        .eq('id', creditoId)

    if (error) {
        return { success: false, error: 'Error al extender vencimiento' }
    }

    revalidatePath('/dashboard/vencimientos')
    revalidatePath('/dashboard/contratos')

    return {
        success: true,
        mensaje: `Vencimiento extendido ${diasExtension} días`,
        nuevaFecha: fechaActual.toISOString()
    }
}
