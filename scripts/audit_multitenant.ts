import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const TABLES_TO_CHECK = [
    'garantias',
    'pagos',
    'movimientos_caja_operativa',
    'cajas_operativas',
    'inversionistas',
    'transacciones_capital',
    'cuentas_financieras',
    'creditos',
    'clientes',
    'usuarios'
]

async function audit() {
    console.log('--- AUDIT MULTI-TENANT (empresa_id) ---')
    let issues = 0

    for (const table of TABLES_TO_CHECK) {
        // Trick: Select 1 row to see keys. 
        // Better: Query information_schema if possible, but select * limit 1 is mostly sufficient if rows exist.
        // If empty, we can't see keys via JS client easily without RPC.
        // We will try to SELECT 'empresa_id' specifically. If it fails, column doesn't exist.

        const { error } = await supabase.from(table).select('empresa_id').limit(1)

        if (error) {
            console.log(`❌ [${table}] Error/Missing: ${error.message}`)
            issues++
        } else {
            console.log(`✅ [${table}] OK`)
        }
    }

    // Also check RLS enabled?
    // Hard to check via client.

    console.log(`\nAudit Complete. Issues found: ${issues}`)
}

audit()
