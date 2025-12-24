-- Migration to fix RLS and permissions
-- 1. Ensure RLS is enabled
-- 2. Create permissive policies for authenticated users (or company based)
-- 3. Grant SELECT rights

BEGIN;

-- Contratos Fondeo
ALTER TABLE public.contratos_fondeo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.contratos_fondeo;
CREATE POLICY "Enable read access for authenticated users"
ON public.contratos_fondeo
FOR SELECT
TO authenticated
USING (true); -- Por ahora broad, luego restringir por empresa_id

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.contratos_fondeo;
CREATE POLICY "Enable write access for authenticated users"
ON public.contratos_fondeo
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- Cronograma
ALTER TABLE public.cronograma_pagos_fondeo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cronograma_pagos_fondeo;
CREATE POLICY "Enable read access for authenticated users"
ON public.cronograma_pagos_fondeo
FOR SELECT
TO authenticated
USING (true);

-- Vista permissions
GRANT SELECT ON public.vista_inversionistas_profesional TO authenticated;

COMMIT;
