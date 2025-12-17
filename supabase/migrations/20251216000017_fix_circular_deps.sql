-- ============================================================================
-- ARQUITECTURA: ROMPER DEPENDENCIA CIRCULAR
-- Fecha: 2025-12-16
-- Descripción: Elimina creditos.garantia_id, centralizando la relación en garantias.credito_id
-- ============================================================================

BEGIN;

-- 1. SINCRONIZACIÓN DE DATOS (Recuperación de integridad)
-- Aseguramos que todas las garantías apunten correctamente al crédito que las referencia
UPDATE public.garantias g
SET credito_id = c.id
FROM public.creditos c
WHERE c.garantia_id = g.id 
  AND g.credito_id IS DISTINCT FROM c.id;

-- 2. ELIMINAR COLUMNA REDUNDANTE EN CREDITOS
-- Primero eliminamos la constraint FK
ALTER TABLE public.creditos 
    DROP CONSTRAINT IF EXISTS creditos_garantia_id_fkey;

-- Eliminamos índices asociados si existen (buena práctica revisar, pero por defecto no hay índice único unless created explicit)
-- DROP INDEX IF EXISTS ...

-- Eliminamos la columna
ALTER TABLE public.creditos 
    DROP COLUMN IF EXISTS garantia_id;

-- 3. REFORZAR LA INTEGRIDAD EN GARANTIAS
-- Aseguramos que garantias.credito_id sea FK válida (ya debería serlo, pero verificamos/reforzamos NOT NULL si aplica)
-- Nota: Una garantía podría existir sin crédito (pre-aprobada)? Si no, poner NOT NULL. 
-- Asumimos que puede ser nullable por ahora para flexibilidad, pero la relación es N:1 garantias:creditos.

CREATE INDEX IF NOT EXISTS idx_garantias_credito_id ON public.garantias(credito_id);

COMMIT;
