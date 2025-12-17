
-- ============================================================================
-- JUNTAY API - SECURITY LOCKDOWN (MIGRACIÓN 012)
-- ============================================================================
-- Objetivo: Cerrar brechas de seguridad (RLS) en todas las tablas sensibles.

BEGIN;

-- 0. Función Helper para chequear rol (si no existe)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  -- Opción A: Leer de Custom Claims (Más rápido, requiere auth hook)
  -- Opción B: Leer de tabla usuarios (Más lento pero sin configuración extra)
  SELECT rol::text INTO v_role FROM public.usuarios WHERE id = auth.uid();
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 1. TABLA: CUENTAS FINANCIERAS (Bóvedas y Bancos)
-- ============================================================================
ALTER TABLE public.cuentas_financieras ENABLE ROW LEVEL SECURITY;

-- Policy: Admin ve todo
DROP POLICY IF EXISTS "admin_all_cuentas" ON public.cuentas_financieras;
CREATE POLICY "admin_all_cuentas" ON public.cuentas_financieras
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'gerente'));

-- Policy: Cajero NO VE NADA (Default Deny implícito al no haber policy para él)

-- ============================================================================
-- 2. TABLA: TRANSACCIONES CAPITAL (Ledger)
-- ============================================================================
ALTER TABLE public.transacciones_capital ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_tx" ON public.transacciones_capital;
CREATE POLICY "admin_all_tx" ON public.transacciones_capital
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'gerente'));

-- ============================================================================
-- 3. TABLA: CAJAS OPERATIVAS
-- ============================================================================
ALTER TABLE public.cajas_operativas ENABLE ROW LEVEL SECURITY;

-- Admin: Todo
DROP POLICY IF EXISTS "admin_all_cajas" ON public.cajas_operativas;
CREATE POLICY "admin_all_cajas" ON public.cajas_operativas
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'gerente'));

-- Cajero: Solo su caja
DROP POLICY IF EXISTS "cajero_own_caja" ON public.cajas_operativas;
CREATE POLICY "cajero_own_caja" ON public.cajas_operativas
FOR SELECT TO authenticated
USING (usuario_id = auth.uid());

-- Cajero: Update (Solo via RPC, pero permitimos update de estado si fuera necesario por front directo, restringido)
-- Preferiblemente restringir UPDATE a RPC, pero si el front modifica 'estado' para cerrar:
CREATE POLICY "cajero_close_own_caja" ON public.cajas_operativas
FOR UPDATE TO authenticated
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid()); -- No puede transferir la caja a otro

-- ============================================================================
-- 4. TABLA: PAGOS (Cobranza)
-- ============================================================================
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- Admin: Todo
DROP POLICY IF EXISTS "admin_all_pagos" ON public.pagos;
CREATE POLICY "admin_all_pagos" ON public.pagos
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'gerente'));

-- Cajero: Ver todos (necesita historial para cobrar?) -> Sí, ver pagos del crédito.
DROP POLICY IF EXISTS "cajero_view_pagos" ON public.pagos;
CREATE POLICY "cajero_view_pagos" ON public.pagos
FOR SELECT TO authenticated
USING (public.get_user_role() = 'CAJERO');

-- Cajero: Insertar (Cobrar)
DROP POLICY IF EXISTS "cajero_insert_pagos" ON public.pagos;
CREATE POLICY "cajero_insert_pagos" ON public.pagos
FOR INSERT TO authenticated
WITH CHECK (public.get_user_role() = 'CAJERO'); -- Solo rol cajero puede insertar aqui explícitamente

-- Cajero: DELETE PROHIBIDO (No creamos policy DELETE, así que default es Deny)

-- ============================================================================
-- 5. TABLA: CREDITOS (Cartera)
-- ============================================================================
ALTER TABLE public.creditos ENABLE ROW LEVEL SECURITY;

-- Admin: Todo
DROP POLICY IF EXISTS "admin_all_creditos" ON public.creditos;
CREATE POLICY "admin_all_creditos" ON public.creditos
FOR ALL TO authenticated
USING (public.get_user_role() IN ('admin', 'gerente'));

-- Cajero: Ver todos (Para buscar clientes y cobrar)
DROP POLICY IF EXISTS "cajero_view_creditos" ON public.creditos;
CREATE POLICY "cajero_view_creditos" ON public.creditos
FOR SELECT TO authenticated
USING (public.get_user_role() = 'CAJERO');

-- COMMIT FINAL
COMMIT;
