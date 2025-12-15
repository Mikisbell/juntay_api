-- ============================================================================
-- JUNTAY - MIGRACIÓN: Preparar tablas para RxDB + Fix de migraciones
-- Fecha: 13 Diciembre 2025
-- 
-- Esta migración:
-- 1. Agrega campos _modified y _deleted para sincronización RxDB
-- 2. Crea triggers de auto-update para _modified
-- 3. Habilita Realtime para las tablas críticas
-- 4. Arregla columna updated_at faltante en creditos
-- ============================================================================

-- =============================================================================
-- PARTE 1: Agregar columna updated_at a creditos (fix de migración 20251209001000)
-- =============================================================================

ALTER TABLE public.creditos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Inicializar updated_at con created_at si existe
UPDATE public.creditos SET updated_at = created_at WHERE updated_at IS NULL;

-- =============================================================================
-- PARTE 2: Habilitar extensión moddatetime para auto-update de timestamps
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- =============================================================================
-- PARTE 3: Agregar campos _modified y _deleted para replicación RxDB
-- =============================================================================

-- CREDITOS
ALTER TABLE public.creditos 
    ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT NOW() NOT NULL;

DROP TRIGGER IF EXISTS update_creditos_modified ON public.creditos;
CREATE TRIGGER update_creditos_modified
    BEFORE UPDATE ON public.creditos
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');

-- PAGOS
ALTER TABLE public.pagos 
    ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT NOW() NOT NULL;

DROP TRIGGER IF EXISTS update_pagos_modified ON public.pagos;
CREATE TRIGGER update_pagos_modified
    BEFORE UPDATE ON public.pagos
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');

-- MOVIMIENTOS_CAJA_OPERATIVA
ALTER TABLE public.movimientos_caja_operativa 
    ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT NOW() NOT NULL;

DROP TRIGGER IF EXISTS update_movimientos_modified ON public.movimientos_caja_operativa;
CREATE TRIGGER update_movimientos_modified
    BEFORE UPDATE ON public.movimientos_caja_operativa
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');

-- CAJAS_OPERATIVAS
ALTER TABLE public.cajas_operativas 
    ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT NOW() NOT NULL;

DROP TRIGGER IF EXISTS update_cajas_modified ON public.cajas_operativas;
CREATE TRIGGER update_cajas_modified
    BEFORE UPDATE ON public.cajas_operativas
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');

-- GARANTIAS
ALTER TABLE public.garantias 
    ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT NOW() NOT NULL;

DROP TRIGGER IF EXISTS update_garantias_modified ON public.garantias;
CREATE TRIGGER update_garantias_modified
    BEFORE UPDATE ON public.garantias
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');

-- CLIENTES (solo lectura desde cliente, pero necesita _modified para pull)
ALTER TABLE public.clientes 
    ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT NOW() NOT NULL;

DROP TRIGGER IF EXISTS update_clientes_modified ON public.clientes;
CREATE TRIGGER update_clientes_modified
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');

-- =============================================================================
-- PARTE 4: Crear índices para mejorar rendimiento de sincronización
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_creditos_modified ON public.creditos (_modified);
CREATE INDEX IF NOT EXISTS idx_creditos_deleted ON public.creditos (_deleted) WHERE _deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_pagos_modified ON public.pagos (_modified);
CREATE INDEX IF NOT EXISTS idx_pagos_deleted ON public.pagos (_deleted) WHERE _deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_movimientos_modified ON public.movimientos_caja_operativa (_modified);
CREATE INDEX IF NOT EXISTS idx_movimientos_deleted ON public.movimientos_caja_operativa (_deleted) WHERE _deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_garantias_modified ON public.garantias (_modified);
CREATE INDEX IF NOT EXISTS idx_garantias_deleted ON public.garantias (_deleted) WHERE _deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_clientes_modified ON public.clientes (_modified);
CREATE INDEX IF NOT EXISTS idx_clientes_deleted ON public.clientes (_deleted) WHERE _deleted = FALSE;

-- =============================================================================
-- PARTE 5: Habilitar Supabase Realtime para las tablas críticas
-- =============================================================================

-- Habilitar Realtime (solo si la publicación existe)
DO $$
BEGIN
    -- Verificar si la publicación existe
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Intentar agregar tablas a la publicación
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.creditos;
        EXCEPTION WHEN duplicate_object THEN
            -- Ya está en la publicación, ignorar
            NULL;
        END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.pagos;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.movimientos_caja_operativa;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.garantias;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;

-- =============================================================================
-- PARTE 6: Fix para la función job_actualizar_estados_creditos
-- Cambiar updated_at a _modified (que ahora existe)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.job_actualizar_estados_creditos()
RETURNS void AS $$
BEGIN
    -- Esto dispara el trigger de _modified para cada registro
    -- y también los triggers de estado automático
    UPDATE creditos 
    SET _modified = NOW() 
    WHERE estado IN ('vigente', 'vencido', 'en_mora')
      AND fecha_vencimiento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =============================================================================

COMMENT ON COLUMN public.creditos._modified IS 'Timestamp de última modificación para sincronización RxDB';
COMMENT ON COLUMN public.creditos._deleted IS 'Soft delete para sincronización RxDB (no eliminar físicamente)';

COMMENT ON COLUMN public.pagos._modified IS 'Timestamp de última modificación para sincronización RxDB';
COMMENT ON COLUMN public.pagos._deleted IS 'Soft delete para sincronización RxDB';

COMMENT ON COLUMN public.movimientos_caja_operativa._modified IS 'Timestamp de última modificación para sincronización RxDB';
COMMENT ON COLUMN public.movimientos_caja_operativa._deleted IS 'Soft delete para sincronización RxDB';
