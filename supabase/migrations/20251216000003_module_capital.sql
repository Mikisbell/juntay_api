
-- ============================================================================
-- JUNTAY API - MÓDULO CAPITAL Y TESORERÍA MULTI-CUENTA
-- Fecha: 2025-12-16
-- Descripción: Implementa segregación de fondos y gestión de inversionistas.
-- ============================================================================

BEGIN;

-- 1. ENUMS PARA TIPIFICACIÓN
CREATE TYPE public.tipo_cuenta_financiera AS ENUM ('EFECTIVO', 'BANCO', 'DIGITAL', 'PASARELA');
CREATE TYPE public.tipo_inversionista AS ENUM ('SOCIO', 'PRESTAMISTA');
CREATE TYPE public.tipo_transaccion_capital AS ENUM ('APORTE', 'RETIRO', 'PAGO_INTERES', 'TRANSFERENCIA_FONDEO');

-- 2. TABLA: CUENTAS FINANCIERAS (Reemplaza a Bóveda Central Monolítica)
CREATE TABLE public.cuentas_financieras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL, -- Ej: "Caja Fuerte A", "BCP Soles"
    tipo public.tipo_cuenta_financiera NOT NULL,
    saldo NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN' NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_saldo_security CHECK (saldo >= 0) -- NUNCA NEGATIVO
);

-- 3. TABLA: INVERSIONISTAS (Equity & Deuda)
CREATE TABLE public.inversionistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id),
    tipo_relacion public.tipo_inversionista NOT NULL,
    participacion_porcentaje NUMERIC(5,2) DEFAULT 0, -- Solo para SOCIOS
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: TRANSACCIONES DE CAPITAL (Ledger de Fondeo)
CREATE TABLE public.transacciones_capital (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inversionista_id UUID REFERENCES public.inversionistas(id), -- Null si es transferencia interna
    origen_cuenta_id UUID REFERENCES public.cuentas_financieras(id),
    destino_cuenta_id UUID REFERENCES public.cuentas_financieras(id),
    tipo public.tipo_transaccion_capital NOT NULL,
    monto NUMERIC(15,2) NOT NULL CHECK (monto > 0),
    descripcion TEXT,
    evidencia_ref TEXT, -- URL voucher
    fecha_operacion TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- Referencia a auth.users (audit)
);

-- 5. MIGRACIÓN DE DATOS (Legacy -> Nuevo Modelo)
DO $$
DECLARE
    legacy_boveda_saldo NUMERIC;
    new_cuenta_id UUID;
BEGIN
    -- Obtenemos saldo de la boveda legacy (si existe)
    -- Asumimos que existe boveda_central por los tests anteriores
    SELECT saldo_total INTO legacy_boveda_saldo FROM public.boveda_central LIMIT 1;

    -- Si no hay saldo, asumimos 0
    IF legacy_boveda_saldo IS NULL THEN
        legacy_boveda_saldo := 0;
    END IF;

    -- Creamos la Cuenta "Bóveda Principal (Legacy)"
    INSERT INTO public.cuentas_financieras (nombre, tipo, saldo)
    VALUES ('Bóveda Principal (Legacy)', 'EFECTIVO', legacy_boveda_saldo)
    RETURNING id INTO new_cuenta_id;

    RAISE NOTICE 'Migrado saldo de % a nueva cuenta ID %', legacy_boveda_saldo, new_cuenta_id;
END $$;

-- 6. ACTUALIZACIÓN DE CAJAS OPERATIVAS
-- Ahora las cajas se fondean desde una cuenta_financiera, no de boveda_central
-- Agregamos campo temporalmente nullable para migrar
ALTER TABLE public.cajas_operativas 
    ADD COLUMN cuenta_origen_id UUID REFERENCES public.cuentas_financieras(id);

COMMENT ON TABLE public.cuentas_financieras IS 'Cuentas reales donde reside el dinero (Físico o Banco).';
COMMENT ON TABLE public.inversionistas IS 'Personas que inyectan capital al negocio.';

COMMIT;
