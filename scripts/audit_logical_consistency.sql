-- ============================================================================
-- AUDITORÍA DE CONSISTENCIA LÓGICA Y FINANCIERA
-- ============================================================================

\echo 'Iniciando Auditoría de Integridad de Datos...'

-- 1. AUDITORÍA DE LEDGER DE CAPITAL (Cuentas Financieras vs Transacciones)
-- Verifica si el saldo actual coincide con la suma de los movimientos históricos.
WITH calculo_ledger AS (
    SELECT 
        cf.id, 
        cf.nombre, 
        cf.saldo as saldo_actual,
        COALESCE(SUM(
            CASE 
                -- Si es destino, SUMA (Aporte, Ingreso)
                WHEN tc.destino_cuenta_id = cf.id THEN tc.monto
                -- Si es origen, RESTA (Retiro, Pago)
                WHEN tc.origen_cuenta_id = cf.id THEN -tc.monto
                ELSE 0
            END
        ), 0) as saldo_calculado
    FROM public.cuentas_financieras cf
    LEFT JOIN public.transacciones_capital tc 
        ON cf.id = tc.origen_cuenta_id OR cf.id = tc.destino_cuenta_id
    GROUP BY cf.id, cf.nombre, cf.saldo
)
SELECT 
    'LEDGER_MISMATCH' as tipo_error,
    id,
    nombre,
    saldo_actual,
    saldo_calculado,
    (saldo_actual - saldo_calculado) as diferencia
FROM calculo_ledger
WHERE saldo_actual <> saldo_calculado;

-- 2. AUDITORÍA DE CAJAS OPERATIVAS (Saldo Caja vs Movimientos)
-- Verifica si el saldo de las cajas cuadra con sus movimientos.
WITH calculo_caja AS (
    SELECT 
        c.id, 
        c.numero_caja, 
        c.saldo_actual,
        c.saldo_inicial,
        COALESCE(SUM(
            CASE 
                WHEN m.tipo = 'INGRESO' THEN m.monto
                WHEN m.tipo = 'EGRESO' THEN -m.monto
                ELSE 0
            END
        ), 0) as movimientos_netos
    FROM public.cajas_operativas c
    LEFT JOIN public.movimientos_caja_operativa m ON c.id = m.caja_operativa_id
    GROUP BY c.id, c.numero_caja, c.saldo_actual, c.saldo_inicial
)
SELECT 
    'CAJA_MISMATCH' as tipo_error,
    id,
    numero_caja,
    saldo_actual,
    (saldo_inicial + movimientos_netos) as saldo_teorico,
    (saldo_actual - (saldo_inicial + movimientos_netos)) as diferencia
FROM calculo_caja
WHERE saldo_actual <> (saldo_inicial + movimientos_netos);

-- 3. DETECCIÓN DE HUÉRFANOS Y NULOS CRÍTICOS
-- Buscamos transacciones sin usuario responsable (audit)
SELECT 
    'AUDIT_MISSING' as tipo_error,
    id,
    descripcion,
    'transacciones_capital' as tabla
FROM public.transacciones_capital 
WHERE created_by IS NULL;

-- 4. VALIDACIÓN DE UNICIDAD DE DNI (Soft Check, por si RLS/App falló)
SELECT 
    'DUPLICATE_DNI' as tipo_error,
    numero_documento,
    COUNT(*) as duplicados
FROM public.personas
GROUP BY numero_documento
HAVING COUNT(*) > 1;

\echo 'Fin de Auditoría.'
