import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerAuditoria, type TipoEvento } from '@/lib/actions/auditoria-actions'

/**
 * API Interna Protegida - Auditoría
 * 
 * GET /api/admin/auditoria
 */

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Obtener filtros de query params
        const searchParams = request.nextUrl.searchParams
        const tipo = searchParams.get('tipo') as TipoEvento | null
        const fechaDesde = searchParams.get('desde') || undefined
        const fechaHasta = searchParams.get('hasta') || undefined
        const pagina = parseInt(searchParams.get('pagina') || '1')

        const auditoria = await obtenerAuditoria({
            tipo: tipo || undefined,
            fechaDesde,
            fechaHasta,
            pagina
        })

        return NextResponse.json(auditoria, {
            headers: { 'Cache-Control': 'private, no-cache' }
        })
    } catch (error) {
        console.error('Error obteniendo auditoría:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
