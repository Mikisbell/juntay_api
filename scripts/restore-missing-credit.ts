
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function restoreCredit() {
    const creditCode = 'JT-20251214-9746'
    const clientId = '3cac99d1-0b12-462a-a6de-cbc7451e3e64' // Miguel Angel Rivera

    console.log(`Restoring credit ${creditCode}...`)

    // Check if exists first
    const { data: existing } = await supabase.from('creditos').select('id').eq('codigo', creditCode).single()
    if (existing) {
        console.log('Credit already exists, skipping insert.')
        return
    }

    const { data, error } = await supabase.from('creditos').insert({
        codigo: creditCode,
        cliente_id: clientId,
        monto_prestado: 1180.00,
        // monto_total not in schema, likely calculated or stored in monto_prestado? 
        // Wait, saldo_pendiente is 1416.00 which is > 1180.00. 
        // This implies interest is added. 
        // I entered 1416 as saldo_pendiente correctly.
        saldo_pendiente: 1416.00,
        fecha_desembolso: new Date().toISOString(), // Changed from fecha_emision
        fecha_vencimiento: '2026-01-12',
        estado: 'vigente',
        tasa_interes: 20,
        periodo_dias: 30, // Changed from plazo/frecuencia if not existing. Schema has periodo_dias.
        codigo_credito: creditCode // Schema has both codigo and codigo_credito? Let's fill both.
    }).select().single()

    if (error) {
        console.error('❌ Failed to restore credit:', error)
    } else {
        console.log('✅ Credit restored successfully:', data.id)
    }
}

restoreCredit()
