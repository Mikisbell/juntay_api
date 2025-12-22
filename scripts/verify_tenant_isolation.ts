import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error('❌ Missing environment variables (SUPABASE_URL, SERVICE_ROLE_KEY, ANON_KEY)')
    process.exit(1)
}

// Admin client (Service Role) - Can see everything
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

interface TestResult {
    test: string
    status: 'PASS' | 'FAIL'
    details: string
}

const results: TestResult[] = []

function log(test: string, passed: boolean, details: string) {
    const status = passed ? 'PASS' : 'FAIL'
    const icon = passed ? '✅' : '❌'
    console.log(`${icon} [${status}] ${test}`)
    if (details) console.log(`   └─ ${details}`)
    results.push({ test, status, details })
}

// Helpers
async function createTestTenant(name: string) {
    // 1. Create Company
    const { data: company, error: coError } = await adminClient
        .from('empresas')
        .insert({
            nombre_comercial: name,
            razon_social: `${name} S.A.C.`,
            ruc: `20${Math.floor(Math.random() * 1000000000)}`,
            direccion: 'Calle Falsa 123',
            telefono: '555-1234',
            email: `contact@${name.toLowerCase().replace(' ', '')}.com`,
            activo: true
        })
        .select()
        .single()

    if (coError) throw new Error(`Failed to create company ${name}: ${coError.message}`)

    // 2. Create Branch (Sucursal)
    const { data: branch, error: brError } = await adminClient
        .from('sucursales')
        .insert({
            empresa_id: company.id,
            nombre: `${name} Main Branch`,
            codigo: `SUC-${Math.floor(Math.random() * 10000)}`,
            direccion: 'Calle Falsa 123',
            telefono: '555-1234'
        })
        .select()
        .single()

    if (brError) throw new Error(`Failed to create branch for ${name}: ${brError.message}`)

    return { company, branch }
}

async function createTestUser(email: string, companyId: string, role: string = 'admin') {
    const password = 'TestPassword123!'

    // 1. Create Auth User
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nombres: `User ${companyId.substring(0, 4)}` }
    })

    if (authError) throw new Error(`Failed to create auth user ${email}: ${authError.message}`)

    // 2. Update 'usuarios' table with correct role and empresa_id
    // Note: The trigger usually creates the user, we act as admin to enforce correct empresa_id
    const { error: updateError } = await adminClient
        .from('usuarios')
        .update({
            empresa_id: companyId,
            rol: role
        })
        .eq('id', authUser.user.id)

    if (updateError) throw new Error(`Failed to update user profile ${email}: ${updateError.message}`)

    // Verify user exists
    const { data: userCheck } = await adminClient.from('usuarios').select('id, empresa_id').eq('id', authUser.user.id).single()
    if (!userCheck) {
        console.error(`   ⚠️ User ${email} not found in public.usuarios! Trigger might be missing or failed.`)
        // Manually insert if missing (Plan B)
        await adminClient.from('usuarios').insert({
            id: authUser.user.id,
            email: email,
            empresa_id: companyId,
            rol: role,
            nombres: 'User Test', // Minimum required
            apellido_paterno: 'Test' // If required
        })
    }

    return { user: authUser.user, email, password }
}

async function getClientAsUser(email: string, password: string): Promise<SupabaseClient> {
    const client = createClient(supabaseUrl, supabaseAnonKey!)
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw new Error(`Failed to login as ${email}: ${error.message}`)
    return client
}

