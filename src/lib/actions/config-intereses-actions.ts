'use server'

/**
 * Configuración de Intereses y Mora - Server Actions
 * 
 * Lee y actualiza la configuración de intereses/mora de la empresa actual.
 * Estos valores se almacenan en empresas.config_intereses (JSONB)
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireEmpresaActual } from '@/lib/auth/empresa-context'

// Tipo para la configuración de intereses
export type ConfigIntereses = {
    base_dias: number              // Período base del préstamo (default: 30)
    dias_gracia: number            // Días sin mora después de vencimiento (default: 3)
    tipo_calculo: 'simple' | 'compuesto'  // Tipo de cálculo de interés
    tasa_mora_diaria: number       // Tasa de mora diaria en % (default: 0.5 = 0.5%)
    interes_minimo_dias: number    // Días mínimos de interés a cobrar (default: 1)
    capitalizacion_mensual: boolean // Si capitalizar interés mensualmente
    tope_mora_mensual?: number     // Tope máximo de mora mensual en % (default: 15%)
}

// Valores por defecto (usados si la empresa no tiene config)
export const CONFIG_INTERESES_DEFAULT: ConfigIntereses = {
    base_dias: 30,
    dias_gracia: 3,
    tipo_calculo: 'simple',
    tasa_mora_diaria: 0.5,          // 0.5% diario = 15% mensual
    interes_minimo_dias: 1,
    capitalizacion_mensual: false,
    tope_mora_mensual: 15           // Máximo 15% mensual de mora
}

/**
 * Obtener la configuración de intereses de la empresa actual
 */
export async function obtenerConfigIntereses(): Promise<ConfigIntereses> {
    try {
        const { empresaId } = await requireEmpresaActual()
        const supabase = await createClient()

        const { data: empresa, error } = await supabase
            .from('empresas')
            .select('config_intereses')
            .eq('id', empresaId)
            .single()

        if (error || !empresa?.config_intereses) {
            console.warn('Config intereses no encontrada, usando defaults')
            return CONFIG_INTERESES_DEFAULT
        }

        // Merge con defaults para asegurar todos los campos
        return {
            ...CONFIG_INTERESES_DEFAULT,
            ...empresa.config_intereses
        }
    } catch (err) {
        console.error('Error obteniendo config intereses:', err)
        return CONFIG_INTERESES_DEFAULT
    }
}

/**
 * Actualizar la configuración de intereses de la empresa
 */
export async function actualizarConfigIntereses(
    config: Partial<ConfigIntereses>
): Promise<{ success: boolean; error?: string }> {
    try {
        const { empresaId } = await requireEmpresaActual()
        const supabase = await createClient()

        // Obtener config actual
        const { data: empresa } = await supabase
            .from('empresas')
            .select('config_intereses')
            .eq('id', empresaId)
            .single()

        const configActual = empresa?.config_intereses || CONFIG_INTERESES_DEFAULT

        // Merge con nuevos valores
        const nuevaConfig = {
            ...configActual,
            ...config
        }

        // Validaciones
        if (nuevaConfig.tasa_mora_diaria < 0 || nuevaConfig.tasa_mora_diaria > 5) {
            return { success: false, error: 'Tasa de mora debe estar entre 0% y 5% diario' }
        }
        if (nuevaConfig.dias_gracia < 0 || nuevaConfig.dias_gracia > 30) {
            return { success: false, error: 'Días de gracia debe estar entre 0 y 30' }
        }
        if (nuevaConfig.tope_mora_mensual && (nuevaConfig.tope_mora_mensual < 0 || nuevaConfig.tope_mora_mensual > 100)) {
            return { success: false, error: 'Tope de mora mensual debe estar entre 0% y 100%' }
        }

        // Actualizar
        const { error } = await supabase
            .from('empresas')
            .update({ config_intereses: nuevaConfig })
            .eq('id', empresaId)

        if (error) {
            console.error('Error actualizando config:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/admin/configuracion')
        revalidatePath('/dashboard/pagos')
        revalidatePath('/dashboard/vencimientos')

        return { success: true }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
        return { success: false, error: errorMsg }
    }
}

/**
 * Calcular mora usando la configuración de la empresa
 * Esta es la versión dinámica que lee de DB
 */
export async function calcularMoraConConfig(
    saldoPendiente: number,
    fechaVencimiento: Date | string
): Promise<{ diasMora: number; moraPendiente: number; config: ConfigIntereses }> {
    const config = await obtenerConfigIntereses()

    const hoy = new Date()
    const vencimiento = typeof fechaVencimiento === 'string'
        ? new Date(fechaVencimiento)
        : fechaVencimiento

    // Calcular días transcurridos desde vencimiento
    const diasVencido = Math.floor(
        (hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Solo aplica mora después del período de gracia
    const diasMora = Math.max(0, diasVencido - config.dias_gracia)

    // Calcular mora con tope mensual
    const tasaDiaria = config.tasa_mora_diaria / 100  // Convertir % a decimal
    const moraSinTope = saldoPendiente * tasaDiaria * diasMora

    const topeMensual = (config.tope_mora_mensual || 15) / 100
    const moraMensualMaxima = saldoPendiente * topeMensual
    const moraPendiente = Math.min(moraSinTope, moraMensualMaxima)

    return {
        diasMora,
        moraPendiente: Math.round(moraPendiente * 100) / 100,
        config
    }
}
