import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerKPIsCobranza } from '@/lib/actions/kpis-cobranza-actions'

/**
 * API Interna Protegida - KPIs de Cobranza
 * 
 * GET /api/admin/kpis/cobranza
 * 
 * Requiere autenticación.
 * Solo lectura.
 */

export async function GET() {
    try {
        // Verificar autenticación
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        // Obtener KPIs
        const kpis = await obtenerKPIsCobranza()

        return NextResponse.json(kpis, {
            headers: {
                'Cache-Control': 'private, max-age=60' // Cache 1 minuto
            }
        })
    } catch (error) {
        console.error('Error obteniendo KPIs:', error)
        return NextResponse.json(
            { error: 'Error interno' },
            { status: 500 }
        )
    }
}
