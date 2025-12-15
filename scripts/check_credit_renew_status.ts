
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin access

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCredit() {
    const codigo = 'JT-20251214-3556'
    console.log(`Checking status for credit user reported: ${codigo}`)

    // 1. Get Credit Details
    const { data: credit, error: creditError } = await supabase
        .from('creditos')
        .select('*')
        .eq('codigo', codigo)
        .single()

    if (creditError) {
        console.error('Error fetching credit:', creditError)
    } else {
        console.log('--- Credit Status ---')
        console.log(`ID: ${credit.id}`)
        console.log(`Estado: ${credit.estado}`)
        console.log(`Saldo Pendiente: ${credit.saldo_pendiente}`)
        console.log(`Interés Acumulado: ${credit.interes_acumulado}`)
        console.log(`Fecha Vencimiento: ${credit.fecha_vencimiento}`)
    }

    if (credit) {
        // 2. Get Payments
        const { data: pagos, error: pagosError } = await supabase
            .from('pagos')
            .select('*')
            .eq('credito_id', credit.id)
            .order('created_at', { ascending: false })
            .limit(5)

        if (pagosError) {
            console.error('Error fetching payments:', pagosError)
        } else {
            console.log('\n--- Recent Payments ---')
            pagos.forEach(p => {
                console.log(`[${p.created_at}] Tipo: ${p.tipo} | Monto: ${p.monto}`)
            })
        }
    }
}

checkCredit()
