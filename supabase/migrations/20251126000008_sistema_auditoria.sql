-- ============================================================================
-- SISTEMA DE AUDITORÍA BANCARIA
-- Descripción: Trazabilidad completa de todas las transacciones críticas
-- Cumplimiento: SBS Perú, prevención de fraude
-- ============================================================================

-- Tabla de auditoría universal
CREATE TABLE IF NOT EXISTS public.auditoria_transacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Qué se modificó
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id UUID NOT NULL,
    accion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    
    -- Quién lo hizo
    usuario_id UUID REFERENCES auth.users(id),
    empleado_id UUID REFERENCES empleados(id),
    
    -- Qué cambió
    datos_antes JSONB, -- Estado previo (solo UPDATE y DELETE)
    datos_despues JSONB, -- Estado nuevo (solo INSERT y UPDATE)
    
    -- Contexto técnico
    ip_address INET,
    user_agent TEXT,
    
    -- Cuándo
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Índices para búsquedas rápidas
    CONSTRAINT auditoria_accion_check CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON public.auditoria_transacciones(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_auditoria_registro ON public.auditoria_transacciones(registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria_transacciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_empleado ON public.auditoria_transacciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON public.auditoria_transacciones(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON public.auditoria_transacciones(tabla_afectada, registro_id);

-- ============================================================================
-- FUNCIÓN DE TRIGGER UNIVERSAL
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_empleado_id UUID;
BEGIN
    -- Intentar obtener el usuario actual de Supabase
    BEGIN
        v_usuario_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;
    
    -- Si hay usuario, intentar obtener su empleado vinculado
    IF v_usuario_id IS NOT NULL THEN
        SELECT id INTO v_empleado_id 
        FROM public.empleados 
        WHERE user_id = v_usuario_id;
    END IF;
    
    -- Insertar registro de auditoría
    INSERT INTO public.auditoria_transacciones (
        tabla_afectada,
        registro_id,
        accion,
        usuario_id,
        empleado_id,
        datos_antes,
        datos_despues,
        ip_address
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        v_usuario_id,
        v_empleado_id,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
        inet_client_addr() -- IP del cliente
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APLICAR TRIGGERS A TABLAS CRÍTICAS
-- ============================================================================

-- Créditos (contratos de empeño)
DROP TRIGGER IF EXISTS audit_creditos ON public.creditos;
CREATE TRIGGER audit_creditos 
    AFTER INSERT OR UPDATE OR DELETE ON public.creditos
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Pagos (movimientos financieros)
DROP TRIGGER IF EXISTS audit_pagos ON public.pagos;
CREATE TRIGGER audit_pagos 
    AFTER INSERT OR UPDATE OR DELETE ON public.pagos
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Garantías (bienes empeñados)
DROP TRIGGER IF EXISTS audit_garantias ON public.garantias;
CREATE TRIGGER audit_garantias 
    AFTER INSERT OR UPDATE OR DELETE ON public.garantias
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Cajas (apertura/cierre)
DROP TRIGGER IF EXISTS audit_cajas ON public.cajas_operativas;
CREATE TRIGGER audit_cajas
AFTER INSERT OR UPDATE OR DELETE ON public.cajas_operativas
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Personas (datos personales)
DROP TRIGGER IF EXISTS audit_personas ON public.personas;
CREATE TRIGGER audit_personas 
    AFTER INSERT OR UPDATE OR DELETE ON public.personas
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Empleados (cambios de roles/permisos)
DROP TRIGGER IF EXISTS audit_empleados ON public.empleados;
CREATE TRIGGER audit_empleados 
    AFTER INSERT OR UPDATE OR DELETE ON public.empleados
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- ============================================================================
-- RPCs DE CONSULTA
-- ============================================================================

-- Obtener auditoría de un registro específico
CREATE OR REPLACE FUNCTION public.get_auditoria_registro(
    p_tabla VARCHAR,
    p_registro_id UUID
)
RETURNS TABLE (
    audit_id UUID,
    accion VARCHAR,
    empleado_nombre TEXT,
    datos_antes JSONB,
    datos_despues JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as audit_id,
        a.accion,
        COALESCE(
            (SELECT nombre_completo FROM empleados_completo WHERE id = a.empleado_id),
            'Sistema'
        ) as empleado_nombre,
        a.datos_antes,
        a.datos_despues,
        a.timestamp as created_at
    FROM public.auditoria_transacciones a
    WHERE a.tabla_afectada = p_tabla
      AND a.registro_id = p_registro_id
    ORDER BY a.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtener actividad reciente de un empleado
CREATE OR REPLACE FUNCTION public.get_actividad_empleado(
    p_empleado_id UUID,
    p_limit INT DEFAULT 50
)
RETURNS TABLE (
    created_at TIMESTAMPTZ,
    accion VARCHAR,
    tabla VARCHAR,
    registro_id UUID,
    descripcion TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.timestamp as created_at,
        a.accion,
        a.tabla_afectada as tabla,
        a.registro_id,
        CASE a.tabla_afectada
            WHEN 'creditos' THEN 'Contrato de empeño'
            WHEN 'pagos' THEN 'Registro de pago'
            WHEN 'garantias' THEN 'Bien en custodia'
            WHEN 'cajas' THEN 'Operación de caja'
            ELSE a.tabla_afectada
        END as descripcion
    FROM public.auditoria_transacciones a
    WHERE a.empleado_id = p_empleado_id
    ORDER BY a.timestamp DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Detectar actividad sospechosa
CREATE OR REPLACE FUNCTION public.detectar_actividad_sospechosa()
RETURNS TABLE (
    alerta VARCHAR,
    empleado_id UUID,
    empleado_nombre TEXT,
    acciones_count BIGINT,
    ultima_accion TIMESTAMPTZ
) AS $$
BEGIN
    -- Alerta: Más de 50 transacciones en 1 hora
    RETURN QUERY
    SELECT 
        'VOLUMEN_ALTO' as alerta,
        a.empleado_id,
        e.nombre_completo,
        COUNT(*) as acciones_count,
        MAX(a.timestamp) as ultima_accion
    FROM public.auditoria_transacciones a
    JOIN public.empleados_completo e ON a.empleado_id = e.id
    WHERE a.timestamp > now() - interval '1 hour'
    GROUP BY a.empleado_id, e.nombre_completo
    HAVING COUNT(*) > 50;
    
    -- Alerta: Eliminaciones fuera de horario (9pm-6am)
    RETURN QUERY
    SELECT 
        'DELETE_FUERA_HORARIO' as alerta,
        a.empleado_id,
        e.nombre_completo,
        COUNT(*) as acciones_count,
        MAX(a.timestamp) as ultima_accion
    FROM public.auditoria_transacciones a
    JOIN public.empleados_completo e ON a.empleado_id = e.id
    WHERE a.accion = 'DELETE'
      AND a.timestamp > now() - interval '24 hours'
      AND (EXTRACT(HOUR FROM a.timestamp) > 21 OR EXTRACT(HOUR FROM a.timestamp) < 6)
    GROUP BY a.empleado_id, e.nombre_completo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE public.auditoria_transacciones IS 'Registro completo de todas las transacciones críticas del sistema';
COMMENT ON FUNCTION public.audit_trigger_function() IS 'Trigger automático que captura cambios en tablas críticas';
COMMENT ON FUNCTION public.get_auditoria_registro(VARCHAR, UUID) IS 'Historial de cambios de un registro específico';
COMMENT ON FUNCTION public.detectar_actividad_sospechosa() IS 'Detecta patrones anómalos que podrían indicar fraude';
