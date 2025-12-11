-- ============================================================================
-- ARQUITECTURA LEDGER FLEXIBLE CON REVERSIONES
-- Fecha: 10 Diciembre 2025
-- 
-- Sistema bancario práctico para casa de empeño:
-- - NO bloquea modificaciones (eso es demasiado estricto)
-- - SÍ implementa reversiones (como los bancos reales)
-- - Auditoría completa de quién hizo qué
-- ============================================================================

-- ============================================================================
-- PARTE 1: COLUMNAS PARA SISTEMA DE REVERSIONES
-- ============================================================================

-- 1.1 Agregar campos de reversión a movimientos_caja_operativa
ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE;

ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;

ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS anulado_por UUID REFERENCES auth.users(id);

ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ;

ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS movimiento_reversion_id UUID REFERENCES public.movimientos_caja_operativa(id);

ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS es_reversion BOOLEAN DEFAULT FALSE;

ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS movimiento_original_id UUID REFERENCES public.movimientos_caja_operativa(id);

-- 1.2 Agregar campos a pagos
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE;

ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;

ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS anulado_por UUID REFERENCES auth.users(id);

ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ;

-- Índices
CREATE INDEX IF NOT EXISTS idx_movimientos_anulado ON public.movimientos_caja_operativa(anulado);
CREATE INDEX IF NOT EXISTS idx_pagos_anulado ON public.pagos(anulado);

-- ============================================================================
-- PARTE 2: FUNCIÓN DE REVERSIÓN DE MOVIMIENTOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reversar_movimiento(
    p_movimiento_id UUID,
    p_motivo TEXT,
    p_usuario_id UUID DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    mensaje TEXT,
    movimiento_reversion_id UUID
) AS $$
DECLARE
    v_mov RECORD;
    v_tipo_inverso VARCHAR(50);
    v_nuevo_id UUID;
    v_caja RECORD;
BEGIN
    -- 1. Obtener movimiento original
    SELECT * INTO v_mov 
    FROM public.movimientos_caja_operativa 
    WHERE id = p_movimiento_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Movimiento no encontrado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 2. Verificar que no esté ya anulado
    IF v_mov.anulado THEN
        RETURN QUERY SELECT FALSE, 'Este movimiento ya fue anulado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 3. Verificar que no sea una reversión
    IF v_mov.es_reversion THEN
        RETURN QUERY SELECT FALSE, 'No se puede reversar una reversión'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 4. Determinar tipo inverso
    v_tipo_inverso := CASE v_mov.tipo 
        WHEN 'INGRESO' THEN 'EGRESO' 
        ELSE 'INGRESO' 
    END;
    
    -- 5. Obtener saldo actual de caja
    SELECT saldo_actual INTO v_caja 
    FROM public.cajas_operativas 
    WHERE id = v_mov.caja_operativa_id;
    
    -- 6. Crear movimiento de reversión
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id,
        caja_id,
        tipo,
        motivo,
        monto,
        saldo_anterior,
        saldo_nuevo,
        descripcion,
        usuario_id,
        es_reversion,
        movimiento_original_id,
        metadata
    ) VALUES (
        v_mov.caja_operativa_id,
        v_mov.caja_id,
        v_tipo_inverso,
        'REVERSION',
        v_mov.monto,
        v_caja.saldo_actual,
        CASE v_tipo_inverso 
            WHEN 'INGRESO' THEN v_caja.saldo_actual + v_mov.monto
            ELSE v_caja.saldo_actual - v_mov.monto
        END,
        'REVERSIÓN: ' || p_motivo || ' (Original: ' || v_mov.descripcion || ')',
        COALESCE(p_usuario_id, v_mov.usuario_id),
        TRUE,
        p_movimiento_id,
        jsonb_build_object(
            'movimiento_original', p_movimiento_id,
            'monto_original', v_mov.monto,
            'motivo_reversion', p_motivo
        )
    ) RETURNING id INTO v_nuevo_id;
    
    -- 7. Marcar movimiento original como anulado
    UPDATE public.movimientos_caja_operativa
    SET 
        anulado = TRUE,
        motivo_anulacion = p_motivo,
        anulado_por = p_usuario_id,
        anulado_at = NOW(),
        movimiento_reversion_id = v_nuevo_id
    WHERE id = p_movimiento_id;
    
    -- 8. Actualizar saldo de caja
    UPDATE public.cajas_operativas
    SET saldo_actual = CASE v_tipo_inverso 
        WHEN 'INGRESO' THEN saldo_actual + v_mov.monto
        ELSE saldo_actual - v_mov.monto
    END
    WHERE id = v_mov.caja_operativa_id;
    
    RETURN QUERY SELECT TRUE, 
        ('Movimiento reversado. Nuevo saldo ajustado.')::TEXT, 
        v_nuevo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PARTE 3: FUNCIÓN DE ANULACIÓN DE PAGOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.anular_pago(
    p_pago_id UUID,
    p_motivo TEXT,
    p_usuario_id UUID DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    mensaje TEXT
) AS $$
DECLARE
    v_pago RECORD;
    v_credito RECORD;
