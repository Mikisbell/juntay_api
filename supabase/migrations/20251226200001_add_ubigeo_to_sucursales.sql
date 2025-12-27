-- ============================================================
-- Migration: Add Ubigeo to Sucursales
-- Descripción: Añade geolocalización (Dpto/Prov/Distrito) a sucursales
-- Patrón: Híbrido (código INEI + nombres desnormalizados)
-- ============================================================

-- 1. Añadir columna ubigeo_cod (código INEI de 6 dígitos)
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS ubigeo_cod VARCHAR(6);

-- 2. Añadir columnas de nombres (para display sin JOINs)
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS departamento VARCHAR(50);

ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS provincia VARCHAR(50);

ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS distrito VARCHAR(50);

-- 3. Comentarios explicativos
COMMENT ON COLUMN public.sucursales.ubigeo_cod IS 'Código INEI de 6 dígitos del distrito (DDPPDD)';
COMMENT ON COLUMN public.sucursales.departamento IS 'Nombre del departamento (desnormalizado para display)';
COMMENT ON COLUMN public.sucursales.provincia IS 'Nombre de la provincia (desnormalizado para display)';
COMMENT ON COLUMN public.sucursales.distrito IS 'Nombre del distrito (desnormalizado para display)';

-- 4. Índice para reportes por ubicación
CREATE INDEX IF NOT EXISTS idx_sucursales_ubigeo ON public.sucursales(ubigeo_cod);

-- 5. Actualizar sucursales existentes con datos por defecto (Lima Centro: 150101)
UPDATE public.sucursales 
SET 
    ubigeo_cod = '150101',
    departamento = 'Lima',
    provincia = 'Lima',
    distrito = 'Cercado de Lima'
WHERE ubigeo_cod IS NULL OR departamento IS NULL;
