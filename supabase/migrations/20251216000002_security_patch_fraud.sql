
-- ============================================================================
-- SEGURIDAD JUNTAY: PARCHE ANTI-FRAUDE 001
-- Fecha: 2025-12-16
-- Objetivo: Bloquear vulnerabilidades detectadas en Chaos Testing
-- ============================================================================

-- 1. PREVENIR QUIEBRA TÉCNICA (Saldos Negativos)
-- Las cajas físicas no pueden tener dinero negativo.
ALTER TABLE "public"."cajas_operativas"
    ADD CONSTRAINT "chk_caja_saldo_positivo" 
    CHECK (saldo_actual >= 0);

-- 2. PREVENIR CRÉDITOS A CLIENTES BLOQUEADOS (KYC)
-- Función trigger que valida el estado del cliente
CREATE OR REPLACE FUNCTION public.check_client_status_before_credit()
RETURNS TRIGGER AS $$
DECLARE
    client_is_active BOOLEAN;
BEGIN
    SELECT activo INTO client_is_active
    FROM public.clientes
    WHERE id = NEW.cliente_id;

    IF client_is_active IS FALSE THEN
        RAISE EXCEPTION 'SEGURIDAD: No se puede otorgar crédito a un cliente INACTIVO o BLOQUEADO (ID: %).', NEW.cliente_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar Trigger
CREATE TRIGGER trg_security_validate_client_active
    BEFORE INSERT ON public.creditos
    FOR EACH ROW
    EXECUTE FUNCTION public.check_client_status_before_credit();

COMMENT ON FUNCTION public.check_client_status_before_credit() IS 'Valida que el cliente esté activo antes de crear un crédito. Previene fraude.';
