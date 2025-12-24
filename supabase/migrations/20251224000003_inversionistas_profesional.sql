-- ============================================================================
-- Migration: Sistema Profesional de Inversionistas
-- Version: 1.0
-- Date: 2024-12-24
-- Based on: IFRS 9 EIR, Private Equity IRR/TIR, Microfinance best practices
-- ============================================================================

-- ============================================================================
-- 1. CONFIGURACIÓN AVANZADA DE CONTRATOS
-- ============================================================================

-- Tipo de interés
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS tipo_interes VARCHAR(20) DEFAULT 'SIMPLE';

-- Frecuencia de capitalización (para interés compuesto)
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS frecuencia_capitalizacion VARCHAR(20);

-- Interés capitalizado acumulado
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS interes_capitalizado NUMERIC(15,2) DEFAULT 0;

-- Hurdle Rate (tasa preferente mínima - estándar PE 8%)
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS hurdle_rate NUMERIC(5,2) DEFAULT 8.00;

-- Hurdle acumulado (rendimiento mínimo acumulado)
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS hurdle_acumulado NUMERIC(15,2) DEFAULT 0;

-- Carried Interest (% para GP en ganancias sobre hurdle)
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS carried_interest_rate NUMERIC(5,2) DEFAULT 20.00;

-- TIR actual calculada
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS tir_actual NUMERIC(8,4);

-- Penalidad si empresa atrasa pago
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS tasa_penalidad_empresa NUMERIC(5,4) DEFAULT 0.50;

-- Días de gracia antes de penalidad
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS dias_gracia_empresa INTEGER DEFAULT 5;

-- Penalidad acumulada
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS penalidad_acumulada NUMERIC(15,2) DEFAULT 0;

-- Permite reinversión automática
ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS permite_reinversion BOOLEAN DEFAULT false;

