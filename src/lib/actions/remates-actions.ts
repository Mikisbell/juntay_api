'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Días mínimos de vencimiento antes de poder rematar (según Ley 28677)
const DIAS_MINIMOS_PARA_REMATE = 30

/**
 * Obtener prendas disponibles para remate
 * Solo prendas con créditos vencidos hace más de 30 días
 */
export async function obtenerPrendasParaRemate() {
    const supabase = await createClient()

    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - DIAS_MINIMOS_PARA_REMATE)

    const { data, error } = await supabase
        .from('garantias')
        .select(`
            id,
            descripcion,
            valor_tasacion,
            estado,
            fotos,
            credito:creditos(
                id,
                codigo_credito,
                monto_prestado,
                saldo_pendiente,
                interes_acumulado,
                fecha_vencimiento,
                estado,
                cliente:clientes(
                    id,
                    nombres,
                    apellido_paterno,
                    telefono_principal,
                    email
                )
            )
        `)
        .eq('estado', 'custodia_caja')
        .lt('creditos.fecha_vencimiento', fechaLimite.toISOString())
        .eq('creditos.estado', 'vigente')

    if (error) {
        console.error('Error obteniendo prendas para remate:', error)
        return []
    }

    return data?.map(item => {
        const credito = Array.isArray(item.credito) ? item.credito[0] : item.credito
        const clienteRaw = credito?.cliente
        const cliente = Array.isArray(clienteRaw) ? clienteRaw[0] : clienteRaw
        const diasVencido = credito?.fecha_vencimiento
            ? Math.floor((new Date().getTime() - new Date(credito.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24))
            : 0

        return {
            id: item.id,
            descripcion: item.descripcion,
            valorTasacion: item.valor_tasacion,
            fotos: item.fotos || [],
            creditoId: credito?.id,
            codigoCredito: credito?.codigo_credito,
            montoPrestado: credito?.monto_prestado,
            saldoPendiente: credito?.saldo_pendiente,
            diasVencido,
            cliente: cliente ? {
                id: cliente.id,
                nombre: `${cliente.nombres} ${cliente.apellido_paterno}`,
                telefono: cliente.telefono_principal,
                email: cliente.email
            } : null
        }
    }) || []
}

/**
 * Vender prenda en remate
 * Valida: estado, días vencidos, y calcula excedente
 * Si el cliente renunció expresamente, permite remate anticipado
 */
export async function venderPrenda({
    garantiaId,
    precioVenta,
    cajaOperativaId,
    renunciaCliente = false,
    motivoRenuncia
}: {
    garantiaId: string
    precioVenta: number
    cajaOperativaId: string
    renunciaCliente?: boolean  // Cliente indicó que no recuperará el bien
    motivoRenuncia?: string    // Descripción: llamada, mensaje WhatsApp, etc.
}) {
    const supabase = await createClient()

    // 1. Obtener usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // 2. Obtener datos de la garantía y crédito asociado
    const { data: garantia, error: garantiaError } = await supabase
        .from('garantias')
        .select(`
            *,
            credito:creditos(
                *,
                cliente:clientes(id, nombres, apellido_paterno, telefono_principal, email)
            )
        `)
        .eq('id', garantiaId)
        .single()

    if (garantiaError || !garantia) {
        return { success: false, error: 'Garantía no encontrada' }
    }

    const credito = Array.isArray(garantia.credito) ? garantia.credito[0] : garantia.credito
    const cliente = Array.isArray(credito?.cliente) ? credito?.cliente[0] : credito?.cliente

    // 3. VALIDACIÓN: Estado de garantía
    if (garantia.estado !== 'custodia_caja' && garantia.estado !== 'en_remate') {
        return {
            success: false,
            error: `La garantía no está disponible para remate (estado: ${garantia.estado})`
        }
    }

    // 4. VALIDACIÓN: Crédito vencido
    if (!credito || credito.estado !== 'vigente') {
        return {
            success: false,
            error: 'El crédito asociado no está vigente'
        }
    }

    // 5. VALIDACIÓN: Días mínimos de vencimiento (con excepción por renuncia)
    const fechaVencimiento = new Date(credito.fecha_vencimiento)
    const hoy = new Date()
    const diasVencido = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24))

    // Si el cliente NO renunció, validar los 30 días
    if (!renunciaCliente && diasVencido < DIAS_MINIMOS_PARA_REMATE) {
        return {
            success: false,
            error: `No se puede rematar. Faltan ${DIAS_MINIMOS_PARA_REMATE - diasVencido} días para cumplir el plazo legal (30 días post-vencimiento). Si el cliente renunció al bien, marca la opción 'Renuncia del cliente'.`,
            diasFaltantes: DIAS_MINIMOS_PARA_REMATE - diasVencido,
            requiereRenuncia: true
        }
    }

    // Si es renuncia, registrar en auditoría
    const esRemateAnticipado = diasVencido < DIAS_MINIMOS_PARA_REMATE && renunciaCliente

    // 6. Calcular excedente
    const totalAdeudado = credito.saldo_pendiente + (credito.interes_acumulado || 0)
    const excedente = Math.max(0, precioVenta - totalAdeudado)

    // 7. Marcar garantía como vendida
    const { error: errorGarantia } = await supabase
        .from('garantias')
        .update({
            estado: 'vendida',
            fecha_venta: new Date().toISOString(),
            precio_venta: precioVenta
        })
        .eq('id', garantiaId)

    if (errorGarantia) {
        return { success: false, error: 'Error actualizando garantía' }
    }

    // 8. Marcar crédito como rematado
    const observacionRemate = esRemateAnticipado
        ? `REMATE ANTICIPADO (Renuncia cliente: ${motivoRenuncia || 'No especificado'}) el ${hoy.toLocaleDateString('es-PE')} por S/${precioVenta.toFixed(2)}. Excedente: S/${excedente.toFixed(2)}`
        : `Rematado el ${hoy.toLocaleDateString('es-PE')} por S/${precioVenta.toFixed(2)}. Excedente: S/${excedente.toFixed(2)}`

    await supabase
        .from('creditos')
        .update({
            estado: 'rematado',
            estado_detallado: 'ejecutado',
            observaciones: observacionRemate
        })
        .eq('id', credito.id)

    // 9. Registrar movimiento de caja
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('saldo_actual')
        .eq('id', cajaOperativaId)
        .single()

    if (caja) {
        const nuevoSaldo = caja.saldo_actual + precioVenta

        await supabase.from('movimientos_caja_operativa').insert({
            caja_operativa_id: cajaOperativaId,
            tipo: 'INGRESO',
            motivo: 'VENTA_REMATE',
            monto: precioVenta,
            saldo_anterior: caja.saldo_actual,
            saldo_nuevo: nuevoSaldo,
            referencia_id: credito.id,
            descripcion: `Remate - ${garantia.descripcion}`,
            usuario_id: user.id,
            metadata: {
                excedente,
                garantia_id: garantiaId,
                total_adeudado: totalAdeudado,
                dias_vencido: diasVencido
            }
        })

        await supabase
            .from('cajas_operativas')
            .update({ saldo_actual: nuevoSaldo })
            .eq('id', cajaOperativaId)
    }

    // 10. NOTIFICACIÓN: Si hay excedente, registrar para devolución al cliente
    if (excedente > 0 && cliente) {
        try {
            await supabase.from('notificaciones_pendientes').insert({
                cliente_id: cliente.id,
                tipo: 'EXCEDENTE_REMATE',
                titulo: 'Excedente por Remate de Prenda',
                mensaje: `Estimado ${cliente.nombres}, su prenda "${garantia.descripcion}" fue rematada. Tiene un excedente de S/${excedente.toFixed(2)} a su favor. Acérquese a recogerlo.`,
                monto: excedente,
                telefono: cliente.telefono_principal,
                email: cliente.email,
                credito_id: credito.id,
                estado: 'pendiente'
            })
        } catch (err) {
            console.error('Error registrando notificación de excedente:', err)
            // No fallamos por esto, ya se completó la venta
        }
    }

    revalidatePath('/dashboard/remates')
    revalidatePath('/dashboard/inventario')
    revalidatePath('/dashboard/caja')

    return {
        success: true,
        excedente,
        totalAdeudado,
        cliente: cliente ? {
            nombre: `${cliente.nombres} ${cliente.apellido_paterno}`,
            telefono: cliente.telefono_principal
        } : null,
        mensaje: excedente > 0
            ? `Venta registrada. Excedente de S/${excedente.toFixed(2)} pendiente de devolución al cliente.`
            : `Venta registrada exitosamente por S/${precioVenta.toFixed(2)}`
    }
}

