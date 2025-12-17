-- ============================================================================
-- JUNTAY API - AUDITORÍA DE CAMBIOS EN METADATA DEL LEDGER
-- Fecha: 2025-12-16
-- Descripción: Cierra el gap de seguridad identificado donde cambios en 
--              metadata del ledger no quedaban registrados en audit_log.
--              El trigger trg_ledger_smart_lock permite modificar metadata,
--              este trigger captura esos cambios para auditoría completa.
-- ============================================================================

BEGIN;

-- 1. FUNCIÓN: Capturar cambios en metadata de transacciones_capital
CREATE OR REPLACE FUNCTION public.fn_audit_metadata_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario UUID;
BEGIN
    -- Solo actuar si metadata cambió
    IF OLD.metadata IS DISTINCT FROM NEW.metadata THEN
        -- Intentar obtener usuario actual
        BEGIN
            v_usuario := auth.uid();
        EXCEPTION WHEN OTHERS THEN
            v_usuario := NULL;
        END;
        
        -- Registrar en audit_log
        INSERT INTO public.audit_log (
            tabla,
            registro_id,
            accion,
            usuario_id,
            datos_anteriores,
            datos_nuevos,
            metadata
        ) VALUES (
            'transacciones_capital',
            OLD.id,
            'METADATA_CHANGE',
            v_usuario,
            jsonb_build_object(
                'metadata', OLD.metadata,
                'descripcion', OLD.descripcion
            ),
            jsonb_build_object(
                'metadata', NEW.metadata,
                'descripcion', NEW.descripcion
            ),
            jsonb_build_object(
                'ip', inet_client_addr(),
                'timestamp', NOW(),
                'reason', 'Cambio detectado en campo metadata del ledger'
            )
        );
        
        RAISE NOTICE 'AUDIT: Cambio de metadata en transaccion % registrado', OLD.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER: Ejecutar antes de la actualización (para capturar el OLD)
-- Nota: Se ejecuta AFTER porque BEFORE ya tiene trg_ledger_smart_lock
DROP TRIGGER IF EXISTS trg_audit_metadata_capital ON public.transacciones_capital;

CREATE TRIGGER trg_audit_metadata_capital
AFTER UPDATE ON public.transacciones_capital
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_metadata_changes();

-- 3. Asegurar que audit_log tiene las columnas necesarias
DO $$
BEGIN
    -- Verificar si tabla audit_log existe, si no, crearla
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        CREATE TABLE public.audit_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tabla VARCHAR(100) NOT NULL,
            registro_id UUID NOT NULL,
            accion VARCHAR(50) NOT NULL,
            usuario_id UUID,
            datos_anteriores JSONB,
            datos_nuevos JSONB,
            metadata JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX idx_audit_log_tabla ON public.audit_log(tabla);
        CREATE INDEX idx_audit_log_registro ON public.audit_log(registro_id);
        CREATE INDEX idx_audit_log_accion ON public.audit_log(accion);
        CREATE INDEX idx_audit_log_fecha ON public.audit_log(created_at DESC);
    END IF;
END $$;

-- 4. COMENTARIOS
COMMENT ON FUNCTION public.fn_audit_metadata_changes IS
'Captura cambios en metadata de transacciones_capital para auditoría completa.
Cierra el gap donde Smart Lock permite editar metadata pero no se auditaba.';

COMMIT;
