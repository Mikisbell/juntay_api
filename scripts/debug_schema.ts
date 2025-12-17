
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Key to bypass RLS if needed, or Anon

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectTable(tableName: string) {
    console.log(`\n🔍 Inspecting table: ${tableName}`)

    // We can query Supabase PostgREST API or use RPC if we have one. 
    // Usually plain select limit 1 gives keys. 
    // Or we can try to Select * from information_schema if enabled/exposed.

    // Attempt 1: Select 1 row
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

    if (error) {
        console.error(`Error selecting from ${tableName}:`, error.message)
        return
    }

    if (data && data.length > 0) {
        console.log('✅ Columns found (from row data):', Object.keys(data[0]))
    } else {
        console.log('⚠️ Table empty, cannot infer columns from data.')
        // Fallback: Try to insert dummy data to trigger error suggesting columns? No, risky.
    }
}

async function main() {
    await inspectTable('personas')
}

main()
