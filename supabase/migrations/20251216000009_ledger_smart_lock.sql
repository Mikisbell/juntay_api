
-- ============================================================================
-- JUNTAY API - SMART LOCKING (INMUTABILIDAD SELECTIVA)
-- Fecha: 2025-12-16
-- Descripción: Protege el ledger financiero contra borrados y cambios de monto,
-- pero permite correcciones cosméticas (descripción, metadata).
-- ============================================================================

BEGIN;

-- 1. Función Protectora
CREATE OR REPLACE FUNCTION public.fn_protect_ledger_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- A. DELETE (Destrucción de Evidencia) -> PROHIBIDO TOTALMENTE
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'ELIMINACIÓN PROHIBIDA: El ledger financiero es inmutable. Para corregir, genere una contra-transacción.';
    END IF;

    -- B. UPDATE (Edición) -> SELECTIVO
    IF TG_OP = 'UPDATE' THEN
        -- Verificamos si se intentó tocar campos "Sagrados"
        -- Usamos IS DISTINCT FROM para manejar NULLs correctamente si los hubiera
        IF OLD.monto <> NEW.monto OR
           OLD.origen_cuenta_id IS DISTINCT FROM NEW.origen_cuenta_id OR
           OLD.destino_cuenta_id IS DISTINCT FROM NEW.destino_cuenta_id OR
           OLD.tipo <> NEW.tipo OR
           OLD.fecha_operacion <> NEW.fecha_operacion THEN
            
            RAISE EXCEPTION 'MODIFICACIÓN FINANCIERA PROHIBIDA: No puede alterar montos, fechas o cuentas. Genere una contra-transacción.';
        END IF;

        -- Si llegamos aquí, es porque solo tocó campos permitidos (descripcion, metadata, evidencia_ref)
        -- Permitimos pasar.
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger en Transacciones de Capital
DROP TRIGGER IF EXISTS trg_ledger_smart_lock ON public.transacciones_capital;

CREATE TRIGGER trg_ledger_smart_lock
BEFORE UPDATE OR DELETE ON public.transacciones_capital
FOR EACH ROW EXECUTE FUNCTION public.fn_protect_ledger_integrity();

COMMENT ON FUNCTION public.fn_protect_ledger_integrity IS 'Guardián del Ledger: Bloquea ediciones financieras y borrados, permite notas.';

COMMIT;
