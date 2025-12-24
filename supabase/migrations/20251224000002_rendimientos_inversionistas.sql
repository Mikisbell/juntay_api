-- ============================================================================
-- Migration: Sistema de Rendimientos para Inversionistas
-- Version: 1.0
-- Date: 2024-12-24
-- Description: 
--   Implementa tracking de rendimientos y cronograma de pagos para inversionistas:
--   - Campos de interés devengado en contratos
--   - Cronograma de pagos de rendimientos
--   - Funciones de cálculo de rendimientos
-- ============================================================================

-- ============================================================================
-- 1. CAMPOS ADICIONALES EN CONTRATOS_FONDEO
-- ============================================================================

ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS interes_devengado NUMERIC(15,2) DEFAULT 0;

ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS ultimo_calculo_rendimiento DATE;

ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS proximo_pago_programado DATE;

ALTER TABLE public.contratos_fondeo
ADD COLUMN IF NOT EXISTS dias_transcurridos INTEGER DEFAULT 0;

-- Comentarios
COMMENT ON COLUMN public.contratos_fondeo.interes_devengado IS 
'Interés/rendimiento acumulado hasta la fecha (no pagado aún)';

COMMENT ON COLUMN public.contratos_fondeo.ultimo_calculo_rendimiento IS 
'Fecha del último cálculo de rendimientos';

COMMENT ON COLUMN public.contratos_fondeo.proximo_pago_programado IS 
'Fecha del próximo pago de rendimientos según frecuencia';

COMMENT ON COLUMN public.contratos_fondeo.dias_transcurridos IS 
'Días desde el inicio del contrato';

-- ============================================================================
-- 2. TABLA: CRONOGRAMA DE PAGOS DE RENDIMIENTOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cronograma_pagos_fondeo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID NOT NULL REFERENCES public.contratos_fondeo(id) ON DELETE CASCADE,
    
    -- Identificación de cuota
    numero_cuota INTEGER NOT NULL,
    tipo_pago VARCHAR(20) NOT NULL DEFAULT 'INTERES',
    
    -- Fechas
    fecha_programada DATE NOT NULL,
    fecha_pago_real DATE,
    
    -- Montos planificados
    monto_capital NUMERIC(15,2) DEFAULT 0,
    monto_interes NUMERIC(15,2) NOT NULL,
    monto_total NUMERIC(15,2) NOT NULL,
    
    -- Ejecución
    monto_pagado NUMERIC(15,2),
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    
    -- Metadatos
    referencia_transaccion UUID,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    CONSTRAINT chk_tipo_pago CHECK (tipo_pago IN ('INTERES', 'CAPITAL', 'BULLET')),
    CONSTRAINT chk_estado_pago CHECK (estado IN ('PENDIENTE', 'PAGADO', 'VENCIDO', 'PARCIAL', 'ANULADO'))
);

CREATE INDEX IF NOT EXISTS idx_cronograma_contrato 
ON public.cronograma_pagos_fondeo(contrato_id, fecha_programada);

CREATE INDEX IF NOT EXISTS idx_cronograma_pendientes 
ON public.cronograma_pagos_fondeo(estado, fecha_programada) 
WHERE estado = 'PENDIENTE';

COMMENT ON TABLE public.cronograma_pagos_fondeo IS 
'Cronograma de pagos de rendimientos a inversionistas. 
Permite tracking de cada cuota de interés o capital.';

