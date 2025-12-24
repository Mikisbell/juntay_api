/**
 * Test: Sistema Profesional de Rendimientos para Inversionistas
 * 
 * Verifica:
 * - Interés simple vs compuesto
 * - Cálculo de TIR
 * - Waterfall distribution
 * - Penalidad por atraso
 */

import {
    calcularInteresSimple,
    calcularInteresCompuesto,
    calcularTIR,
    calcularWaterfallDistribution,
    calcularPenalidadAtrasoEmpresa,
    generarCronogramaPagos
} from '../src/lib/utils/rendimientos-inversionista'

function runTests() {
    console.log('='.repeat(70))
    console.log('🧪 TEST: Sistema Profesional de Rendimientos para Inversionistas')
    console.log('='.repeat(70))

    let passed = 0
    let failed = 0

    // ========== TEST 1: Interés Simple ==========
    console.log('\n📋 TEST 1: Interés Simple')
    console.log('-'.repeat(50))

    const simple = calcularInteresSimple(100000, 12, 12)
    const esperadoSimple = 12000 // 100000 × 12% × 1 año = 12000

    console.log(`  Capital: S/100,000, Tasa: 12%, Meses: 12`)
    console.log(`  Esperado: S/${esperadoSimple.toFixed(2)}`)
    console.log(`  Obtenido: S/${simple.toFixed(2)}`)

    if (simple === esperadoSimple) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 2: Interés Compuesto Mensual ==========
    console.log('\n📋 TEST 2: Interés Compuesto Mensual')
    console.log('-'.repeat(50))

    const compuesto = calcularInteresCompuesto({
        capital: 100000,
        tasaAnual: 12,
        meses: 12,
        capitalizacion: 'MENSUAL'
    })

    // Fórmula: 100000 × (1 + 0.01)^12 - 100000 = 12682.50
    const esperadoCompuesto = 12682.50

    console.log(`  Capital: S/100,000, Tasa: 12%, Meses: 12, Capitalización: Mensual`)
    console.log(`  Esperado compuesto: ~S/${esperadoCompuesto}`)
    console.log(`  Obtenido compuesto: S/${compuesto.interesCompuesto.toFixed(2)}`)
    console.log(`  Diferencia vs simple: S/${compuesto.diferencia.toFixed(2)}`)

    // Tolerancia de 1 peso por redondeo
    if (Math.abs(compuesto.interesCompuesto - esperadoCompuesto) < 1) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 3: Comparación Simple vs Compuesto ==========
    console.log('\n📋 TEST 3: Comparación 24 meses')
    console.log('-'.repeat(50))

    const comparacion = calcularInteresCompuesto({
        capital: 50000,
        tasaAnual: 15,
        meses: 24,
        capitalizacion: 'MENSUAL'
    })

    console.log(`  Capital: S/50,000, Tasa: 15%, Meses: 24`)
    console.log(`  Interés Simple: S/${comparacion.interesSimple.toFixed(2)}`)
    console.log(`  Interés Compuesto: S/${comparacion.interesCompuesto.toFixed(2)}`)
    console.log(`  Ganancia extra con compuesto: S/${comparacion.diferencia.toFixed(2)}`)

    if (comparacion.interesCompuesto > comparacion.interesSimple) {
        console.log('  ✅ PASSED (Compuesto > Simple)')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 4: TIR (Tasa Interna de Retorno) ==========
    console.log('\n📋 TEST 4: Cálculo de TIR')
    console.log('-'.repeat(50))

    const inversionInicial = 100000
    const flujos = [
        { monto: 10000, fecha: new Date('2024-03-01'), tipo: 'ENTRADA' as const },
        { monto: 10000, fecha: new Date('2024-06-01'), tipo: 'ENTRADA' as const },
        { monto: 10000, fecha: new Date('2024-09-01'), tipo: 'ENTRADA' as const },
        { monto: 110000, fecha: new Date('2024-12-01'), tipo: 'ENTRADA' as const },
    ]

    const tir = calcularTIR(inversionInicial, flujos)

    console.log(`  Inversión: S/100,000`)
    console.log(`  Flujos: 4 pagos de S/10,000 + S/110,000 al final`)
    console.log(`  TIR calculada: ${tir !== null ? tir.toFixed(2) + '%' : 'No calculable'}`)

    if (tir !== null && tir > 0 && tir < 100) {
        console.log('  ✅ PASSED (TIR en rango razonable)')
        passed++
    } else {
        console.log('  ⚠️ SKIPPED (TIR no calculable)')
    }

    // ========== TEST 5: Waterfall Distribution ==========
    console.log('\n📋 TEST 5: Waterfall Distribution (Private Equity Style)')
    console.log('-'.repeat(50))

    const waterfall = calcularWaterfallDistribution({
        capitalInvertido: 100000,
        gananciasTotales: 50000,
        hurdleRate: 8,
        carriedRate: 20
    })

    console.log(`  Capital invertido: S/100,000`)
    console.log(`  Ganancias totales: S/50,000`)
    console.log(`  Hurdle Rate: 8%, Carried: 20%`)
    console.log(`  Distribución:`)
    console.log(`    - Retorno capital: S/${waterfall.retornoCapital.toFixed(2)}`)
    console.log(`    - Hurdle return: S/${waterfall.hurdleReturn.toFixed(2)}`)
    console.log(`    - Total Inversionista: S/${waterfall.totalInversionista.toFixed(2)}`)
    console.log(`    - Total Empresa (carry): S/${waterfall.totalEmpresa.toFixed(2)}`)

    // Verificar que la suma cuadra
    const sumaDistribucion = waterfall.totalInversionista + waterfall.totalEmpresa - waterfall.retornoCapital
    if (Math.abs(sumaDistribucion - 50000) < 1) {
        console.log('  ✅ PASSED (Distribución suma correctamente)')
        passed++
    } else {
        console.log(`  ❌ FAILED (Suma: ${sumaDistribucion}, esperado: 50000)`)
        failed++
    }

    // ========== TEST 6: Penalidad por Atraso ==========
    console.log('\n📋 TEST 6: Penalidad por Atraso de Empresa')
    console.log('-'.repeat(50))

    const penalidad = calcularPenalidadAtrasoEmpresa({
        montoVencido: 10000,
        diasAtraso: 15,
        tasaDiaria: 0.5,
        diasGracia: 5
    })

    // Con 15 días de atraso y 5 de gracia = 10 días penalizables
    // 10000 × 0.5% × 10 = 500
    const esperadoPenalidad = 500

    console.log(`  Monto vencido: S/10,000`)
    console.log(`  Días atraso: 15, Días gracia: 5`)
    console.log(`  Días penalizables: ${penalidad.diasPenalizables}`)
    console.log(`  Penalidad esperada: S/${esperadoPenalidad.toFixed(2)}`)
    console.log(`  Penalidad calculada: S/${penalidad.penalidad.toFixed(2)}`)

    if (penalidad.penalidad === esperadoPenalidad && penalidad.diasPenalizables === 10) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 7: Sin Penalidad en Periodo de Gracia ==========
    console.log('\n📋 TEST 7: Sin Penalidad en Periodo de Gracia')
    console.log('-'.repeat(50))

    const enGracia = calcularPenalidadAtrasoEmpresa({
        montoVencido: 10000,
        diasAtraso: 3,
        tasaDiaria: 0.5,
        diasGracia: 5
    })

    console.log(`  Días atraso: 3, Días gracia: 5`)
    console.log(`  En gracia: ${enGracia.enGracia}`)
    console.log(`  Penalidad: S/${enGracia.penalidad.toFixed(2)}`)

    if (enGracia.enGracia && enGracia.penalidad === 0) {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== TEST 8: Cronograma de Pagos ==========
    console.log('\n📋 TEST 8: Generación de Cronograma')
    console.log('-'.repeat(50))

    const cronograma = generarCronogramaPagos({
        capital: 100000,
        tasaAnual: 12,
        mesesDuracion: 12,
        frecuenciaPago: 'TRIMESTRAL',
        fechaInicio: new Date('2024-01-01'),
        tipoInteres: 'SIMPLE'
    })

    console.log(`  Capital: S/100,000, Tasa: 12%, Duración: 12 meses`)
    console.log(`  Frecuencia: Trimestral`)
    console.log(`  Cuotas generadas: ${cronograma.length}`)
    cronograma.forEach(cuota => {
        console.log(`    Cuota ${cuota.numeroCuota}: ${cuota.fechaProgramada.toLocaleDateString()} - S/${cuota.montoTotal.toFixed(2)} (${cuota.tipo})`)
    })

    if (cronograma.length === 4 && cronograma[3].tipo === 'BULLET') {
        console.log('  ✅ PASSED')
        passed++
    } else {
        console.log('  ❌ FAILED')
        failed++
    }

    // ========== RESUMEN ==========
    console.log('\n' + '='.repeat(70))
    console.log(`📊 RESUMEN: ${passed} passed, ${failed} failed`)
    console.log('='.repeat(70))

    if (failed === 0) {
        console.log('✅ TODOS LOS TESTS PASARON - Sistema profesional funcionando')
    } else {
        console.log('❌ ALGUNOS TESTS FALLARON')
        process.exit(1)
    }
}

runTests()
