-- ============================================================================
-- Migration: Fix empleados RLS to allow self-read by user_id
-- Date: 2025-12-24
-- Description: The current RLS policy only checks empresa via sucursal_id,
--              which fails when a user queries their own empleado record
--              by user_id. This adds a self-read clause.
-- ============================================================================

-- 1. Drop the existing policy
DROP POLICY IF EXISTS "tenant_all_empleados" ON public.empleados;

-- 2. Create improved policy with self-read capability
-- A user can:
--   a) Read their OWN empleado record (by user_id = auth.uid())
--   b) Read/write empleados in their empresa (via sucursal_id -> empresa)
CREATE POLICY "tenant_empleados_with_self_read" ON public.empleados
FOR ALL USING (
    -- Self-read: Users can always see their own empleado record
    user_id = auth.uid()
    OR
    -- Tenant isolation: Users can see empleados in their empresa
    (sucursal_id IS NOT NULL AND get_empleado_empresa(sucursal_id) = get_user_empresa())
)
WITH CHECK (
    -- For writes, require tenant match (can't create empleado in another empresa)
    sucursal_id IS NOT NULL 
    AND get_empleado_empresa(sucursal_id) = get_user_empresa()
);

-- 3. Ensure the helper function exists and is correct
CREATE OR REPLACE FUNCTION public.get_empleado_empresa(p_sucursal_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT empresa_id FROM public.sucursales WHERE id = p_sucursal_id
$$;

-- 4. Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_empleado_empresa(uuid) TO authenticated;

-- ============================================================================
-- VERIFICATION: Test cases this policy satisfies:
-- 1. User A can read their own empleado record via user_id
-- 2. User A can read all empleados in their empresa via sucursal
-- 3. User A CANNOT read empleados from empresa B
-- 4. User A CANNOT insert empleado into empresa B
-- ============================================================================
