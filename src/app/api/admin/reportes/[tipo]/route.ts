import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generarReporte } from '@/lib/actions/reportes-export-actions'

/**
 * API Interna Protegida - Descarga de Reportes
 * 
 * GET /api/admin/reportes/[tipo]
 * 
 * Tipos: kpis, recibos, cartera, mora
 */

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tipo: string }> }
) {
    try {
        // Verificar autenticación
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { tipo } = await params

        // Validar tipo
        const tiposValidos = ['kpis', 'recibos', 'cartera', 'mora']
        if (!tiposValidos.includes(tipo)) {
            return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
        }

        // Obtener parámetros de fecha opcionales
        const searchParams = request.nextUrl.searchParams
        const fechaInicio = searchParams.get('desde') || undefined
        const fechaFin = searchParams.get('hasta') || undefined

        // Generar reporte
        const resultado = await generarReporte({
            tipo: tipo as 'kpis' | 'recibos' | 'cartera' | 'mora',
            fechaInicio,
            fechaFin
        })

        if (!resultado.success || !resultado.contenido) {
            return NextResponse.json(
                { error: resultado.error || 'Error generando reporte' },
                { status: 500 }
            )
        }

        // Retornar como archivo CSV descargable
        return new NextResponse(resultado.contenido, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${resultado.filename}"`,
                'Cache-Control': 'private, no-cache'
            }
        })
    } catch (error) {
        console.error('Error en descarga de reporte:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
