
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

async function listCredits() {
    const dni = '43708661'
    console.log(`Searching real credits for DNI: ${dni}...`)

    // 1. Find Client ID first
    const { data: clients, error: clientError } = await supabase
        .from('clientes')
        .select('id, nombres, apellido_paterno')
        .eq('numero_documento', dni)

    if (clientError || !clients || clients.length === 0) {
        console.error('❌ Client not found in database')
        return
    }

    const client = clients[0]
    console.log(`Client Found: ${client.nombres} ${client.apellido_paterno} (ID: ${client.id})`)

    // 2. Fetch Credits
    const { data: credits, error: creditError } = await supabase
        .from('creditos')
        .select('id, codigo, monto_prestado, saldo_pendiente, estado, fecha_vencimiento')
        .eq('cliente_id', client.id)
        .order('fecha_vencimiento', { ascending: false })

    if (creditError) {
        console.error('❌ Error fetching credits:', creditError)
        return
    }

    if (!credits || credits.length === 0) {
        console.log('ℹ️ No credits found for this client.')
    } else {
        console.log(`✅ Found ${credits.length} REAL credits in database:`)
        console.table(credits.map(c => ({
            Codigo: c.codigo,
            Estado: c.estado,
            'Saldo Pend.': c.saldo_pendiente,
            'Monto Prestado': c.monto_prestado,
            Vencimiento: c.fecha_vencimiento
        })))
    }
}

listCredits()
