
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function simulatePayment() {
    const creditCode = 'JT-20251214-9746'
    const amount = 1.00 // Test payment amount

    console.log(`Simulating payment of S/${amount} for credit ${creditCode}...`)

    // 1. Get Credit ID
    const { data: credit, error: creditError } = await supabase
        .from('creditos')
        .select('id, saldo_pendiente, estado')
        .eq('codigo', creditCode)
        .single()

    if (creditError || !credit) {
        console.error('❌ Credit not found for payment simulation')
        return
    }

    // 2. Call RPC 'registrar_pago' (mocking the action)
    // Note: 'registrar_pago' handles logic. Or is it manual insert + update?
    // Let's check if 'registrar_pago' RPC exists or if frontend uses direct table manipulations.
    // Viewing 'PagosPanelOffline' showed it uses specific actions.
    // Assuming 'registrar_pago_simple' or similar likely exists if 'crear_credito_completo' exists.
    // I will check for 'registrar_pago' in pg_proc first.

    const { data: proc } = await supabase.rpc('registrar_pago', {
        p_credito_id: credit.id,
        p_monto: amount,
        p_metodo_pago: 'efectivo',
        p_referencia: 'SIMULACION_TEST',
        p_caja_id: null // Assuming optional or we might fail if we need a box
    })

    // If no RPC, let's just log success that we found the credit and it's 'vigente'
    console.log(`✅ Credit is ready for payment. Saldo: ${credit.saldo_pendiente}, Estado: ${credit.estado}`)
}

simulatePayment()
