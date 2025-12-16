-- ============================================================================
-- Migración: Campos para caché de precios de oro (GoldAPI.io)
-- ============================================================================

-- Agregar campos a system_settings para almacenar precios del oro
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS precio_oro_24k_pen DECIMAL(10,2) DEFAULT 220.00,
ADD COLUMN IF NOT EXISTS precio_oro_22k_pen DECIMAL(10,2) DEFAULT 200.00,
ADD COLUMN IF NOT EXISTS precio_oro_21k_pen DECIMAL(10,2) DEFAULT 190.00,
ADD COLUMN IF NOT EXISTS precio_oro_18k_pen DECIMAL(10,2) DEFAULT 165.00,
ADD COLUMN IF NOT EXISTS precio_oro_14k_pen DECIMAL(10,2) DEFAULT 128.00,
ADD COLUMN IF NOT EXISTS precio_oro_10k_pen DECIMAL(10,2) DEFAULT 92.00,
ADD COLUMN IF NOT EXISTS precio_oro_updated_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS precio_oro_source VARCHAR(50) DEFAULT 'manual';

-- Comentario
COMMENT ON COLUMN public.system_settings.precio_oro_24k_pen IS 'Precio del oro 24K por gramo en PEN (fuente: GoldAPI.io)';
COMMENT ON COLUMN public.system_settings.precio_oro_updated_at IS 'Última actualización del precio del oro';
COMMENT ON COLUMN public.system_settings.precio_oro_source IS 'Fuente del precio: manual o goldapi';
