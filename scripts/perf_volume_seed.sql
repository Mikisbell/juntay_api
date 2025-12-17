
-- ============================================================================
-- JUNTAY API - PERFORMANCE SEED (GENERADOR DE CARGA)
-- ============================================================================
-- Objetivo: Generar volumen masivo para pruebas de estrés.

BEGIN;

DO $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_empresa_id UUID;
    v_dummy_id UUID;
BEGIN
    v_start_time := clock_timestamp();
    RAISE NOTICE '🚀 INICIANDO GENERACIÓN DE CARGA MASIVA...';

    -- 0. EMPRESA DUMMY
    -- Necesitamos un ID de empresa válido si hay FKs estrictas.
    -- Si no hay tabla empresas seed, creamos o usamos una.
    -- Asumimos que usuarios tiene empresa_id.
    
    -- 1. GENERAR 1,000 CLIENTES
    RAISE NOTICE '... Generando 1,000 Clientes';
    INSERT INTO public.clientes (nombres, apellido_paterno, numero_documento, tipo_documento, empresa_id)
    SELECT 
        'ClientePerf_' || i, 
        'Apellido_' || floor(random()*1000)::text,
        'DNI' || (10000000 + i)::text,
        'DNI',
        NULL -- Ajustar si es obligatorio
    FROM generate_series(1, 1000) i
    ON CONFLICT DO NOTHING; -- Evitar error si se corre 2 veces

    -- 2. GENERAR 5,000 PRÉSTAMOS
    RAISE NOTICE '... Generando 5,000 Préstamos';
    INSERT INTO public.creditos (
        codigo, cliente_id, monto_prestado, tasa_interes, 
        fecha_desembolso, fecha_vencimiento, saldo_pendiente, 
        estado, estado_detallado, periodo_dias
    )
    SELECT 
        'PERF-' || md5(random()::text || i),
        (SELECT id FROM public.clientes ORDER BY random() LIMIT 1), -- Cliente Random
        (random() * 5000 + 500)::numeric(10,2), -- Monto 500-5500
        10.00,
        CURRENT_DATE - (random() * 365)::int, -- Fecha en el último año
        CURRENT_DATE + (random() * 30)::int,
        (random() * 5000)::numeric(10,2),
        CASE WHEN random() > 0.5 THEN 'vigente' ELSE 'cancelado' END,
        CASE WHEN random() > 0.5 THEN 'vigente' ELSE 'cancelado' END,
        30 -- Valor por defecto para performance test
    FROM generate_series(1, 5000) i;

    -- 3. GENERAR 20,000 TRANSACCIONES CAJA
    RAISE NOTICE '... Generando 20,000 Movimientos de Caja';
    
    -- Obtener un usuario ID válido (cualquiera)
    SELECT id INTO v_empresa_id FROM public.usuarios LIMIT 1;

    -- Creamos caja temporal
    INSERT INTO public.cajas_operativas (usuario_id, estado, numero_caja, saldo_actual)
    VALUES (v_empresa_id, 'cerrada', 9999, 0)
    RETURNING id INTO v_dummy_id;

    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, 
        tipo, 
        motivo, 
        monto, 
        saldo_anterior, 
        saldo_nuevo, 
        descripcion, 
        usuario_id, -- <--- Aseguramos que coincide con la definición
        metadata
    )
    SELECT 
        v_dummy_id,
        CASE WHEN random() > 0.5 THEN 'INGRESO' ELSE 'EGRESO' END,
        'TEST_PERF',
        (random() * 100)::numeric(10,2),
        0, 0, 
        'Movimiento masivo ' || i,
        v_empresa_id, -- Usamos el ID recuperado explícitamente
        '{}'::jsonb
    FROM generate_series(1, 20000) i;

    v_end_time := clock_timestamp();
    RAISE NOTICE '🏁 CARGA COMPLETADA en %', (v_end_time - v_start_time);
END $$;

COMMIT;
