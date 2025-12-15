
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

const client = new Client({ connectionString: DATABASE_URL })

async function run() {
    await client.connect()
    console.log('🔍 Listing Triggers...')

    const res = await client.query(`
        SELECT event_object_table as table_name, trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table IN ('pagos', 'creditos')
        ORDER BY event_object_table;
    `)

    res.rows.forEach(r => console.log(`- Table: ${r.table_name} | Trigger: ${r.trigger_name}`))

    await client.end()
}

run()
