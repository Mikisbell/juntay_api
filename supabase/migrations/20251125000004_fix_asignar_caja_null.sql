-- FIX: Corregir la inicialización del saldo_anterior_caja cuando es NULL
-- Este parche arregla el error "null value in column saldo_anterior violates not-null constraint"

CREATE OR REPLACE FUNCTION public.admin_asignar_caja(
    p_usuario_cajero_id UUID,
    p_monto DECIMAL,
    p_observacion TEXT
)
RETURNS UUID -- ID de la caja abierta/actualizada
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_boveda_id UUID;
    v_caja_id UUID;
    v_saldo_disponible DECIMAL;
    v_saldo_anterior_caja DECIMAL;
BEGIN
    -- 1. Validar Fondos en Bóveda
    SELECT id, saldo_disponible INTO v_boveda_id, v_saldo_disponible 
    FROM public.boveda_central LIMIT 1;

    IF v_saldo_disponible < p_monto THEN
        RAISE EXCEPTION 'Fondos insuficientes en Bóveda Central. Disponible: S/ %, Requerido: S/ %', v_saldo_disponible, p_monto;
    END IF;

    -- 2. Buscar si el cajero ya tiene caja abierta
    SELECT id, saldo_actual INTO v_caja_id, v_saldo_anterior_caja 
    FROM public.cajas_operativas
    WHERE usuario_id = p_usuario_cajero_id AND estado = 'abierta';

    -- 3. Asegurar que saldo_anterior_caja no sea NULL
    v_saldo_anterior_caja := COALESCE(v_saldo_anterior_caja, 0);

    -- 4. Lógica: Abrir nueva o Recargar existente
    IF v_caja_id IS NULL THEN
        -- ABRIR NUEVA CAJA
        INSERT INTO public.cajas_operativas (
            usuario_id, boveda_origen_id, numero_caja, estado,
            saldo_inicial, saldo_actual, fecha_apertura
        ) VALUES (
            p_usuario_cajero_id, v_boveda_id, 
            (SELECT COALESCE(MAX(numero_caja), 0) + 1 FROM public.cajas_operativas),
            'abierta',
            p_monto, p_monto, NOW()
        ) RETURNING id INTO v_caja_id;
    ELSE
        -- RECARGAR (Reposición)
        UPDATE public.cajas_operativas
        SET saldo_actual = saldo_actual + p_monto
        WHERE id = v_caja_id;
    END IF;

    -- 5. Mover dinero de Bóveda (Atomicidad)
    UPDATE public.boveda_central
    SET 
        saldo_disponible = saldo_disponible - p_monto,
        saldo_asignado = saldo_asignado + p_monto
    WHERE id = v_boveda_id;

    -- 6. Registrar Auditoría Bóveda
    INSERT INTO public.movimientos_boveda_auditoria (
        boveda_id, caja_operativa_id, tipo, monto, referencia, usuario_responsable_id
    ) VALUES (
        v_boveda_id, v_caja_id, 'ASIGNACION_CAJA', p_monto, 
        'Asignación a cajero: ' || p_observacion, auth.uid()
    );

    -- 7. Registrar Ingreso en Ledger de Caja (Para que el cajero lo vea)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto, 
        saldo_anterior, saldo_nuevo, 
        descripcion
    ) VALUES (
        v_caja_id, 'INGRESO', 'ASIGNACION_BOVEDA', p_monto,
        v_saldo_anterior_caja, v_saldo_anterior_caja + p_monto,
        'Fondos iniciales/reposición desde Bóveda: ' || p_observacion
    );

    RETURN v_caja_id;
END;
$$;
