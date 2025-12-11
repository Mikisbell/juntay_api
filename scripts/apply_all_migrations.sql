-- ============================================================================
-- MIGRACIÓN CONSOLIDADA - Aplica todo lo faltante
-- Ejecutar este script en Supabase Dashboard > SQL Editor
-- Fecha: 10 Diciembre 2025
-- ============================================================================

-- ============================================================================
-- 1. TABLAS FALTANTES
-- ============================================================================

-- audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla TEXT NOT NULL,
    registro_id UUID NOT NULL,
    accion TEXT NOT NULL,
    usuario_id UUID REFERENCES auth.users(id),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_tabla ON public.audit_log(tabla);
CREATE INDEX IF NOT EXISTS idx_audit_log_registro ON public.audit_log(registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);

-- eventos_sistema
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
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON public.eventos_sistema(evento_tipo);

-- notificaciones_pendientes
CREATE TABLE IF NOT EXISTS public.notificaciones_pendientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id),
    credito_id UUID REFERENCES public.creditos(id),
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    monto NUMERIC(12,2),
    telefono TEXT,
    email TEXT,
    estado TEXT DEFAULT 'pendiente',
    fecha_envio TIMESTAMPTZ,
    fecha_procesado TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_cliente ON public.notificaciones_pendientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notif_estado ON public.notificaciones_pendientes(estado);

-- ============================================================================
-- 2. COLUMNAS FALTANTES EN CREDITOS
-- ============================================================================

ALTER TABLE public.creditos ADD COLUMN IF NOT EXISTS codigo_credito VARCHAR(50);
ALTER TABLE public.creditos ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
ALTER TABLE public.creditos ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Migrar datos existentes
UPDATE public.creditos SET codigo_credito = codigo WHERE codigo_credito IS NULL AND codigo IS NOT NULL;
UPDATE public.creditos SET fecha_inicio = fecha_desembolso::DATE WHERE fecha_inicio IS NULL AND fecha_desembolso IS NOT NULL;

-- ============================================================================
-- 3. COLUMNAS FALTANTES EN GARANTIAS
-- ============================================================================

ALTER TABLE public.garantias ADD COLUMN IF NOT EXISTS fecha_venta TIMESTAMPTZ;
ALTER TABLE public.garantias ADD COLUMN IF NOT EXISTS precio_venta NUMERIC(12,2);
ALTER TABLE public.garantias ADD COLUMN IF NOT EXISTS credito_id UUID REFERENCES public.creditos(id);
ALTER TABLE public.garantias ADD COLUMN IF NOT EXISTS fotos TEXT[];

-- Sincronizar fotos con fotos_urls
UPDATE public.garantias SET fotos = fotos_urls WHERE fotos IS NULL AND fotos_urls IS NOT NULL;

-- ============================================================================
-- 4. COLUMNAS FALTANTES EN PAGOS
-- ============================================================================

ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'PAGO';
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50);
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE;
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS anulado_por UUID REFERENCES auth.users(id);
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ;
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Migrar datos
UPDATE public.pagos SET metodo_pago = medio_pago WHERE metodo_pago IS NULL AND medio_pago IS NOT NULL;

-- ============================================================================
-- 5. COLUMNAS FALTANTES EN MOVIMIENTOS_CAJA_OPERATIVA
-- ============================================================================

ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE;
ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;
ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado_por UUID REFERENCES auth.users(id);
ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS anulado_at TIMESTAMPTZ;
ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS movimiento_reversion_id UUID;
ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS es_reversion BOOLEAN DEFAULT FALSE;
ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS movimiento_original_id UUID;
ALTER TABLE public.movimientos_caja_operativa ADD COLUMN IF NOT EXISTS caja_id UUID;

-- ============================================================================
-- 6. FUNCIONES RPC DE REVERSIÓN (si no existen)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reversar_movimiento(
    p_movimiento_id UUID,
    p_motivo TEXT,
    p_usuario_id UUID DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, mensaje TEXT, movimiento_reversion_id UUID) AS $$
DECLARE
    v_mov RECORD;
    v_tipo_inverso VARCHAR(50);
    v_nuevo_id UUID;
    v_caja RECORD;
