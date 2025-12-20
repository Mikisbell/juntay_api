-- ============================================================
-- Migration: Sucursales y Relaciones
-- Descripción: Sistema multi-sucursal para JUNTAY
-- ============================================================

-- Tabla principal de sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE sucursales IS 'Sucursales/locales del negocio';

-- Agregar sucursal_id a tablas existentes
ALTER TABLE cajas_operativas ADD COLUMN IF NOT EXISTS sucursal_id UUID REFERENCES sucursales(id);
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS sucursal_id UUID REFERENCES sucursales(id);
ALTER TABLE creditos ADD COLUMN IF NOT EXISTS sucursal_id UUID REFERENCES sucursales(id);
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS sucursal_id UUID REFERENCES sucursales(id);

-- Tabla de transferencias entre sucursales
CREATE TABLE IF NOT EXISTS transferencias_garantias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    articulo_id UUID NOT NULL,
    sucursal_origen_id UUID REFERENCES sucursales(id),
    sucursal_destino_id UUID REFERENCES sucursales(id),
    motivo TEXT,
    usuario_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE transferencias_garantias IS 'Historial de transferencias de garantías entre sucursales';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cajas_sucursal ON cajas_operativas(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_empleados_sucursal ON empleados(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_creditos_sucursal ON creditos(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_pagos_sucursal ON pagos(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_articulo ON transferencias_garantias(articulo_id);

-- Sucursal por defecto (principal)
INSERT INTO sucursales (codigo, nombre, direccion, activa)
VALUES ('PRINCIPAL', 'Sucursal Principal', 'Dirección Principal', true)
ON CONFLICT (codigo) DO NOTHING;
