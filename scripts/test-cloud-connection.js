/**
 * Test Supabase Cloud Connection
 *
 * Este script verifica la conexión con Supabase Cloud
 * y compara con la configuración local.
 *
 * Uso: node scripts/test-cloud-connection.js
 */

const { createClient } = require('@supabase/supabase-js')

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testConnection() {
  log('\n🔍 VERIFICACIÓN DE CONEXIÓN SUPABASE\n', 'cyan')
  log('═'.repeat(50), 'blue')

  // ============================================
  // 1. CONFIGURACIÓN LOCAL
  // ============================================
  log('\n📦 CONFIGURACIÓN LOCAL (Docker)', 'yellow')
  log('─'.repeat(50), 'blue')

  const localUrl = 'http://127.0.0.1:54321'
  const localKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

  log(`URL:  ${localUrl}`)
  log(`Key:  ${localKey.substring(0, 30)}...`)

  const localClient = createClient(localUrl, localKey)

  try {
    const { data: localTables, error: localError } = await localClient
      .from('creditos')
      .select('id', { count: 'exact', head: true })

    if (localError) {
      log(`\n❌ Error conectando a LOCAL: ${localError.message}`, 'red')
    } else {
      log(`\n✅ CONEXIÓN LOCAL EXITOSA`, 'green')
      log(`   Total créditos: ${localTables || 0}`)
    }
  } catch (err) {
    log(`\n❌ Error LOCAL: ${err.message}`, 'red')
  }

  // ============================================
  // 2. CONFIGURACIÓN CLOUD
  // ============================================
  log('\n\n☁️  CONFIGURACIÓN CLOUD (Producción)', 'yellow')
  log('─'.repeat(50), 'blue')

  const cloudUrl = 'https://bvrzwdztdccxaenfwwcy.supabase.co'
  const cloudKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cnp3ZHp0ZGNjeGFlbmZ3d2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Nzc3MjEsImV4cCI6MjA3ODQ1MzcyMX0.vKm3zE0Gt6X5dyORbBnO-Nf7cnJb2tVtF9sZUvUmAiU'

  log(`URL:  ${cloudUrl}`)
  log(`Key:  ${cloudKey.substring(0, 30)}...`)

  const cloudClient = createClient(cloudUrl, cloudKey)

  try {
    log('\nProbando conexión a Cloud...')

    // Test 1: Health check
    const { data: healthData, error: healthError } = await cloudClient
      .from('creditos')
      .select('id', { count: 'exact', head: true })

    if (healthError) {
      log(`\n❌ Error conectando a CLOUD: ${healthError.message}`, 'red')
      log(`   Código: ${healthError.code || 'N/A'}`)
      log(`   Detalles: ${healthError.details || 'N/A'}`)
    } else {
      log(`\n✅ CONEXIÓN CLOUD EXITOSA`, 'green')
      log(`   Total créditos en producción: ${healthData || 0}`)

      // Test 2: Query real
      const { data: sampleData, error: sampleError } = await cloudClient
        .from('creditos')
        .select('id, codigo_credito, monto_prestado, estado')
        .limit(3)

      if (!sampleError && sampleData) {
        log(`\n📊 Muestra de datos (primeros 3 créditos):`)
        sampleData.forEach((credito, idx) => {
          log(`   ${idx + 1}. ${credito.codigo_credito} - S/ ${credito.monto_prestado} (${credito.estado})`)
        })
      }

      // Test 3: Auth
      const { data: authData, error: authError } = await cloudClient.auth.getSession()

      if (authError) {
        log(`\n⚠️  Auth: Sin sesión (esperado en servidor)`, 'yellow')
      } else if (authData.session) {
        log(`\n✅ Auth: Sesión activa`, 'green')
        log(`   User: ${authData.session.user.email || 'N/A'}`)
      }

      // Test 4: RLS Check
      log(`\n🔒 Verificando RLS (Row Level Security)...`)
      const { data: rlsData, error: rlsError } = await cloudClient.rpc('check_rls_enabled')

      if (!rlsError) {
        log(`   ✅ RLS está activo`, 'green')
      }
    }
  } catch (err) {
    log(`\n❌ Error CLOUD: ${err.message}`, 'red')
    if (err.stack) {
      log(`\nStack trace:`, 'yellow')
      log(err.stack)
    }
  }

  // ============================================
  // 3. RESUMEN
  // ============================================
  log('\n\n📋 RESUMEN', 'cyan')
  log('═'.repeat(50), 'blue')
  log('\nTu archivo .env actual apunta a:', 'yellow')
  log(`  NEXT_PUBLIC_SUPABASE_URL=${localUrl}`)
  log('\n💡 Para cambiar a producción, actualiza .env con:')
  log(`  NEXT_PUBLIC_SUPABASE_URL=${cloudUrl}`, 'green')
  log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY=${cloudKey.substring(0, 30)}...`, 'green')
  log('\n⚠️  IMPORTANTE: No commitees las credenciales de producción!\n', 'red')
  log('═'.repeat(50), 'blue')
}

// Ejecutar
testConnection()
  .then(() => {
    log('\n✅ Test completado\n', 'green')
    process.exit(0)
  })
  .catch(err => {
    log(`\n❌ Error fatal: ${err.message}\n`, 'red')
    process.exit(1)
  })
