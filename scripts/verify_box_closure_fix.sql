
-- ============================================================================
-- JUNTAY API - VERIFICACIÓN DE FONDOS RETORNADOS (LIQUIDACIÓN)
-- ============================================================================

BEGIN;

DO $$
DECLARE
    v_boveda_id UUID;
    v_caja_id UUID;
    v_cajero_id UUID;
    v_saldo_inicial NUMERIC;
    v_saldo_final NUMERIC;
    v_tx_cierre_count INTEGER;
BEGIN
    RAISE NOTICE '🕵️ INICIANDO VERIFICACIÓN DE AUTO-LIQUIDACIÓN...';

    -- 1. Setup Bóveda
    SELECT id INTO v_boveda_id FROM public.cuentas_financieras WHERE es_principal = TRUE LIMIT 1;
    IF v_boveda_id IS NULL THEN
        INSERT INTO public.cuentas_financieras (nombre, tipo, saldo, es_principal)
        VALUES ('Bóveda Test Recirculation', 'EFECTIVO', 10000.00, TRUE) RETURNING id INTO v_boveda_id;
    ELSE
        UPDATE public.cuentas_financieras SET saldo = 10000.00 WHERE id = v_boveda_id;
    END IF;

    -- 2. Setup Cajero
    -- Usamos email random para evitar conflicto unique email
    INSERT INTO public.usuarios (email, nombres, apellido_paterno, rol) 
    VALUES ('cierre_' || md5(random()::text) || '@test.com', 'TEST', 'CLOSURE', 'CAJERO') RETURNING id INTO v_cajero_id;

    -- 3. Abrir Caja (Saca 1000)
    PERFORM public.admin_asignar_caja(v_cajero_id, 1000.00, 'Test Recirculation');
    
    -- Validar descuento
    SELECT saldo INTO v_saldo_final FROM public.cuentas_financieras WHERE id = v_boveda_id;
    IF v_saldo_final <> 9000.00 THEN RAISE EXCEPTION '❌ Error Apertura'; END IF;
    RAISE NOTICE '✅ Apertura OK. Bóveda bajó a 9000.';

    -- 4. SIMULAR CIERRE (Usando la columna correcta: saldo_final_cierre)
    SELECT id INTO v_caja_id FROM public.cajas_operativas WHERE usuario_id = v_cajero_id AND estado = 'abierta';
    
    UPDATE public.cajas_operativas 
    SET 
        estado = 'cerrada', 
        fecha_cierre = NOW(), 
        saldo_final_cierre = 1000.00, -- Devolvemos todo
        diferencia_cierre = 0.00
    WHERE id = v_caja_id;

    -- 5. VERIFICAR RETORNO DE FONDOS
    SELECT saldo INTO v_saldo_final FROM public.cuentas_financieras WHERE id = v_boveda_id;
    
    IF v_saldo_final = 10000.00 THEN
        RAISE NOTICE '✨ CIERRE MÁGICO: El dinero (S/ 10,000) volvió correctamente.';
    ELSE
        RAISE EXCEPTION '❌ FALLO: Saldo Bóveda es % (Esperaba 10,000). Trigger falló.', v_saldo_final;
    END IF;

    -- 6. Verificar Registro en Ledger
    SELECT COUNT(*) INTO v_tx_cierre_count 
    FROM public.transacciones_capital 
    WHERE tipo = 'CIERRE_CAJA' AND destino_cuenta_id = v_boveda_id;
    
    IF v_tx_cierre_count > 0 THEN
        RAISE NOTICE '📜 Auditoría OK: Se encontró transacción de CIERRE_CAJA.';
    ELSE
        RAISE EXCEPTION '❌ FALLO: No se creó la transacción en transacciones_capital.';
    END IF;

END $$;

ROLLBACK;
