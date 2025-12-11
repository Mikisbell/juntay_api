-- Tabla para registrar notificaciones enviadas
CREATE TABLE IF NOT EXISTS notificaciones_enviadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credito_id UUID NOT NULL REFERENCES creditos(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo_notificacion VARCHAR(50) NOT NULL, -- 'vencimiento_hoy', 'vencimiento_proximo', 'renovacion_exitosa', etc
    mensaje_enviado TEXT NOT NULL,
    telefono_destino VARCHAR(20) NOT NULL,
    enviado_por UUID REFERENCES auth.users(id),
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'enviado', -- 'enviado', 'fallido', 'simulado'
    medio VARCHAR(20) DEFAULT 'whatsapp', -- 'whatsapp', 'sms', 'email'
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_notificaciones_credito ON notificaciones_enviadas(credito_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_cliente ON notificaciones_enviadas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON notificaciones_enviadas(fecha_envio DESC);

-- RPC para obtener historial de notificaciones de un contrato
CREATE OR REPLACE FUNCTION get_historial_notificaciones(p_credito_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', id,
                'tipo', tipo_notificacion,
                'mensaje', LEFT(mensaje_enviado, 100) || '...', -- Solo primeros 100 caracteres
                'fecha', fecha_envio,
                'estado', estado,
                'medio', medio,
                'horas_transcurridas', EXTRACT(EPOCH FROM (NOW() - fecha_envio)) / 3600
            ) ORDER BY fecha_envio DESC
        )
        FROM notificaciones_enviadas
        WHERE credito_id = p_credito_id
        LIMIT 10
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC para verificar si se puede enviar notificación (cooldown)
CREATE OR REPLACE FUNCTION puede_enviar_notificacion(
    p_credito_id UUID,
    p_horas_minimas NUMERIC DEFAULT 4
)
RETURNS JSON AS $$
DECLARE
    v_ultima_notificacion TIMESTAMP;
    v_horas_transcurridas NUMERIC;
    v_puede_enviar BOOLEAN;
    v_mensaje TEXT;
BEGIN
    -- Obtener última notificación
    SELECT MAX(fecha_envio) INTO v_ultima_notificacion
    FROM notificaciones_enviadas
    WHERE credito_id = p_credito_id
    AND estado = 'enviado';
    
    -- Si no hay notificaciones previas
    IF v_ultima_notificacion IS NULL THEN
        RETURN json_build_object(
            'puede_enviar', true,
            'mensaje', 'No se han enviado notificaciones previas',
            'ultima_notificacion', null,
            'horas_transcurridas', null
        );
    END IF;
    
    -- Calcular horas transcurridas
    v_horas_transcurridas := EXTRACT(EPOCH FROM (NOW() - v_ultima_notificacion)) / 3600;
    
    -- Verificar si cumple el cooldown
    v_puede_enviar := v_horas_transcurridas >= p_horas_minimas;
    
    IF v_puede_enviar THEN
        v_mensaje := 'Puede enviar notificación';
    ELSE
        v_mensaje := format(
            'Espere %s horas más antes de enviar otro mensaje',
            ROUND(p_horas_minimas - v_horas_transcurridas, 1)
        );
    END IF;
    
    RETURN json_build_object(
        'puede_enviar', v_puede_enviar,
        'mensaje', v_mensaje,
        'ultima_notificacion', v_ultima_notificacion,
        'horas_transcurridas', ROUND(v_horas_transcurridas, 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON TABLE notificaciones_enviadas IS 'Registro de todas las notificaciones enviadas a clientes';
COMMENT ON FUNCTION get_historial_notificaciones IS 'Obtiene el historial de notificaciones de un contrato';
COMMENT ON FUNCTION puede_enviar_notificacion IS 'Verifica si se puede enviar una notificación basado en cooldown';
