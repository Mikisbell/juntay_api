-- ============================================================================
-- MIGRACIÓN: Alinear tabla pagos con esquema RxDB
-- Fecha: 2025-12-15
-- Descripción: Agrega columnas faltantes y renombra para compatibilidad
-- ============================================================================

-- 1. Agregar columnas faltantes
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS monto NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20),
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(20),
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES public.usuarios(id),
ADD COLUMN IF NOT EXISTS observaciones TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Migrar datos existentes (si hay)
UPDATE public.pagos 
SET 
    monto = monto_total,
    metodo_pago = medio_pago,
    tipo = 'capital',  -- Valor por defecto para registros existentes
    created_at = fecha_pago
WHERE monto IS NULL;

-- 3. Agregar índices útiles
CREATE INDEX IF NOT EXISTS idx_pagos_credito_id ON public.pagos(credito_id);
CREATE INDEX IF NOT EXISTS idx_pagos_tipo ON public.pagos(tipo);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at ON public.pagos(created_at);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario_id ON public.pagos(usuario_id);

-- 4. Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
COMMENT ON COLUMN public.pagos.monto IS 'Monto del pago (compatible con RxDB)';
COMMENT ON COLUMN public.pagos.tipo IS 'Tipo de pago: interes, capital, desempeno, mora, renovacion';
COMMENT ON COLUMN public.pagos.metodo_pago IS 'Método: efectivo, yape, plin, transferencia';
COMMENT ON COLUMN public.pagos.usuario_id IS 'Cajero que registró el pago';