async function main() {
    console.log('\n🔐 STARTING TENANT ISOLATION AUDIT')
    console.log('Targeting:', supabaseUrl)
    console.log('-----------------------------------\n')

    let tenantA: any, tenantB: any
    let userA: any, userB: any
    let clientA: SupabaseClient | undefined

    // SETUP
    try {
        console.log('🔧 SETUP: Creating Test Environment...')

        // 1. Create Tenants
        tenantA = await createTestTenant('TEST_TENANT_A')
        console.log(`   ✓ Created Tenant A (${tenantA.company.id})`)

        tenantB = await createTestTenant('TEST_TENANT_B')
        console.log(`   ✓ Created Tenant B (${tenantB.company.id})`)

        // 2. Create Users
        userA = await createTestUser(`usera_${Date.now()}@test.com`, tenantA.company.id)
        userB = await createTestUser(`userb_${Date.now()}@test.com`, tenantB.company.id) // Not strictly needed for logic but good for completeness

        // 3. Login as User A
        clientA = await getClientAsUser(userA.email, userA.password)
        console.log(`   ✓ Logged in as User A`)

        // 4. Inject Data
        // Client for Tenant A
        const { data: clienteA, error: errCA } = await adminClient.from('clientes').insert({
            empresa_id: tenantA.company.id,
            nombres: 'Cliente A Del Tenant A',
            tipo_documento: 'DNI',
            numero_documento: '10000001',
            email: 'clientea@test.com'
        }).select().single()
        if (errCA) throw new Error(`Err creating Client A: ${errCA.message}`)

        // Client for Tenant B
        const { data: clienteB, error: errCB } = await adminClient.from('clientes').insert({
            empresa_id: tenantB.company.id,
            nombres: 'Cliente B Del Tenant B',
            tipo_documento: 'DNI',
            numero_documento: '20000002',
            email: 'clienteb@test.com'
        }).select().single()
        if (errCB) throw new Error(`Err creating Client B: ${errCB.message}`)

        console.log(`   ✓ Injected Data (Client A in ID=${tenantA.company.id}, Client B in ID=${tenantB.company.id})`)

    } catch (e: any) {
        console.error('❌ SETUP FAILED:', e.message)
        await cleanup(tenantA, tenantB, userA, userB)
        process.exit(1)
    }

    // TESTS
    console.log('\n🧪 RUNNING SECURITY CHECKS...\n')

    try {
        if (!clientA) throw new Error("Client A not initialized")

        // DEBUG: Check Session
        const { data: { user: me } } = await clientA.auth.getUser()
        console.log(`   [DEBUG] User A ID: ${me?.id}`)

        // DEBUG: Check Access to Usuarios
        const { data: myUserRel, error: errUserRel } = await clientA.from('usuarios').select('*').eq('id', me?.id).single()
        console.log(`   [DEBUG] Read 'usuarios':`, errUserRel ? `FAIL ${errUserRel.message}` : `OK (Empresa: ${myUserRel?.empresa_id})`)

        // CHECK 1: User A sees Client A?
        const { data: data1, error: error1 } = await clientA
            .from('clientes')
            .select('*')
            .eq('id', (await adminClient.from('clientes').select('id').eq('empresa_id', tenantA.company.id).single()).data!.id)
            .single()

        log('Self-Access (User A -> Client A)',
            !error1 && data1,
            error1 ? error1.message : 'Successfully read own data')

        // CHECK 2: User A sees Client B?
        const { data: data2, error: error2 } = await clientA
            .from('clientes')
            .select('*')
            .eq('id', (await adminClient.from('clientes').select('id').eq('empresa_id', tenantB.company.id).single()).data!.id)
            .maybeSingle()

        // Expected: data2 is null (RLS hidden it) or error (RLS block)
        // Usually RLS returns empty set (null in single()) or empty array
        log('Cross-Tenant READ (User A -> Client B)',
            data2 === null,
            data2 ? 'SECURITY BREACH: Can see Client B!' : 'Access Denied (Correct)')

        // CHECK 3: User A inserts into Tenant B?
        const { error: error3 } = await clientA
            .from('clientes')
            .insert({
                empresa_id: tenantB.company.id, // Trying to inject into B
                nombres: 'Hacker Injection',
                tipo_documento: 'DNI',
                numero_documento: '99999999'
            })

        log('Cross-Tenant WRITE (User A insert -> Tenant B)',
            !!error3,
            error3 ? `Blocked: ${error3.message}` : 'SECURITY BREACH: Inserted data into Tenant B!')

        // CHECK 4: Verify User Profile Isolation
        const { data: myProfile } = await clientA.from('usuarios').select('empresa_id').single()
        log('User Profile Integrity',
            myProfile?.empresa_id === tenantA.company.id,
            `User points to correct tenant (${myProfile?.empresa_id})`)

    } catch (e: any) {
        console.error('❌ TESTS CRASHED:', e.message)
    } finally {
        await cleanup(tenantA, tenantB, userA, userB)
    }
}

async function cleanup(tenantA: any, tenantB: any, userA: any, userB: any) {
    console.log('\n🧹 CLEANUP...')
    try {
        if (userA) await adminClient.auth.admin.deleteUser(userA.user.id)
        if (userB) await adminClient.auth.admin.deleteUser(userB.user.id) // Optional, userB wasn't used but created
        // Deleting users cascades to 'usuarios'
        // We need to delete tenants. Deleting tenants might cascade but let's be explicitly careful or let cascade handle it if configured
        // Assuming NO Cascade on companies for safety in prod, but for tests check constraints

        // Clean data first if no cascade
        if (tenantA) {
            await adminClient.from('clientes').delete().eq('empresa_id', tenantA.company.id)
            await adminClient.from('sucursales').delete().eq('empresa_id', tenantA.company.id)
            await adminClient.from('empresas').delete().eq('id', tenantA.company.id)
        }
        if (tenantB) {
            await adminClient.from('clientes').delete().eq('empresa_id', tenantB.company.id)
            await adminClient.from('sucursales').delete().eq('empresa_id', tenantB.company.id)
            await adminClient.from('empresas').delete().eq('id', tenantB.company.id)
        }
        console.log('   ✓ Cleanup complete')
    } catch (e: any) {
        console.error('   ⚠️ Cleanup partial failed:', e.message)
    }

    // Summary
    const failed = results.filter(r => r.status === 'FAIL').length
    console.log('\n-----------------------------------')
    console.log(`Final Result: ${failed === 0 ? '✅ PASSED' : '❌ FAILED'} (${results.length - failed}/${results.length})`)
    if (failed > 0) process.exit(1)
}

main()
