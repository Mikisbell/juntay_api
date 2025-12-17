-- ============================================================================
-- JUNTAY API - VERIFICACIÓN: Trigger de Auditoría de Metadata
-- Fecha: 2025-12-16
-- Uso: psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f scripts/verify_metadata_audit.sql
-- ============================================================================

\echo '============================================='
\echo 'TEST: Auditoría de Metadata en Ledger'
\echo '============================================='

-- 1. Crear cuenta financiera temporal si no existe
INSERT INTO public.cuentas_financieras (nombre, tipo, saldo)
SELECT 'Cuenta Test Audit', 'EFECTIVO', 1000.00
WHERE NOT EXISTS (
    SELECT 1 FROM public.cuentas_financieras WHERE nombre = 'Cuenta Test Audit'
);

-- 2. Crear transacción de prueba
\echo ''
\echo 'Paso 1: Creando transacción de prueba...'

DO $$
DECLARE
    v_cuenta_id UUID;
    v_tx_id UUID;
    v_audit_count_before INT;
    v_audit_count_after INT;
BEGIN
    -- Obtener cuenta
    SELECT id INTO v_cuenta_id FROM public.cuentas_financieras 
    WHERE nombre = 'Cuenta Test Audit' LIMIT 1;
    
    -- Contar auditorías antes
    SELECT COUNT(*) INTO v_audit_count_before 
    FROM public.audit_log 
    WHERE accion = 'METADATA_CHANGE';
    
    RAISE NOTICE 'Auditorías METADATA_CHANGE antes: %', v_audit_count_before;
    
    -- Insertar transacción
    INSERT INTO public.transacciones_capital (
        destino_cuenta_id,
        tipo,
        monto,
        descripcion,
        metadata
    ) VALUES (
        v_cuenta_id,
        'APORTE',
        100.00,
        'Transacción de prueba para verificar auditoría',
        '{"test": "original", "version": 1}'::JSONB
    ) RETURNING id INTO v_tx_id;
    
    RAISE NOTICE 'Transacción creada: %', v_tx_id;
    
    -- 3. Modificar metadata (esto debería disparar el trigger)
    RAISE NOTICE 'Paso 2: Modificando metadata...';
    
    UPDATE public.transacciones_capital
    SET metadata = '{"test": "modificado", "version": 2, "extra": "nuevo campo"}'::JSONB
    WHERE id = v_tx_id;
    
    -- 4. Verificar que se creó registro de auditoría
    SELECT COUNT(*) INTO v_audit_count_after 
    FROM public.audit_log 
    WHERE accion = 'METADATA_CHANGE';
    
    RAISE NOTICE 'Auditorías METADATA_CHANGE después: %', v_audit_count_after;
    
    -- Validar resultado
    IF v_audit_count_after > v_audit_count_before THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ TEST PASADO: El cambio de metadata fue auditado correctamente';
    ELSE
        RAISE EXCEPTION '❌ TEST FALLIDO: No se creó registro de auditoría para cambio de metadata';
    END IF;
    
    -- 5. Mostrar el registro de auditoría creado
    RAISE NOTICE '';
    RAISE NOTICE 'Contenido del registro de auditoría:';
    
    -- Limpiar: eliminar transacción de prueba
    DELETE FROM public.transacciones_capital WHERE id = v_tx_id;
    
END $$;

-- 6. Mostrar últimos registros de auditoría
\echo ''
\echo 'Últimos 5 registros de auditoría METADATA_CHANGE:'
SELECT 
    id,
    registro_id,
    datos_anteriores->>'metadata' AS metadata_antes,
    datos_nuevos->>'metadata' AS metadata_despues,
    created_at
FROM public.audit_log 
WHERE accion = 'METADATA_CHANGE'
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '============================================='
\echo 'FIN DEL TEST'
\echo '============================================='