-- ============================================================================
-- 3. FUNCIÓN: GENERAR CRONOGRAMA DE PAGOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generar_cronograma_fondeo(
    p_contrato_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_contrato RECORD;
    v_fecha_actual DATE;
    v_monto_interes_cuota NUMERIC;
    v_numero_cuotas INTEGER;
    v_cuotas_creadas INTEGER := 0;
    i INTEGER;
BEGIN
    -- Obtener datos del contrato
    SELECT 
        cf.*,
        CASE cf.frecuencia_pago
            WHEN 'MENSUAL' THEN 1
            WHEN 'TRIMESTRAL' THEN 3
            WHEN 'SEMESTRAL' THEN 6
            WHEN 'ANUAL' THEN 12
            ELSE 1
        END AS meses_entre_pagos
    INTO v_contrato
    FROM public.contratos_fondeo cf
    WHERE cf.id = p_contrato_id;
    
    IF v_contrato IS NULL THEN
        RAISE EXCEPTION 'Contrato no encontrado: %', p_contrato_id;
    END IF;
    
    -- Eliminar cronograma existente si hay
    DELETE FROM public.cronograma_pagos_fondeo 
    WHERE contrato_id = p_contrato_id AND estado = 'PENDIENTE';
    
    -- Calcular número de cuotas hasta vencimiento
    IF v_contrato.fecha_vencimiento IS NULL THEN
        -- Contrato indefinido: generar 12 meses adelante
        v_numero_cuotas := 12 / v_contrato.meses_entre_pagos;
    ELSE
        v_numero_cuotas := CEIL(
            (v_contrato.fecha_vencimiento - v_contrato.fecha_inicio)::NUMERIC 
            / (v_contrato.meses_entre_pagos * 30)
        );
    END IF;
    
    -- Calcular monto de interés por periodo
    -- Tasa es anual, convertir a periodo
    v_monto_interes_cuota := ROUND(
        v_contrato.monto_pactado * (v_contrato.tasa_retorno / 100.0) 
        * (v_contrato.meses_entre_pagos / 12.0),
        2
    );
    
    -- Generar cuotas según tipo
    IF v_contrato.tipo = 'DEUDA_FIJA' THEN
        v_fecha_actual := v_contrato.fecha_inicio;
        
        FOR i IN 1..v_numero_cuotas LOOP
            v_fecha_actual := v_fecha_actual + (v_contrato.meses_entre_pagos || ' months')::INTERVAL;
            
            -- Determinar si es última cuota (incluye capital en BULLET)
            INSERT INTO public.cronograma_pagos_fondeo (
                contrato_id,
                numero_cuota,
                tipo_pago,
                fecha_programada,
                monto_capital,
                monto_interes,
                monto_total,
                estado
            ) VALUES (
                p_contrato_id,
                i,
                CASE 
                    WHEN i = v_numero_cuotas AND v_contrato.fecha_vencimiento IS NOT NULL 
                    THEN 'BULLET' 
                    ELSE 'INTERES' 
                END,
                v_fecha_actual::DATE,
                CASE 
                    WHEN i = v_numero_cuotas AND v_contrato.fecha_vencimiento IS NOT NULL 
                    THEN v_contrato.monto_pactado 
                    ELSE 0 
                END,
                v_monto_interes_cuota,
                CASE 
                    WHEN i = v_numero_cuotas AND v_contrato.fecha_vencimiento IS NOT NULL 
                    THEN v_contrato.monto_pactado + v_monto_interes_cuota
                    ELSE v_monto_interes_cuota 
                END,
                'PENDIENTE'
            );
            
            v_cuotas_creadas := v_cuotas_creadas + 1;
        END LOOP;
        
        -- Actualizar próximo pago en contrato
        UPDATE public.contratos_fondeo
        SET proximo_pago_programado = (
            SELECT MIN(fecha_programada) 
            FROM public.cronograma_pagos_fondeo 
            WHERE contrato_id = p_contrato_id AND estado = 'PENDIENTE'
        )
        WHERE id = p_contrato_id;
    END IF;
    
    RETURN v_cuotas_creadas;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generar_cronograma_fondeo(UUID) IS 
'Genera el cronograma de pagos de rendimientos para un contrato de fondeo.
Para DEUDA_FIJA: crea cuotas de interés y bullet final.
Para PARTICIPACION_EQUITY: no genera cronograma automático.';

-- ============================================================================
-- 4. FUNCIÓN: CALCULAR RENDIMIENTO DEVENGADO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calcular_rendimiento_inversionista(
    p_contrato_id UUID,
    p_fecha_calculo DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    monto_capital NUMERIC,
    tasa_retorno NUMERIC,
    dias_transcurridos INTEGER,
    interes_devengado NUMERIC,
    interes_pagado NUMERIC,
    interes_pendiente NUMERIC,
    proxima_cuota_fecha DATE,
    proxima_cuota_monto NUMERIC
) AS $$
DECLARE
    v_contrato RECORD;
    v_dias INTEGER;
    v_interes_total NUMERIC;
    v_proxima RECORD;
BEGIN
    -- Obtener contrato
    SELECT * INTO v_contrato
    FROM public.contratos_fondeo
    WHERE id = p_contrato_id;
    
    IF v_contrato IS NULL THEN
        RAISE EXCEPTION 'Contrato no encontrado: %', p_contrato_id;
    END IF;
    
    -- Calcular días
    v_dias := GREATEST(0, p_fecha_calculo - v_contrato.fecha_inicio);
    
    -- Calcular interés devengado (simple por ahora)
    v_interes_total := ROUND(
        v_contrato.monto_pactado * (v_contrato.tasa_retorno / 100.0) * (v_dias / 365.0),
        2
    );
    
    -- Obtener próxima cuota
    SELECT fecha_programada, monto_total
    INTO v_proxima
    FROM public.cronograma_pagos_fondeo
    WHERE contrato_id = p_contrato_id 
      AND estado = 'PENDIENTE'
    ORDER BY fecha_programada
    LIMIT 1;
    
    RETURN QUERY SELECT
        v_contrato.monto_pactado,
        v_contrato.tasa_retorno,
        v_dias,
        v_interes_total,
        v_contrato.monto_rendimientos_pagados,
        v_interes_total - COALESCE(v_contrato.monto_rendimientos_pagados, 0),
        v_proxima.fecha_programada,
        v_proxima.monto_total;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.calcular_rendimiento_inversionista(UUID, DATE) IS 
'Calcula el rendimiento devengado de un inversionista hasta una fecha específica.';

-- ============================================================================
-- 5. FUNCIÓN: RECÁLCULO BATCH DIARIO DE RENDIMIENTOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recalcular_rendimientos_diarios()
RETURNS TABLE (
    contratos_actualizados INTEGER
) AS $$
DECLARE
    v_contrato RECORD;
    v_calculo RECORD;
    v_actualizados INTEGER := 0;
BEGIN
    FOR v_contrato IN 
        SELECT id 
        FROM public.contratos_fondeo 
        WHERE estado = 'ACTIVO'
    LOOP
        -- Calcular rendimiento
        SELECT * INTO v_calculo
        FROM public.calcular_rendimiento_inversionista(v_contrato.id, CURRENT_DATE);
        
        -- Actualizar contrato
        UPDATE public.contratos_fondeo
        SET 
            interes_devengado = v_calculo.interes_devengado,
            dias_transcurridos = v_calculo.dias_transcurridos,
            ultimo_calculo_rendimiento = CURRENT_DATE,
            updated_at = now()
        WHERE id = v_contrato.id;
        
        v_actualizados := v_actualizados + 1;
    END LOOP;
    
    -- Actualizar estado de cuotas vencidas
    UPDATE public.cronograma_pagos_fondeo
    SET estado = 'VENCIDO', updated_at = now()
    WHERE estado = 'PENDIENTE' 
      AND fecha_programada < CURRENT_DATE;
    
    RETURN QUERY SELECT v_actualizados;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.recalcular_rendimientos_diarios() IS 
'Recalcula rendimientos de todos los contratos activos. Ejecutar diariamente.';

-- ============================================================================
-- 6. VISTA: RESUMEN DE INVERSIONISTAS CON RENDIMIENTOS
-- ============================================================================

CREATE OR REPLACE VIEW public.vista_inversionistas_rendimientos AS
SELECT 
    i.id AS inversionista_id,
    p.nombres || ' ' || p.apellido_paterno AS nombre_completo,
    p.numero_documento AS dni,
    i.tipo_relacion,
    i.activo,
    
    -- Totales de contratos
    COUNT(cf.id) AS num_contratos,
    SUM(cf.monto_pactado) AS capital_total,
    SUM(cf.interes_devengado) AS rendimiento_devengado_total,
    SUM(cf.monto_rendimientos_pagados) AS rendimiento_pagado_total,
    SUM(cf.interes_devengado) - SUM(COALESCE(cf.monto_rendimientos_pagados, 0)) AS rendimiento_pendiente,
    
    -- Próximos pagos
    MIN(cf.proximo_pago_programado) AS proximo_pago,
    
    -- Metadatos
    MAX(cf.updated_at) AS ultima_actualizacion

FROM public.inversionistas i
JOIN public.personas p ON i.persona_id = p.id
LEFT JOIN public.contratos_fondeo cf ON cf.inversionista_id = i.id AND cf.estado = 'ACTIVO'
WHERE i.activo = true
GROUP BY i.id, p.nombres, p.apellido_paterno, p.numero_documento, i.tipo_relacion, i.activo;

COMMENT ON VIEW public.vista_inversionistas_rendimientos IS 
'Vista resumen de inversionistas con sus rendimientos acumulados.';

-- ============================================================================
-- 7. GENERAR CRONOGRAMAS PARA CONTRATOS EXISTENTES
-- ============================================================================

DO $$
DECLARE
    v_contrato_id UUID;
BEGIN
    FOR v_contrato_id IN 
        SELECT id FROM public.contratos_fondeo WHERE tipo = 'DEUDA_FIJA' AND estado = 'ACTIVO'
    LOOP
        PERFORM public.generar_cronograma_fondeo(v_contrato_id);
    END LOOP;
END $$;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
