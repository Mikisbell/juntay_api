const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
console.log('Attempting connection to 54322...');
client.connect()
    .then(async () => {
        console.log('Connected via PG');
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables found:', res.rows.length);
        await client.end();
    })
    .catch(e => {
        console.error('PG Connect Error:', e.message);
        client.end();
    });
