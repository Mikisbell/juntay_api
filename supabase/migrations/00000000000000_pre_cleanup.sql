-- ============================================================================
-- PRE-MIGRATION: Limpiar funciones con firmas conflictivas
-- Ejecutar ANTES de las migraciones normales en Supabase Cloud
-- ============================================================================

-- Primero eliminar vistas dependientes
DROP VIEW IF EXISTS public.cajas_activas CASCADE;
DROP VIEW IF EXISTS public.clientes_completo CASCADE;
DROP VIEW IF EXISTS public.empleados_completo CASCADE;
DROP VIEW IF EXISTS public.inventario CASCADE;

-- Drop funciones que pueden tener firmas diferentes en Supabase cloud
DROP FUNCTION IF EXISTS public.calcular_saldo_caja(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calcular_saldo_caja(p_caja_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calcular_saldo_caja(p_caja_operativa_id uuid) CASCADE;

-- Otras funciones que podrían existir con diferentes firmas
DROP FUNCTION IF EXISTS public.cerrar_caja_oficial(uuid, numeric, text) CASCADE;
DROP FUNCTION IF EXISTS public.cerrar_caja_oficial(p_caja_id uuid, p_saldo_fisico numeric, p_observaciones text) CASCADE;

-- Notificar que la limpieza se completó
DO $$
BEGIN
  RAISE NOTICE 'Pre-migration cleanup completed successfully';
END $$;
