-- ============================================================================
-- JUNTAY API - MIGRACIÓN: MULTI-TENANT FOUNDATION
-- Fecha: 2025-12-20
-- Objetivo: Agregar empresa_id a tablas que son pre-requisito para multi-tenant
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. AGREGAR empresa_id A SUCURSALES (CRÍTICO)
-- ============================================================================
-- La tabla sucursales existe pero NO está vinculada a empresas.
-- Esto es crítico porque sucursal es la base de la jerarquía multi-tenant.

ALTER TABLE public.sucursales 
    ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- Para sucursales existentes, asignar la primera empresa como default
UPDATE public.sucursales 
SET empresa_id = (SELECT id FROM public.empresas LIMIT 1)
WHERE empresa_id IS NULL;

-- Agregar columna es_principal si no existe
ALTER TABLE public.sucursales 
    ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT FALSE;

-- Marcar la sucursal PRINCIPAL como es_principal = true
UPDATE public.sucursales 
SET es_principal = TRUE 
WHERE codigo = 'PRINCIPAL' AND es_principal = FALSE;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_sucursales_empresa 
    ON public.sucursales(empresa_id);

COMMENT ON COLUMN public.sucursales.empresa_id IS 'Empresa a la que pertenece esta sucursal. Base del multi-tenant.';
COMMENT ON COLUMN public.sucursales.es_principal IS 'True si es la sucursal principal de la empresa.';

-- ============================================================================
-- 2. AGREGAR empresa_id A CUENTAS_FINANCIERAS
-- ============================================================================

ALTER TABLE public.cuentas_financieras 
    ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- Asignar empresa default a cuentas existentes
UPDATE public.cuentas_financieras 
SET empresa_id = (SELECT id FROM public.empresas LIMIT 1)
WHERE empresa_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_cuentas_empresa 
    ON public.cuentas_financieras(empresa_id);

-- ============================================================================
-- 3. AGREGAR empresa_id A INVERSIONISTAS
-- ============================================================================

ALTER TABLE public.inversionistas 
    ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

UPDATE public.inversionistas 
SET empresa_id = (SELECT id FROM public.empresas LIMIT 1)
WHERE empresa_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_inversionistas_empresa 
    ON public.inversionistas(empresa_id);

-- ============================================================================
-- 4. AGREGAR empresa_id A GARANTIAS
-- ============================================================================

ALTER TABLE public.garantias 
    ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- Para garantías existentes, obtener empresa vía cliente
UPDATE public.garantias g
SET empresa_id = c.empresa_id
FROM public.clientes c
WHERE g.cliente_id = c.id AND g.empresa_id IS NULL;

-- Si aún hay NULL (garantías huérfanas), asignar default
UPDATE public.garantias 
SET empresa_id = (SELECT id FROM public.empresas LIMIT 1)
WHERE empresa_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_garantias_empresa 
    ON public.garantias(empresa_id);

-- ============================================================================
-- 5. FUNCIÓN HELPER: get_user_empresa()
-- ============================================================================
-- Devuelve el empresa_id del usuario autenticado. 
-- Usada en RLS policies para aislamiento multi-tenant.

CREATE OR REPLACE FUNCTION public.get_user_empresa()
RETURNS uuid AS $$
DECLARE
  v_empresa_id uuid;
BEGIN
  SELECT empresa_id INTO v_empresa_id
  FROM public.usuarios
  WHERE id = auth.uid();
  
  RETURN v_empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_empresa() 
IS 'Retorna el empresa_id del usuario autenticado. Base para RLS multi-tenant.';

-- ============================================================================
-- 6. COMENTARIOS DE AUDITORÍA
-- ============================================================================

COMMENT ON TABLE public.sucursales 
IS 'Sucursales/locales del negocio. Cada sucursal pertenece a una empresa (multi-tenant).';

COMMIT;
