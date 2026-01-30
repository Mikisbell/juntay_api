require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DEMO_ID = '00000000-0000-0000-0000-000000000001';

async function seed() {
  console.log('🚀 Seeding DEMO data...\n');
  
  // Limpiar
  await supabase.from('creditos').delete().eq('empresa_id', DEMO_ID);
  await supabase.from('clientes').delete().eq('empresa_id', DEMO_ID);
  await supabase.from('cajas_operativas').delete().eq('id', '00000000-0000-0000-0000-000000000004');
  await supabase.from('usuarios').delete().eq('id', '00000000-0000-0000-0000-000000000003');
  await supabase.from('sucursales').delete().eq('empresa_id', DEMO_ID);
  await supabase.from('empresas').delete().eq('id', DEMO_ID);
  
  // Empresa
  const { data: emp } = await supabase.from('empresas').insert({
    id: DEMO_ID,
    ruc: '99999999999',
    razon_social: '[DEMO] Casa de Empeño Showcase SAC',
    nombre_comercial: '[DEMO] Showcase',
    direccion: 'Av. Demo 123',
    email: 'demo@juntay.io'
  }).select().single();
  console.log('✅ Empresa:', emp.razon_social);
  
  // Sucursal
  const { data: suc } = await supabase.from('sucursales').insert({
    id: '00000000-0000-0000-0000-000000000002',
    empresa_id: DEMO_ID,
    codigo: 'DEMO-S001',
    nombre: '[DEMO] Sucursal Principal',
    direccion: 'Calle Demo 456'
  }).select().single();
  console.log('✅ Sucursal:', suc.nombre);
  
  // Usuario
  const { data: usr } = await supabase.from('usuarios').insert({
    id: '00000000-0000-0000-0000-000000000003',
    empresa_id: DEMO_ID,
    email: 'admin@demo.juntay.io',
    nombres: 'Admin',
    apellido_paterno: 'Demo',
    dni: '99999999',
    rol: 'admin'
  }).select().single();
  console.log('✅ Usuario:', usr.email);
  
  // Clientes
  const clientes = await supabase.from('clientes').insert([
    {
      empresa_id: DEMO_ID,
      tipo_documento: 'DNI',
      numero_documento: '99999001',
      nombres: 'Juan',
      apellido_paterno: 'Pérez',
      telefono_principal: '999111111'
    },
    {
      empresa_id: DEMO_ID,
      tipo_documento: 'DNI',
      numero_documento: '99999002',
      nombres: 'María',
      apellido_paterno: 'González',
      telefono_principal: '999222222'
    },
    {
      empresa_id: DEMO_ID,
      tipo_documento: 'DNI',
      numero_documento: '99999003',
      nombres: 'Carlos',
      apellido_paterno: 'López',
      telefono_principal: '999333333'
    }
  ]).select();
  console.log('✅ Clientes:', clientes.data.length);
  
  // Créditos (sin trigger)
  const { data: creditos } = await supabase.from('creditos').insert([
    {
      empresa_id: DEMO_ID,
      cliente_id: clientes.data[0].id,
      codigo: 'DEMO-001',
      monto_prestado: 3000,
      saldo_pendiente: 3000,
      tasa_interes: 5,
      periodo_dias: 30,
      fecha_vencimiento: '2026-02-15',
      estado: 'vigente',
      estado_detallado: 'vigente',
      _deleted: false
    },
    {
      empresa_id: DEMO_ID,
      cliente_id: clientes.data[1].id,
      codigo: 'DEMO-002',
      monto_prestado: 1500,
      saldo_pendiente: 1500,
      tasa_interes: 7,
      periodo_dias: 30,
      fecha_vencimiento: '2026-02-20',
      estado: 'vigente',
      estado_detallado: 'vigente',
      _deleted: false
    }
  ]).select();
  console.log('✅ Créditos:', creditos.length);
  
  console.log('\n🎉 DEMO data ready!');
}

seed().catch(console.error);
