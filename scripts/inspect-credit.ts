
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function inspectCredit() {
    const codigoCredito = 'JT-20251214-9746'
    console.log(`Inspecting credit: ${codigoCredito}...`)

    // 1. Get Credit Details
    const { data: credits, error: creditError } = await supabase
        .from('creditos')
        .select('*')
        .eq('codigo', codigoCredito)

    if (creditError) {
        console.error('❌ Error fetching credit:', creditError.message)
        return
    }

    if (!credits || credits.length === 0) {
        console.error('❌ Credit not found with code:', codigoCredito)
        return
    }

    const credit = credits[0]

    console.log('--- CREDIT DETAILS ---')
    console.log(`ID: ${credit.id}`)
    console.log(`Estado: ${credit.estado}`)
    console.log(`Monto Prestado: ${credit.monto_prestamo}`)
    console.log(`Monto Total a Pagar: ${credit.monto_total}`)
    console.log(`Saldo Pendiente: ${credit.saldo_pendiente}`)

    // 2. Get Associated Payments
    const { data: pagos, error: pagosError } = await supabase
        .from('pagos')
        .select('*')
        .eq('credito_id', credit.id)

    if (pagosError) {
        console.error('❌ Error fetching payments:', pagosError.message)
        return
    }

    console.log('\n--- ASSOCIATED PAYMENTS ---')
    if (pagos && pagos.length > 0) {
        pagos.forEach((pago, index) => {
            console.log(`${index + 1}. ID: ${pago.id} | Monto: ${pago.monto} | Fecha: ${pago.fecha_pago} | Estado: ${pago.estado}`)
        })
    } else {
        console.log('No payments found for this credit.')
    }
}

inspectCredit()
