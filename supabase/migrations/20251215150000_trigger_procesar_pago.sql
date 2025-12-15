
-- 15/12/2025: Trigger para procesar lógica de negocio al insertar pagos (Replica RxDB)
-- Reemplaza la necesidad de RPC para el flujo offline-first

CREATE OR REPLACE FUNCTION public.procesar_pago_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_credito RECORD;
    v_nuevo_vencimiento DATE;
    v_interes_pagado DECIMAL := 0;
    v_capital_pagado DECIMAL := 0;
    v_mensaje TEXT;
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
    v_monto_decimal DECIMAL;
BEGIN
    -- Evitar recursión si ya se procesó (usando un flag en metadata o checkeando movimientos)
    -- En este caso, asumimos que todo INSERT a pagos debe procesarse si viene de cliente (usuario_id not null)
    
    -- Convertir monto a decimal (monto puede venir como string o numeric)
    -- Usamos CASE para manejar ambos tipos correctamente
    IF NEW.monto IS NOT NULL THEN
        v_monto_decimal := NEW.monto::DECIMAL;
    ELSIF NEW.monto_total IS NOT NULL THEN
        v_monto_decimal := NEW.monto_total;
    ELSE
        v_monto_decimal := 0;
    END IF;

    -- Actualizar el monto_total numérico si es nulo
    IF NEW.monto_total IS NULL THEN
        NEW.monto_total := v_monto_decimal;
    END IF;

    -- 1. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = NEW.credito_id;

    IF NOT FOUND THEN
        -- Si no hay crédito, no podemos procesar lógica de negocio (ej. pago huerfano)
        RETURN NEW;
    END IF;

    -- 2. CALCULAR MONTOS Y ACTUALIZAR CRÉDITO (Estado)
    IF NEW.tipo = 'renovacion' THEN
        v_interes_pagado := v_monto_decimal;
        
        -- Extender vencimiento
        -- Usar periodo_dias o default 30
        v_nuevo_vencimiento := v_credito.fecha_vencimiento + (COALESCE(v_credito.periodo_dias, 30) || ' days')::INTERVAL;
        
        UPDATE public.creditos 
        SET fecha_vencimiento = v_nuevo_vencimiento,
            interes_acumulado = 0,
            estado = 'vigente',
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        v_mensaje := 'Renovación (Sync). Nuevo vencimiento: ' || v_nuevo_vencimiento;

    ELSIF NEW.tipo = 'desempeno' THEN
        v_capital_pagado := v_credito.saldo_pendiente; 
        v_interes_pagado := v_monto_decimal - v_capital_pagado;
        
        UPDATE public.creditos 
        SET saldo_pendiente = 0,
            interes_acumulado = 0,
            estado = 'cancelado',
            fecha_cancelacion = NOW(),
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        -- Liberar garantía
        UPDATE public.garantias 
        SET estado = 'devuelta',
            fecha_venta = NOW(),
            updated_at = NOW()
        WHERE id = v_credito.garantia_id;
        
        v_mensaje := 'Cancelación (Sync). Prenda devuelta.';
        
    ELSIF NEW.tipo = 'capital' OR NEW.tipo = 'interes' THEN
        -- Amortización parcial (simple)
        UPDATE public.creditos
        SET saldo_pendiente = saldo_pendiente - v_monto_decimal,
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        v_mensaje := 'Pago parcial (Sync).';
    END IF;

    -- 3. INSERTAR MOVIMIENTO DE CAJA (Si no existe ya)
    -- Verificar si ya existe movimiento para este pago (idempotencia)
    IF NOT EXISTS (SELECT 1 FROM public.movimientos_caja_operativa WHERE referencia_id = NEW.credito_id AND fecha = NEW.created_at) THEN
        -- Obtener saldo caja
        SELECT saldo_actual INTO v_saldo_anterior 
        FROM public.cajas_operativas 
        WHERE id = NEW.caja_operativa_id;
        
        IF v_saldo_anterior IS NULL THEN v_saldo_anterior := 0; END IF;
        
        v_saldo_nuevo := v_saldo_anterior + v_monto_decimal;
        
        INSERT INTO public.movimientos_caja_operativa (
            caja_operativa_id, tipo, motivo, monto,
            saldo_anterior, saldo_nuevo,
            referencia_id, descripcion, metadata,
            usuario_id, fecha
        ) VALUES (
            NEW.caja_operativa_id, 'INGRESO', 
            CASE WHEN NEW.tipo = 'renovacion' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
            v_monto_decimal,
            v_saldo_anterior, v_saldo_nuevo,
            NEW.credito_id, v_mensaje, NEW.metadata,
            NEW.usuario_id, NEW.created_at -- Usar fecha del pago original
        );

        -- 4. ACTUALIZAR SALDO CAJA
        UPDATE public.cajas_operativas
        SET saldo_actual = v_saldo_nuevo
        WHERE id = NEW.caja_operativa_id;
    END IF;

    -- Actualizar campos derivados en el registro de pago actual
    NEW.desglose_capital := v_capital_pagado;
    NEW.desglose_interes := v_interes_pagado;

    RETURN NEW;
END;
$$;

-- Crear el Trigger
DROP TRIGGER IF EXISTS trg_procesar_pago_insert ON public.pagos;

CREATE TRIGGER trg_procesar_pago_insert
BEFORE INSERT ON public.pagos
FOR EACH ROW
EXECUTE FUNCTION public.procesar_pago_trigger_fn();
