
import { Client } from 'pg'

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

async function run() {
    const client = new Client({ connectionString: DB_URL })
    try {
        await client.connect()
        console.log('✅ Connected to DB')

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'movimientos_caja_operativa'
            ORDER BY ordinal_position;
        `)

        console.log('Columns in movimientos_caja_operativa:')
        res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`))

    } catch (e) {
        console.error('Failed:', e)
    } finally {
        await client.end()
    }
}
run()
