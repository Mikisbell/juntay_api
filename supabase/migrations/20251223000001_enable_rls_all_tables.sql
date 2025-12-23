-- ============================================================================
-- Migration: Enable RLS on all public tables (FIXED V4 - FINAL)
-- Date: 2025-12-23
-- Description: Enables Row Level Security on tables that were missing it
-- FIXED V4: Final corrections based on complete schema inspection
-- ============================================================================

-- Helper function to get current user's empresa_id
CREATE OR REPLACE FUNCTION public.get_my_empresa_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()
$$;

-- 1. LOOKUP TABLES (Read-only for authenticated users)
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provincias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_parentesco ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categoria_sugerida ENABLE ROW LEVEL SECURITY;

-- Policies for lookup tables
DROP POLICY IF EXISTS "Authenticated can read departamentos" ON public.departamentos;
CREATE POLICY "Authenticated can read departamentos" ON public.departamentos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read provincias" ON public.provincias;
CREATE POLICY "Authenticated can read provincias" ON public.provincias
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read distritos" ON public.distritos;
CREATE POLICY "Authenticated can read distritos" ON public.distritos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read tipos_parentesco" ON public.tipos_parentesco;
CREATE POLICY "Authenticated can read tipos_parentesco" ON public.tipos_parentesco
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read roles" ON public.roles;
CREATE POLICY "Authenticated can read roles" ON public.roles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read categoria_sugerida" ON public.categoria_sugerida;
CREATE POLICY "Authenticated can read categoria_sugerida" ON public.categoria_sugerida
    FOR SELECT TO authenticated USING (true);


-- 2. AUDIT/SYSTEM TABLES 
ALTER TABLE public.auditoria_transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_sistema ENABLE ROW LEVEL SECURITY;

-- auditoria_transacciones: Users see records where they are the actor
DROP POLICY IF EXISTS "Tenant isolation for auditoria_transacciones" ON public.auditoria_transacciones;
CREATE POLICY "Tenant isolation for auditoria_transacciones" ON public.auditoria_transacciones
    FOR ALL TO authenticated
    USING (usuario_id = auth.uid());

-- eventos_sistema: Users see their own events
DROP POLICY IF EXISTS "Tenant isolation for eventos_sistema" ON public.eventos_sistema;
CREATE POLICY "Tenant isolation for eventos_sistema" ON public.eventos_sistema
    FOR ALL TO authenticated
    USING (usuario_id = auth.uid());


-- 3. OPERATIONAL TABLES
ALTER TABLE public.fotos_garantia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_enviadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugerencias_catalogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencias_garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones_cobradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas_remates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

-- fotos_garantia: Access through garantia -> cliente -> empresa
DROP POLICY IF EXISTS "Tenant isolation for fotos_garantia" ON public.fotos_garantia;
CREATE POLICY "Tenant isolation for fotos_garantia" ON public.fotos_garantia
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.garantias g
            JOIN public.clientes c ON g.cliente_id = c.id
            WHERE g.id = fotos_garantia.garantia_id
            AND c.empresa_id = public.get_my_empresa_id()
        )
    );

-- notificaciones_enviadas: Access through cliente -> empresa
DROP POLICY IF EXISTS "Tenant isolation for notificaciones_enviadas" ON public.notificaciones_enviadas;
CREATE POLICY "Tenant isolation for notificaciones_enviadas" ON public.notificaciones_enviadas
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clientes c
            WHERE c.id = notificaciones_enviadas.cliente_id
            AND c.empresa_id = public.get_my_empresa_id()
        )
    );

-- sugerencias_catalogos: Open to all authenticated users
DROP POLICY IF EXISTS "Authenticated can manage sugerencias_catalogos" ON public.sugerencias_catalogos;
CREATE POLICY "Authenticated can manage sugerencias_catalogos" ON public.sugerencias_catalogos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- transacciones_bancarias: Access through credito/pago -> cliente -> empresa
DROP POLICY IF EXISTS "Tenant isolation for transacciones_bancarias" ON public.transacciones_bancarias;
CREATE POLICY "Tenant isolation for transacciones_bancarias" ON public.transacciones_bancarias
    FOR ALL TO authenticated
    USING (
        (credito_relacionado_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.creditos cr
            JOIN public.clientes c ON cr.cliente_id = c.id
            WHERE cr.id = transacciones_bancarias.credito_relacionado_id
            AND c.empresa_id = public.get_my_empresa_id()
        ))
        OR
        (pago_relacionado_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.pagos p
            JOIN public.creditos cr ON p.credito_id = cr.id
            JOIN public.clientes c ON cr.cliente_id = c.id
            WHERE p.id = transacciones_bancarias.pago_relacionado_id
            AND c.empresa_id = public.get_my_empresa_id()
        ))
        OR
        (credito_relacionado_id IS NULL AND pago_relacionado_id IS NULL)
    );

-- transferencias_garantias: Access through sucursal_origen or sucursal_destino -> empresa
DROP POLICY IF EXISTS "Tenant isolation for transferencias_garantias" ON public.transferencias_garantias;
CREATE POLICY "Tenant isolation for transferencias_garantias" ON public.transferencias_garantias
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sucursales s
            WHERE s.id = transferencias_garantias.sucursal_origen_id
            AND s.empresa_id = public.get_my_empresa_id()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.sucursales s
            WHERE s.id = transferencias_garantias.sucursal_destino_id
            AND s.empresa_id = public.get_my_empresa_id()
        )
    );

-- ubicaciones_cobradores: Uses cobrador_id -> empleados -> sucursal -> empresa
DROP POLICY IF EXISTS "Tenant isolation for ubicaciones_cobradores" ON public.ubicaciones_cobradores;
CREATE POLICY "Tenant isolation for ubicaciones_cobradores" ON public.ubicaciones_cobradores
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.empleados e
            JOIN public.sucursales s ON e.sucursal_id = s.id
            WHERE e.id = ubicaciones_cobradores.cobrador_id
            AND s.empresa_id = public.get_my_empresa_id()
        )
    );

-- ventas_remates: Access through vendedor_id -> empleados -> sucursal -> empresa
DROP POLICY IF EXISTS "Tenant isolation for ventas_remates" ON public.ventas_remates;
CREATE POLICY "Tenant isolation for ventas_remates" ON public.ventas_remates
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.empleados e
            JOIN public.sucursales s ON e.sucursal_id = s.id
            WHERE e.id = ventas_remates.vendedor_id
            AND s.empresa_id = public.get_my_empresa_id()
        )
    );

-- visitas: Access through credito -> cliente -> empresa
DROP POLICY IF EXISTS "Tenant isolation for visitas" ON public.visitas;
CREATE POLICY "Tenant isolation for visitas" ON public.visitas
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.creditos cr
            JOIN public.clientes c ON cr.cliente_id = c.id
            WHERE cr.id = visitas.credito_id
            AND c.empresa_id = public.get_my_empresa_id()
        )
    );

-- ============================================================================
-- End of migration
-- ============================================================================
