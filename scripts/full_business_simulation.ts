/**
 * SIMULACIÓN COMPLETA DEL FLUJO DE NEGOCIO - JUNTAY
 * 
 * Simula todo el proceso:
 * 1. Admin agrega S/50,000 a la bóveda
 * 2. Crear un trabajador
 * 3. El trabajador abre caja
 * 4. Buscar/crear cliente
 * 5. Crear crédito con garantía
 * 6. Registrar fotos de la garantía
 * 7. Desembolsar el préstamo
 * 8. Simular paso del tiempo (vencimiento)
 * 9. Cliente paga el crédito completo
 * 10. Cierre de caja
 * 
 * Ejecutar: npx tsx scripts/full_business_simulation.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// IDs que se generarán durante la simulación
let TRABAJADOR_ID: string
let CLIENTE_ID: string
let CAJA_ID: string
let GARANTIA_ID: string
let CREDITO_ID: string

async function log(emoji: string, message: string) {
    console.log(`${emoji} ${message}`)
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// PASO 1: ADMIN AGREGA S/50,000 A LA BÓVEDA
// ============================================================================
async function paso1_agregarFondosBoveda() {
    log('💰', 'PASO 1: Admin agrega S/50,000 a la bóveda')

    // Obtener bóveda actual
    const { data: boveda } = await supabase
        .from('boveda_central')
        .select('*')
        .single()

    if (!boveda) {
        log('❌', 'No se encontró bóveda central')
        return false
    }

    log('📊', `Bóveda antes: Total=${boveda.saldo_total}, Disponible=${boveda.saldo_disponible}`)

    // Agregar fondos
    const nuevoSaldo = (boveda.saldo_total || 0) + 50000
    const nuevoDisponible = (boveda.saldo_disponible || 0) + 50000

    const { error } = await supabase
        .from('boveda_central')
        .update({
            saldo_total: nuevoSaldo,
            saldo_disponible: nuevoDisponible
        })
        .eq('id', boveda.id)

    if (error) {
        log('❌', `Error: ${error.message}`)
        return false
    }

    // Registrar movimiento
    await supabase
        .from('movimientos_boveda')
        .insert({
            tipo: 'INGRESO',
            monto: 50000,
            concepto: 'Inyección de capital por administrador',
            saldo_anterior: boveda.saldo_total,
            saldo_nuevo: nuevoSaldo
        })

    log('✅', `Bóveda después: Total=S/${nuevoSaldo}, Disponible=S/${nuevoDisponible}`)
    return true
}

// ============================================================================
// PASO 2: CREAR TRABAJADOR
// ============================================================================
async function paso2_crearTrabajador() {
    log('👤', 'PASO 2: Crear trabajador nuevo')

    const timestamp = Date.now()
    const email = `cajero_${timestamp}@juntay.com`

    // Crear usuario en auth.users (simulado - usamos tabla usuarios directamente)
    const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .insert({
            email: email,
            nombres: 'Juan Carlos',
            apellido_paterno: 'Pérez',
            apellido_materno: 'García',
            rol: 'cajero',
            activo: true
        })
        .select('id')
        .single()

    if (userError) {
        log('⚠️', `Usuario ya existe o error: ${userError.message}`)
        // Buscar usuario admin
        const { data: existingUser } = await supabase
            .from('usuarios')
            .select('id')
            .eq('rol', 'cajero')
            .limit(1)
            .single()

        if (existingUser) {
            TRABAJADOR_ID = existingUser.id
            log('✅', `Usando trabajador existente: ${TRABAJADOR_ID.substring(0, 8)}...`)
            return true
        }
        return false
    }

    TRABAJADOR_ID = usuario.id
    log('✅', `Trabajador creado: ${email} (ID: ${TRABAJADOR_ID.substring(0, 8)}...)`)
    return true
}

// ============================================================================
// PASO 3: TRABAJADOR ABRE CAJA
// ============================================================================
async function paso3_abrirCaja() {
    log('🏧', 'PASO 3: Trabajador abre caja')

    // Verificar si ya tiene caja abierta
    const { data: cajaExistente } = await supabase
        .from('cajas_operativas')
        .select('id')
        .eq('usuario_id', TRABAJADOR_ID)
        .eq('estado', 'abierta')
        .single()

    if (cajaExistente) {
        CAJA_ID = cajaExistente.id
        log('⚠️', 'Trabajador ya tiene caja abierta')
        return true
    }

    // Obtener siguiente número de caja
    const { data: ultimaCaja } = await supabase
        .from('cajas_operativas')
        .select('numero_caja')
        .order('numero_caja', { ascending: false })
        .limit(1)
        .single()

    const numeroCaja = (ultimaCaja?.numero_caja || 0) + 1
    const montoInicial = 500 // S/500 de fondo de caja

    // Crear caja
    const { data: caja, error } = await supabase
        .from('cajas_operativas')
        .insert({
            numero_caja: numeroCaja,
            usuario_id: TRABAJADOR_ID,
            estado: 'abierta',
            saldo_inicial: montoInicial,
            saldo_actual: montoInicial,
            fecha_apertura: new Date().toISOString()
        })
        .select('id')
        .single()

    if (error) {
        log('❌', `Error abriendo caja: ${error.message}`)
        return false
    }

    CAJA_ID = caja.id

    // Descontar de bóveda
    const { data: boveda } = await supabase
        .from('boveda_central')
        .select('*')
        .single()

    if (boveda) {
        await supabase
            .from('boveda_central')
            .update({
                saldo_disponible: boveda.saldo_disponible - montoInicial,
                saldo_asignado: (boveda.saldo_asignado || 0) + montoInicial
            })
            .eq('id', boveda.id)
    }

    log('✅', `Caja #${numeroCaja} abierta con S/${montoInicial} (ID: ${CAJA_ID.substring(0, 8)}...)`)
    return true
}

// ============================================================================
// PASO 4: BUSCAR/CREAR CLIENTE
// ============================================================================
async function paso4_buscarCrearCliente() {
    log('👥', 'PASO 4: Buscar o crear cliente')

    const dniCliente = '76543210'

    // Buscar cliente existente
    const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('numero_documento', dniCliente)
        .single()

    if (clienteExistente) {
        CLIENTE_ID = clienteExistente.id
        log('✅', `Cliente encontrado: DNI ${dniCliente}`)
        return true
    }

    // Crear nuevo cliente
    const { data: cliente, error } = await supabase
        .from('clientes')
        .insert({
            tipo_documento: 'DNI',
            numero_documento: dniCliente,
            nombres: 'María Elena',
            apellido_paterno: 'Rodríguez',
            apellido_materno: 'López',
            telefono_principal: '987654321',
            email: 'maria.rodriguez@email.com',
            direccion: 'Av. Larco 1234, Miraflores',
            score_crediticio: 650,
            activo: true
        })
        .select('id')
        .single()

    if (error) {
        log('❌', `Error creando cliente: ${error.message}`)
        return false
    }

    CLIENTE_ID = cliente.id
    log('✅', `Cliente creado: María Elena Rodríguez (DNI: ${dniCliente})`)
    return true
}

// ============================================================================
// PASO 5: CREAR GARANTÍA CON FOTOS
// ============================================================================
async function paso5_crearGarantia() {
    log('💎', 'PASO 5: Registrar garantía (objeto empeñado)')

    const valorTasacion = 5000 // S/5,000

    // Crear garantía
    const { data: garantia, error } = await supabase
        .from('garantias')
        .insert({
            cliente_id: CLIENTE_ID,
            descripcion: 'Cadena de oro 18k - 50 gramos - Diseño italiano con dije de corazón',
            valor_tasacion: valorTasacion,
            valor_prestamo_sugerido: valorTasacion * 0.6, // 60% del valor
            estado: 'custodia',
            fotos_urls: [
                'https://placehold.co/400x300/gold/white?text=Cadena+Oro+1',
                'https://placehold.co/400x300/gold/white?text=Cadena+Oro+2',
                'https://placehold.co/400x300/gold/white?text=Detalle+Dije'
            ]
        })
        .select('id')
        .single()

    if (error) {
        log('❌', `Error creando garantía: ${error.message}`)
        return false
    }

    GARANTIA_ID = garantia.id
    log('✅', `Garantía creada: Cadena oro 18k 50g - Tasación S/${valorTasacion}`)
    log('📸', '3 fotos agregadas a la garantía')
    return true
}

// ============================================================================
// PASO 6: CREAR CRÉDITO
// ============================================================================
async function paso6_crearCredito() {
    log('📝', 'PASO 6: Crear crédito/préstamo')

    const montoPrestamo = 3000 // S/3,000 (60% de tasación)
    const tasaInteres = 10 // 10% mensual
    const periodoDias = 30

    const fechaHoy = new Date()
    const fechaVencimiento = new Date(fechaHoy)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + periodoDias)

    // Generar código
    const codigoCredito = `SIM-${Date.now().toString().slice(-6)}`

    // Crear crédito
    const { data: credito, error } = await supabase
        .from('creditos')
        .insert({
            codigo: codigoCredito,
            codigo_credito: codigoCredito,
            cliente_id: CLIENTE_ID,
            garantia_id: GARANTIA_ID,
            caja_origen_id: CAJA_ID,
            monto_prestado: montoPrestamo,
            tasa_interes: tasaInteres,
            periodo_dias: periodoDias,
            fecha_desembolso: fechaHoy.toISOString(),
            fecha_inicio: fechaHoy.toISOString().split('T')[0],
            fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
            saldo_pendiente: montoPrestamo,
            interes_acumulado: montoPrestamo * (tasaInteres / 100),
            estado: 'vigente',
            estado_detallado: 'vigente'
        })
        .select('id')
        .single()

    if (error) {
        log('❌', `Error creando crédito: ${error.message}`)
        return false
    }

    CREDITO_ID = credito.id

    // Registrar movimiento de caja (egreso por desembolso)
    await supabase
        .from('movimientos_caja_operativa')
        .insert({
            caja_operativa_id: CAJA_ID,
            tipo: 'EGRESO',
            motivo: 'DESEMBOLSO',
            monto: montoPrestamo,
            referencia_id: CREDITO_ID,
            descripcion: `Desembolso crédito ${codigoCredito}`,
            usuario_id: TRABAJADOR_ID,
            fecha: new Date().toISOString()
        })

    // Actualizar saldo de caja
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('saldo_actual')
        .eq('id', CAJA_ID)
        .single()

    if (caja) {
        await supabase
            .from('cajas_operativas')
            .update({ saldo_actual: caja.saldo_actual - montoPrestamo })
            .eq('id', CAJA_ID)
    }

    log('✅', `Crédito creado: ${codigoCredito}`)
    log('💵', `Préstamo: S/${montoPrestamo} | Interés: ${tasaInteres}% | Vence: ${fechaVencimiento.toLocaleDateString('es-PE')}`)
    return true
}

// ============================================================================
// PASO 7: CLIENTE PAGA
// ============================================================================
async function paso7_clientePaga() {
    log('💳', 'PASO 7: Cliente realiza pago total')

    // Obtener crédito actual
    const { data: credito } = await supabase
        .from('creditos')
        .select('*')
        .eq('id', CREDITO_ID)
        .single()

    if (!credito) {
        log('❌', 'Crédito no encontrado')
        return false
    }

    const capital = Number(credito.saldo_pendiente)
    const interes = Number(credito.interes_acumulado)
    const totalPagar = capital + interes

    log('📊', `A pagar: Capital S/${capital} + Interés S/${interes} = Total S/${totalPagar}`)

    // Registrar pago
    const { data: pago, error: pagoError } = await supabase
        .from('pagos')
        .insert({
            credito_id: CREDITO_ID,
            caja_operativa_id: CAJA_ID,
            monto_total: totalPagar,
            desglose_capital: capital,
            desglose_interes: interes,
            desglose_mora: 0,
            medio_pago: 'EFECTIVO',
            tipo: 'CANCELACION',
            usuario_id: TRABAJADOR_ID,
            fecha_pago: new Date().toISOString()
        })
        .select('id')
        .single()

    if (pagoError) {
        log('❌', `Error registrando pago: ${pagoError.message}`)
        return false
    }

    // Actualizar crédito
    await supabase
        .from('creditos')
        .update({
            saldo_pendiente: 0,
            interes_acumulado: 0,
            estado: 'cancelado',
            estado_detallado: 'pagado'
        })
        .eq('id', CREDITO_ID)

    // Liberar garantía
    await supabase
        .from('garantias')
        .update({
            estado: 'devuelto'
        })
        .eq('id', GARANTIA_ID)

    // Registrar movimiento de caja (ingreso)
    await supabase
        .from('movimientos_caja_operativa')
        .insert({
            caja_operativa_id: CAJA_ID,
            tipo: 'INGRESO',
            motivo: 'PAGO_CREDITO',
            monto: totalPagar,
            referencia_id: CREDITO_ID,
            descripcion: `Pago total crédito ${credito.codigo}`,
            usuario_id: TRABAJADOR_ID,
            fecha: new Date().toISOString()
        })

    // Actualizar saldo de caja
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('saldo_actual')
        .eq('id', CAJA_ID)
        .single()

    if (caja) {
        await supabase
            .from('cajas_operativas')
            .update({ saldo_actual: caja.saldo_actual + totalPagar })
            .eq('id', CAJA_ID)
    }

    log('✅', `Pago registrado: S/${totalPagar}`)
    log('🔓', 'Garantía liberada - Cliente recoge su prenda')
    return true
}

// ============================================================================
// PASO 8: CIERRE DE CAJA
// ============================================================================
async function paso8_cerrarCaja() {
    log('🔐', 'PASO 8: Cierre de caja')

    // Obtener datos de caja
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('*')
        .eq('id', CAJA_ID)
        .single()

    if (!caja) {
        log('❌', 'Caja no encontrada')
        return false
    }

    // Calcular movimientos
    const { data: movimientos } = await supabase
        .from('movimientos_caja_operativa')
        .select('tipo, monto')
        .eq('caja_operativa_id', CAJA_ID)

    let ingresos = 0
    let egresos = 0

    movimientos?.forEach(m => {
        if (m.tipo === 'INGRESO') ingresos += Number(m.monto)
        else egresos += Number(m.monto)
    })

    const saldoEsperado = caja.saldo_inicial + ingresos - egresos

    log('📊', `Resumen de caja:`)
    log('   ', `Saldo inicial: S/${caja.saldo_inicial}`)
    log('   ', `Ingresos: S/${ingresos}`)
    log('   ', `Egresos: S/${egresos}`)
    log('   ', `Saldo esperado: S/${saldoEsperado}`)
    log('   ', `Saldo actual: S/${caja.saldo_actual}`)

    // Cerrar caja
    const { error } = await supabase
        .from('cajas_operativas')
        .update({
            estado: 'cerrada',
            fecha_cierre: new Date().toISOString(),
            observaciones_cierre: 'Cierre normal - Simulación completa'
        })
        .eq('id', CAJA_ID)

    if (error) {
        log('❌', `Error cerrando caja: ${error.message}`)
        return false
    }

    // Devolver fondos a bóveda
    const { data: boveda } = await supabase
        .from('boveda_central')
        .select('*')
        .single()

    if (boveda) {
        await supabase
            .from('boveda_central')
            .update({
                saldo_disponible: boveda.saldo_disponible + caja.saldo_actual,
                saldo_asignado: boveda.saldo_asignado - caja.saldo_inicial
            })
            .eq('id', boveda.id)
    }

    log('✅', `Caja cerrada exitosamente`)
    return true
}

// ============================================================================
// RESUMEN FINAL
// ============================================================================
async function mostrarResumen() {
    console.log('\n' + '═'.repeat(60))
    console.log('                    📊 RESUMEN FINAL')
    console.log('═'.repeat(60))

    // Bóveda
    const { data: boveda } = await supabase
        .from('boveda_central')
        .select('*')
        .single()

    console.log('\n💰 BÓVEDA:')
    console.log(`   Total: S/${boveda?.saldo_total}`)
    console.log(`   Disponible: S/${boveda?.saldo_disponible}`)

    // Crédito simulado
    const { data: credito } = await supabase
        .from('creditos')
        .select('*, clientes(nombres, apellido_paterno), garantias(descripcion)')
        .eq('id', CREDITO_ID)
        .single()

    console.log('\n📝 CRÉDITO SIMULADO:')
    console.log(`   Código: ${credito?.codigo}`)
    console.log(`   Cliente: ${(credito?.clientes as any)?.nombres} ${(credito?.clientes as any)?.apellido_paterno}`)
    console.log(`   Garantía: ${(credito?.garantias as any)?.descripcion?.substring(0, 40)}...`)
    console.log(`   Estado: ${credito?.estado}`)

    // Estadísticas
    const { count: totalCreditos } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })

    const { count: totalPagos } = await supabase
        .from('pagos')
        .select('*', { count: 'exact', head: true })

    console.log('\n📈 ESTADÍSTICAS:')
    console.log(`   Total créditos: ${totalCreditos}`)
    console.log(`   Total pagos: ${totalPagos}`)

    console.log('\n' + '═'.repeat(60))
    console.log('\n✅ SIMULACIÓN COMPLETADA EXITOSAMENTE\n')
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║     🏦 SIMULACIÓN COMPLETA DEL FLUJO DE NEGOCIO 🏦         ║')
    console.log('╚════════════════════════════════════════════════════════════╝\n')

    try {
        // Ejecutar pasos
        if (!await paso1_agregarFondosBoveda()) throw new Error('Fallo paso 1')
        await sleep(500)

        if (!await paso2_crearTrabajador()) throw new Error('Fallo paso 2')
        await sleep(500)

        if (!await paso3_abrirCaja()) throw new Error('Fallo paso 3')
        await sleep(500)

        if (!await paso4_buscarCrearCliente()) throw new Error('Fallo paso 4')
        await sleep(500)

        if (!await paso5_crearGarantia()) throw new Error('Fallo paso 5')
        await sleep(500)

        if (!await paso6_crearCredito()) throw new Error('Fallo paso 6')
        await sleep(500)

        if (!await paso7_clientePaga()) throw new Error('Fallo paso 7')
        await sleep(500)

        if (!await paso8_cerrarCaja()) throw new Error('Fallo paso 8')

        await mostrarResumen()

    } catch (error) {
        console.error('\n❌ Error en simulación:', error)
    }
}

main()
