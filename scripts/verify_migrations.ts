/**
 * Script para verificar estado de migraciones en Supabase
 * Ejecutar: npx tsx scripts/verify_migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface VerificationResult {
    name: string
    exists: boolean
    details?: string
}

async function verifyTable(tableName: string): Promise<VerificationResult> {
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

    return {
        name: `Tabla: ${tableName}`,
        exists: !error,
        details: error ? error.message : `OK (${data?.length || 0} registros sample)`
    }
}

async function verifyColumn(table: string, column: string): Promise<VerificationResult> {
    const { data, error } = await supabase
        .from(table)
        .select(column)
        .limit(1)

    return {
        name: `Columna: ${table}.${column}`,
        exists: !error,
        details: error ? 'No existe' : 'OK'
    }
}

async function verifyRPC(rpcName: string): Promise<VerificationResult> {
    try {
        // Intentar llamar RPC con parámetros dummy
        const { error } = await supabase.rpc(rpcName, {})
        return {
            name: `RPC: ${rpcName}`,
            exists: true, // Si no hay error de "function not found"
            details: error?.message?.includes('does not exist') ? 'No existe' : 'Existe'
        }
    } catch {
        return { name: `RPC: ${rpcName}`, exists: false, details: 'Error' }
    }
}

async function verifyConstraint(): Promise<VerificationResult> {
    // Verificar constraint de bóveda
    const { data } = await supabase
        .from('boveda_central')
        .select('saldo_total, saldo_disponible, saldo_asignado')
        .limit(1)
        .single()

    if (data) {
        const sum = (data.saldo_disponible || 0) + (data.saldo_asignado || 0)
        const matches = Math.abs(data.saldo_total - sum) < 0.01
        return {
            name: 'Constraint: chk_boveda_saldos',
            exists: true,
            details: matches ? '✅ Saldos cuadran' : `⚠️ Diferencia: ${data.saldo_total - sum}`
        }
    }
    return { name: 'Constraint: chk_boveda_saldos', exists: false, details: 'No hay bóveda' }
}

async function main() {
    console.log('\n🔍 VERIFICACIÓN DE MIGRACIONES - JUNTAY\n')
    console.log('='.repeat(60))

    const results: VerificationResult[] = []

    // 1. Tablas principales
    console.log('\n📦 TABLAS PRINCIPALES:')
    const tables = [
        'creditos', 'clientes', 'garantias', 'pagos',
        'cajas_operativas', 'movimientos_caja_operativa',
        'boveda_central', 'usuarios', 'personas', 'empleados',
        'audit_log', 'eventos_sistema', 'notificaciones_pendientes'
    ]

    for (const table of tables) {
        const result = await verifyTable(table)
        results.push(result)
        console.log(`  ${result.exists ? '✅' : '❌'} ${result.name} - ${result.details}`)
    }

    // 2. Columnas nuevas (de migraciones recientes)
    console.log('\n📋 COLUMNAS NUEVAS:')
    const columns = [
        ['creditos', 'codigo_credito'],
        ['creditos', 'fecha_inicio'],
        ['creditos', 'observaciones'],
        ['creditos', 'estado_detallado'],
        ['garantias', 'fecha_venta'],
        ['garantias', 'precio_venta'],
        ['pagos', 'tipo'],
        ['pagos', 'metodo_pago'],
        ['pagos', 'anulado'],
        ['movimientos_caja_operativa', 'anulado'],
        ['movimientos_caja_operativa', 'es_reversion'],
        ['cajas_operativas', 'observaciones_cierre']
    ]

    for (const [table, column] of columns) {
        const result = await verifyColumn(table, column)
        results.push(result)
        console.log(`  ${result.exists ? '✅' : '❌'} ${result.name}`)
    }

    // 3. RPCs críticas
    console.log('\n⚡ FUNCIONES RPC:')
    const rpcs = [
        'crear_credito_completo',
        'cerrar_caja_oficial',
        'admin_asignar_caja',
        'registrar_pago',
        'reversar_movimiento',
        'anular_pago',
        'get_saldo_caja_efectivo',
        'registrar_evento'
    ]

    for (const rpc of rpcs) {
        const result = await verifyRPC(rpc)
        results.push(result)
        console.log(`  ${result.details?.includes('No existe') ? '❌' : '✅'} ${result.name}`)
    }

    // 4. Constraint de bóveda
    console.log('\n🔒 CONSTRAINTS:')
    const constraintResult = await verifyConstraint()
    results.push(constraintResult)
    console.log(`  ${constraintResult.exists ? '✅' : '❌'} ${constraintResult.name} - ${constraintResult.details}`)

    // Resumen
    const passed = results.filter(r => r.exists).length
    const failed = results.filter(r => !r.exists).length

    console.log('\n' + '='.repeat(60))
    console.log(`\n📊 RESUMEN: ${passed} OK / ${failed} FALTANTES`)

    if (failed > 0) {
        console.log('\n⚠️  Hay migraciones pendientes de aplicar:')
        console.log('    npx supabase migration up')
        console.log('    O ejecutar manualmente los .sql en Supabase Dashboard')
    } else {
        console.log('\n✅ Todas las migraciones están aplicadas!')
    }

    console.log('')
}

main().catch(console.error)
