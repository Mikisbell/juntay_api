/**
 * CLEAN DEMO DATA - Safe Cleanup Script
 *
 * Este script SOLO borra datos DEMO identificables.
 * Tiene múltiples capas de seguridad para evitar borrar datos reales.
 *
 * Seguridad:
 * 1. Solo borra donde empresa_id = DEMO_TENANT_ID
 * 2. Verifica que los datos tengan prefijo [DEMO]
 * 3. Pide confirmación antes de ejecutar
 * 4. Dry-run mode para ver qué se borrará
 *
 * Uso:
 *   npm run clean:demo           # Modo interactivo
 *   npm run clean:demo -- --force # Sin confirmación
 *   npm run clean:demo -- --dry   # Solo mostrar (no borrar)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as readline from 'readline'

dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ==========================================
// CONSTANTES DEMO (deben coincidir con seed)
// ==========================================

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_SUCURSAL_ID = '00000000-0000-0000-0000-000000000002'
const DEMO_PREFIX = '[DEMO]'

// ==========================================
// FUNCIONES DE VERIFICACIÓN
// ==========================================

async function verifyDemoData() {
  console.log('🔍 Verificando datos DEMO existentes...\n')

  const empresa = await supabase
    .from('empresas')
    .select('*')
    .eq('id', DEMO_TENANT_ID)
    .single()

  if (!empresa.data) {
    console.log('ℹ️  No se encontró empresa DEMO')
    return null
  }

  // Verificar que sea realmente DEMO
  if (!empresa.data.nombre.includes(DEMO_PREFIX)) {
    throw new Error(`⚠️  PELIGRO: Empresa ${DEMO_TENANT_ID} no tiene prefijo DEMO!`)
  }

  // Contar registros
  const clientes = await supabase
    .from('clientes')
    .select('id', { count: 'exact' })
    .eq('empresa_id', DEMO_TENANT_ID)

  const creditos = await supabase
    .from('creditos')
    .select('id', { count: 'exact' })
    .eq('empresa_id', DEMO_TENANT_ID)

  const pagos = await supabase
    .from('pagos')
    .select('id', { count: 'exact' })
    .eq('empresa_id', DEMO_TENANT_ID)

  const sucursales = await supabase
    .from('sucursales')
    .select('id', { count: 'exact' })
    .eq('empresa_id', DEMO_TENANT_ID)

  const usuarios = await supabase
    .from('usuarios')
    .select('id', { count: 'exact' })
    .eq('empresa_id', DEMO_TENANT_ID)

  const cajas = await supabase
    .from('cajas_operativas')
    .select('id', { count: 'exact' })
    .eq('sucursal_id', DEMO_SUCURSAL_ID)

  return {
    empresa: empresa.data,
    counts: {
      clientes: clientes.count || 0,
      creditos: creditos.count || 0,
      pagos: pagos.count || 0,
      sucursales: sucursales.count || 0,
      usuarios: usuarios.count || 0,
      cajas: cajas.count || 0,
    },
  }
}

async function confirmDeletion(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question('\n⚠️  ¿Confirmas que quieres BORRAR estos datos? (escribe "SI" para confirmar): ', (answer) => {
      rl.close()
      resolve(answer.trim().toUpperCase() === 'SI')
    })
  })
}

// ==========================================
// FUNCIÓN DE LIMPIEZA
// ==========================================

async function cleanDemoData(dryRun = false) {
  const prefix = dryRun ? '[DRY RUN]' : ''

  console.log(`${prefix} 🧹 Limpiando datos DEMO...\n`)

  // Borrar en orden de dependencias (hijos → padres)
  const deletions = [
    {
      table: 'pagos',
      filter: { empresa_id: DEMO_TENANT_ID },
      description: 'Pagos',
    },
    {
      table: 'creditos',
      filter: { empresa_id: DEMO_TENANT_ID },
      description: 'Créditos',
    },
    {
      table: 'clientes',
      filter: { empresa_id: DEMO_TENANT_ID },
      description: 'Clientes',
    },
    {
      table: 'cajas_operativas',
      filter: { sucursal_id: DEMO_SUCURSAL_ID },
      description: 'Cajas',
    },
    {
      table: 'usuarios',
      filter: { empresa_id: DEMO_TENANT_ID },
      description: 'Usuarios',
    },
    {
      table: 'sucursales',
      filter: { empresa_id: DEMO_TENANT_ID },
      description: 'Sucursales',
    },
    {
      table: 'empresas',
      filter: { id: DEMO_TENANT_ID },
      description: 'Empresa DEMO',
    },
  ]

  let totalDeleted = 0

  for (const deletion of deletions) {
    if (dryRun) {
      const { count } = await supabase
        .from(deletion.table)
        .select('id', { count: 'exact' })
        .match(deletion.filter)

      console.log(`   ${deletion.description}: ${count || 0} registros`)
      totalDeleted += count || 0
    } else {
      const { data, error } = await supabase
        .from(deletion.table)
        .delete()
        .match(deletion.filter)
        .select()

      if (error) {
        console.error(`   ❌ Error en ${deletion.description}: ${error.message}`)
        continue
      }

      const count = data?.length || 0
      console.log(`   ✅ ${deletion.description}: ${count} registros eliminados`)
      totalDeleted += count
    }
  }

  return totalDeleted
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log('═'.repeat(60))
  console.log('🗑️  JUNTAY - Limpieza de Datos DEMO')
  console.log('═'.repeat(60))
  console.log('')

  // Parsear argumentos
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry')
  const isForce = args.includes('--force')

  try {
    // 1. Verificar que existen datos DEMO
    const verification = await verifyDemoData()

    if (!verification) {
      console.log('✅ No hay datos DEMO para limpiar.')
      console.log('')
      process.exit(0)
    }

    // 2. Mostrar resumen
    console.log('📊 Datos DEMO encontrados:')
    console.log(`   Empresa: ${verification.empresa.nombre}`)
    console.log(`   RUC: ${verification.empresa.ruc}`)
    console.log('')
    console.log('   Registros:')
    console.log(`   - Clientes: ${verification.counts.clientes}`)
    console.log(`   - Créditos: ${verification.counts.creditos}`)
    console.log(`   - Pagos: ${verification.counts.pagos}`)
    console.log(`   - Sucursales: ${verification.counts.sucursales}`)
    console.log(`   - Usuarios: ${verification.counts.usuarios}`)
    console.log(`   - Cajas: ${verification.counts.cajas}`)

    const total = Object.values(verification.counts).reduce((a, b) => a + b, 0) + 1 // +1 por empresa
    console.log('')
    console.log(`   📈 TOTAL: ${total} registros`)
    console.log('')

    // 3. Dry run mode
    if (isDryRun) {
      console.log('🔍 MODO DRY RUN (no se borrará nada)')
      console.log('')
      await cleanDemoData(true)
      console.log('')
      console.log('ℹ️  Para borrar realmente, ejecuta sin --dry')
      console.log('')
      process.exit(0)
    }

    // 4. Confirmación (si no es --force)
    if (!isForce) {
      const confirmed = await confirmDeletion()
      if (!confirmed) {
        console.log('')
        console.log('❌ Cancelado por el usuario.')
        console.log('')
        process.exit(0)
      }
    }

    // 5. Ejecutar limpieza
    console.log('')
    const deleted = await cleanDemoData(false)
    console.log('')

    // 6. Resumen final
    console.log('═'.repeat(60))
    console.log('✅ LIMPIEZA COMPLETADA')
    console.log('═'.repeat(60))
    console.log(`   Total eliminado: ${deleted} registros`)
    console.log('')
    console.log('   Para regenerar: npm run seed:demo')
    console.log('═'.repeat(60))

  } catch (error: any) {
    console.error('')
    console.error('═'.repeat(60))
    console.error('❌ ERROR EN LIMPIEZA')
    console.error('═'.repeat(60))
    console.error(error.message)
    console.error('')
    console.error('ℹ️  Si el error persiste, verifica manualmente la base de datos.')
    console.error('═'.repeat(60))
    process.exit(1)
  }
}

// Manejo de Ctrl+C
process.on('SIGINT', () => {
  console.log('')
  console.log('❌ Cancelado por el usuario (Ctrl+C)')
  console.log('')
  process.exit(0)
})

main()
