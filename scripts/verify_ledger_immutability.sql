
-- ============================================================================
-- JUNTAY API - PRUEBA DE INMUTABILIDAD (HISTORY REWRITE ATTACK)
-- ============================================================================
-- Hipótesis del Escéptico: "Tu base de datos confía demasiado. 
-- Puedo cambiar lo que pasó ayer y nadie se enterará."

BEGIN;

DO $$
DECLARE
    v_tx_id UUID;
    v_monto_original NUMERIC;
    v_monto_hackeado NUMERIC;
BEGIN
    RAISE NOTICE '🕵️ INICIANDO ATAQUE DE RE-ESCRITURA DE HISTORIA...';

    -- 1. Crear una transacción legítima (El "Pasado")
    INSERT INTO public.transacciones_capital (tipo, monto, descripcion)
    VALUES ('APORTE', 1000.00, 'Inversión Legítima')
    RETURNING id INTO v_tx_id;
    
    RAISE NOTICE '📜 Transacción Original Creada: ID % por S/ 1,000', v_tx_id;

    -- 2. INTENTO DE RUPTURA: Modificar el monto (El "Fraude")
    BEGIN
        UPDATE public.transacciones_capital 
        SET monto = 1.00
        WHERE id = v_tx_id;
        RAISE EXCEPTION '🚨 VULNERABILIDAD CRÍTICA: El sistema permitió modificar MONTO.';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%MODIFICACIÓN FINANCIERA PROHIBIDA%' THEN
            RAISE NOTICE '🛡️ SEGURIDAD OK: El sistema bloqueó cambio de monto.';
        ELSE
            RAISE NOTICE '⚠️ Error Inesperado Update Monto: %', SQLERRM;
             IF SQLERRM LIKE '%VULNERABILIDAD%' THEN RAISE; END IF;
        END IF;
    END;

    -- 3. INTENTO DE BORRADO: Eliminar evidencia
    BEGIN
        DELETE FROM public.transacciones_capital WHERE id = v_tx_id;
        RAISE EXCEPTION '🚨 VULNERABILIDAD CRÍTICA: El sistema permitió ELIMINAR.';
    EXCEPTION WHEN OTHERS THEN
         IF SQLERRM LIKE '%ELIMINACIÓN PROHIBIDA%' THEN
            RAISE NOTICE '🛡️ SEGURIDAD OK: El sistema bloqueó borrado.';
        ELSE
             RAISE NOTICE '⚠️ Error Inesperado Delete: %', SQLERRM;
             IF SQLERRM LIKE '%VULNERABILIDAD%' THEN RAISE; END IF;
        END IF;
    END;

    -- 4. INTENTO DE CORRECCIÓN COSMÉTICA (Flexibilidad)
    BEGIN
        UPDATE public.transacciones_capital 
        SET descripcion = 'Corrección Legítima de Nota', 
            metadata = '{"verified": true}'::jsonb
        WHERE id = v_tx_id;
        
        RAISE NOTICE '✅ FLEXIBILIDAD OK: El sistema permitió corregir descripción/metadata.';
    END;

END $$;

ROLLBACK;
