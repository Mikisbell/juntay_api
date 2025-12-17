
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'
import dotenv from 'dotenv'

// Load env
const envPath = path.resolve(process.cwd(), '.env')
dotenv.config({ path: envPath })

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!DATABASE_URL) {
    // Try to construct standard Supabase URL if not explicit
    // postgres://postgres:[password]@db.[ref].supabase.co:5432/postgres
    // We assume DATABASE_URL is widely used.
    console.error('❌ Error: DATABASE_URL not found in .env')
    process.exit(1)
}

async function runVerification() {
    console.log('🔌 Connecting to Database...')
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Supabase usually
    })

    try {
        await client.connect()
        console.log('✅ Connected.')

        const sqlPath = path.join(process.cwd(), 'scripts', 'verify_business_flows.sql')
        const sql = fs.readFileSync(sqlPath, 'utf-8')

        console.log('▶️ Executing Verification Script...')

        // Listen for notices (RAISE NOTICE)
        client.on('notice', (msg) => {
            console.log(`[DB NOTICE] ${msg.message}`)
        })

        await client.query(sql)

        console.log('\n🏁 Execution Finished.')
    } catch (err: any) {
        console.error('\n❌ Verification Failed:', err.message)
        if (err.position) {
            console.error(`Position: ${err.position}`)
        }
    } finally {
        await client.end()
    }
}

runVerification()
