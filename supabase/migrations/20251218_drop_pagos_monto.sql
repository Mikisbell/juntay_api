-- Migración: Limpieza de columnas legacy
-- Fecha: 2025-12-18
-- Descripción: Eliminar columna 'monto' de pagos que no se usa (reemplazada por monto_total)

-- 1. Eliminar columna legacy de pagos
ALTER TABLE public.pagos DROP COLUMN IF EXISTS monto;

COMMENT ON TABLE public.pagos IS 'Tabla de pagos. Columnas desglose_capital/interes/mora para desgloses.';