-- Constraint para tipo_interes
DO $$ BEGIN
    ALTER TABLE public.contratos_fondeo 
    ADD CONSTRAINT chk_tipo_interes 
    CHECK (tipo_interes IN ('SIMPLE', 'COMPUESTO'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Comentarios
COMMENT ON COLUMN public.contratos_fondeo.tipo_interes IS 
'SIMPLE: I = P × r × t | COMPUESTO: A = P(1 + r/n)^(nt)';

COMMENT ON COLUMN public.contratos_fondeo.hurdle_rate IS 
'Tasa mínima garantizada anual antes de repartir ganancias (estándar PE: 8%)';

COMMENT ON COLUMN public.contratos_fondeo.carried_interest_rate IS 
'% de ganancias sobre hurdle que va a la empresa (estándar PE: 20%)';

COMMENT ON COLUMN public.contratos_fondeo.tir_actual IS 
'Tasa Interna de Retorno calculada del contrato';

-- ============================================================================
-- 2. TABLA: HISTORIAL DE PAGOS A INVERSIONISTAS (AUDITORÍA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pagos_rendimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id UUID NOT NULL REFERENCES public.contratos_fondeo(id) ON DELETE CASCADE,
    cuota_id UUID REFERENCES public.cronograma_pagos_fondeo(id),
    
    -- Tipo y montos
    tipo_pago VARCHAR(30) NOT NULL,
    monto_capital NUMERIC(15,2) DEFAULT 0,
    monto_interes NUMERIC(15,2) NOT NULL,
    monto_penalidad NUMERIC(15,2) DEFAULT 0,
    monto_total NUMERIC(15,2) NOT NULL,
    
    -- Fechas
    fecha_programada DATE,
    fecha_pago DATE NOT NULL,
    dias_atraso INTEGER DEFAULT 0,
    
    -- Medio de pago
    medio_pago VARCHAR(50),
    cuenta_destino_id UUID,
    referencia_transaccion TEXT,
    
    -- Metadatos
    notas TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    CONSTRAINT chk_tipo_pago_rend CHECK (tipo_pago IN (
        'INTERES_REGULAR',
        'HURDLE_RETURN',
        'CAPITAL_PARCIAL',
        'CAPITAL_TOTAL',
        'BULLET',
        'PENALIDAD',
        'REINVERSION',
        'DIVIDENDO'
    ))
);

CREATE INDEX IF NOT EXISTS idx_pagos_rend_contrato 
ON public.pagos_rendimientos(contrato_id, fecha_pago DESC);

COMMENT ON TABLE public.pagos_rendimientos IS 
'Registro inmutable de todos los pagos realizados a inversionistas. 
Cumple con requisitos de auditoría IFRS.';

-- ============================================================================
-- 3. FUNCIÓN: INTERÉS COMPUESTO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calcular_interes_compuesto(
    p_capital NUMERIC,
    p_tasa_anual NUMERIC,
    p_meses INTEGER,
    p_capitalizacion VARCHAR DEFAULT 'MENSUAL'
)
RETURNS NUMERIC AS $$
DECLARE
    n INTEGER;        -- Número de capitalizaciones por año
    t NUMERIC;        -- Tiempo en años
    tasa_periodo NUMERIC;
    monto_final NUMERIC;
BEGIN
    -- Determinar frecuencia de capitalización
    n := CASE p_capitalizacion
        WHEN 'MENSUAL' THEN 12
        WHEN 'TRIMESTRAL' THEN 4
        WHEN 'SEMESTRAL' THEN 2
        WHEN 'ANUAL' THEN 1
        ELSE 12
    END;
    
    -- Convertir meses a años
    t := p_meses / 12.0;
    
    -- Fórmula: A = P(1 + r/n)^(nt)
    tasa_periodo := p_tasa_anual / 100.0 / n;
    monto_final := p_capital * POWER(1 + tasa_periodo, n * t);
    
    -- Retornar solo el interés (no incluir capital)
    RETURN ROUND(monto_final - p_capital, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.calcular_interes_compuesto(NUMERIC, NUMERIC, INTEGER, VARCHAR) IS 
'Calcula interés compuesto usando fórmula estándar: A = P(1 + r/n)^(nt)
Parámetros:
  - p_capital: Monto principal
  - p_tasa_anual: Tasa de interés anual (ej: 12 para 12%)
  - p_meses: Duración en meses
  - p_capitalizacion: MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL';

-- ============================================================================
-- 4. FUNCIÓN: COMPARAR SIMPLE VS COMPUESTO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.comparar_interes(
    p_capital NUMERIC,
    p_tasa_anual NUMERIC,
    p_meses INTEGER
)
RETURNS TABLE (
    tipo VARCHAR,
    interes NUMERIC,
    total NUMERIC,
    diferencia NUMERIC
) AS $$
DECLARE
    v_simple NUMERIC;
    v_compuesto NUMERIC;
BEGIN
    -- Interés Simple: I = P × r × t
    v_simple := ROUND(p_capital * (p_tasa_anual / 100.0) * (p_meses / 12.0), 2);
    
    -- Interés Compuesto mensual
    v_compuesto := public.calcular_interes_compuesto(
        p_capital, p_tasa_anual, p_meses, 'MENSUAL'
    );
    
    RETURN QUERY 
    SELECT 'SIMPLE'::VARCHAR, v_simple, p_capital + v_simple, 0::NUMERIC
    UNION ALL
    SELECT 'COMPUESTO'::VARCHAR, v_compuesto, p_capital + v_compuesto, v_compuesto - v_simple;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.comparar_interes(NUMERIC, NUMERIC, INTEGER) IS 
'Compara interés simple vs compuesto para un mismo escenario.
Útil para mostrar al inversionista la diferencia.';

-- ============================================================================
-- 5. FUNCIÓN: CALCULAR PENALIDAD POR ATRASO DE EMPRESA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calcular_penalidad_atraso_empresa(
    p_monto_vencido NUMERIC,
    p_dias_atraso INTEGER,
    p_tasa_diaria NUMERIC DEFAULT 0.5,
    p_dias_gracia INTEGER DEFAULT 5
)
RETURNS NUMERIC AS $$
DECLARE
    v_dias_penalizables INTEGER;
BEGIN
    -- Calcular días que generan penalidad (después del período de gracia)
    v_dias_penalizables := GREATEST(0, p_dias_atraso - p_dias_gracia);
    
    IF v_dias_penalizables = 0 THEN
        RETURN 0;
    END IF;
    
    -- Penalidad = Monto × Tasa diaria × Días
    RETURN ROUND(p_monto_vencido * (p_tasa_diaria / 100.0) * v_dias_penalizables, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.calcular_penalidad_atraso_empresa(NUMERIC, INTEGER, NUMERIC, INTEGER) IS 
'Calcula penalidad que debe pagar la empresa si atrasa pago a inversionista.
Aplica después del período de gracia.';

-- ============================================================================
-- 6. FUNCIÓN: CALCULAR TIR APROXIMADA VÍA NEWTON-RAPHSON
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calcular_tir_contrato(
    p_contrato_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
    v_contrato RECORD;
    v_flujos RECORD;
    v_inversion NUMERIC;
    v_tir NUMERIC := 0.1;  -- Estimación inicial 10%
    v_npv NUMERIC;
    v_npv_derivada NUMERIC;
    v_iteracion INTEGER := 0;
    v_max_iteraciones INTEGER := 50;
    v_tolerancia NUMERIC := 0.0001;
BEGIN
    -- Obtener contrato
    SELECT * INTO v_contrato
    FROM public.contratos_fondeo
    WHERE id = p_contrato_id;
    
    IF v_contrato IS NULL THEN
        RETURN NULL;
    END IF;
    
    v_inversion := v_contrato.monto_pactado;
    
    -- Newton-Raphson para encontrar TIR
    -- TIR es la tasa donde NPV = 0
    -- NPV = -Inversión + Σ(Flujo_t / (1+TIR)^t)
    
    WHILE v_iteracion < v_max_iteraciones LOOP
        v_npv := -v_inversion;
        v_npv_derivada := 0;
        
        -- Sumar todos los pagos recibidos
        FOR v_flujos IN 
            SELECT 
                monto_total,
                EXTRACT(EPOCH FROM (fecha_pago - v_contrato.fecha_inicio)) / (365.25 * 86400) AS t
            FROM public.pagos_rendimientos
            WHERE contrato_id = p_contrato_id
        LOOP
            v_npv := v_npv + v_flujos.monto_total / POWER(1 + v_tir, v_flujos.t);
            v_npv_derivada := v_npv_derivada - 
                v_flujos.t * v_flujos.monto_total / POWER(1 + v_tir, v_flujos.t + 1);
        END LOOP;
        
        -- Añadir cuotas pendientes (proyectadas)
        FOR v_flujos IN 
            SELECT 
                monto_total,
                EXTRACT(EPOCH FROM (fecha_programada - v_contrato.fecha_inicio)) / (365.25 * 86400) AS t
            FROM public.cronograma_pagos_fondeo
            WHERE contrato_id = p_contrato_id AND estado = 'PENDIENTE'
        LOOP
            v_npv := v_npv + v_flujos.monto_total / POWER(1 + v_tir, v_flujos.t);
            v_npv_derivada := v_npv_derivada - 
                v_flujos.t * v_flujos.monto_total / POWER(1 + v_tir, v_flujos.t + 1);
        END LOOP;
        
        -- Evitar división por cero
        IF ABS(v_npv_derivada) < 0.0000001 THEN
            EXIT;
        END IF;
        
        -- Actualizar TIR
        v_tir := v_tir - v_npv / v_npv_derivada;
        
        -- Verificar convergencia
        IF ABS(v_npv) < v_tolerancia THEN
            EXIT;
        END IF;
        
        v_iteracion := v_iteracion + 1;
    END LOOP;
    
    -- Retornar TIR como porcentaje
    RETURN ROUND(v_tir * 100, 2);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.calcular_tir_contrato(UUID) IS 
'Calcula la Tasa Interna de Retorno (TIR/IRR) de un contrato.
Usa método Newton-Raphson para aproximar la tasa donde NPV = 0.
Incluye pagos realizados y proyectados.';

-- ============================================================================
-- 7. FUNCIÓN: RENDIMIENTO COMPLETO CON TIPO DE INTERÉS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calcular_rendimiento_profesional(
    p_contrato_id UUID,
    p_fecha_calculo DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    monto_capital NUMERIC,
    tipo_interes VARCHAR,
    tasa_retorno NUMERIC,
    dias_transcurridos INTEGER,
    interes_simple NUMERIC,
    interes_compuesto NUMERIC,
    interes_aplicado NUMERIC,
    hurdle_acumulado NUMERIC,
    interes_pagado NUMERIC,
    interes_pendiente NUMERIC,
    penalidad_acumulada NUMERIC,
    tir_estimada NUMERIC,
    proxima_cuota_fecha DATE,
    proxima_cuota_monto NUMERIC
) AS $$
DECLARE
    v_contrato RECORD;
    v_dias INTEGER;
    v_meses INTEGER;
    v_interes_simple NUMERIC;
    v_interes_compuesto NUMERIC;
    v_interes_aplicado NUMERIC;
    v_proxima RECORD;
    v_tir NUMERIC;
BEGIN
    -- Obtener contrato
    SELECT * INTO v_contrato
    FROM public.contratos_fondeo
    WHERE id = p_contrato_id;
    
    IF v_contrato IS NULL THEN
        RAISE EXCEPTION 'Contrato no encontrado: %', p_contrato_id;
    END IF;
    
    -- Calcular días y meses
    v_dias := GREATEST(0, p_fecha_calculo - v_contrato.fecha_inicio);
    v_meses := CEIL(v_dias / 30.0);
    
    -- Calcular interés simple
    v_interes_simple := ROUND(
        v_contrato.monto_pactado * (v_contrato.tasa_retorno / 100.0) * (v_dias / 365.0),
        2
    );
    
    -- Calcular interés compuesto
    v_interes_compuesto := public.calcular_interes_compuesto(
        v_contrato.monto_pactado,
        v_contrato.tasa_retorno,
        v_meses,
        COALESCE(v_contrato.frecuencia_capitalizacion, 'MENSUAL')
    );
    
    -- Determinar cuál aplicar
    v_interes_aplicado := CASE v_contrato.tipo_interes
        WHEN 'COMPUESTO' THEN v_interes_compuesto
        ELSE v_interes_simple
    END;
    
    -- Obtener próxima cuota
    SELECT fecha_programada, monto_total
    INTO v_proxima
    FROM public.cronograma_pagos_fondeo
    WHERE contrato_id = p_contrato_id 
      AND estado = 'PENDIENTE'
    ORDER BY fecha_programada
    LIMIT 1;
    
    -- Calcular TIR
    v_tir := public.calcular_tir_contrato(p_contrato_id);
    
    RETURN QUERY SELECT
        v_contrato.monto_pactado,
        v_contrato.tipo_interes,
        v_contrato.tasa_retorno,
        v_dias,
        v_interes_simple,
        v_interes_compuesto,
        v_interes_aplicado,
        v_contrato.monto_pactado * (v_contrato.hurdle_rate / 100.0) * (v_dias / 365.0),
        COALESCE(v_contrato.monto_rendimientos_pagados, 0::NUMERIC),
        v_interes_aplicado - COALESCE(v_contrato.monto_rendimientos_pagados, 0),
        COALESCE(v_contrato.penalidad_acumulada, 0::NUMERIC),
        v_tir,
        v_proxima.fecha_programada,
        v_proxima.monto_total;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.calcular_rendimiento_profesional(UUID, DATE) IS 
'Calcula rendimiento completo de un contrato de inversión.
Incluye comparación simple vs compuesto, hurdle rate, TIR, y penalidades.';

-- ============================================================================
-- 8. TRIGGER: ACTUALIZAR ESTADO DE CUOTAS VENCIDAS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_actualizar_cuotas_vencidas()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar cuotas vencidas
    UPDATE public.cronograma_pagos_fondeo
    SET 
        estado = 'VENCIDO',
        updated_at = now()
    WHERE estado = 'PENDIENTE' 
      AND fecha_programada < CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. VISTA: RESUMEN PROFESIONAL DE INVERSIONISTAS
-- ============================================================================

CREATE OR REPLACE VIEW public.vista_inversionistas_profesional AS
SELECT 
    i.id AS inversionista_id,
    p.nombres || ' ' || COALESCE(p.apellido_paterno, '') AS nombre_completo,
    p.numero_documento AS dni,
    i.tipo_relacion,
    i.activo,
    
    -- Contratos
    COUNT(cf.id) AS num_contratos,
    
    -- Capital
    SUM(cf.monto_pactado) AS capital_total,
    
    -- Rendimientos
    SUM(
        CASE cf.tipo_interes
            WHEN 'COMPUESTO' THEN 
                public.calcular_interes_compuesto(
                    cf.monto_pactado, 
                    cf.tasa_retorno, 
                    CEIL((CURRENT_DATE - cf.fecha_inicio) / 30.0)::INTEGER,
                    COALESCE(cf.frecuencia_capitalizacion, 'MENSUAL')
                )
            ELSE 
                cf.monto_pactado * (cf.tasa_retorno / 100.0) * 
                ((CURRENT_DATE - cf.fecha_inicio) / 365.0)
        END
    ) AS rendimiento_devengado,
    SUM(cf.monto_rendimientos_pagados) AS rendimiento_pagado,
    SUM(cf.penalidad_acumulada) AS penalidades_acumuladas,
    
    -- TIR promedio ponderada
    SUM(cf.tir_actual * cf.monto_pactado) / NULLIF(SUM(cf.monto_pactado), 0) AS tir_promedio,
    
    -- Próximo pago
    MIN(cf.proximo_pago_programado) AS proximo_pago,
    
    -- Metadata
    MAX(cf.updated_at) AS ultima_actualizacion

FROM public.inversionistas i
JOIN public.personas p ON i.persona_id = p.id
LEFT JOIN public.contratos_fondeo cf ON cf.inversionista_id = i.id AND cf.estado = 'ACTIVO'
WHERE i.activo = true
GROUP BY i.id, p.nombres, p.apellido_paterno, p.numero_documento, i.tipo_relacion, i.activo;

COMMENT ON VIEW public.vista_inversionistas_profesional IS 
'Vista resumen de inversionistas con métricas profesionales:
rendimiento según tipo de interés, TIR, penalidades.';

-- ============================================================================
-- 10. ACTUALIZAR CONTRATOS EXISTENTES CON TIR
-- ============================================================================

DO $$
DECLARE
    v_contrato_id UUID;
    v_tir NUMERIC;
BEGIN
    FOR v_contrato_id IN 
        SELECT id FROM public.contratos_fondeo WHERE estado = 'ACTIVO'
    LOOP
        BEGIN
            v_tir := public.calcular_tir_contrato(v_contrato_id);
            
            UPDATE public.contratos_fondeo
            SET tir_actual = v_tir
            WHERE id = v_contrato_id;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar errores individuales
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
