
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
    console.log('🔍 Verifying public.pagos data integrity...')

    const res = await client.query(`
        SELECT id, monto_total, medio_pago, metodo_pago 
        FROM public.pagos
        ORDER BY created_at DESC
        LIMIT 5;
    `)

    console.table(res.rows)

    // Check for any remaining NULLs
    const nulls = await client.query(`SELECT COUNT(*) FROM public.pagos WHERE metodo_pago IS NULL`)
    console.log(`\n❌ Remaining NULL metodo_pago: ${nulls.rows[0].count}`)

    await client.end()
}

run()
