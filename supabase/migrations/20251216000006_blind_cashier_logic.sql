
-- ============================================================================
-- JUNTAY API - BLIND CASHIER LOGIC V2 (DETERMINISTIC)
-- Fecha: 2025-12-16
-- Descripción: Selección automática de fuente de fondos usando Bóveda Principal.
-- ============================================================================

BEGIN;

-- 1. ESTRUCTURA: Determinismo
ALTER TABLE public.cuentas_financieras
ADD COLUMN es_principal BOOLEAN DEFAULT FALSE;

-- Regla de Negocio: Solo una cuenta puede ser la principal
CREATE UNIQUE INDEX idx_cuentas_financieras_single_principal 
ON public.cuentas_financieras (es_principal) 
WHERE es_principal = TRUE;

-- 2. SEMILLA: Establecer Bóveda Principal Inicial
-- Buscamos la cuenta de EFECTIVO creada en la migración 003 y la marcamos
UPDATE public.cuentas_financieras
SET es_principal = TRUE
WHERE id = (
    SELECT id FROM public.cuentas_financieras 
    WHERE tipo = 'EFECTIVO' 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- 3. LÓGICA DE NEGOCIO: Apertura Ciega (Pero Segura)
CREATE OR REPLACE FUNCTION public.admin_asignar_caja(
    p_usuario_cajero_id UUID,
    p_monto NUMERIC,
    p_observacion TEXT
)
RETURNS UUID AS $$
DECLARE
    v_boveda_origen_id UUID;
    v_saldo_boveda NUMERIC;
    v_caja_id UUID;
BEGIN
    -- A. Determinismo: Buscar SIEMPRE en la Bóveda Principal
    SELECT id, saldo INTO v_boveda_origen_id, v_saldo_boveda
    FROM public.cuentas_financieras
    WHERE es_principal = TRUE
    LIMIT 1;

    -- Validaciones Críticas
    IF v_boveda_origen_id IS NULL THEN
        RAISE EXCEPTION 'ERROR DE CONFIGURACIÓN: No existe una Bóveda Principal (es_principal=true).';
    END IF;

    IF v_saldo_boveda < p_monto THEN
        RAISE EXCEPTION 'LIQUIDEZ INSUFICIENTE: La Bóveda Principal tiene S/ %, se requieren S/ %. Notifique a Gerencia para fondeo.', v_saldo_boveda, p_monto;
    END IF;

    -- B. Crear Caja (Flujo normal)
    INSERT INTO public.cajas_operativas (
        usuario_id, 
        cuenta_origen_id, 
        numero_caja, 
        estado, 
        saldo_inicial, 
        saldo_actual,
        fecha_apertura
    ) VALUES (
        p_usuario_cajero_id,
        v_boveda_origen_id,
        (SELECT COALESCE(MAX(numero_caja), 0) + 1 FROM public.cajas_operativas),
        'abierta',
        p_monto,
        p_monto,
        NOW()
    ) RETURNING id INTO v_caja_id;

    -- C. Registrar Movimiento Contable
    INSERT INTO public.transacciones_capital (
        origen_cuenta_id,
        tipo,
        monto,
        descripcion,
        metadata
    ) VALUES (
        v_boveda_origen_id,
        'APERTURA_CAJA',
        p_monto,
        COALESCE(p_observacion, 'Apertura Automática (Default Vault)'),
        jsonb_build_object('caja_operativa_id', v_caja_id, 'cajero_id', p_usuario_cajero_id)
    );

    RETURN v_caja_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN public.cuentas_financieras.es_principal IS 'Indica la cuenta de EFECTIVO por defecto para operaciones automáticas.';

COMMIT;
