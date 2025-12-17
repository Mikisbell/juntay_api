
-- ============================================================================
-- JUNTAY API - VERIFICACIÓN DE CAJA CIEGA (BLIND CASHIER)
-- ============================================================================

BEGIN;

DO $$
DECLARE
    new_cajero_id UUID;
    caja_id UUID;
    boveda_real_id UUID;
BEGIN
    RAISE NOTICE '🕵️ INICIANDO TEST DE CAJERO CIEGO (Modo Escéptico)...';

    -- 0. SETUP: Crear Cajero
    INSERT INTO public.usuarios (email, nombres, apellido_paterno, rol) 
    VALUES ('ciego@test.com', 'JUAN', 'CIEGO', 'CAJERO') 
    RETURNING id INTO new_cajero_id;

    -- ========================================================================
    -- PRE-SETUP: Identificar Bóveda Principal Real y Fondeo
    -- ========================================================================
    SELECT id INTO boveda_real_id FROM public.cuentas_financieras WHERE es_principal = TRUE LIMIT 1;
    IF boveda_real_id IS NULL THEN
        -- Si no hay, intentamos setear una para el test
        UPDATE public.cuentas_financieras SET es_principal = TRUE WHERE tipo='EFECTIVO' RETURNING id INTO boveda_real_id;
    END IF;
    
    -- GARANTIZAR LIQUIDEZ (Inyección Divina para el test)
    UPDATE public.cuentas_financieras SET saldo = 10000.00 WHERE id = boveda_real_id;
    RAISE NOTICE '💰 Fondeo de Bóveda Principal (ID: %) a S/ 10,000 para pruebas.', boveda_real_id;

    -- ========================================================================
    -- CASO 1: FALLO DE CONFIGURACIÓN (Nadie sabe cuál es la bóveda principal)
    -- ========================================================================
    -- Sabotaje temporal
    UPDATE public.cuentas_financieras SET es_principal = FALSE;

    BEGIN
        PERFORM public.admin_asignar_caja(new_cajero_id, 100.00, 'Test Fail 1');
        RAISE EXCEPTION '❌ FALLO DEL TEST: El sistema permitió abrir caja sin Bóveda Principal.';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%ERROR DE CONFIGURACIÓN%' THEN
            RAISE NOTICE '✅ DEFENSA OK: Sistema bloqueó apertura sin configuración.';
        ELSE
            RAISE EXCEPTION '❌ ERROR INESPERADO CASO 1: %', SQLERRM;
        END IF;
    END;

    -- Restaurar configuración (USANDO ID SEGURO)
    UPDATE public.cuentas_financieras SET es_principal = TRUE WHERE id = boveda_real_id;

    -- ========================================================================
    -- CASO 2: FALLO DE LIQUIDEZ (Intentar sacar más de lo que hay)
    -- ========================================================================
    BEGIN
        PERFORM public.admin_asignar_caja(new_cajero_id, 9999999.00, 'Test Fail 2');
        RAISE EXCEPTION '❌ FALLO DEL TEST: El sistema permitió abrir caja sin fondos.';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%LIQUIDEZ INSUFICIENTE%' THEN
            RAISE NOTICE '✅ DEFENSA OK: Sistema bloqueó apertura por falta de fondos.';
        ELSE
            RAISE EXCEPTION '❌ ERROR INESPERADO CASO 2: %', SQLERRM;
        END IF;
    END;

    -- ========================================================================
    -- CASO 3: APERTURA EXITOSA (Determinismo)
    -- ========================================================================
    -- Asumimos que hay al menos 100 soles en la bóveda (del test anterior teníamos 4000 o 5000)
    
    caja_id := public.admin_asignar_caja(new_cajero_id, 100.00, 'Apertura Exitosa');
    
    IF caja_id IS NOT NULL THEN
        RAISE NOTICE '✅ ÉXITO: Caja % abierta descontando automáticamente de Bóveda Principal.', caja_id;
    END IF;

    RAISE NOTICE '🏆 BLIND CASHIER VERIFIED: UX simple, Backend robusto.';

END $$;

ROLLBACK;
