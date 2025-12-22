-- FORCE ENABLE RLS ON EMPRESAS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Ensure policy exists (idempotent check)
DROP POLICY IF EXISTS "tenant_select_empresas" ON public.empresas;
CREATE POLICY "tenant_select_empresas" ON public.empresas
FOR SELECT USING (id = get_user_empresa());
