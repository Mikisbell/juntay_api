/**
 * L2 Integration Test: Test actions with real DB
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testL2() {
    console.log('=== L2 INTEGRATION TESTS ===\n')

    let passed = 0
    let failed = 0

    // TEST 1: Scoring - Clientes y pagos existen
    console.log('📊 Test 1: Scoring - Datos para cálculo')
    const { data: clientes, error: e1 } = await supabase
        .from('clientes')
        .select('id, nombres')
        .limit(1)

    if (e1 || !clientes?.length) {
        console.log('  ❌ FAILED: No hay clientes\n')
        failed++
    } else {
        const clienteId = clientes[0].id
        const { data: pagos } = await supabase
            .from('pagos')
            .select('id, monto, created_at')
            .limit(5)

        console.log(`  ✅ PASSED: ${clientes.length} cliente, ${pagos?.length || 0} pagos`)
        console.log(`  Cliente test: ${clientes[0].nombres}\n`)
        passed++
    }

    // TEST 2: Banco - Insertar y leer transacción
    console.log('🏦 Test 2: Banco - CRUD transacciones')
    const testTx = {
        banco: 'bcp',
        fecha: '2025-12-19',
        descripcion: 'TEST - Depósito prueba',
        referencia: 'TEST-001',
        monto: 100.00,
        estado: 'pendiente'
    }

    const { data: txInserted, error: e2 } = await supabase
        .from('transacciones_bancarias')
        .insert(testTx)
        .select()
        .single()

    if (e2) {
        console.log(`  ❌ FAILED: ${e2.message}\n`)
        failed++
    } else {
        console.log(`  ✅ PASSED: Transacción creada ID: ${txInserted.id}`)

        // Cleanup
        await supabase.from('transacciones_bancarias').delete().eq('id', txInserted.id)
        console.log('  🧹 Limpieza: Transacción eliminada\n')
        passed++
    }

    // TEST 3: Sucursales - Leer sucursal por defecto
    console.log('🏪 Test 3: Sucursales - Lectura')
    const { data: sucursales, error: e3 } = await supabase
        .from('sucursales')
        .select('*')

    if (e3) {
        console.log(`  ❌ FAILED: ${e3.message}\n`)
        failed++
    } else {
        console.log(`  ✅ PASSED: ${sucursales?.length || 0} sucursales encontradas`)
        if (sucursales?.[0]) {
            console.log(`  Sucursal: ${sucursales[0].nombre} (${sucursales[0].codigo})\n`)
        }
        passed++
    }

    // TEST 4: Sucursales - Crear y eliminar
    console.log('🏪 Test 4: Sucursales - CRUD')
    const testSucursal = {
        codigo: 'TEST01',
        nombre: 'Sucursal Test',
        direccion: 'Dirección Test',
        activa: true
    }

    const { data: sucCreated, error: e4 } = await supabase
        .from('sucursales')
        .insert(testSucursal)
        .select()
        .single()

    if (e4) {
        console.log(`  ❌ FAILED: ${e4.message}\n`)
        failed++
    } else {
        console.log(`  ✅ PASSED: Sucursal creada ID: ${sucCreated.id}`)

        // Cleanup
        await supabase.from('sucursales').delete().eq('id', sucCreated.id)
        console.log('  🧹 Limpieza: Sucursal eliminada\n')
        passed++
    }

    // RESUMEN
    console.log('=== RESUMEN L2 ===')
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`Total: ${passed + failed}`)

    process.exit(failed > 0 ? 1 : 0)
}

testL2().catch(console.error)
