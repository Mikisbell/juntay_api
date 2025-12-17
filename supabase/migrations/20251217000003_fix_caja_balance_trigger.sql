-- Function to update box balance
CREATE OR REPLACE FUNCTION public.actualizar_saldo_caja()
RETURNS TRIGGER AS $$
BEGIN
    -- Update saldo_actual in cajas_operativas
    -- Logic: Check Type (INGRESO/EGRESO)
    -- Monto is always positive due to chk_monto_positivo
    
    IF NEW.tipo = 'EGRESO' THEN
        UPDATE public.cajas_operativas
        SET saldo_actual = saldo_actual - NEW.monto
        WHERE id = NEW.caja_id; -- Use caja_id (mapped from view or direct)
    ELSE
        UPDATE public.cajas_operativas
        SET saldo_actual = saldo_actual + NEW.monto
        WHERE id = NEW.caja_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to ensure clean slate
DROP TRIGGER IF EXISTS trg_actualizar_saldo_caja ON public.movimientos_caja_operativa;
DROP TRIGGER IF EXISTS trg_movimiento_caja_update_saldo ON public.movimientos_caja_operativa;

-- Create Trigger
CREATE TRIGGER trg_actualizar_saldo_caja
AFTER INSERT ON public.movimientos_caja_operativa
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_saldo_caja();
