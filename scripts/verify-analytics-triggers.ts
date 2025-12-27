
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { randomUUID } from 'crypto'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log("🚀 Testing Analytics Triggers...")

    // 1. Get a test company
    const { data: empresa } = await supabase.from('empresas').select('id').limit(1).single()
    if (!empresa) throw new Error("No companies found")
    const empresaId = empresa.id

    // 2. Get initial metrics
    const { data: initial } = await supabase
        .from('metricas_uso_tenant')
        .select('creditos_historicos, creditos_vigentes')
        .eq('empresa_id', empresaId)
        .single()

    console.log("Initial State:", initial)

    // 3. Insert a dummy credit
    const dummyCreditId = randomUUID()
    console.log("Inserting dummy credit...", dummyCreditId)

    // We need a valid client and sucursal
    const { data: sucursal } = await supabase.from('sucursales').select('id').eq('empresa_id', empresaId).limit(1).single()
    const { data: cliente } = await supabase.from('clientes').select('id').eq('empresa_id', empresaId).limit(1).single()

    if (!sucursal || !cliente) {
        console.warn("⚠️ Skipping test: Need 1 sucursal and 1 cliente to insert credit")
        return
    }

    const { error: insertError } = await supabase.from('creditos').insert({
        id: dummyCreditId,
        empresa_id: empresaId,
        sucursal_id: sucursal.id,
        cliente_id: cliente.id,
        codigo: 'TEST-TRIGGER-' + Date.now(),
        monto_prestado: 1000,
        saldo_pendiente: 1200,
        fecha_desembolso: new Date().toISOString(),
        fecha_vencimiento: new Date(Date.now() + 86400000 * 30).toISOString(),
        estado: 'vigente',
        estado_detallado: 'vigente',
        tasa_interes: 10,
        periodo_dias: 30,
        // asesor_id removed/replaced by created_by if needed, or omitted if nullable
        // We use the admin user ID we assumed earlier
        created_by: 'a0000000-0000-0000-0000-000000000001'
    })

    if (insertError) {
        console.error("Insert failed:", insertError)
        throw insertError
    }

    // 4. Check metrics again (Immediate consistency expected due to trigger)
    const { data: updated } = await supabase
        .from('metricas_uso_tenant')
        .select('creditos_historicos, creditos_vigentes')
        .eq('empresa_id', empresaId)
        .single()

    console.log("Updated State:", updated)

    // 5. Cleanup
    await supabase.from('creditos').delete().eq('id', dummyCreditId)

    // 6. Assertions
    if (updated.creditos_historicos !== initial.creditos_historicos + 1) {
        throw new Error(`❌ Trigger Failed: creditos_historicos did not increment. ${initial.creditos_historicos} -> ${updated.creditos_historicos}`)
    }
    if (updated.creditos_vigentes !== initial.creditos_vigentes + 1) {
        throw new Error(`❌ Trigger Failed: creditos_vigentes did not increment.`)
    }

    console.log("✅ SUCCESS: Analytics Trigger updated cache correctly.")
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})
