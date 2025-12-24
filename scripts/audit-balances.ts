import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { Decimal } from 'decimal.js'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to see all data

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function auditBalances() {
    console.log('--- STARTING BALANCE AUDIT ---')

    // 1. Get Totals from Contratos (Obligations)
    const { data: contratos, error: errContratos } = await supabase
        .from('contratos_fondeo')
        .select('monto_pactado, inversionista_id')

    if (errContratos) throw errContratos

    const totalObligaciones = contratos.reduce(
        (sum, c) => sum.plus(new Decimal(c.monto_pactado)),
        new Decimal(0)
    )

    console.log(`\n1. Obligaciones (Contratos): S/ ${totalObligaciones.toFixed(2)}`)
    console.log(`   Count: ${contratos.length} Contratos`)

    // 2. Get Totals from Transacciones Capital (Actual Money In)
    const { data: movimientos, error: errMov } = await supabase
        .from('transacciones_capital')
        .select('monto')
        .eq('tipo', 'APORTE')

    if (errMov) throw errMov

    const totalRecaudado = movimientos.reduce(
        (sum, m) => sum.plus(new Decimal(m.monto)),
        new Decimal(0)
    )

    console.log(`\n2. Recaudado (Transacciones 'APORTE'): S/ ${totalRecaudado.toFixed(2)}`)
    console.log(`   Count: ${movimientos.length} Movimientos`)

    // 3. Compare
    const diff = totalObligaciones.minus(totalRecaudado)

    console.log('\n--- VERDICT ---')
    if (diff.isZero()) {
        console.log('✅ INTEGRITY OK. Obligaciones match Recaudado.')
    } else {
        console.log(`❌ DISCREPANCY DETECTED. Difference: S/ ${diff.toFixed(2)}`)
        if (diff.isPositive()) {
            console.log('   (Hay más obligaciones kontraktuales que dinero registrado en caja)')
            console.log('   Posible causa: Contratos creados sin transacción de ingreso asociada (Migration/Bakcfill?)')
        } else {
            console.log('   (Hay más dinero en caja que contratos firmados)')
        }
    }

}

auditBalances()
    .catch(err => console.error(err))
    .finally(() => process.exit())
