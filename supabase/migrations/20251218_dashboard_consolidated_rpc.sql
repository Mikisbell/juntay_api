-- /supabase/migrations/20251218_dashboard_consolidated_rpc.sql
-- Consolidated Dashboard RPC: One query for all dashboard data

CREATE OR REPLACE FUNCTION get_dashboard_complete(p_usuario_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_caja_id UUID;
    v_hoy DATE := CURRENT_DATE;
    v_semana DATE := CURRENT_DATE + 7;
    v_inicio_hoy TIMESTAMPTZ := date_trunc('day', NOW());
    v_hace_7_dias DATE := CURRENT_DATE - 7;
BEGIN
    -- Get result as single JSON object
    SELECT jsonb_build_object(
        'contratos_urgentes', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'codigo', c.codigo_credito,
                    'cliente_id', cl.id,
                    'cliente_nombre', cl.nombres || ' ' || cl.apellido_paterno,
                    'cliente_telefono', cl.telefono_principal,
                    'monto', c.monto_prestado,
                    'saldo', c.saldo_pendiente,
                    'fecha_vencimiento', c.fecha_vencimiento,
                    'dias_vencido', v_hoy - c.fecha_vencimiento
                )
                ORDER BY c.fecha_vencimiento ASC
            ), '[]'::jsonb)
            FROM creditos c
            JOIN clientes cl ON c.cliente_id = cl.id
            WHERE c.fecha_vencimiento <= v_semana
            AND c.estado_detallado IN ('vigente', 'por_vencer', 'vencido', 'en_mora')
            LIMIT 30
        ),
        'cartera', (
            SELECT jsonb_build_object(
                'al_dia', jsonb_build_object(
                    'count', COUNT(*) FILTER (WHERE estado_grupo = 'VIGENTE'),
                    'total', COALESCE(SUM(total_saldo) FILTER (WHERE estado_grupo = 'VIGENTE'), 0)
                ),
                'por_vencer', jsonb_build_object(
                    'count', COUNT(*) FILTER (WHERE estado_grupo = 'POR_VENCER'),
                    'total', COALESCE(SUM(total_saldo) FILTER (WHERE estado_grupo = 'POR_VENCER'), 0)
                ),
                'en_mora', jsonb_build_object(
                    'count', COUNT(*) FILTER (WHERE estado_grupo = 'VENCIDO'),
                    'total', COALESCE(SUM(total_saldo) FILTER (WHERE estado_grupo = 'VENCIDO'), 0)
                )
            )
            FROM (
                SELECT
                    CASE
                        WHEN estado = 'vigente' AND fecha_vencimiento > v_hoy + 7 THEN 'VIGENTE'
                        WHEN estado = 'vigente' AND fecha_vencimiento BETWEEN v_hoy AND v_hoy + 7 THEN 'POR_VENCER'
                        WHEN estado = 'vencido' OR fecha_vencimiento < v_hoy THEN 'VENCIDO'
                        ELSE 'OTROS'
                    END as estado_grupo,
                    saldo_pendiente as total_saldo
                FROM creditos
                WHERE estado NOT IN ('cancelado', 'anulado')
            ) subq
        ),
        'caja', (
            SELECT COALESCE(
                (
                    SELECT jsonb_build_object(
                        'abierta', true,
                        'saldo_inicial', co.saldo_inicial,
                        'saldo_actual', co.saldo_actual,
                        'ingresos', COALESCE((
                            SELECT SUM(monto) FROM movimientos_caja_operativa 
                            WHERE caja_operativa_id = co.id 
                            AND tipo = 'INGRESO'
                            AND created_at >= v_inicio_hoy
                        ), 0),
                        'egresos', COALESCE((
                            SELECT SUM(monto) FROM movimientos_caja_operativa 
                            WHERE caja_operativa_id = co.id 
                            AND tipo = 'EGRESO'
                            AND created_at >= v_inicio_hoy
                        ), 0),
                        'operaciones', (
                            SELECT COUNT(*) FROM movimientos_caja_operativa 
                            WHERE caja_operativa_id = co.id 
                            AND created_at >= v_inicio_hoy
                        )
                    )
                    FROM cajas_operativas co
                    WHERE co.usuario_id = p_usuario_id
                    AND co.estado = 'abierta'
                    LIMIT 1
                ),
                jsonb_build_object(
                    'abierta', false,
                    'saldo_inicial', 0,
                    'saldo_actual', 0,
                    'ingresos', 0,
                    'egresos', 0,
                    'operaciones', 0
                )
            )
        ),
        'pagos_7_dias', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'fecha', fecha_pago::date,
                    'monto', monto
                )
            ), '[]'::jsonb)
            FROM pagos
            WHERE fecha_pago >= v_hace_7_dias
            AND fecha_pago < v_hoy + 1
            AND estado = 'completado'
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_dashboard_complete(UUID) IS 'Returns all dashboard data in a single call: contratos urgentes, cartera summary, caja status, and 7-day payments.';
