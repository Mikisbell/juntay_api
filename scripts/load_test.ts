/**
 * PRUEBAS DE CARGA ESTILO JMETER - JUNTAY
 * 
 * Simula:
 * - Usuarios concurrentes
 * - Throughput (requests/segundo)
 * - Latencia (p50, p90, p99)
 * - Tiempo de respuesta
 * - Errores bajo carga
 * 
 * Ejecutar: npx tsx scripts/load_test.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TestResult {
    name: string
    success: boolean
    responseTime: number
    error?: string
}

interface LoadTestConfig {
    name: string
    concurrentUsers: number
    iterations: number
    rampUpSeconds: number
    testFn: () => Promise<void>
}

// Calcular percentiles
function percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b)
    const idx = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, idx)]
}

// Crear cliente para cada "usuario virtual"
function createVirtualUser() {
    return createClient(supabaseUrl, supabaseServiceKey)
}

// ============================================================================
// ESCENARIOS DE CARGA (como JMeter Thread Groups)
// ============================================================================

// Escenario 1: Búsqueda de clientes
async function searchClients(supabase: ReturnType<typeof createClient>) {
    await supabase
        .from('clientes')
        .select('id, nombres, apellido_paterno, numero_documento')
        .ilike('nombres', '%a%')
        .limit(10)
}

// Escenario 2: Listar créditos vigentes
async function listActiveCredits(supabase: ReturnType<typeof createClient>) {
    await supabase
        .from('creditos')
        .select('id, codigo, monto_prestado, estado, fecha_vencimiento')
        .eq('estado', 'vigente')
        .order('fecha_vencimiento', { ascending: true })
        .limit(50)
}

// Escenario 3: Ver detalle de crédito con joins
async function getCreditDetail(supabase: ReturnType<typeof createClient>) {
    const { data: credits } = await supabase
        .from('creditos')
        .select('id')
        .limit(1)

    if (credits && credits.length > 0) {
        const creditId = (credits[0] as { id: string }).id
        await supabase
            .from('creditos')
            .select(`
                *,
                clientes (nombres, apellido_paterno, telefono_principal),
                garantias (descripcion, valor_tasacion, estado)
            `)
            .eq('id', creditId)
            .single()
    }
}

// Escenario 4: Dashboard de vencimientos
async function getDashboardData(supabase: ReturnType<typeof createClient>) {
    // Simula carga de dashboard
    await Promise.all([
        supabase
            .from('creditos')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'vigente'),
        supabase
            .from('creditos')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'vencido'),
        supabase
            .from('creditos')
            .select('id, codigo, fecha_vencimiento')
            .lte('fecha_vencimiento', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
            .limit(10)
    ])
}

// Escenario 5: Verificar saldo de caja
async function checkCajaBalance(supabase: ReturnType<typeof createClient>) {
    await supabase
        .from('cajas_operativas')
        .select('id, saldo_actual, estado')
        .eq('estado', 'abierta')
        .limit(1)
}

// Escenario 6: Historial de movimientos
async function getMovimientosHistory(supabase: ReturnType<typeof createClient>) {
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id')
        .eq('estado', 'abierta')
        .limit(1)
        .single()

    if (caja) {
        const cajaId = (caja as { id: string }).id
        await supabase
            .from('movimientos_caja_operativa')
            .select('*')
            .eq('caja_operativa_id', cajaId)
            .order('fecha', { ascending: false })
            .limit(50)
    }
}

// Escenario 7: Búsqueda por DNI (muy frecuente)
async function searchByDNI(supabase: ReturnType<typeof createClient>) {
    const randomDNI = `${Math.floor(10000000 + Math.random() * 90000000)}`
    await supabase
        .from('clientes')
        .select('*')
        .eq('numero_documento', randomDNI)
}

// Escenario 8: Inserción de datos (write test)
async function writeTest(supabase: ReturnType<typeof createClient>) {
    // Insertar en audit_log (tabla de prueba)
    await supabase
        .from('audit_log')
        .insert({
            tabla: 'load_test',
            registro_id: '00000000-0000-0000-0000-000000000000',
            accion: 'LOAD_TEST',
            metadata: { timestamp: Date.now() }
        })
}

// ============================================================================
// MOTOR DE CARGA
// ============================================================================

async function runLoadTest(config: LoadTestConfig): Promise<TestResult[]> {
    const results: TestResult[] = []
    const supabase = createVirtualUser()

    for (let i = 0; i < config.iterations; i++) {
        const start = Date.now()
        let success = true
        let error: string | undefined

        try {
            await config.testFn()
        } catch (e) {
            success = false
            error = (e as Error).message
        }

        results.push({
            name: config.name,
            success,
            responseTime: Date.now() - start,
            error
        })
    }

    return results
}

async function runConcurrentTest(
    name: string,
    testFn: (supabase: ReturnType<typeof createClient>) => Promise<void>,
    concurrentUsers: number,
    iterationsPerUser: number
): Promise<TestResult[]> {
    console.log(`\n🔥 ${name}`)
    console.log(`   Usuarios: ${concurrentUsers} | Iteraciones: ${iterationsPerUser}/usuario`)

    const startTime = Date.now()
    const allResults: TestResult[] = []

    // Crear "usuarios virtuales" concurrentes
    const userPromises = Array(concurrentUsers).fill(null).map(async (_, userIndex) => {
        const supabase = createVirtualUser()
        const userResults: TestResult[] = []

        for (let i = 0; i < iterationsPerUser; i++) {
            const start = Date.now()
            let success = true
            let error: string | undefined

            try {
                await testFn(supabase)
            } catch (e) {
                success = false
                error = (e as Error).message
            }

            userResults.push({
                name: `${name}_user${userIndex}_iter${i}`,
                success,
                responseTime: Date.now() - start,
                error
            })
        }

        return userResults
    })

    // Ejecutar todos los usuarios en paralelo
    const resultsArrays = await Promise.all(userPromises)
    resultsArrays.forEach(r => allResults.push(...r))

    const totalTime = Date.now() - startTime
    const times = allResults.map(r => r.responseTime)
    const successes = allResults.filter(r => r.success).length
    const failures = allResults.filter(r => !r.success).length

    console.log(`   Tiempo total: ${totalTime}ms`)
    console.log(`   Éxitos: ${successes} | Fallos: ${failures}`)
    console.log(`   Latencia: min=${Math.min(...times)}ms, p50=${percentile(times, 50)}ms, p90=${percentile(times, 90)}ms, p99=${percentile(times, 99)}ms, max=${Math.max(...times)}ms`)
    console.log(`   Throughput: ${(allResults.length / (totalTime / 1000)).toFixed(2)} req/s`)

    return allResults
}

// ============================================================================
// SUITE DE PRUEBAS
// ============================================================================

async function runFullLoadTestSuite() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║         🔥 PRUEBAS DE CARGA ESTILO JMETER 🔥               ║')
    console.log('╚════════════════════════════════════════════════════════════╝')

    const allResults: TestResult[] = []

    // Test 1: Búsqueda de clientes (10 usuarios, 20 iteraciones)
    allResults.push(...await runConcurrentTest(
        'Búsqueda de clientes',
        searchClients,
        10, 20
    ))

    // Test 2: Listar créditos vigentes (15 usuarios, 15 iteraciones)
    allResults.push(...await runConcurrentTest(
        'Listar créditos vigentes',
        listActiveCredits,
        15, 15
    ))

    // Test 3: Detalle de crédito con joins (10 usuarios, 10 iteraciones)
    allResults.push(...await runConcurrentTest(
        'Detalle crédito con joins',
        getCreditDetail,
        10, 10
    ))

    // Test 4: Dashboard (carga pesada - 20 usuarios, 10 iteraciones)
    allResults.push(...await runConcurrentTest(
        'Dashboard de vencimientos',
        getDashboardData,
        20, 10
    ))

    // Test 5: Verificar caja (operación frecuente - 25 usuarios, 20 iteraciones)
    allResults.push(...await runConcurrentTest(
        'Verificar saldo caja',
        checkCajaBalance,
        25, 20
    ))

    // Test 6: Historial movimientos (10 usuarios, 15 iteraciones)
    allResults.push(...await runConcurrentTest(
        'Historial movimientos',
        getMovimientosHistory,
        10, 15
    ))

    // Test 7: Búsqueda por DNI (muy frecuente - 30 usuarios, 30 iteraciones)
    allResults.push(...await runConcurrentTest(
        'Búsqueda por DNI',
        searchByDNI,
        30, 30
    ))

    // Test 8: Escritura (5 usuarios, 10 iteraciones)
    allResults.push(...await runConcurrentTest(
        'Escritura (INSERT)',
        writeTest,
        5, 10
    ))

    // ============================================================================
    // RESUMEN FINAL
    // ============================================================================

    console.log('\n' + '═'.repeat(60))
    console.log('                    📊 RESUMEN FINAL')
    console.log('═'.repeat(60))

    const totalRequests = allResults.length
    const successRate = (allResults.filter(r => r.success).length / totalRequests * 100).toFixed(2)
    const allTimes = allResults.map(r => r.responseTime)

    console.log(`\n  Total de requests: ${totalRequests}`)
    console.log(`  Tasa de éxito: ${successRate}%`)
    console.log(`\n  Latencia global:`)
    console.log(`    Min:    ${Math.min(...allTimes)}ms`)
    console.log(`    P50:    ${percentile(allTimes, 50)}ms`)
    console.log(`    P90:    ${percentile(allTimes, 90)}ms`)
    console.log(`    P99:    ${percentile(allTimes, 99)}ms`)
    console.log(`    Max:    ${Math.max(...allTimes)}ms`)
    console.log(`    Avg:    ${Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)}ms`)

    // Evaluación
    const p90 = percentile(allTimes, 90)
    const avgTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length

    console.log('\n  Evaluación:')
    if (parseFloat(successRate) >= 99 && p90 < 200) {
        console.log('    ✅ EXCELENTE - Sistema robusto bajo carga')
    } else if (parseFloat(successRate) >= 95 && p90 < 500) {
        console.log('    🟡 ACEPTABLE - Considerar optimizaciones')
    } else {
        console.log('    ❌ NECESITA MEJORAS - Problemas de performance')
    }

    // Errores más comunes
    const errors = allResults.filter(r => !r.success)
    if (errors.length > 0) {
        console.log(`\n  Errores encontrados: ${errors.length}`)
        const errorTypes = new Map<string, number>()
        errors.forEach(e => {
            const key = e.error || 'Unknown'
            errorTypes.set(key, (errorTypes.get(key) || 0) + 1)
        })
        errorTypes.forEach((count, error) => {
            console.log(`    - ${error}: ${count}x`)
        })
    }

    console.log('\n' + '═'.repeat(60))
    console.log('\n✅ PRUEBAS DE CARGA COMPLETADAS\n')

    // Limpiar registros de prueba
    const supabase = createVirtualUser()
    await supabase
        .from('audit_log')
        .delete()
        .eq('accion', 'LOAD_TEST')

    console.log('🧹 Registros de prueba limpiados\n')
}

runFullLoadTestSuite().catch(console.error)
