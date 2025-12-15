
-- 1. Create Trigger Function to update credit balance automatically
CREATE OR REPLACE FUNCTION public.update_saldo_credito_on_pago()
RETURNS TRIGGER AS $$
BEGIN
    -- Update saldo_pendiente
    UPDATE public.creditos
    SET 
        saldo_pendiente = saldo_pendiente - NEW.monto,
        -- Auto-close if balance is near zero (floating point tolerance)
        estado = CASE 
            WHEN (saldo_pendiente - NEW.monto) <= 0.5 THEN 'cancelado' 
            ELSE estado 
        END,
        estado_detallado = CASE 
            WHEN (saldo_pendiente - NEW.monto) <= 0.5 THEN 'cancelado' 
            ELSE estado_detallado 
        END,
        updated_at = NOW()
    WHERE id = NEW.credito_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger on pagos table
DROP TRIGGER IF EXISTS trg_update_saldo_credito ON public.pagos;

CREATE TRIGGER trg_update_saldo_credito
AFTER INSERT ON public.pagos
FOR EACH ROW
EXECUTE FUNCTION public.update_saldo_credito_on_pago();

-- 3. Manual Fix for JT-20251214-9746 (The payment happened before trigger existed)
-- Payment was 1652.00. Original Balance was 1416.00.
-- New Balance should be 0 (or negative/overpaid). Status: Cancelado.
UPDATE public.creditos
SET 
    saldo_pendiente = 0, -- Force to 0 for clean display
    estado = 'cancelado',
    estado_detallado = 'cancelado',
    updated_at = NOW()
WHERE codigo = 'JT-20251214-9746';
