
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

// Standard local supabase url
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

async function run() {
    console.log(`Using DB_URL: ${DB_URL}`)
    const client = new Client({ connectionString: DB_URL })
    try {
        await client.connect()
        console.log('✅ Connected to DB')

        const migrationPath = path.join(process.cwd(), 'supabase/migrations/20251217000003_fix_caja_balance_trigger.sql')
        const sql = fs.readFileSync(migrationPath, 'utf8')

        console.log('Applying migration...')
        await client.query(sql)
        console.log('✅ Migration applied successfully!')
    } catch (e) {
        console.error('❌ Migration failed:', e)
        process.exit(1)
    } finally {
        await client.end()
    }
}
run()
