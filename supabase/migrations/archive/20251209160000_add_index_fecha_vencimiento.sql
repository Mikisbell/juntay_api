-- Optimización de Performance: Dashboard Widgets
-- Fecha: 2025-12-09
-- Descripción: Agrega índice a fecha_vencimiento para acelerar:
--              1. get_cartera_risk_summary (RiskTrafficLight)
--              2. get_upcoming_expirations (ExpirationTimeline)

CREATE INDEX IF NOT EXISTS idx_creditos_fecha_vencimiento 
ON public.creditos(fecha_vencimiento);

-- Opcional: Índice compuesto para filtrado por estado + fecha (muy común en dashboards)
CREATE INDEX IF NOT EXISTS idx_creditos_estado_vencimiento 
ON public.creditos(estado, fecha_vencimiento);

COMMENT ON INDEX idx_creditos_fecha_vencimiento IS 'Optimiza widget de vencimientos próximos';
COMMENT ON INDEX idx_creditos_estado_vencimiento IS 'Optimiza semáforo de riesgo (filtrado por estado)';
