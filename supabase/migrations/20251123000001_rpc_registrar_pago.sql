-- 🤖 FUNCIÓN MAESTRA: Procesamiento de Pagos v3.0
-- Maneja Renovaciones (Interés) y Desempeños (Capital + Interés)

CREATE OR REPLACE FUNCTION public.registrar_pago_oficial(
    p_caja_id UUID,              -- Quién cobra
    p_credito_id UUID,           -- Qué contrato
    p_monto_pago DECIMAL,        -- Cuánto dinero entra
    p_tipo_operacion TEXT,       -- 'RENOVACION' o 'DESEMPENO'
    p_metodo_pago TEXT,          -- 'EFECTIVO', 'YAPE'
    p_metadata JSONB DEFAULT '{}'::jsonb -- Evidencia Yape
)
RETURNS JSONB -- Retorna el nuevo estado
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
BEGIN
    -- 1. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = p_credito_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crédito no encontrado';
    END IF;

    IF v_credito.estado = 'pagado' OR v_credito.estado = 'cancelado' THEN
        RAISE EXCEPTION 'Este crédito ya está cancelado.';
    END IF;

    -- 2. LÓGICA SEGÚN TIPO DE OPERACIÓN
    IF p_tipo_operacion = 'RENOVACION' THEN
        -- Regla: Para renovar, debe cubrir al menos el interés acumulado
        v_interes_pagado := p_monto_pago;
        
        -- Extender vencimiento (usar el periodo original del crédito)
        v_nuevo_vencimiento := v_credito.fecha_vencimiento + (v_credito.periodo_dias || ' days')::INTERVAL;
        
        UPDATE public.creditos 
        SET fecha_vencimiento = v_nuevo_vencimiento,
            interes_acumulado = 0, -- Resetear interés acumulado
            estado = 'vigente' -- Si estaba vencido, revive
        WHERE id = p_credito_id;
        
        v_mensaje := 'Renovación exitosa. Nuevo vencimiento: ' || v_nuevo_vencimiento;

    ELSIF p_tipo_operacion = 'DESEMPENO' THEN
        -- Regla: Debe cubrir Todo (Capital + Interés)
        v_capital_pagado := v_credito.saldo_pendiente; 
        v_interes_pagado := p_monto_pago - v_capital_pagado;
        
        UPDATE public.creditos 
        SET saldo_pendiente = 0,
            interes_acumulado = 0,
            estado = 'cancelado',
            fecha_cancelacion = NOW()
        WHERE id = p_credito_id;
        
        -- Liberar garantía automáticamente
        UPDATE public.garantias 
        SET estado = 'liberada' 
        WHERE id = v_credito.garantia_id;
        
        v_mensaje := 'Crédito cancelado y prenda liberada.';
    ELSE
        RAISE EXCEPTION 'Tipo de operación inválido';
    END IF;

    -- 3. REGISTRAR EL PAGO (Historial)
    INSERT INTO public.pagos (
        credito_id, caja_operativa_id, monto_total, 
        desglose_capital, desglose_interes, medio_pago, metadata
    ) VALUES (
        p_credito_id, p_caja_id, p_monto_pago,
        v_capital_pagado, v_interes_pagado, p_metodo_pago, p_metadata
    );

    -- 4. OBTENER SALDO ACTUAL DE CAJA Y CALCULAR NUEVO
    SELECT saldo_actual INTO v_saldo_anterior 
    FROM public.cajas_operativas 
    WHERE id = p_caja_id;
    
    v_saldo_nuevo := v_saldo_anterior + p_monto_pago;

    -- 5. MOVER EL DINERO (Ledger de Caja)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto,
        saldo_anterior, saldo_nuevo,
        referencia_id, descripcion, metadata
    ) VALUES (
        p_caja_id, 'INGRESO', 
        CASE WHEN p_tipo_operacion = 'RENOVACION' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
        p_monto_pago,
        v_saldo_anterior, v_saldo_nuevo,
        p_credito_id, v_mensaje, p_metadata
    );

    -- 6. ACTUALIZAR SALDO DE CAJA
    UPDATE public.cajas_operativas
    SET saldo_actual = v_saldo_nuevo
    WHERE id = p_caja_id;

    RETURN jsonb_build_object(
        'success', true, 
        'mensaje', v_mensaje,
        'nuevo_saldo_caja', v_saldo_nuevo
    );
END;
$$;
