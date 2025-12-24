CREATE OR REPLACE FUNCTION public.update_saldo_credito_on_pago()
RETURNS TRIGGER AS $$
DECLARE
    v_monto_decimal DECIMAL;
BEGIN
    -- Fix: Use NEW.monto_total instead of NEW.monto
    IF NEW.monto_total IS NOT NULL THEN
        v_monto_decimal := NEW.monto_total;
    ELSE
        v_monto_decimal := 0;
    END IF;

    -- Update saldo_pendiente
    UPDATE public.creditos
    SET 
        saldo_pendiente = saldo_pendiente - v_monto_decimal,
        -- Auto-close if balance is near zero (floating point tolerance)
        estado = CASE 
            WHEN (saldo_pendiente - v_monto_decimal) <= 0.5 THEN 'cancelado' 
            ELSE estado 
        END,
        estado_detallado = CASE 
            WHEN (saldo_pendiente - v_monto_decimal) <= 0.5 THEN 'cancelado' 
            ELSE estado_detallado 
        END,
        updated_at = NOW()
    WHERE id = NEW.credito_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
