
-- ============================================================================
-- JUNTAY API - VERIFICACIÓN CORE OPERATIVO (PRÉSTAMOS)
-- ============================================================================
-- Objetivo: Validar cálculo de intereses y transición de estados.

BEGIN;

DO $$
DECLARE
    v_cliente_id UUID;
    v_credito_id UUID;
    v_interes_calculado NUMERIC;
    v_estado_calculado VARCHAR;
    v_fecha_simulada_inicio DATE := CURRENT_DATE - INTERVAL '45 days'; -- Desembolsado hace 45 días
    v_fecha_vencimiento DATE := CURRENT_DATE - INTERVAL '15 days';     -- Venció hace 15 días
BEGIN
    RAISE NOTICE '🕵️ INICIANDO VALIDACIÓN DE PRÉSTAMOS...';

    -- 1. Crear Cliente Dummy
    INSERT INTO public.clientes (nombres, apellido_paterno, numero_documento, tipo_documento)
    VALUES ('LOAN_TESTER', 'AUTOMATED', '88888888', 'DNI')
    RETURNING id INTO v_cliente_id;

    -- 2. Insertar Crédito "Viajero del Tiempo"
    -- Monto: 1000, Tasa: 10%, Desembolso: -45 días, Periodo: 30 días.
    -- Interés esperado: 1000 * 10% * (45/30) = 150.
    INSERT INTO public.creditos (
        codigo, cliente_id, monto_prestado, tasa_interes, 
        fecha_desembolso, fecha_vencimiento, saldo_pendiente, 
        estado, estado_detallado, periodo_dias
    ) VALUES (
        'TEST-LOAN-001', v_cliente_id, 1000.00, 10.00,
        v_fecha_simulada_inicio, v_fecha_vencimiento, 1000.00,
        'vigente', 'vigente', 30
    ) RETURNING id INTO v_credito_id;

    -- 3. FORZAR ACTUALIZACIÓN (Disparar Triggers)
    -- Postgres a veces dispara en Insert, pero para asegurar cálculo sobre el tiempo transcurrido (si usa NOW()), actualizamos.
    UPDATE public.creditos SET updated_at = NOW() WHERE id = v_credito_id;

    -- 4. VALIDAR RESULTADOS
    SELECT interes_devengado_actual, estado_detallado 
    INTO v_interes_calculado, v_estado_calculado
    FROM public.creditos 
    WHERE id = v_credito_id;

    RAISE NOTICE '📊 Resultados Crédito: Interés=%, Estado=%', v_interes_calculado, v_estado_calculado;

    -- 4.1 Validación de Interés
    -- Tolerancia de cálculo pequeña
    IF v_interes_calculado BETWEEN 149.00 AND 151.00 THEN
        RAISE NOTICE '✅ CÁLCULO DE INTERÉS OK (Aprox 150.00)';
    ELSE
        RAISE EXCEPTION '❌ ERROR INTERÉS: Esperaba ~150, obtuve %', v_interes_calculado;
    END IF;

    -- 4.2 Validación de Estado
    -- Con 15 días de atraso, debería estar vencido o en mora (según reglas del trigger)
    -- Regla vista en schema: > 0 dias vencido -> 'vencido', > 15 -> 'en_mora' (depende si es > o >=)
    IF v_estado_calculado IN ('vencido', 'en_mora') THEN
        RAISE NOTICE '✅ CAMBIO DE ESTADO OK (Detectó morosidad)';
    ELSE
        RAISE EXCEPTION '❌ ERROR ESTADO: Esperaba vencido/en_mora, obtuve %', v_estado_calculado;
    END IF;

END $$;

ROLLBACK;
