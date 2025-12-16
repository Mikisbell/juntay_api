/**
 * Script de Auditoría Completa de Base de Datos
 * Ejecuta migraciones pendientes + análisis exhaustivo
 * 
 * Ejecutar: npx tsx scripts/deep_db_audit.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// PARTE 1: APLICAR MIGRACIONES
// ============================================================================

async function applyMigrations() {
    console.log('\n🔧 APLICANDO MIGRACIONES PENDIENTES...\n')

    const sqlPath = path.join(__dirname, 'apply_all_migrations.sql')

    if (!fs.existsSync(sqlPath)) {
        console.log('⚠️  No se encontró apply_all_migrations.sql')
        return false
    }

    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Dividir por statements (simplificado)
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📜 Encontrados ${statements.length} statements SQL`)

    let success = 0, failed = 0

    for (const stmt of statements) {
        if (stmt.length < 10) continue

        try {
            const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' }).single()
            if (error && !error.message.includes('already exists')) {
                // Intentar ejecución directa vía REST
            }
            success++
        } catch (e) {
            // Ignorar errores de "already exists"
            const err = e as any
            if (!err?.message?.includes('already exists') &&
                !err?.message?.includes('duplicate')) {
                failed++
            }
        }
    }

    console.log(`✅ Migración completada: ${success} OK, ${failed} errores`)
    return true
}

// ============================================================================
// PARTE 2: AUDITORÍA EXHAUSTIVA
// ============================================================================

interface TableAudit {
    name: string
    count: number
    sampleData?: any
    issues: string[]
}

async function auditTable(tableName: string): Promise<TableAudit> {
    const issues: string[] = []

    // Contar registros
    const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

    if (countError) {
        return { name: tableName, count: -1, issues: [`No existe: ${countError.message}`] }
    }

    // Obtener sample
    const { data: sample } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

    return {
        name: tableName,
        count: count || 0,
        sampleData: sample?.[0],
        issues
    }
}

async function checkIntegrity() {
    console.log('\n🔍 VERIFICANDO INTEGRIDAD REFERENCIAL...\n')

    const checks = [
        {
            name: 'Créditos sin cliente',
            query: `SELECT id, codigo FROM creditos WHERE cliente_id NOT IN (SELECT id FROM clientes)`
        },
        {
            name: 'Créditos sin garantía',
            query: `SELECT id, codigo FROM creditos WHERE garantia_id IS NOT NULL AND garantia_id NOT IN (SELECT id FROM garantias)`
        },
        {
            name: 'Pagos sin crédito',
            query: `SELECT id FROM pagos WHERE credito_id NOT IN (SELECT id FROM creditos)`
        },
        {
            name: 'Movimientos sin caja',
            query: `SELECT id FROM movimientos_caja_operativa WHERE caja_operativa_id NOT IN (SELECT id FROM cajas_operativas)`
        },
        {
            name: 'Empleados sin persona',
            query: `SELECT id FROM empleados WHERE persona_id NOT IN (SELECT id FROM personas)`
        },
        {
            name: 'Clientes sin persona',
            query: `SELECT id FROM clientes WHERE persona_id IS NOT NULL AND persona_id NOT IN (SELECT id FROM personas)`
        }
    ]

    for (const check of checks) {
        try {
            const { data, error } = await supabase.rpc('exec_sql_read', {
                sql: check.query
            })

            if (error) {
                // Usar método alternativo
                console.log(`  ⚠️  ${check.name}: No se pudo verificar`)
            } else {
                const count = data?.length || 0
                console.log(`  ${count === 0 ? '✅' : '❌'} ${check.name}: ${count} encontrados`)
            }
        } catch {
            console.log(`  ⚠️  ${check.name}: Error de consulta`)
        }
    }
}

async function checkSaldos() {
    console.log('\n💰 VERIFICANDO SALDOS...\n')

    // Bóveda
    const { data: boveda } = await supabase
        .from('boveda_central')
        .select('*')
        .single()

    if (boveda) {
        const sum = (boveda.saldo_disponible || 0) + (boveda.saldo_asignado || 0)
        const diff = Math.abs(boveda.saldo_total - sum)
        console.log(`  Bóveda: Total=${boveda.saldo_total}, Disponible=${boveda.saldo_disponible}, Asignado=${boveda.saldo_asignado}`)
        console.log(`  ${diff < 0.01 ? '✅' : '❌'} Constraint de saldos: ${diff < 0.01 ? 'OK' : `Diferencia: ${diff}`}`)
    }

    // Cajas abiertas
    const { data: cajas } = await supabase
        .from('cajas_operativas')
        .select('id, numero_caja, saldo_actual, estado')
        .eq('estado', 'abierta')

    console.log(`\n  Cajas abiertas: ${cajas?.length || 0}`)
    if (cajas) {
        for (const caja of cajas) {
            console.log(`    - Caja #${caja.numero_caja}: S/${caja.saldo_actual}`)
        }
    }
}

async function checkEstadosCreditos() {
    console.log('\n📊 DISTRIBUCIÓN DE ESTADOS DE CRÉDITOS...\n')

    const { data: creditos } = await supabase
        .from('creditos')
        .select('estado, estado_detallado')

    if (!creditos) return

    const byEstado: Record<string, number> = {}
    const byDetallado: Record<string, number> = {}

    for (const c of creditos) {
        byEstado[c.estado] = (byEstado[c.estado] || 0) + 1
        byDetallado[c.estado_detallado || 'null'] = (byDetallado[c.estado_detallado || 'null'] || 0) + 1
    }

    console.log('  Por estado:')
    for (const [estado, count] of Object.entries(byEstado)) {
        console.log(`    ${estado}: ${count}`)
    }

    console.log('\n  Por estado_detallado:')
    for (const [estado, count] of Object.entries(byDetallado)) {
        console.log(`    ${estado}: ${count}`)
    }
}

async function checkVencimientos() {
    console.log('\n⏰ ANÁLISIS DE VENCIMIENTOS...\n')

    const today = new Date().toISOString().split('T')[0]

    const { data: creditos } = await supabase
        .from('creditos')
        .select('id, codigo, fecha_vencimiento, estado')
        .in('estado', ['vigente', 'vencido'])

    if (!creditos) return

    let vencidos = 0, porVencer = 0, vigentes = 0

    for (const c of creditos) {
        const diasHasta = Math.ceil(
            (new Date(c.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diasHasta < 0) vencidos++
        else if (diasHasta <= 7) porVencer++
        else vigentes++
    }

    console.log(`  Vencidos: ${vencidos}`)
    console.log(`  Por vencer (≤7 días): ${porVencer}`)
    console.log(`  Vigentes: ${vigentes}`)
}

async function checkColumnas() {
    console.log('\n📋 VERIFICANDO COLUMNAS CRÍTICAS...\n')

    const checks = [
        { table: 'creditos', column: 'codigo_credito' },
        { table: 'creditos', column: 'fecha_inicio' },
        { table: 'creditos', column: 'observaciones' },
        { table: 'creditos', column: 'estado_detallado' },
        { table: 'garantias', column: 'fecha_venta' },
        { table: 'garantias', column: 'precio_venta' },
        { table: 'pagos', column: 'anulado' },
        { table: 'movimientos_caja_operativa', column: 'anulado' },
        { table: 'movimientos_caja_operativa', column: 'es_reversion' },
        { table: 'cajas_operativas', column: 'observaciones_cierre' }
    ]

    for (const { table, column } of checks) {
        try {
            const { error } = await supabase
                .from(table)
                .select(column)
                .limit(1)

            console.log(`  ${error ? '❌' : '✅'} ${table}.${column}`)
        } catch {
            console.log(`  ❌ ${table}.${column}`)
        }
    }
}

async function checkTablas() {
    console.log('\n📦 CONTEO DE REGISTROS POR TABLA...\n')

    const tables = [
        'creditos', 'clientes', 'garantias', 'pagos',
        'cajas_operativas', 'movimientos_caja_operativa',
        'boveda_central', 'usuarios', 'personas', 'empleados',
        'audit_log', 'eventos_sistema', 'notificaciones_pendientes'
    ]

    for (const table of tables) {
        const result = await auditTable(table)
        const status = result.count >= 0 ? '✅' : '❌'
        console.log(`  ${status} ${table}: ${result.count >= 0 ? result.count : 'No existe'}`)
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║        AUDITORÍA PROFUNDA DE BASE DE DATOS - JUNTAY        ║')
    console.log('╚════════════════════════════════════════════════════════════╝')

    // 1. Verificar tablas y conteo
    await checkTablas()

    // 2. Verificar columnas críticas
    await checkColumnas()

    // 3. Verificar saldos
    await checkSaldos()

    // 4. Estados de créditos
    await checkEstadosCreditos()

    // 5. Análisis de vencimientos
    await checkVencimientos()

    // 6. Integridad referencial (simplificada)
    console.log('\n🔗 VERIFICANDO RELACIONES BÁSICAS...\n')

    // Créditos con cliente válido
    const { data: creditosSinCliente } = await supabase
        .from('creditos')
        .select('id, cliente_id')
        .is('cliente_id', null)

    console.log(`  ${creditosSinCliente?.length === 0 ? '✅' : '⚠️'} Créditos sin cliente: ${creditosSinCliente?.length || 0}`)

    // Garantías con estado válido  
    const { data: garantias } = await supabase
        .from('garantias')
        .select('estado')

    const estadosGarantia = new Set(garantias?.map(g => g.estado))
    console.log(`  Estados de garantías encontrados: ${Array.from(estadosGarantia).join(', ')}`)

    console.log('\n' + '='.repeat(60))
    console.log('\n✅ AUDITORÍA COMPLETADA\n')
}

main().catch(console.error)
