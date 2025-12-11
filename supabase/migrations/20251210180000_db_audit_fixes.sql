-- ============================================================================
-- MIGRACIÓN CORRECTIVA: Auditoría de Base de Datos
-- Fecha: 10 Diciembre 2025
-- Descripción: Corrige gaps entre código y schema identificados en auditoría
-- ============================================================================

-- ============================================================================
-- 1. TABLA PAGOS - Agregar columnas faltantes
-- ============================================================================

-- El código usa: tipo, metodo_pago, observaciones, usuario_id
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'PAGO';

ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50);

ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS observaciones TEXT;

ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);

-- Migrar datos existentes
UPDATE public.pagos SET metodo_pago = medio_pago WHERE metodo_pago IS NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_pagos_credito_id ON public.pagos(credito_id);
CREATE INDEX IF NOT EXISTS idx_pagos_tipo ON public.pagos(tipo);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON public.pagos(usuario_id);

-- ============================================================================
-- 2. TABLA GARANTIAS - Agregar columnas para remate
-- ============================================================================

ALTER TABLE public.garantias 
ADD COLUMN IF NOT EXISTS fecha_venta TIMESTAMPTZ;

ALTER TABLE public.garantias 
ADD COLUMN IF NOT EXISTS precio_venta NUMERIC(12,2);

ALTER TABLE public.garantias 
ADD COLUMN IF NOT EXISTS credito_id UUID REFERENCES public.creditos(id);

-- Actualizar estados válidos
ALTER TABLE public.garantias DROP CONSTRAINT IF EXISTS garantias_estado_check;
ALTER TABLE public.garantias ADD CONSTRAINT garantias_estado_check 
CHECK (estado IN (
    'custodia_caja', 
    'en_transito', 
    'custodia_boveda', 
    'en_remate', 
    'vendida', 
    'devuelta',
    'custodia'  -- Legacy
));

-- Mantener compatibilidad: fotos es alias de fotos_urls
ALTER TABLE public.garantias 
ADD COLUMN IF NOT EXISTS fotos TEXT[];

-- Sincronizar fotos con fotos_urls
UPDATE public.garantias SET fotos = fotos_urls WHERE fotos IS NULL AND fotos_urls IS NOT NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_garantias_credito ON public.garantias(credito_id);
CREATE INDEX IF NOT EXISTS idx_garantias_estado ON public.garantias(estado);
CREATE INDEX IF NOT EXISTS idx_garantias_cliente ON public.garantias(cliente_id);

-- ============================================================================
-- 3. TABLA CREDITOS - Agregar columnas faltantes
-- ============================================================================

-- Alias para código (el código usa codigo_credito)
ALTER TABLE public.creditos 
ADD COLUMN IF NOT EXISTS codigo_credito VARCHAR(50);

-- Migrar datos
UPDATE public.creditos SET codigo_credito = codigo WHERE codigo_credito IS NULL;

-- Fecha inicio (distinta a fecha_desembolso)
ALTER TABLE public.creditos 
ADD COLUMN IF NOT EXISTS fecha_inicio DATE;

-- Migrar datos
UPDATE public.creditos SET fecha_inicio = fecha_desembolso::DATE WHERE fecha_inicio IS NULL;

-- Observaciones
ALTER TABLE public.creditos 
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_creditos_cliente ON public.creditos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_creditos_estado ON public.creditos(estado);
CREATE INDEX IF NOT EXISTS idx_creditos_codigo ON public.creditos(codigo_credito);

-- ============================================================================
-- 4. ALIAS para movimientos_caja_operativa.caja_id
-- ============================================================================

-- El código usa 'caja_id' pero el schema tiene 'caja_operativa_id'
-- Creamos una vista o agregamos columna alias

ALTER TABLE public.movimientos_caja_operativa 
ADD COLUMN IF NOT EXISTS caja_id UUID REFERENCES public.cajas_operativas(id);

-- Sincronizar
UPDATE public.movimientos_caja_operativa 
SET caja_id = caja_operativa_id 
WHERE caja_id IS NULL;

-- Trigger para mantener sincronía
CREATE OR REPLACE FUNCTION sync_caja_ids()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.caja_id IS NULL AND NEW.caja_operativa_id IS NOT NULL THEN
        NEW.caja_id := NEW.caja_operativa_id;
    ELSIF NEW.caja_operativa_id IS NULL AND NEW.caja_id IS NOT NULL THEN
        NEW.caja_operativa_id := NEW.caja_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_caja_ids ON public.movimientos_caja_operativa;
CREATE TRIGGER trg_sync_caja_ids
BEFORE INSERT OR UPDATE ON public.movimientos_caja_operativa
FOR EACH ROW EXECUTE FUNCTION sync_caja_ids();

-- ============================================================================
-- 5. CAMPOS DE AUDITORÍA GLOBALES
-- ============================================================================

-- Agregar campos de auditoría a tablas principales

-- Creditos
ALTER TABLE public.creditos 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE public.creditos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Garantias  
ALTER TABLE public.garantias 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Pagos
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- 6. AJUSTES FINALES A CAJAS_OPERATIVAS
-- ============================================================================

-- Agregar campo observaciones_cierre si no existe
ALTER TABLE public.cajas_operativas 
ADD COLUMN IF NOT EXISTS observaciones_cierre TEXT;

-- ============================================================================
-- 7. ACTUALIZAR RLS PARA NUEVAS TABLAS
-- ============================================================================

-- Política para audit_log (de migración anterior)
-- Ya definida en 20251210170000_audit_and_notifications.sql

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON COLUMN public.pagos.tipo IS 'Tipo de pago: PAGO, RENOVACION, DESEMPENO, CONDONACION_MORA';
COMMENT ON COLUMN public.pagos.metodo_pago IS 'Método: EFECTIVO, YAPE, PLIN, TRANSFERENCIA';
COMMENT ON COLUMN public.garantias.fecha_venta IS 'Fecha en que se vendió la prenda en remate';
COMMENT ON COLUMN public.garantias.precio_venta IS 'Precio de venta en remate';
COMMENT ON COLUMN public.creditos.codigo_credito IS 'Alias de codigo para compatibilidad con código';
COMMENT ON COLUMN public.creditos.observaciones IS 'Notas administrativas del crédito';

-- ============================================================================
-- FIN DE MIGRACIÓN CORRECTIVA
-- ============================================================================
