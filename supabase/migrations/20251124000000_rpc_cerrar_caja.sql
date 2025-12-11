-- 🤖 FUNCIÓN MAESTRA: Cierre de Caja (Arqueo Automático) v3.0

-- Primero creamos la función auxiliar si no existe
CREATE OR REPLACE FUNCTION public.calcular_saldo_caja(p_caja_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_saldo DECIMAL;
BEGIN
    -- Obtener el saldo actual directamente de la caja
    SELECT saldo_actual INTO v_saldo
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    RETURN COALESCE(v_saldo, 0);
END;
$$;

-- Función principal de cierre
CREATE OR REPLACE FUNCTION public.cerrar_caja_oficial(
    p_caja_id UUID,              -- La caja a cerrar
    p_monto_fisico DECIMAL,      -- Lo que el cajero contó (Billetes + Monedas)
    p_observaciones TEXT DEFAULT NULL
)
RETURNS JSONB -- Retorna el reporte de cierre
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_saldo_sistema DECIMAL;
    v_diferencia DECIMAL;
    v_estado_cierre TEXT;
    v_caja RECORD;
BEGIN
    -- 1. OBTENER DATOS DE LA CAJA
    SELECT * INTO v_caja
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caja no encontrada';
    END IF;
    
    IF v_caja.estado != 'abierta' THEN
        RAISE EXCEPTION 'La caja ya está cerrada';
    END IF;

    -- 2. CALCULAR SALDO TEÓRICO (La verdad del sistema)
    v_saldo_sistema := public.calcular_saldo_caja(p_caja_id);

    -- 3. CALCULAR DIFERENCIA (Sobrante o Faltante)
    v_diferencia := p_monto_fisico - v_saldo_sistema;

    -- 4. DETERMINAR ESTADO DEL CIERRE
    IF ABS(v_diferencia) < 0.01 THEN  -- Tolerancia de 1 centavo
        v_estado_cierre := 'PERFECTO';
    ELSIF v_diferencia > 0 THEN
        v_estado_cierre := 'SOBRANTE';
    ELSE
        v_estado_cierre := 'FALTANTE';
    END IF;

    -- 5. CERRAR LA CAJA
    UPDATE public.cajas_operativas
    SET 
        estado = 'cerrada',
        fecha_cierre = NOW(),
        saldo_final_cierre = p_monto_fisico,
        diferencia_cierre = v_diferencia,
        observaciones_cierre = p_observaciones
    WHERE id = p_caja_id;

    -- 6. REGISTRAR EL MOVIMIENTO DE CIERRE
    -- 6. REGISTRAR EL MOVIMIENTO DE CIERRE
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto, 
        saldo_anterior, saldo_nuevo,
        descripcion, metadata,
        usuario_id  -- <--- CORRECCIÓN: Campo obligatorio
    ) VALUES (
        p_caja_id, 'INFO', 'CIERRE_CAJA', 0.01, -- Fix monto > 0 constraint (simbólico) o ajustar constraint
        v_saldo_sistema, 0, -- Saldo nuevo es 0 tras cierre
        'Cierre de caja. Estado: ' || v_estado_cierre || '. Diferencia: ' || v_diferencia,
        jsonb_build_object(
            'estado', v_estado_cierre,
            'diferencia', v_diferencia,
            'monto_fisico', p_monto_fisico,
            'saldo_sistema', v_saldo_sistema,
            'observaciones', p_observaciones
        ),
        v_caja.usuario_id -- <--- CORRECCIÓN: Valor del usuario
    );

    -- 7. RETORNAR REPORTE
    RETURN jsonb_build_object(
        'saldo_sistema', v_saldo_sistema,
        'saldo_fisico', p_monto_fisico,
        'diferencia', v_diferencia,
        'estado', v_estado_cierre,
        'fecha_cierre', NOW()
    );
END;
$$;
