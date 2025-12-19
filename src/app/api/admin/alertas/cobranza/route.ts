import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerAlertasCobranza } from '@/lib/actions/alertas-cobranza-actions'

/**
 * API Interna Protegida - Alertas de Cobranza
 * 
 * GET /api/admin/alertas/cobranza
 */

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const alertas = await obtenerAlertasCobranza()

        return NextResponse.json(alertas, {
            headers: { 'Cache-Control': 'private, max-age=60' }
        })
    } catch (error) {
        console.error('Error obteniendo alertas:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
