
-- ============================================================================
-- JUNTAY API - CHAOS TESTING (PRUEBAS NEGATIVAS)
-- ============================================================================
-- Objetivo: Intentar violar las reglas de negocio.
-- ÉXITO = OBTENER ERRORES. Si alguna operación pasa, ES UN FALLO DEL SISTEMA.

BEGIN;

DO $$
DECLARE
    new_persona_id UUID;
    new_cliente_id UUID;
    new_caja_id UUID;
    new_credito_id UUID;
    user_dummy_id UUID;
BEGIN
    RAISE NOTICE '🔥 INICIANDO CHAOS TESTING: Intentando romper el sistema...';

    -- PREPARACIÓN: Usuario y Caja válida (para intentar abusar de ella)
    INSERT INTO public.usuarios (email, nombres, apellido_paterno, rol) 
    VALUES ('hacker@test.com', 'HACKER', 'TEST', 'CAJERO') RETURNING id INTO user_dummy_id;

    INSERT INTO public.cajas_operativas (usuario_id, numero_caja, estado, saldo_actual, saldo_inicial) -- CORREGIDO
    VALUES (user_dummy_id, 666, 'abierta', 100.00, 100.00) RETURNING id INTO new_caja_id; -- Solo 100 soles

    ---------------------------------------------------------------------------
    -- CASO 1: CRÉDITO A CLIENTE INACTIVO (Lista Negra)
    ---------------------------------------------------------------------------
    RAISE NOTICE '⚔️ PRUEBA 1: Crédito a Cliente Bloqueado (Debe fallar)...';
    
    INSERT INTO public.personas (nombres, apellido_paterno, apellido_materno, numero_documento, tipo_documento)
    VALUES ('JUAN', 'MOROSO', 'MALAPAGA', '00000000', 'DNI') RETURNING id INTO new_persona_id;

    INSERT INTO public.clientes (persona_id, tipo_documento, numero_documento, activo)
    VALUES (new_persona_id, 'DNI', '00000000', FALSE) RETURNING id INTO new_cliente_id; -- ACTIVO = FALSE

    BEGIN
        INSERT INTO public.creditos (cliente_id, monto_prestado, tasa_interes, periodo_dias, fecha_vencimiento, saldo_pendiente, estado_detallado)
        VALUES (new_cliente_id, 500.00, 10.00, 30, CURRENT_DATE + 30, 500.00, 'al_dia');
        
        RAISE NOTICE '⚠️ FALLO GRAVE: Se permitió prestar dinero a un cliente INACTIVO.';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '🛡️ ÉXITO: El sistema bloqueó el crédito a cliente inactivo. (Error: %)', SQLERRM;
    END;

    ---------------------------------------------------------------------------
    -- CASO 2: SOBREGIRO DE CAJA (Gastar lo que no tengo)
    ---------------------------------------------------------------------------
    RAISE NOTICE '⚔️ PRUEBA 2: Sobregiro de Caja (Debe fallar o error constraint)...';
    -- Caja tiene 100.00. Intentamos prestar 1,000,000.00
    
    BEGIN
        UPDATE public.cajas_operativas 
        SET saldo_actual = saldo_actual - 1000000.00
        WHERE id = new_caja_id;
        
        -- Verificar si quedó negativo (Postgres a veces permite negativos si no hay Check)
        IF (SELECT saldo_actual FROM public.cajas_operativas WHERE id = new_caja_id) < 0 THEN
             RAISE NOTICE '⚠️ FALLO GRAVE: La caja tiene saldo NEGATIVO (-999,900.00). Inconsistencia financiera.';
        ELSE
             -- Si hubo un trigger que impidió el update, bien.
             RAISE NOTICE '❓ UPDATE paso pero saldo no es negativo? (Investigar)';
        END IF;

    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '🛡️ ÉXITO: El sistema impidió el saldo negativo. (Error: %)', SQLERRM;
    END;

    ---------------------------------------------------------------------------
    -- CASO 3: PARADOJA TEMPORAL (Pago antes de Crédito)
    ---------------------------------------------------------------------------
    RAISE NOTICE '⚔️ PRUEBA 3: Paradoja Temporal (Pago en 1990)...';
    
    -- Creamos crédito valido para intentar pagarlo mal
    INSERT INTO public.creditos (cliente_id, monto_prestado, tasa_interes, periodo_dias, fecha_vencimiento, saldo_pendiente, estado_detallado)
    VALUES (new_cliente_id, 100.00, 10.00, 30, CURRENT_DATE + 30, 100.00, 'al_dia') 
    RETURNING id INTO new_credito_id;

    BEGIN
        INSERT INTO public.pagos (credito_id, monto_total, fecha_pago, caja_operativa_id)
        VALUES (new_credito_id, 50.00, '1990-01-01', new_caja_id);
    
        RAISE NOTICE '⚠️ FALLO POTENCIAL: Se aceptó un pago con fecha 1990.';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '🛡️ ÉXITO: Fecha inválida rechazada.';
    END;

END $$;

ROLLBACK;
