-- ============================================================================
-- LIMPIEZA: ELIMINAR TABLAS LEGACY
-- Fecha: 2025-12-16
-- Descripción: Elimina boveda_central y tablas satélites ya migradas a Cuentas Financieras
-- ============================================================================

BEGIN;

-- 1. Verificar si hay saldo remanente (si no se migró antes)
-- Ya se migró en 20251216000014_contratos_fondeo.sql (o 03_module_capital)
-- Solo procedemos a borrar.

DROP TABLE IF EXISTS public.movimientos_boveda_auditoria CASCADE;
DROP TABLE IF EXISTS public.boveda_central CASCADE;

COMMIT;
