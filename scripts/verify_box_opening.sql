
-- ============================================================================
-- JUNTAY API - PRUEBA DE ESTRÉS: APERTURA DE CAJA (TESORERÍA)
-- ============================================================================
-- Validación del flujo Bóveda -> Caja Operativa para inicio de operaciones.

BEGIN;

DO $$
DECLARE
    new_user_id UUID;
    new_boveda_id UUID;
    new_caja_id UUID;
    monto_apertura NUMERIC := 5000.00;
BEGIN
    RAISE NOTICE '🚀 Iniciando Simulación de Apertura de Caja...';

    -- 1. PREPARAR ACTOR (Cajero - Perfil Público)
    -- Caja referencia a public.usuarios, no auth.users directo
    INSERT INTO public.usuarios (
        email, 
        nombres,
        apellido_paterno,
        rol,
        activo
    ) VALUES (
        'cajero.test@juntay.app', 
        'TESTER',
        'CAJERO',
        'CAJERO',
        TRUE
    ) RETURNING id INTO new_user_id;
    
    -- 2. PREPARAR BÓVEDA (Capital Central)
    -- Insertamos con 10,000 de capital inicial
    INSERT INTO public.boveda_central (
        saldo_total,
        saldo_disponible,
        saldo_asignado,
        estado
    ) VALUES (
        10000.00,
        10000.00,
        0.00,
        'activa'
    ) RETURNING id INTO new_boveda_id;

    RAISE NOTICE '✅ Bóveda Central creada ID: % (Cap: 10,000)', new_boveda_id;
    RAISE NOTICE '✅ Cajero simulado ID: %', new_user_id;

    -- 3. APERTURA DE CAJA (Asignacion de 5,000)
    INSERT INTO public.cajas_operativas (
        usuario_id,
        boveda_origen_id, -- Vinculamos a la fuente de dinero
        numero_caja,
        estado,
        saldo_inicial,
        saldo_actual,
        fecha_apertura
    ) VALUES (
        new_user_id,
        new_boveda_id,
        99, 
        'abierta',
        monto_apertura, 
        monto_apertura, 
        NOW()
    ) RETURNING id INTO new_caja_id;

    RAISE NOTICE '✅ Caja #99 Abierta con ID: % | Saldo: %', new_caja_id, monto_apertura;

    -- 4. ACTUALIZAR BÓVEDA (Simular movimiento contable)
    -- El sistema debe mover dinero de Disponible -> Asignado
    UPDATE public.boveda_central
    SET 
        saldo_disponible = saldo_disponible - monto_apertura,
        saldo_asignado = saldo_asignado + monto_apertura
    WHERE id = new_boveda_id;

    RAISE NOTICE '✅ Bóveda actualizada: Fondos movidos a Asignado.';

    -- 5. VALIDACIÓN DE INTEGRIDAD
    IF new_caja_id IS NOT NULL THEN
        RAISE NOTICE '🎉 FLUJO TESORERÍA: Bóveda -> Caja completado respetando Constraints.';
    END IF;

END $$;

ROLLBACK;
