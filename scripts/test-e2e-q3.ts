/**
 * E2E Integration Tests for Q3 Features
 * 
 * Tests all features with REAL database connection
 * Run with: npx tsx scripts/test-e2e-q3.ts
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface TestResult {
    name: string
    passed: boolean
    message: string
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>) {
    try {
        await fn()
        results.push({ name, passed: true, message: 'OK' })
        console.log(`  ✅ ${name}`)
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        results.push({ name, passed: false, message: msg })
        console.log(`  ❌ ${name}: ${msg}`)
    }
}

// ============================================================
// FEATURE 1: SCORING CLIENTE
// ============================================================
async function testScoring() {
    console.log('\n📊 SCORING CLIENTE')

    await test('Clientes existen para scoring', async () => {
        const { data, error } = await supabase
            .from('clientes')
            .select('id, nombres, numero_documento')
            .limit(3)

        if (error) throw new Error(error.message)
        if (!data || data.length === 0) throw new Error('No hay clientes')
        console.log(`    → ${data.length} clientes disponibles`)
    })

    await test('Pagos existen para historial', async () => {
        const { data, error } = await supabase
            .from('pagos')
            .select('id, monto_total, credito_id')
            .limit(5)

        if (error) throw new Error(error.message)
        console.log(`    → ${data?.length || 0} pagos encontrados`)
    })
}

// ============================================================
// FEATURE 2: INTEGRACIÓN BANCARIA
// ============================================================
async function testBanco() {
    console.log('\n🏦 INTEGRACIÓN BANCARIA')

    let txId: string | null = null

    await test('Crear transacción bancaria', async () => {
        const { data, error } = await supabase
            .from('transacciones_bancarias')
            .insert({
                banco: 'bcp',
                fecha: '2025-12-20',
                descripcion: 'E2E TEST - Depósito',
                referencia: 'E2E-' + Date.now(),
                monto: 250.00,
                estado: 'pendiente'
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        txId = data.id
    })

    await test('Leer transacción creada', async () => {
        if (!txId) throw new Error('No hay TX')

        const { data, error } = await supabase
            .from('transacciones_bancarias')
            .select('*')
            .eq('id', txId)
            .single()

        if (error) throw new Error(error.message)
        if (data.estado !== 'pendiente') throw new Error('Estado incorrecto')
    })

    await test('Actualizar estado a conciliado', async () => {
        if (!txId) throw new Error('No hay TX')

        const { error } = await supabase
            .from('transacciones_bancarias')
            .update({ estado: 'conciliado' })
            .eq('id', txId)

        if (error) throw new Error(error.message)
    })

    await test('Eliminar transacción (cleanup)', async () => {
        if (txId) {
            const { error } = await supabase
                .from('transacciones_bancarias')
                .delete()
                .eq('id', txId)
            if (error) throw new Error(error.message)
        }
    })
}

// ============================================================
// FEATURE 3: MULTI-SUCURSAL
// ============================================================
async function testSucursales() {
    console.log('\n🏪 MULTI-SUCURSAL')

    let sucursalId: string | null = null

    await test('Crear sucursal', async () => {
        const { data, error } = await supabase
            .from('sucursales')
            .insert({
                codigo: 'E2E' + Date.now().toString().slice(-4),
                nombre: 'Sucursal E2E Test',
                direccion: 'Av. Test 123',
                activa: true
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        sucursalId = data.id
    })

    await test('Listar sucursales', async () => {
        const { data, error } = await supabase
            .from('sucursales')
            .select('id, codigo, nombre')

        if (error) throw new Error(error.message)
        console.log(`    → ${data?.length || 0} sucursales`)
    })

    await test('Actualizar sucursal', async () => {
        if (!sucursalId) throw new Error('No hay sucursal')

        const { error } = await supabase
            .from('sucursales')
            .update({ nombre: 'E2E Updated' })
            .eq('id', sucursalId)

        if (error) throw new Error(error.message)
    })

    await test('Eliminar sucursal (cleanup)', async () => {
        if (sucursalId) {
            const { error } = await supabase
                .from('sucursales')
                .delete()
                .eq('id', sucursalId)
            if (error) throw new Error(error.message)
        }
    })
}

// ============================================================
// FEATURE 4: REMATES
// ============================================================
async function testRemates() {
    console.log('\n🔨 REMATES')

    let garantiaId: string | null = null
    let ventaId: string | null = null

    await test('Buscar garantía existente', async () => {
        const { data, error } = await supabase
            .from('garantias')
            .select('id, descripcion, valor_tasacion')
            .limit(1)
            .single()

        if (error) throw new Error(error.message)
        garantiaId = data.id
        console.log(`    → Garantía: ${data.descripcion?.slice(0, 30)}...`)
    })

    await test('Marcar para remate', async () => {
        if (!garantiaId) throw new Error('No hay garantía')

        const { error } = await supabase
            .from('garantias')
            .update({ para_remate: true })
            .eq('id', garantiaId)

        if (error) throw new Error(error.message)
    })

    await test('Registrar venta', async () => {
        if (!garantiaId) throw new Error('No hay garantía')

        const { data, error } = await supabase
            .from('ventas_remates')
            .insert({
                articulo_id: garantiaId,
                precio_venta: 600,
                valor_original: 500,
                utilidad: 100,
                comprador: 'E2E Test Buyer',
                metodo_pago: 'efectivo'
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        ventaId = data.id
    })

    await test('Verificar utilidad', async () => {
        if (!ventaId) throw new Error('No hay venta')

        const { data, error } = await supabase
            .from('ventas_remates')
            .select('utilidad')
            .eq('id', ventaId)
            .single()

        if (error) throw new Error(error.message)
        if (data.utilidad !== 100) throw new Error(`Utilidad: ${data.utilidad}`)
    })

    await test('Cleanup remates', async () => {
        if (ventaId) await supabase.from('ventas_remates').delete().eq('id', ventaId)
        if (garantiaId) await supabase.from('garantias').update({ para_remate: false }).eq('id', garantiaId)
    })
}

// ============================================================
// FEATURE 5: APP COBRADOR
// ============================================================
async function testCobrador() {
    console.log('\n📱 APP COBRADOR')

    let visitaId: string | null = null
    let empleadoId: string | null = null
    let creditoId: string | null = null

    await test('Buscar empleado y crédito', async () => {
        const { data: emp } = await supabase.from('empleados').select('id').limit(1).single()
        const { data: cred } = await supabase.from('creditos').select('id').limit(1).single()

        if (!emp) throw new Error('No hay empleados')
        if (!cred) throw new Error('No hay créditos')

        empleadoId = emp.id
        creditoId = cred.id
    })

    await test('Registrar ubicación', async () => {
        if (!empleadoId) throw new Error('No hay empleado')

        const { error } = await supabase
            .from('ubicaciones_cobradores')
            .upsert({
                cobrador_id: empleadoId,
                ubicacion: { lat: -12.0464, lng: -77.0428 }
            })

        if (error) throw new Error(error.message)
    })

    await test('Registrar visita', async () => {
        if (!empleadoId || !creditoId) throw new Error('Datos faltantes')

        const { data, error } = await supabase
            .from('visitas')
            .insert({
                cobrador_id: empleadoId,
                credito_id: creditoId,
                resultado: 'promesa_pago',
                notas: 'E2E Test',
                ubicacion: { lat: -12.0464, lng: -77.0428 }
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        visitaId = data.id
    })

    await test('Cleanup visita', async () => {
        if (visitaId) await supabase.from('visitas').delete().eq('id', visitaId)
        if (empleadoId) await supabase.from('ubicaciones_cobradores').delete().eq('cobrador_id', empleadoId)
    })
}

// ============================================================
// FEATURE 6: GALERÍA FOTOS
// ============================================================
async function testFotos() {
    console.log('\n📷 GALERÍA FOTOS')

    let fotoId: string | null = null
    let garantiaId: string | null = null

    await test('Buscar garantía', async () => {
        const { data, error } = await supabase
            .from('garantias')
            .select('id')
            .limit(1)
            .single()

        if (error) throw new Error(error.message)
        garantiaId = data.id
    })

    await test('Agregar foto', async () => {
        if (!garantiaId) throw new Error('No hay garantía')

        const { data, error } = await supabase
            .from('fotos_garantia')
            .insert({
                garantia_id: garantiaId,
                url: 'https://example.com/e2e-test.jpg',
                descripcion: 'E2E Test Photo',
                tipo: 'foto',
                es_principal: false
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        fotoId = data.id
    })

    await test('Listar fotos', async () => {
        if (!garantiaId) throw new Error('No hay garantía')

        const { data, error } = await supabase
            .from('fotos_garantia')
            .select('*')
            .eq('garantia_id', garantiaId)

        if (error) throw new Error(error.message)
        console.log(`    → ${data?.length || 0} fotos`)
    })

    await test('Marcar como principal', async () => {
        if (!fotoId) throw new Error('No hay foto')

        const { error } = await supabase
            .from('fotos_garantia')
            .update({ es_principal: true })
            .eq('id', fotoId)

        if (error) throw new Error(error.message)
    })

    await test('Cleanup foto', async () => {
        if (fotoId) await supabase.from('fotos_garantia').delete().eq('id', fotoId)
    })
}

// ============================================================
// MAIN
// ============================================================
async function main() {
    console.log('╔══════════════════════════════════════════╗')
    console.log('║     E2E INTEGRATION TESTS - Q3 FEATURES  ║')
    console.log('╚══════════════════════════════════════════╝')

    await testScoring()
    await testBanco()
    await testSucursales()
    await testRemates()
    await testCobrador()
    await testFotos()

    // Summary
    console.log('\n╔══════════════════════════════════════════╗')
    console.log('║               RESUMEN                    ║')
    console.log('╚══════════════════════════════════════════╝')

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length

    console.log(`\n✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📈 Rate:   ${Math.round(passed / (passed + failed) * 100)}%`)

    if (failed > 0) {
        console.log('\n❌ FAILED:')
        results.filter(r => !r.passed).forEach(r => {
            console.log(`   - ${r.name}: ${r.message}`)
        })
    }

    process.exit(failed > 0 ? 1 : 0)
}

main().catch(console.error)
