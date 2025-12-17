
import { Client } from 'pg'

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

async function run() {
    const client = new Client({ connectionString: DB_URL })
    try {
        await client.connect()
        console.log('✅ Connected to DB')

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `)

        console.log('Tables in public schema:')
        res.rows.forEach(r => console.log(` - ${r.table_name}`))

    } catch (e) {
        console.error('Failed:', e)
    } finally {
        await client.end()
    }
}
run()
