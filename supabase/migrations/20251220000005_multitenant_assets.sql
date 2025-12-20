-- Migración: Multi-tenant Fase 3 - Garantías e Inversionistas (Fix)
-- Fecha: 2025-12-20

-- 1. GARANTIAS
-- (Columna ya existe en migración 01, solo populamos si falta)
UPDATE public.garantias g
SET empresa_id = c.empresa_id
FROM public.clientes c
WHERE g.cliente_id = c.id
AND g.empresa_id IS NULL;


-- 2. INVERSIONISTAS
-- (Columna ya existe, solo populamos default)
UPDATE public.inversionistas
SET empresa_id = (SELECT id FROM public.empresas LIMIT 1)
WHERE empresa_id IS NULL;


-- 3. CONTRATOS FONDEO
ALTER TABLE public.contratos_fondeo 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

UPDATE public.contratos_fondeo cf
SET empresa_id = i.empresa_id
FROM public.inversionistas i
WHERE cf.inversionista_id = i.id
AND cf.empresa_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_contratos_fondeo_empresa_id ON public.contratos_fondeo(empresa_id);

-- 4. TRANSACCIONES CAPITAL
ALTER TABLE public.transacciones_capital 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- FIX: Usar inversionista_id en lugar de contrato_fondeo_id
UPDATE public.transacciones_capital tc
SET empresa_id = i.empresa_id
FROM public.inversionistas i
WHERE tc.inversionista_id = i.id
AND tc.empresa_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_transacciones_capital_empresa_id ON public.transacciones_capital(empresa_id);