BEGIN
    -- 1. Obtener pago
    SELECT * INTO v_pago FROM public.pagos WHERE id = p_pago_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Pago no encontrado'::TEXT;
        RETURN;
    END IF;
    
    IF v_pago.anulado THEN
        RETURN QUERY SELECT FALSE, 'Este pago ya fue anulado'::TEXT;
        RETURN;
    END IF;
    
    -- 2. Marcar pago como anulado
    UPDATE public.pagos
    SET 
        anulado = TRUE,
        motivo_anulacion = p_motivo,
        anulado_por = p_usuario_id,
        anulado_at = NOW()
    WHERE id = p_pago_id;
    
    -- 3. Revertir efecto en crédito (si aplica)
    IF v_pago.credito_id IS NOT NULL THEN
        UPDATE public.creditos
        SET 
            saldo_pendiente = saldo_pendiente + COALESCE(v_pago.desglose_capital, 0),
            interes_acumulado = interes_acumulado + COALESCE(v_pago.desglose_interes, 0)
        WHERE id = v_pago.credito_id;
    END IF;
    
    -- 4. Registrar en auditoría
    INSERT INTO public.audit_log (
        tabla, registro_id, accion, usuario_id,
        datos_anteriores, datos_nuevos, metadata
    ) VALUES (
        'pagos', p_pago_id, 'ANULACION', p_usuario_id,
        to_jsonb(v_pago),
        jsonb_build_object('anulado', TRUE, 'motivo', p_motivo),
        jsonb_build_object('saldo_revertido', COALESCE(v_pago.desglose_capital, 0))
    );
    
    RETURN QUERY SELECT TRUE, 'Pago anulado y saldo de crédito restaurado'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PARTE 4: VISTA DE MOVIMIENTOS EFECTIVOS (excluye anulados)
-- ============================================================================

CREATE OR REPLACE VIEW public.movimientos_efectivos AS
SELECT 
    m.*,
    CASE WHEN m.anulado THEN 0 ELSE 
        CASE m.tipo WHEN 'INGRESO' THEN m.monto ELSE -m.monto END
    END as efecto_neto
FROM public.movimientos_caja_operativa m
ORDER BY m.fecha DESC;

-- Vista de pagos efectivos
CREATE OR REPLACE VIEW public.pagos_efectivos AS
SELECT * FROM public.pagos WHERE anulado = FALSE OR anulado IS NULL;

