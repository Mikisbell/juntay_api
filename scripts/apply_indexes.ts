/**
 * Aplica índices de optimización directamente a Supabase
 * Ejecutar: npx tsx scripts/apply_indexes.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' }
})

// Índices a crear
const INDEXES = [
    // creditos
    'CREATE INDEX IF NOT EXISTS idx_creditos_cliente_estado ON public.creditos(cliente_id, estado)',
    'CREATE INDEX IF NOT EXISTS idx_creditos_estado_detallado ON public.creditos(estado_detallado)',
    'CREATE INDEX IF NOT EXISTS idx_creditos_fecha_vencimiento ON public.creditos(fecha_vencimiento)',
    'CREATE INDEX IF NOT EXISTS idx_creditos_estado_vencimiento ON public.creditos(estado, fecha_vencimiento)',
    'CREATE INDEX IF NOT EXISTS idx_creditos_garantia ON public.creditos(garantia_id)',
    'CREATE INDEX IF NOT EXISTS idx_creditos_caja_origen ON public.creditos(caja_origen_id)',

    // clientes
    'CREATE INDEX IF NOT EXISTS idx_clientes_documento ON public.clientes(numero_documento)',
    'CREATE INDEX IF NOT EXISTS idx_clientes_activo_created ON public.clientes(activo, created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_clientes_persona ON public.clientes(persona_id)',

    // cajas_operativas
    'CREATE INDEX IF NOT EXISTS idx_cajas_usuario_estado ON public.cajas_operativas(usuario_id, estado)',

    // movimientos_caja_operativa
    'CREATE INDEX IF NOT EXISTS idx_movimientos_caja_created ON public.movimientos_caja_operativa(caja_operativa_id, created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_movimientos_caja_id ON public.movimientos_caja_operativa(caja_id)',
    'CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON public.movimientos_caja_operativa(fecha DESC)',

    // garantias
    'CREATE INDEX IF NOT EXISTS idx_garantias_cliente ON public.garantias(cliente_id)',
    'CREATE INDEX IF NOT EXISTS idx_garantias_estado ON public.garantias(estado)',

    // pagos
    'CREATE INDEX IF NOT EXISTS idx_pagos_credito ON public.pagos(credito_id)',
    'CREATE INDEX IF NOT EXISTS idx_pagos_caja ON public.pagos(caja_operativa_id)',
    'CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON public.pagos(fecha_pago DESC)',

    // personas
    'CREATE INDEX IF NOT EXISTS idx_personas_documento ON public.personas(numero_documento)',

    // empleados
    'CREATE INDEX IF NOT EXISTS idx_empleados_user_id ON public.empleados(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_empleados_persona ON public.empleados(persona_id)',

    // usuarios
    'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email)',
    'CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol)'
]

async function applyIndexes() {
    console.log('\n🔧 APLICANDO ÍNDICES DE OPTIMIZACIÓN...\n')

    let success = 0
    let skipped = 0
    let failed = 0

    for (const indexSql of INDEXES) {
        const indexName = indexSql.match(/idx_\w+/)?.[0] || 'unknown'

        try {
            // Intentar crear el índice usando una función RPC genérica
            // Como no podemos ejecutar DDL directamente, usaremos un enfoque diferente

            // Verificar si el índice ya podría existir probando una query
            const tableName = indexSql.match(/ON public\.(\w+)/)?.[1]
            const columnName = indexSql.match(/\((\w+)/)?.[1]

            if (tableName && columnName) {
                // Verificar que la tabla y columna existen
                const { error } = await supabase
                    .from(tableName)
                    .select(columnName)
                    .limit(1)

                if (!error) {
                    console.log(`  ✅ ${indexName} - tabla/columna verificada`)
                    success++
                } else {
                    console.log(`  ⚠️  ${indexName} - columna ${columnName} no existe en ${tableName}`)
                    skipped++
                }
            }
        } catch (e) {
            failed++
            console.log(`  ❌ ${indexName} - error`)
        }
    }

    console.log(`\n📊 Resultado: ${success} verificados, ${skipped} omitidos, ${failed} errores`)

    console.log('\n⚠️  NOTA: Los índices CREATE INDEX no se pueden ejecutar vía API REST.')
    console.log('    Debes copiar el SQL y ejecutarlo en Supabase Dashboard:\n')
    console.log('    1. Abre: https://supabase.com/dashboard')
    console.log('    2. SQL Editor > New Query')
    console.log('    3. Pega el contenido de:')
    console.log('       supabase/migrations/20251210200000_optimize_indexes.sql\n')

    return { success, skipped, failed }
}

// Alternativa: Generar un solo bloque SQL para copiar
async function generateCopyPasteSQL() {
    console.log('\n📋 SQL PARA COPIAR Y PEGAR:\n')
    console.log('='.repeat(60))
    console.log('')

    for (const sql of INDEXES) {
        console.log(sql + ';')
    }

    console.log('')
    console.log('-- Actualizar estadísticas')
    console.log('ANALYZE public.creditos;')
    console.log('ANALYZE public.clientes;')
    console.log('ANALYZE public.cajas_operativas;')
    console.log('ANALYZE public.movimientos_caja_operativa;')
    console.log('ANALYZE public.garantias;')
    console.log('ANALYZE public.pagos;')

    console.log('')
    console.log('='.repeat(60))
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║        📊 APLICAR ÍNDICES - JUNTAY                         ║')
    console.log('╚════════════════════════════════════════════════════════════╝')

    await applyIndexes()
    await generateCopyPasteSQL()

    console.log('\n✅ Script completado')
    console.log('   Copia el SQL de arriba y pégalo en Supabase SQL Editor\n')
}

main().catch(console.error)
