
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

async function testRpc() {
    console.log('Testing RPC buscar_clientes_con_creditos...')
    const { data, error } = await supabase.rpc('buscar_clientes_con_creditos', {
        p_search_term: 'juan', // Common name test
        p_is_dni: false,
        p_limit: 5
    })

    if (error) {
        console.error('❌ RPC Failed:', error)
    } else {
        console.log('✅ RPC Success! Data type:', typeof data)
        console.log('Is Array?', Array.isArray(data))
        console.log('Sample item:', data?.[0])
    }
}

testRpc()
