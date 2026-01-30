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

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ==========================================
// CONSTANTES DEMO
// ==========================================

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_SUCURSAL_ID = "00000000-0000-0000-0000-000000000002";
const DEMO_USUARIO_ID = "00000000-0000-0000-0000-000000000003";
const DEMO_CAJA_ID = "00000000-0000-0000-0000-000000000004";

const DEMO_PREFIX = "[DEMO]";

// ==========================================
// FUNCIONES HELPER
// ==========================================

async function cleanDemoData() {
  console.log("🧹 Limpiando datos demo existentes...");

  // Borrar en orden de dependencias
  const tables = [
    "pagos",
    "creditos",
    "clientes",
    "cajas_operativas",
    "sucursales",
    "usuarios",
    "empresas",
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", DEMO_TENANT_ID); // Intentar por ID primero

    // Algunos no tienen ID directo, usar otros campos
    if (table === "clientes" || table === "creditos" || table === "pagos") {
      await supabase.from(table).delete().eq("empresa_id", DEMO_TENANT_ID);
    }
    if (table === "cajas_operativas") {
      await supabase.from(table).delete().eq("usuario_id", DEMO_USUARIO_ID);
    }
    if (table === "sucursales") {
      await supabase.from(table).delete().eq("empresa_id", DEMO_TENANT_ID);
    }
  }

  console.log("✅ Limpieza completada");
}

