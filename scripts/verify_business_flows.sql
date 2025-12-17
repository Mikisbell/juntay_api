
-- ============================================================================
-- JUNTAY API - PRUEBA DE ESTRÉS DE FLUJO DE NEGOCIO
-- ============================================================================
-- Simula la creación completa de un crédito para verificar triggers y relaciones.

BEGIN;

DO $$
DECLARE
    new_persona_id UUID;
    new_cliente_id UUID;
    new_credito_id UUID;
    check_monto NUMERIC;
BEGIN
    RAISE NOTICE '🚀 Iniciando Simulación de Flujo de Negocio...';

    -- 1. CREAR PERSONA (Base de identidad)
    INSERT INTO public.personas (
        nombres, 
        apellido_paterno, 
        apellido_materno, 
        tipo_documento, 
        numero_documento,
        direccion,
        email
    ) VALUES (
        'JUAN', 
        'PEREZ', 
        'TESTER', 
        'DNI', 
        '99988877',
        'AV. TEST 123',
        'juan.tester@example.com'
    ) RETURNING id INTO new_persona_id;
    
    RAISE NOTICE '✅ Persona creada con ID: %', new_persona_id;

    -- 2. CREAR CLIENTE (Rol comercial)
    INSERT INTO public.clientes (
        persona_id, -- Vinculo clave
        empresa_id, -- Opcional o NULL segun schema
        tipo_documento,
        numero_documento,
        nombres,
        apellido_paterno,
        apellido_materno,
        email,
        activo
    ) VALUES (
        new_persona_id,
        NULL, -- Sin empresa especifica para test
        'DNI',
        '99988877',
        'JUAN',
        'PEREZ',
        'TESTER',
        'juan.tester@example.com',
        TRUE
    ) RETURNING id INTO new_cliente_id;

    RAISE NOTICE '✅ Cliente creado con ID: %', new_cliente_id;

    -- 3. CREAR CRÉDITO (Operación financiera)
    -- Validamos campos obligatorios: monto, tasa, periodo
    INSERT INTO public.creditos (
        codigo,
        cliente_id,
        monto_prestado,
        tasa_interes,
        periodo_dias,
        fecha_vencimiento,
        saldo_pendiente,
        estado,
        estado_detallado
    ) VALUES (
        'CRED-TEST-001',
        new_cliente_id,
        1000.00,       -- Monto
        10.00,         -- Tasa 10%
        30,            -- 30 dias
        CURRENT_DATE + 30,
        1000.00,       -- Saldo inicial = monto
        'vigente',
        'al_dia'
    ) RETURNING id, monto_prestado INTO new_credito_id, check_monto;

    RAISE NOTICE '✅ Crédito creado con ID: % | Monto: %', new_credito_id, check_monto;

    -- 4. VERIFICACIÓN FINAL
    IF check_monto = 1000.00 THEN
        RAISE NOTICE '🎉 PRUEBA EXITOSA: El flujo Persona -> Cliente -> Crédito funciona correctamente.';
    ELSE
        RAISE EXCEPTION '❌ ERROR: El monto guardado no coincide.';
    END IF;

    -- Trigger checks (si hubieran fallado, no llegariamos aqui)

END $$;

ROLLBACK; -- Revertimos para no dejar basura en la BD
RAISE NOTICE '🧹 Limpieza completada (Rollback).';
