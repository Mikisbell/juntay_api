-- Fix trigger to handle renewals correctly (don't subtract principal)
CREATE OR REPLACE FUNCTION public.update_saldo_credito_on_pago()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle RENEWALS (Renovacion)
    IF NEW.tipo = 'renovacion' THEN
        -- For renewals, we DO NOT subtract from the principal (saldo_pendiente).
        -- The payment covers interest.
        -- We ensure the status is 'vigente'.
        -- Note: The date extension and interest reset are handled by the Client (RxDB) 
        -- and will sync separately. We just ensure we don't mess up the balance here.
        UPDATE public.creditos
        SET 
            estado = 'vigente',
            updated_at = NOW()
        WHERE id = NEW.credito_id;

    ELSE
        -- Standard Logic (Amortizacion, Liquidacion, Interes normal? maybe)
        -- For standard payments, we subtract from balance.
        UPDATE public.creditos
        SET 
            saldo_pendiente = saldo_pendiente - NEW.monto,
            -- Auto-close if balance is near zero
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
