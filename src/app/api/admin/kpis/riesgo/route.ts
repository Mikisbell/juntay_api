import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerKPIsRiesgo } from '@/lib/actions/kpis-riesgo-actions'

/**
 * API Interna Protegida - KPIs de Riesgo
 * 
 * GET /api/admin/kpis/riesgo
 * 
 * Requiere autenticación.
 * Solo lectura.
 */

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const kpis = await obtenerKPIsRiesgo()

        return NextResponse.json(kpis, {
            headers: {
                'Cache-Control': 'private, max-age=300' // Cache 5 min
            }
        })
    } catch (error) {
        console.error('Error obteniendo KPIs riesgo:', error)
        return NextResponse.json(
            { error: 'Error interno' },
            { status: 500 }
        )
    }
}
