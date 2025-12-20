-- ============================================================
-- Migration: App Móvil Cobradores
-- Descripción: Tablas para tracking de cobradores en campo
-- ============================================================

-- Ubicación en tiempo real del cobrador (upsert por cobrador)
CREATE TABLE IF NOT EXISTS ubicaciones_cobradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cobrador_id UUID NOT NULL REFERENCES empleados(id),
    ubicacion JSONB NOT NULL,  -- {lat: number, lng: number}
    timestamp TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT ubicaciones_cobradores_cobrador_key UNIQUE(cobrador_id)
);

COMMENT ON TABLE ubicaciones_cobradores IS 'Última ubicación conocida de cada cobrador';

-- Registro de visitas de cobranza
CREATE TABLE IF NOT EXISTS visitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cobrador_id UUID NOT NULL REFERENCES empleados(id),
    credito_id UUID NOT NULL REFERENCES creditos(id),
    resultado VARCHAR(50) NOT NULL CHECK (resultado IN ('cobrado', 'promesa_pago', 'no_encontrado', 'rechazado')),
    monto_cobrado DECIMAL(12,2),
    ubicacion JSONB,  -- {lat: number, lng: number}
    fotos TEXT[],     -- Array de URLs de fotos
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE visitas IS 'Registro de visitas de cobranza en campo';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitas_cobrador ON visitas(cobrador_id);
CREATE INDEX IF NOT EXISTS idx_visitas_credito ON visitas(credito_id);
CREATE INDEX IF NOT EXISTS idx_visitas_resultado ON visitas(resultado);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_timestamp ON ubicaciones_cobradores(timestamp DESC);