-- ============================================================================
-- PARTE 5: FUNCIÓN PARA CALCULAR SALDO REAL (excluye anulados)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_saldo_caja_efectivo(p_caja_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_saldo_inicial NUMERIC;
    v_movimientos NUMERIC;
BEGIN
    SELECT COALESCE(saldo_inicial, 0) INTO v_saldo_inicial
    FROM public.cajas_operativas WHERE id = p_caja_id;
    
    SELECT COALESCE(SUM(
        CASE 
            WHEN anulado = TRUE THEN 0  -- Ignorar anulados
            WHEN tipo = 'INGRESO' THEN monto 
            ELSE -monto 
        END
    ), 0) INTO v_movimientos
    FROM public.movimientos_caja_operativa
    WHERE (caja_operativa_id = p_caja_id OR caja_id = p_caja_id);
    
    RETURN v_saldo_inicial + v_movimientos;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PARTE 6: PERMISOS PARA ANULACIONES (según rol)
-- ============================================================================

-- Función para verificar si usuario puede anular
CREATE OR REPLACE FUNCTION public.puede_anular_movimiento(
    p_movimiento_id UUID,
    p_usuario_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_rol VARCHAR;
    v_mov_fecha TIMESTAMPTZ;
    v_horas_transcurridas NUMERIC;
BEGIN
    -- Obtener rol del usuario
    SELECT rol INTO v_rol FROM public.usuarios WHERE id = p_usuario_id;
    
    -- Obtener fecha del movimiento
    SELECT fecha INTO v_mov_fecha 
    FROM public.movimientos_caja_operativa 
    WHERE id = p_movimiento_id;
    
    v_horas_transcurridas := EXTRACT(EPOCH FROM (NOW() - v_mov_fecha)) / 3600;
    
    -- Reglas por rol:
    -- Admin: puede anular cualquier cosa
    -- Gerente: puede anular hasta 7 días
    -- Cajero: solo puede anular del mismo día
    RETURN CASE
        WHEN v_rol IN ('admin', 'super_admin') THEN TRUE
        WHEN v_rol = 'gerente' AND v_horas_transcurridas <= 168 THEN TRUE  -- 7 días
        WHEN v_rol = 'cajero' AND v_horas_transcurridas <= 24 THEN TRUE   -- 1 día
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PARTE 7: MANTENER EVENT SOURCING (OPCIONAL, NO BLOQUEA)
-- ============================================================================

-- Tabla de eventos SIN triggers de bloqueo
CREATE TABLE IF NOT EXISTS public.eventos_sistema (
    id BIGSERIAL PRIMARY KEY,
    agregado_tipo VARCHAR(50) NOT NULL,
    agregado_id UUID NOT NULL,
    evento_tipo VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    version INT NOT NULL DEFAULT 1,
    usuario_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_agregado ON public.eventos_sistema(agregado_tipo, agregado_id);

-- Función helper (sin bloqueos)
CREATE OR REPLACE FUNCTION public.registrar_evento(
    p_agregado_tipo VARCHAR(50),
    p_agregado_id UUID,
    p_evento_tipo VARCHAR(100),
    p_payload JSONB DEFAULT '{}',
    p_usuario_id UUID DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_version INT;
    v_evento_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
    FROM public.eventos_sistema
    WHERE agregado_tipo = p_agregado_tipo AND agregado_id = p_agregado_id;
    
    INSERT INTO public.eventos_sistema (
        agregado_tipo, agregado_id, evento_tipo, payload, version, usuario_id
    ) VALUES (
        p_agregado_tipo, p_agregado_id, p_evento_tipo, p_payload, v_version, p_usuario_id
    ) RETURNING id INTO v_evento_id;
    
    RETURN v_evento_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMENTARIOS ACTUALIZADOS
-- ============================================================================

COMMENT ON FUNCTION public.reversar_movimiento IS 
'Crea movimiento inverso y marca original como anulado. NO borra nada. Auditoría completa.';

COMMENT ON FUNCTION public.anular_pago IS 
'Marca pago como anulado y revierte efecto en crédito. Historial preservado.';

COMMENT ON FUNCTION public.puede_anular_movimiento IS 
'Verifica permisos: Admin=todo, Gerente=7días, Cajero=mismo día';

COMMENT ON VIEW public.movimientos_efectivos IS 
'Movimientos excluyendo anulados. Usar para cálculos de saldo.';

-- ============================================================================
-- FIN - Sistema flexible con auditoría completa
-- ============================================================================
