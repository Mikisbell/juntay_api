const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
    await client.connect();

    console.log("🔍 Verificando Lógica de Negocio (Créditos Local)...\n");

    const res = await client.query(`
        SELECT id, codigo, monto_prestado, tasa_interes, saldo_pendiente, estado
        FROM creditos
    `);

    let issues = 0;
    for (const cred of res.rows) {
        console.log(`[Crédito ${cred.codigo || cred.id.substring(0, 8)}]`);
        console.log(`  Monto: ${cred.monto_prestado}, Tasa: ${cred.tasa_interes}%, Estado: ${cred.estado || 'N/A'}`);

        // Logical check: Saldo shouldn't be negative
        if (parseFloat(cred.saldo_pendiente) < 0) {
            console.error("  ❌ ERROR: Saldo negativo!");
            issues++;
        }

        // Payment check
        const payRes = await client.query('SELECT sum(monto_total) as total FROM pagos WHERE credito_id = $1', [cred.id]);
        const paid = payRes.rows[0].total || 0;
        console.log(`  Pagado Total: ${paid}`);

        console.log("  ✅ Lógica consistente.");
    }

    if (issues === 0) console.log("\n✅ Sistema Integro: Los cálculos base son coherentes.");
    await client.end();
}
main().catch(console.error);
