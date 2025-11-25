-- ============================================================================
-- SISTEMA DE CONCILIACIÓN DIARIA
-- Descripción: Verifica automáticamente que los movimientos cuadren
-- Previene: Descuadres de caja, errores contables, fraude
-- ============================================================================

-- RPC: Obtener todos los movimientos de un día
CREATE OR REPLACE FUNCTION public.get_movimientos_dia(p_fecha DATE)
RETURNS TABLE (
    tipo_movimiento VARCHAR,
    categoria VARCHAR,
    cantidad_operaciones BIGINT,
    monto_total NUMERIC,
    monto_promedio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    -- 1. Préstamos otorgados (egresos de caja)
    SELECT 
        'PRESTAMO'::VARCHAR as tipo_movimiento,
        'EGRESO'::VARCHAR as categoria,
        COUNT(*) as cantidad_operaciones,
        SUM(monto_prestado) as monto_total,
        AVG(monto_prestado) as monto_promedio
    FROM creditos
    WHERE DATE(fecha_desembolso) = p_fecha
    
    UNION ALL
    
    -- 2. Pagos recibidos (ingresos a caja)
    SELECT 
        'PAGO',
        'INGRESO',
        COUNT(*),
        SUM(monto),
        AVG(monto)
    FROM pagos
    WHERE DATE(fecha_pago) = p_fecha
      AND estado = 'completado'
    
    UNION ALL
    
    -- 3. Renovaciones (ingreso + egreso)
    SELECT 
        'RENOVACION',
        'MIXTO',
        COUNT(*),
        SUM(monto_prestado),
        AVG(monto_prestado)
    FROM creditos
    WHERE DATE(fecha_desembolso) = p_fecha
      AND estado = 'renovado'
    
    UNION ALL
    
    -- 4. Cancelaciones (ingreso final)
    SELECT 
        'CANCELACION',
        'INGRESO',
        COUNT(*),
        SUM(p.monto),
        AVG(p.monto)
    FROM pagos p
    JOIN creditos c ON p.credito_id = c.id
    WHERE DATE(p.fecha_pago) = p_fecha
      AND c.estado = 'cancelado'
      AND DATE(c.fecha_cancelacion) = p_fecha;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: Conciliar caja del día
-- ============================================================================

CREATE OR REPLACE FUNCTION public.conciliar_caja_dia(p_fecha DATE)
RETURNS TABLE (
    cuadra BOOLEAN,
    diferencia NUMERIC,
    saldo_esperado NUMERIC,
    saldo_real NUMERIC,
    detalle JSONB
) AS $$
DECLARE
    v_prestamos_total NUMERIC DEFAULT 0;
    v_pagos_total NUMERIC DEFAULT 0;
    v_saldo_inicial NUMERIC DEFAULT 0;
    v_saldo_final_esperado NUMERIC;
    v_saldo_final_real NUMERIC DEFAULT 0;
    v_diferencia NUMERIC;
BEGIN
    -- 1. Obtener saldo inicial (cierre del día anterior)
    SELECT COALESCE(saldo_final_efectivo, 0) INTO v_saldo_inicial
    FROM cajas
    WHERE DATE(fecha_cierre) = p_fecha - 1
      AND estado = 'cerrada'
    ORDER BY fecha_cierre DESC
    LIMIT 1;
    
    -- 2. Sumar préstamos del día (egresos)
    SELECT COALESCE(SUM(monto_prestado), 0) INTO v_prestamos_total
    FROM creditos
    WHERE DATE(fecha_desembolso) = p_fecha;
    
    -- 3. Sumar pagos del día (ingresos)
    SELECT COALESCE(SUM(monto), 0) INTO v_pagos_total
    FROM pagos
    WHERE DATE(fecha_pago) = p_fecha
      AND estado = 'completado';
    
    -- 4. Calcular saldo esperado al final del día
    v_saldo_final_esperado := v_saldo_inicial - v_prestamos_total + v_pagos_total;
    
    -- 5. Obtener saldo real reportado por cajero
    SELECT COALESCE(saldo_final_efectivo, 0) INTO v_saldo_final_real
    FROM cajas
    WHERE DATE(fecha_cierre) = p_fecha
      AND estado = 'cerrada'
    ORDER BY fecha_cierre DESC
    LIMIT 1;
    
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: Detectar descuadres pendientes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.detectar_descuadres(p_ultimos_dias INT DEFAULT 7)
RETURNS TABLE (
    fecha DATE,
    diferencia NUMERIC,
    saldo_esperado NUMERIC,
    saldo_real NUMERIC,
    caja_id UUID,
    cajero_nombre TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(c.fecha_cierre) as fecha,
        (c.saldo_final_efectivo - 
            (c.saldo_inicial_efectivo + 
             COALESCE(ingresos.total, 0) - 
             COALESCE(egresos.total, 0)
            )
        ) as diferencia,
        (c.saldo_inicial_efectivo + 
         COALESCE(ingresos.total, 0) - 
         COALESCE(egresos.total, 0)
        ) as saldo_esperado,
        c.saldo_final_efectivo as saldo_real,
        c.id as caja_id,
        COALESCE(e.nombre_completo, 'Desconocido') as cajero_nombre
    FROM cajas c
    LEFT JOIN empleados_completo e ON c.usuario_id = e.user_id
    LEFT JOIN LATERAL (
        SELECT SUM(monto) as total
        FROM pagos
        WHERE DATE(fecha_pago) = DATE(c.fecha_cierre)
    ) ingresos ON true
    LEFT JOIN LATERAL (
        SELECT SUM(monto_prestado) as total
        FROM creditos
        WHERE DATE(fecha_desembolso) = DATE(c.fecha_cierre)
    ) egresos ON true
    WHERE c.estado = 'cerrada'
      AND DATE(c.fecha_cierre) >= CURRENT_DATE - p_ultimos_dias
      AND ABS(c.saldo_final_efectivo - 
              (c.saldo_inicial_efectivo + 
               COALESCE(ingresos.total, 0) - 
               COALESCE(egresos.total, 0)
              )
          ) > 0.01
    ORDER BY c.fecha_cierre DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RPC: Reporte de cierre del día
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generar_reporte_cierre(p_fecha DATE)
RETURNS JSONB AS $$
DECLARE
    v_reporte JSONB;
BEGIN
    SELECT jsonb_build_object(
        'fecha', p_fecha,
        'resumen', (
            SELECT jsonb_build_object(
                'prestamos', jsonb_build_object(
                    'cantidad', COUNT(*),
                    'monto_total', COALESCE(SUM(monto_prestado), 0)
                ),
                'pagos', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*),
                        'monto_total', COALESCE(SUM(monto), 0)
                    )
                    FROM pagos
                    WHERE DATE(fecha_pago) = p_fecha
                ),
                'renovaciones', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*),
                        'monto_total', COALESCE(SUM(monto_prestado), 0)
                    )
                    FROM creditos
                    WHERE DATE(fecha_desembolso) = p_fecha
                      AND estado = 'renovado'
                ),
                'cancelaciones', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*)
                    )
                    FROM creditos
                    WHERE DATE(fecha_cancelacion) = p_fecha
                      AND estado = 'cancelado'
                )
            )
            FROM creditos
            WHERE DATE(fecha_desembolso) = p_fecha
        ),
        'conciliacion', (
            SELECT row_to_json(r)
            FROM (SELECT * FROM public.conciliar_caja_dia(p_fecha)) r
        )
    ) INTO v_reporte;
    
    RETURN v_reporte;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION public.get_movimientos_dia(DATE) IS 'Obtiene todos los movimientos financieros de un día específico';
COMMENT ON FUNCTION public.conciliar_caja_dia(DATE) IS 'Concilia la caja del día comparando saldo esperado vs real';
COMMENT ON FUNCTION public.detectar_descuadres(INT) IS 'Detecta cajas con descuadres en los últimos N días';
COMMENT ON FUNCTION public.generar_reporte_cierre(DATE) IS 'Genera un reporte JSON completo del cierre del día';
