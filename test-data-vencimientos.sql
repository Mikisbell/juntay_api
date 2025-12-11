-- Script para crear datos de prueba para Vencimientos
-- Actualiza contratos existentes para que venzan en diferentes períodos

-- Contrato que vence HOY
UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE
WHERE codigo = 'CON-2024-001' AND estado = 'vigente';

-- Contrato que vence mañana (dentro de "Esta Semana")
UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE + INTERVAL '1 day'
WHERE codigo = 'CON-2024-002' AND estado = 'vigente';

-- Contrato que vence en 5 días (dentro de "Esta Semana")
UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE + INTERVAL '5 days'
WHERE codigo = 'CON-2024-003' AND estado = 'vigente';

-- Los demás quedan para "Este Mes"

-- Verificar resultados
SELECT 
    codigo,
    fecha_vencimiento,
    CASE 
        WHEN fecha_vencimiento = CURRENT_DATE THEN 'HOY'
        WHEN fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 7 THEN 'ESTA SEMANA'
        WHEN fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 30 THEN 'ESTE MES'
        ELSE 'FUTURO'
    END as periodo
FROM creditos 
WHERE estado = 'vigente'
ORDER BY fecha_vencimiento;
