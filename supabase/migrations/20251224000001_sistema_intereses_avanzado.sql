-- ============================================================================
-- Migration: Sistema Avanzado de Cálculo de Intereses
-- Version: 1.0
-- Date: 2024-12-24
-- Description: 
--   Implementa cálculo de intereses robusto para entorno financiero real:
--   - Configuración de intereses por empresa
--   - Campos de mora y penalidades
--   - Historial de cálculos para auditoría
--   - Funciones de cálculo mejoradas
-- ============================================================================

-- ============================================================================
-- 1. CONFIGURACIÓN DE INTERESES POR EMPRESA
-- ============================================================================

-- Añadir columna de configuración de intereses a empresas
ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS config_intereses JSONB DEFAULT '{
  "tipo_calculo": "simple",
  "base_dias": 30,
  "tasa_mora_diaria": 0.5,
  "dias_gracia": 3,
  "capitalizacion_mensual": false,
  "interes_minimo_dias": 1
}'::jsonb;

COMMENT ON COLUMN public.empresas.config_intereses IS 'Configuración del sistema de intereses:
- tipo_calculo: "simple" | "compuesto"
- base_dias: 30 (comercial) | 365 (calendario)
- tasa_mora_diaria: % adicional por día de mora
- dias_gracia: días sin mora después del vencimiento
- capitalizacion_mensual: si los intereses no pagados se capitalizan
- interes_minimo_dias: mínimo de días a cobrar';

-- ============================================================================
-- 2. CAMPOS ADICIONALES EN CRÉDITOS PARA MORA
-- ============================================================================

ALTER TABLE public.creditos
ADD COLUMN IF NOT EXISTS interes_mora_acumulado NUMERIC(12,2) DEFAULT 0;

ALTER TABLE public.creditos
ADD COLUMN IF NOT EXISTS dias_en_mora INTEGER DEFAULT 0;

ALTER TABLE public.creditos
ADD COLUMN IF NOT EXISTS dias_en_gracia_usados INTEGER DEFAULT 0;

ALTER TABLE public.creditos
ADD COLUMN IF NOT EXISTS fecha_ultimo_recalculo DATE;

ALTER TABLE public.creditos
ADD COLUMN IF NOT EXISTS interes_capitalizado NUMERIC(12,2) DEFAULT 0;

-- Comentarios
COMMENT ON COLUMN public.creditos.interes_mora_acumulado IS 
'Monto total de interés moratorio acumulado (penalidad por atraso)';

COMMENT ON COLUMN public.creditos.dias_en_mora IS 
'Días transcurridos después del vencimiento excluyendo días de gracia';

COMMENT ON COLUMN public.creditos.dias_en_gracia_usados IS 
'Días de gracia ya consumidos (máximo según config empresa)';

COMMENT ON COLUMN public.creditos.fecha_ultimo_recalculo IS 
'Fecha del último recálculo de intereses (para auditoría)';

COMMENT ON COLUMN public.creditos.interes_capitalizado IS 
'Intereses no pagados que se han sumado al capital (capitalización)';

-- ============================================================================
-- 3. TABLA DE HISTORIAL DE CÁLCULOS (AUDITORÍA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.historial_calculo_intereses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    credito_id UUID NOT NULL REFERENCES public.creditos(id) ON DELETE CASCADE,
    fecha_calculo DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Datos del crédito al momento del cálculo
    monto_base NUMERIC(12,2) NOT NULL,
    tasa_aplicada NUMERIC(5,2) NOT NULL,
    
    -- Días desglosados
    dias_regulares INTEGER NOT NULL DEFAULT 0,
    dias_gracia INTEGER NOT NULL DEFAULT 0,
    dias_mora INTEGER NOT NULL DEFAULT 0,
    
    -- Intereses calculados
    interes_regular NUMERIC(12,2) NOT NULL DEFAULT 0,
    interes_mora NUMERIC(12,2) NOT NULL DEFAULT 0,
    interes_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Configuración usada (snapshot para auditoría)
    config_usada JSONB NOT NULL,
    
    -- Metadatos
    tipo_evento VARCHAR(50) DEFAULT 'RECALCULO_DIARIO',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    CONSTRAINT chk_tipo_evento CHECK (tipo_evento IN (
        'RECALCULO_DIARIO',
        'PAGO_PARCIAL',
        'RENOVACION',
        'LIQUIDACION',
        'CAPITALIZACION',
        'AJUSTE_MANUAL'
    ))
);

