
-- ============================================================================
-- JUNTAY API - BENCHMARK DE CONSULTAS CRÍTICAS
-- ============================================================================
-- Objetivo: Medir tiempos de respuesta en BD con carga masiva.

BEGIN;

DO $$
DECLARE
    v_start TIMESTAMP;
    v_end TIMESTAMP;
BEGIN
    RAISE NOTICE '🏎️ INICIANDO BENCHMARK DE RENDIMIENTO...';

    -- 1. BUSQUEDA DE CLIENTES (Simulando autocompletado)
    -- Escenario: Usuario escribe "GARCIA" en el buscador. tiene que buscar en 1,000+ registros.
    v_start := clock_timestamp();
    PERFORM public.buscar_clientes_con_creditos('GARCIA', false, 20);
    v_end := clock_timestamp();
    RAISE NOTICE '⏱️ Búsqueda Clientes (Wildcard): %', (v_end - v_start);

    -- 2. REPORTE DE CONCILIACIÓN (Simulando cierre de día)
    -- Escenario: Agregación de miles de transacciones para ver si cuadra.
    v_start := clock_timestamp();
    PERFORM public.conciliar_caja_dia(CURRENT_DATE);
    v_end := clock_timestamp();
    RAISE NOTICE '⏱️ Conciliación Caja (Agregación): %', (v_end - v_start);

    -- 3. ESTRES DE LEDGER (Simulando auditoría de historia)
    -- Escenario: join masivo de movimientos con usuarios.
    v_start := clock_timestamp();
    PERFORM count(*) FROM public.movimientos_caja_operativa m
    JOIN public.cajas_operativas c ON m.caja_operativa_id = c.id
    JOIN public.usuarios u ON c.usuario_id = u.id;
    v_end := clock_timestamp();
    RAISE NOTICE '⏱️ Auditoría Full Join (20k rows): %', (v_end - v_start);

END $$;

ROLLBACK; -- No queremos guardar nada, solo medir.
