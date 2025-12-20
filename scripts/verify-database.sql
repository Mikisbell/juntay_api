-- ============================================================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- Ejecutar antes de producción para validar integridad
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR ESTRUCTURA MULTI-TENANT
-- ============================================================================

-- 1.1 Verificar que empresa_id existe en tablas críticas
SELECT 
    '✅ empresa_id en' AS check_type,
    tablename,
    CASE WHEN attname = 'empresa_id' THEN '✓ EXISTE' ELSE '✗ FALTA' END as status
FROM pg_tables t
LEFT JOIN pg_attribute a ON a.attrelid = (t.schemaname || '.' || t.tablename)::regclass 
    AND a.attname = 'empresa_id'
WHERE t.schemaname = 'public' 
    AND t.tablename IN ('usuarios', 'clientes', 'creditos', 'sucursales', 'cuentas_financieras', 'inversionistas', 'garantias')
ORDER BY tablename;

-- 1.2 Verificar función get_user_empresa existe
SELECT 
    'Función get_user_empresa' AS check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'get_user_empresa'
    ) THEN '✅ EXISTE' ELSE '❌ FALTA' END AS status;

-- ============================================================================
-- 2. VERIFICAR DATOS SEED
-- ============================================================================

-- 2.1 Empresa piloto
SELECT 
    'Empresa Piloto' AS check_type,
    CASE WHEN COUNT(*) > 0 THEN '✅ ' || ruc || ' - ' || nombre_comercial ELSE '❌ NO EXISTE' END AS status
FROM empresas 
WHERE id = 'a0000000-0000-0000-0000-000000000001'
GROUP BY ruc, nombre_comercial;

-- 2.2 Sucursal principal vinculada
SELECT 
    'Sucursal Principal' AS check_type,
    CASE 
        WHEN s.empresa_id IS NOT NULL THEN '✅ Vinculada a empresa ' || e.nombre_comercial
        ELSE '❌ SIN EMPRESA'
    END AS status
FROM sucursales s
LEFT JOIN empresas e ON s.empresa_id = e.id
WHERE s.codigo = 'PRINCIPAL';

-- 2.3 Cuenta financiera principal
SELECT 
    'Cuenta Principal' AS check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ ' || MAX(nombre) || ' (Saldo: S/' || MAX(saldo) || ')'
        ELSE '❌ NO EXISTE'
    END AS status
FROM cuentas_financieras
WHERE es_principal = true;

-- 2.4 Categorías de garantía
SELECT 
    'Categorías Garantía' AS check_type,
    '✅ ' || COUNT(*) || ' categorías creadas' AS status
FROM categorias_garantia;

-- 2.5 Roles
SELECT 
    'Roles' AS check_type,
    '✅ ' || COUNT(*) || ' roles: ' || string_agg(nombre, ', ') AS status
FROM roles;

-- ============================================================================
-- 3. VERIFICAR INTEGRIDAD REFERENCIAL
-- ============================================================================

-- 3.1 Foreign Keys válidas
SELECT 
    'FKs en' AS check_type,
    tc.table_name,
    COUNT(*) || ' foreign keys' AS status
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
GROUP BY tc.table_name
ORDER BY tc.table_name;

-- 3.2 Clientes huérfanos (sin empresa)
SELECT 
    'Clientes sin empresa' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Ninguno (OK)'
        ELSE '⚠️ ' || COUNT(*) || ' clientes sin empresa_id'
    END AS status
FROM clientes WHERE empresa_id IS NULL;

-- 3.3 Créditos huérfanos
SELECT 
    'Créditos sin empresa' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Ninguno (OK)'
        ELSE '⚠️ ' || COUNT(*) || ' créditos sin empresa_id'
    END AS status
FROM creditos WHERE empresa_id IS NULL;

-- 3.4 Garantías huérfanas
SELECT 
    'Garantías sin empresa' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Ninguno (OK)'
        ELSE '⚠️ ' || COUNT(*) || ' garantías sin empresa_id'
    END AS status
FROM garantias WHERE empresa_id IS NULL;

-- ============================================================================
-- 4. VERIFICAR RLS Y SEGURIDAD
-- ============================================================================

-- 4.1 RLS habilitado en tablas críticas
SELECT 
    'RLS en' AS check_type,
    relname as tabla,
    CASE WHEN relrowsecurity THEN '✅ HABILITADO' ELSE '⚠️ DESHABILITADO' END AS status
FROM pg_class
WHERE relname IN ('creditos', 'clientes', 'pagos', 'garantias', 'usuarios', 'cajas_operativas')
    AND relkind = 'r'
ORDER BY relname;

-- 4.2 Políticas RLS existentes
SELECT 
    'Políticas en' AS check_type,
    tablename,
    COUNT(*) || ' políticas' AS status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 5. VERIFICAR TRIGGERS Y FUNCIONES
-- ============================================================================

-- 5.1 Triggers activos
SELECT 
    'Triggers en' AS check_type,
    event_object_table AS tabla,
    COUNT(*) || ' triggers' AS status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY event_object_table
ORDER BY event_object_table;

-- 5.2 Funciones críticas
SELECT 
    'Función' AS check_type,
    proname AS nombre,
    '✅ EXISTE' AS status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND proname IN (
        'get_user_role',
        'get_user_empresa',
        'admin_asignar_caja',
        'cerrar_caja_oficial',
        'registrar_pago_transaccional',
        'crear_contrato_completo'
    )
ORDER BY proname;

-- ============================================================================
-- 6. VERIFICAR VISTAS
-- ============================================================================

SELECT 
    'Vista' AS check_type,
    table_name AS nombre,
    '✅ EXISTE' AS status
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- 7. VERIFICAR ÍNDICES
-- ============================================================================

SELECT 
    'Índices en' AS check_type,
    tablename,
    COUNT(*) || ' índices' AS status
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 15;

-- ============================================================================
-- 8. RESUMEN FINAL
-- ============================================================================

SELECT '========================================' AS resumen;
SELECT 'RESUMEN DE VERIFICACIÓN' AS resumen;
SELECT '========================================' AS resumen;

SELECT 'Empresas: ' || COUNT(*) FROM empresas;
SELECT 'Sucursales: ' || COUNT(*) FROM sucursales;
SELECT 'Cuentas Financieras: ' || COUNT(*) FROM cuentas_financieras;
SELECT 'Usuarios: ' || COUNT(*) FROM usuarios;
SELECT 'Clientes: ' || COUNT(*) FROM clientes;
SELECT 'Créditos: ' || COUNT(*) FROM creditos;
SELECT 'Garantías: ' || COUNT(*) FROM garantias;
SELECT 'Pagos: ' || COUNT(*) FROM pagos;
SELECT 'Categorías: ' || COUNT(*) FROM categorias_garantia;
SELECT 'Roles: ' || COUNT(*) FROM roles;
