'use server'

/**
 * App Móvil para Cobradores - Backend Actions
 * 
 * Funciones para la app de cobro en campo:
 * - Lista de cobros del día
 * - Registro de pagos
 * - Registro de visitas con geolocalización
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ TYPES ============

export interface CobroDelDia {
    creditoId: string
    codigoCredito: string
    clienteId: string
    clienteNombre: string
    clienteTelefono: string | null
    clienteDireccion: string | null
    montoCuota: number
    montoVencido: number
    diasVencido: number
    estado: 'pendiente' | 'visitado' | 'cobrado' | 'no_encontrado'
    ultimaVisita?: {
        fecha: string
        resultado: string
        ubicacion?: { lat: number; lng: number }
    }
}

export interface RegistroVisita {
    creditoId: string
    resultado: 'cobrado' | 'promesa_pago' | 'no_encontrado' | 'rechazado' | 'otro'
    notas?: string
    ubicacion?: { lat: number; lng: number }
    fotoUrl?: string
    montoCobrado?: number
}

export interface ResumenCobrador {
    totalCobros: number
    montoCobrado: number
    visitasRealizadas: number
    clientesPendientes: number
}

// ============ LISTA DE COBROS ============

/**
 * Obtiene la lista de cobros asignados al cobrador para hoy
 */
export async function obtenerCobrosDelDia(_cobradorId: string): Promise<CobroDelDia[]> {
    const supabase = await createClient()
    const hoy = new Date().toISOString().split('T')[0]

    // Obtener créditos con cuotas vencidas o próximas a vencer
    const { data: creditos, error } = await supabase
        .from('creditos')
        .select(`
            id,
            codigo,
            saldo_pendiente,
            fecha_vencimiento,
            estado,
            monto_cuota,
            clientes!inner(
                id,
                nombres,
                apellido_paterno,
                telefono,
                direccion
            )
        `)
        .in('estado', ['vigente', 'vencido', 'en_mora'])
        .lte('fecha_vencimiento', hoy)
        .order('fecha_vencimiento', { ascending: true })

    if (error) {
        console.error('Error obteniendo cobros:', error)
        return []
    }

    const cobros: CobroDelDia[] = []

    for (const credito of (creditos || [])) {
        const cliente = credito.clientes as unknown as {
            id: string
            nombres: string
            apellido_paterno: string
            telefono: string | null
            direccion: string | null
        }

        const fechaVenc = new Date(credito.fecha_vencimiento)
        const diasVencido = Math.max(0, Math.floor((Date.now() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24)))

        // Obtener última visita
        const { data: visita } = await supabase
            .from('visitas_cobranza')
            .select('*')
            .eq('credito_id', credito.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        cobros.push({
            creditoId: credito.id,
            codigoCredito: credito.codigo,
            clienteId: cliente.id,
            clienteNombre: `${cliente.nombres} ${cliente.apellido_paterno}`,
            clienteTelefono: cliente.telefono,
            clienteDireccion: cliente.direccion,
            montoCuota: credito.monto_cuota || 0,
            montoVencido: credito.saldo_pendiente,
            diasVencido,
            estado: visita ? (visita.resultado === 'cobrado' ? 'cobrado' : 'visitado') : 'pendiente',
            ultimaVisita: visita ? {
                fecha: visita.created_at,
                resultado: visita.resultado,
                ubicacion: visita.ubicacion
            } : undefined
        })
    }

    return cobros
}

// ============ REGISTRO DE VISITA ============

/**
 * Registra una visita de cobranza
 */
export async function registrarVisita(
    cobradorId: string,
    visita: RegistroVisita
): Promise<{ success: boolean; visitaId?: string; pagoId?: string; error?: string }> {
    const supabase = await createClient()

    // 1. Registrar la visita
    const { data: visitaData, error: visitaError } = await supabase
        .from('visitas_cobranza')
        .insert({
            credito_id: visita.creditoId,
            cobrador_id: cobradorId,
            resultado: visita.resultado,
            notas: visita.notas,
            ubicacion: visita.ubicacion,
            foto_url: visita.fotoUrl
        })
        .select('id')
        .single()

    if (visitaError) {
        console.error('Error registrando visita:', visitaError)
        return { success: false, error: visitaError.message }
    }

    let pagoId: string | undefined

    // 2. Si hubo cobro, registrar el pago
    if (visita.resultado === 'cobrado' && visita.montoCobrado && visita.montoCobrado > 0) {
        const { data: credito } = await supabase
            .from('creditos')
            .select('saldo_pendiente')
            .eq('id', visita.creditoId)
            .single()

        const { data: pagoData, error: pagoError } = await supabase
            .from('pagos')
            .insert({
                credito_id: visita.creditoId,
                monto: visita.montoCobrado,
                tipo: 'abono',
                metodo_pago: 'efectivo',
                usuario_id: cobradorId,
                metadata: {
                    origen: 'cobro_campo',
                    visita_id: visitaData.id,
                    ubicacion: visita.ubicacion
                }
            })
            .select('id')
            .single()

        if (!pagoError && pagoData) {
            pagoId = pagoData.id

            // Actualizar saldo del crédito
            const nuevoSaldo = (credito?.saldo_pendiente || 0) - visita.montoCobrado
            await supabase
                .from('creditos')
                .update({
                    saldo_pendiente: Math.max(0, nuevoSaldo),
                    estado: nuevoSaldo <= 0 ? 'cancelado' : undefined
                })
                .eq('id', visita.creditoId)
        }
    }

    revalidatePath('/cobrador')
    return { success: true, visitaId: visitaData.id, pagoId }
}

// ============ RESUMEN DEL DÍA ============

/**
 * Obtiene el resumen del día para el cobrador
 */
export async function obtenerResumenCobrador(cobradorId: string): Promise<ResumenCobrador> {
    const supabase = await createClient()
    const hoy = new Date().toISOString().split('T')[0]

    // Pagos del día
    const { data: pagos } = await supabase
        .from('pagos')
        .select('monto')
        .eq('usuario_id', cobradorId)
        .gte('created_at', `${hoy}T00:00:00`)
        .lte('created_at', `${hoy}T23:59:59`)

    // Visitas del día
    const { data: visitas } = await supabase
        .from('visitas_cobranza')
        .select('id')
        .eq('cobrador_id', cobradorId)
        .gte('created_at', `${hoy}T00:00:00`)
        .lte('created_at', `${hoy}T23:59:59`)

    // Cobros pendientes
    const cobros = await obtenerCobrosDelDia(cobradorId)
    const pendientes = cobros.filter(c => c.estado === 'pendiente').length

    return {
        totalCobros: (pagos || []).length,
        montoCobrado: (pagos || []).reduce((sum, p) => sum + (p.monto || 0), 0),
        visitasRealizadas: (visitas || []).length,
        clientesPendientes: pendientes
    }
}

// ============ GEOLOCALIZACIÓN ============

/**
 * Registra la ubicación actual del cobrador
 */
export async function registrarUbicacionCobrador(
    cobradorId: string,
    ubicacion: { lat: number; lng: number }
): Promise<{ success: boolean }> {
    const supabase = await createClient()

    await supabase
        .from('ubicaciones_cobradores')
        .upsert({
            cobrador_id: cobradorId,
            ubicacion,
            timestamp: new Date().toISOString()
        }, {
            onConflict: 'cobrador_id'
        })

    return { success: true }
}
