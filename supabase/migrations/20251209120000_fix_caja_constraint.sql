-- Fix incorrect UNIQUE constraint on cajas_operativas
-- The original constraint UNIQUE(usuario_id, estado) prevents multiple closed boxes (history).
-- We only want to ensure a user has AT MOST ONE open box at a time.

-- 1. Drop the problematic constraint
ALTER TABLE public.cajas_operativas 
DROP CONSTRAINT IF EXISTS cajas_operativas_usuario_id_estado_key;

-- 2. Create a partial unique index validation
-- This ensures uniqueness only for active/open boxes
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_caja 
ON public.cajas_operativas (usuario_id) 
WHERE estado = 'abierta';

-- Note: 'abierta' is the state for an active box. 'cerrada' is for history.
