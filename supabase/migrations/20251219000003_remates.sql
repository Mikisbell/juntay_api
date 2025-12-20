-- ============================================================
-- Migration: Módulo de Remates
-- Descripción: Sistema de venta de artículos en remate
-- ============================================================

-- Agregar columnas necesarias a garantias
ALTER TABLE garantias ADD COLUMN IF NOT EXISTS para_remate BOOLEAN DEFAULT false;
ALTER TABLE garantias ADD COLUMN IF NOT EXISTS valor_tasado DECIMAL(12,2);

-- Copiar valor_tasacion a valor_tasado si está vacío
UPDATE garantias SET valor_tasado = valor_tasacion WHERE valor_tasado IS NULL AND valor_tasacion IS NOT NULL;

-- Tabla de ventas de remates
CREATE TABLE IF NOT EXISTS ventas_remates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    articulo_id UUID NOT NULL REFERENCES garantias(id),
    precio_venta DECIMAL(12,2) NOT NULL,
    valor_original DECIMAL(12,2),
    utilidad DECIMAL(12,2),
    comprador VARCHAR(200),
    comprador_telefono VARCHAR(20),
    metodo_pago VARCHAR(50),
    vendedor_id UUID REFERENCES empleados(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE ventas_remates IS 'Registro de ventas de artículos en remate';

-- Índices
CREATE INDEX IF NOT EXISTS idx_ventas_remates_fecha ON ventas_remates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_remates_vendedor ON ventas_remates(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_remates_articulo ON ventas_remates(articulo_id);
CREATE INDEX IF NOT EXISTS idx_garantias_remate ON garantias(para_remate) WHERE para_remate = true;

-- Vista "inventario" como alias de garantías para compatibilidad con actions
CREATE OR REPLACE VIEW inventario AS
SELECT 
    id,
    descripcion,
    categoria,
    subcategoria,
    valor_tasacion AS valor_tasado,
    estado,
    fotos,
    metadata,
    para_remate,
    cliente_id,
    credito_id,
    created_at
FROM garantias;

COMMENT ON VIEW inventario IS 'Vista de compatibilidad: alias de garantias para módulo de remates';
