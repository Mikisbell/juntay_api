-- ============================================================
-- Migration: Integración Bancaria
-- Descripción: Tablas para conciliación de transacciones bancarias
-- ============================================================

-- Tabla de transacciones bancarias importadas
CREATE TABLE IF NOT EXISTS transacciones_bancarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banco VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    referencia VARCHAR(100) DEFAULT '',
    monto DECIMAL(12,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'conciliado', 'ignorado')),
    -- Campos de conciliación
    pago_relacionado_id UUID REFERENCES pagos(id),
    credito_relacionado_id UUID REFERENCES creditos(id),
    cliente_nombre VARCHAR(200),
    -- Metadata flexible
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE transacciones_bancarias IS 'Transacciones importadas de extractos bancarios para conciliación';

-- Agregar referencia inversa en pagos
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS transaccion_bancaria_id UUID REFERENCES transacciones_bancarias(id);

-- Uniqueness para evitar duplicados de importación
CREATE UNIQUE INDEX IF NOT EXISTS idx_tx_bancaria_unique 
ON transacciones_bancarias(banco, fecha, referencia, monto);

-- Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_tx_bancaria_estado ON transacciones_bancarias(estado);
CREATE INDEX IF NOT EXISTS idx_tx_bancaria_fecha ON transacciones_bancarias(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_tx_bancaria_pago ON transacciones_bancarias(pago_relacionado_id) WHERE pago_relacionado_id IS NOT NULL;
