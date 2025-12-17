
import { Client } from 'pg'

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

async function run() {
    const client = new Client({ connectionString: DB_URL })
    try {
        await client.connect()
        console.log('✅ Connected to DB')

        const res = await client.query(`
            SELECT
                tc.constraint_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='pagos';
        `)

        console.log('FKs on pagos:')
        res.rows.forEach(r => console.log(` - ${r.constraint_name}: ${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`))

    } catch (e) {
        console.error('Failed:', e)
    } finally {
        await client.end()
    }
}
run()
