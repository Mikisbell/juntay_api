-- ============================================================================
-- Migración: Cálculo Automático de Intereses (Mejora #2)
-- Versión: 2.0 (Corregida)
-- Fecha: 2025-11-24
-- Descripción: Implementa cálculo automático diario de intereses devengados
-- Nota: Usa triggers en vez de GENERATED ALWAYS (CURRENT_DATE no es immutable)
-- ============================================================================

-- 1. AGREGAR COLUMNAS normales (no generated)
ALTER TABLE public.creditos 
ADD COLUMN IF NOT EXISTS dias_transcurridos INT;

ALTER TABLE public.creditos 
ADD COLUMN IF NOT EXISTS interes_devengado_actual NUMERIC(12,2) DEFAULT 0;

-- 2. CREAR FUNCIÓN para calcular interés actual de un crédito
CREATE OR REPLACE FUNCTION public.calcular_interes_actual(
    p_credito_id UUID,
    p_fecha_calculo DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC AS $$
DECLARE
    v_monto NUMERIC;
    v_tasa NUMERIC;
    v_fecha_inicio DATE;
    v_dias INT;
    v_interes NUMERIC;
BEGIN
    -- Obtener datos del crédito
    SELECT 
        monto_prestado,
        tasa_interes,
        fecha_desembolso::

date
    INTO v_monto, v_tasa, v_fecha_inicio
    FROM public.creditos
    WHERE id = p_credito_id;
    
    IF v_monto IS NULL THEN
        RAISE EXCEPTION 'Crédito no encontrado: %', p_credito_id;
    END IF;
    
    -- Calcular días transcurridos
    v_dias := p_fecha_calculo - v_fecha_inicio;
    
    -- Si es negativo o cero, no hay interés
    IF v_dias <= 0 THEN
        RETURN 0.00;
    END IF;
    
    -- Calcular interés simple
    -- Fórmula: Capital × (Tasa/100) × (Días/30)
    v_interes := ROUND(
        v_monto * (v_tasa / 100.0) * (v_dias / 30.0),
        2
    );
    
    RETURN v_interes;
END;
$$ LANGUAGE plpgsql;

-- 3. CREAR FUNCIÓN trigger para actualizar automáticamente
CREATE OR REPLACE FUNCTION public.actualizar_interes_devengado()
RETURNS TRIGGER AS $$
DECLARE
    v_dias INT;
    v_interes NUMERIC;
BEGIN
    -- Calcular días transcurridos
    v_dias := CURRENT_DATE - NEW.fecha_desembolso::date;
    
    -- Asegurar que no sea negativo
    IF v_dias < 0 THEN
        v_dias := 0;
    END IF;
    
    -- Calcular interés devengado
    IF v_dias > 0 AND NEW.monto_prestado > 0 THEN
        v_interes := ROUND(
            NEW.monto_prestado * (NEW.tasa_interes / 100.0) * (v_dias / 30.0),
            2
        );
    ELSE
        v_interes := 0.00;
    END IF;
    
    -- Actualizar valores
    NEW.dias_transcurridos := v_dias;
    NEW.interes_devengado_actual := v_interes;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREAR TRIGGER para INSERT y UPDATE
CREATE TRIGGER trigger_actualizar_interes
    BEFORE INSERT OR UPDATE ON public.creditos
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_interes_devengado();

-- 5. CREAR FUNCIÓN para proyectar interés futuro
CREATE OR REPLACE FUNCTION public.proyectar_interes(
    p_credito_id UUID,
    p_dias_adicionales INT
)
RETURNS TABLE (
    dias_totales INT,
    interes_proyectado NUMERIC,
    total_a_pagar NUMERIC
) AS $$
DECLARE
    v_monto NUMERIC;
    v_tasa NUMERIC;
    v_dias_actuales INT;
BEGIN
    -- Obtener datos del crédito
    SELECT 
        monto_prestado,
        tasa_interes,
        dias_transcurridos
    INTO v_monto, v_tasa, v_dias_actuales
    FROM public.creditos
    WHERE id = p_credito_id;
    
    IF v_monto IS NULL THEN
        RAISE EXCEPTION 'Crédito no encontrado: %', p_credito_id;
    END IF;
    
    -- Calcular proyección
    dias_totales := COALESCE(v_dias_actuales, 0) + p_dias_adicionales;
    
    interes_proyectado := ROUND(
        v_monto * (v_tasa / 100.0) * (dias_totales / 30.0),
        2
    );
    
    total_a_pagar := v_monto + interes_proyectado;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- 6. CREAR VISTA para información completa de intereses
CREATE OR REPLACE VIEW public.vista_creditos_intereses AS
SELECT 
    c.id,
    c.codigo,
    c.monto_prestado,
    c.tasa_interes,
    c.dias_transcurridos,
    c.interes_devengado_actual,
    c.fecha_desembolso,
    c.fecha_vencimiento,
    c.saldo_pendiente,
    c.estado_detallado,
    -- Interés total a vencimiento
    ROUND(
        c.monto_prestado * (c.tasa_interes / 100.0) * (c.periodo_dias / 30.0),
        2
    ) as interes_total_vencimiento,
    -- Porcentaje de interés devengado
    CASE 
        WHEN c.periodo_dias > 0 THEN
            ROUND((COALESCE(c.dias_transcurridos, 0)::NUMERIC / c.periodo_dias::NUMERIC) * 100, 2)
        ELSE 0
    END as porcentaje_devengado,
    cl.nombres as cliente_nombre,
    cl.numero_documento as cliente_dni
FROM public.creditos c
LEFT JOIN public.clientes cl ON c.cliente_id = cl.id
WHERE c.estado_detallado NOT IN ('cancelado', 'ejecutado', 'anulado');

-- 7. COMENTARIOS para documentación
COMMENT ON COLUMN public.creditos.dias_transcurridos IS 
'Días transcurridos desde el desembolso hasta hoy (actualizado automáticamente por trigger)';

COMMENT ON COLUMN public.creditos.interes_devengado_actual IS 
'Interés devengado hasta la fecha actual (actualizado automáticamente por trigger). Fórmula: Capital × (Tasa/100) × (Días/30)';

COMMENT ON FUNCTION public.calcular_interes_actual(UUID, DATE) IS 
'Calcula el interés devengado para un crédito en una fecha específica';

COMMENT ON FUNCTION public.proyectar_interes(UUID, INT) IS 
'Proyecta el interés futuro agregando días adicionales';

COMMENT ON VIEW public.vista_creditos_intereses IS 
'Vista completa de créditos con información de intereses calculados';

-- 8. CREAR ÍNDICE para mejorar performance
CREATE INDEX IF NOT EXISTS idx_creditos_dias_transcurridos ON public.creditos(dias_transcurridos);

-- 9. ACTUALIZAR créditos existentes para calcular valores iniciales
UPDATE public.creditos 
SET monto_prestado = monto_prestado  -- Esto activa el trigger
WHERE dias_transcurridos IS NULL;

-- ============================================================================
-- Fin de migración
-- ============================================================================
