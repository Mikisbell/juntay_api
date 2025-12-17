
-- ============================================================================
-- JUNTAY API - GRAND STRESS TEST (CYCLE & AUTOMATION)
-- ============================================================================
-- Objetivo: Validar que el sistema "se gestiona solo" (Saldos automáticos).

BEGIN;

DO $$
DECLARE
    -- IDs
    socio_id UUID;
    cta_bcp_id UUID;
    cta_efectivo_id UUID;
    caja_id UUID;
    
    -- Variables de Control
    saldo_check NUMERIC;
BEGIN
    RAISE NOTICE '🚀 INICIANDO GRAND STRESS TEST: Ciclo Financiero Automatizado...';

    -- 1. INFRAESTRUCTURA (Reutilizar Bóveda Principal si existe)
    SELECT id INTO cta_efectivo_id FROM public.cuentas_financieras WHERE es_principal = TRUE LIMIT 1;
    
    IF cta_efectivo_id IS NULL THEN
        INSERT INTO public.cuentas_financieras (nombre, tipo, saldo, es_principal)
        VALUES ('Bóveda Central', 'EFECTIVO', 0.00, TRUE) RETURNING id INTO cta_efectivo_id;
    ELSE
        RAISE NOTICE '📦 Reutilizando Bóveda Principal Existente ID: %', cta_efectivo_id;
    END IF;

    -- Crear cuenta BCP siempre nueva para el test
    INSERT INTO public.cuentas_financieras (nombre, tipo, banco_asociado, saldo)
    VALUES ('BCP Stress Test ' || md5(random()::text), 'DIGITAL', 'BCP', 0.00) RETURNING id INTO cta_bcp_id;

    -- 2. INVERSIONISTA
    INSERT INTO public.personas (nombres, apellido_paterno, apellido_materno, numero_documento, tipo_documento)
    VALUES ('WARREN', 'BUFFETT', 'OMAHA', '99999999', 'CE') RETURNING id INTO socio_id; -- id persona dummy
    INSERT INTO public.inversionistas (persona_id, tipo_relacion)
    VALUES (socio_id, 'SOCIO') RETURNING id INTO socio_id; -- id inversionista

    -- ------------------------------------------------------------------------
    -- FASE 1: INYECCIÓN DE CAPITAL (Test de Trigger Capital)
    -- ------------------------------------------------------------------------
    RAISE NOTICE '--- [FASE 1] Inyección de Capital (Yape) ---';
    
    INSERT INTO public.transacciones_capital (
        inversionista_id, destino_cuenta_id, tipo, monto, metodo_pago, banco_origen, numero_operacion
    ) VALUES (
        socio_id, cta_bcp_id, 'APORTE', 20000.00, 'YAPE', 'BCP', 'VOUCHER-001'
    );
    -- NO HACEMOS UPDATE MANUAL. El trigger debe hacerlo.

    -- Validación
    SELECT saldo INTO saldo_check FROM public.cuentas_financieras WHERE id = cta_bcp_id;
    IF saldo_check = 20000.00 THEN
        RAISE NOTICE '✅ AUTOMATIZACIÓN OK: Saldo BCP subió a 20,000 solo.';
    ELSE
        RAISE EXCEPTION '❌ FALLO: Saldo BCP es % (Esperaba 20,000). Trigger falló.', saldo_check;
    END IF;

    -- ------------------------------------------------------------------------
    -- FASE 2: GESTIÓN DE TESORERÍA (Test de Trigger Transferencia)
    -- ------------------------------------------------------------------------
    RAISE NOTICE '--- [FASE 2] Transferencia a Efectivo ---';

    INSERT INTO public.transacciones_capital (
        origen_cuenta_id, destino_cuenta_id, tipo, monto, descripcion
    ) VALUES (
        cta_bcp_id, cta_efectivo_id, 'TRANSFERENCIA_FONDEO', 5000.00, 'Retiro para Caja'
    );

    -- Validación Doble
    SELECT saldo INTO saldo_check FROM public.cuentas_financieras WHERE id = cta_bcp_id;
    IF saldo_check != 15000.00 THEN RAISE EXCEPTION '❌ FALLO BCP: Esperaba 15,000, tengo %', saldo_check; END IF;

    SELECT saldo INTO saldo_check FROM public.cuentas_financieras WHERE id = cta_efectivo_id;
    IF saldo_check != 5000.00 THEN RAISE EXCEPTION '❌ FALLO EFECTIVO: Esperaba 5,000, tengo %', saldo_check; END IF;
    
    RAISE NOTICE '✅ AUTOMATIZACIÓN OK: Saldos balanceados correctamente (15k / 5k).';

    -- ------------------------------------------------------------------------
    -- FASE 3: OPERACIÓN DE CAJA (Test de Trigger Operativo)
    -- ------------------------------------------------------------------------
    RAISE NOTICE '--- [FASE 3] Operativa de Cajero ---';
    
    -- Registramos salida de bóveda (Manual en Transacciones) - Usamos APERTURA_CAJA para cumplir reglas
    INSERT INTO public.transacciones_capital (origen_cuenta_id, tipo, monto, metadata) 
    VALUES (cta_efectivo_id, 'APERTURA_CAJA', 1000.00, '{}'); 

    -- Creamos Usuario Dummy para la caja
    INSERT INTO public.usuarios (email, nombres, apellido_paterno, rol) 
    VALUES ('cajero@stress.test', 'ROBOT', 'CAJERO', 'CAJERO') RETURNING id INTO socio_id; -- reusamos var
    
    -- Abrimos Caja con 1000 (Manual insert)
    INSERT INTO public.cajas_operativas (usuario_id, cuenta_origen_id, numero_caja, estado, saldo_inicial, saldo_actual)
    VALUES (socio_id, cta_efectivo_id, 101, 'abierta', 1000.00, 1000.00) 
    RETURNING id INTO caja_id;

    -- SIMULAMOS UN COBRO (Ingreso de dinero a la caja)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, usuario_id, tipo, motivo, monto, saldo_anterior, saldo_nuevo
    ) VALUES (
        caja_id, socio_id, 'INGRESO', 'COBRO_CUOTA', 200.00, 1000.00, 1200.00 -- Snapshot visual
    );
    -- EL TRIGGER debe actualizar saldo_actual en cajas_operativas a 1200.

    -- Validación
    SELECT saldo_actual INTO saldo_check FROM public.cajas_operativas WHERE id = caja_id;
    IF saldo_check = 1200.00 THEN
        RAISE NOTICE '✅ AUTOMATIZACIÓN CAJA OK: Saldo subió a 1,200 solo.';
    ELSE
        RAISE EXCEPTION '❌ FALLO CAJA: Saldo es % (Esperaba 1,200). Trigger falló.', saldo_check;
    END IF;

    RAISE NOTICE '🏆 GRAND STRESS TEST COMPLETADO: El sistema vive y respira solo.';

END $$;

ROLLBACK;
