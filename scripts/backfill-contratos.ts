
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('--- STARTING BACKFILL: INVERSIONISTAS -> CONTRATOS ---\n')

    // 1. Get investors with metadata
    const { data: inversionistas, error: errInv } = await supabase
        .from('inversionistas')
        .select('*')
        .not('metadata', 'is', null)

    if (errInv) {
        console.error('Error fetching inversionistas:', errInv)
        return
    }

    console.log(`Processing ${inversionistas?.length} investors...`)

    let createdCount = 0

    for (const inv of (inversionistas || [])) {
        // Check if already has contract
        const { count } = await supabase
            .from('contratos_fondeo')
            .select('*', { count: 'exact', head: true })
            .eq('inversionista_id', inv.id)

        if (count && count > 0) {
            console.log(`[SKIP] Investor ${inv.id} already has contracts.`)
            continue
        }

        const meta = inv.metadata as any
        if (!meta.monto) {
            console.log(`[SKIP] Investor ${inv.id} has no 'monto' in metadata.`)
            continue
        }

        console.log(`[CREATE] Creating contract for Investor ${inv.id} with amount ${meta.monto}`)

        // Calculate dates
        const fechaInicio = meta.fecha_deposito || inv.fecha_ingreso
        const plazoMeses = meta.plazo_meses || 12
        const fechaFinDate = new Date(fechaInicio)
        fechaFinDate.setMonth(fechaFinDate.getMonth() + plazoMeses)
        const fechaFin = fechaFinDate.toISOString().split('T')[0]

        // Map types
        const tipoContrato = inv.tipo_relacion === 'SOCIO' ? 'PARTICIPACION_EQUITY' : 'DEUDA_FIJA'

        // Create Contract
        const { error: errCreate } = await supabase
            .from('contratos_fondeo')
            .insert({
                inversionista_id: inv.id,
                empresa_id: inv.empresa_id,
                monto_pactado: meta.monto,
                tasa_retorno: meta.tasa_interes || 0,
                tipo: tipoContrato, // Fixed column name and value
                tipo_interes: meta.tipo_interes || 'SIMPLE',
                frecuencia_pago: meta.frecuencia_pago || 'MENSUAL',
                // dia_pago_mensual removed, stored in metadata if needed
                fecha_inicio: fechaInicio,
                fecha_vencimiento: fechaFin,
                estado: 'ACTIVO',
                frecuencia_capitalizacion: meta.frecuencia_capitalizacion || 'MENSUAL',
                metadata: {
                    ...meta,
                    dia_pago_mensual: meta.dia_pago || 1 // Store here
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (errCreate) {
            console.error(`ERROR creating contract for ${inv.id}:`, errCreate)
        } else {
            createdCount++
            console.log(`SUCCESS. Contract created for ${inv.id}`)
        }
    }

    console.log(`\n--- BACKFILL COMPLETE. Created ${createdCount} contracts. ---`)
}

main()
