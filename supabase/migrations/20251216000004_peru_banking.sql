
-- ============================================================================
-- JUNTAY API - INTEGRACIÓN BANCARIA PERÚ (BCP/YAPE/PLIN)
-- Fecha: 2025-12-16
-- Descripción: Normalización de entidades bancarias y métodos de pago locales.
-- ============================================================================

BEGIN;

-- 1. ENUMS LOCALES
CREATE TYPE public.banco_peru AS ENUM (
    'BCP', 
    'BBVA', 
    'INTERBANK', 
    'SCOTIABANK', 
    'BANCO_NACION', 
    'CAJA_AREQUIPA',
    'CAJA_PIURA',
    'CAJA_CUSCO',
    'CAJA_HUANCAYO',
    'MIBANCO',
    'PICHINCHA',
    'BANBIF',
    'OTRO'
);

CREATE TYPE public.metodo_pago_peru AS ENUM (
    'EFECTIVO',
    'YAPE',          -- BCP Ecosystem
    'PLIN',          -- IBK/BBVA/Scotia Ecosystem
    'TRANSFERENCIA', -- Mismo banco / Intra
    'CCI',           -- Interbancaria Inmediata/Diferida
    'CHEQUE',
    'DEPOSITO_VENTANILLA',
    'AGENTE'
);

-- 2. ENRIQUECIMIENTO DE CUENTAS FINANCIERAS
-- Necesitamos saber si la cuenta "Digital" es del BCP o de Interbank
ALTER TABLE public.cuentas_financieras
    ADD COLUMN banco_asociado public.banco_peru,
    ADD COLUMN numero_cuenta VARCHAR(50),      -- Para CCI o Nro Cuenta
    ADD COLUMN titular_cuenta VARCHAR(100);    -- En caso de usar cuentas de terceros autorizados

-- Validacion: Si es BANCO o DIGITAL, se recomienda tener banco_asociado (Warning soft)

-- 3. ENRIQUECIMIENTO DE TRANSACCIONES DE CAPITAL
-- Ahora registramos DETALLES DEL VOUCHER
ALTER TABLE public.transacciones_capital
    ADD COLUMN metodo_pago public.metodo_pago_peru DEFAULT 'EFECTIVO' NOT NULL,
    ADD COLUMN numero_operacion VARCHAR(50),   -- El código único del voucher
    ADD COLUMN banco_origen public.banco_peru; -- Desde qué banco nos enviaron

-- 4. INDICE UNICO PARA EVITAR DOBLE REGISTRO DE VOUCHER
-- Un mismo nro de operación no debería repetirse en el mismo banco destino en cierto periodo?
-- Por ahora lo hacemos soft unique si no es nulo
CREATE UNIQUE INDEX idx_transacciones_voucher_unique 
    ON public.transacciones_capital (numero_operacion, destino_cuenta_id) 
    WHERE numero_operacion IS NOT NULL;

COMMENT ON COLUMN public.cuentas_financieras.banco_asociado IS 'Entidad financiera real (Ej: BCP).';
COMMENT ON COLUMN public.transacciones_capital.numero_operacion IS 'Código de operación del voucher bancario. Debe ser único por cuenta destino.';

COMMIT;
