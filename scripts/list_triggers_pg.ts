
import { Client } from 'pg'

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

async function run() {
    const client = new Client({ connectionString: DB_URL })
    try {
        await client.connect()
        console.log('✅ Connected to DB')

        const res = await client.query(`
            SELECT trigger_name, event_manipulation, action_statement
            FROM information_schema.triggers 
            WHERE event_object_table IN ('movimientos_caja_operativa', 'pagos')
            ORDER BY event_object_table, trigger_name;
        `)

        console.log('Triggers on movimientos_caja_operativa:')
        res.rows.forEach(r => console.log(` - ${r.trigger_name} (${r.event_manipulation})`))

    } catch (e) {
        console.error('Failed:', e)
    } finally {
        await client.end()
    }
}
run()
