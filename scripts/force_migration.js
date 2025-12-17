
const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is missing in .env.local");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    console.log("Connecting to DB...");
    const client = await pool.connect();
    try {
        console.log("Applying migration...");
        await client.query(`ALTER TABLE inversionistas ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`);
        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration error:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
