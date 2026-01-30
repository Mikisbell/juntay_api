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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autorizado")

    try {
        // Intentar leer de la tabla caché
        const { data, error } = await supabase
            .from('metricas_uso_tenant')
            .select('*')
            .order('monto_cartera_vigente', { ascending: false })

        if (error) {
            // Si la tabla no existe, retornar datos calculados on-the-fly
            console.warn('Tabla metricas_uso_tenant no existe, calculando métricas...')
            return await calculateMetricsOnTheFly(supabase)
        }

        return data as TenantMetrics[]
    } catch (error) {
        console.error('Error fetching analytics:', error)
        // Fallback a cálculo manual
        return await calculateMetricsOnTheFly(supabase)
    }
}

async function calculateMetricsOnTheFly(supabase: any): Promise<TenantMetrics[]> {
    // Obtener todas las empresas
    const { data: empresas } = await supabase
        .from('empresas')
        .select('id, razon_social')
        .eq('activo', true)
    
    if (!empresas) return []
    
    const metrics: TenantMetrics[] = []
    
    for (const empresa of empresas) {
        // Contar usuarios
        const { count: usuarios } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresa.id)
            .eq('activo', true)
        
        // Contar sucursales
        const { count: sucursales } = await supabase
            .from('sucursales')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresa.id)
        
        // Contar créditos vigentes
        const { count: creditos, data: creditosData } = await supabase
            .from('creditos')
            .select('monto_prestado', { count: 'exact' })
            .eq('empresa_id', empresa.id)
            .eq('estado', 'vigente')
        
        const monto_total = creditosData?.reduce((sum, c) => sum + Number(c.monto_prestado || 0), 0) || 0
        
        metrics.push({
            empresa_id: empresa.id,
            nombre_empresa: empresa.razon_social,
            usuarios_activos: usuarios || 0,
            sucursales_activas: sucursales || 0,
            creditos_historicos: 0,
            creditos_vigentes: creditos || 0,
            monto_cartera_vigente: monto_total,
            last_updated: new Date().toISOString()
        })
    }
    
    return metrics.sort((a, b) => b.monto_cartera_vigente - a.monto_cartera_vigente)
}