CREATE INDEX IF NOT EXISTS idx_historial_intereses_credito 
ON public.historial_calculo_intereses(credito_id, fecha_calculo DESC);

COMMENT ON TABLE public.historial_calculo_intereses IS 
'Registro inmutable de cada cálculo de intereses para auditoría financiera';

-- ============================================================================
-- 4. FUNCIÓN: CALCULAR INTERÉS COMPLETO CON MORA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calcular_interes_completo(
    p_credito_id UUID,
    p_fecha_calculo DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    monto_base NUMERIC,
    tasa_interes NUMERIC,
    dias_desde_desembolso INTEGER,
    dias_regulares INTEGER,
    dias_en_gracia INTEGER,
    dias_en_mora INTEGER,
    interes_regular NUMERIC,
    interes_mora NUMERIC,
    interes_total NUMERIC,
    estado_mora VARCHAR,
    config_aplicada JSONB
) AS $$
DECLARE
    v_credito RECORD;
    v_empresa RECORD;
    v_config JSONB;
    v_fecha_desembolso DATE;
    v_fecha_vencimiento DATE;
    v_dias_totales INTEGER;
    v_dias_regulares INTEGER;
    v_dias_post_vencimiento INTEGER;
    v_dias_gracia INTEGER;
    v_dias_mora INTEGER;
    v_interes_regular NUMERIC;
    v_interes_mora NUMERIC;
    v_tasa_mora_diaria NUMERIC;
    v_base_dias INTEGER;
BEGIN
    -- Obtener datos del crédito
    SELECT 
        c.id,
        c.monto_prestado,
        c.tasa_interes,
        c.fecha_desembolso::DATE,
        c.fecha_vencimiento,
        c.interes_capitalizado,
        c.empresa_id
    INTO v_credito
    FROM public.creditos c
    WHERE c.id = p_credito_id
      AND c._deleted = false;
    
    IF v_credito IS NULL THEN
        RAISE EXCEPTION 'Crédito no encontrado o eliminado: %', p_credito_id;
    END IF;
    
    -- Obtener configuración de la empresa
    SELECT e.config_intereses
    INTO v_config
    FROM public.empresas e
    WHERE e.id = v_credito.empresa_id;
    
    -- Valores por defecto si no hay config
    IF v_config IS NULL THEN
        v_config := '{
            "tipo_calculo": "simple",
            "base_dias": 30,
            "tasa_mora_diaria": 0.5,
            "dias_gracia": 3,
            "capitalizacion_mensual": false
        }'::jsonb;
    END IF;
    
    -- Extraer configuración
    v_base_dias := (v_config->>'base_dias')::INTEGER;
    v_tasa_mora_diaria := (v_config->>'tasa_mora_diaria')::NUMERIC;
    
    -- Fechas
    v_fecha_desembolso := v_credito.fecha_desembolso;
    v_fecha_vencimiento := v_credito.fecha_vencimiento;
    
    -- Calcular días totales desde desembolso
    v_dias_totales := GREATEST(0, p_fecha_calculo - v_fecha_desembolso);
    
    -- Calcular días post-vencimiento
    v_dias_post_vencimiento := GREATEST(0, p_fecha_calculo - v_fecha_vencimiento);
    
    -- Calcular días regulares (hasta el vencimiento)
    v_dias_regulares := LEAST(v_dias_totales, GREATEST(0, v_fecha_vencimiento - v_fecha_desembolso));
    
    -- Calcular días de gracia y mora
    IF v_dias_post_vencimiento > 0 THEN
        v_dias_gracia := LEAST(v_dias_post_vencimiento, (v_config->>'dias_gracia')::INTEGER);
        v_dias_mora := GREATEST(0, v_dias_post_vencimiento - (v_config->>'dias_gracia')::INTEGER);
    ELSE
        v_dias_gracia := 0;
        v_dias_mora := 0;
    END IF;
    
    -- Calcular interés regular
    -- Formula: (Capital + Capitalizado) × (Tasa/100) × (Días/BaseDías)
    v_interes_regular := ROUND(
        (v_credito.monto_prestado + COALESCE(v_credito.interes_capitalizado, 0)) 
        * (v_credito.tasa_interes / 100.0) 
        * (v_dias_regulares::NUMERIC / v_base_dias::NUMERIC),
        2
    );
    
    -- Calcular interés de mora
    -- Solo si hay días en mora (después del periodo de gracia)
    IF v_dias_mora > 0 THEN
        v_interes_mora := ROUND(
            (v_credito.monto_prestado + COALESCE(v_credito.interes_capitalizado, 0))
            * (v_tasa_mora_diaria / 100.0)
            * v_dias_mora,
            2
        );
    ELSE
        v_interes_mora := 0;
    END IF;
    
    -- Determinar estado de mora
    RETURN QUERY SELECT
        v_credito.monto_prestado + COALESCE(v_credito.interes_capitalizado, 0),
        v_credito.tasa_interes,
        v_dias_totales,
        v_dias_regulares,
        v_dias_gracia,
        v_dias_mora,
        v_interes_regular,
        v_interes_mora,
        v_interes_regular + v_interes_mora,
        CASE 
            WHEN v_dias_mora > 30 THEN 'MORA_GRAVE'::VARCHAR
            WHEN v_dias_mora > 0 THEN 'MORA_LEVE'::VARCHAR
            WHEN v_dias_gracia > 0 THEN 'EN_GRACIA'::VARCHAR
            ELSE 'AL_DIA'::VARCHAR
        END,
        v_config;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.calcular_interes_completo(UUID, DATE) IS 
