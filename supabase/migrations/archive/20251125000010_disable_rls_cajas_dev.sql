-- Temporal: Desactivar RLS para cajas_operativas en desarrollo
-- Esto permite que las Server Actions funcionen sin problemas de autenticación
-- En producción, el RLS debe estar activo con políticas adecuadas

-- Desactivar RLS para permitir consultas en Server Actions
ALTER TABLE public.cajas_operativas DISABLE ROW LEVEL SECURITY;

-- Nota: En producción deberías crear políticas que permitan a Service Role acceder
-- O usar un client con service_role key en Server Actions
