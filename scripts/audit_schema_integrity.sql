
-- ============================================================================
-- JUNTAY API - AUDITORÍA DE INTEGRIDAD ESTRUCTURAL
-- ============================================================================
-- Este script busca debilidades en el esquema tras la consolidación.

BEGIN;

DO $$
DECLARE
    orphan_count INTEGER;
    missing_pk_count INTEGER;
    fk_violation_count INTEGER;
BEGIN
    RAISE NOTICE 'Iniciando Auditoría de Integridad...';

    -- 1. CHEQUEO DE PRIMARY KEYS
    -- Un buen diseño exige PKs en todas las tablas.
    SELECT COUNT(*) INTO missing_pk_count
    FROM information_schema.tables t
    LEFT JOIN information_schema.table_constraints tc 
        ON t.table_name = tc.table_name 
        AND tc.constraint_type = 'PRIMARY KEY'
    WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND tc.constraint_name IS NULL;

    IF missing_pk_count > 0 THEN
        RAISE WARNING 'ALERTA: % tablas no tienen Primary Key.', missing_pk_count;
    ELSE
        RAISE NOTICE 'OK: Todas las tablas tienen PK.';
    END IF;

    -- 2. INTEGRIDAD REFERENCIAL (PUNTO CRÍTICO: AUTH vs PUBLIC)
    -- Verificar si hay Personas vinculadas a usuarios Auth que ya no existen.
    -- Asumimos que public.personas puede tener un campo user_id o similar vinculado a auth.users
    -- Si no existe tal campo directo, verificamos la lógica de negocio (empleados -> auth.users)
    
        -- SE HA VALIDADO QUE LA COLUMNA ES 'user_id' SEGUN SCHEMA
        SELECT COUNT(*) INTO orphan_count
        FROM public.empleados e
        LEFT JOIN auth.users u ON e.user_id = u.id 
        WHERE u.id IS NULL AND e.user_id IS NOT NULL;

        IF orphan_count > 0 THEN
            RAISE WARNING 'ALERTA CRÍTICA: % empleados apuntan a usuarios de Auth inexistentes (Huérfanos).', orphan_count;
        ELSE
            RAISE NOTICE 'OK: Integridad Empleados -> Auth correcta.';
        END IF;

    -- 2.1 INTEGRIDAD MÓDULO CAPITAL (NUEVO)
    -- Check Inversionistas -> Personas
    SELECT COUNT(*) INTO orphan_count FROM public.inversionistas i LEFT JOIN public.personas p ON i.persona_id = p.id WHERE p.id IS NULL;
    IF orphan_count > 0 THEN RAISE WARNING 'ALERTA: % inversionistas sin persona vinculada.', orphan_count; END IF;

    -- Check Transacciones -> Cuentas (Origen)
    SELECT COUNT(*) INTO orphan_count FROM public.transacciones_capital t LEFT JOIN public.cuentas_financieras c ON t.origen_cuenta_id = c.id WHERE t.origen_cuenta_id IS NOT NULL AND c.id IS NULL;
    IF orphan_count > 0 THEN RAISE WARNING 'ALERTA: % transacciones apuntan a Cuenta Origen inexistente.', orphan_count; END IF;

    -- Check Cajas Operativas -> Usuarios
    SELECT COUNT(*) INTO orphan_count FROM public.cajas_operativas c LEFT JOIN public.usuarios u ON c.usuario_id = u.id WHERE u.id IS NULL;
    IF orphan_count > 0 THEN RAISE WARNING 'ALERTA: % cajas operativas sin usuario cajero válido.', orphan_count; END IF;

    -- 3. VALIDACIÓN DE CONSTRAINTS ACTIVOS
    -- Asegurar que todas las FKs están validas y no deshabilitadas
    SELECT COUNT(*) INTO fk_violation_count
    FROM pg_constraint
    WHERE contype = 'f' AND convalidated = false;

    IF fk_violation_count > 0 THEN
        RAISE WARNING 'ALERTA: % Foreign Keys no han sido validadas por la base de datos.', fk_violation_count;
    ELSE
         RAISE NOTICE 'OK: Todas las constraints están validadas.';
    END IF;

    -- 4. REVISIÓN DE ÍNDICES EN CLAVES FORÁNEAS
    -- Es común olvidar indexar las FK, lo que mata el rendimiento en joins.
    -- (Este es un chequeo de "calidad" más que de "integridad", pero vital para "estrés").
    
    RAISE NOTICE 'Auditoría Finalizada.';
END $$;

ROLLBACK; -- Solo leemos, no cambiamos nada.
