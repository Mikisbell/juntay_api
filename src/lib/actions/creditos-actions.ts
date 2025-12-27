'use server'

import { createClient } from '@/lib/supabase/server'
import { EstadoCredito, Credito, ResumenEstados } from '../types/credito'
import { verificarLimiteCreditos } from './limites-actions'

/**
 * Obtiene la tasa de interés por defecto de la empresa del usuario actual.
 * Retorna 20.00 si no hay empresa o no hay valor configurado.
 */
export async function obtenerTasaInteresDefault(): Promise<number> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 20.00

    // Get empresa_id from usuarios table
    const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!usuario?.empresa_id) return 20.00

    // Get tasa_interes_default from empresas
    const { data: empresa } = await supabase
        .from('empresas')
        .select('tasa_interes_default')
        .eq('id', usuario.empresa_id)
        .single()

    return empresa?.tasa_interes_default ?? 20.00
}

/**
 * Obtiene todos los créditos filtrados por estado
 */
export async function obtenerCreditosPorEstado(estado: EstadoCredito): Promise<Credito[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select(`
      *,
      clientes (
        nombres,
        numero_documento
      ),
      garantias (
        descripcion,
        valor_tasacion
      )
    `)
        .eq('estado_detallado', estado)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error obteniendo créditos por estado:', error)
        throw new Error('Error al obtener créditos')
    }

    return data as Credito[]
}

/**
 * Obtiene el conteo de créditos por cada estado
 */
export async function obtenerResumenEstados(): Promise<ResumenEstados> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select('estado_detallado')

    if (error) {
        console.error('Error obteniendo resumen de estados:', error)
        throw new Error('Error al obtener resumen')
    }

    // Inicializar conteos
    const resumen: ResumenEstados = {
        vigente: 0,
        al_dia: 0,
        por_vencer: 0,
        vencido: 0,
        en_mora: 0,
        en_gracia: 0,
        pre_remate: 0,
        en_remate: 0,
        cancelado: 0,
        renovado: 0,
        ejecutado: 0,
        anulado: 0,
        total: data.length
    }

    // Contar por estado
    data.forEach(credito => {
        const estado = credito.estado_detallado as keyof ResumenEstados
        if (estado in resumen) {
            resumen[estado]++
        }
    })

    return resumen
}

/**
 * Obtiene un crédito específico por ID
 */
