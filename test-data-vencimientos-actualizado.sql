-- Actualizar contratos existentes con fechas actuales para pruebas de vencimientos
-- Distribuir contratos en diferentes períodos: hoy, esta semana, este mes

UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE,
    estado_detallado = 'por_vencer'
WHERE codigo = 'CON-2024-001';

UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE + INTERVAL '3 days',
    estado_detallado = 'vigente'
WHERE codigo = 'CON-2024-002';

UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE + INTERVAL '5 days',
    estado_detallado = 'vigente'
WHERE codigo = 'CON-2024-003';

UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE + INTERVAL '10 days',
    estado_detallado = 'vigente'
WHERE codigo = 'CON-2024-004';

UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE + INTERVAL '15 days',
    estado_detallado = 'vigente'
WHERE codigo = 'CON-2024-005';

UPDATE creditos 
SET fecha_vencimiento = CURRENT_DATE + INTERVAL '25 days',
    estado_detallado = 'vigente'
WHERE codigo = 'CON-2024-006';

-- Verificar resultados
SELECT 
    codigo,
    fecha_vencimiento,
    EXTRACT(DAY FROM (fecha_vencimiento::DATE - CURRENT_DATE))::INTEGER as dias_restantes,
    estado_detallado
FROM creditos
WHERE fecha_vencimiento >= CURRENT_DATE
ORDER BY fecha_vencimiento;
