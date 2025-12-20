-- ============================================================
-- Migration: Fotos de Garantías
-- Descripción: Tabla normalizada para galería de fotos de artículos
-- ============================================================

-- Tabla de fotos separada para mejor gestión
CREATE TABLE IF NOT EXISTS fotos_garantia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garantia_id UUID NOT NULL REFERENCES garantias(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) DEFAULT 'foto' CHECK (tipo IN ('foto', 'documento', 'tasacion')),
    es_principal BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE fotos_garantia IS 'Galería de fotos de garantías/artículos';

-- Índices
CREATE INDEX IF NOT EXISTS idx_fotos_garantia ON fotos_garantia(garantia_id);
CREATE INDEX IF NOT EXISTS idx_fotos_principal ON fotos_garantia(garantia_id, es_principal) WHERE es_principal = true;

-- Trigger para asegurar solo una foto principal por garantía
CREATE OR REPLACE FUNCTION ensure_single_principal_foto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_principal = true THEN
        UPDATE fotos_garantia 
        SET es_principal = false 
        WHERE garantia_id = NEW.garantia_id 
          AND id != NEW.id 
          AND es_principal = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_principal_foto ON fotos_garantia;
CREATE TRIGGER trigger_single_principal_foto
    BEFORE INSERT OR UPDATE ON fotos_garantia
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_principal_foto();
