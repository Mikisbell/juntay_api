-- Tabla para códigos de verificación de WhatsApp
CREATE TABLE IF NOT EXISTS verificacion_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telefono VARCHAR(9) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    expira_en TIMESTAMPTZ NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    creado_por UUID REFERENCES auth.users(id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_verificacion_telefono ON verificacion_whatsapp(telefono);
CREATE INDEX IF NOT EXISTS idx_verificacion_expira ON verificacion_whatsapp(expira_en);
CREATE INDEX IF NOT EXISTS idx_verificacion_codigo ON verificacion_whatsapp(telefono, codigo) WHERE verificado = FALSE;

-- RLS: Permitir todas las operaciones (las Server Actions usan Service Role Key)
ALTER TABLE verificacion_whatsapp ENABLE ROW LEVEL SECURITY;

-- Policy permisiva para Service Role (que es quien hace las operaciones)
CREATE POLICY "Service role can do everything" ON verificacion_whatsapp
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Función para limpiar códigos expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION limpiar_codigos_expirados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM verificacion_whatsapp
    WHERE expira_en < NOW() - INTERVAL '1 hour';
END;
$$;

-- Documentación en Base de Datos (Code Layer)
COMMENT ON TABLE verificacion_whatsapp IS 'Almacena códigos OTP para validación de teléfonos vía WhatsApp.';
COMMENT ON COLUMN verificacion_whatsapp.telefono IS 'Número de teléfono (9 dígitos) sin prefijo de país.';
COMMENT ON COLUMN verificacion_whatsapp.codigo IS 'Código numérico de 6 dígitos generado aleatoriamente.';
COMMENT ON COLUMN verificacion_whatsapp.expira_en IS 'Timestamp de expiración (usualmente 5 min desde creación).';
COMMENT ON COLUMN verificacion_whatsapp.verificado IS 'Flag que indica si el código ya fue canjeado exitosamente.';

