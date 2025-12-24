import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
    const sqlPath = path.resolve(__dirname, '../supabase/migrations/fixes/fix_payment_permissions.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('Applying permissions fix...')

    // Split by statement if needed, or simple exec if supported (supabase-js doesn't support raw SQL on client usually unless via RPC or specific endpoint, but we can try service role pg connection if available, or just use psql if user had it).
    // Since we don't have direct SQL exec via JS client without RPC 'exec_sql', we might need to rely on the user or use a workaround.
    // Workaround: We will use the `postgres` library if available, or just instruct user. 
    // Wait, the project has `pg` installed! (Saw in package.json earlier line 60: "pg": "^8.16.3").

    const { Client } = require('pg')
    // We need connection string. Usually inside .env as DATABASE_URL.
    // I'll try to read DATABASE_URL from process.env

    // Let's check .env content roughly or assume DATABASE_URL exists (it is standard).
    // If not, I'll fail gracefully.

    let connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        // Fallback: Try to construct it or ask user. 
        // But wait, the previous scripts used `supabase-js`, maybe they use RPC?
        // Let's try `pg` first if I can find the connection string.
        console.log("No DATABASE_URL found, checking .env...")
    }
}

// SIMPLER APPROACH:
// I will just ask the USER to run the SQL or use the Postgres extension if I can access it.
// BUT I am an agent.
// Project has `scripts/run_audit_node.js` which might run SQL.
// Let's create `scripts/apply-sql.ts` using `pg` driver assuming `DATABASE_URL` is in `.env`.

import { Client } from 'pg'

async function run() {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        console.error("DATABASE_URL not found in .env")
        process.exit(1)
    }

    const client = new Client({
        connectionString: dbUrl,
    })

    try {
        await client.connect()
        const sqlPath = path.resolve(__dirname, '../supabase/migrations/fixes/fix_payment_permissions.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        await client.query(sql)
        console.log("✅ Permissions applied successfully.")
    } catch (e) {
        console.error("Error applying SQL:", e)
    } finally {
        await client.end()
    }
}

run()