BEGIN
    SELECT * INTO v_mov FROM public.movimientos_caja_operativa WHERE id = p_movimiento_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Movimiento no encontrado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    IF v_mov.anulado THEN
        RETURN QUERY SELECT FALSE, 'Este movimiento ya fue anulado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    IF v_mov.es_reversion THEN
        RETURN QUERY SELECT FALSE, 'No se puede reversar una reversión'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    v_tipo_inverso := CASE v_mov.tipo WHEN 'INGRESO' THEN 'EGRESO' ELSE 'INGRESO' END;
    
    SELECT saldo_actual INTO v_caja FROM public.cajas_operativas WHERE id = v_mov.caja_operativa_id;
    
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, caja_id, tipo, motivo, monto, saldo_anterior, saldo_nuevo,
        descripcion, usuario_id, es_reversion, movimiento_original_id, metadata
    ) VALUES (
        v_mov.caja_operativa_id, v_mov.caja_id, v_tipo_inverso, 'REVERSION', v_mov.monto,
        v_caja.saldo_actual,
        CASE v_tipo_inverso WHEN 'INGRESO' THEN v_caja.saldo_actual + v_mov.monto ELSE v_caja.saldo_actual - v_mov.monto END,
        'REVERSIÓN: ' || p_motivo, COALESCE(p_usuario_id, v_mov.usuario_id),
        TRUE, p_movimiento_id, jsonb_build_object('motivo_reversion', p_motivo)
    ) RETURNING id INTO v_nuevo_id;
    
    UPDATE public.movimientos_caja_operativa
    SET anulado = TRUE, motivo_anulacion = p_motivo, anulado_por = p_usuario_id,
        anulado_at = NOW(), movimiento_reversion_id = v_nuevo_id
    WHERE id = p_movimiento_id;
    
    UPDATE public.cajas_operativas
    SET saldo_actual = CASE v_tipo_inverso 
        WHEN 'INGRESO' THEN saldo_actual + v_mov.monto 
        ELSE saldo_actual - v_mov.monto END
    WHERE id = v_mov.caja_operativa_id;
    
    RETURN QUERY SELECT TRUE, 'Movimiento reversado correctamente'::TEXT, v_nuevo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.anular_pago(
    p_pago_id UUID,
    p_motivo TEXT,
    p_usuario_id UUID DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, mensaje TEXT) AS $$
DECLARE
    v_pago RECORD;
BEGIN
    SELECT * INTO v_pago FROM public.pagos WHERE id = p_pago_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Pago no encontrado'::TEXT;
        RETURN;
    END IF;
    
    IF v_pago.anulado THEN
        RETURN QUERY SELECT FALSE, 'Este pago ya fue anulado'::TEXT;
        RETURN;
    END IF;
    
    UPDATE public.pagos
    SET anulado = TRUE, motivo_anulacion = p_motivo, anulado_por = p_usuario_id, anulado_at = NOW()
    WHERE id = p_pago_id;
    
    IF v_pago.credito_id IS NOT NULL THEN
        UPDATE public.creditos
        SET saldo_pendiente = saldo_pendiente + COALESCE(v_pago.desglose_capital, 0)
        WHERE id = v_pago.credito_id;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Pago anulado correctamente'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_saldo_caja_efectivo(p_caja_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_saldo_inicial NUMERIC;
    v_movimientos NUMERIC;
BEGIN
    SELECT COALESCE(saldo_inicial, 0) INTO v_saldo_inicial
    FROM public.cajas_operativas WHERE id = p_caja_id;
    
    SELECT COALESCE(SUM(
        CASE WHEN anulado = TRUE THEN 0
             WHEN tipo = 'INGRESO' THEN monto 
             ELSE -monto END
    ), 0) INTO v_movimientos
    FROM public.movimientos_caja_operativa
    WHERE caja_operativa_id = p_caja_id OR caja_id = p_caja_id;
    
    RETURN v_saldo_inicial + v_movimientos;
END;
$$ LANGUAGE plpgsql STABLE;

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

CREATE OR REPLACE FUNCTION public.puede_anular_movimiento(
    p_movimiento_id UUID,
    p_usuario_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_rol VARCHAR;
    v_mov_fecha TIMESTAMPTZ;
    v_horas NUMERIC;
BEGIN
    SELECT rol INTO v_rol FROM public.usuarios WHERE id = p_usuario_id;
    SELECT fecha INTO v_mov_fecha FROM public.movimientos_caja_operativa WHERE id = p_movimiento_id;
    v_horas := EXTRACT(EPOCH FROM (NOW() - v_mov_fecha)) / 3600;
    
    RETURN CASE
        WHEN v_rol IN ('admin', 'super_admin') THEN TRUE
        WHEN v_rol = 'gerente' AND v_horas <= 168 THEN TRUE
        WHEN v_rol = 'cajero' AND v_horas <= 24 THEN TRUE
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 7. ÍNDICES ADICIONALES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_creditos_cliente ON public.creditos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_creditos_estado ON public.creditos(estado);
CREATE INDEX IF NOT EXISTS idx_creditos_codigo ON public.creditos(codigo_credito);
CREATE INDEX IF NOT EXISTS idx_garantias_estado ON public.garantias(estado);
CREATE INDEX IF NOT EXISTS idx_garantias_cliente ON public.garantias(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_credito ON public.pagos(credito_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_anulado ON public.movimientos_caja_operativa(anulado);

-- ============================================================================
-- FIN - Ejecutar verificación después:
-- npx tsx scripts/verify_migrations.ts
-- ============================================================================