'Calcula el interés completo de un crédito incluyendo mora y días de gracia.
Retorna desglose de días e intereses para transparencia total.';

-- ============================================================================
-- 5. FUNCIÓN: TRIGGER MEJORADO PARA ACTUALIZAR INTERESES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_actualizar_intereses_v2()
RETURNS TRIGGER AS $$
DECLARE
    v_calculo RECORD;
BEGIN
    -- Obtener cálculo completo
    SELECT * INTO v_calculo
    FROM public.calcular_interes_completo(NEW.id, CURRENT_DATE);
    
    IF v_calculo IS NOT NULL THEN
        -- Actualizar campos del crédito
        NEW.dias_transcurridos := v_calculo.dias_desde_desembolso;
        NEW.interes_devengado_actual := v_calculo.interes_regular;
        NEW.interes_mora_acumulado := v_calculo.interes_mora;
        NEW.dias_en_mora := v_calculo.dias_en_mora;
        NEW.dias_en_gracia_usados := v_calculo.dias_en_gracia;
        NEW.fecha_ultimo_recalculo := CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reemplazar trigger existente
DROP TRIGGER IF EXISTS trigger_actualizar_interes ON public.creditos;
CREATE TRIGGER trigger_actualizar_interes_v2
    BEFORE INSERT OR UPDATE ON public.creditos
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_actualizar_intereses_v2();

-- ============================================================================
-- 6. FUNCIÓN: RECÁLCULO BATCH DIARIO (para cron job)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recalcular_intereses_diarios()
RETURNS TABLE (
    creditos_actualizados INTEGER,
    errores INTEGER
) AS $$
DECLARE
    v_credito RECORD;
    v_calculo RECORD;
    v_actualizados INTEGER := 0;
    v_errores INTEGER := 0;
