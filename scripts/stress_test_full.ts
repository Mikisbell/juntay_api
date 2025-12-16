/**
 * SCRIPT DE ESTRÉS MÁXIMO - JUNTAY
 * 
 * Este script:
 * 1. Aplica migraciones faltantes
 * 2. Genera datos de prueba extremos
 * 3. PROTEGE admin@juntay.com
 * 
 * Ejecutar: npx tsx scripts/stress_test_full.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// DNIs peruanos realistas para pruebas
const DNIS_TEST = [
    '10000001', '10000002', '10000003', '10000004', '10000005',
    '20000001', '20000002', '20000003', '20000004', '20000005',
    '30000001', '30000002', '30000003', '30000004', '30000005',
    '40000001', '40000002', '40000003', '40000004', '40000005',
    '50000001', '50000002', '50000003', '50000004', '50000005',
]

const NOMBRES = [
    'María Elena', 'Juan Carlos', 'Rosa María', 'Luis Alberto', 'Carmen Rosa',
    'José Luis', 'Ana María', 'Pedro Pablo', 'Luz Marina', 'Carlos Alberto',
    'Mónica Patricia', 'Jorge Luis', 'Silvia Esperanza', 'Roberto Carlos', 'Gloria María',
    'Miguel Ángel', 'Teresa de Jesús', 'Fernando Alonso', 'Pilar Eugenia', 'Raúl Eduardo'
]

const APELLIDOS = [
    'García López', 'Rodríguez Pérez', 'Martínez Sánchez', 'Hernández González',
    'López Ramírez', 'González Torres', 'Díaz Flores', 'Pérez Castro',
    'Sánchez Rivera', 'Ramírez Morales', 'Torres Vargas', 'Flores Jiménez',
    'Rivera Ortiz', 'Gómez Chávez', 'Morales Mendoza', 'Vargas Ruiz',
    'Castro Medina', 'Ortiz Aguilar', 'Chávez Herrera', 'Mendoza Cruz'
]

const GARANTIAS_DESCRIPCION = [
    // Joyas de alto valor (casos extremos)
    'Cadena de oro 18k italiana, 85gr, eslabones gruesos - PREMIUM',
    'Anillo de compromiso diamante 2.5 quilates, oro blanco 18k',
    'Reloj Rolex Submariner original con certificado, acero/oro',
    'Set completo collar + aretes + pulsera oro 24k, 120gr total',
    'Cadena cubana oro 18k maciza, 150gr, cierre seguridad',

    // Electrónicos de alto valor
    'MacBook Pro 16" M3 Max, 64GB RAM, 1TB - SELLADO',
    'iPhone 15 Pro Max 1TB Titanium Natural - NUEVO',
    'iPad Pro 12.9" M2 + Apple Pencil + Magic Keyboard',
    'PlayStation 5 + 10 juegos originales + 2 mandos',
    'Cámara Sony A7IV + lente 24-70mm f/2.8 GM',

    // Vehículos menores (motos)
    'Moto Honda CBR 600RR 2023 - tarjeta original',
    'Scooter Vespa Primavera 150cc - documentos en regla',
    'Moto Yamaha MT-07 2022 - mantenimiento al día',

    // Instrumentos musicales
    'Guitarra Gibson Les Paul Standard años 70 - colección',
    'Piano digital Yamaha Clavinova CVP-909',
    'Saxofón Selmer París Serie III profesional',

    // Artículos de lujo
    'Bolso Louis Vuitton Neverfull MM original + factura',
    'Cartera Hermès Birkin 25 cuero Togo - certificado',
    'Lentes Ray-Ban Aviator oro 14k - edición limitada'
]

// Generar fecha aleatoria en rango
function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generar teléfono peruano
function randomPhone(): string {
    const prefixes = ['9', '9', '9', '9']
    return prefixes[Math.floor(Math.random() * prefixes.length)] +
        Math.floor(10000000 + Math.random() * 90000000).toString()
}

// ============================================================================
// PASO 1: APLICAR MIGRACIONES
// ============================================================================

async function applyMigrations() {
    console.log('\n🔧 APLICANDO MIGRACIONES...\n')

    const alterStatements = [
        // Creditos
        `ALTER TABLE creditos ADD COLUMN IF NOT EXISTS codigo_credito VARCHAR(50)`,
        `ALTER TABLE creditos ADD COLUMN IF NOT EXISTS fecha_inicio DATE`,
        `ALTER TABLE creditos ADD COLUMN IF NOT EXISTS observaciones TEXT`,
        // Garantias
        `ALTER TABLE garantias ADD COLUMN IF NOT EXISTS fecha_venta TIMESTAMPTZ`,
        `ALTER TABLE garantias ADD COLUMN IF NOT EXISTS precio_venta NUMERIC(12,2)`,
        `ALTER TABLE garantias ADD COLUMN IF NOT EXISTS credito_id UUID`,
        `ALTER TABLE garantias ADD COLUMN IF NOT EXISTS fotos TEXT[]`,
        // Pagos
        `ALTER TABLE pagos ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'PAGO'`,
        `ALTER TABLE pagos ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50)`,
        `ALTER TABLE pagos ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE pagos ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT`,
        `ALTER TABLE pagos ADD COLUMN IF NOT EXISTS anulado_por UUID`,
        `ALTER TABLE pagos ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ`,
        `ALTER TABLE pagos ADD COLUMN IF NOT EXISTS usuario_id UUID`,
        `ALTER TABLE pagos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`,
        // Movimientos
        `ALTER TABLE movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE movimientos_caja_operativa ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT`,
        `ALTER TABLE movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado_por UUID`,
        `ALTER TABLE movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ`,
        `ALTER TABLE movimientos_caja_operativa ADD COLUMN IF NOT EXISTS es_reversion BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE movimientos_caja_operativa ADD COLUMN IF NOT EXISTS movimiento_original_id UUID`,
        `ALTER TABLE movimientos_caja_operativa ADD COLUMN IF NOT EXISTS movimiento_reversion_id UUID`,
        `ALTER TABLE movimientos_caja_operativa ADD COLUMN IF NOT EXISTS caja_id UUID`
    ]

    // Nota: Las migraciones ALTER TABLE deben ejecutarse manualmente en Supabase SQL Editor
    // Este script se enfoca en los datos de estrés
    console.log('  ⚠️  Las ALTER TABLE deben ejecutarse en Supabase SQL Editor')
    console.log('  📄  Ver: scripts/apply_all_migrations.sql\n')

    return true
}

// ============================================================================
// PASO 2: LIMPIAR DATOS DE PRUEBA (preservar admin)
// ============================================================================

async function cleanTestData() {
    console.log('\n🧹 LIMPIANDO DATOS DE PRUEBA ANTERIORES...\n')

    // Preservar admin@juntay.com
    const { data: adminUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', 'admin@juntay.com')
        .single()

    console.log(`  🔒 Protegiendo usuario admin: ${adminUser?.id || 'no encontrado'}`)

    // Eliminar créditos de prueba (los que tienen código que empieza con TEST)
    const { error: errCreditos } = await supabase
        .from('creditos')
        .delete()
        .like('codigo', 'TEST%')

    if (!errCreditos) console.log('  ✅ Créditos de prueba eliminados')

    // Eliminar garantías huérfanas
    // const { error: errGarantias } = await supabase
    //     .from('garantias')
    //     .delete()
    //     .is('cliente_id', null)

    console.log('  ✅ Limpieza completada (datos reales preservados)')

    return adminUser?.id
}

// ============================================================================
// PASO 3: CREAR PERSONAS Y CLIENTES DE ESTRÉS
// ============================================================================

async function createStressClients() {
    console.log('\n👥 CREANDO CLIENTES DE ESTRÉS...\n')

    const clientesCreados: string[] = []

    for (let i = 0; i < 15; i++) {
        const dni = `99${String(i).padStart(6, '0')}`
        const nombre = NOMBRES[i % NOMBRES.length]
        const apellido = APELLIDOS[i % APELLIDOS.length]
        const [apPaterno, apMaterno] = apellido.split(' ')

        // Crear persona
        const { data: persona, error: errPersona } = await supabase
            .from('personas')
            .upsert({
                tipo_documento: 'DNI',
                numero_documento: dni,
                nombres: nombre,
                apellido_paterno: apPaterno,
                apellido_materno: apMaterno,
                telefono_principal: randomPhone(),
                email: `stress${i}@test.com`,
                direccion: `Av. Prueba ${i * 100}, Lima`
            }, { onConflict: 'numero_documento' })
            .select('id')
            .single()

        if (errPersona) {
            // Intentar obtener existente
            const { data: existing } = await supabase
                .from('personas')
                .select('id')
                .eq('numero_documento', dni)
                .single()

            if (existing) {
                // Crear cliente vinculado
                const { data: cliente, error: errCliente } = await supabase
                    .from('clientes')
                    .upsert({
                        persona_id: existing.id,
                        tipo_documento: 'DNI',
                        numero_documento: dni,
                        nombres: nombre,
                        apellido_paterno: apPaterno,
                        apellido_materno: apMaterno,
                        telefono_principal: randomPhone(),
                        score_crediticio: 300 + Math.floor(Math.random() * 400),
                        activo: true
                    }, { onConflict: 'numero_documento' })
                    .select('id')
                    .single()

                if (cliente) clientesCreados.push(cliente.id)
            }
        } else if (persona) {
            // Crear cliente vinculado
            const { data: cliente } = await supabase
                .from('clientes')
                .upsert({
                    persona_id: persona.id,
                    tipo_documento: 'DNI',
                    numero_documento: dni,
                    nombres: nombre,
                    apellido_paterno: apPaterno,
                    apellido_materno: apMaterno,
                    telefono_principal: randomPhone(),
                    score_crediticio: 300 + Math.floor(Math.random() * 400),
                    activo: true
                }, { onConflict: 'numero_documento' })
                .select('id')
                .single()

            if (cliente) clientesCreados.push(cliente.id)
        }
    }

    // Obtener todos los clientes para usar
    const { data: allClientes } = await supabase
        .from('clientes')
        .select('id')
        .limit(50)

    console.log(`  ✅ Clientes disponibles: ${allClientes?.length || 0}`)
    return allClientes?.map(c => c.id) || []
}

// ============================================================================
// PASO 4: CREAR CRÉDITOS EN TODOS LOS ESTADOS POSIBLES
// ============================================================================

async function createStressCredits(clienteIds: string[]) {
    console.log('\n💳 CREANDO CRÉDITOS DE ESTRÉS...\n')

    if (clienteIds.length === 0) {
        console.log('  ❌ No hay clientes disponibles')
        return []
    }

    const creditosCreados: string[] = []
    const hoy = new Date()

    // Obtener caja abierta o usar la primera
    const { data: caja } = await supabase
        .from('cajas_operativas')
        .select('id')
        .eq('estado', 'abierta')
        .limit(1)
        .single()

    const cajaId = caja?.id

    // Escenarios de estrés
    const escenarios = [
        // 1. Créditos recién creados (vigentes)
        { estado: 'vigente', detallado: 'vigente', diasVenc: 30, monto: 500 },
        { estado: 'vigente', detallado: 'vigente', diasVenc: 25, monto: 1000 },
        { estado: 'vigente', detallado: 'vigente', diasVenc: 20, monto: 2500 },

        // 2. Por vencer (urgentes)
        { estado: 'vigente', detallado: 'por_vencer', diasVenc: 5, monto: 3000 },
        { estado: 'vigente', detallado: 'por_vencer', diasVenc: 3, monto: 5000 },
        { estado: 'vigente', detallado: 'por_vencer', diasVenc: 1, monto: 8000 },

        // 3. Vencidos (1-15 días)
        { estado: 'vencido', detallado: 'vencido', diasVenc: -5, monto: 1200 },
        { estado: 'vencido', detallado: 'vencido', diasVenc: -10, monto: 2200 },
        { estado: 'vencido', detallado: 'vencido', diasVenc: -14, monto: 4500 },

        // 4. En mora (15-30 días)
        { estado: 'vencido', detallado: 'en_mora', diasVenc: -20, monto: 6000 },
        { estado: 'vencido', detallado: 'en_mora', diasVenc: -25, monto: 10000 },

        // 5. En gracia (30-60 días)
        { estado: 'vencido', detallado: 'en_gracia', diasVenc: -35, monto: 15000 },
        { estado: 'vencido', detallado: 'en_gracia', diasVenc: -50, monto: 20000 },

        // 6. Pre-remate (60+ días)
        { estado: 'pre_remate', detallado: 'pre_remate', diasVenc: -65, monto: 25000 },
        { estado: 'pre_remate', detallado: 'pre_remate', diasVenc: -90, monto: 35000 },

        // 7. Casos extremos
        { estado: 'vigente', detallado: 'vigente', diasVenc: 30, monto: 50000 },  // Monto máximo
        { estado: 'vencido', detallado: 'pre_remate', diasVenc: -120, monto: 45000 },  // Muy vencido
    ]

    for (let i = 0; i < escenarios.length; i++) {
        const esc = escenarios[i]
        const clienteId = clienteIds[i % clienteIds.length]

        // Crear garantía primero
        const { data: garantia, error: errGarantia } = await supabase
            .from('garantias')
            .insert({
                cliente_id: clienteId,
                descripcion: GARANTIAS_DESCRIPCION[i % GARANTIAS_DESCRIPCION.length],
                valor_tasacion: esc.monto * 1.5,  // Tasación mayor al préstamo
                valor_prestamo_sugerido: esc.monto,
                estado: 'custodia',
                fotos_urls: [`https://placehold.co/400x300?text=Garantia+${i + 1}`]
            })
            .select('id')
            .single()

        if (errGarantia) {
            console.log(`  ❌ Error creando garantía ${i}: ${errGarantia.message}`)
            continue
        }

        // Calcular fechas
        const fechaVencimiento = new Date(hoy)
        fechaVencimiento.setDate(fechaVencimiento.getDate() + esc.diasVenc)

        const fechaDesembolso = new Date(fechaVencimiento)
        fechaDesembolso.setDate(fechaDesembolso.getDate() - 30)  // 30 días antes de vencer

        // Calcular interés (10% mensual base + mora)
        const diasVencido = Math.max(0, -esc.diasVenc)
        const interesMensual = esc.monto * 0.10
        const moraDiaria = diasVencido > 0 ? diasVencido * esc.monto * 0.003 : 0
        const interesTotal = interesMensual + moraDiaria

        // Crear crédito
        const codigo = `TEST-${String(i + 1).padStart(4, '0')}`

        const { data: credito, error: errCredito } = await supabase
            .from('creditos')
            .insert({
                codigo,
                cliente_id: clienteId,
                garantia_id: garantia.id,
                caja_origen_id: cajaId,
                monto_prestado: esc.monto,
                tasa_interes: 10,
                periodo_dias: 30,
                fecha_desembolso: fechaDesembolso.toISOString(),
                fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                saldo_pendiente: esc.monto,
                interes_acumulado: Math.round(interesTotal * 100) / 100,
                estado: esc.estado,
                estado_detallado: esc.detallado
            })
            .select('id')
            .single()

        if (errCredito) {
            console.log(`  ❌ Error creando crédito ${codigo}: ${errCredito.message}`)
        } else if (credito) {
            creditosCreados.push(credito.id)
            console.log(`  ✅ ${codigo}: S/${esc.monto} - ${esc.detallado}`)
        }
    }

    console.log(`\n  📊 Total créditos de estrés creados: ${creditosCreados.length}`)
    return creditosCreados
}

// ============================================================================
// PASO 5: MOSTRAR RESUMEN
// ============================================================================

async function showSummary() {
    console.log('\n' + '═'.repeat(60))
    console.log('            📊 RESUMEN FINAL DE ESTRÉS')
    console.log('═'.repeat(60) + '\n')

    // Contar por estado
    const { data: creditos } = await supabase
        .from('creditos')
        .select('estado, estado_detallado, monto_prestado')

    if (creditos) {
        const byEstado: Record<string, { count: number, monto: number }> = {}

        for (const c of creditos) {
            const key = c.estado_detallado || c.estado
            if (!byEstado[key]) byEstado[key] = { count: 0, monto: 0 }
            byEstado[key].count++
            byEstado[key].monto += c.monto_prestado
        }

        console.log('Estado             | Cantidad | Monto Total')
        console.log('-'.repeat(50))
        for (const [estado, data] of Object.entries(byEstado).sort((a, b) => b[1].count - a[1].count)) {
            console.log(`${estado.padEnd(18)} | ${String(data.count).padStart(8)} | S/ ${data.monto.toLocaleString()}`)
        }

        const totalCreditos = creditos.length
        const totalMonto = creditos.reduce((sum, c) => sum + c.monto_prestado, 0)
        console.log('-'.repeat(50))
        console.log(`${'TOTAL'.padEnd(18)} | ${String(totalCreditos).padStart(8)} | S/ ${totalMonto.toLocaleString()}`)
    }

    // Bóveda
    const { data: boveda } = await supabase
        .from('boveda_central')
        .select('*')
        .single()

    if (boveda) {
        console.log('\n💰 BÓVEDA:')
        console.log(`   Total: S/ ${boveda.saldo_total?.toLocaleString()}`)
        console.log(`   Disponible: S/ ${boveda.saldo_disponible?.toLocaleString()}`)
        console.log(`   Asignado: S/ ${boveda.saldo_asignado?.toLocaleString()}`)
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║        🔥 STRESS TEST MÁXIMO - JUNTAY 🔥                   ║')
    console.log('╚════════════════════════════════════════════════════════════╝')

    // 1. Aplicar migraciones (nota)
    await applyMigrations()

    // 2. Limpiar datos de prueba anteriores
    await cleanTestData()

    // 3. Crear clientes de estrés
    const clienteIds = await createStressClients()

    // 4. Crear créditos en todos los estados
    await createStressCredits(clienteIds)

    // 5. Mostrar resumen
    await showSummary()

    console.log('\n✅ STRESS TEST COMPLETADO\n')
    console.log('💡 Ahora puedes probar el sistema con escenarios extremos:')
    console.log('   - Créditos con vencimientos críticos')
    console.log('   - Montos desde S/500 hasta S/50,000')
    console.log('   - Estados: vigente, vencido, mora, pre_remate')
    console.log('')
}

main().catch(console.error)
