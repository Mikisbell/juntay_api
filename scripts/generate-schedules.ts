
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { generarCronogramaPagos, calcularInteresSimple } from '../src/lib/utils/rendimientos-inversionista'

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('--- STARTING SCHEDULE GENERATION ---\n')

    // 1. Get active contracts
    const { data: contratos, error: errCont } = await supabase
        .from('contratos_fondeo')
        .select('*')
        .eq('estado', 'ACTIVO')

    if (errCont) {
        console.error('Error fetching contratos:', errCont)
        return
    }

    console.log(`Checking ${contratos?.length} active contracts...`)

    let generatedCount = 0

    for (const c of (contratos || [])) {
        // Clear existing schedule to force regeneration
        const { error: deleteError } = await supabase
            .from('cronograma_pagos_fondeo')
            .delete()
            .eq('contrato_id', c.id)

        if (deleteError) {
            console.error(`[ERROR] Failed to clear schedule for ${c.id}:`, deleteError)
            continue
        }

        console.log(`[GENERATE] Generating schedule for Contract ${c.id} (${c.tipo})`)

        if (c.tipo === 'PARTICIPACION_EQUITY') {
            console.log(`[SKIP] Equity contracts do not have fixed schedules yet.`)
            continue
        }

        // Calculate duration in months
        const start = new Date(c.fecha_inicio)
        const end = c.fecha_vencimiento ? new Date(c.fecha_vencimiento) : new Date(start)
        if (!c.fecha_vencimiento) end.setMonth(start.getMonth() + 12) // Default 1 year if null

        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
        const duration = Math.max(1, monthsDiff)

        // Generate schedule
        const cronograma = generarCronogramaPagos({
            capital: Number(c.monto_pactado),
            tasaAnual: Number(c.tasa_retorno),
            mesesDuracion: duration,
            frecuenciaPago: (c.frecuencia_pago as any) || 'MENSUAL',
            fechaInicio: start,
            tipoInteres: (c.tipo_interes as any) || 'SIMPLE'
        })

        // Prepare rows
        const rows = cronograma.map(item => ({
            contrato_id: c.id,
            numero_cuota: item.numeroCuota,
            tipo_pago: item.tipo, // 'INTERES' or 'BULLET' - matches DB constraint
            fecha_programada: item.fechaProgramada.toISOString().split('T')[0],
            monto_capital: item.montoCapital,
            monto_interes: item.montoInteres,
            monto_total: item.montoTotal,
            estado: 'PENDIENTE',
            created_at: new Date().toISOString()
        }))

        // Insert
        const { error: errInsert } = await supabase
            .from('cronograma_pagos_fondeo')
            .insert(rows)

        if (errInsert) {
            console.error(`ERROR inserting schedule for ${c.id}:`, errInsert)
        } else {
            generatedCount++
            console.log(`SUCCESS. Inserted ${rows.length} quotas for ${c.id}`)
        }
    }

    console.log(`\n--- COMPLETE. Generated schedules for ${generatedCount} contracts. ---`)
}

main()
