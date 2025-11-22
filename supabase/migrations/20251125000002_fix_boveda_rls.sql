-- Agregar políticas más permisivas para desarrollo
-- IMPORTANTE: En producción, mantener políticas estrictas basadas en roles

-- Permitir SELECT a usuarios autenticados (temporal para desarrollo)
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer bóveda" ON public.boveda_central;
CREATE POLICY "Usuarios autenticados pueden leer bóveda" 
ON public.boveda_central 
FOR SELECT 
TO authenticated
USING (true);

-- Permitir operaciones completas a service_role (para RPCs SECURITY DEFINER)
DROP POLICY IF EXISTS "Service role tiene acceso completo" ON public.boveda_central;
CREATE POLICY "Service role tiene acceso completo" 
ON public.boveda_central 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Comentario
COMMENT ON TABLE public.boveda_central IS 'SINGLETON: Bóveda central. Políticas permisivas para desarrollo.';
