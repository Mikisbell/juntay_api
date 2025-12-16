-- ============================================================================
-- JUNTAY - Datos de Prueba para Desarrollo
-- ============================================================================
-- Este archivo inserta datos mock para probar el sistema sin afectar producción
-- Ejecutar con: npx supabase db reset (reconstruye todo + seed)

-- ============================================================================
-- 1. EMPRESA DE PRUEBA
-- ============================================================================

INSERT INTO public.empresas (id, ruc, razon_social, nombre_comercial, direccion, telefono, email)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '20123456789',
    'EMPEÑOS JUNTAY S.A.C.',
    'JUNTAY',
    'Av. Los Comerciantes 456, Lima',
    '01-2345678',
    'contacto@juntay.pe'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. USUARIOS DE PRUEBA
-- ============================================================================

INSERT INTO public.usuarios (id, empresa_id, email, nombres, apellido_paterno, apellido_materno, dni, rol, activo)
VALUES 
    (
        '00000000-0000-0000-0000-000000000010'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'admin@juntay.pe',
        'Carlos',
        'Rodriguez',
        'Lopez',
        '12345678',
        'admin',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000011'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'cajero1@juntay.pe',
        'Maria',
        'Gonzalez',
        'Perez',
        '87654321',
        'cajero',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. CLIENTES DE PRUEBA
-- ============================================================================

INSERT INTO public.clientes (id, empresa_id, tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, telefono_principal, direccion)
VALUES 
    (
        '00000000-0000-0000-0000-000000000020'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'DNI',
        '45678912',
        'Juan',
        'Perez',
        'Garcia',
        '987654321',
        'Jr. Los Pinos 123, San Juan de Lurigancho'
    ),
    (
        '00000000-0000-0000-0000-000000000021'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'DNI',
        '78912345',
        'Ana',
        'Martinez',
        'Lopez',
        '987123456',
        'Av. Colonial 789, Callao'
    ),
    (
        '00000000-0000-0000-0000-000000000022'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'DNI',
        '32165498',
        'Luis',
        'Ramirez',
        'Torres',
        '912345678',
        'Calle Las Flores 456, Ate'
    )
ON CONFLICT (numero_documento) DO NOTHING;

-- ============================================================================
-- 4. CATEGORÍAS DE GARANTÍA
-- ============================================================================

INSERT INTO public.categorias_garantia (id, nombre, porcentaje_prestamo_maximo)
VALUES 
    ('00000000-0000-0000-0000-000000000030'::uuid, 'Oro y Joyas', 70.00),
    ('00000000-0000-0000-0000-000000000031'::uuid, 'Electrónica', 60.00),
    ('00000000-0000-0000-0000-000000000032'::uuid, 'Vehículos', 50.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. GARANTÍAS DE PRUEBA (Prendas Físicas)
-- ============================================================================

INSERT INTO public.garantias (id, cliente_id, categoria_id, descripcion, valor_tasacion, valor_prestamo_sugerido, estado, created_at)
VALUES 
    -- PRENDAS EN CUSTODIA (Activas)
    (
        '00000000-0000-0000-0000-000000000040'::uuid,
        '00000000-0000-0000-0000-000000000020'::uuid,
        '00000000-0000-0000-0000-000000000030'::uuid,
        'Cadena de oro 18k, 25 gramos',
        1500.00,
        1050.00,
        'custodia',
        NOW() - INTERVAL '15 days'
    ),
    (
        '00000000-0000-0000-0000-000000000041'::uuid,
        '00000000-0000-0000-0000-000000000021'::uuid,
        '00000000-0000-0000-0000-000000000031'::uuid,
        'Laptop HP Pavilion 15 - Intel i5, 8GB RAM',
        2000.00,
        1200.00,
        'custodia',
        NOW() - INTERVAL '10 days'
    ),
    (
        '00000000-0000-0000-0000-000000000042'::uuid,
        '00000000-0000-0000-0000-000000000022'::uuid,
        '00000000-0000-0000-0000-000000000030'::uuid,
        'Anillo de oro 14k con diamante',
        800.00,
        560.00,
        'custodia',
        NOW() - INTERVAL '5 days'
    ),
    
    -- PRENDAS EN REMATE (Vencidas)
    (
        '00000000-0000-0000-0000-000000000043'::uuid,
        '00000000-0000-0000-0000-000000000020'::uuid,
        '00000000-0000-0000-0000-000000000031'::uuid,
        'iPhone 12 Pro 128GB',
        1800.00,
        1080.00,
        'remate',
        NOW() - INTERVAL '90 days'
    ),
    (
        '00000000-0000-0000-0000-000000000044'::uuid,
        '00000000-0000-0000-0000-000000000021'::uuid,
        '00000000-0000-0000-0000-000000000030'::uuid,
        'Pulsera de oro 21k, 18 gramos',
        1200.00,
        840.00,
        'remate',
        NOW() - INTERVAL '120 days'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. CRÉDITOS ASOCIADOS A LAS PRENDAS
-- ============================================================================

INSERT INTO public.creditos (id, codigo, cliente_id, garantia_id, empresa_id, monto_prestado, tasa_interes, periodo_dias, fecha_desembolso, fecha_vencimiento, saldo_pendiente, interes_acumulado, estado)
VALUES 
    -- CRÉDITOS VIGENTES
    (
        '00000000-0000-0000-0000-000000000050'::uuid,
        'CON-2024-001',
        '00000000-0000-0000-0000-000000000020'::uuid,
        '00000000-0000-0000-0000-000000000040'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        1050.00,
        10.00,
        30,
        NOW() - INTERVAL '15 days',
        (NOW() - INTERVAL '15 days' + INTERVAL '30 days')::date,
        1050.00,
        52.50,
        'vigente'
    ),
    (
        '00000000-0000-0000-0000-000000000051'::uuid,
        'CON-2024-002',
        '00000000-0000-0000-0000-000000000021'::uuid,
        '00000000-0000-0000-0000-000000000041'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        1200.00,
        10.00,
        30,
        NOW() - INTERVAL '10 days',
        (NOW() - INTERVAL '10 days' + INTERVAL '30 days')::date,
        1200.00,
        60.00,
        'vigente'
    ),
    (
        '00000000-0000-0000-0000-000000000052'::uuid,
        'CON-2024-003',
        '00000000-0000-0000-0000-000000000022'::uuid,
        '00000000-0000-0000-0000-000000000042'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        560.00,
        10.00,
        30,
        NOW() - INTERVAL '5 days',
        (NOW() - INTERVAL '5 days' + INTERVAL '30 days')::date,
        560.00,
        28.00,
        'vigente'
    ),
    
    -- CRÉDITOS VENCIDOS (En Remate)
    (
        '00000000-0000-0000-0000-000000000053'::uuid,
        'CON-2024-004',
        '00000000-0000-0000-0000-000000000020'::uuid,
        '00000000-0000-0000-0000-000000000043'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        1080.00,
        10.00,
        30,
        NOW() - INTERVAL '90 days',
        (NOW() - INTERVAL '90 days' + INTERVAL '30 days')::date,
        1080.00,
        108.00,
        'vencido'
    ),
    (
        '00000000-0000-0000-0000-000000000054'::uuid,
        'CON-2024-005',
        '00000000-0000-0000-0000-000000000021'::uuid,
        '00000000-0000-0000-0000-000000000044'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        840.00,
        10.00,
        30,
        NOW() - INTERVAL '120 days',
        (NOW() - INTERVAL '120 days' + INTERVAL '30 days')::date,
        840.00,
        84.00,
        'vencido'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FIN DE DATOS DE PRUEBA
-- ============================================================================
-- Total insertado:
-- - 1 Empresa
-- - 2 Usuarios (Admin + Cajero)
-- - 3 Clientes
-- - 3 Categorías
-- - 5 Garantías (3 en Custodia, 2 en Remate)
-- - 5 Créditos (3 Vigentes, 2 Vencidos)
