-- Crear función RPC para obtener contratos que vencen
CREATE OR REPLACE FUNCTION get_contratos_vencimientos(p_dias INTEGER DEFAULT 30)
RETURNS TABLE (
    id UUID,
    codigo TEXT,
    cliente TEXT,
    dni TEXT,
    telefono TEXT,
    monto NUMERIC,
    saldo NUMERIC,
    fecha_vencimiento DATE,
    dias_restantes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.codigo::TEXT,
        cl.nombre_completo::TEXT,
        cl.numero_documento::TEXT as dni,
        cl.telefono_principal::TEXT,
        c.monto_prestado,
        c.saldo_pendiente,
        c.fecha_vencimiento::DATE,
        (c.fecha_vencimiento::DATE - CURRENT_DATE)::INTEGER as dias_restantes
    FROM creditos c
    JOIN clientes_completo cl ON c.cliente_id = cl.id
    WHERE c.fecha_vencimiento::DATE >= CURRENT_DATE
      AND c.fecha_vencimiento::DATE <= CURRENT_DATE + p_dias
      AND (c.estado_detallado = 'vigente' OR c.estado_detallado = 'al_dia' OR c.estado_detallado = 'por_vencer')
    ORDER BY c.fecha_vencimiento ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_contratos_vencimientos IS 'Obtiene contratos que vencen en los próximos N días con DNI del cliente';
