
-- ============================================================================
-- JUNTAY API - LIQUIDACIÓN AUTOMÁTICA DE CAJAS
-- Fecha: 2025-12-16
-- Descripción: Automatiza el retorno de dinero a la Bóveda Principal al cerrar caja.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_liquidar_caja_cerrada()
RETURNS TRIGGER AS $$
DECLARE
    v_boveda_principal_id UUID;
BEGIN
    -- Solo actuar cuando pasa de abierta -> cerrada
    IF OLD.estado = 'abierta' AND NEW.estado = 'cerrada' THEN
        
        -- 1. Buscar Bóveda Principal (Destino del dinero)
        SELECT id INTO v_boveda_principal_id 
        FROM public.cuentas_financieras 
        WHERE es_principal = TRUE 
        LIMIT 1;

        IF v_boveda_principal_id IS NULL THEN
            RAISE EXCEPTION 'ERROR CRÍTICO: No existe Bóveda Principal para recibir la liquidación de caja.';
        END IF;

        -- 2. Crear Transacción de Retorno (CIERRE_CAJA)
        -- Esto disparará el trigger de actualización de saldo en la Bóveda.
        INSERT INTO public.transacciones_capital (
            tipo,
            monto,
            descripcion,
            destino_cuenta_id, -- El dinero entra a la Bóveda
            origen_cuenta_id,  -- NULL (Viene de una entidad operativa externa al ledger financiero)
            metadata,
            created_by
        ) VALUES (
            'CIERRE_CAJA',
            COALESCE(NEW.saldo_final_cierre, 0), -- Asumimos que lo físico es lo que se entrega
            'Liquidación Automática Caja #' || NEW.numero_caja,
            v_boveda_principal_id,
            NULL,
            jsonb_build_object(
                'caja_operativa_id', NEW.id,
                'cajero_id', NEW.usuario_id,
                'diferencia', NEW.diferencia_cierre
            ),
            auth.uid() -- Si lo dispara un RPC, auth.uid() debería estar presente
        );
        
        RAISE NOTICE '📦 Caja % liquidada. S/ % retornados a Bóveda.', NEW.numero_caja, NEW.saldo_final_cierre;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS trg_auto_liquidar_caja ON public.cajas_operativas;

CREATE TRIGGER trg_auto_liquidar_caja
AFTER UPDATE ON public.cajas_operativas
FOR EACH ROW
WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
EXECUTE FUNCTION public.fn_liquidar_caja_cerrada();

COMMIT;
