-- =============================================================================
-- RPC: buscar_clientes_con_creditos
-- Búsqueda optimizada de clientes con conteo de créditos vigentes
-- REEMPLAZA el N+1 query que hacía 15+ peticiones separadas
-- =============================================================================

DROP FUNCTION IF EXISTS public.buscar_clientes_con_creditos(text, boolean, integer);

CREATE OR REPLACE FUNCTION public.buscar_clientes_con_creditos(
    p_search_term TEXT,
    p_is_dni BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 15
)
RETURNS TABLE (
    id UUID,
    nombres TEXT,
    apellido_paterno TEXT,
    apellido_materno TEXT,
    numero_documento TEXT,
    contratos_vigentes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
    LIMIT p_limit;
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION public.buscar_clientes_con_creditos IS 
'Búsqueda optimizada de clientes con conteo de créditos vigentes en una sola query. 
Reemplaza el patrón N+1 que hacía una query por cada cliente encontrado.
Rendimiento: 1 query en lugar de N+1 (donde N = número de clientes encontrados).';
