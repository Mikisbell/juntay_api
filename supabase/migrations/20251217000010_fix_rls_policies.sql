-- ============================================================================
-- JUNTAY API - CORRECCIÓN DE POLÍTICAS RLS (FASE 2)
-- Fecha: 2025-12-17
-- ============================================================================
-- Objetivo: 
-- 1. Normalizar roles a minúsculas ('CAJERO' -> 'cajero')
-- 2. Restringir contratos_fondeo a admin/gerente
-- 3. Bloquear inserciones directas en movimientos_caja_operativa
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. FIX: NORMALIZAR ROLES EN POLÍTICAS DE CRÉDITOS
-- ============================================================================

-- Drop política con rol en mayúsculas
DROP POLICY IF EXISTS "cajero_view_creditos" ON public.creditos;

-- Recrear con minúsculas
CREATE POLICY "cajero_view_creditos" ON public.creditos
FOR SELECT TO authenticated
USING (public.get_user_role() = 'cajero');

-- ============================================================================
-- 2. FIX: NORMALIZAR ROLES EN POLÍTICAS DE PAGOS
-- ============================================================================

DROP POLICY IF EXISTS "cajero_view_pagos" ON public.pagos;
DROP POLICY IF EXISTS "cajero_insert_pagos" ON public.pagos;

CREATE POLICY "cajero_view_pagos" ON public.pagos
FOR SELECT TO authenticated
USING (public.get_user_role() = 'cajero');

CREATE POLICY "cajero_insert_pagos" ON public.pagos
FOR INSERT TO authenticated
WITH CHECK (public.get_user_role() = 'cajero');

-- ============================================================================
-- 3. FIX: CONTRATOS_FONDEO - RESTRINGIR A ADMIN/GERENTE
-- ============================================================================

-- Eliminar política permisiva (USING true)
DROP POLICY IF EXISTS "Admin full access contratos_fondeo" ON public.contratos_fondeo;

-- Crear política restrictiva
CREATE POLICY "admin_gerente_contratos_fondeo" ON public.contratos_fondeo
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'gerente'))
WITH CHECK (public.get_user_role() IN ('admin', 'gerente'));

-- ============================================================================
-- 4. FIX: MOVIMIENTOS_CAJA_OPERATIVA - BLOQUEAR INSERCIONES DIRECTAS
-- ============================================================================

-- Eliminar política permisiva que permite a cualquier autenticado insertar
DROP POLICY IF EXISTS "movimientos_insert_authenticated" ON public.movimientos_caja_operativa;

-- Crear política que solo permite inserciones vía service_role (RPCs SECURITY DEFINER)
-- Nota: Las funciones con SECURITY DEFINER se ejecutan como el creador (service_role),
-- por lo que bypasean RLS. Esta política bloquea inserciones directas del cliente.
CREATE POLICY "movimientos_insert_service_only" ON public.movimientos_caja_operativa
FOR INSERT TO authenticated
WITH CHECK (
    -- Solo admin puede insertar directamente (para casos de emergencia)
    -- Operaciones normales deben usar RPCs
    public.get_user_role() = 'admin'
);

-- ============================================================================
-- 5. ASEGURAR CONSISTENCIA EN GET_USER_ROLE
-- ============================================================================

-- Verificar que la función devuelve minúsculas
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT LOWER(rol) INTO v_role
  FROM public.usuarios
  WHERE id = auth.uid();
  
  RETURN COALESCE(v_role, 'anon');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 6. COMENTARIOS DE AUDITORÍA
-- ============================================================================

COMMENT ON POLICY "cajero_view_creditos" ON public.creditos 
IS 'Fase 2: Cajeros pueden ver todos los créditos (para buscar y cobrar).';

COMMENT ON POLICY "cajero_view_pagos" ON public.pagos 
IS 'Fase 2: Cajeros pueden ver pagos registrados.';

COMMENT ON POLICY "cajero_insert_pagos" ON public.pagos 
IS 'Fase 2: Cajeros pueden registrar cobros.';

COMMENT ON POLICY "admin_gerente_contratos_fondeo" ON public.contratos_fondeo 
IS 'Fase 2: Solo admin y gerente pueden gestionar contratos de fondeo (información sensible de inversionistas).';

COMMENT ON POLICY "movimientos_insert_service_only" ON public.movimientos_caja_operativa 
IS 'Fase 2: Bloquea inserciones directas. Las operaciones deben usar RPCs validados.';

COMMIT;
