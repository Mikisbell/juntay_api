'use server'

import { createClient } from '@/lib/supabase/server'

export interface TenantMetrics {
    empresa_id: string
    nombre_empresa: string
    usuarios_activos: number
    sucursales_activas: number
    creditos_historicos: number
    creditos_vigentes: number
    monto_cartera_vigente: number
    last_updated: string
}

/**
 * Obtener métricas de uso de TODOS los tenants
 * (Lectura optimizada desde cache table)
 */
export async function getGlobalUsageMetrics() {
    const supabase = await createClient()

    // Verificación explícita de seguridad
    // (Aunque RLS lo manejaría, esto evita requests innecesarios)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autorizado")

    // Leer de la tabla caché
    const { data, error } = await supabase
        .from('metricas_uso_tenant')
        .select('*')
        .order('monto_cartera_vigente', { ascending: false }) // Ordene por "valor" para ver los clientes grandes arriba

    if (error) {
        console.error('Error fetching analytics:', error)
        throw new Error('Error obteniendo analíticas')
    }

    return data as TenantMetrics[]
}
