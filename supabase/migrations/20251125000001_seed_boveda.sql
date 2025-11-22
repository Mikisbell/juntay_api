-- Inicializar Bóveda Central (Singleton)
-- Esta migración asegura que siempre exista un registro en boveda_central

INSERT INTO public.boveda_central (
    saldo_total,
    saldo_disponible,
    saldo_asignado,
    estado
) VALUES (
    0.00,  -- Comienza en 0, el admin inyectará capital
    0.00,
    0.00,
    'activa'
)
ON CONFLICT DO NOTHING; -- Por si ya existe un registro

-- Comentario
COMMENT ON TABLE public.boveda_central IS 'SINGLETON: Bóveda central de la empresa. Debe contener exactamente 1 registro.';
