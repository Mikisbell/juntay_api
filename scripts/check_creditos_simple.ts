
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
    console.log('🔍 Checking creditos schema...')
    const { data, error } = await supabase.from('creditos').select().limit(1)

    if (error) {
        console.error('Error:', error.message)
    } else {
        if (data && data.length > 0) {
            console.log('✅ Columns JSON:', JSON.stringify(Object.keys(data[0]), null, 2))
        } else {
            console.log('⚠️ Table is empty. Attempting insert to find columns via error...')
            // We can't really guess columns if empty without metadata API.
            // But usually bad request tells us missing columns.
            // Let's rely on standard columns if empty.
            console.log('Note: If table is empty, we must rely on error messages or source code.')
        }
    }
}

check()
