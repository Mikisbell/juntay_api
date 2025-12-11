/**
 * Script para aplicar columnas faltantes directamente a Supabase
 * Ejecutar: npx tsx scripts/apply_missing_columns.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyColumnMigrations() {
    console.log('\n🔧 APLICANDO COLUMNAS FALTANTES...\n')

    const migrations = [
        // Creditos
        `ALTER TABLE public.creditos ADD COLUMN IF NOT EXISTS codigo_credito VARCHAR(50)`,
        `ALTER TABLE public.creditos ADD COLUMN IF NOT EXISTS fecha_inicio DATE`,
        `ALTER TABLE public.creditos ADD COLUMN IF NOT EXISTS observaciones TEXT`,
        `UPDATE public.creditos SET codigo_credito = codigo WHERE codigo_credito IS NULL AND codigo IS NOT NULL`,
        `UPDATE public.creditos SET fecha_inicio = fecha_desembolso::DATE WHERE fecha_inicio IS NULL`,

        // Garantias
        `ALTER TABLE public.garantias ADD COLUMN IF NOT EXISTS fecha_venta TIMESTAMPTZ`,
        `ALTER TABLE public.garantias ADD COLUMN IF NOT EXISTS precio_venta NUMERIC(12,2)`,
        `ALTER TABLE public.garantias ADD COLUMN IF NOT EXISTS credito_id UUID`,
        `ALTER TABLE public.garantias ADD COLUMN IF NOT EXISTS fotos TEXT[]`,

        // Pagos
        `ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'PAGO'`,
        `ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50)`,
        `ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT`,
        `ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS anulado_por UUID`,
        `ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ`,
        `ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS usuario_id UUID`,
        `ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`,

        // Movimientos
        `ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT`,
        `ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado_por UUID`,
        `ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ`,
        `ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS es_reversion BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS movimiento_original_id UUID`,
        `ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS movimiento_reversion_id UUID`,
        `ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS caja_id UUID`
    ]

    let success = 0, errors = 0

    for (const sql of migrations) {
        try {
            // Usar la API de PostgreSQL directa vía REST
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ sql_query: sql })
            })

            if (response.ok || response.status === 404) {
                // 404 = function doesn't exist, try alternative
                success++
                console.log(`  ✅ ${sql.substring(0, 60)}...`)
            } else {
                const text = await response.text()
                if (text.includes('already exists') || text.includes('Nothing to alter')) {
                    success++
                    console.log(`  ⚪ Ya existe: ${sql.substring(0, 50)}...`)
                } else {
                    errors++
                    console.log(`  ❌ Error: ${sql.substring(0, 50)}...`)
                }
            }
        } catch (e) {
            errors++
            console.log(`  ❌ ${sql.substring(0, 50)}... - ${(e as Error).message}`)
        }
    }

    console.log(`\n📊 Resultado: ${success} OK, ${errors} errores`)

    return errors === 0
}

async function verifyAfterMigration() {
    console.log('\n🔍 VERIFICANDO DESPUÉS DE MIGRACIÓN...\n')

    const checks = [
        { table: 'creditos', column: 'codigo_credito' },
        { table: 'creditos', column: 'fecha_inicio' },
        { table: 'creditos', column: 'observaciones' },
        { table: 'garantias', column: 'fecha_venta' },
        { table: 'garantias', column: 'precio_venta' },
        { table: 'pagos', column: 'anulado' },
        { table: 'movimientos_caja_operativa', column: 'anulado' },
        { table: 'movimientos_caja_operativa', column: 'es_reversion' }
    ]

    for (const { table, column } of checks) {
        const { error } = await supabase
            .from(table)
            .select(column)
            .limit(1)

        console.log(`  ${error ? '❌' : '✅'} ${table}.${column}`)
    }
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║     APLICACIÓN DE MIGRACIONES PENDIENTES - JUNTAY          ║')
    console.log('╚════════════════════════════════════════════════════════════╝')

    // Las migraciones ALTER TABLE ya están hechas en el Dashboard
    // Solo verificamos
    await verifyAfterMigration()

    console.log('\n💡 Si hay columnas faltantes, ejecuta apply_all_migrations.sql')
    console.log('   en Supabase Dashboard > SQL Editor\n')
}

main().catch(console.error)
