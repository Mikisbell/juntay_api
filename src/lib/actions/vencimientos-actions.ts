'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type VencimientosPorPeriodo = {
    hoy: ContratoVencimiento[]
    semana: ContratoVencimiento[]
    mes: ContratoVencimiento[]
}

export type ContratoVencimiento = {
    id: string
    codigo: string
    cliente: string
    dni: string
    telefono: string
    fechaVencimiento: string
    diasRestantes: number
    monto: number
    saldo: number
}

export async function obtenerVencimientosAgrupados(): Promise<VencimientosPorPeriodo> {
    try {
        const supabase = await createClient()

        // Usamos la nueva función RPC que creamos recientemente
        const { data, error } = await supabase.rpc('get_contratos_vencimientos', { p_dias: 30 })

        if (error) {
            console.error('Error obteniendo vencimientos:', error)
            return { hoy: [], semana: [], mes: [] }
        }

        type VencimientoRow = {
            id: string;
            codigo: string;
            cliente: string;
            dni?: string;
            telefono?: string;
            fecha_vencimiento: string;
            dias_restantes: string | number;
            monto: string | number;
            saldo: string | number;
        };

        const todos = ((data || []) as unknown as VencimientoRow[]).map((v) => ({
            id: v.id,
            codigo: v.codigo,
            cliente: v.cliente,
            dni: v.dni || '',
            telefono: v.telefono || '',
            fechaVencimiento: v.fecha_vencimiento,
            diasRestantes: Number(v.dias_restantes),
            monto: Number(v.monto),
            saldo: Number(v.saldo)
        }))

        return {
            hoy: todos.filter((c) => c.diasRestantes === 0),
            semana: todos.filter((c) => c.diasRestantes > 0 && c.diasRestantes <= 7),
            mes: todos
        }
    } catch (error) {
        console.error('Error inesperado:', error)
        return { hoy: [], semana: [], mes: [] }
    }
}

export async function obtenerEstadisticasVencimientos() {
    try {
        const vencimientos = await obtenerVencimientosAgrupados()

        return {
            hoy: vencimientos.hoy.length,
            semana: vencimientos.semana.length,
            mes: vencimientos.mes.length
        }
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error)
        return { hoy: 0, semana: 0, mes: 0 }
    }
}

export async function enviarNotificacion(
    telefono: string,
    nombreCliente: string,
    tipo: 'vencimiento_hoy' | 'vencimiento_proximo' | 'cobranza',
    datos: {
        creditoId: string;
        clienteId: string;
        mensajePersonalizado?: string;
        // Campos opcionales para metadata/analytics
        codigo?: string;
        fecha?: string;
        monto?: number;
        dias?: number;
    }
) {
    try {
        console.log('📝 Registrando notificación manual:', { telefono, tipo, datos })

        // Registrar en base de datos que se "envió" (el usuario hizo clic)
        await registrarNotificacionEnviada(
            datos.creditoId,
            datos.clienteId,
            tipo,
            datos.mensajePersonalizado || 'Mensaje enviado manualmente vía WhatsApp Web',
            telefono,
            'whatsapp'
        )

        revalidatePath('/dashboard/vencimientos')
        return { success: true, mensaje: 'Notificación registrada en el historial' }
    } catch (error) {
        console.error('Error registrando notificación:', error)
        return { success: false, mensaje: 'Error al registrar la notificación' }
    }
}

async function registrarNotificacionEnviada(
    creditoId: string,
    clienteId: string,
    tipo: string,
    mensaje: string,
    telefono: string,
    medio: 'whatsapp' | 'sms' | 'email'
) {
    const supabase = await createClient()

    // Obtener usuario actual para el registro
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('notificaciones_enviadas').insert({
        credito_id: creditoId,
        cliente_id: clienteId,
        tipo_notificacion: tipo,
        mensaje: mensaje,
        telefono_destino: telefono,
        enviado_por: user?.id,
        estado: 'enviado',
        medio: medio
    })

    if (error) {
        console.error('Error DB registrando notificación:', error)
        throw error
    }
}

export async function verificarCooldownNotificacion(creditoId: string) {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase.rpc('puede_enviar_notificacion', {
            p_credito_id: creditoId
        })

        if (error) {
            console.error('Error verificando cooldown:', error)
            throw error
        }

        return {
            puedeEnviar: data.puede_enviar,
            mensaje: data.mensaje,
            ultimaNotificacion: data.ultima_notificacion
        }
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export async function obtenerHistorialNotificaciones(creditoId: string) {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase.rpc('get_historial_notificaciones', {
            p_credito_id: creditoId
        })

        if (error) {
            console.error('Error obteniendo historial:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error:', error)
        return []
    }
}
