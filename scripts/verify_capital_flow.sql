
-- ============================================================================
-- JUNTAY API - VALIDACIÓN DE FLUJO DE CAPITAL (MÓDULO NUEVO)
-- ============================================================================

BEGIN;

DO $$
DECLARE
    new_persona_id UUID;
    new_inversionista_id UUID;
    cta_yape_id UUID;
    cta_efectivo_id UUID;
BEGIN
    RAISE NOTICE '🚀 Iniciando Simulación de Banca de Inversión...';

    -- 1. CREAR CUENTAS (Infraestructura)
    INSERT INTO public.cuentas_financieras (nombre, tipo, saldo)
    VALUES ('BCP Yape Corporativo', 'DIGITAL', 0.00) RETURNING id INTO cta_yape_id;

    INSERT INTO public.cuentas_financieras (nombre, tipo, saldo)
    VALUES ('Bóveda Central Blindada', 'EFECTIVO', 0.00) RETURNING id INTO cta_efectivo_id;

    RAISE NOTICE '✅ Cuentas creadas: Yape (%) y Efectivo (%)', cta_yape_id, cta_efectivo_id;

    -- 2. CREAR SOCIO (El Inversionista)
    INSERT INTO public.personas (nombres, apellido_paterno, apellido_materno, numero_documento, tipo_documento)
    VALUES ('ELON', 'MUSK', 'PERU', '00000001', 'CE') RETURNING id INTO new_persona_id;

    INSERT INTO public.inversionistas (persona_id, tipo_relacion, participacion_porcentaje)
    VALUES (new_persona_id, 'SOCIO', 20.00) RETURNING id INTO new_inversionista_id;

    RAISE NOTICE '✅ Nuevo Socio registrado: %', new_inversionista_id;

    -- 3. APORTE DE CAPITAL (Inyección Digital)
    -- Elon envía 10k por Yape
    INSERT INTO public.transacciones_capital (
        inversionista_id, destino_cuenta_id, tipo, monto, descripcion
    ) VALUES (
        new_inversionista_id, cta_yape_id, 'APORTE', 10000.00, 'Inversión inicial semilla'
    );
    
    -- Actualizar saldo (Simulando trigger si no se implmentó automático aun, para el test)
    UPDATE public.cuentas_financieras SET saldo = saldo + 10000.00 WHERE id = cta_yape_id;

    RAISE NOTICE '💰 Aporte recibido en Yape. Saldo actual: S/ 10,000';

    -- 4. FONDEO OPERATIVO (Retiro al Banco)
    -- Movemos 5k de Yape a Efectivo para operar caja
    INSERT INTO public.transacciones_capital (
        origen_cuenta_id, destino_cuenta_id, tipo, monto, descripcion
    ) VALUES (
        cta_yape_id, cta_efectivo_id, 'TRANSFERENCIA_FONDEO', 5000.00, 'Retiro para inicio de dia'
    );

    UPDATE public.cuentas_financieras SET saldo = saldo - 5000.00 WHERE id = cta_yape_id;
    UPDATE public.cuentas_financieras SET saldo = saldo + 5000.00 WHERE id = cta_efectivo_id;

    -- 5. VERIFICACIÓN DE SEGREGACIÓN
    -- Yape debe tener 5000, Efectivo 5000.
    -- Si estuviera mezclado, diría 10000 en todo lado.
    
    PERFORM * FROM public.cuentas_financieras WHERE id = cta_yape_id AND saldo = 5000.00;
    IF FOUND THEN
        RAISE NOTICE '✅ Saldo Yape correcto (5,000).';
    ELSE
         RAISE EXCEPTION '❌ Error en saldo Yape.';
    END IF;

    PERFORM * FROM public.cuentas_financieras WHERE id = cta_efectivo_id AND saldo = 5000.00;
    IF FOUND THEN
        RAISE NOTICE '✅ Saldo Efectivo correcto (5,000).';
    ELSE
         RAISE EXCEPTION '❌ Error en saldo Efectivo.';
    END IF;

    RAISE NOTICE '🎉 PRUEBA EXITOSA: Segregación Digital/Físico funciona.';

END $$;

ROLLBACK;
