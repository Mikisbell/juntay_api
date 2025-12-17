
-- ============================================================================
-- JUNTAY API - DIAGNÓSTICO DE CIERRE DE CAJA
-- ============================================================================
-- Objetivo: Verificar si el dinero retorna a la bóveda al cerrar caja.

BEGIN;

DO $$
DECLARE
    v_boveda_id UUID;
    v_caja_id UUID;
    v_cajero_id UUID;
    v_saldo_inicial NUMERIC;
    v_saldo_final NUMERIC;
BEGIN
    RAISE NOTICE '🕵️ INICIANDO DIAGNÓSTICO DE CIERRE...';

    -- 1. Setup Bóveda
    SELECT id INTO v_boveda_id FROM public.cuentas_financieras WHERE es_principal = TRUE LIMIT 1;
    IF v_boveda_id IS NULL THEN
        INSERT INTO public.cuentas_financieras (nombre, tipo, saldo, es_principal)
        VALUES ('Bóveda Test', 'EFECTIVO', 10000.00, TRUE) RETURNING id INTO v_boveda_id;
    ELSE
        UPDATE public.cuentas_financieras SET saldo = 10000.00 WHERE id = v_boveda_id;
    END IF;

    SELECT saldo INTO v_saldo_inicial FROM public.cuentas_financieras WHERE id = v_boveda_id;
    RAISE NOTICE '💰 Saldo Bóveda Inicial: %', v_saldo_inicial;

    -- 2. Setup Cajero
    INSERT INTO public.usuarios (email, nombres, apellido_paterno, rol) 
    VALUES ('cierre@test.com', 'TEST', 'CLOSURE', 'CAJERO') RETURNING id INTO v_cajero_id;

    -- 3. Abrir Caja (Saca 1000)
    PERFORM public.admin_asignar_caja(v_cajero_id, 1000.00, 'Test Closure');
    
    -- Validar descuento
    SELECT saldo INTO v_saldo_final FROM public.cuentas_financieras WHERE id = v_boveda_id;
    IF v_saldo_final <> 9000.00 THEN
        RAISE EXCEPTION '❌ Error en Apertura: No descontó. Saldo: %', v_saldo_final;
    END IF;
    RAISE NOTICE '✅ Apertura OK. Bóveda bajó a 9000.';

    -- 4. SIMULAR CIERRE (Manual Update, como lo haría el backend actual)
    -- Buscamos la caja abierta
    SELECT id INTO v_caja_id FROM public.cajas_operativas WHERE usuario_id = v_cajero_id AND estado = 'abierta';
    
    UPDATE public.cajas_operativas 
    SET estado = 'cerrada', fecha_cierre = NOW(), saldo_final = 1000.00
    WHERE id = v_caja_id;

    -- 5. VERIFICAR RETORNO DE FONDOS
    SELECT saldo INTO v_saldo_final FROM public.cuentas_financieras WHERE id = v_boveda_id;
    
    IF v_saldo_final = 10000.00 THEN
        RAISE NOTICE '✨ CIERRE MÁGICO: El dinero volvió solo (Algún trigger oculto lo hizo).';
    ELSE
        RAISE WARNING '⚠️ FALLO DE CICLO: El dinero (S/ 1000) quedó atrapado en la caja cerrada. Saldo Bóveda: %', v_saldo_final;
        -- Este es el comportamiento esperado actual (Bug de diseño).
    END IF;

END $$;

ROLLBACK;
