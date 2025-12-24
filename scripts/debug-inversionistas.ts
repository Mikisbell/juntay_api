
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('--- DEBUGGING INVERSIONISTAS DATA ---\n')

    // 1. Check Inversionistas
    const { data: inversionistas, error: errInv } = await supabase
        .from('inversionistas')
        .select('*, personas(nombres, apellido_paterno)')

    if (errInv) {
        console.error('Error fetching inversionistas:', errInv)
        return
    }
    console.log(`Found ${inversionistas?.length} inversionistas:`)
    inversionistas?.forEach(inv => {
        console.log(JSON.stringify(inv, null, 2))
    })

    console.log('\n--- CONTRATOS FONDEO ---\n')

    // 2. Check Contratos
    const { data: contratos, error: errCont } = await supabase
        .from('contratos_fondeo')
        .select('*')

    if (errCont) {
        console.error('Error fetching contratos:', errCont)
    } else {
        console.log(`Found ${contratos?.length} contratos:`)
        contratos?.forEach(c => {
            console.log(`- ID: ${c.id} | InvID: ${c.inversionista_id} | State: ${c.estado} | Amount: ${c.monto_pactado}`)
        })
    }

    console.log('\n--- VISTA PROFESIONAL ---\n')

    // 3. Check View
    const { data: vista, error: errVista } = await supabase
        .from('vista_inversionistas_profesional')
        .select('*')

    if (errVista) {
        console.error('Error fetching vista:', errVista)
    } else {
        console.log(`Found ${vista?.length} rows in VIEW:`)
        vista?.forEach(v => {
            console.log(`- InvID: ${v.inversionista_id} | Capital: ${v.capital_total} | Rendimiento: ${v.rendimiento_devengado}`)
        })
    }

    // 4. Check join logic mismatch
    if (inversionistas?.length && (!contratos?.length)) {
        console.log('\n[DIAGNOSIS]: Existen inversionistas pero NO tienen contratos en tabla `contratos_fondeo`.')
        console.log('El dashboard lee de la vista, y la vista requiere contratos activos para sumar capital.')
    } else if (contratos?.length) {
        // Check if contracts state matches view filter
        const activeContracts = contratos.filter(c => c.estado === 'ACTIVO')
        console.log(`\nActive Contracts: ${activeContracts.length}`)
        if (activeContracts.length === 0) console.log('[DIAGNOSIS]: Hay contratos pero ninguno está ACTIVO.')
    }
}

main()