export async function obtenerCreditoPorId(id: string): Promise<Credito | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select(`
      *,
      clientes (*),
      garantias (*),
      cajas_operativas (numero_caja)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error obteniendo crédito:', error)
        return null
    }

    return data as Credito
}

/**
 * Obtiene todos los créditos (con paginación opcional)
 */
export async function obtenerTodosCreditos(
    limit: number = 50,
    offset: number = 0
): Promise<Credito[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select(`
      *,
      clientes (
        nombres,
        numero_documento
      ),
      garantias (
        descripcion,
        valor_tasacion
      )
    `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error obteniendo créditos:', error)
        throw new Error('Error al obtener créditos')
    }

    return data as Credito[]
}

/**
 * Actualiza el estado de un crédito manualmente
 * (útil para casos especiales)
 */
export async function actualizarEstadoCredito(
    creditoId: string,
    nuevoEstado: EstadoCredito
): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('creditos')
        .update({ estado_detallado: nuevoEstado })
        .eq('id', creditoId)

    if (error) {
        console.error('Error actualizando estado:', error)
        return false
    }

    return true
}

/**
 * SMART POS: Crea un crédito con garantía usando RPC transaccional.
 * Incluye validaciones de límites y tasa variable.
 */
export async function crearCreditoExpress(payload: {
    clienteId: string
    descripcion: string
    montoPrestamo: number
    valorTasacion: number      // NUEVO: Valor real del bien
    tasaInteres: number        // NUEVO: Tasa mensual (antes hardcodeada)
    periodoDias?: number       // NUEVO: Período configurable (default 30)
    fotos: string[]
    fechaInicio?: string
    observaciones?: string
}) {
    const supabase = await createClient()

    // 1. Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    // 🆕 Verificar límites del plan (Créditos)
    const { permitido, mensaje } = await verificarLimiteCreditos()
    if (!permitido) {
        throw new Error(mensaje)
    }

    // 2. Verificar Caja Abierta del usuario
    const { data: caja } = await supabase.from('cajas_operativas')
        .select('id, saldo_actual')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single()

    // 3. Obtener datos del cliente para el contrato
    const { data: clienteData } = await supabase.from('clientes')
        .select('nombres, apellido_paterno, apellido_materno, numero_documento, direccion')
        .eq('id', payload.clienteId)
        .single()

    const clienteNombre = clienteData
        ? `${clienteData.nombres} ${clienteData.apellido_paterno} ${clienteData.apellido_materno || ''}`.trim()
        : 'Cliente'
    const clienteDocumento = clienteData?.numero_documento || ''
    const clienteDireccion = clienteData?.direccion || ''

    // 4. Validaciones del lado del servidor (defensa en profundidad)
    if (payload.montoPrestamo < 10) {
        throw new Error("El monto mínimo de préstamo es S/10")
    }
    if (payload.montoPrestamo > 50000) {
        throw new Error("El monto máximo de préstamo es S/50,000. Contacte a gerencia.")
    }
    // NOTA: No validamos préstamo <= tasación - el tasador experto decide
    if (payload.tasaInteres < 1 || payload.tasaInteres > 50) {
        throw new Error("La tasa de interés debe estar entre 1% y 50%")
    }

    // 5. Llamar al RPC transaccional
    const fechaInicio = payload.fechaInicio ? new Date(payload.fechaInicio) : new Date()
    const periodoDias = payload.periodoDias || 30

    const { data: result, error } = await supabase.rpc('crear_credito_completo', {
        p_cliente_id: payload.clienteId,
        p_monto_prestamo: payload.montoPrestamo,
        p_valor_tasacion: payload.valorTasacion,
        p_tasa_interes: payload.tasaInteres,
        p_periodo_dias: periodoDias,
        p_fecha_inicio: fechaInicio.toISOString(),
        p_descripcion_garantia: payload.descripcion,
        p_fotos: payload.fotos,
        p_observaciones: payload.observaciones || null,
        p_usuario_id: user.id,
        p_caja_id: caja?.id || null
    })

    if (error) {
        console.error("Error en RPC crear_credito_completo:", error)
        throw new Error(error.message || "Error al crear el crédito")
    }

    // 6. Enriquecer respuesta con datos del cliente para impresión
    return {
        ...result,
        cliente: clienteNombre,
        clienteNombre: clienteNombre,
        clienteDocumento: clienteDocumento,
        clienteDireccion: clienteDireccion,
        descripcion: payload.descripcion,
        garantiaDescripcion: payload.descripcion
    }
}

/**
 * Obtiene créditos aprobados pero no desembolsados (Cola de espera)
 */
export async function obtenerCreditosPendientesDesembolso() {
    const supabase = await createClient()

    // TODO: Filtrar por sucursal si aplica
    const { data } = await supabase.from('creditos')
        .select(`
            id, 
            codigo_credito,
            monto_prestado, 
            created_at,
            clientes (nombres, apellido_paterno),
            garantias (descripcion)
        `)
        .eq('estado_detallado', 'aprobado')
        .order('created_at', { ascending: true }) // FIFO

    return data || []
}

/**
 * Procesa el desembolso de un crédito que estaba en cola
 */
export async function desembolsarCreditoPendiente(creditoId: string, cajaId: string) {
    const supabase = await createClient()

    // 0. Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado")

    // 1. Obtener info crédito
    const { data: credito } = await supabase.from('creditos')
        .select('monto_prestado, codigo_credito')
        .eq('id', creditoId)
        .single()

    if (!credito) throw new Error("Crédito no encontrado")

    // 1.1 Obtener saldo actual de caja
    const { data: caja } = await supabase.from('cajas_operativas')
        .select('saldo_actual')
        .eq('id', cajaId)
        .single()

    if (!caja) throw new Error("Caja no encontrada")

    // 2. Registrar Egreso Caja
    const { error: errorMov } = await supabase.from('movimientos_caja_operativa')
        .insert({
            caja_operativa_id: cajaId,
            tipo: 'EGRESO',
            motivo: 'DESEMBOLSO_EMPENO',
            monto: credito.monto_prestado,
            referencia_id: creditoId,
            descripcion: `Desembolso Diferido #${credito.codigo_credito || creditoId.slice(0, 8)}`,
            usuario_id: user.id,
            saldo_anterior: caja.saldo_actual,
            saldo_nuevo: caja.saldo_actual - credito.monto_prestado
        })

    if (errorMov) throw new Error("Error registrando movimiento en caja")

    // 3. Actualizar estado crédito
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { error: _errorUpdate } = await supabase.from('creditos')
        .update({ estado_detallado: 'vigente' }) // Ya se desembolsó
        .eq('id', creditoId)

    return { success: true }
}

