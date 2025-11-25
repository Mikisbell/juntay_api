-- ============================================================================
-- Migración: Estados Detallados del Crédito (Mejora #1)
-- Versión: 1.0
-- Fecha: 2025-11-24
-- Descripción: Implementa ciclo de vida completo de créditos con 12 estados
-- ============================================================================

-- 1. AGREGAR COLUMNA estado_detallado
ALTER TABLE public.creditos 
ADD COLUMN estado_detallado VARCHAR(30);

-- 2. AGREGAR CONSTRAINT con estados válidos
ALTER TABLE public.creditos
ADD CONSTRAINT creditos_estado_detallado_check 
CHECK (estado_detallado IN (
    'vigente',      -- Crédito activo, al día
    'al_dia',       -- Pagó última cuota puntualmente
    'por_vencer',   -- Falta menos de 7 días para vencimiento
    'vencido',      -- Pasó fecha de vencimiento (1-15 días)
    'en_mora',      -- Más de 15 días vencido
    'en_gracia',    -- Periodo de gracia antes de remate (30-60 días)
    'pre_remate',   -- Notificado para remate (60+ días)
    'en_remate',    -- Bien publicado para venta
    'cancelado',    -- Pagado completamente
    'renovado',     -- Renovado con nuevo plazo
    'ejecutado',    -- Bien vendido en remate
    'anulado'       -- Contrato anulado (error operativo)
));

-- 3. MIGRAR DATOS EXISTENTES
-- Todos los créditos actuales se marcan como 'vigente'
UPDATE public.creditos 
SET estado_detallado = 'vigente' 
WHERE estado_detallado IS NULL;

-- 4. HACER COLUMNA NOT NULL (después de migrar datos)
ALTER TABLE public.creditos 
ALTER COLUMN estado_detallado SET NOT NULL;

-- 5. CREAR FUNCIÓN para calcular estado automáticamente
CREATE OR REPLACE FUNCTION public.actualizar_estado_credito()
RETURNS TRIGGER AS $$
DECLARE
    v_dias_hasta_vencimiento INT;
    v_dias_vencido INT;
    v_nuevo_estado VARCHAR(30);
BEGIN
    -- Solo actualizar si el estado no es terminal
    IF NEW.estado_detallado IN ('cancelado', 'renovado', 'ejecutado', 'anulado') THEN
        RETURN NEW;
    END IF;

    -- Calcular días hasta vencimiento
    v_dias_hasta_vencimiento := NEW.fecha_vencimiento - CURRENT_DATE;
    
    -- Calcular días vencido (solo si ya venció)
    IF CURRENT_DATE > NEW.fecha_vencimiento THEN
        v_dias_vencido := CURRENT_DATE - NEW.fecha_vencimiento;
    ELSE
        v_dias_vencido := 0;
    END IF;

    -- Determinar estado según días
    IF v_dias_vencido > 60 THEN
        v_nuevo_estado := 'pre_remate';
    ELSIF v_dias_vencido > 30 THEN
        v_nuevo_estado := 'en_gracia';
    ELSIF v_dias_vencido > 15 THEN
        v_nuevo_estado := 'en_mora';
    ELSIF v_dias_vencido > 0 THEN
        v_nuevo_estado := 'vencido';
    ELSIF v_dias_hasta_vencimiento <= 7 AND v_dias_hasta_vencimiento > 0 THEN
        v_nuevo_estado := 'por_vencer';
    ELSE
        -- Si saldo_pendiente = 0, está cancelado
        IF NEW.saldo_pendiente = 0 THEN
            v_nuevo_estado := 'cancelado';
        ELSE
            v_nuevo_estado := 'vigente';
        END IF;
    END IF;

    NEW.estado_detallado := v_nuevo_estado;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CREAR TRIGGER para actualización automática
CREATE TRIGGER trigger_actualizar_estado_credito
    BEFORE INSERT OR UPDATE ON public.creditos
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_estado_credito();

-- 7. COMENTARIOS para documentación
COMMENT ON COLUMN public.creditos.estado_detallado IS 
'Estado detallado del ciclo de vida del crédito. Se actualiza automáticamente según fechas y pagos.';

COMMENT ON FUNCTION public.actualizar_estado_credito() IS 
'Calcula automáticamente el estado_detallado basándose en fecha_vencimiento y saldo_pendiente.';

-- 8. CREAR ÍNDICE para mejorar rendimiento de consultas por estado
CREATE INDEX idx_creditos_estado_detallado ON public.creditos(estado_detallado);

-- 9. ACTUALIZAR ESTADOS DE CRÉDITOS EXISTENTES (ejecutar trigger)
-- Esto forzará la actualización de todos los créditos según sus fechas
UPDATE public.creditos SET estado_detallado = estado_detallado;

-- ============================================================================
-- Fin de migración
-- ============================================================================
