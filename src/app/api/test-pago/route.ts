import { NextResponse } from 'next/server'
import { registrarPago } from '@/lib/actions/pagos-actions'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Testing registrarPago with body:', JSON.stringify(body, null, 2))

        // Call the server action directly
        const result = await registrarPago(body)

        return NextResponse.json({ success: true, result })
    } catch (error: any) {
        console.error('Error in test-pago:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
