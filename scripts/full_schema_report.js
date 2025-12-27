const { Client } = require('pg');
const fs = require('fs');

async function main() {
    const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
    await client.connect();

    // 1. Get Tables
    const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    `);

    let report = "# Database Schema Report\n\n";

    for (const table of tablesRes.rows) {
        const tableName = table.table_name;
        report += `## Table: ${tableName}\n`;

        // 2. Get Columns
        const colsRes = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = $1
            ORDER BY ordinal_position
        `, [tableName]);

        report += "| Column | Type | Nullable | Default |\n|---|---|---|---|\n";
        colsRes.rows.forEach(col => {
            report += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || ''} |\n`;
        });
        report += "\n";

        // 3. Get Foreign Keys
        const fkRes = await client.query(`
             SELECT
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.key_column_usage AS kcu
                JOIN information_schema.referential_constraints AS rc 
                ON kcu.constraint_name = rc.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu 
                ON rc.unique_constraint_name = ccu.constraint_name
            WHERE kcu.table_schema = 'public' AND kcu.table_name = $1
        `, [tableName]);

        if (fkRes.rows.length > 0) {
            report += "**Foreign Keys**:\n";
            fkRes.rows.forEach(fk => {
                report += `- \`${fk.column_name}\` -> \`${fk.foreign_table_name}.${fk.foreign_column_name}\`\n`;
            });
            report += "\n";
        }
    }

    await client.end();
    fs.writeFileSync('schema_truth.md', report);
    console.log("Report generated: schema_truth.md");
}

main().catch(console.error);
