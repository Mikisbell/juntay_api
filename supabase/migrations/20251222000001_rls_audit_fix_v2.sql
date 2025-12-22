-- Migración: Corrección de Políticas RLS (Sin columnas redundantes)
-- Fecha: 2025-12-22
-- Descripción: Aplica RLS a tablas faltantes respetando arquitectura existente.
--              Usa JOINs para derivar empresa_id cuando no existe columna directa.

-- ============================================================================
-- 1. CUENTAS_FINANCIERAS: Cambiar de Rol-Based a Tenant-Based
-- ============================================================================
-- Esta tabla YA tiene empresa_id (migración 20251220000001), solo falta política correcta.
DROP POLICY IF EXISTS "admin_all_cuentas" ON public.cuentas_financieras;

CREATE POLICY "tenant_all_cuentas" ON public.cuentas_financieras
FOR ALL USING (empresa_id = get_user_empresa()) 
WITH CHECK (empresa_id = get_user_empresa());


-- ============================================================================
-- 2. EMPLEADOS: RLS via JOIN con sucursales (SIN columna redundante)
-- ============================================================================
-- Empleados tiene sucursal_id -> sucursales.empresa_id
-- Creamos política que deriva empresa_id via subconsulta

ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;

-- Helper function para obtener empresa_id de empleado via sucursal
CREATE OR REPLACE FUNCTION public.get_empleado_empresa(p_sucursal_id UUID)
RETURNS UUID AS $$
  SELECT empresa_id FROM public.sucursales WHERE id = p_sucursal_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "tenant_all_empleados" ON public.empleados;
CREATE POLICY "tenant_all_empleados" ON public.empleados
FOR ALL USING (
    get_empleado_empresa(sucursal_id) = get_user_empresa()
) WITH CHECK (
    get_empleado_empresa(sucursal_id) = get_user_empresa()
);

-- Índice para performance de subconsulta
CREATE INDEX IF NOT EXISTS idx_empleados_sucursal_id ON public.empleados(sucursal_id);


-- ============================================================================
-- 3. CATEGORIAS_GARANTIA: Catálogo Global (Lectura pública)
-- ============================================================================
-- Esta tabla NO tiene empresa_id porque es catálogo de referencia estandarizado.
-- Permitimos lectura a usuarios autenticados, escritura solo service_role.

ALTER TABLE public.categorias_garantia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_global_categorias" ON public.categorias_garantia;
CREATE POLICY "read_global_categorias" ON public.categorias_garantia
FOR SELECT USING (auth.uid() IS NOT NULL);


-- ============================================================================
-- 4. PERSONAS: Tabla Maestra Compartida
-- ============================================================================
-- La tabla personas centraliza datos de identidad.
-- Una misma persona puede ser cliente de múltiples empresas (diferente RUC).
-- RLS se aplica en las tablas hijas (clientes, empleados, inversionistas).
-- Aquí solo restringimos a usuarios autenticados.

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_personas" ON public.personas;
CREATE POLICY "authenticated_select_personas" ON public.personas
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_insert_personas" ON public.personas;
CREATE POLICY "authenticated_insert_personas" ON public.personas
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE solo vía service_role para datos maestros
