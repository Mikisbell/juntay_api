
-- ============================================================================
-- JUNTAY API - AUDITORÍA DE SEGURIDAD (INTENTO DE BRECHA)
-- ============================================================================
-- Objetivo: Simular un "Cajero Malicioso" accediendo a datos sensibles.

BEGIN;

DO $$
DECLARE
    v_cajero_id UUID;
    v_cuentas_count INTEGER;
    v_transacciones_count INTEGER;
    v_role TEXT;
BEGIN
    RAISE NOTICE '🕵️ INICIANDO SIMULACIÓN DE BRECHA DE SEGURIDAD...';

    -- 1. Identificar (o crear) un usuario con rol 'CAJERO'
    -- (Nota: En un test real de Supabase, esto se hace con JWT y `set_config('request.jwt.claim.sub', ...)`).
    -- Aquí simularemos la perspectiva de RLS asumiendo el rol 'authenticated' y un ID de cajero.
    
    SELECT id INTO v_cajero_id FROM public.usuarios WHERE rol = 'CAJERO' LIMIT 1;
    
    IF v_cajero_id IS NULL THEN
        -- Crear cajero dummy si no existe
        INSERT INTO public.usuarios (email, rol, nombres) VALUES ('hacker@test.com', 'CAJERO', 'Mr Robot') 
        RETURNING id INTO v_cajero_id;
    END IF;

    -- SIMULAR CONTEXTO DE SESIÓN
    -- IMPORTANTE: RLS usa auth.uid(). Simulamos esto seteando la variable de configuración.
    PERFORM set_config('request.jwt.claim.sub', v_cajero_id::text, true);
    PERFORM set_config('role', 'authenticated', true);

    RAISE NOTICE '🎭 Identidad Asumida: Cajero (ID: %)', v_cajero_id;

    -- 2. INTENTO 1: LEER CUENTAS BANCARIAS (Debería estar prohibido)
    SELECT COUNT(*) INTO v_cuentas_count FROM public.cuentas_financieras;
    
    IF v_cuentas_count > 0 THEN
        RAISE WARNING '🚨 VULNERABILIDAD CONFIRMADA: Cajero puede ver % cuentas bancarias.', v_cuentas_count;
    ELSE
        RAISE NOTICE '🛡️ Cuentas Protegidas (0 visibles).';
    END IF;

    -- 3. INTENTO 2: LEER TODAS LAS TRANSACCIONES DE CAPITAL
    SELECT COUNT(*) INTO v_transacciones_count FROM public.transacciones_capital;
    
    IF v_transacciones_count > 0 THEN
        RAISE WARNING '🚨 VULNERABILIDAD CONFIRMADA: Cajero puede ver % transacciones de capital.', v_transacciones_count;
    ELSE
        RAISE NOTICE '🛡️ Transacciones Protegidas (0 visibles).';
    END IF;

    -- 4. INTENTO 3: BORRAR PAGOS (Debería estar prohibido)
    -- Intentamos borrar un pago ajeno (o cualquiera)
    BEGIN
        DELETE FROM public.pagos WHERE id = (SELECT id FROM public.pagos LIMIT 1);
        -- Si no falla, es grave.
        RAISE WARNING '🚨 VULNERABILIDAD CRÍTICA: Cajero pudo ejecutar DELETE en Pagos (o no falló explícitamente).';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '🛡️ DELETE Bloqueado correctamente: %', SQLERRM;
    END;

END $$;

ROLLBACK;
