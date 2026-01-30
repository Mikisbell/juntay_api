/**
 * SEED DEMO DATA - Safe & Identifiable
 *
 * Este script genera datos DEMO para testing responsive.
 * TODOS los datos tienen:
 * - Prefijo [DEMO] en nombres
 * - Flag is_demo = true
 * - IDs predecibles (UUIDs fijos)
 * - DNIs/RUCs fake (99999xxx)
 *
 * Para limpiar: npm run clean:demo
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

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
// CONSTANTES DEMO
// ==========================================

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_SUCURSAL_ID = '00000000-0000-0000-0000-000000000002'
const DEMO_USUARIO_ID = '00000000-0000-0000-0000-000000000003'
const DEMO_CAJA_ID = '00000000-0000-0000-0000-000000000004'

const DEMO_PREFIX = '[DEMO]'

// ==========================================
// FUNCIONES HELPER
// ==========================================

async function cleanDemoData() {
  console.log('🧹 Limpiando datos demo existentes...')

  // Borrar en orden de dependencias
  const tables = [
    'pagos',
    'creditos',
    'clientes',
    'cajas_operativas',
    'sucursales',
    'usuarios',
    'empresas',
  ]

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', DEMO_TENANT_ID) // Intentar por ID primero

    // Algunos no tienen ID directo, usar otros campos
    if (table === 'clientes' || table === 'creditos' || table === 'pagos') {
      await supabase.from(table).delete().eq('empresa_id', DEMO_TENANT_ID)
    }
    if (table === 'cajas_operativas') {
      await supabase.from(table).delete().eq('sucursal_id', DEMO_SUCURSAL_ID)
    }
    if (table === 'sucursales') {
      await supabase.from(table).delete().eq('empresa_id', DEMO_TENANT_ID)
    }
  }

  console.log('✅ Limpieza completada')
}

async function seedEmpresa() {
  console.log('🏢 Creando empresa DEMO...')

  const { data, error } = await supabase.from('empresas').insert({
    id: DEMO_TENANT_ID,
    nombre: `${DEMO_PREFIX} Casa de Empeño Showcase`,
    ruc: '99999999999',
    direccion: 'Av. Demo 123, Lima',
    telefono: '999-999-999',
    email: 'demo@juntay.io',
  }).select().single()

  if (error) throw new Error(`Error empresa: ${error.message}`)
  console.log('✅ Empresa creada:', data.nombre)
  return data
}

async function seedSucursal() {
  console.log('🏪 Creando sucursal DEMO...')

  const { data, error } = await supabase.from('sucursales').insert({
    id: DEMO_SUCURSAL_ID,
    empresa_id: DEMO_TENANT_ID,
    nombre: `${DEMO_PREFIX} Sucursal Principal`,
    direccion: 'Calle Demo 456',
    telefono: '999-888-777',
    is_active: true,
  }).select().single()

  if (error) throw new Error(`Error sucursal: ${error.message}`)
  console.log('✅ Sucursal creada:', data.nombre)
  return data
}

async function seedUsuario() {
  console.log('👤 Creando usuario admin DEMO...')

  const { data, error } = await supabase.from('usuarios').insert({
    id: DEMO_USUARIO_ID,
    empresa_id: DEMO_TENANT_ID,
    email: 'admin@demo.juntay.io',
    nombre: `${DEMO_PREFIX} Admin`,
    rol: 'admin',
    sucursal_id: DEMO_SUCURSAL_ID,
  }).select().single()

  if (error) throw new Error(`Error usuario: ${error.message}`)
  console.log('✅ Usuario creado:', data.email)
  return data
}

async function seedCaja() {
  console.log('💰 Creando caja DEMO...')

  const { data, error } = await supabase.from('cajas_operativas').insert({
    id: DEMO_CAJA_ID,
    sucursal_id: DEMO_SUCURSAL_ID,
    empresa_id: DEMO_TENANT_ID,
    numero_caja: 1,
    saldo_inicial: 5000.00,
    saldo_actual: 8500.00,
    fecha_apertura: new Date().toISOString(),
    usuario_id: DEMO_USUARIO_ID,
    estado: 'ABIERTA',
  }).select().single()

  if (error) throw new Error(`Error caja: ${error.message}`)
  console.log('✅ Caja creada: #', data.numero_caja)
  return data
}

async function seedClientes() {
  console.log('👥 Creando clientes DEMO...')

  const clientes = [
    {
      empresa_id: DEMO_TENANT_ID,
      nombre: `${DEMO_PREFIX} Juan Pérez`,
      dni: '99999001',
      telefono: '999-111-111',
      direccion: 'Jr. Demo 101',
      email: 'juan@demo.test',
    },
    {
      empresa_id: DEMO_TENANT_ID,
      nombre: `${DEMO_PREFIX} María González`,
      dni: '99999002',
      telefono: '999-222-222',
      direccion: 'Av. Demo 202',
      email: 'maria@demo.test',
    },
    {
      empresa_id: DEMO_TENANT_ID,
      nombre: `${DEMO_PREFIX} Carlos López`,
      dni: '99999003',
      telefono: '999-333-333',
      direccion: 'Calle Demo 303',
      email: 'carlos@demo.test',
    },
    {
      empresa_id: DEMO_TENANT_ID,
      nombre: `${DEMO_PREFIX} Ana Torres`,
      dni: '99999004',
      telefono: '999-444-444',
      direccion: 'Psje. Demo 404',
      email: 'ana@demo.test',
    },
    {
      empresa_id: DEMO_TENANT_ID,
      nombre: `${DEMO_PREFIX} Luis Ramos`,
      dni: '99999005',
      telefono: '999-555-555',
      direccion: 'Urb. Demo 505',
      email: 'luis@demo.test',
    },
  ]

  const { data, error } = await supabase.from('clientes').insert(clientes).select()

  if (error) throw new Error(`Error clientes: ${error.message}`)
  console.log(`✅ ${data.length} clientes creados`)
  return data
}

async function seedCreditos(clientes: any[]) {
  console.log('💳 Creando créditos DEMO...')

  const creditos = [
    {
      empresa_id: DEMO_TENANT_ID,
      sucursal_id: DEMO_SUCURSAL_ID,
      cliente_id: clientes[0].id,
      codigo: 'DEMO-001',
      tipo_garantia: 'ORO',
      descripcion_garantia: 'Cadena de oro 18k, 50gr',
      monto_prestado: 3000.00,
      tasa_interes: 5.0,
      fecha_inicio: new Date('2026-01-15').toISOString(),
      fecha_vencimiento: new Date('2026-02-15').toISOString(),
      estado: 'VIGENTE',
      usuario_id: DEMO_USUARIO_ID,
    },
    {
      empresa_id: DEMO_TENANT_ID,
      sucursal_id: DEMO_SUCURSAL_ID,
      cliente_id: clientes[1].id,
      codigo: 'DEMO-002',
      tipo_garantia: 'ELECTRONICO',
      descripcion_garantia: 'Laptop HP Core i7, 16GB RAM',
      monto_prestado: 1500.00,
      tasa_interes: 7.0,
      fecha_inicio: new Date('2026-01-20').toISOString(),
      fecha_vencimiento: new Date('2026-02-20').toISOString(),
      estado: 'VIGENTE',
      usuario_id: DEMO_USUARIO_ID,
    },
    {
      empresa_id: DEMO_TENANT_ID,
      sucursal_id: DEMO_SUCURSAL_ID,
      cliente_id: clientes[2].id,
      codigo: 'DEMO-003',
      tipo_garantia: 'VEHICULO',
      descripcion_garantia: 'Moto Honda Wave 110cc',
      monto_prestado: 2000.00,
      tasa_interes: 6.0,
      fecha_inicio: new Date('2026-01-10').toISOString(),
      fecha_vencimiento: new Date('2026-02-10').toISOString(),
      estado: 'VENCIDO',
      usuario_id: DEMO_USUARIO_ID,
    },
    {
      empresa_id: DEMO_TENANT_ID,
      sucursal_id: DEMO_SUCURSAL_ID,
      cliente_id: clientes[3].id,
      codigo: 'DEMO-004',
      tipo_garantia: 'ORO',
      descripcion_garantia: 'Anillo de oro 18k con diamante',
      monto_prestado: 5000.00,
      tasa_interes: 4.5,
      fecha_inicio: new Date('2026-01-25').toISOString(),
      fecha_vencimiento: new Date('2026-03-25').toISOString(),
      estado: 'VIGENTE',
      usuario_id: DEMO_USUARIO_ID,
    },
    {
      empresa_id: DEMO_TENANT_ID,
      sucursal_id: DEMO_SUCURSAL_ID,
      cliente_id: clientes[4].id,
      codigo: 'DEMO-005',
      tipo_garantia: 'ELECTRONICO',
      descripcion_garantia: 'iPhone 14 Pro Max 256GB',
      monto_prestado: 2500.00,
      tasa_interes: 8.0,
      fecha_inicio: new Date('2025-12-20').toISOString(),
      fecha_vencimiento: new Date('2026-01-20').toISOString(),
      estado: 'CANCELADO',
      usuario_id: DEMO_USUARIO_ID,
    },
  ]

  const { data, error } = await supabase.from('creditos').insert(creditos).select()

  if (error) throw new Error(`Error créditos: ${error.message}`)
  console.log(`✅ ${data.length} créditos creados`)
  return data
}

async function seedPagos(creditos: any[]) {
  console.log('💵 Creando pagos DEMO...')

  const pagos = [
    {
      empresa_id: DEMO_TENANT_ID,
      credito_id: creditos[0].id,
      monto: 500.00,
      concepto: 'ABONO',
      fecha: new Date('2026-01-20').toISOString(),
      usuario_id: DEMO_USUARIO_ID,
    },
    {
      empresa_id: DEMO_TENANT_ID,
      credito_id: creditos[1].id,
      monto: 300.00,
      concepto: 'INTERES',
      fecha: new Date('2026-01-25').toISOString(),
      usuario_id: DEMO_USUARIO_ID,
    },
    {
      empresa_id: DEMO_TENANT_ID,
      credito_id: creditos[4].id,
      monto: 2500.00,
      concepto: 'CANCELACION',
      fecha: new Date('2026-01-15').toISOString(),
      usuario_id: DEMO_USUARIO_ID,
    },
  ]

  const { data, error } = await supabase.from('pagos').insert(pagos).select()

  if (error) throw new Error(`Error pagos: ${error.message}`)
  console.log(`✅ ${data.length} pagos creados`)
  return data
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log('🚀 Iniciando seed de datos DEMO...\n')

  try {
    // 1. Limpiar datos anteriores
    await cleanDemoData()
    console.log('')

    // 2. Crear estructura base
    const empresa = await seedEmpresa()
    const sucursal = await seedSucursal()
    const usuario = await seedUsuario()
    const caja = await seedCaja()
    console.log('')

    // 3. Crear datos operativos
    const clientes = await seedClientes()
    const creditos = await seedCreditos(clientes)
    const pagos = await seedPagos(creditos)
    console.log('')

    // 4. Resumen
    console.log('═'.repeat(50))
    console.log('✅ SEED COMPLETADO EXITOSAMENTE')
    console.log('═'.repeat(50))
    console.log(`📊 Resumen:`)
    console.log(`   - Empresa: ${empresa.nombre}`)
    console.log(`   - Sucursal: ${sucursal.nombre}`)
    console.log(`   - Usuario: ${usuario.email}`)
    console.log(`   - Clientes: ${clientes.length}`)
    console.log(`   - Créditos: ${creditos.length}`)
    console.log(`   - Pagos: ${pagos.length}`)
    console.log(`   - Caja: #${caja.numero_caja} (S/ ${caja.saldo_actual})`)
    console.log('')
    console.log('🔐 Credenciales DEMO:')
    console.log(`   Email: admin@demo.juntay.io`)
    console.log(`   Password: (configurar en Supabase Auth)`)
    console.log('')
    console.log('⚠️  Para limpiar: npm run clean:demo')
    console.log('═'.repeat(50))

  } catch (error: any) {
    console.error('❌ Error en seed:', error.message)
    process.exit(1)
  }
}

main()
