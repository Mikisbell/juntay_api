
-- ============================================================================
-- JUNTAY API - PRUEBA DE INTEGRACIÓN BANCARIA PERÚ
-- ============================================================================

BEGIN;

DO $$
DECLARE
    new_persona_id UUID;
    new_inversionista_id UUID;
    cta_yape_bcp_id UUID;
BEGIN
    RAISE NOTICE '🇵🇪 Iniciando prueba de BANCA PERÚ...';

    -- 1. CREAR CUENTA BCP (Definición Bancaria)
    INSERT INTO public.cuentas_financieras (nombre, tipo, banco_asociado, saldo)
    VALUES ('Cuenta Recaudadora BCP', 'DIGITAL', 'BCP', 0.00) 
    RETURNING id INTO cta_yape_bcp_id;

    RAISE NOTICE '✅ Cuenta Digital creada: BCP (ID: %)', cta_yape_bcp_id;

    -- 2. SETUP ACTOR
    INSERT INTO public.personas (nombres, apellido_paterno, apellido_materno, numero_documento, tipo_documento)
    VALUES ('GASTON', 'ACURIO', 'TEST', '11111111', 'DNI') RETURNING id INTO new_persona_id;

    INSERT INTO public.inversionistas (persona_id, tipo_relacion)
    VALUES (new_persona_id, 'SOCIO') RETURNING id INTO new_inversionista_id;

    -- 3. TRANSACCIÓN YAPE (Happy Path)
    INSERT INTO public.transacciones_capital (
        inversionista_id, destino_cuenta_id, tipo, monto, 
        metodo_pago, banco_origen, numero_operacion, descripcion
    ) VALUES (
        new_inversionista_id, cta_yape_bcp_id, 'APORTE', 1500.00,
        'YAPE', 'BCP', 'A1234567', 'Aporte por Yape'
    );

    RAISE NOTICE '✅ Yape de S/ 1500 registrado con voucher A1234567.';

    -- 4. INTENTO DE FRAUDE (Reutilización de Voucher)
    BEGIN
        INSERT INTO public.transacciones_capital (
            inversionista_id, destino_cuenta_id, tipo, monto, 
            metodo_pago, banco_origen, numero_operacion, descripcion -- MISMO VOUCHER
        ) VALUES (
            new_inversionista_id, cta_yape_bcp_id, 'APORTE', 500.00,
            'YAPE', 'BCP', 'A1234567', 'Intento de duplicar voucher'
        );
        
        RAISE EXCEPTION '❌ FALLO: El sistema permitió duplicar el voucher A1234567.';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '🛡️ ÉXITO: El sistema bloqueó el voucher duplicado.';
    END;

    RAISE NOTICE '🎉 PRUEBA PERÚ COMPLETADA: Integración Bancaria exitosa.';

END $$;

ROLLBACK;
