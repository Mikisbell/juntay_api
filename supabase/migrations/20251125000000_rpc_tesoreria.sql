-- 🤖 FUNCIÓN 1: Inyectar Capital a la Bóveda (Fondeo)
CREATE OR REPLACE FUNCTION public.admin_inyectar_capital(
    p_monto DECIMAL,
    p_origen TEXT,        -- 'SOCIO', 'BANCO', 'PRESTAMO_EXTERNO'
    p_referencia TEXT,    -- 'Aporte Socio Juan', 'Préstamo BCP'
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID -- ID del movimiento
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_boveda_id UUID;
    v_movimiento_id UUID;
    v_saldo_anterior DECIMAL;
BEGIN
    -- 1. Obtener la Bóveda (Singleton)
    SELECT id, saldo_total INTO v_boveda_id, v_saldo_anterior 
    FROM public.boveda_central LIMIT 1;
    
    IF v_boveda_id IS NULL THEN
        RAISE EXCEPTION 'No existe una bóveda central inicializada.';
    END IF;

    -- 2. Actualizar Saldos Bóveda
    UPDATE public.boveda_central
    SET 
        saldo_total = saldo_total + p_monto,
        saldo_disponible = saldo_disponible + p_monto,
        fecha_actualizacion = NOW()
    WHERE id = v_boveda_id;

    -- 3. Registrar Auditoría
    INSERT INTO public.movimientos_boveda_auditoria (
        boveda_id, tipo, monto, 
        saldo_anterior, saldo_nuevo,
        referencia, metadata, usuario_responsable_id
    ) VALUES (
        v_boveda_id, 'INYECCION_CAPITAL', p_monto,
        v_saldo_anterior, v_saldo_anterior + p_monto,
        p_referencia || ' (' || p_origen || ')', 
        p_metadata,
        auth.uid()
    ) RETURNING id INTO v_movimiento_id;

    RETURN v_movimiento_id;
END;
$$;

-- 🤖 FUNCIÓN 2: Asignar Dinero a Cajero (Apertura/Reposición)
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
    v_saldo_anterior_caja DECIMAL := 0;
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

    -- 3. Lógica: Abrir nueva o Recargar existente
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

    -- 4. Mover dinero de Bóveda (Atomicidad)
    UPDATE public.boveda_central
    SET 
        saldo_disponible = saldo_disponible - p_monto,
        saldo_asignado = saldo_asignado + p_monto
    WHERE id = v_boveda_id;

    -- 5. Registrar Auditoría Bóveda
    INSERT INTO public.movimientos_boveda_auditoria (
        boveda_id, caja_operativa_id, tipo, monto, referencia, usuario_responsable_id
    ) VALUES (
        v_boveda_id, v_caja_id, 'ASIGNACION_CAJA', p_monto, 
        'Asignación a cajero: ' || p_observacion, auth.uid()
    );

    -- 6. Registrar Ingreso en Ledger de Caja (Para que el cajero lo vea)
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
