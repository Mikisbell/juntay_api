-- SOLUCIÓN TEMPORAL: Desactivar RLS en boveda_central para desarrollo
-- Esto permite acceso sin restricciones mientras se soluciona el tema de Docker

-- Desactivar RLS temporalmente
ALTER TABLE public.boveda_central DISABLE ROW LEVEL SECURITY;

-- Comentario
COMMENT ON TABLE public.boveda_central IS 'SINGLETON: Bóveda central. RLS DESACTIVADO para desarrollo.';
