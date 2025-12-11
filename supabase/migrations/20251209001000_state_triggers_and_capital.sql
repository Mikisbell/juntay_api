-- ============================================================================
-- JUNTAY - MIGRACIÓN: Estado Automático de Créditos + Capital Inicial
-- Fecha: 09 Diciembre 2025
-- ============================================================================

-- 1. CONSTRAINT: Estados válidos para créditos
ALTER TABLE creditos DROP CONSTRAINT IF EXISTS chk_estado_valido;

-- Sanitizar datos existentes antes de aplicar constraint
UPDATE creditos 
SET estado = 'vigente' 
WHERE estado NOT IN ('vigente','vencido','en_mora','pre_remate','en_remate','cancelado','renovado','anulado', 'aprobado');

ALTER TABLE creditos ADD CONSTRAINT chk_estado_valido 
CHECK (estado IN ('vigente','vencido','en_mora','pre_remate','en_remate','cancelado','renovado','anulado', 'aprobado'));

-- 2. FUNCIÓN: Actualizar estado automáticamente basado en fecha
CREATE OR REPLACE FUNCTION public.fn_actualizar_estado_credito()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo procesar si el crédito está activo
    IF NEW.estado IN ('vigente', 'vencido', 'en_mora') THEN
        
        -- Vigente -> Vencido (fecha pasó)
        IF NEW.fecha_vencimiento < CURRENT_DATE AND NEW.estado = 'vigente' THEN
            NEW.estado := 'vencido';
        END IF;
        
        -- Vencido -> En Mora (30+ días vencido)
        IF NEW.fecha_vencimiento < (CURRENT_DATE - INTERVAL '30 days') 
           AND NEW.estado = 'vencido' THEN
            NEW.estado := 'en_mora';
        END IF;
        
        -- En Mora -> Pre-Remate (60+ días vencido)
        IF NEW.fecha_vencimiento < (CURRENT_DATE - INTERVAL '60 days') 
           AND NEW.estado = 'en_mora' THEN
            NEW.estado := 'pre_remate';
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER: Ejecutar en cada UPDATE
DROP TRIGGER IF EXISTS trg_auto_estado_credito ON creditos;
CREATE TRIGGER trg_auto_estado_credito
BEFORE UPDATE ON creditos
FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_estado_credito();

-- 4. FUNCIÓN CRON: Actualizar todos los créditos vencidos (ejecutar diariamente)
CREATE OR REPLACE FUNCTION public.job_actualizar_estados_creditos()
RETURNS void AS $$
BEGIN
    -- Esto dispara el trigger anterior para cada registro
    UPDATE creditos 
    SET updated_at = NOW() 
    WHERE estado IN ('vigente', 'vencido', 'en_mora')
      AND fecha_vencimiento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 5. NOT NULL en FKs críticas (si no existen)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'creditos' AND column_name = 'cliente_id' 
               AND is_nullable = 'YES') THEN
        ALTER TABLE creditos ALTER COLUMN cliente_id SET NOT NULL;
    END IF;
END $$;

-- 6. CAPITAL INICIAL: Inyectar S/100,000 para testing
DO $$
DECLARE
    v_boveda_id UUID;
BEGIN
    SELECT id INTO v_boveda_id FROM boveda_central LIMIT 1;
    
    IF v_boveda_id IS NOT NULL THEN
        UPDATE boveda_central 
        SET saldo_total = 100000.00,
            saldo_disponible = 100000.00,
            saldo_asignado = 0,
            fecha_actualizacion = NOW()
        WHERE id = v_boveda_id;
        
        -- Registrar en auditoría
        INSERT INTO movimientos_boveda_auditoria (
            boveda_id, tipo, monto, saldo_anterior, saldo_nuevo, referencia
        ) VALUES (
            v_boveda_id, 'INYECCION_CAPITAL', 100000.00, 0, 100000.00, 
            'Capital inicial de testing (09-Dic-2025)'
        );
    END IF;
END $$;

-- 7. Ejecutar actualización inicial de estados
SELECT public.job_actualizar_estados_creditos();
