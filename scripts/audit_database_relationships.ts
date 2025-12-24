import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function audit() {
    console.log('--- STARTING DEEP DATABASE AUDIT ---')

    // 1. Structure Check: Cajas Operativas
    console.log('\n[1] Inspecting "cajas_operativas"')
    const { data: cajas, error: errCajas } = await supabase
        .from('cajas_operativas')
        .select('*')
        .limit(5)

    if (errCajas) console.error('Error fetching cajas:', errCajas.message)
    else {
        console.log(`   Found ${cajas.length} active records sample.`)
        if (cajas.length > 0) {
            console.log('   Sample Keys:', Object.keys(cajas[0]))
        }
    }

    // 2. Structure Check: Cuentas Financieras
    console.log('\n[2] Inspecting "cuentas_financieras"')
    const { data: cuentas, error: errCuentas } = await supabase
        .from('cuentas_financieras')
        .select('*')
        .limit(5)

    if (errCuentas) console.error('Error fetching cuentas:', errCuentas.message)
    else {
        console.log(`   Found ${cuentas.length} records sample.`)
        if (cuentas.length > 0) {
            console.log('   Sample Keys:', Object.keys(cuentas[0]))
        }
    }

    // 3. Movement Check
    console.log('\n[3] Comparing Movimientos tables')
    const { count: countMovCaja } = await supabase.from('movimientos_caja_operativa').select('*', { count: 'exact', head: true })
    const { count: countTransCap } = await supabase.from('transacciones_capital').select('*', { count: 'exact', head: true })

    console.log(`   Legacy (movimientos_caja_operativa): ${countMovCaja} rows`)
    console.log(`   New (transacciones_capital): ${countTransCap} rows`)

    // 4. Overlap Check (Is there data sync?)
    // Check if any transaccion_capital references a caja_operativa (if FK exists)
    // We can't check FK easily via JS client without inspection view, but we can check metadata/columns
    // Let's assume metadata JSONB might hold clues.

    if (countTransCap && countTransCap > 0) {
        const { data: trans } = await supabase.from('transacciones_capital').select('metadata').not('metadata', 'is', null).limit(20)
        let foundLink = false
        trans?.forEach(t => {
            if (JSON.stringify(t.metadata).includes('caja_operativa_id')) foundLink = true
        })
        console.log(`\n   Link Check: Metadata contains 'caja_operativa_id'? ${foundLink ? 'YES' : 'NO'}`)
    }

}

audit()
