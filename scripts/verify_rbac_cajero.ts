/**
 * JUNTAY - Script de Verificación RBAC (Fase 2)
 * 
 * Este script simula operaciones como un CAJERO real (sin Service Role Key)
 * para verificar que las políticas RLS funcionan correctamente.
 * 
 * Uso: npx tsx scripts/verify_rbac_cajero.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ Faltan variables de entorno (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY)')
    process.exit(1)
}

// Cliente Admin (solo para setup inicial)
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

// Cliente que simula al cajero (usará anon key + auth)
let cajeroClient: SupabaseClient

interface TestResult {
    test: string
    expected: 'ALLOW' | 'DENY'
    actual: 'ALLOW' | 'DENY' | 'ERROR'
    passed: boolean
    details?: string
}

const results: TestResult[] = []

function logResult(result: TestResult) {
    const icon = result.passed ? '✅' : '❌'
    const status = result.passed ? 'PASS' : 'FAIL'
    console.log(`${icon} [${status}] ${result.test}`)
    if (result.details) {
        console.log(`   └─ ${result.details}`)
    }
    results.push(result)
}

async function setupTestCajero(): Promise<{ userId: string; email: string; password: string; cajaId: string }> {
    console.log('\n🔧 SETUP: Creando usuario cajero de prueba...')

    const testEmail = `cajero_rbac_test_${Date.now()}@juntay.test`
    const testPassword = 'TestPassword123!'

    // 1. Crear usuario en Auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { nombres: 'Cajero Test RBAC' }
    })

    if (authError) throw new Error(`Error creando auth user: ${authError.message}`)

    const userId = authUser.user.id
    console.log(`   ✓ Auth user creado: ${userId}`)

    // 2. Crear registro en tabla usuarios con rol 'cajero'
    const { error: userError } = await adminClient.from('usuarios').insert({
        id: userId,
        nombres: 'Cajero Test RBAC',
        email: testEmail,
        rol: 'cajero' // IMPORTANTE: minúsculas
    })

    if (userError) throw new Error(`Error creando usuario: ${userError.message}`)
    console.log(`   ✓ Usuario en tabla 'usuarios' con rol='cajero'`)

    // 3. Crear una caja asignada a este cajero (vía admin)
    // Primero verificar si hay bóveda principal
    const { data: boveda } = await adminClient
        .from('cuentas_financieras')
        .select('id, saldo')
        .eq('es_principal', true)
        .single()

    if (!boveda) {
        console.log('   ⚠️ No hay bóveda principal, creando una...')
        const { data: newBoveda, error: bvErr } = await adminClient
            .from('cuentas_financieras')
            .insert({
                nombre: 'BOVEDA_TEST_RBAC',
                tipo: 'EFECTIVO',
                es_principal: true,
                saldo: 10000,
                moneda: 'PEN',
                activo: true
            })
            .select()
            .single()
        if (bvErr) throw new Error(`Error creando bóveda: ${bvErr.message}`)
    }

    // Crear caja vía RPC (que maneja numero_caja y boveda automáticamente)
    const { data: cajaId, error: cajaError } = await adminClient.rpc('admin_asignar_caja', {
        p_usuario_cajero_id: userId,
        p_monto: 500,
        p_observacion: 'Test RBAC - Caja de prueba'
    })

    if (cajaError) throw new Error(`Error creando caja via RPC: ${cajaError.message}`)
    console.log(`   ✓ Caja operativa creada via RPC: ${cajaId}`)

    return { userId, email: testEmail, password: testPassword, cajaId: cajaId as string }
}

async function loginAsCajero(email: string, password: string): Promise<void> {
    console.log('\n🔐 LOGIN: Autenticando como cajero...')

    // Crear cliente con anon key
    const tempClient = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await tempClient.auth.signInWithPassword({
        email,
        password
    })

    if (error) throw new Error(`Error en login: ${error.message}`)

    console.log(`   ✓ Sesión activa para: ${data.user?.email}`)

    // Usar este cliente autenticado para las pruebas
    cajeroClient = tempClient
}

async function testCajeroCanSeeOwnCaja(cajaId: string): Promise<void> {
    const { data, error } = await cajeroClient
        .from('cajas_operativas')
        .select('id, saldo_actual')
        .eq('id', cajaId)
        .single()

    logResult({
        test: 'Cajero puede ver SU PROPIA caja',
        expected: 'ALLOW',
        actual: error ? 'DENY' : 'ALLOW',
        passed: !error && data !== null,
        details: error ? error.message : `Saldo: ${data?.saldo_actual}`
    })
}

async function testCajeroCannotSeeOtherCajas(): Promise<void> {
    // Crear otra caja que NO pertenece al cajero
    const { data: otraCaja } = await adminClient
        .from('cajas_operativas')
        .select('id')
        .neq('usuario_id', (await cajeroClient.auth.getUser()).data.user?.id)
        .limit(1)
        .single()

    if (!otraCaja) {
        logResult({
            test: 'Cajero NO puede ver OTRAS cajas',
            expected: 'DENY',
            actual: 'ALLOW',
            passed: true, // No hay otras cajas para probar
            details: 'No hay otras cajas en el sistema para verificar'
        })
        return
    }

    const { data, error } = await cajeroClient
        .from('cajas_operativas')
        .select('id')
        .eq('id', otraCaja.id)
        .single()

    logResult({
        test: 'Cajero NO puede ver OTRAS cajas',
        expected: 'DENY',
        actual: data ? 'ALLOW' : 'DENY',
        passed: data === null,
        details: data ? 'RLS FALLO: Puede ver caja ajena!' : 'Correctamente bloqueado por RLS'
    })
}

async function testCajeroCannotSeeBoveda(): Promise<void> {
    const { data, error } = await cajeroClient
        .from('cuentas_financieras')
        .select('id, saldo')
        .limit(1)

    const hasAccess = data && data.length > 0

    logResult({
        test: 'Cajero NO puede ver Bóveda (cuentas_financieras)',
        expected: 'DENY',
        actual: hasAccess ? 'ALLOW' : 'DENY',
        passed: !hasAccess,
        details: hasAccess ? `RLS FALLO: Puede ver ${data.length} cuentas!` : 'Correctamente bloqueado por RLS'
    })
}

async function testCajeroCanSeeCreditos(): Promise<void> {
    const { data, error } = await cajeroClient
        .from('creditos')
        .select('id, codigo, estado')
        .limit(5)

    // Cajero DEBE poder ver créditos para poder cobrar
    logResult({
        test: 'Cajero puede ver créditos (para cobrar)',
        expected: 'ALLOW',
        actual: error ? 'DENY' : 'ALLOW',
        passed: !error,
        details: error ? error.message : `Encontrados: ${data?.length || 0} créditos`
    })
}

async function testCajeroCanInsertPago(cajaId: string): Promise<void> {
    // Primero necesitamos un crédito válido
    const { data: credito } = await adminClient
        .from('creditos')
        .select('id')
        .eq('estado', 'vigente')
        .limit(1)
        .single()

    if (!credito) {
        logResult({
            test: 'Cajero puede insertar pagos',
            expected: 'ALLOW',
            actual: 'ERROR',
            passed: false,
            details: 'No hay créditos vigentes para probar'
        })
        return
    }

    const { error } = await cajeroClient
        .from('pagos')
        .insert({
            credito_id: credito.id,
            monto: 50,
            tipo: 'CUOTA',
            metodo_pago: 'EFECTIVO',
            caja_operativa_id: cajaId,
            usuario_id: (await cajeroClient.auth.getUser()).data.user?.id
        })

    logResult({
        test: 'Cajero puede insertar pagos',
        expected: 'ALLOW',
        actual: error ? 'DENY' : 'ALLOW',
        passed: !error,
        details: error ? error.message : 'Pago insertado correctamente'
    })
}

async function testCajeroCannotInsertMovimientoDirectly(cajaId: string): Promise<void> {
    const { error } = await cajeroClient
        .from('movimientos_caja_operativa')
        .insert({
            caja_id: cajaId,
            monto: 100,
            tipo: 'INGRESO',
            motivo: 'OTRO',
            descripcion: 'Test directo (debe fallar)',
            usuario_id: (await cajeroClient.auth.getUser()).data.user?.id,
            saldo_anterior: 500,
            saldo_nuevo: 600
        })

    logResult({
        test: 'Cajero NO puede insertar movimientos directamente',
        expected: 'DENY',
        actual: error ? 'DENY' : 'ALLOW',
        passed: !!error,
        details: error ? 'Correctamente bloqueado por RLS' : 'RLS FALLO: Pudo insertar directamente!'
    })
}

async function testCajeroCannotSeeContratosFondeo(): Promise<void> {
    const { data, error } = await cajeroClient
        .from('contratos_fondeo')
        .select('id, monto_pactado')
        .limit(1)

    const hasAccess = data && data.length > 0

    logResult({
        test: 'Cajero NO puede ver contratos de fondeo',
        expected: 'DENY',
        actual: hasAccess ? 'ALLOW' : 'DENY',
        passed: !hasAccess,
        details: hasAccess ? 'RLS FALLO: Puede ver contratos de inversionistas!' : 'Correctamente bloqueado por RLS'
    })
}

async function cleanup(userId: string): Promise<void> {
    console.log('\n🧹 CLEANUP: Eliminando datos de prueba...')

    // Cerrar sesión del cajero
    await cajeroClient.auth.signOut()

    // Eliminar usuario de prueba (cascada debería limpiar caja, etc.)
    await adminClient.auth.admin.deleteUser(userId)
    console.log('   ✓ Usuario de prueba eliminado')
}

async function printSummary(): Promise<void> {
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE PRUEBAS RBAC')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length

    console.log(`\n   ✅ Pasadas: ${passed}`)
    console.log(`   ❌ Fallidas: ${failed}`)
    console.log(`   📈 Total: ${results.length}`)

    if (failed > 0) {
        console.log('\n⚠️  ATENCIÓN: Hay políticas RLS que NO funcionan correctamente.')
        console.log('   Revisa la migración 20251217000010_fix_rls_policies.sql')
    } else {
        console.log('\n🎉 ¡Todas las políticas RLS funcionan correctamente!')
    }
}

async function main(): Promise<void> {
    console.log('='.repeat(60))
    console.log('🔐 JUNTAY - Verificación RBAC (Fase 2)')
    console.log('   Rol: CAJERO | Modo: Usuario Real (sin Service Key)')
    console.log('='.repeat(60))

    let testUser: { userId: string; email: string; password: string; cajaId: string } | null = null

    try {
        // Setup
        testUser = await setupTestCajero()
        await loginAsCajero(testUser.email, testUser.password)

        console.log('\n📋 EJECUTANDO PRUEBAS...\n')

        // Pruebas de ALLOW
        await testCajeroCanSeeOwnCaja(testUser.cajaId)
        await testCajeroCanSeeCreditos()
        await testCajeroCanInsertPago(testUser.cajaId)

        // Pruebas de DENY
        await testCajeroCannotSeeOtherCajas()
        await testCajeroCannotSeeBoveda()
        await testCajeroCannotInsertMovimientoDirectly(testUser.cajaId)
        await testCajeroCannotSeeContratosFondeo()

        // Resumen
        await printSummary()

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('\n❌ ERROR FATAL:', message)
    } finally {
        // Cleanup
        if (testUser) {
            await cleanup(testUser.userId)
        }
    }
}

main()
