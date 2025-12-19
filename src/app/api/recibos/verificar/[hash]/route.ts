import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API Pública para verificar recibos por hash
 * 
 * GET /api/recibos/verificar/[hash]
 * 
 * REGLAS:
 * - Solo lectura (SELECT)
 * - Sin autenticación
 * - Cacheable
 * - Datos mínimos (privacidad)
 */

// Cliente público (sin auth, solo lectura)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface VerificacionResponse {
    valido: boolean
    recibo?: {
        numero: string
        fecha: string
        monto: string
        codigoCredito: string
        clienteNombre: string  // Parcialmente oculto
        estado: string
    }
    error?: string
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ hash: string }> }
): Promise<NextResponse<VerificacionResponse>> {
    try {
        const { hash } = await params

        if (!hash || hash.length !== 64) {
            return NextResponse.json(
                { valido: false, error: 'Hash inválido' },
                { status: 400 }
            )
        }

        // Buscar recibo por hash en metadata
        const { data, error } = await supabase
            .from('notificaciones_enviadas')
            .select(`
                created_at,
                estado,
                metadata
            `)
            .eq('tipo_notificacion', 'RECIBO_PDF')
            .filter('metadata->>qr_hash', 'eq', hash)
            .single()

        if (error || !data) {
            return NextResponse.json(
                { valido: false, error: 'Recibo no encontrado' },
                { status: 404 }
            )
        }

        const metadata = data.metadata as {
            numero_recibo?: string
            codigo_credito?: string
            monto_pagado?: number
            cliente_nombre?: string
        } || {}

        // Ocultar parcialmente el nombre del cliente
        const nombreCompleto = metadata.cliente_nombre || 'Cliente'
        const nombreOculto = ocultarNombre(nombreCompleto)

        const fecha = new Date(data.created_at)

        return NextResponse.json(
            {
                valido: true,
                recibo: {
                    numero: metadata.numero_recibo || 'N/A',
                    fecha: fecha.toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    }),
                    monto: new Intl.NumberFormat('es-PE', {
                        style: 'currency',
                        currency: 'PEN'
                    }).format(metadata.monto_pagado || 0),
                    codigoCredito: metadata.codigo_credito || 'N/A',
                    clienteNombre: nombreOculto,
                    estado: data.estado === 'enviado' ? 'Válido' : 'Con observaciones'
                }
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'public, max-age=3600' // Cache 1 hora
                }
            }
        )
    } catch (err) {
        console.error('Error verificando recibo:', err)
        return NextResponse.json(
            { valido: false, error: 'Error interno' },
            { status: 500 }
        )
    }
}

/**
 * Oculta parcialmente un nombre para privacidad
 */
function ocultarNombre(nombre: string): string {
    return nombre
        .split(' ')
        .map((palabra, index) => {
            if (index === 0) return palabra
            if (palabra.length <= 2) return palabra
            return palabra[0] + '***' + palabra[palabra.length - 1]
        })
        .join(' ')
}
