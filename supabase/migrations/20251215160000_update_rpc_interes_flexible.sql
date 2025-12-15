-- ============================================================================
-- Actualización RPC get_contratos_renovables para Sistema de Interés Flexible
-- Agrega campos: tasa_interes, fecha_creacion, dias_transcurridos
-- ============================================================================

-- Eliminar función existente para poder cambiar el tipo de retorno
DROP FUNCTION IF EXISTS public.get_contratos_renovables(int);

-- Actualizar función para incluir campos requeridos por el sistema de interés flexible
CREATE OR REPLACE FUNCTION public.get_contratos_renovables(p_dias int DEFAULT 30)
RETURNS TABLE (
    id uuid,
    codigo varchar,
    cliente_id uuid,
    cliente_nombre text,
    cliente_telefono varchar,
    fecha_vencimiento date,
    fecha_creacion timestamp,        -- NUEVO: Para calcular días transcurridos
    dias_restantes int,
    dias_transcurridos int,            -- NUEVO: Días desde creación del crédito
    monto_prestado numeric,
    tasa_interes numeric,              -- NUEVO: Tasa de interés mensual
    interes_acumulado numeric,
    saldo_pendiente numeric,
    garantia_descripcion text,
    urgencia text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.codigo,
        c.cliente_id,
        cl.nombre_completo,
        cl.telefono_principal,
        c.fecha_vencimiento,
        c.created_at as fecha_creacion,                               -- NUEVO
        (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
        GREATEST(1, EXTRACT(DAY FROM NOW() - c.created_at)::int) as dias_transcurridos,  -- NUEVO
        c.monto_prestado,
        c.tasa_interes,                                               -- NUEVO
        c.interes_acumulado,
        c.saldo_pendiente,
        g.descripcion as garantia_descripcion,
        CASE
            WHEN c.fecha_vencimiento - CURRENT_DATE <= 3 THEN 'alta'
            WHEN c.fecha_vencimiento - CURRENT_DATE <= 7 THEN 'media'
            ELSE 'baja'
        END as urgencia
    FROM public.creditos c
    JOIN public.clientes_completo cl ON c.cliente_id = cl.id
    JOIN public.garantias g ON c.garantia_id = g.id
    WHERE
        c.estado = 'vigente'
        AND c.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + p_dias
    ORDER BY c.fecha_vencimiento ASC;
END;
$$;

COMMENT ON FUNCTION public.get_contratos_renovables IS 'Retorna contratos próximos a vencer con campos para sistema de interés flexible (tasa_interes, dias_transcurridos)';
