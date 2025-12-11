-- Migración: Añadir columna observaciones_cierre a cajas_operativas
-- Requerida por la función cerrar_caja_oficial

ALTER TABLE public.cajas_operativas 
ADD COLUMN IF NOT EXISTS observaciones_cierre TEXT;

COMMENT ON COLUMN public.cajas_operativas.observaciones_cierre IS 'Notas del cajero al cerrar turno (diferencias, incidencias, etc.)';
