
-- ============================================================================
-- JUNTAY API - CORRECCIÓN FUNCIONES LEGACY (DETECTADO EN PERF TEST)
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.conciliar_caja_dia(p_fecha date)
 RETURNS TABLE(cuadra boolean, diferencia numeric, saldo_esperado numeric, saldo_real numeric, detalle jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_prestamos_total NUMERIC DEFAULT 0;
    v_pagos_total NUMERIC DEFAULT 0;
    v_saldo_inicial NUMERIC DEFAULT 0;
    v_saldo_final_esperado NUMERIC;
    v_saldo_final_real NUMERIC DEFAULT 0;
    v_diferencia NUMERIC;
BEGIN
    -- 1. Obtener saldo inicial (cierre del día anterior)
    -- Ajustado a tablas nuevas: saldo_final_cierre de cajas_operativas
    SELECT COALESCE(saldo_final_cierre, 0) INTO v_saldo_inicial
    FROM public.cajas_operativas
    WHERE DATE(fecha_cierre) = p_fecha - 1
      AND estado = 'cerrada'
    ORDER BY fecha_cierre DESC
    LIMIT 1;
    
    -- 2. Sumar préstamos del día (egresos)
    SELECT COALESCE(SUM(monto_prestado), 0) INTO v_prestamos_total
    FROM public.creditos
    WHERE DATE(fecha_desembolso) = p_fecha;
    
    -- 3. Sumar pagos del día (ingresos)
    SELECT COALESCE(SUM(monto), 0) INTO v_pagos_total
    FROM public.pagos
    WHERE DATE(fecha_pago) = p_fecha
      AND (anulado IS FALSE OR anulado IS NULL);
    
    -- 4. Calcular saldo esperado al final del día
    -- Saldo Inicial + Ingresos (Pagos) - Egresos (Préstamos)
    v_saldo_final_esperado := v_saldo_inicial - v_prestamos_total + v_pagos_total;
    
    -- 5. Obtener saldo real reportado por cajeros (Suma de todas las cajas del día)
    SELECT COALESCE(SUM(saldo_final_cierre), 0) INTO v_saldo_final_real
    FROM public.cajas_operativas
    WHERE DATE(fecha_cierre) = p_fecha
      AND estado = 'cerrada';
    
    -- 6. Calcular diferencia
    v_diferencia := v_saldo_final_real - v_saldo_final_esperado;
    
    -- 7. Retornar resultado
    RETURN QUERY SELECT 
        ABS(v_diferencia) < 0.01 as cuadra,
        v_diferencia as diferencia,
        v_saldo_final_esperado as saldo_esperado,
        v_saldo_final_real as saldo_real,
        jsonb_build_object(
            'saldo_inicial', v_saldo_inicial,
            'prestamos', v_prestamos_total,
            'pagos', v_pagos_total,
            'fecha', p_fecha
        ) as detalle;
END;
$function$;

COMMIT;
