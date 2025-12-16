-- =============================================================================
-- MIGRACIÓN DE REPARACIÓN: asegurar que el RPC exista
-- Fecha: 2025-12-15
-- =============================================================================

DROP FUNCTION IF EXISTS public.buscar_clientes_con_creditos(text, boolean, integer);

CREATE OR REPLACE FUNCTION public.buscar_clientes_con_creditos(
    p_search_term TEXT,
    p_is_dni BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 15
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(t), '[]'::json)
        FROM (
            SELECT 
                c.id,
                c.nombres,
                c.apellido_paterno,
                c.apellido_materno,
                c.numero_documento,
                COUNT(cr.id) FILTER (WHERE cr.estado IN ('vigente', 'pendiente')) AS contratos_vigentes
            FROM public.clientes c
            LEFT JOIN public.creditos cr ON cr.cliente_id = c.id
            WHERE 
                CASE 
                    WHEN p_is_dni THEN 
                        c.numero_documento ILIKE '%' || p_search_term || '%'
                    ELSE 
                        c.nombres ILIKE '%' || p_search_term || '%'
                        OR c.apellido_paterno ILIKE '%' || p_search_term || '%'
                        OR c.apellido_materno ILIKE '%' || p_search_term || '%'
                END
            GROUP BY c.id, c.nombres, c.apellido_paterno, c.apellido_materno, c.numero_documento
            ORDER BY contratos_vigentes DESC, c.nombres ASC
            LIMIT p_limit
        ) t
    );
END;
$$;

COMMENT ON FUNCTION public.buscar_clientes_con_creditos IS 
'Búsqueda optimizada de clientes con conteo de créditos vigentes. Reparación para garantizar su existencia.';

NOTIFY pgrst, 'reload schema';
