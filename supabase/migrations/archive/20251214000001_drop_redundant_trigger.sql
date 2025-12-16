-- Migration: Drop Redundant Trigger and Function
-- Date: 2025-12-14
-- Description: Drop trg_auto_estado_credito and its function fn_actualizar_estado_credito
-- Rationale: Logic is duplicated in trigger_actualizar_estado_credito / actualizar_estado_credito which causes race conditions.
--            The remaining trigger (actualizar_estado_credito) handles state transitions more comprehensively.

BEGIN;

-- 1. Drop the redundant trigger
DROP TRIGGER IF EXISTS trg_auto_estado_credito ON public.creditos;

-- 2. Drop the redundant function
DROP FUNCTION IF EXISTS public.fn_actualizar_estado_credito;

-- 3. Verify the survivor exists (optional logic check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_actualizar_estado_credito') THEN
        RAISE NOTICE 'WARNING: trigger_actualizar_estado_credito does not exist. Ensure state logic is preserved.';
    ELSE
        RAISE NOTICE 'SUCCESS: trigger_actualizar_estado_credito is active as the single source of truth.';
    END IF;
END $$;

COMMIT;
