-- Migración: Multi-tenant Fase 2 - Tablas Financieras y Operativas
-- Fecha: 2026-01-02 (Simulado Q1 2026)

-- 1. CAJAS OPERATIVAS (Fundamental para todo movimiento)
ALTER TABLE public.cajas_operativas 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- Pupular empresa_id basado en la sucursal
UPDATE public.cajas_operativas c
SET empresa_id = s.empresa_id
FROM public.sucursales s
WHERE c.sucursal_id = s.id
AND c.empresa_id IS NULL;

-- Hacer obligatorio si ya existen datos garantizados (opcional, mejor dejar nullable por ahora y validar luego)
-- ALTER TABLE public.cajas_operativas ALTER COLUMN empresa_id SET NOT NULL;


-- 2. PAGOS (Crítico)
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- Popular pagos vía credito -> cliente -> empresa
UPDATE public.pagos p
SET empresa_id = c.empresa_id
FROM public.creditos cr
JOIN public.clientes c ON cr.cliente_id = c.id
WHERE p.credito_id = cr.id
AND p.empresa_id IS NULL;


-- 3. MOVIMIENTOS CAJA OPERATIVA
ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- Popular vía caja operativa (que acabamos de actualizar arriba)
UPDATE public.movimientos_caja_operativa m
SET empresa_id = c.empresa_id
FROM public.cajas_operativas c
WHERE m.caja_id = c.id
AND m.empresa_id IS NULL;


-- 4. INDICES (Para performance de RLS)
CREATE INDEX IF NOT EXISTS idx_cajas_operativas_empresa_id ON public.cajas_operativas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pagos_empresa_id ON public.pagos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_empresa_id ON public.movimientos_caja_operativa(empresa_id);


-- 5. FUNCTION GET_USER_EMPRESA (Mejorada para manejar nulos)
CREATE OR REPLACE FUNCTION public.get_user_empresa()
RETURNS UUID AS $$
DECLARE
  v_empresa_id UUID;
BEGIN
  -- Intenta obtener del JWT metadata
  SELECT (auth.jwt() ->> 'empresa_id')::UUID INTO v_empresa_id;
  
  -- Si no está en JWT, buscar en tabla usuarios
  IF v_empresa_id IS NULL THEN
    SELECT empresa_id INTO v_empresa_id
    FROM public.usuarios
    WHERE id = auth.uid();
  END IF;

  RETURN v_empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
