
-- ============================================================================
-- JUNTAY API - FIX SCHEMA (METADATA)
-- Fecha: 2025-12-16
-- Descripción: Agrega columna metadata a transacciones_capital para trazabilidad detallada.
-- ============================================================================

BEGIN;

ALTER TABLE public.transacciones_capital 
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.transacciones_capital.metadata IS 'Datos adicionales estructurados (ej: IDs de referencia, snapshots)';

COMMIT;
