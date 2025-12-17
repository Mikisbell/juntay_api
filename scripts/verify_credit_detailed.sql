
-- ============================================================================
-- JUNTAY API - PRUEBA DE ESTRÉS: CRÉDITO PRENDARIO (CON GARANTÍA)
-- ============================================================================
-- Un crédito real en JUNTAY nace de una garantía. Este script valida ese vínculo.

BEGIN;

DO $$
DECLARE
    new_persona_id UUID;
    new_cliente_id UUID;
    new_garantia_id UUID;
    new_credito_id UUID;
    val_tasacion NUMERIC := 1500.00;
    val_prestamo NUMERIC := 1000.00; -- ~66% LTV
BEGIN
    RAISE NOTICE '🚀 Iniciando Simulación de Crédito Prendario...';

    -- 1. PREPARAR CLIENTE (Dueño de la joya)
    INSERT INTO public.personas (nombres, apellido_paterno, apellido_materno, tipo_documento, numero_documento)
    VALUES ('LUIS', 'JOYERO', 'ORO', 'DNI', '77665544') RETURNING id INTO new_persona_id;
    
    INSERT INTO public.clientes (persona_id, tipo_documento, numero_documento)
    VALUES (new_persona_id, 'DNI', '77665544') RETURNING id INTO new_cliente_id;

    -- 2. REGISTRAR GARANTÍA (El objeto de valor)
    -- Asumimos campos estandar de joyeria segun schema probable
    INSERT INTO public.garantias (
        cliente_id,
        descripcion,
        estado,
        valor_tasacion,
        estado_bien -- Condicion fisica (CORREGIDO de descripcion_estado)
    ) VALUES (
        new_cliente_id,
        'ANILLO DE ORO 18K CON RUBI',
        'custodia', -- Estado inicial al recibir
        val_tasacion,
        'BUEN ESTADO'
    ) RETURNING id INTO new_garantia_id;

    RAISE NOTICE '✅ Garantía registrada con ID: % | Valor: %', new_garantia_id, val_tasacion;

    -- 3. DESEMBOLSAR CRÉDITO (El dinero)
    -- Debe vincularse a la garantia y al cliente
    INSERT INTO public.creditos (
        codigo,
        cliente_id,
        garantia_id,  -- VINCULO CRITICO
        monto_prestado,
        tasa_interes,
        periodo_dias,
        fecha_vencimiento,
        saldo_pendiente,
        estado,
        estado_detallado
    ) VALUES (
        'CRED-JOYA-001',
        new_cliente_id,
        new_garantia_id,
        val_prestamo,
        12.00,
        30,
        CURRENT_DATE + 30,
        val_prestamo,
        'vigente',
        'al_dia'
    ) RETURNING id INTO new_credito_id;

    RAISE NOTICE '✅ Crédito con Garantía creado ID: %', new_credito_id;

    -- 4. VALIDACIÓN DE NEGOCIO (LTV Check simple)
    IF val_prestamo > val_tasacion THEN
        RAISE EXCEPTION '❌ RIESGO: El préstamo supera la tasación (LTV > 100%%).';
    ELSE
        RAISE NOTICE '🎉 REGLA DE NEGOCIO CUMPLIDA: Préstamo cubierto por garantía.';
    END IF;

END $$;

ROLLBACK;
