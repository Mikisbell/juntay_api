
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error('❌ Uso: npx tsx scripts/make-user-superadmin.ts <email>')
        process.exit(1)
    }

    console.log(`🔍 Buscando usuario: ${email}...`)

    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nombres')
        .eq('email', email)
        .single()

    if (error || !usuario) {
        console.error('❌ Usuario no encontrado en tabla usuarios.')
        console.error('Asegúrate de haber iniciado sesión al menos una vez.')
        process.exit(1)
    }

    console.log(`✅ Usuario encontrado: ${usuario.nombres} (${usuario.id})`)
    console.log(`👑 Promoviendo a SUPER_ADMIN...`)

    const { error: updateError } = await supabase
        .from('usuarios')
        .update({ rol: 'SUPER_ADMIN' })
        .eq('id', usuario.id)

    if (updateError) {
        console.error('❌ Error al actualizar rol:', updateError.message)
        process.exit(1)
    }

    console.log(`🎉 ¡Éxito! El usuario ${email} ahora es SUPER_ADMIN.`)
    console.log(`👉 Refresca el navegador para ver el menú "SaaS Master".`)
}

main()