/**
 * Obtener estadísticas de remates
 */
export async function obtenerEstadisticasRemates() {
    const supabase = await createClient()

    const { data: prendas } = await supabase
        .from('garantias')
        .select('estado, precio_venta')

    const enCustodia = prendas?.filter(p => p.estado === 'custodia_caja').length || 0
    const vendidas = prendas?.filter(p => p.estado === 'vendida').length || 0
    const totalVentas = prendas?.filter(p => p.estado === 'vendida').reduce((sum, p) => sum + (p.precio_venta || 0), 0) || 0

    return { enCustodia, vendidas, totalVentas }
}

/**
 * Registrar renuncia formal del cliente a recuperar su prenda
 * Permite remate anticipado sin esperar 30 días
 */
export async function registrarRenunciaCliente({
    creditoId,
    canalComunicacion,
    descripcion,
    fechaContacto
}: {
    creditoId: string
    canalComunicacion: 'llamada' | 'whatsapp' | 'presencial' | 'email' | 'otro'
    descripcion: string
    fechaContacto?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
    }

    // Obtener datos del crédito
    const { data: credito } = await supabase
        .from('creditos')
        .select('codigo_credito, cliente_id, observaciones')
        .eq('id', creditoId)
        .single()

    if (!credito) {
        return { success: false, error: 'Crédito no encontrado' }
    }

    // Actualizar observaciones del crédito
    const nuevaObservacion = `RENUNCIA CLIENTE (${canalComunicacion.toUpperCase()}): ${descripcion} - Registrado: ${new Date().toLocaleDateString('es-PE')} por usuario ${user.id}`

    const { error: errorUpdate } = await supabase
        .from('creditos')
        .update({
            observaciones: credito.observaciones
                ? `${credito.observaciones}\n${nuevaObservacion}`
                : nuevaObservacion
        })
        .eq('id', creditoId)

    if (errorUpdate) {
        return { success: false, error: 'Error actualizando crédito' }
    }

    // Registrar en auditoría
    await supabase.from('audit_log').insert({
        tabla: 'creditos',
        registro_id: creditoId,
        accion: 'RENUNCIA_CLIENTE',
        usuario_id: user.id,
        datos_nuevos: {
            canal: canalComunicacion,
            descripcion,
            fecha_contacto: fechaContacto || new Date().toISOString()
        },
        metadata: {
            codigo_credito: credito.codigo_credito,
            cliente_id: credito.cliente_id
        }
    })

    return {
        success: true,
        mensaje: `Renuncia registrada. La prenda ahora puede ser rematada sin esperar 30 días. Canal: ${canalComunicacion}`
    }
}
