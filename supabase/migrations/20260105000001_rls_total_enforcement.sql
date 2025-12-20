-- Migración: Implementación de RLS Multi-Tenant Estricto
-- Fecha: 2025-12-20
-- Descripción: Elimina políticas basadas en roles antiguas y aplica aislamiento por empresa_id.

-- ============================================================================
-- 1. UTILITIES
-- ============================================================================

-- Función 'get_user_empresa()' ya existe (creada en migración anterior).
-- Nos aseguramos que sea usada.

-- ============================================================================
-- 2. LIMPIEZA DE POLÍTICAS ANTIGUAS
-- ============================================================================
-- Eliminamos políticas que no contemplan empresa_id para evitar fugas.

DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('empresas', 'sucursales', 'usuarios', 'clientes', 'creditos', 'garantias', 'pagos', 'cajas_operativas', 'movimientos_caja_operativa', 'inversionistas', 'contratos_fondeo', 'transacciones_capital')
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename); 
    END LOOP; 
END $$;

-- ============================================================================
-- 3. APLICACIÓN DE NUEVAS POLÍTICAS DE AISLAMIENTO
-- ============================================================================

-- 3.1 EMPRESAS
-- Lectura: Solo mi propia empresa
CREATE POLICY "tenant_select_empresas" ON public.empresas
FOR SELECT USING (id = get_user_empresa());

-- 3.2 SUCURSALES
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_sucursales" ON public.sucursales
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());

-- 3.3 USUARIOS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
-- Lectura: Ver usuarios de mi empresa (y a uno mismo)
CREATE POLICY "tenant_select_usuarios" ON public.usuarios
FOR SELECT USING (empresa_id = get_user_empresa() OR id = auth.uid());
-- Modificación: Solo Admins de la misma empresa (se puede refinar luego, por ahora aislamiento de tenant)
CREATE POLICY "tenant_update_usuarios" ON public.usuarios
FOR UPDATE USING (empresa_id = get_user_empresa());

-- 3.4 CLIENTES
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_clientes" ON public.clientes
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());

-- 3.5 CREDITOS
ALTER TABLE public.creditos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_creditos" ON public.creditos
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());

-- 3.6 GARANTIAS
ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_garantias" ON public.garantias
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());

-- 3.7 PAGOS
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_pagos" ON public.pagos
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());

-- 3.8 CAJAS OPERATIVAS
ALTER TABLE public.cajas_operativas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_cajas" ON public.cajas_operativas
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());

-- 3.9 MOVIMIENTOS CAJA
ALTER TABLE public.movimientos_caja_operativa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_select_movimientos" ON public.movimientos_caja_operativa
FOR SELECT USING (empresa_id = get_user_empresa());
-- Insert: Generalmente vía RPC, pero si se hiciera directo:
CREATE POLICY "tenant_insert_movimientos" ON public.movimientos_caja_operativa
FOR INSERT WITH CHECK (empresa_id = get_user_empresa());

-- 3.10 INVERSIONISTAS
ALTER TABLE public.inversionistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_inversionistas" ON public.inversionistas
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());

-- 3.11 CONTRATOS FONDEO
ALTER TABLE public.contratos_fondeo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_contratos_fondeo" ON public.contratos_fondeo
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());

-- 3.12 TRANSACCIONES CAPITAL
ALTER TABLE public.transacciones_capital ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_all_transacciones_capital" ON public.transacciones_capital
FOR ALL USING (empresa_id = get_user_empresa()) WITH CHECK (empresa_id = get_user_empresa());


-- ============================================================================
-- 4. PERMISOS SYSTEM/SERVICE_ROLE (Excepciones)
-- ============================================================================
-- Service Role siempre tiene bypass, pero nos aseguramos que dashboard funcione
-- si usamos queries directos sin RLS en funciones administrativas futuras.
