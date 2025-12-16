import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Falta configuración de Supabase (URL o SERVICE_ROLE_KEY)')
    process.exit(1)
}

// Client with admin privileges to insert into public tables
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const DEV_USER_ID = '00000000-0000-0000-0000-000000000011'
const MOCK_EMAIL = 'cajero@juntay.dev'
const CAJA_ID = 'e3752601-5743-4e48-963a-233c41539207'

async function ensureDevEnv() {
    console.log('🌱 Sembrando entorno de desarrollo...')

    // 1. Ensure User in auth.users (Requires specialized admin client or hack, 
    // BUT we can just insert into public.usuarios and assume auth is mocked or handled externally 
    // if using a local supabase that shares IDs.
    // NOTE: Direct bucket insertion into auth schema is risky.
    // Instead, we will focus on the public schema requirements.
    // If the valid session requires a real auth user, the dev needs to sign up.
    // However, for pure DB logic (FKs), we just need the record in public.usuarios if that table exists.

    // Check if public.usuarios exists and has the user
    const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', DEV_USER_ID)
        .single()

    if (userError && userError.code === 'PGRST116') {
        console.log('👤 Creando usuario dev en public.usuarios...')

        // Ensure empresa exists first? Assuming empresa_id is nullable or we create one.
        // Let's create a default empresa if needed.
        let empresaId = null

        // Insert user
        const { error: insertError } = await supabase
            .from('usuarios')
            .insert({
                id: DEV_USER_ID,
                email: MOCK_EMAIL,
                nombres: 'Cajero',
                apellido_paterno: 'Dev',
                rol: 'cajero',
                estado: 'activo'
                // empresa_id: ...
            })

        if (insertError) {
            console.error('Error insertando usuario:', insertError)
        } else {
            console.log('✅ Usuario creado.')
        }
    } else if (user) {
        console.log('✅ Usuario ya existe.')
    }

    // 2. Ensure "Caja Principal" exists (Parent of Cajas Operativas)
    // Assuming table structure based on usage
    // Let's verify 'cajas_operativas' needs a reference? 
    // Based on code, 'cajas_operativas' has 'usuario_id'.
    // Not seeing a parent 'caja' table in the partial context, but 'obtenerCajaAbierta' queries 'cajas_operativas'.

    // 3. Ensure Open Caja Operativa
    const { data: caja, error: cajaError } = await supabase
        .from('cajas_operativas')
        .select('*')
        .eq('usuario_id', DEV_USER_ID)
        .eq('estado', 'abierta')
        .single()

    if (!caja) {
        console.log('📦 Abriendo caja operativa para desarrollo...')
        const { error: openError } = await supabase
            .from('cajas_operativas')
            .insert({
                id: CAJA_ID,
                usuario_id: DEV_USER_ID,
                numero_caja: 999, // Changed from string to integer based on DB schema error
                estado: 'abierta',
                saldo_inicial: 1000,
                saldo_actual: 1000,
                fecha_apertura: new Date().toISOString()
            })

        if (openError) {
            // If unique constraint violation (maybe id exists but closed), generate new ID or update
            if (openError.code === '23505') {
                console.log('⚠️ ID de caja colisionó, intentando reactivar o crear nueva...')
                // Try to update to open
                await supabase
                    .from('cajas_operativas')
                    .update({ estado: 'abierta', fecha_apertura: new Date().toISOString() })
                    .eq('id', CAJA_ID)
            } else {
                console.error('Error abriendo caja:', openError)
            }
        } else {
            console.log('✅ Caja operativa abierta.')
        }
    } else {
        console.log('✅ Caja operativa ya está abierta:', caja.numero_caja)
    }

    console.log('🎉 Entorno de desarrollo sembrado.')
}

ensureDevEnv().catch(console.error)
