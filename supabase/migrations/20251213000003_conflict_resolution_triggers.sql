-- Migración: Triggers de Resolución de Conflictos
-- Implementa Opción 2C: Estados terminales no pueden ser sobrescritos
-- 
-- Esta migración crea triggers BEFORE UPDATE que previenen que
-- créditos en estados terminales sean modificados incorrectamente.

-- 1. Función para validar actualizaciones de créditos
CREATE OR REPLACE FUNCTION public.validate_credito_update()
RETURNS TRIGGER AS $$
DECLARE
    estados_terminales TEXT[] := ARRAY['cancelado', 'vendido', 'remate', 'anulado', 'pagado'];
BEGIN
    -- REGLA 1: Si el crédito actual tiene estado terminal, no permitir cambios de estado
    IF OLD.estado = ANY(estados_terminales) THEN
        -- Solo permitir actualización de campos no críticos
        IF NEW.estado != OLD.estado THEN
            RAISE EXCEPTION 'No se puede cambiar el estado de un crédito %', OLD.estado
                USING HINT = 'El crédito ya está en estado terminal';
        END IF;
        
        -- No permitir cambio de montos en estados terminales
        IF NEW.monto_prestado != OLD.monto_prestado OR 
           NEW.saldo_pendiente != OLD.saldo_pendiente THEN
            RAISE EXCEPTION 'No se pueden modificar montos de un crédito %', OLD.estado
                USING HINT = 'El crédito ya está en estado terminal';
        END IF;
    END IF;
    
    -- REGLA 2: ANULADO siempre gana - si se intenta anular, permitirlo
    IF NEW.estado = 'anulado' THEN
        -- Anulación siempre permitida (es el estado de mayor prioridad)
        RETURN NEW;
    END IF;
    
    -- REGLA 3: No permitir "retroceder" de estados terminales a no terminales
    IF OLD.estado = ANY(estados_terminales) AND NOT (NEW.estado = ANY(estados_terminales)) THEN
        RAISE EXCEPTION 'No se puede revertir un crédito desde % a %', OLD.estado, NEW.estado
            USING HINT = 'Los estados terminales no pueden revertirse';
    END IF;
    
    -- Actualizar timestamp de modificación
    NEW._modified = NOW();
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger en tabla creditos
DROP TRIGGER IF EXISTS trigger_validate_credito_update ON public.creditos;
CREATE TRIGGER trigger_validate_credito_update
    BEFORE UPDATE ON public.creditos
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_credito_update();

-- 3. Función para validar que los pagos no modifiquen créditos terminales
CREATE OR REPLACE FUNCTION public.validate_pago_insert()
RETURNS TRIGGER AS $$
DECLARE
    credito_estado TEXT;
    estados_terminales TEXT[] := ARRAY['cancelado', 'vendido', 'remate', 'anulado'];
BEGIN
    -- Obtener el estado actual del crédito
    SELECT estado INTO credito_estado
    FROM public.creditos
    WHERE id = NEW.credito_id;
    
    -- No permitir pagos en créditos con estados terminales (excepto pagado)
    IF credito_estado = ANY(estados_terminales) THEN
        RAISE EXCEPTION 'No se pueden registrar pagos en un crédito %', credito_estado
            USING HINT = 'El crédito está en estado terminal';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger en tabla pagos
DROP TRIGGER IF EXISTS trigger_validate_pago_insert ON public.pagos;
CREATE TRIGGER trigger_validate_pago_insert
    BEFORE INSERT ON public.pagos
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_pago_insert();

-- 5. Comentarios de documentación
COMMENT ON FUNCTION public.validate_credito_update() IS 
'Implementa Opción 2C de resolución de conflictos:
- Estados terminales (cancelado, vendido, remate, anulado, pagado) no pueden cambiar
- Montos no pueden modificarse en estados terminales
- ANULADO tiene máxima prioridad y siempre puede aplicarse
- Previene sincronización conflictiva desde dispositivos offline';

COMMENT ON FUNCTION public.validate_pago_insert() IS
'Previene registro de pagos en créditos terminales para mantener integridad financiera';
