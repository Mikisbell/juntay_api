const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runAudit() {
    // Default Supabase local credentials - Trying localhost and port 54322 based on docker ps
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';

    console.log(`Intentando conectar a: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 5000, // 5s timeout
    });

    try {
        await client.connect();
        console.log('✅ Conexión establecida.');

        // Capture notices (RAISE NOTICE/WARNING)
        client.on('notice', (msg) => {
            console.log(`[${msg.severity}] ${msg.message}`);
        });

        const sqlPath = path.join(__dirname, 'audit_schema_integrity.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Ejecutando auditoría...');
        await client.query(sql);
        console.log('🏁 Auditoría completada.');

    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error('❌ No se pudo conectar a la base de datos. Asegúrate de que Supabase esté corriendo (npx supabase start).');
            console.error('   Si usa un puerto diferente a 54322, configúrelo en DATABASE_URL.');
        } else {
            console.error('❌ Error ejecutando auditoría:', err);
        }
    } finally {
        await client.end();
    }
}

runAudit();
