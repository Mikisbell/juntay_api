/**
 * Script para crear usuario admin en producción
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bvrzwdztdccxaenfwwcy.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
    console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY')
    console.log('Ejecuta: SUPABASE_SERVICE_ROLE_KEY="tu-key" npx tsx scripts/create-admin.ts')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
    console.log('🔍 Buscando usuario admin@juntay.com...')

    // 1. Buscar el usuario en auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
        console.error('❌ Error al buscar usuarios:', authError.message)
        process.exit(1)
    }

    const adminUser = users.find(u => u.email === 'admin@juntay.com')

    if (!adminUser) {
        console.error('❌ Usuario admin@juntay.com no encontrado en auth.users')
        console.log('Usuarios existentes:', users.map(u => u.email))
        process.exit(1)
    }

    console.log('✅ Usuario encontrado:', adminUser.id)

    // 2. Verificar si ya existe en usuarios
    const { data: existing } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', adminUser.id)
        .single()

    if (existing) {
        console.log('⚠️ Usuario ya existe en tabla usuarios')
        process.exit(0)
    }

    // 3. Insertar en usuarios
    const { error: insertError } = await supabase.from('usuarios').insert({
        id: adminUser.id,
        email: 'admin@juntay.com',
        empresa_id: 'a0000000-0000-0000-0000-000000000001',
        rol: 'admin',
        activo: true,
        nombres: 'Administrador',
        apellido_paterno: 'Juntay'
    })

    if (insertError) {
        console.error('❌ Error al insertar:', insertError.message)
        process.exit(1)
    }

    console.log('🎉 ¡Usuario admin creado exitosamente!')
    console.log('')
    console.log('📧 Email: admin@juntay.com')
    console.log('🔑 Password: admin123')
    console.log('🌐 URL: https://juntay.vercel.app/login')
}

main().catch(console.error)