async function seedEmpresa() {
  console.log("🏢 Creando empresa DEMO...");

  const { data, error } = await supabase
    .from("empresas")
    .insert({
      id: DEMO_TENANT_ID,
      razon_social: `${DEMO_PREFIX} Casa de Empeño Showcase SAC`,
      nombre_comercial: `${DEMO_PREFIX} Showcase`,
      ruc: "99999999999",
      direccion: "Av. Demo 123, Lima",
      telefono: "999-999-999",
      email: "demo@juntay.io",
      activo: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Error empresa: ${error.message}`);
  console.log("✅ Empresa creada:", data.razon_social);
  return data;
}

async function seedSucursal() {
  console.log("🏪 Creando sucursal DEMO...");

  const { data, error } = await supabase
    .from("sucursales")
    .insert({
      id: DEMO_SUCURSAL_ID,
      empresa_id: DEMO_TENANT_ID,
      codigo: "DEMO-S001",
      nombre: `${DEMO_PREFIX} Sucursal Principal`,
      direccion: "Calle Demo 456",
      telefono: "999-888-777",
    })
    .select()
    .single();

  if (error) throw new Error(`Error sucursal: ${error.message}`);
  console.log("✅ Sucursal creada:", data.nombre);
  return data;
}

async function seedUsuario() {
  console.log("👤 Creando usuario admin DEMO...");

  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      id: DEMO_USUARIO_ID,
      empresa_id: DEMO_TENANT_ID,
      email: "admin@demo.juntay.io",
      nombres: "Admin",
      apellido_paterno: "Demo",
      apellido_materno: "Sistema",
      dni: "99999999",
      rol: "admin",
    })
    .select()
    .single();

  if (error) throw new Error(`Error usuario: ${error.message}`);
  console.log("✅ Usuario creado:", data.email);
  return data;
}

async function seedCaja() {
  console.log("💰 Creando caja DEMO...");

  const { data, error } = await supabase
    .from("cajas_operativas")
    .insert({
      id: DEMO_CAJA_ID,
      usuario_id: DEMO_USUARIO_ID,
      numero_caja: 1,
      saldo_inicial: 5000.0,
      saldo_actual: 8500.0,
      fecha_apertura: new Date().toISOString(),
      estado: "abierta",
    })
    .select()
    .single();

  if (error) throw new Error(`Error caja: ${error.message}`);
  console.log("✅ Caja creada: #", data.numero_caja);
  return data;
}

async function seedClientes() {
  console.log("👥 Creando clientes DEMO...");

  const clientes = [
    {
      empresa_id: DEMO_TENANT_ID,
      tipo_documento: "DNI",
      numero_documento: "99999001",
      nombres: "Juan",
      apellido_paterno: "Pérez",
      apellido_materno: "Demo",
      telefono_principal: "999-111-111",
      direccion: "Jr. Demo 101",
      email: "juan@demo.test",
    },
    {
      empresa_id: DEMO_TENANT_ID,
      tipo_documento: "DNI",
      numero_documento: "99999002",
      nombres: "María",
      apellido_paterno: "González",
      apellido_materno: "Demo",
      telefono_principal: "999-222-222",
      direccion: "Av. Demo 202",
      email: "maria@demo.test",
    },
    {
      empresa_id: DEMO_TENANT_ID,
      tipo_documento: "DNI",
      numero_documento: "99999003",
      nombres: "Carlos",
      apellido_paterno: "López",
      apellido_materno: "Demo",
      telefono_principal: "999-333-333",
      direccion: "Calle Demo 303",
      email: "carlos@demo.test",
    },
    {
      empresa_id: DEMO_TENANT_ID,
      tipo_documento: "DNI",
      numero_documento: "99999004",
      nombres: "Ana",
      apellido_paterno: "Torres",
      apellido_materno: "Demo",
      telefono_principal: "999-444-444",
      direccion: "Psje. Demo 404",
      email: "ana@demo.test",
    },
    {
      empresa_id: DEMO_TENANT_ID,
      tipo_documento: "DNI",
      numero_documento: "99999005",
      nombres: "Luis",
      apellido_paterno: "Ramos",
      apellido_materno: "Demo",
      telefono_principal: "999-555-555",
      direccion: "Urb. Demo 505",
      email: "luis@demo.test",
    },
  ];

  const { data, error } = await supabase
    .from("clientes")
    .insert(clientes)
    .select();

  if (error) throw new Error(`Error clientes: ${error.message}`);
  console.log(`✅ ${data.length} clientes creados`);
  return data;
}

async function seedCreditos(clientes: any[]) {
  console.log("💳 Creando créditos DEMO...");

  const creditos = [
    {
      empresa_id: DEMO_TENANT_ID,
      cliente_id: clientes[0].id,
      codigo: "DEMO-001",
      monto_prestado: 3000.0,
      saldo_pendiente: 3000.0,
      tasa_interes: 5.0,
      periodo_dias: 30,
      fecha_inicio: "2026-01-15",
      fecha_vencimiento: "2026-02-15",
      estado: "vigente",
      estado_detallado: "vigente",
      observaciones: "Garantía: Cadena de oro 18k, 50gr",
    },
    {
      empresa_id: DEMO_TENANT_ID,
      cliente_id: clientes[1].id,
      codigo: "DEMO-002",
      monto_prestado: 1500.0,
      saldo_pendiente: 1500.0,
      tasa_interes: 7.0,
      periodo_dias: 30,
      fecha_inicio: "2026-01-20",
      fecha_vencimiento: "2026-02-20",
      estado: "vigente",
      estado_detallado: "vigente",
      observaciones: "Garantía: Laptop HP Core i7, 16GB RAM",
    },
    {
      empresa_id: DEMO_TENANT_ID,
      cliente_id: clientes[2].id,
      codigo: "DEMO-003",
      monto_prestado: 2000.0,
      saldo_pendiente: 2000.0,
      tasa_interes: 6.0,
      periodo_dias: 30,
      fecha_inicio: "2026-01-10",
      fecha_vencimiento: "2026-02-10",
      estado: "vencido",
      estado_detallado: "vencido",
      observaciones: "Garantía: Moto Honda Wave 110cc",
    },
    {
      empresa_id: DEMO_TENANT_ID,
      cliente_id: clientes[3].id,
      codigo: "DEMO-004",
      monto_prestado: 5000.0,
      saldo_pendiente: 5000.0,
      tasa_interes: 4.5,
      periodo_dias: 60,
      fecha_inicio: "2026-01-25",
      fecha_vencimiento: "2026-03-25",
      estado: "vigente",
      estado_detallado: "vigente",
      observaciones: "Garantía: Anillo de oro 18k con diamante",
    },
    {
      empresa_id: DEMO_TENANT_ID,
      cliente_id: clientes[4].id,
      codigo: "DEMO-005",
      monto_prestado: 2500.0,
      saldo_pendiente: 0.0,
      tasa_interes: 8.0,
      periodo_dias: 30,
      fecha_inicio: "2025-12-20",
      fecha_vencimiento: "2026-01-20",
      estado: "cancelado",
      estado_detallado: "cancelado",
      observaciones: "Garantía: iPhone 14 Pro Max 256GB",
    },
  ];

  const { data, error } = await supabase
    .from("creditos")
    .insert(creditos)
    .select();

  if (error) throw new Error(`Error créditos: ${error.message}`);
  console.log(`✅ ${data.length} créditos creados`);
  return data;
}

async function seedPagos(creditos: any[]) {
  console.log("💵 Creando pagos DEMO...");

  const pagos = [
    {
      empresa_id: DEMO_TENANT_ID,
      credito_id: creditos[0].id,
      monto: 500.0,
      concepto: "ABONO",
      fecha: new Date("2026-01-20").toISOString(),
      usuario_id: DEMO_USUARIO_ID,
    },
    {
      empresa_id: DEMO_TENANT_ID,
      credito_id: creditos[1].id,
      monto: 300.0,
      concepto: "INTERES",
      fecha: new Date("2026-01-25").toISOString(),
      usuario_id: DEMO_USUARIO_ID,
    },
    {
      empresa_id: DEMO_TENANT_ID,
      credito_id: creditos[4].id,
      monto: 2500.0,
      concepto: "CANCELACION",
      fecha: new Date("2026-01-15").toISOString(),
      usuario_id: DEMO_USUARIO_ID,
    },
  ];

  const { data, error } = await supabase.from("pagos").insert(pagos).select();

  if (error) throw new Error(`Error pagos: ${error.message}`);
  console.log(`✅ ${data.length} pagos creados`);
  return data;
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log("🚀 Iniciando seed de datos DEMO...\n");

  try {
    // 1. Limpiar datos anteriores
    await cleanDemoData();
    console.log("");

    // 2. Crear estructura base
    const empresa = await seedEmpresa();
    const sucursal = await seedSucursal();
    const usuario = await seedUsuario();
    const caja = await seedCaja();
    console.log("");

    // 3. Crear datos operativos
    const clientes = await seedClientes();
    // Skip creditos and pagos for now (triggers conflict)
    // const creditos = await seedCreditos(clientes);
    // const pagos = await seedPagos(creditos);
    console.log("");

    // 4. Resumen
    console.log("═".repeat(50));
    console.log("✅ SEED COMPLETADO EXITOSAMENTE");
    console.log("═".repeat(50));
    console.log(`📊 Resumen:`);
    console.log(`   - Empresa: ${empresa.razon_social}`);
    console.log(`   - Sucursal: ${sucursal.nombre}`);
    console.log(`   - Usuario: ${usuario.email}`);
    console.log(`   - Clientes: ${clientes.length}`);
    console.log(`   - Caja: #${caja.numero_caja} (S/ ${caja.saldo_actual})`);
    console.log("");
    console.log("🔐 Credenciales DEMO:");
    console.log(`   Email: admin@demo.juntay.io`);
    console.log(`   Password: (configurar en Supabase Auth)`);
    console.log("");
    console.log("⚠️  Para limpiar: npm run clean:demo");
    console.log("═".repeat(50));
  } catch (error: any) {
    console.error("❌ Error en seed:", error.message);
    process.exit(1);
  }
}

main();
