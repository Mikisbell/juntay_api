-- Migración: Actualizar RPC registrar_pago_oficial para Multi-tenant
-- Fecha: 2025-12-20

CREATE OR REPLACE FUNCTION public.registrar_pago_oficial(
    p_caja_id uuid, 
    p_credito_id uuid, 
    p_monto_pago numeric, 
    p_tipo_operacion text, 
    p_metodo_pago text, 
    p_metadata jsonb DEFAULT '{}'::jsonb, 
    p_usuario_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_credito RECORD;
    v_nuevo_vencimiento DATE;
    v_interes_pagado DECIMAL := 0;
    v_capital_pagado DECIMAL := 0;
    v_mensaje TEXT;
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
    v_empresa_id UUID;
    v_caja_empresa_id UUID;
BEGIN
    -- 1. OBTENER DATOS DE CAJA Y VALIDAR EMPRESA
    SELECT empresa_id, saldo_actual INTO v_caja_empresa_id, v_saldo_anterior
    FROM public.cajas_operativas
    WHERE id = p_caja_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caja operativa no encontrada';
    END IF;

    -- Usar el empresa_id de la caja como la verdad absoluta para esta transacción
    v_empresa_id := v_caja_empresa_id;

    IF v_empresa_id IS NULL THEN
        -- Fallback si la caja no tiene empresa_id (no debería pasar post-migración)
        SELECT empresa_id INTO v_empresa_id FROM public.usuarios WHERE id = p_usuario_id;
    END IF;

    -- 2. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = p_credito_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crédito no encontrado';
    END IF;

    -- Validar Cross-Tenant (Seguridad Crítica)
    IF v_credito.empresa_id IS NOT NULL AND v_credito.empresa_id != v_empresa_id THEN
         RAISE EXCEPTION 'Conflicto de seguridad: El crédito pertenece a otra empresa.';
    END IF;

    IF v_credito.estado = 'pagado' OR v_credito.estado = 'cancelado' THEN
        RAISE EXCEPTION 'Este crédito ya está cancelado.';
    END IF;

    -- Validar usuario_id
    IF p_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no identificado (p_usuario_id es NULL)';
    END IF;

    -- 3. CALCULAR MONTOS Y ACTUALIZAR CREDITOS
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
        SET estado = 'devuelta',
            fecha_venta = NOW()
        WHERE id = v_credito.garantia_id;

        v_mensaje := 'Crédito cancelado y prenda devuelta.';
    ELSE
        RAISE EXCEPTION 'Tipo de operación inválido';
    END IF;

    -- 4. REGISTRAR EL PAGO (Historial)
    INSERT INTO public.pagos (
        credito_id, caja_operativa_id, monto_total,
        desglose_capital, desglose_interes,
        metodo_pago, medio_pago,
        metadata, usuario_id,
        empresa_id -- NUEVO
    ) VALUES (
        p_credito_id, p_caja_id, p_monto_pago,
        v_capital_pagado, v_interes_pagado,
        LOWER(p_metodo_pago), p_metodo_pago,
        p_metadata, p_usuario_id,
        v_empresa_id -- Insertamos el empresa_id validado
    );

    -- 5. MOVER EL DINERO (Ledger de Caja)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto,
        saldo_anterior, saldo_nuevo,
        referencia_id, descripcion, metadata,
        usuario_id,
        empresa_id -- NUEVO
    ) VALUES (
        p_caja_id, 'INGRESO',
        CASE WHEN p_tipo_operacion = 'RENOVACION' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
        p_monto_pago,
        v_saldo_anterior, v_saldo_anterior + p_monto_pago,
        p_credito_id, v_mensaje, p_metadata,
        p_usuario_id,
        v_empresa_id -- Insertamos el empresa_id validado
    );

    -- 6. ACTUALIZAR SALDO DE CAJA
    v_saldo_nuevo := v_saldo_anterior + p_monto_pago;
    
    UPDATE public.cajas_operativas
    SET saldo_actual = v_saldo_nuevo
    WHERE id = p_caja_id;

    RETURN jsonb_build_object(
        'success', true,
        'mensaje', v_mensaje,
        'nuevo_saldo_caja', v_saldo_nuevo
    );
END;
$function$;
