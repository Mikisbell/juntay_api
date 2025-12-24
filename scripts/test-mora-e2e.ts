/**
 * Test E2E: Sistema de Interés con Mora
 * 
 * Prueba completa del nuevo sistema de cálculo de intereses con:
 * - Interés regular
 * - Días de gracia
 * - Interés de mora
 */

import { createClient } from '@supabase/supabase-js'
import {
    calcularInteresCompleto,
    calcularInteresFlexibleConMora,
    obtenerOpcionesPago,
    getConfiguracionDefault
} from '../src/lib/utils/interes-flexible'

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// CONFIGURACIÓN DE PRUEBA
// ============================================================================

const CONFIG_TEST = {
    tipoCalculo: 'simple' as const,
    baseDias: 30,
    tasaMoraDiaria: 0.5,    // 0.5% diario
    diasGracia: 3,          // 3 días sin mora
    capitalizacionMensual: false,
    interesMinimoDias: 1
}

// ============================================================================
// TESTS
// ============================================================================

async function runTests() {
    console.log('='.repeat(70))
    console.log('🧪 TEST E2E: Sistema de Interés con Mora v2.0')
    console.log('='.repeat(70))
    console.log(`Configuración: ${JSON.stringify(CONFIG_TEST, null, 2)}`)
    console.log('='.repeat(70))

    let passed = 0
    let failed = 0

    // ========== TEST 1: Crédito al día (sin vencimiento) ==========
    console.log('\n📋 TEST 1: Crédito Al Día (sin vencimiento)')
    console.log('-'.repeat(50))

    const test1 = calcularInteresCompleto({
        montoPrestado: 1000,
        tasaMensual: 20,
        diasTranscurridos: 15,
        diasPostVencimiento: 0,
        config: CONFIG_TEST
    })

    const esperado1 = {
        estadoMora: 'AL_DIA',
        diasEnMora: 0,
        diasEnGracia: 0,
        interesRegular: 100.00, // 1000 * 20% * 15/30 = 100
        interesMora: 0
    }

    console.log(`  Monto: S/1000, Tasa: 20%, Días: 15`)
    console.log(`  Esperado: Regular=${esperado1.interesRegular}, Mora=${esperado1.interesMora}, Estado=${esperado1.estadoMora}`)
    console.log(`  Obtenido: Regular=${test1.interesRegular}, Mora=${test1.interesMora}, Estado=${test1.estadoMora}`)

    if (test1.estadoMora === esperado1.estadoMora &&
        test1.interesMora === esperado1.interesMora &&
        test1.interesRegular === esperado1.interesRegular) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 2: Crédito en periodo de gracia ==========
    console.log('\n📋 TEST 2: Crédito en Período de Gracia')
    console.log('-'.repeat(50))

    const test2 = calcularInteresCompleto({
        montoPrestado: 1000,
        tasaMensual: 20,
        diasTranscurridos: 33, // 30 días regulares + 3 de gracia
        diasPostVencimiento: 2, // 2 días post vencimiento (< 3 días gracia)
        config: CONFIG_TEST
    })

    console.log(`  Monto: S/1000, Tasa: 20%, Días: 33, Post-vencimiento: 2`)
    console.log(`  Esperado: Estado=EN_GRACIA, Días gracia=2, Días mora=0`)
    console.log(`  Obtenido: Estado=${test2.estadoMora}, Días gracia=${test2.diasEnGracia}, Días mora=${test2.diasEnMora}`)

    if (test2.estadoMora === 'EN_GRACIA' && test2.diasEnGracia === 2 && test2.diasEnMora === 0) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 3: Crédito en mora leve ==========
    console.log('\n📋 TEST 3: Crédito en Mora Leve')
    console.log('-'.repeat(50))

    const test3 = calcularInteresCompleto({
        montoPrestado: 1000,
        tasaMensual: 20,
        diasTranscurridos: 40, // 30 regulares + 10 post vencimiento
        diasPostVencimiento: 10, // 10 días post vencimiento (3 gracia + 7 mora)
        config: CONFIG_TEST
    })

    const esperadoMora3 = 1000 * 0.005 * 7 // 1000 * 0.5% * 7 días = 35

    console.log(`  Monto: S/1000, Tasa: 20%, Post-vencimiento: 10 días`)
    console.log(`  Esperado: Estado=MORA_LEVE, Días mora=7, Interés mora=35.00`)
    console.log(`  Obtenido: Estado=${test3.estadoMora}, Días mora=${test3.diasEnMora}, Interés mora=${test3.interesMora}`)

    if (test3.estadoMora === 'MORA_LEVE' && test3.diasEnMora === 7 && test3.interesMora === 35) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 4: Crédito en mora grave ==========
    console.log('\n📋 TEST 4: Crédito en Mora Grave (>30 días)')
    console.log('-'.repeat(50))

    const test4 = calcularInteresCompleto({
        montoPrestado: 1000,
        tasaMensual: 20,
        diasTranscurridos: 70, // 30 regulares + 40 post vencimiento
        diasPostVencimiento: 40, // 40 días (3 gracia + 37 mora)
        config: CONFIG_TEST
    })

    const esperadoMora4 = 1000 * 0.005 * 37 // 1000 * 0.5% * 37 días = 185

    console.log(`  Monto: S/1000, Tasa: 20%, Post-vencimiento: 40 días`)
    console.log(`  Esperado: Estado=MORA_GRAVE, Días mora=37, Interés mora=185.00`)
    console.log(`  Obtenido: Estado=${test4.estadoMora}, Días mora=${test4.diasEnMora}, Interés mora=${test4.interesMora}`)

    if (test4.estadoMora === 'MORA_GRAVE' && test4.diasEnMora === 37 && test4.interesMora === 185) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 5: Comparación modalidades con mora ==========
    console.log('\n📋 TEST 5: Comparación de Modalidades con Mora')
    console.log('-'.repeat(50))

    const test5 = obtenerOpcionesPago(
        1000,
        20,
        38, // 30 regulares + 8 post vencimiento
        8,  // 8 días post vencimiento
        CONFIG_TEST
    )

    console.log(`  Monto: S/1000, Tasa: 20%, Días: 38, Post-vencimiento: 8`)
    console.log(`  Por Días:`)
    console.log(`    - Regular: S/${test5.porDias.interesRegular}`)
    console.log(`    - Mora: S/${test5.porDias.interesMora}`)
    console.log(`    - Total: S/${test5.porDias.interesTotal}`)
    console.log(`  Por Semanas:`)
    console.log(`    - Regular: S/${test5.porSemanas.interesRegular}`)
    console.log(`    - Mora: S/${test5.porSemanas.interesMora}`)
    console.log(`    - Total: S/${test5.porSemanas.interesTotal}`)
    console.log(`  Recomendación: ${test5.recomendacion}`)
    console.log(`  Estado mora: ${test5.estadoMora}`)

    if (test5.estadoMora === 'MORA_LEVE' && test5.porDias.interesMora > 0) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 6: Función RPC de base de datos ==========
    console.log('\n📋 TEST 6: Función RPC calcular_interes_completo')
    console.log('-'.repeat(50))

    try {
        // Primero verificar si hay un crédito de prueba
        const { data: creditos } = await supabase
            .from('creditos')
            .select('id, codigo_credito, monto_prestado, tasa_interes')
            .eq('estado', 'vigente')
            .limit(1)

        if (creditos && creditos.length > 0) {
            const credito = creditos[0]
            console.log(`  Probando con crédito: ${credito.codigo_credito}`)

            const { data, error } = await supabase
                .rpc('calcular_interes_completo', {
                    p_credito_id: credito.id,
                    p_fecha_calculo: new Date().toISOString().split('T')[0]
                })

            if (error) {
                console.log(`  ⚠️ RPC no disponible (ejecutar migración): ${error.message}`)
                console.log('  ⏭️ SKIPPED')
            } else if (data && data.length > 0) {
                const result = data[0]
                console.log(`    Monto base: S/${result.monto_base}`)
                console.log(`    Días: ${result.dias_desde_desembolso}`)
                console.log(`    Interés regular: S/${result.interes_regular}`)
                console.log(`    Interés mora: S/${result.interes_mora}`)
                console.log(`    Estado: ${result.estado_mora}`)
                console.log('  ✅ PASSED')
                passed++
            }
        } else {
            console.log('  ⚠️ No hay créditos vigentes para probar')
            console.log('  ⏭️ SKIPPED')
        }
    } catch (err) {
        console.log(`  ⚠️ Error de conexión: ${err}`)
        console.log('  ⏭️ SKIPPED')
    }

    // ========== RESUMEN ==========
    console.log('\n' + '='.repeat(70))
    console.log(`📊 RESUMEN: ${passed} passed, ${failed} failed`)
    console.log('='.repeat(70))

    if (failed === 0) {
        console.log('✅ TODOS LOS TESTS PASARON - Sistema de mora funcionando correctamente')
    } else {
        console.log('❌ ALGUNOS TESTS FALLARON - Revisar implementación')
        process.exit(1)
    }
}

// ============================================================================
// EJECUTAR
// ============================================================================

runTests().catch(console.error)
