-- ============================================================================
-- FIX: Dashboard Widgets RPC Functions
-- Run this script in your Supabase SQL Editor to fix the dashboard errors.
-- ============================================================================

-- 1. RPC para obtener resumen de riesgo de la cartera (RiskTrafficLight)
CREATE OR REPLACE FUNCTION public.get_cartera_risk_summary()
RETURNS TABLE (
    estado_grupo text,
    cantidad bigint,
    total_saldo numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN c.estado = 'vigente' AND c.fecha_vencimiento > CURRENT_DATE + 7 THEN 'VIGENTE'
            WHEN c.estado = 'vigente' AND c.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 7 THEN 'POR_VENCER'
            WHEN c.estado = 'vencido' OR c.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
            ELSE 'OTROS'
        END as estado_grupo,
        COUNT(*) as cantidad,
        COALESCE(SUM(c.saldo_pendiente), 0) as total_saldo
    FROM public.creditos c
    WHERE c.estado NOT IN ('cancelado', 'anulado')
    GROUP BY 1;
END;
$$;

-- 2. RPC para obtener vencimientos próximos (ExpirationTimeline)
-- Nota: Esta función depende de la vista 'clientes_completo'.
-- Si esta vista no existe, por favor corre primero la migración 20251126000003_patron_personas.sql

CREATE OR REPLACE FUNCTION public.get_upcoming_expirations(p_days int DEFAULT 7)
RETURNS TABLE (
    id uuid,
    codigo varchar,
    cliente_nombre text,
    garantia_descripcion text,
    garantia_foto text,
    fecha_vencimiento date,
    dias_restantes int,
    monto_prestamo numeric,
    telefono varchar
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.codigo,
        cl.nombre_completo as cliente_nombre,
        g.descripcion as garantia_descripcion,
        (g.fotos_urls)[1] as garantia_foto,
        c.fecha_vencimiento,
        (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
        c.monto_prestado,
        cl.telefono_principal as telefono
    FROM public.creditos c
    JOIN public.clientes_completo cl ON c.cliente_id = cl.id
    JOIN public.garantias g ON c.garantia_id = g.id
    WHERE
        c.estado IN ('vigente', 'vencido')
        AND c.fecha_vencimiento BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE + p_days
    ORDER BY c.fecha_vencimiento ASC
    LIMIT 20;
END;
$$;

COMMENT ON FUNCTION public.get_cartera_risk_summary IS 'Retorna resumen de riesgo de cartera para dashboard';
COMMENT ON FUNCTION public.get_upcoming_expirations IS 'Retorna próximos vencimientos para timeline';
