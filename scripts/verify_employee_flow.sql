
-- ============================================================================
-- JUNTAY API - PRUEBA DE ESTRÉS DE FLUJO DE EMPLEADOS
-- ============================================================================
-- Simula la contratación de un empleado y su vinculación con credenciales.

BEGIN;

DO $$
DECLARE
    new_persona_id UUID;
    new_auth_user_id UUID;
    new_empleado_id UUID;
BEGIN
    RAISE NOTICE '🚀 Iniciando Simulación de Flujo de Recursos Humanos...';

    -- 1. CREAR PERSONA (El ser humano)
    INSERT INTO public.personas (
        nombres, 
        apellido_paterno, 
        apellido_materno, 
        tipo_documento, 
        numero_documento,
        email
    ) VALUES (
        'MARIA', 
        'LOPEZ', 
        'ADMIN', 
        'DNI', 
        '11223344',
        'maria.admin@juntay.test'
    ) RETURNING id INTO new_persona_id;
    
    RAISE NOTICE '✅ Persona creada: %', new_persona_id;

    -- 2. SIMULAR USUARIO DE AUTH (El login)
    -- Necesitamos un ID válido en auth.users para la FK.
    -- Insertamos uno "dummy" aprovechando que somos superusuario en este test.
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'maria.admin@juntay.test',
        'fake_hash_pass',
        NOW(),
        NOW(),
        NOW()
    ) RETURNING id INTO new_auth_user_id;

    RAISE NOTICE '✅ Usuario Auth simulado: %', new_auth_user_id;

    -- 3. CREAR EMPLEADO (El rol corporativo)
    INSERT INTO public.empleados (
        persona_id,
        user_id,      -- La FK critica que validamos antes
        cargo,
        sucursal_id,
        activo,
        fecha_ingreso
    ) VALUES (
        new_persona_id,
        new_auth_user_id,
        'CAJERO',     -- Asumiendo que es un VARCHAR y no ENUM restringido (según schema previo)
        NULL,         -- Opcional según schema
        TRUE,
        CURRENT_DATE
    ) RETURNING id INTO new_empleado_id;

    RAISE NOTICE '✅ Empleado vinculado creado: %', new_empleado_id;

    -- 4. VALIDACIÓN DE INTEGRIDAD
    IF new_empleado_id IS NOT NULL THEN
        RAISE NOTICE '🎉 PRUEBA EXITOSA: Triángulo Persona <-> Empleado <-> AuthUser establecido.';
    END IF;

END $$;

ROLLBACK; -- Limpieza
RAISE NOTICE '🧹 Limpieza completada (Rollback).';
