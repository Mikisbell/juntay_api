-- ============================================================================
-- Tabla: audit_log
-- Registro de auditoría para cambios críticos en el sistema
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla TEXT NOT NULL,
    registro_id UUID NOT NULL,
    accion TEXT NOT NULL,
    usuario_id UUID REFERENCES auth.users(id),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla ON audit_log(tabla);
CREATE INDEX IF NOT EXISTS idx_audit_log_registro ON audit_log(registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Comentarios
COMMENT ON TABLE audit_log IS 'Registro de auditoría para cambios críticos del sistema';

-- ============================================================================
-- Tabla: notificaciones_pendientes
-- Notificaciones pendientes de enviar/procesar (excedentes, vencimientos, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notificaciones_pendientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id),
    credito_id UUID REFERENCES creditos(id),
    tipo TEXT NOT NULL, -- EXCEDENTE_REMATE, VENCIMIENTO, etc.
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    monto NUMERIC(12,2),
    telefono TEXT,
    email TEXT,
    estado TEXT DEFAULT 'pendiente', -- pendiente, enviado, recogido
    fecha_envio TIMESTAMPTZ,
    fecha_procesado TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notif_cliente ON notificaciones_pendientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notif_estado ON notificaciones_pendientes(estado);
CREATE INDEX IF NOT EXISTS idx_notif_tipo ON notificaciones_pendientes(tipo);

-- RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_pendientes ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidad)
CREATE POLICY "Admins can read audit_log" ON audit_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'super_admin'))
    );

CREATE POLICY "Authenticated users can insert audit_log" ON audit_log
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage notificaciones" ON notificaciones_pendientes
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Comentarios
COMMENT ON TABLE notificaciones_pendientes IS 'Notificaciones pendientes como excedentes de remate o vencimientos';
