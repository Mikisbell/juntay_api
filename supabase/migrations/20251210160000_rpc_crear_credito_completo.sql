-- ============================================================================
-- RPC: crear_credito_completo
-- Crea un crédito con garantía en una transacción atómica
-- ============================================================================

CREATE OR REPLACE FUNCTION crear_credito_completo(
    p_cliente_id UUID,
    p_monto_prestamo NUMERIC,
    p_valor_tasacion NUMERIC,
    p_tasa_interes NUMERIC,
    p_periodo_dias INTEGER,
    p_fecha_inicio TIMESTAMPTZ,
    p_descripcion_garantia TEXT,
    p_fotos TEXT[],
    p_observaciones TEXT DEFAULT NULL,
    p_usuario_id UUID DEFAULT NULL,
    p_caja_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_credito_id UUID;
    v_garantia_id UUID;
    v_codigo_credito TEXT;
    v_interes NUMERIC;
    v_total_pagar NUMERIC;
    v_fecha_vencimiento TIMESTAMPTZ;
    v_saldo_caja NUMERIC;
    v_es_desembolso_inmediato BOOLEAN;
BEGIN
    -- ========================================
    -- VALIDACIONES
    -- ========================================
    
    -- 1. Monto mínimo y máximo
    IF p_monto_prestamo < 50 THEN
        RAISE EXCEPTION 'El monto mínimo de préstamo es S/50';
    END IF;
    
    IF p_monto_prestamo > 50000 THEN
        RAISE EXCEPTION 'El monto máximo de préstamo es S/50,000. Contacte a gerencia.';
    END IF;
    
    -- NOTA: No validamos que préstamo <= tasación
    -- El tasador experto tiene flexibilidad para ajustar según su criterio profesional
    
    -- 3. Tasa de interés válida
    IF p_tasa_interes < 1 OR p_tasa_interes > 50 THEN
        RAISE EXCEPTION 'La tasa de interés debe estar entre 1%% y 50%%';
    END IF;
    
    -- 4. Verificar que el cliente exista
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_cliente_id) THEN
        RAISE EXCEPTION 'El cliente no existe';
    END IF;
    
    -- ========================================
    -- CÁLCULOS
    -- ========================================
    v_interes := p_monto_prestamo * (p_tasa_interes / 100);
    v_total_pagar := p_monto_prestamo + v_interes;
    v_fecha_vencimiento := p_fecha_inicio + (p_periodo_dias || ' days')::INTERVAL;
    
    -- Generar código único
    v_codigo_credito := 'JT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Verificar caja si se proporciona
    v_es_desembolso_inmediato := FALSE;
    IF p_caja_id IS NOT NULL THEN
        SELECT saldo_actual INTO v_saldo_caja
        FROM cajas_operativas
        WHERE id = p_caja_id AND estado = 'abierta';
        
        IF FOUND AND v_saldo_caja >= p_monto_prestamo THEN
            v_es_desembolso_inmediato := TRUE;
        END IF;
    END IF;
    
    -- ========================================
    -- INSERT CRÉDITO
    -- ========================================
    INSERT INTO creditos (
        cliente_id,
        codigo_credito,
        monto_prestado,
        tasa_interes,
        interes_acumulado,
        saldo_pendiente,
        fecha_inicio,
        fecha_vencimiento,
        fecha_desembolso,
        periodo_dias,
        estado,
        estado_detallado,
        observaciones
    ) VALUES (
        p_cliente_id,
        v_codigo_credito,
        p_monto_prestamo,
        p_tasa_interes,
        v_interes,
        v_total_pagar,
        p_fecha_inicio,
        v_fecha_vencimiento,
        CASE WHEN v_es_desembolso_inmediato THEN p_fecha_inicio ELSE NULL END,
        p_periodo_dias,
        CASE WHEN v_es_desembolso_inmediato THEN 'vigente' ELSE 'pendiente' END,
        CASE WHEN v_es_desembolso_inmediato THEN 'vigente' ELSE 'aprobado' END,
        p_observaciones
    )
    RETURNING id INTO v_credito_id;
    
    -- ========================================
    -- INSERT GARANTÍA
    -- ========================================
    INSERT INTO garantias (
        credito_id,
        descripcion,
        valor_tasacion,
        estado,
        fotos
    ) VALUES (
        v_credito_id,
        p_descripcion_garantia,
        p_valor_tasacion,
        'custodia_caja',
        p_fotos
    )
    RETURNING id INTO v_garantia_id;
    
    -- Actualizar crédito con referencia a garantía
    UPDATE creditos SET garantia_id = v_garantia_id WHERE id = v_credito_id;
    
    -- ========================================
    -- MOVIMIENTO DE CAJA (si aplica)
    -- ========================================
    IF v_es_desembolso_inmediato THEN
        INSERT INTO movimientos_caja_operativa (
            caja_operativa_id,
            tipo,
            motivo,
            monto,
            referencia_id,
            descripcion,
            usuario_id,
            saldo_anterior,
            saldo_nuevo
        ) VALUES (
            p_caja_id,
            'EGRESO',
            'DESEMBOLSO_EMPENO',
            p_monto_prestamo,
            v_credito_id,
            'Desembolso Crédito #' || v_codigo_credito,
            p_usuario_id,
            v_saldo_caja,
            v_saldo_caja - p_monto_prestamo
        );
        
        -- Actualizar saldo de caja
        UPDATE cajas_operativas 
        SET saldo_actual = saldo_actual - p_monto_prestamo
        WHERE id = p_caja_id;
    END IF;
    
    -- ========================================
    -- RETORNO
    -- ========================================
    RETURN json_build_object(
        'success', TRUE,
        'creditoId', v_credito_id,
        'garantiaId', v_garantia_id,
        'codigo', v_codigo_credito,
        'estado', CASE WHEN v_es_desembolso_inmediato THEN 'DESEMBOLSADO' ELSE 'PENDIENTE_CAJA' END,
        'monto', p_monto_prestamo,
        'valorTasacion', p_valor_tasacion,
        'tasaInteres', p_tasa_interes,
        'interes', v_interes,
        'totalPagar', v_total_pagar,
        'fechaVencimiento', v_fecha_vencimiento,
        'mensaje', CASE WHEN v_es_desembolso_inmediato 
            THEN '¡Crédito desembolsado!' 
            ELSE 'Crédito aprobado (pendiente desembolso)' 
        END
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback automático por la transacción
        RAISE EXCEPTION 'Error al crear crédito: %', SQLERRM;
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION crear_credito_completo IS 
'Crea un crédito con garantía de forma atómica. Incluye validaciones de límites y tasa.';
