-- ============================================================================
-- FIX: RLS Policies for movimientos_caja_operativa
-- 
-- Problem: RLS was enabled but no INSERT/SELECT policies existed for 
-- authenticated users, causing "error al registrar egreso"
-- ============================================================================

-- Policy 1: Usuarios autenticados pueden insertar movimientos
CREATE POLICY "movimientos_insert_authenticated"
ON public.movimientos_caja_operativa
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Usuarios pueden ver movimientos de su propia caja
CREATE POLICY "movimientos_select_own_caja"
ON public.movimientos_caja_operativa
FOR SELECT
TO authenticated
USING (
    caja_operativa_id IN (
        SELECT id FROM public.cajas_operativas 
        WHERE usuario_id = auth.uid()
    )
);

-- Policy 3: Admins pueden ver todos los movimientos
CREATE POLICY "movimientos_select_admin"
ON public.movimientos_caja_operativa
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios 
        WHERE id = auth.uid() AND rol IN ('admin', 'gerente')
    )
);

-- Comentario de auditoría
COMMENT ON POLICY "movimientos_insert_authenticated" ON public.movimientos_caja_operativa 
IS 'Permite a usuarios autenticados insertar movimientos de caja. El control de acceso es validado en código.';