/**
 * Confirma el desembolso de un crédito (llamado desde el modal después de firmar documentos)
 */
export async function confirmarDesembolsoCredito(creditoId: string) {
    const supabase = await createClient()

    // 0. Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Usuario no autenticado" }

    // 1. Verificar que el crédito existe y está pendiente
    const { data: credito } = await supabase.from('creditos')
        .select('id, monto_prestado, codigo_credito, estado, estado_detallado')
        .eq('id', creditoId)
        .single()

    if (!credito) return { success: false, error: "Crédito no encontrado" }

    if (credito.estado === 'vigente' && credito.estado_detallado === 'vigente') {
        return { success: true, message: "El crédito ya fue desembolsado" }
    }

    // 2. Buscar caja abierta del usuario
    const { data: caja } = await supabase.from('cajas_operativas')
        .select('id, saldo_actual, estado')
        .eq('usuario_id', user.id)
        .eq('estado', 'abierta')
        .single()

    if (!caja) return { success: false, error: "No tienes una caja abierta. Abre tu caja primero." }

    // 3. Verificar saldo suficiente
    if (caja.saldo_actual < credito.monto_prestado) {
        return {
            success: false,
            error: `Saldo insuficiente. Caja: S/${caja.saldo_actual?.toFixed(2)}, Necesario: S/${credito.monto_prestado}`
        }
    }

    // 4. Registrar movimiento de egreso
    const { error: errorMov } = await supabase.from('movimientos_caja_operativa')
        .insert({
            caja_operativa_id: caja.id,
            tipo: 'EGRESO',
            motivo: 'DESEMBOLSO_EMPENO',
            monto: credito.monto_prestado,
            referencia_id: creditoId,
            descripcion: `Desembolso confirmado #${credito.codigo_credito}`,
            usuario_id: user.id,
            saldo_anterior: caja.saldo_actual,
            saldo_nuevo: caja.saldo_actual - credito.monto_prestado
        })

    if (errorMov) {
        console.error("Error en movimiento:", errorMov)
        return { success: false, error: "Error registrando movimiento de caja" }
    }

    // 5. Actualizar saldo de caja
    await supabase.from('cajas_operativas')
        .update({ saldo_actual: caja.saldo_actual - credito.monto_prestado })
        .eq('id', caja.id)

    // 6. Actualizar estado del crédito a vigente
    await supabase.from('creditos')
        .update({
            estado: 'vigente',
            estado_detallado: 'vigente',
            fecha_desembolso: new Date().toISOString()
        })
        .eq('id', creditoId)

    return {
        success: true,
        message: `Desembolso confirmado: S/${credito.monto_prestado}`
    }
}
