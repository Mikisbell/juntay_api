import { NextResponse } from 'next/server'
import { registrarEmpeno } from '@/lib/actions/contratos-actions'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Testing registrarEmpeno with body:', JSON.stringify(body, null, 2))

        // Call the server action directly
        const result = await registrarEmpeno(body)

        return NextResponse.json({ success: true, result })
    } catch (error: any) {
        console.error('Error in test-empeno:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
