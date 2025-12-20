/**
 * Verificar BD remota (Cloud) vs Local
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bvrzwdztdccxaenfwwcy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cnp3ZHp0ZGNjeGFlbmZ3d2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg3NzcyMSwiZXhwIjoyMDc4NDUzNzIxfQ.p3YD4vegv9g_rxSRNCrFcYXiGFdtBvwHJ-cTnub-Z1A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗')
    console.log('║        VERIFICACIÓN BD NUBE - JUNTAY                         ║')
    console.log('╚══════════════════════════════════════════════════════════════╝\n')

    // 1. Verificar tablas principales
    console.log('📊 CONTEO DE REGISTROS:\n')

    const tables = [
        'empresas', 'sucursales', 'cuentas_financieras',
        'usuarios', 'clientes', 'creditos', 'pagos',
        'garantias', 'categorias_garantia', 'roles'
    ]

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
        if (error) {
            console.log(`  ❌ ${table}: Error - ${error.message}`)
        } else {
            console.log(`  ✅ ${table}: ${count} registros`)
        }
    }

    // 2. Verificar empresa piloto
    console.log('\n🏢 EMPRESA PILOTO:')
    const { data: empresa } = await supabase.from('empresas').select('*').single()
    if (empresa) {
        console.log(`  ✅ ${empresa.nombre_comercial} (RUC: ${empresa.ruc})`)
    } else {
        console.log('  ❌ No encontrada')
    }

    // 3. Verificar sucursal
    console.log('\n🏪 SUCURSAL PRINCIPAL:')
    const { data: sucursal } = await supabase.from('sucursales').select('*, empresas(nombre_comercial)').single()
    if (sucursal) {
        console.log(`  ✅ ${sucursal.nombre} → Empresa: ${sucursal.empresas?.nombre_comercial || sucursal.empresa_id}`)
    } else {
        console.log('  ❌ No encontrada')
    }

    // 4. Verificar usuario admin
    console.log('\n👤 USUARIO ADMIN:')
    const { data: usuario } = await supabase.from('usuarios').select('*').eq('email', 'admin@juntay.com').single()
    if (usuario) {
        console.log(`  ✅ ${usuario.email} (Rol: ${usuario.rol})`)
    } else {
        console.log('  ❌ No encontrado')
    }

    // 5. Verificar categorías
    console.log('\n📦 CATEGORÍAS DE GARANTÍA:')
    const { data: categorias } = await supabase.from('categorias_garantia').select('nombre')
    if (categorias?.length) {
        console.log(`  ✅ ${categorias.length} categorías: ${categorias.map(c => c.nombre).join(', ')}`)
    }

    console.log('\n╔══════════════════════════════════════════════════════════════╗')
    console.log('║                 ✅ VERIFICACIÓN COMPLETA                     ║')
    console.log('╚══════════════════════════════════════════════════════════════╝')
}

main().catch(console.error)
