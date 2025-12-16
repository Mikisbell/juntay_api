
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Default local Supabase connection
const connectionString = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

async function applyMigration() {
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlPath = path.join(process.cwd(), 'supabase/migrations/20251126000007_get_contratos_vencimientos.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);
        console.log('✅ Migration applied successfully.');

    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        await client.end();
    }
}

applyMigration();
