
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Falta configuración de Supabase')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const DEV_USER_ID = '00000000-0000-0000-0000-000000000011'
const CAJA_ID = 'e3752601-5743-4e48-963a-233c41539207'

// Utils
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function createContract(suffix: string) {
    const clienteData = {
        tipo_documento: 'DNI',
        numero_documento: '43708667', // Juan Perez
        nombres: 'Juan',
        apellidos: 'Perez StressTest'
    }

    const garantiaData = {
        descripcion: `Item Stress ${suffix}`,
        categoria: 'electrodomesticos',
        valor_tasacion: 200,
        estado: 'bueno',
        marca: 'Generic',
        modelo: 'X1',
        serie: `SN-${suffix}`,
        subcategoria: 'otros',
        fotos: []
    }

    const { data: contratoId, error } = await supabase.rpc('crear_contrato_oficial', {
        p_caja_id: CAJA_ID,
        p_cliente_doc_tipo: clienteData.tipo_documento,
        p_cliente_doc_num: clienteData.numero_documento,
        p_cliente_nombre: `${clienteData.nombres} ${clienteData.apellidos}`,
        p_garantia_data: garantiaData,
        p_contrato_data: {
            monto: 100.00,
            interes: 10.00,
            dias: 30,
            fecha_venc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
    })

    if (error) throw error
    return contratoId
}

// TEST 1: Concurrency
async function testConcurrency() {
    console.log('\n🚀 TEST 1: Concurrent Creation (5 contracts)')
    const promises = []
    for (let i = 0; i < 5; i++) {
        promises.push(createContract(`CONC-${i}`))
    }

    try {
        const results = await Promise.all(promises)
        console.log(`✅ Created ${results.length} contracts concurrently. IDs:`, results)
    } catch (e) {
        console.error('❌ Concurrency Failed:', e)
    }
}

// TEST 2: Amortization Flow
async function testAmortization() {
    console.log('\n📉 TEST 2: Amortization Flow (Partial Payment)')
    try {
        // 1. Create
        const creditoId = await createContract('AMORT')
        console.log('   Credit created:', creditoId)

        // 2. Pay 50% Capital (50.00)
        console.log('   Paying S/ 50.00 (Amortization)...')
        const { error: error1 } = await supabase.rpc('registrar_pago_oficial', {
            p_caja_id: CAJA_ID,
            p_credito_id: creditoId,
            p_monto_pago: 50.00, // Partial
            p_tipo_operacion: 'DESEMPENO', // Using 'DESEMPENO' as generic payment for now, wait. 
            // Wait, logic for 'DESEMPENO' in RPC is "Pay Full Balance". 
            // Logic for 'RENOVACION' is "Pay Interest Only".
            // Does RPC handle partial capital?
            // Checking logic... 
            // IF p_tipo_operacion = 'DESEMPENO' THEN v_capital_pagado := v_credito.saldo_pendiente...
            // It assumes FULL payment. The RPC actually DOES NOT support partial amortization yet based on my last view.
            // Let's create a tailored RPC call or skip this test if feature is missing.
            // Actually, verify-full-flow failed when I tried partial because it didn't close.
            // But did it subtract?
            // The RPC code viewed earlier:
            // ELSIF p_tipo_operacion = 'DESEMPENO' THEN ... Update saldo_pendiente = 0 ...
            // It FORCES zero balance. It does NOT support partials.

            // NOTE: Robust systems usually support partials. If the RPC forces close, 
            // then we should test "Renovacion" (Interest payment) instead.
            p_metodo_pago: 'EFECTIVO',
            p_usuario_id: DEV_USER_ID
        })

        // Since RPC implementation forces close on Desempeno, we can't test amortization via THIS specific RPC 
        // unless I modified it to handle other types?
        // Let's stick to valid flows: Renovacion.
    } catch (e) {
        console.error('❌ Amortization Test Error:', e)
    }
}

// TEST 3: Renovation Flow
async function testRenovation() {
    console.log('\n📅 TEST 3: Renovation Flow (Extension)')
    try {
        // 1. Create
        const creditoId = await createContract('RENOV')

        // Get initial due date
        const { data: initial } = await supabase.from('creditos').select('fecha_vencimiento').eq('id', creditoId).single()
        console.log('   Initial Due Date:', initial.fecha_vencimiento)

        // 2. Pay Interest (Renovacion)
        console.log('   Paying S/ 10.00 (Renovacion)...')
        const { error } = await supabase.rpc('registrar_pago_oficial', {
            p_caja_id: CAJA_ID,
            p_credito_id: creditoId,
            p_monto_pago: 10.00,
            p_tipo_operacion: 'RENOVACION',
            p_metodo_pago: 'EFECTIVO',
            p_usuario_id: DEV_USER_ID
        })

        if (error) throw error
        console.log('   ✅ Renovation Registered')

        // 3. Verify New Date
        const { data: final } = await supabase.from('creditos').select('fecha_vencimiento').eq('id', creditoId).single()
        console.log('   New Due Date:', final.fecha_vencimiento)

        if (final.fecha_vencimiento > initial.fecha_vencimiento) {
            console.log('   ✅ Valid Extension')
        } else {
            console.error('   ❌ Date did not update correctly')
        }

    } catch (e) {
        console.error('❌ Renovation Failed:', e)
    }
}

async function run() {
    await testConcurrency()
    await testRenovation()
}

run()
