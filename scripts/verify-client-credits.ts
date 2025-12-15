
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

async function verifyClient() {
    const dni = '43708661'
    console.log(`Verifying data for DNI: ${dni}...`)

    const { data, error } = await supabase.rpc('buscar_clientes_con_creditos', {
        p_search_term: dni,
        p_is_dni: true,
        p_limit: 5
    })

    if (error) {
        console.error('❌ RPC Failed:', error)
    } else {
        console.log('✅ RPC Success!')
        console.log('Raw Data received:', JSON.stringify(data, null, 2))
    }
}

verifyClient()
