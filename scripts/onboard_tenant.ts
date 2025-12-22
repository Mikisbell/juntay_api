/**
 * JUNTAY SaaS - Tenant Onboarding Script
 * 
 * Usage: npx tsx scripts/onboard_tenant.ts
 * 
 * Automates the creation of:
 * 1. Company (Empresa)
 * 2. Main Branch (Sucursal Principal)
 * 3. Super Admin User
 * 
 * Future improvements: Seed default categories/config.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import readline from 'readline'

dotenv.config({ path: '.env' })

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables (SUPABASE_URL, SERVICE_ROLE_KEY)')
    process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function ask(question: string): Promise<string> {
    return new Promise(resolve => {
        rl.question(question, (answer) => resolve(answer.trim()))
    })
}

async function main() {
    console.log('\n🚀 JUNTAY SaaS - NEW TENANT ONBOARDING')
    console.log('=======================================')

    try {
        // 1. Gather Info
        const companyName = await ask('🏢 Company Name (Nombre Comercial): ')
        if (!companyName) throw new Error("Company Name is required")

        const ruc = await ask('📄 RUC (optional): ')

        const adminEmail = await ask('📧 Admin Email: ')
        if (!adminEmail) throw new Error("Admin Email is required")

        const adminPassword = await ask('🔑 Admin Password (default: TempPass123!): ') || 'TempPass123!'

        const plan = await ask('💎 Plan (Free/Pro/Enterprise) [Free]: ') || 'Free'

        console.log('\n⚙️  Provisioning Tenant...')

        // 2. Create Company
        const { data: company, error: coError } = await adminClient
            .from('empresas')
            .insert({
                nombre_comercial: companyName,
                razon_social: `${companyName} S.A.C.`, // Default guess
                ruc: ruc || null,
                activo: true,
                direccion: 'Dirección por defecto',
                email: adminEmail,
                telefono: '000-000000',
                // configuracion: { plan } // Removing configuracion as per schema check previously
            })
            .select()
            .single()

        if (coError) throw new Error(`Error creating company: ${coError.message}`)
        console.log(`\n✅ Company Created: ${company.nombre_comercial} (ID: ${company.id})`)

        // 3. Create Main Branch
        const { data: branch, error: brError } = await adminClient
            .from('sucursales')
            .insert({
                empresa_id: company.id,
                nombre: 'Sede Principal',
                codigo: 'MAIN-001',
                direccion: 'Dirección Principal',
                telefono: '000-000000',
                es_principal: true,
                activo: true
            })
            .select()
            .single()

        if (brError) throw new Error(`Error creating branch: ${brError.message}`)
        console.log(`✅ Main Branch Created: ${branch.nombre} (ID: ${branch.id})`)

        // 4. Create Admin User
        // Check if user exists first to avoid auth error
        // const { data: existingUsers } = await adminClient.auth.admin.listUsers() // Too slow if many users

        let userId: string

        // Try creating auth user
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
                nombres: 'Admin',
                apellido_paterno: companyName,
                rol: 'admin' // Metadata hint
            }
        })

        if (authError) {
            console.log(`⚠️  Auth User Creation Warning: ${authError.message}`)
            // If user already exists, we might want to just link them? 
            // For SaaS onboarding, usually email must be unique or we fail.
            // But for dev testing, let's try to fetch if exists.
            if (authError.message.includes("already signed up")) {
                console.log("   User exists, attempting to fetch ID to link...")
                // Need to find ID. We can search or ask user. Not easy without email search API in some versions.
                // admin.listUsers can filter?
                // Simple hack: abort.
                throw new Error("User already exists. Cannot reuse email for new tenant admin in this script yet.")
            }
            throw authError
        }

        userId = authUser.user.id
        console.log(`✅ Auth User Created: ${adminEmail}`)

        // 5. Link User to Tenant (public.usuarios)
        // Check if trigger created it
        const { data: publicUser } = await adminClient
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single()

        if (publicUser) {
            // Update it
            const { error: upError } = await adminClient
                .from('usuarios')
                .update({
                    empresa_id: company.id,
                    rol: 'admin',
                    nombres: 'Admin',
                    apellido_paterno: companyName
                })
                .eq('id', userId)

            if (upError) throw new Error(`Error updating public user: ${upError.message}`)
            console.log(`✅ Linked User to Tenant (Updated Triggered Row)`)
        } else {
            // Insert it
            const { error: inError } = await adminClient
                .from('usuarios')
                .insert({
                    id: userId,
                    email: adminEmail,
                    empresa_id: company.id,
                    rol: 'admin',
                    nombres: 'Admin',
                    apellido_paterno: companyName,
                    estado: 'activo'
                })

            if (inError) throw new Error(`Error inserting public user: ${inError.message}`)
            console.log(`✅ Linked User to Tenant (Inserted Row)`)
        }

        console.log('\n🎉 ONBOARDING COMPLETE!')
        console.log('-----------------------------------')
        console.log(`Login: ${adminEmail}`)
        console.log(`Password: ${adminPassword}`)
        console.log(`Company ID: ${company.id}`)
        console.log('-----------------------------------')

    } catch (e: any) {
        console.error('\n❌ ONBOARDING FAILED:', e.message)
    } finally {
        rl.close()
    }
}

main()
