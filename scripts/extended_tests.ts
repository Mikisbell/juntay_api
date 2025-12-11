/**
 * PRUEBAS EXTENDIDAS - JUNTAY
 * 
 * Pruebas adicionales:
 * 1. Pagos parciales y completos
 * 2. Operaciones de caja
 * 3. Clientes con múltiples créditos
 * 4. Garantías de alto valor
 * 5. Bordes del sistema
 * 
 * Ejecutar: npx tsx scripts/extended_tests.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// TEST 1: CLIENTE CON MÚLTIPLES CRÉDITOS SIMULTÁNEOS
// ============================================================================

async function testMultipleCreditsPerClient() {
    console.log('\n🧪 TEST 1: CLIENTE CON MÚLTIPLES CRÉDITOS\n')

    // Obtener un cliente existente
    const { data: cliente } = await supabase
        .from('clientes')
        .select('id, nombres, apellido_paterno')
        .limit(1)
        .single()

    if (!cliente) {
        console.log('  ❌ No hay clientes disponibles')
        return
    }

    console.log(`  Cliente: ${cliente.nombres} ${cliente.apellido_paterno}`)

    // Contar créditos actuales
    const { count: creditosExistentes } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', cliente.id)

    console.log(`  Créditos actuales: ${creditosExistentes}`)

    // Crear 3 créditos más para este cliente
    const hoy = new Date()
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id')
        .eq('estado', 'abierta')
        .limit(1)
        .single()

    for (let i = 0; i < 3; i++) {
        // Crear garantía
        const { data: garantia } = await supabase
            .from('garantias')
            .insert({
                cliente_id: cliente.id,
                descripcion: `Garantía múltiple #${i + 1} - Cadena oro 18k ${20 + i * 5}gr`,
                valor_tasacion: 1000 + i * 500,
                estado: 'custodia'
            })
            .select('id')
            .single()

        if (!garantia) continue

        const fechaVenc = new Date(hoy)
        fechaVenc.setDate(fechaVenc.getDate() + 30 + i * 10)

        const { data: credito, error } = await supabase
            .from('creditos')
            .insert({
                codigo: `MULTI-${cliente.id.substring(0, 4)}-${i + 1}`,
                cliente_id: cliente.id,
                garantia_id: garantia.id,
                caja_origen_id: caja?.id,
                monto_prestado: 800 + i * 200,
                tasa_interes: 10,
                periodo_dias: 30,
                fecha_desembolso: hoy.toISOString(),
                fecha_vencimiento: fechaVenc.toISOString().split('T')[0],
                saldo_pendiente: 800 + i * 200,
                interes_acumulado: (800 + i * 200) * 0.10,
                estado: 'vigente',
                estado_detallado: 'vigente'
            })
            .select('codigo')
            .single()

        if (credito) {
            console.log(`  ✅ Crédito ${credito.codigo} creado`)
        } else if (error) {
            console.log(`  ❌ Error: ${error.message}`)
        }
    }

    // Verificar
    const { count: creditosNuevos } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', cliente.id)

    console.log(`  📊 Créditos después: ${creditosNuevos}`)
}

// ============================================================================
// TEST 2: PAGOS Y REGISTROS DE MOVIMIENTOS
// ============================================================================

async function testPaymentsAndMovements() {
    console.log('\n🧪 TEST 2: PAGOS Y MOVIMIENTOS\n')

    // Obtener caja abierta
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id, saldo_actual, usuario_id')
        .eq('estado', 'abierta')
        .limit(1)
        .single()

    if (!caja) {
        console.log('  ❌ No hay caja abierta')
        return
    }

    console.log(`  Caja ID: ${caja.id.substring(0, 8)}...`)
    console.log(`  Saldo inicial: S/${caja.saldo_actual}`)

    // Obtener créditos para pagar
    const { data: creditos } = await supabase
        .from('creditos')
        .select('id, codigo, saldo_pendiente, interes_acumulado')
        .in('estado', ['vigente', 'vencido'])
        .limit(5)

    if (!creditos || creditos.length === 0) {
        console.log('  ❌ No hay créditos disponibles')
        return
    }

    let totalPagado = 0

    for (const credito of creditos) {
        // Pago parcial (solo interés)
        const montoPago = Math.min(credito.interes_acumulado || 50, 100)

        // Registrar pago
        const { data: pago, error: errPago } = await supabase
            .from('pagos')
            .insert({
                credito_id: credito.id,
                caja_operativa_id: caja.id,
                monto_total: montoPago,
                desglose_interes: montoPago,
                desglose_capital: 0,
                desglose_mora: 0,
                medio_pago: 'EFECTIVO'
            })
            .select('id')
            .single()

        if (pago) {
            totalPagado += montoPago

            // Registrar movimiento de caja
            await supabase
                .from('movimientos_caja_operativa')
                .insert({
                    caja_operativa_id: caja.id,
                    tipo: 'INGRESO',
                    motivo: 'PAGO_INTERES',
                    monto: montoPago,
                    saldo_anterior: caja.saldo_actual + totalPagado - montoPago,
                    saldo_nuevo: caja.saldo_actual + totalPagado,
                    referencia_id: credito.id,
                    descripcion: `Pago interés ${credito.codigo}`,
                    usuario_id: caja.usuario_id
                })

            // Actualizar interés del crédito
            await supabase
                .from('creditos')
                .update({
                    interes_acumulado: Math.max(0, (credito.interes_acumulado || 0) - montoPago)
                })
                .eq('id', credito.id)

            console.log(`  ✅ Pago S/${montoPago} a ${credito.codigo}`)
        } else if (errPago) {
            console.log(`  ❌ Error: ${errPago.message}`)
        }
    }

    // Actualizar saldo de caja
    await supabase
        .from('cajas_operativas')
        .update({ saldo_actual: (caja.saldo_actual || 0) + totalPagado })
        .eq('id', caja.id)

    console.log(`  💰 Total pagado: S/${totalPagado}`)
    console.log(`  💰 Nuevo saldo caja: S/${(caja.saldo_actual || 0) + totalPagado}`)
}

// ============================================================================
// TEST 3: GARANTÍAS DE VALOR EXTREMO
// ============================================================================

async function testExtremeValueGuarantees() {
    console.log('\n🧪 TEST 3: GARANTÍAS DE VALOR EXTREMO\n')

    const { data: cliente } = await supabase
        .from('clientes')
        .select('id')
        .limit(1)
        .single()

    if (!cliente) return

    const garantiasExtremas = [
        { desc: 'Rolex Daytona Platinum - Certificado Rolex Ginebra', valor: 150000 },
        { desc: 'Collar diamantes 50 quilates total - Tiffany', valor: 250000 },
        { desc: 'Lingote oro 1kg - Certificado LBMA', valor: 300000 },
        { desc: 'Bolso Hermès Kelly Himalaya - Edición Limitada', valor: 500000 },
        { desc: 'Anillo compromiso Harry Winston 10ct D/IF', valor: 750000 }
    ]

    for (const g of garantiasExtremas) {
        const { data, error } = await supabase
            .from('garantias')
            .insert({
                cliente_id: cliente.id,
                descripcion: g.desc,
                valor_tasacion: g.valor,
                valor_prestamo_sugerido: g.valor * 0.5,
                estado: 'custodia',
                fotos_urls: [`https://placehold.co/400x300?text=${encodeURIComponent(g.desc.substring(0, 20))}`]
            })
            .select('id')
            .single()

        if (data) {
            console.log(`  ✅ Garantía S/${g.valor.toLocaleString()}: ${g.desc.substring(0, 40)}...`)
        } else if (error) {
            console.log(`  ❌ Error: ${error.message}`)
        }
    }
}

// ============================================================================
// TEST 4: CLIENTES CON SCORES EXTREMOS
// ============================================================================

async function testExtremeClientScores() {
    console.log('\n🧪 TEST 4: SCORES DE CRÉDITO EXTREMOS\n')

    const { data: clientes } = await supabase
        .from('clientes')
        .select('id, score_crediticio')
        .limit(10)

    if (!clientes) return

    const scores = [100, 200, 300, 500, 700, 850, 900, 999, 50, 1]

    for (let i = 0; i < Math.min(clientes.length, scores.length); i++) {
        const { error } = await supabase
            .from('clientes')
            .update({ score_crediticio: scores[i] })
            .eq('id', clientes[i].id)

        if (!error) {
            console.log(`  ✅ Cliente ${clientes[i].id.substring(0, 8)}... => Score ${scores[i]}`)
        }
    }
}

// ============================================================================
// TEST 5: VENCIMIENTOS EN BORDES DE FECHA
// ============================================================================

async function testEdgeDateExpirations() {
    console.log('\n🧪 TEST 5: VENCIMIENTOS EN FECHAS BORDE\n')

    const { data: cliente } = await supabase
        .from('clientes')
        .select('id')
        .limit(1)
        .single()

    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id')
        .eq('estado', 'abierta')
        .limit(1)
        .single()

    if (!cliente || !caja) return

    const hoy = new Date()
    const fechasBorde = [
        { label: 'HOY', dias: 0 },
        { label: 'AYER', dias: -1 },
        { label: 'HACE 30 DÍAS EXACTOS', dias: -30 },
        { label: 'HACE 60 DÍAS', dias: -60 },
        { label: 'MAÑANA', dias: 1 },
        { label: 'FIN DE MES', dias: 31 - hoy.getDate() },
        { label: 'AÑO NUEVO', dias: Math.ceil((new Date(hoy.getFullYear() + 1, 0, 1).getTime() - hoy.getTime()) / 86400000) }
    ]

    for (const fb of fechasBorde) {
        const fechaVenc = new Date(hoy)
        fechaVenc.setDate(fechaVenc.getDate() + fb.dias)

        // Crear garantía
        const { data: garantia } = await supabase
            .from('garantias')
            .insert({
                cliente_id: cliente.id,
                descripcion: `Garantía borde: ${fb.label}`,
                valor_tasacion: 1000,
                estado: 'custodia'
            })
            .select('id')
            .single()

        if (!garantia) continue

        const codigo = `EDGE-${fb.label.replace(/\s+/g, '-').substring(0, 10)}`

        const { data: credito, error } = await supabase
            .from('creditos')
            .insert({
                codigo,
                cliente_id: cliente.id,
                garantia_id: garantia.id,
                caja_origen_id: caja.id,
                monto_prestado: 500,
                tasa_interes: 10,
                periodo_dias: 30,
                fecha_desembolso: new Date(fechaVenc.getTime() - 30 * 86400000).toISOString(),
                fecha_vencimiento: fechaVenc.toISOString().split('T')[0],
                saldo_pendiente: 500,
                interes_acumulado: 50,
                estado: fb.dias < 0 ? 'vencido' : 'vigente',
                estado_detallado: fb.dias < 0 ? (fb.dias < -30 ? 'en_gracia' : 'vencido') : (fb.dias <= 7 ? 'por_vencer' : 'vigente')
            })
            .select('codigo')
            .single()

        if (credito) {
            console.log(`  ✅ ${fb.label}: ${fechaVenc.toLocaleDateString('es-PE')}`)
        }
    }
}

// ============================================================================
// TEST 6: STRESS DE BÚSQUEDAS
// ============================================================================

async function testSearchPerformance() {
    console.log('\n🧪 TEST 6: PERFORMANCE DE BÚSQUEDAS\n')

    const startTime = Date.now()

    // Búsqueda por DNI
    const { data: clienteDNI, error: err1 } = await supabase
        .from('clientes')
        .select('*')
        .ilike('numero_documento', '%000%')
        .limit(10)

    const t1 = Date.now() - startTime
    console.log(`  Búsqueda DNI: ${t1}ms (${clienteDNI?.length || 0} resultados)`)

    // Búsqueda por nombre
    const t2Start = Date.now()
    const { data: clienteNombre } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nombres', '%maria%')
        .limit(10)

    const t2 = Date.now() - t2Start
    console.log(`  Búsqueda nombre: ${t2}ms (${clienteNombre?.length || 0} resultados)`)

    // Búsqueda créditos vencidos
    const t3Start = Date.now()
    const { data: creditosVencidos } = await supabase
        .from('creditos')
        .select('id, codigo, fecha_vencimiento')
        .eq('estado', 'vencido')
        .order('fecha_vencimiento', { ascending: true })
        .limit(50)

    const t3 = Date.now() - t3Start
    console.log(`  Créditos vencidos: ${t3}ms (${creditosVencidos?.length || 0} resultados)`)

    // Búsqueda con join
    const t4Start = Date.now()
    const { data: creditosConCliente } = await supabase
        .from('creditos')
        .select(`
            id, codigo, monto_prestado,
            clientes (nombres, apellido_paterno)
        `)
        .limit(50)

    const t4 = Date.now() - t4Start
    console.log(`  Créditos + cliente (join): ${t4}ms (${creditosConCliente?.length || 0} resultados)`)

    const totalTime = Date.now() - startTime
    console.log(`\n  ⏱️  Tiempo total: ${totalTime}ms`)

    if (totalTime > 2000) {
        console.log('  ⚠️  Performance lenta - revisar índices')
    } else {
        console.log('  ✅ Performance aceptable')
    }
}

// ============================================================================
// TEST 7: VERIFICAR INTEGRIDAD DESPUÉS DE TESTS
// ============================================================================

async function verifyIntegrityAfterTests() {
    console.log('\n🔍 VERIFICACIÓN DE INTEGRIDAD POST-TESTS\n')

    // Contar totales
    const { count: totalCreditos } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })

    const { count: totalClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })

    const { count: totalGarantias } = await supabase
        .from('garantias')
        .select('*', { count: 'exact', head: true })

    const { count: totalPagos } = await supabase
        .from('pagos')
        .select('*', { count: 'exact', head: true })

    const { count: totalMovimientos } = await supabase
        .from('movimientos_caja_operativa')
        .select('*', { count: 'exact', head: true })

    console.log(`  Créditos: ${totalCreditos}`)
    console.log(`  Clientes: ${totalClientes}`)
    console.log(`  Garantías: ${totalGarantias}`)
    console.log(`  Pagos: ${totalPagos}`)
    console.log(`  Movimientos: ${totalMovimientos}`)

    // Verificar bóveda
    const { data: boveda } = await supabase
        .from('boveda_central')
        .select('*')
        .single()

    if (boveda) {
        const diff = Math.abs(boveda.saldo_total - (boveda.saldo_disponible + boveda.saldo_asignado))
        console.log(`\n  Bóveda: ${diff < 0.01 ? '✅' : '❌'} (diff: ${diff})`)
    }

    // Verificar caja
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id, saldo_actual')
        .eq('estado', 'abierta')
        .single()

    if (caja) {
        // Calcular saldo desde movimientos
        const { data: movs } = await supabase
            .from('movimientos_caja_operativa')
            .select('tipo, monto')
            .eq('caja_operativa_id', caja.id)

        const saldoCalculado = movs?.reduce((sum, m) => {
            return sum + (m.tipo === 'INGRESO' ? m.monto : -m.monto)
        }, 0) || 0

        // Obtener saldo inicial
        const { data: cajaInfo } = await supabase
            .from('cajas_operativas')
            .select('saldo_inicial')
            .eq('id', caja.id)
            .single()

        const saldoEsperado = (cajaInfo?.saldo_inicial || 0) + saldoCalculado
        const diffCaja = Math.abs(caja.saldo_actual - saldoEsperado)

        console.log(`  Caja: ${diffCaja < 0.01 ? '✅' : '⚠️'} (almacenado: ${caja.saldo_actual}, calculado: ${saldoEsperado})`)
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║            🧪 PRUEBAS EXTENDIDAS - JUNTAY 🧪               ║')
    console.log('╚════════════════════════════════════════════════════════════╝')

    await testMultipleCreditsPerClient()
    await testPaymentsAndMovements()
    await testExtremeValueGuarantees()
    await testExtremeClientScores()
    await testEdgeDateExpirations()
    await testSearchPerformance()
    await verifyIntegrityAfterTests()

    console.log('\n' + '═'.repeat(60))
    console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS\n')
}

main().catch(console.error)
