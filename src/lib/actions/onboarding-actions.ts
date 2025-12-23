'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface OnboardingInput {
    companyName: string
    ruc?: string
    adminEmail: string
    adminPassword?: string
    plan?: 'Free' | 'Pro' | 'Enterprise'
}

export interface OnboardingResult {
    success: boolean
    message?: string
    companyId?: string
    adminId?: string
    error?: string | null
}

/**
 * Onboard a new Tenant (SaaS)
 * Creates: Empresa -> Sucursal -> Admin User -> Default Data
 */
export async function onboardNewTenant(data: OnboardingInput): Promise<OnboardingResult> {
    const supabaseAdmin = createAdminClient()

    console.log('[Onboarding] Starting for:', data.companyName)

    try {
        // 1. Create Company (Empresa)
        const { data: company, error: coError } = await supabaseAdmin
            .from('empresas')
            .insert({
                nombre_comercial: data.companyName,
                razon_social: `${data.companyName}`, // Default to same name
                ruc: data.ruc || `${Date.now() % 100000000000}`.padStart(11, '0'), // Unique 11-digit placeholder
                activo: true,
                direccion: 'Dirección por defecto',
                email: data.adminEmail,
                telefono: '',
                // plan: data.plan || 'Free' // Assuming schema has 'plan' or similar config, if not, skip
            })
            .select()
            .single()

        if (coError) throw new Error(`Error creating company: ${coError.message}`)
        console.log(`[Onboarding] Company Created: ${company.id}`)

        // 2. Create Main Branch (Sucursal Principal)
        const { data: branch, error: brError } = await supabaseAdmin
            .from('sucursales')
            .insert({
                empresa_id: company.id,
                nombre: 'Sede Principal',
                codigo: `M${company.id.substring(0, 9)}`, // Max 10 chars for varchar(10)
                direccion: 'Dirección Principal',
                telefono: '',
                es_principal: true,
                activa: true // Column is 'activa' not 'activo'
            })
            .select()
            .single()

        if (brError) throw new Error(`Error creating branch: ${brError.message}`)
        console.log(`[Onboarding] Main Branch Created: ${branch.id}`)

        // 3. Create Admin User (Auth + Public)
        const password = data.adminPassword || 'TempPass123!'

        // Check if user exists first to avoid fatal error
        // Note: listUsers is rate limited or slow, but safer for onboarding. 
        // For now, try create and catch error works best for single attempts.

        let userId: string

        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: data.adminEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
                nombres: 'Admin',
                apellido_paterno: data.companyName,
                rol: 'admin'
            }
        })

        if (authError) {
            // Handle "User already registered" case
            if (authError.message.includes('already registered') || authError.message.includes('already signed up')) {
                console.log('[Onboarding] User exists, trying to find ID...')
                const { data: usersData } = await supabaseAdmin.auth.admin.listUsers() // Warning: pagination needed in prod
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const existing = (usersData?.users as Array<{ id: string; email?: string }>)?.find(u => u.email === data.adminEmail)
                if (!existing) throw new Error('User exists but could not be found to link.')
                userId = existing.id
            } else {
                throw authError
            }
        } else {
            userId = authUser.user.id
        }

        // 4. Link/Update Public User (usuarios table)
        // Check if public record exists
        const { data: publicUser } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('id', userId)
            .single()

        if (publicUser) {
            const { error: upError } = await supabaseAdmin
                .from('usuarios')
                .update({
                    empresa_id: company.id,
                    rol: 'admin',
                    nombres: 'Admin',
                    apellido_paterno: data.companyName
                })
                .eq('id', userId)
            if (upError) throw new Error(`Error updating user: ${upError.message}`)
        } else {
            const { error: inError } = await supabaseAdmin
                .from('usuarios')
                .insert({
                    id: userId,
                    email: data.adminEmail,
                    empresa_id: company.id,
                    rol: 'admin',
                    nombres: 'Admin',
                    apellido_paterno: data.companyName,
                    apellido_materno: '',
                    activo: true // Column is 'activo' not 'estado'
                })
            if (inError) throw new Error(`Error inserting user: ${inError.message}`)
        }
        console.log(`[Onboarding] User Linked: ${userId}`)

        // 5. Seed Default Data (Categories & Rates)
        await seedDefaultData(supabaseAdmin, company.id)

        return {
            success: true,
            companyId: company.id,
            adminId: userId,
            message: 'Tenant created successfully'
        }

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('[Onboarding] Failed:', errMsg)
        return {
            success: false,
            error: errMsg
        }
    }
}

async function seedDefaultData(_supabase: ReturnType<typeof createAdminClient>, empresaId: string) {
    console.log(`[Onboarding] Seeding default data for empresa ${empresaId}...`)

    // Note: categorias_garantia is a GLOBAL lookup table (Oro, Plata, Electrónicos, etc.)
    // It does NOT have empresa_id, so no per-tenant seeding needed.
    // All tenants share the same categories.

    // TODO: If tenant-specific configurations are needed in the future, add here.
    // Options: 
    // - configuracion_empresa: store empresa settings (tasas, días gracia, etc.)
    // - productos_empresa: tenant-specific product categories

    console.log('[Onboarding] Default data seeded. (No tenant-specific categories needed)')
}
