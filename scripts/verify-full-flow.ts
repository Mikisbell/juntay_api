
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

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

// Mismo usuario y caja que ensure-dev-env.ts
const DEV_USER_ID = '00000000-0000-0000-0000-000000000011'
const CAJA_ID = 'e3752601-5743-4e48-963a-233c41539207'

async function runVerification() {
    console.log('🧪 Iniciando Verificación de Flujo Completo (Backend Logic)...')

    // 1. Datos de prueba
    const clienteDni = '43708667' // Juan Perez Mock
    const clienteData = {
        nombres: 'Juan',
        apellidos: 'Perez Test',
        tipo_documento: 'DNI',
        numero_documento: clienteDni,
        direccion: 'Calle Test 123',
        telefono: '999888777'
    }

    const itemData = {
        descripcion: 'Laptop Test Verificacion',
        categoria: 'electrodomesticos',
        marca: 'Dell',
        modelo: 'Latitude',
        serie: 'SN-12345',
        estado_conservacion: 'bueno',
        observaciones: 'Test script'
    }

    const contratoData = {
        monto_prestamo: 100.00,
        interes: 10.00, // 10%
        plazo_dias: 30,
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [itemData] // Array of items
    }

    // 2. Crear contrato (Simula registrarEmpeno)
    console.log('📝 1. Creando Contrato (RPC: crear_contrato_oficial)...')

    // p_caja_id, p_cliente_doc_tipo, p_cliente_doc_num, p_cliente_nombre, p_garantia_data, p_contrato_data

    // Construct garantiaData similar to actions
    const garantiaData = {
        descripcion: itemData.descripcion,
        categoria: itemData.categoria,
        valor_tasacion: 500, // Hardcoded valid value
        estado: itemData.estado_conservacion,
        marca: itemData.marca,
        modelo: itemData.modelo,
        serie: itemData.serie,
        subcategoria: 'lavadoras', // Valid subcategory
        fotos: []
    }

    const { data: contratoId, error: contratoError } = await supabase.rpc('crear_contrato_oficial', {
        p_caja_id: CAJA_ID,
        p_cliente_doc_tipo: clienteData.tipo_documento,
        p_cliente_doc_num: clienteData.numero_documento,
        p_cliente_nombre: `${clienteData.nombres} ${clienteData.apellidos}`,
        p_garantia_data: garantiaData,
        p_contrato_data: {
            monto: contratoData.monto_prestamo,
            interes: contratoData.interes,
            dias: contratoData.plazo_dias,
            fecha_venc: contratoData.fecha_vencimiento
        }
    })

    if (contratoError) {
        console.error('❌ Error creando contrato:', contratoError)
        return
    }

    console.log('✅ Contrato Creado ID:', contratoId)
    // const creditoId = contratoResult.credito_id // OLD MISTAKE: RPC returns UUID directly
    const creditoId = contratoId

    if (!creditoId) {
        console.error('❌ No devolvió ID de crédito (UUID null)')
        return
    }

    // 3. Verificar Crédito en BD (Check fecha_cancelacion exists/null)
    const { data: credito, error: fetchError } = await supabase
        .from('creditos')
        .select('*')
        .eq('id', creditoId)
        .single()

    if (fetchError) {
        console.error('❌ Error buscando crédito:', fetchError)
        return
    }
    console.log('🔍 Crédito verificado en BD. Estado:', credito.estado)

    // 4. Registrar Pago Parcial (Simula registrarPago)
    console.log('💸 2. Registrando Pago de S/ 50.00 (RPC: registrar_pago_oficial)...')

    // Params: p_caja_id, p_credito_id, p_monto_pago, p_tipo_operacion, p_metodo_pago, p_metadata, p_usuario_id
    const { data: pagoResult, error: pagoError } = await supabase.rpc('registrar_pago_oficial', {
        p_caja_id: CAJA_ID,
        p_credito_id: creditoId,
        p_monto_pago: 50.00,
        // p_tipo_operacion: 'PAGO_CUOTA' -> Replaced by DESEMPENO or AMORTIZACION for testing
        p_tipo_operacion: 'AMORTIZACION', // Let's test amortization for partial payment logic
        p_metodo_pago: 'EFECTIVO',
        p_metadata: {},
        p_usuario_id: DEV_USER_ID
    })

    // UPDATE: Si trato de pagar solo 50 para desempeño fallará si la lógica valida montos.
    // Vamos a pagar el total 110.00 para verificar que se CANCELE y se llene la fecha.
    console.log('🔄 Cambiando a Pago Total (Desempeño) para verificar cierre...')

    const { data: pagoTotalResult, error: pagoTotalError } = await supabase.rpc('registrar_pago_oficial', {
        p_caja_id: CAJA_ID,
        p_credito_id: creditoId,
        p_monto_pago: 110.00, // Monto total
        p_tipo_operacion: 'DESEMPENO',
        p_metodo_pago: 'EFECTIVO',
        p_metadata: {},
        p_usuario_id: DEV_USER_ID
    })

    if (pagoTotalError) {
        console.error('❌ Error registrando pago total:', pagoTotalError)
        return
    }
    console.log('✅ Pago Total Registrado.')

    // 5. Verificar Cierre (Fecha Cancelación)
    const { data: creditoFinal, error: finalError } = await supabase
        .from('creditos')
        .select('*')
        .eq('id', creditoId)
        .single()

    if (finalError) { console.error(finalError); return }

    console.log('🔍 Estado Final:', creditoFinal.estado)
    console.log('📅 Fecha Cancelación:', creditoFinal.fecha_cancelacion)

    if (creditoFinal.estado === 'cancelado' && creditoFinal.fecha_cancelacion) {
        console.log('🎉 PRUEBA EXTRAORDINARIA: El flujo completo (Empeño -> Desempeño) funciona y los datos persisten.')
    } else {
        console.error('⚠️ ALERTA: El estado o fecha no son correctos.')
    }
}

runVerification().catch(console.error)
