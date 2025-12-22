-- Migración: Corrección de Políticas RLS Multi-Tenant
-- Fecha: 2025-12-22
-- Descripción: Corrige gaps de RLS identificados en auditoría.

-- ============================================================================
-- 1. CUENTAS_FINANCIERAS: Cambiar de Rol-Based a Tenant-Based
-- ============================================================================
DROP POLICY IF EXISTS "admin_all_cuentas" ON public.cuentas_financieras;

CREATE POLICY "tenant_all_cuentas" ON public.cuentas_financieras
FOR ALL USING (empresa_id = get_user_empresa()) 
WITH CHECK (empresa_id = get_user_empresa());


-- ============================================================================
-- 2. EMPLEADOS: Añadir empresa_id y RLS
-- ============================================================================
-- 2.1 Agregar columna empresa_id si no existe
ALTER TABLE public.empleados 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- 2.2 Poblar empresa_id desde sucursal_id
UPDATE public.empleados e
SET empresa_id = s.empresa_id
FROM public.sucursales s
WHERE e.sucursal_id = s.id
AND e.empresa_id IS NULL;

-- 2.3 Crear índice
CREATE INDEX IF NOT EXISTS idx_empleados_empresa_id ON public.empleados(empresa_id);

-- 2.4 Habilitar RLS y crear política
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_all_empleados" ON public.empleados;
CREATE POLICY "tenant_all_empleados" ON public.empleados
FOR ALL USING (empresa_id = get_user_empresa()) 
WITH CHECK (empresa_id = get_user_empresa());


-- ============================================================================
-- 3. CATEGORIAS_GARANTIA: Catálogo Global (Sin cambio, RLS no aplica)
-- ============================================================================
-- Nota: Esta es una tabla de catálogo/referencia que NO contiene datos de tenant.
-- El LTV por categoría es estándar para todas las empresas.
-- Por tanto, se permite lectura global pero escritura solo para service_role/admin.

ALTER TABLE public.categorias_garantia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_global_categorias" ON public.categorias_garantia;
CREATE POLICY "read_global_categorias" ON public.categorias_garantia
FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE requieren service_role (no policy = denied for anon/authenticated)


-- ============================================================================
-- 4. PERSONAS: Tabla Compartida (Sin tenant, FK desde otras tablas)
-- ============================================================================
-- Nota: La tabla `personas` almacena datos de identidad (DNI, nombres).
-- Los mismos datos de persona pueden ser referenciados por clientes de distintos tenants.
-- RLS se aplica en las tablas que referencian (clientes, empleados), no aquí.
-- Para seguridad, restringimos SELECT a usuarios autenticados.

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_personas" ON public.personas;
CREATE POLICY "authenticated_select_personas" ON public.personas
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "authenticated_insert_personas" ON public.personas;
CREATE POLICY "authenticated_insert_personas" ON public.personas
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE/DELETE solo para service_role (corrección de datos maestros)
