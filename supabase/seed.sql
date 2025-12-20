-- ============================================================================
-- SEED: Empresa Piloto para Producción
-- Descripción: Datos iniciales para el cliente #1
-- ============================================================================

-- 1. EMPRESA
INSERT INTO public.empresas (id, ruc, razon_social, nombre_comercial, direccion, telefono, email, activo)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '20123456789',
    'EMPRESA PILOTO S.A.C.',
    'Casa de Empeño Piloto',
    'Jr. Principal 123, Lima',
    '01-1234567',
    'admin@piloto.pe',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 2. SUCURSAL PRINCIPAL (vinculada a la empresa)
UPDATE public.sucursales 
SET empresa_id = 'a0000000-0000-0000-0000-000000000001',
    es_principal = true,
    nombre = 'Sucursal Principal',
    direccion = 'Jr. Principal 123, Lima'
WHERE codigo = 'PRINCIPAL';

-- Si no existe la sucursal principal, crearla
INSERT INTO public.sucursales (id, codigo, nombre, direccion, empresa_id, es_principal, activa)
SELECT 
    'b0000000-0000-0000-0000-000000000001',
    'PRINCIPAL',
    'Sucursal Principal',
    'Jr. Principal 123, Lima',
    'a0000000-0000-0000-0000-000000000001',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.sucursales WHERE codigo = 'PRINCIPAL');

-- 3. CUENTA FINANCIERA PRINCIPAL (Bóveda)
UPDATE public.cuentas_financieras 
SET empresa_id = 'a0000000-0000-0000-0000-000000000001',
    es_principal = true
WHERE es_principal = true OR nombre ILIKE '%principal%' OR nombre ILIKE '%bóveda%' OR nombre ILIKE '%legacy%';

-- Si no hay cuentas, crear la principal
INSERT INTO public.cuentas_financieras (id, nombre, tipo, saldo, moneda, es_principal, activo, empresa_id)
SELECT 
    'c0000000-0000-0000-0000-000000000001',
    'Bóveda Principal',
    'EFECTIVO',
    0.00,
    'PEN',
    true,
    true,
    'a0000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM public.cuentas_financieras WHERE es_principal = true);

-- 4. USUARIO ADMINISTRADOR
-- NOTA: El usuario debe existir en auth.users primero (se crea vía Supabase Auth)
-- Este script asume que el admin se registrará después y se ejecutará:
-- UPDATE usuarios SET empresa_id = 'a0000000-0000-0000-0000-000000000001' WHERE email = 'admin@piloto.pe';

-- Crear un rol admin si no existe
INSERT INTO public.roles (id, nombre, descripcion, nivel_acceso, activo)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'admin',
    'Administrador del sistema',
    100,
    true
)
ON CONFLICT DO NOTHING;

-- 5. SETTINGS INICIALES
INSERT INTO public.system_settings (id)
SELECT 'e0000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- 6. CATEGORÍAS DE GARANTÍA BÁSICAS
INSERT INTO public.categorias_garantia (nombre, porcentaje_prestamo_maximo) VALUES
    ('Oro', 70.00),
    ('Plata', 60.00),
    ('Electrónicos', 50.00),
    ('Vehículos', 40.00),
    ('Electrodomésticos', 40.00),
    ('Otros', 30.00)
ON CONFLICT DO NOTHING;

-- 7. TIPOS DE PARENTESCO 
-- (Ya creados en migración 20251217000002_tipos_parentesco_table.sql)

-- ============================================================================
-- INSTRUCCIONES POST-SEED
-- ============================================================================
-- 1. Crear usuario admin en Supabase Auth (Dashboard o API)
-- 2. Ejecutar:
--    UPDATE usuarios SET empresa_id = 'a0000000-0000-0000-0000-000000000001' WHERE email = 'admin@piloto.pe';
--    UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@piloto.pe';
-- ============================================================================
