import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generarReporteExcel } from '@/lib/actions/excel-export-actions'

/**
 * API para descarga de reportes Excel
 * 
 * GET /api/admin/excel/[tipo]
 * Tipos: kpis, cartera, pagos, completo
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
        const tiposValidos = ['kpis', 'cartera', 'pagos', 'completo']
        if (!tiposValidos.includes(tipo)) {
            return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
        }

        // Parámetros opcionales
        const searchParams = request.nextUrl.searchParams
        const fechaInicio = searchParams.get('desde') || undefined
        const fechaFin = searchParams.get('hasta') || undefined

        // Generar Excel
        const resultado = await generarReporteExcel({
            tipo: tipo as 'kpis' | 'cartera' | 'pagos' | 'completo',
            fechaInicio,
            fechaFin
        })

        if (!resultado.success || !resultado.buffer) {
            return NextResponse.json(
                { error: resultado.error || 'Error generando Excel' },
                { status: 500 }
            )
        }

        // Retornar como archivo Excel
        const uint8Array = new Uint8Array(resultado.buffer)
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${resultado.filename}"`,
                'Cache-Control': 'private, no-cache'
            }
        })
    } catch (error) {
        console.error('Error en descarga Excel:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
