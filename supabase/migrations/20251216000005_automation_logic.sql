
-- ============================================================================
-- JUNTAY API - AUTOMATIZACIÓN CONTABLE (TRIGGERS)
-- Fecha: 2025-12-16
-- Descripción: Garantiza que los saldos se actualicen automáticamente al insertar movimientos.
-- ============================================================================

BEGIN;

-- 1. FUNCIÓN: ACTUALIZAR SALDOS DE CUENTAS FINANCIERAS (TESORERÍA)
CREATE OR REPLACE FUNCTION public.fn_update_cuentas_financieras_saldo()
RETURNS TRIGGER AS $$
BEGIN
    -- Caso: SALIDA DE DINERO (Origen)
    IF NEW.origen_cuenta_id IS NOT NULL THEN
        UPDATE public.cuentas_financieras
        SET saldo = saldo - NEW.monto,
            updated_at = NOW()
        WHERE id = NEW.origen_cuenta_id;
    END IF;

    -- Caso: ENTRADA DE DINERO (Destino)
    IF NEW.destino_cuenta_id IS NOT NULL THEN
        UPDATE public.cuentas_financieras
        SET saldo = saldo + NEW.monto,
            updated_at = NOW()
        WHERE id = NEW.destino_cuenta_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER DE CAPITAL
CREATE TRIGGER trg_transaccion_capital_update_saldo
    AFTER INSERT ON public.transacciones_capital
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_update_cuentas_financieras_saldo();


-- 2. FUNCIÓN: ACTUALIZAR SALDO DE CAJA OPERATIVA (CAJEROS)
-- Nota: Asumimos que existe la tabla 'movimientos_caja_operativa' del schema inicial grep
CREATE OR REPLACE FUNCTION public.fn_update_caja_operativa_saldo()
RETURNS TRIGGER AS $$
DECLARE
    factor NUMERIC := 1;
BEGIN
    -- Determinar signo según tipo de movimiento
    -- Asumiendo tipos estandar: 'INGRESO', 'EGRESO', 'GASTO', 'APERTURA'
    IF NEW.tipo IN ('EGRESO', 'GASTO', 'RETIRO', 'DEVOLUCION') THEN
        factor := -1;
    END IF;

    UPDATE public.cajas_operativas
    SET saldo_actual = saldo_actual + (NEW.monto * factor),
        _modified = NOW()
    WHERE id = NEW.caja_operativa_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER DE CAJA (Solo si existe la tabla, usamos safe check o lo creamos directo asumiendo existencia)
-- En el paso 1 encontramos 'movimientos_caja_operativa', asi que procedemos.
CREATE TRIGGER trg_movimiento_caja_update_saldo
    AFTER INSERT ON public.movimientos_caja_operativa
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_update_caja_operativa_saldo();

COMMENT ON FUNCTION public.fn_update_cuentas_financieras_saldo() IS 'Actualiza automáticamente saldos de tesorería (Origen/Destino).';

COMMIT;
