
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

console.log('🔌 Connecting to database...')
const client = new Client({
    connectionString: DATABASE_URL,
})

const MIGRATIONS = [
    'supabase/migrations/20251211000000_fix_registrar_pago_usuario.sql',
    'supabase/migrations/20251215100000_fix_schema_columns.sql',
    'supabase/migrations/20251215110000_update_rpc_crear_contrato.sql',
    'supabase/migrations/20251215130000_fix_rpc_garantia_status.sql',
    'supabase/migrations/20251215140000_fix_rpc_metodo_pago.sql'
]

async function run() {
    try {
        await client.connect()
        console.log('✅ Connected.')

        // 0. Ensure Auth User Exists (Fix FK error for Dev Mock)
        console.log('👤 Ensuring Mock Auth User exists...')
        await client.query(`
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
            VALUES (
                '00000000-0000-0000-0000-000000000011', 
                'cajero@juntay.dev', 
                '$2a$10$dummy', 
                NOW(), 
                '{"provider":"email","providers":["email"]}', 
                '{}', 
                NOW(), 
                NOW(),
                '00000000-0000-0000-0000-000000000000',
                'authenticated',
                'authenticated'
            )
            ON CONFLICT (id) DO NOTHING;
        `)
        console.log('   ✅ Auth User Verified.')

        console.log('🔥 Dropping conflicting trigger...')
        await client.query(`DROP TRIGGER IF EXISTS trg_update_saldo_credito ON public.pagos;`)
        await client.query(`DROP TRIGGER IF EXISTS trigger_update_saldo_credito_on_pago ON public.pagos;`) // In case both exist
        console.log('   ✅ Trigger Dropped.')

        for (const file of MIGRATIONS) {
            const filePath = path.join(__dirname, '../', file)
            console.log(`📂 Processing: ${file}`)
            if (!fs.existsSync(filePath)) {
                console.error(`❌ File not found: ${filePath}`)
                continue
            }
            const sql = fs.readFileSync(filePath, 'utf8')

            console.log('   Running SQL...')
            await client.query(sql)
            console.log('   ✅ Applied.')
        }

        console.log('🎉 All critical migrations forced successfully.')

    } catch (e) {
        console.error('❌ Error forcing migrations:', e)
    } finally {
        await client.end()
    }
}

run()
