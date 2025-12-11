
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRpc() {
    console.log("Testing get_upcoming_expirations RPC...")

    const { data, error } = await supabase.rpc('get_upcoming_expirations', { p_days: 90 })

    if (error) {
        console.error("❌ RPC ERROR:", error)
    } else {
        if (data && data.length > 0) {
            console.log("✅ Data received. First item keys:", Object.keys(data[0]))
        } else {
            console.log("✅ RPC returned empty array.")
        }
    }
}
testRpc()