BEGIN
    -- Recorrer todos los créditos activos
    FOR v_credito IN 
        SELECT id 
        FROM public.creditos 
        WHERE estado IN ('vigente', 'vencido', 'en_mora')
          AND _deleted = false
    LOOP
        BEGIN
            -- Obtener cálculo
            SELECT * INTO v_calculo
            FROM public.calcular_interes_completo(v_credito.id, CURRENT_DATE);
            
            -- Actualizar crédito
            UPDATE public.creditos
            SET 
                dias_transcurridos = v_calculo.dias_desde_desembolso,
                interes_devengado_actual = v_calculo.interes_regular,
                interes_mora_acumulado = v_calculo.interes_mora,
                dias_en_mora = v_calculo.dias_en_mora,
                dias_en_gracia_usados = v_calculo.dias_en_gracia,
                fecha_ultimo_recalculo = CURRENT_DATE,
                _modified = now()
            WHERE id = v_credito.id;
            
            -- Registrar en historial
            INSERT INTO public.historial_calculo_intereses (
                credito_id,
                fecha_calculo,
                monto_base,
                tasa_aplicada,
                dias_regulares,
                dias_gracia,
                dias_mora,
                interes_regular,
                interes_mora,
                interes_total,
                config_usada,
                tipo_evento
            ) VALUES (
                v_credito.id,
                CURRENT_DATE,
                v_calculo.monto_base,
                v_calculo.tasa_interes,
                v_calculo.dias_regulares,
                v_calculo.dias_en_gracia,
                v_calculo.dias_en_mora,
                v_calculo.interes_regular,
                v_calculo.interes_mora,
                v_calculo.interes_total,
                v_calculo.config_aplicada,
                'RECALCULO_DIARIO'
            );
            
            v_actualizados := v_actualizados + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errores := v_errores + 1;
            -- Log error pero continuar
            RAISE WARNING 'Error recalculando crédito %: %', v_credito.id, SQLERRM;
        END;
    END LOOP;
    
    RETURN QUERY SELECT v_actualizados, v_errores;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.recalcular_intereses_diarios() IS 
'Función para ejecutar diariamente via cron. Recalcula intereses de todos los créditos activos.';

-- ============================================================================
-- 7. VISTA MEJORADA DE CRÉDITOS CON INTERESES
-- ============================================================================

CREATE OR REPLACE VIEW public.vista_creditos_intereses_v2 AS
SELECT 
    c.id,
    c.codigo,
    c.codigo_credito,
    c.monto_prestado,
    c.tasa_interes,
    c.periodo_dias,
    c.fecha_desembolso,
    c.fecha_vencimiento,
    c.saldo_pendiente,
    c.estado,
    c.estado_detallado,
    
    -- Intereses
    c.dias_transcurridos,
    c.interes_devengado_actual AS interes_regular,
    c.interes_mora_acumulado AS interes_mora,
    c.interes_devengado_actual + COALESCE(c.interes_mora_acumulado, 0) AS interes_total,
    
    -- Mora
    c.dias_en_mora,
    c.dias_en_gracia_usados,
    CASE 
        WHEN c.dias_en_mora > 30 THEN 'MORA_GRAVE'
        WHEN c.dias_en_mora > 0 THEN 'MORA_LEVE'
        WHEN c.dias_en_gracia_usados > 0 THEN 'EN_GRACIA'
        WHEN CURRENT_DATE > c.fecha_vencimiento THEN 'VENCIDO'
        WHEN CURRENT_DATE >= c.fecha_vencimiento - INTERVAL '5 days' THEN 'POR_VENCER'
        ELSE 'AL_DIA'
    END AS estado_mora,
    
    -- Total a pagar
    c.saldo_pendiente + c.interes_devengado_actual + COALESCE(c.interes_mora_acumulado, 0) AS total_a_pagar,
    
    -- Cliente
    cl.nombres AS cliente_nombre,
    cl.numero_documento AS cliente_dni,
    
    -- Metadatos
    c.fecha_ultimo_recalculo,
    c._modified
    
FROM public.creditos c
LEFT JOIN public.clientes cl ON c.cliente_id = cl.id
WHERE c._deleted = false
  AND c.estado NOT IN ('cancelado', 'anulado', 'ejecutado');

COMMENT ON VIEW public.vista_creditos_intereses_v2 IS 
'Vista completa de créditos con intereses desglosados (regular + mora)';

-- ============================================================================
-- 8. ACTUALIZAR CRÉDITOS EXISTENTES
-- ============================================================================

-- Ejecutar recálculo inicial para todos los créditos existentes
SELECT public.recalcular_intereses_diarios();

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
