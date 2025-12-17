-- ============================================================================
-- JUNTAY API - MÓDULO CONTRATOS DE FONDEO (Inversión Estructurada)
-- Fecha: 2025-12-16
-- Descripción: Implementa contratos de inversión con distinción entre 
--              DEUDA_FIJA (prestamistas) y PARTICIPACION_EQUITY (socios).
--              Basado en design_proposal_investors.md
-- ============================================================================

BEGIN;

-- 1. ENUM PARA TIPOS DE CONTRATO
DO $$ BEGIN
    CREATE TYPE public.tipo_contrato_fondeo AS ENUM ('DEUDA_FIJA', 'PARTICIPACION_EQUITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.frecuencia_pago_fondeo AS ENUM ('SEMANAL', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL', 'AL_VENCIMIENTO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.estado_contrato_fondeo AS ENUM ('ACTIVO', 'PAUSADO', 'LIQUIDADO', 'CANCELADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA PRINCIPAL: CONTRATOS DE FONDEO
CREATE TABLE IF NOT EXISTS public.contratos_fondeo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación con inversionista (quien aporta el capital)
    inversionista_id UUID NOT NULL REFERENCES public.inversionistas(id) ON DELETE RESTRICT,
    
    -- Tipo de contrato determina cómo se calculan los rendimientos
    tipo public.tipo_contrato_fondeo NOT NULL,
    
    -- Términos financieros
    monto_pactado NUMERIC(15,2) NOT NULL CHECK (monto_pactado > 0),
    tasa_retorno NUMERIC(8,4) NOT NULL CHECK (tasa_retorno >= 0),
    -- Para DEUDA_FIJA: tasa de interés mensual (ej: 5.00 = 5% mensual)
    -- Para PARTICIPACION_EQUITY: porcentaje de participación en utilidades (ej: 10.00 = 10%)
    
    -- Temporalidad
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE, -- NULL para EQUITY (indefinido)
    frecuencia_pago public.frecuencia_pago_fondeo DEFAULT 'MENSUAL',
    
    -- Estado y tracking
    estado public.estado_contrato_fondeo DEFAULT 'ACTIVO',
    monto_capital_devuelto NUMERIC(15,2) DEFAULT 0 CHECK (monto_capital_devuelto >= 0),
    monto_rendimientos_pagados NUMERIC(15,2) DEFAULT 0 CHECK (monto_rendimientos_pagados >= 0),
    
    -- Metadata flexible (para términos especiales, garantías, etc.)
    metadata JSONB DEFAULT '{}',
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contratos_fondeo_inversionista 
ON public.contratos_fondeo(inversionista_id);

CREATE INDEX IF NOT EXISTS idx_contratos_fondeo_estado 
ON public.contratos_fondeo(estado) WHERE estado = 'ACTIVO';

CREATE INDEX IF NOT EXISTS idx_contratos_fondeo_vencimiento 
ON public.contratos_fondeo(fecha_vencimiento) WHERE fecha_vencimiento IS NOT NULL;

-- 4. TRIGGER PARA updated_at
CREATE OR REPLACE FUNCTION public.fn_update_contratos_fondeo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contratos_fondeo_updated ON public.contratos_fondeo;
CREATE TRIGGER trg_contratos_fondeo_updated
BEFORE UPDATE ON public.contratos_fondeo
FOR EACH ROW EXECUTE FUNCTION public.fn_update_contratos_fondeo_timestamp();

-- 5. VISTA CALCULADA: RENDIMIENTOS DEVENGADOS POR INVERSIONISTA
CREATE OR REPLACE VIEW public.vista_rendimientos_inversionistas AS
SELECT 
    cf.id AS contrato_id,
    cf.inversionista_id,
    i.tipo_relacion,
    p.nombres || ' ' || p.apellido_paterno AS nombre_inversionista,
    cf.tipo AS tipo_contrato,
    cf.monto_pactado,
    cf.tasa_retorno,
    cf.fecha_inicio,
    cf.fecha_vencimiento,
    cf.estado,
    
    -- Cálculo de días transcurridos
    CURRENT_DATE - cf.fecha_inicio AS dias_transcurridos,
    
    -- Cálculo de rendimientos devengados (solo para DEUDA_FIJA)
    CASE 
        WHEN cf.tipo = 'DEUDA_FIJA' THEN
            ROUND(
                cf.monto_pactado * (cf.tasa_retorno / 100.0) * 
                ((CURRENT_DATE - cf.fecha_inicio)::NUMERIC / 30.0),
                2
            )
        ELSE 0 -- Para equity, se calcula manualmente al cierre
    END AS rendimiento_devengado,
    
    -- Lo que ya se pagó
    cf.monto_rendimientos_pagados,
    
    -- Pendiente de pago
    CASE 
        WHEN cf.tipo = 'DEUDA_FIJA' THEN
            ROUND(
                cf.monto_pactado * (cf.tasa_retorno / 100.0) * 
                ((CURRENT_DATE - cf.fecha_inicio)::NUMERIC / 30.0),
                2
            ) - cf.monto_rendimientos_pagados
        ELSE 0
    END AS rendimiento_pendiente_pago,
    
    -- Saldo de capital pendiente de devolver
    cf.monto_pactado - cf.monto_capital_devuelto AS capital_pendiente

FROM public.contratos_fondeo cf
JOIN public.inversionistas i ON cf.inversionista_id = i.id
JOIN public.personas p ON i.persona_id = p.id
WHERE cf.estado = 'ACTIVO';

-- 6. FUNCIÓN RPC: OBTENER RESUMEN DE RENDIMIENTOS
CREATE OR REPLACE FUNCTION public.obtener_resumen_rendimientos()
RETURNS TABLE (
    total_capital_activo NUMERIC,
    total_rendimientos_devengados NUMERIC,
    total_rendimientos_pagados NUMERIC,
    total_pendiente_pago NUMERIC,
    contratos_activos BIGINT,
    inversionistas_activos BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(v.monto_pactado), 0)::NUMERIC AS total_capital_activo,
        COALESCE(SUM(v.rendimiento_devengado), 0)::NUMERIC AS total_rendimientos_devengados,
        COALESCE(SUM(v.monto_rendimientos_pagados), 0)::NUMERIC AS total_rendimientos_pagados,
        COALESCE(SUM(v.rendimiento_pendiente_pago), 0)::NUMERIC AS total_pendiente_pago,
        COUNT(DISTINCT v.contrato_id) AS contratos_activos,
        COUNT(DISTINCT v.inversionista_id) AS inversionistas_activos
    FROM public.vista_rendimientos_inversionistas v;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS (Row Level Security)
ALTER TABLE public.contratos_fondeo ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admin full access contratos_fondeo"
ON public.contratos_fondeo
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. COMENTARIOS
COMMENT ON TABLE public.contratos_fondeo IS 
'Contratos de inversión que definen los términos de rendimiento para cada inversionista. 
DEUDA_FIJA: Genera interés mensual fijo calculado automáticamente.
PARTICIPACION_EQUITY: Participa en utilidades, se calcula manualmente al cierre.';

COMMENT ON VIEW public.vista_rendimientos_inversionistas IS
'Vista calculada que muestra los rendimientos devengados de cada contrato activo.
Para DEUDA_FIJA: Calcula interés simple proporcional a días transcurridos.
Para EQUITY: Muestra 0 (se calcula manualmente).';

COMMIT;
