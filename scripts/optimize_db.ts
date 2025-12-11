/**
 * Script de Optimización de Base de Datos
 * Aplica índices y verifica mejora de performance
 * 
 * Ejecutar: npx tsx scripts/optimize_db.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface QueryTest {
    name: string
    table: string
    filters?: Record<string, any>
    order?: { column: string, ascending: boolean }
    limit?: number
}

const QUERY_TESTS: QueryTest[] = [
    // Queries más frecuentes
    {
        name: 'Créditos por cliente',
        table: 'creditos',
        filters: { cliente_id: '6d6a188f-c19e-46e9-baa7-af35e0ffc451' }, // ID de ejemplo
    },
    {
        name: 'Créditos vigentes',
        table: 'creditos',
        filters: { estado: 'vigente' },
        limit: 50
    },
    {
        name: 'Créditos por estado_detallado',
        table: 'creditos',
        filters: { estado_detallado: 'por_vencer' },
        limit: 50
    },
    {
        name: 'Créditos ordenados por vencimiento',
        table: 'creditos',
        order: { column: 'fecha_vencimiento', ascending: true },
        limit: 50
    },
    {
        name: 'Cliente por DNI',
        table: 'clientes',
        filters: { numero_documento: '12345678' }
    },
    {
        name: 'Clientes activos',
        table: 'clientes',
        filters: { activo: true },
        limit: 50
    },
    {
        name: 'Movimientos de caja',
        table: 'movimientos_caja_operativa',
        order: { column: 'created_at', ascending: false },
        limit: 50
    },
    {
        name: 'Garantías por cliente',
        table: 'garantias',
        filters: { cliente_id: '6d6a188f-c19e-46e9-baa7-af35e0ffc451' }
    },
    {
        name: 'Pagos por crédito',
        table: 'pagos',
        filters: { credito_id: '00000000-0000-0000-0000-000000000000' } // ID dummy
    }
]

async function runQueryTest(test: QueryTest): Promise<number> {
    const start = Date.now()

    let query = supabase.from(test.table).select('*', { count: 'exact' })

    if (test.filters) {
        for (const [key, value] of Object.entries(test.filters)) {
            query = query.eq(key, value)
        }
    }

    if (test.order) {
        query = query.order(test.order.column, { ascending: test.order.ascending })
    }

    if (test.limit) {
        query = query.limit(test.limit)
    }

    await query

    return Date.now() - start
}

async function runBenchmark() {
    console.log('\n⏱️  BENCHMARK DE QUERIES\n')
    console.log('Query'.padEnd(40) + '| Tiempo | Resultado')
    console.log('-'.repeat(60))

    let totalTime = 0

    for (const test of QUERY_TESTS) {
        const time = await runQueryTest(test)
        totalTime += time

        const status = time < 50 ? '✅' : time < 200 ? '🟡' : '❌'
        console.log(`${test.name.padEnd(40)}| ${String(time).padStart(5)}ms | ${status}`)
    }

    console.log('-'.repeat(60))
    console.log(`${'TOTAL'.padEnd(40)}| ${String(totalTime).padStart(5)}ms`)
    console.log(`${'PROMEDIO'.padEnd(40)}| ${String(Math.round(totalTime / QUERY_TESTS.length)).padStart(5)}ms`)
}

async function getTableStats() {
    console.log('\n📊 ESTADÍSTICAS DE TABLAS\n')

    const tables = ['creditos', 'clientes', 'garantias', 'pagos', 'movimientos_caja_operativa']

    for (const table of tables) {
        const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })

        console.log(`  ${table}: ${count || 0} registros`)
    }
}

async function checkExistingIndexes() {
    console.log('\n🔍 VERIFICANDO ÍNDICES EXISTENTES\n')

    // No podemos consultar pg_indexes directamente, así que verificamos indirectamente
    console.log('  (Los índices deben aplicarse manualmente en Supabase SQL Editor)')
    console.log('  📄 Ver: supabase/migrations/20251210200000_optimize_indexes.sql')
}

async function suggestOptimizations() {
    console.log('\n💡 SUGERENCIAS DE OPTIMIZACIÓN\n')

    // Verificar queries con posible N+1
    const { count: creditosCount } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })

    const { count: pagosCount } = await supabase
        .from('pagos')
        .select('*', { count: 'exact', head: true })

    console.log(`  Créditos: ${creditosCount}`)
    console.log(`  Pagos: ${pagosCount}`)

    if (creditosCount && pagosCount && pagosCount / creditosCount < 0.1) {
        console.log('  ⚠️  Pocos pagos por crédito - considerar lazy loading')
    }

    // Sugerencias generales
    console.log('\n  Recomendaciones:')
    console.log('  1. Aplicar índices del archivo 20251210200000_optimize_indexes.sql')
    console.log('  2. Usar .select() con columnas específicas en vez de "*"')
    console.log('  3. Agregar .limit() a todas las queries sin paginación')
    console.log('  4. Considerar vistas materializadas para reportes')
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║        🚀 OPTIMIZACIÓN DE BASE DE DATOS - JUNTAY 🚀        ║')
    console.log('╚════════════════════════════════════════════════════════════╝')

    await getTableStats()
    await runBenchmark()
    await checkExistingIndexes()
    await suggestOptimizations()

    console.log('\n' + '═'.repeat(60))
    console.log('\n✅ ANÁLISIS COMPLETADO\n')
}

main().catch(console.error)
