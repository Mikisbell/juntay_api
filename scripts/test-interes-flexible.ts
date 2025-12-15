/**
 * Test Script: Sistema de Interés Flexible
 * 
 * Verifica los cálculos en diferentes escenarios
 */

import { createClient } from '@supabase/supabase-js'
import {
    calcularInteresFlexible,
    obtenerOpcionesPago,
    calcularTotalPago,
    calcularDiasTranscurridos
} from '../src/lib/utils/interes-flexible'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('='.repeat(60))
console.log('🧪 TEST: Sistema de Interés Flexible')
console.log('='.repeat(60))

// Test 1: Verificar cálculos con valores conocidos
console.log('\n📊 TEST 1: Cálculos con valores conocidos')
console.log('-'.repeat(40))

const testCases = [
    { monto: 1000, tasa: 20, dias: 4 },
    { monto: 1000, tasa: 20, dias: 7 },
    { monto: 1000, tasa: 20, dias: 10 },
    { monto: 1000, tasa: 20, dias: 14 },
    { monto: 1000, tasa: 20, dias: 21 },
    { monto: 1000, tasa: 20, dias: 30 },
    { monto: 500, tasa: 15, dias: 5 },
    { monto: 2000, tasa: 10, dias: 12 },
]

console.log('\n| Monto    | Tasa | Días | Por Días  | Por Semanas | Ahorro   |')
console.log('|----------|------|------|-----------|-------------|----------|')

for (const tc of testCases) {
    const opciones = obtenerOpcionesPago(tc.monto, tc.tasa, tc.dias)
    const ahorro = Math.abs(opciones.porDias.interes - opciones.porSemanas.interes)

    console.log(
        `| S/${tc.monto.toString().padEnd(5)} | ${tc.tasa}%`.padEnd(16) +
        ` | ${tc.dias.toString().padEnd(4)} | S/${opciones.porDias.interes.toFixed(2).padEnd(7)} | S/${opciones.porSemanas.interes.toFixed(2).padEnd(9)} | S/${ahorro.toFixed(2).padEnd(6)} |`
    )
}

// Test 2: Verificar fórmulas matemáticas
console.log('\n\n📐 TEST 2: Verificación de fórmulas')
console.log('-'.repeat(40))

const monto = 1000
const tasa = 20
const interesMensual = monto * (tasa / 100) // S/200

console.log(`Préstamo: S/${monto} @ ${tasa}% mensual = S/${interesMensual} interés mensual`)

// Por días (4 días)
const interesDia4 = (interesMensual / 30) * 4
console.log(`\n✓ Por días (4d): S/${interesMensual} ÷ 30 × 4 = S/${interesDia4.toFixed(2)}`)
const calcDia4 = calcularInteresFlexible(monto, tasa, 4, 'dias')
console.log(`  Calculado: S/${calcDia4.interes.toFixed(2)} ${calcDia4.interes.toFixed(2) === interesDia4.toFixed(2) ? '✅' : '❌'}`)

// Por semanas (7 días = semana 1 = 25%)
const interesSem1 = interesMensual * 0.25
console.log(`\n✓ Por semanas (7d): S/${interesMensual} × 25% = S/${interesSem1.toFixed(2)}`)
const calcSem1 = calcularInteresFlexible(monto, tasa, 7, 'semanas')
console.log(`  Calculado: S/${calcSem1.interes.toFixed(2)} ${calcSem1.interes.toFixed(2) === interesSem1.toFixed(2) ? '✅' : '❌'}`)

// Por semanas (14 días = semana 2 = 50%)
const interesSem2 = interesMensual * 0.50
console.log(`\n✓ Por semanas (14d): S/${interesMensual} × 50% = S/${interesSem2.toFixed(2)}`)
const calcSem2 = calcularInteresFlexible(monto, tasa, 14, 'semanas')
console.log(`  Calculado: S/${calcSem2.interes.toFixed(2)} ${calcSem2.interes.toFixed(2) === interesSem2.toFixed(2) ? '✅' : '❌'}`)

// Test 3: Buscar créditos reales en la base de datos
console.log('\n\n🗄️ TEST 3: Créditos reales en base de datos')
console.log('-'.repeat(40))

async function testConCreditos() {
    const { data: creditos, error } = await supabase
        .from('creditos')
        .select('id, codigo_credito, monto_prestado, tasa_interes, created_at, fecha_vencimiento, estado')
        .eq('estado', 'vigente')
        .limit(5)

    if (error) {
        console.log('Error consultando créditos:', error.message)
        return
    }

    if (!creditos || creditos.length === 0) {
        console.log('No hay créditos vigentes para probar')
        return
    }

    console.log(`\nEncontrados ${creditos.length} créditos vigentes:\n`)

    for (const credito of creditos) {
        const diasTranscurridos = calcularDiasTranscurridos(credito.created_at)
        const opciones = obtenerOpcionesPago(
            credito.monto_prestado,
            credito.tasa_interes,
            diasTranscurridos
        )

        console.log(`📋 ${credito.codigo_credito}`)
        console.log(`   Monto: S/${credito.monto_prestado} | Tasa: ${credito.tasa_interes}%`)
        console.log(`   Días transcurridos: ${diasTranscurridos}`)
        console.log(`   Por días: S/${opciones.porDias.interes.toFixed(2)} (${opciones.porDias.descripcion})`)
        console.log(`   Por semanas: S/${opciones.porSemanas.interes.toFixed(2)} (${opciones.porSemanas.descripcion})`)
        console.log(`   💡 Recomendado: ${opciones.recomendacion === 'dias' ? 'Por días' : 'Por semanas'} (ahorro S/${opciones.ahorro.toFixed(2)})`)
        console.log()
    }
}

testConCreditos().then(() => {
    console.log('='.repeat(60))
    console.log('✅ Tests completados')
    console.log('='.repeat(60))
    process.exit(0)
}).catch(err => {
    console.error('Error en tests:', err)
    process.exit(1)
})
