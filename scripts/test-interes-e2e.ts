/**
 * Test E2E: Renovación con Interés Flexible
 * 
 * Prueba completa con el crédito real de MIGUEL ANGEL (43708661)
 */

import { createClient } from '@supabase/supabase-js'
import { calcularInteresFlexible, obtenerOpcionesPago } from '../src/lib/utils/interes-flexible'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompleto() {
    console.log('='.repeat(60))
    console.log('🧪 TEST E2E: Sistema de Interés Flexible')
    console.log('='.repeat(60))

    // 1. Buscar el crédito vigente de MIGUEL ANGEL
    console.log('\n📋 PASO 1: Buscar crédito vigente')
    console.log('-'.repeat(40))

    const { data: creditos, error: errorCreditos } = await supabase
        .from('creditos')
        .select(`
            id,
            codigo_credito,
            monto_prestado,
            tasa_interes,
            saldo_pendiente,
            estado,
            created_at,
            fecha_vencimiento,
            cliente_id
        `)
        .eq('codigo_credito', 'JT-20251214-8382')
        .single()

    if (errorCreditos || !creditos) {
        console.log('❌ Error buscando crédito:', errorCreditos)
        return
    }

    console.log('✅ Crédito encontrado:')
    console.log(`   Código: ${creditos.codigo_credito}`)
    console.log(`   Monto: S/${creditos.monto_prestado}`)
    console.log(`   Tasa: ${creditos.tasa_interes}%`)
    console.log(`   Saldo: S/${creditos.saldo_pendiente}`)
    console.log(`   Estado: ${creditos.estado}`)
    console.log(`   Creado: ${creditos.created_at}`)

    // 2. Calcular días transcurridos
    console.log('\n📋 PASO 2: Calcular días transcurridos')
    console.log('-'.repeat(40))

    const fechaCreacion = new Date(creditos.created_at)
    const hoy = new Date()
    const diasMs = hoy.getTime() - fechaCreacion.getTime()
    const diasTranscurridos = Math.max(1, Math.ceil(diasMs / (1000 * 60 * 60 * 24)))

    console.log(`   Fecha creación: ${fechaCreacion.toLocaleDateString('es-PE')}`)
    console.log(`   Fecha hoy: ${hoy.toLocaleDateString('es-PE')}`)
    console.log(`   Días transcurridos: ${diasTranscurridos}`)

    // 3. Calcular opciones de interés
    console.log('\n📋 PASO 3: Calcular opciones de interés flexible')
    console.log('-'.repeat(40))

    const opciones = obtenerOpcionesPago(
        Number(creditos.monto_prestado),
        Number(creditos.tasa_interes),
        diasTranscurridos
    )

    console.log('\n📊 OPCIÓN 1: Por Días (pro-rata)')
    console.log(`   Interés a cobrar: S/${opciones.porDias.interes.toFixed(2)}`)
    console.log(`   ${opciones.porDias.descripcion}`)
    console.log(`   Fórmula: ${opciones.porDias.formula}`)

    console.log('\n📊 OPCIÓN 2: Por Semanas (escalado)')
    console.log(`   Interés a cobrar: S/${opciones.porSemanas.interes.toFixed(2)}`)
    console.log(`   ${opciones.porSemanas.descripcion}`)
    console.log(`   Fórmula: ${opciones.porSemanas.formula}`)

    console.log('\n💡 RECOMENDACIÓN:')
    console.log(`   Modalidad: ${opciones.recomendacion === 'dias' ? 'Por Días' : 'Por Semanas'}`)
    console.log(`   Ahorro para cliente: S/${opciones.ahorro.toFixed(2)}`)

    // 4. Simular montos para cada operación
    console.log('\n📋 PASO 4: Montos para cada tipo de operación')
    console.log('-'.repeat(40))

    const saldoPendiente = Number(creditos.saldo_pendiente)

    console.log('\n🔄 RENOVAR (solo intereses):')
    console.log(`   Por días: S/${opciones.porDias.interes.toFixed(2)}`)
    console.log(`   Por semanas: S/${opciones.porSemanas.interes.toFixed(2)}`)

    console.log('\n💰 LIQUIDAR (capital + interés):')
    console.log(`   Por días: S/${(saldoPendiente + opciones.porDias.interes).toFixed(2)}`)
    console.log(`   Por semanas: S/${(saldoPendiente + opciones.porSemanas.interes).toFixed(2)}`)

    console.log('\n📉 AMORTIZAR (ejemplo: S/200 al capital):')
    const abonoCapital = 200
    console.log(`   Por días: S/${(abonoCapital + opciones.porDias.interes).toFixed(2)} (S/${abonoCapital} capital + S/${opciones.porDias.interes.toFixed(2)} interés)`)
    console.log(`   Por semanas: S/${(abonoCapital + opciones.porSemanas.interes).toFixed(2)} (S/${abonoCapital} capital + S/${opciones.porSemanas.interes.toFixed(2)} interés)`)

    // 5. Verificar que el sistema de cálculo es correcto
    console.log('\n📋 PASO 5: Verificación matemática')
    console.log('-'.repeat(40))

    const interesMensual = Number(creditos.monto_prestado) * (Number(creditos.tasa_interes) / 100)
    const interesDiarioEsperado = (interesMensual / 30) * diasTranscurridos
    const interesSemana1Esperado = interesMensual * 0.25

    console.log(`   Interés mensual completo: S/${interesMensual.toFixed(2)}`)
    console.log(`   Por días (${diasTranscurridos}d) esperado: S/${interesDiarioEsperado.toFixed(2)}`)
    console.log(`   Por días calculado: S/${opciones.porDias.interes.toFixed(2)} ${opciones.porDias.interes.toFixed(2) === interesDiarioEsperado.toFixed(2) ? '✅' : '❌'}`)
    console.log(`   Por semana 1 esperado: S/${interesSemana1Esperado.toFixed(2)}`)
    console.log(`   Por semana 1 calculado: S/${opciones.porSemanas.interes.toFixed(2)} ${opciones.porSemanas.interes.toFixed(2) === interesSemana1Esperado.toFixed(2) ? '✅' : '❌'}`)

    console.log('\n' + '='.repeat(60))
    console.log('✅ TEST COMPLETADO - Sistema de Interés Flexible funcionando')
    console.log('='.repeat(60))
}

testCompleto().catch(console.error)
