-- ============================================================================
-- RPCs para Operaciones Especiales: Renovaciones y Vencimientos
-- ============================================================================

-- 1. RPC: Obtener contratos renovables (próximos a vencer)
CREATE OR REPLACE FUNCTION public.get_contratos_renovables(p_dias int DEFAULT 30)
RETURNS TABLE (
    id uuid,
    codigo varchar,
    cliente_id uuid,
    cliente_nombre text,
    cliente_telefono varchar,
    fecha_vencimiento date,
    dias_restantes int,
    monto_prestado numeric,
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
        (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
        c.monto_prestado,
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

-- 2. RPC: Obtener vencimientos agrupados por período
CREATE OR REPLACE FUNCTION public.get_vencimientos_agrupados()
RETURNS TABLE (
    periodo text,
    cantidad bigint,
    contratos jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH vencimientos AS (
        SELECT
            c.id,
            c.codigo,
            cl.nombre_completo as cliente,
            cl.telefono_principal as telefono,
            c.fecha_vencimiento,
            c.monto_prestado,
            c.saldo_pendiente,
            (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
            CASE
                WHEN c.fecha_vencimiento = CURRENT_DATE THEN 'hoy'
                WHEN c.fecha_vencimiento BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7 THEN 'semana'
                WHEN c.fecha_vencimiento BETWEEN CURRENT_DATE + 8 AND CURRENT_DATE + 30 THEN 'mes'
                ELSE 'futuro'
            END as periodo_grupo
        FROM public.creditos c
        JOIN public.clientes_completo cl ON c.cliente_id = cl.id
        WHERE c.estado = 'vigente'
          AND c.fecha_vencimiento >= CURRENT_DATE
    )
    SELECT
        v.periodo_grupo as periodo,
        COUNT(*)::bigint as cantidad,
        jsonb_agg(
            jsonb_build_object(
                'id', v.id,
                'codigo', v.codigo,
                'cliente', v.cliente,
                'telefono', v.telefono,
                'fechaVencimiento', v.fecha_vencimiento,
                'diasRestantes', v.dias_restantes,
                'monto', v.monto_prestado,
                'saldo', v.saldo_pendiente
            ) ORDER BY v.fecha_vencimiento
        ) as contratos
    FROM vencimientos v
    GROUP BY v.periodo_grupo
    ORDER BY 
        CASE v.periodo_grupo
            WHEN 'hoy' THEN 1
            WHEN 'semana' THEN 2
            WHEN 'mes' THEN 3
            ELSE 4
        END;
END;
$$;

-- 3. Comentarios
COMMENT ON FUNCTION public.get_contratos_renovables IS 'Retorna contratos próximos a vencer para renovación';
COMMENT ON FUNCTION public.get_vencimientos_agrupados IS 'Retorna vencimientos agrupados por período (hoy/semana/mes)';
