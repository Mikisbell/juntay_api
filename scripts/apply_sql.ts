import { Client } from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function run() {
    const file = process.argv[2]
    if (!file) {
        console.error("Usage: tsx scripts/apply_sql.ts <relative_path_to_sql>")
        process.exit(1)
    }

    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        console.error("DATABASE_URL not found in .env")
        process.exit(1)
    }

    const client = new Client({
        connectionString: dbUrl,
    })

    try {
        await client.connect()
        const sqlPath = path.resolve(__dirname, '..', file)
        if (!fs.existsSync(sqlPath)) {
            console.error(`File not found: ${sqlPath}`)
            process.exit(1)
        }

        const sql = fs.readFileSync(sqlPath, 'utf8')
        console.log(`Applying ${file}...`)

        await client.query(sql)
        console.log("✅ SQL applied successfully.")
    } catch (e) {
        console.error("Error applying SQL:", e)
    } finally {
        await client.end()
    }
}

run()
