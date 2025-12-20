'use server'

/**
 * Configuración de Horarios de Recordatorios
 * 
 * Permite configurar las horas de envío de recordatorios automáticos.
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ TYPES ============

export interface ConfiguracionRecordatorios {
    id: string
    hora_inicio: string      // "09:00"
    hora_fin: string         // "18:00"
    dias_habiles: number[]   // [1,2,3,4,5,6] = Lun-Sab
    activo: boolean
    tipos_activos: string[]  // ['VENCE_3_DIAS', 'VENCE_MANANA', 'VENCE_HOY', 'VENCIDO']
    updated_at: string
}

const CONFIG_KEY = 'recordatorios_whatsapp'

// ============ DEFAULT CONFIG ============

const defaultConfig: Omit<ConfiguracionRecordatorios, 'id' | 'updated_at'> = {
    hora_inicio: '09:00',
    hora_fin: '18:00',
    dias_habiles: [1, 2, 3, 4, 5, 6], // Lun-Sab
    activo: true,
    tipos_activos: ['VENCE_3_DIAS', 'VENCE_MANANA', 'VENCE_HOY', 'VENCIDO']
}

// ============ QUERIES ============

/**
 * Obtiene la configuración actual de recordatorios
 */
export async function obtenerConfiguracionRecordatorios(): Promise<ConfiguracionRecordatorios> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('configuraciones')
        .select('*')
        .eq('clave', CONFIG_KEY)
        .single()

    if (error || !data) {
        // Retornar config por defecto si no existe
        return {
            id: 'default',
            ...defaultConfig,
            updated_at: new Date().toISOString()
        }
    }

    const valor = data.valor as ConfiguracionRecordatorios
    return {
        id: data.id,
        hora_inicio: valor.hora_inicio || defaultConfig.hora_inicio,
        hora_fin: valor.hora_fin || defaultConfig.hora_fin,
        dias_habiles: valor.dias_habiles || defaultConfig.dias_habiles,
        activo: valor.activo ?? defaultConfig.activo,
        tipos_activos: valor.tipos_activos || defaultConfig.tipos_activos,
        updated_at: data.updated_at
    }
}

/**
 * Actualiza la configuración de recordatorios
 */
export async function actualizarConfiguracionRecordatorios(
    config: Partial<Omit<ConfiguracionRecordatorios, 'id' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Obtener config actual
    const actual = await obtenerConfiguracionRecordatorios()

    const nuevoValor = {
        hora_inicio: config.hora_inicio ?? actual.hora_inicio,
        hora_fin: config.hora_fin ?? actual.hora_fin,
        dias_habiles: config.dias_habiles ?? actual.dias_habiles,
        activo: config.activo ?? actual.activo,
        tipos_activos: config.tipos_activos ?? actual.tipos_activos
    }

    // Upsert
    const { error } = await supabase
        .from('configuraciones')
        .upsert({
            clave: CONFIG_KEY,
            valor: nuevoValor,
            descripcion: 'Configuración de horarios de recordatorios WhatsApp',
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'clave'
        })

    if (error) {
        console.error('Error actualizando config:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/configuracion')
    return { success: true }
}

// ============ HELPERS ============

/**
 * Verifica si está dentro del horario de envío
 */
export async function estaDentroDeHorario(): Promise<{
    permitido: boolean
    razon?: string
}> {
    const config = await obtenerConfiguracionRecordatorios()

    if (!config.activo) {
        return { permitido: false, razon: 'Recordatorios desactivados' }
    }

    const ahora = new Date()
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes()
    const diaActual = ahora.getDay() // 0=Dom, 1=Lun...

    // Verificar día hábil
    if (!config.dias_habiles.includes(diaActual)) {
        return { permitido: false, razon: `Día ${diaActual} no es día hábil` }
    }

    // Verificar hora
    const [horaInicioH, horaInicioM] = config.hora_inicio.split(':').map(Number)
    const [horaFinH, horaFinM] = config.hora_fin.split(':').map(Number)

    const inicioMinutos = horaInicioH * 60 + horaInicioM
    const finMinutos = horaFinH * 60 + horaFinM

    if (horaActual < inicioMinutos || horaActual > finMinutos) {
        return {
            permitido: false,
            razon: `Fuera de horario (${config.hora_inicio} - ${config.hora_fin})`
        }
    }

    return { permitido: true }
}

/**
 * Verifica si un tipo de recordatorio está activo
 */
export async function tipoRecordatorioActivo(tipo: string): Promise<boolean> {
    const config = await obtenerConfiguracionRecordatorios()
    return config.activo && config.tipos_activos.includes(tipo)
}
