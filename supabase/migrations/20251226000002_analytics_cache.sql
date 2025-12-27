-- ============================================================================
-- MIGRATION: Analytics Materialized Cache
-- FECHA: 2025-12-26
-- DESCRIPCIÓN: Tabla de métricas pre-calculadas para escalabilidad del Super Admin.
-- ============================================================================

-- 1. Crear Tabla Caché
CREATE TABLE IF NOT EXISTS public.metricas_uso_tenant (
    empresa_id UUID PRIMARY KEY REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre_empresa TEXT, -- Desnormalizado para evitar joins en listas masivas
    usuarios_activos INT DEFAULT 0,
    sucursales_activas INT DEFAULT 0,
    creditos_historicos INT DEFAULT 0,
    creditos_vigentes INT DEFAULT 0,
    monto_cartera_vigente NUMERIC(15,2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Super Admin ve todo, Empresa se ve a sí misma (por si acaso quieren ver sus propios stats)
ALTER TABLE public.metricas_uso_tenant ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all_metrics"
ON public.metricas_uso_tenant FOR ALL TO authenticated
USING (is_super_admin());

CREATE POLICY "tenant_read_own_metrics"
ON public.metricas_uso_tenant FOR SELECT TO authenticated
USING (empresa_id = get_user_empresa());


-- 2. Función de Recálculo Atómico (Upsert)
CREATE OR REPLACE FUNCTION public.recalc_tenant_metrics(p_empresa_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_nombre TEXT;
    v_usuarios INT;
    v_sucursales INT;
    v_creditos_hist INT;
    v_creditos_vig INT;
    v_monto_vigente NUMERIC;
BEGIN
    -- Obtener nombre
    SELECT nombre_comercial INTO v_nombre FROM empresas WHERE id = p_empresa_id;

    -- Contar Usuarios Activos
    SELECT COUNT(*) INTO v_usuarios 
    FROM empleados e JOIN sucursales s ON e.sucursal_id = s.id 
    WHERE s.empresa_id = p_empresa_id AND e.activo = true;

    -- Contar Sucursales Activas
    SELECT COUNT(*) INTO v_sucursales 
    FROM sucursales 
    WHERE empresa_id = p_empresa_id AND activa = true;

    -- Contar Créditos Totales (Histórico)
    SELECT COUNT(*) INTO v_creditos_hist 
    FROM creditos 
    WHERE empresa_id = p_empresa_id;

    -- Contar Créditos Vigentes
    SELECT COUNT(*), COALESCE(SUM(saldo_pendiente), 0) 
    INTO v_creditos_vig, v_monto_vigente
    FROM creditos 
    WHERE empresa_id = p_empresa_id 
    AND estado_detallado IN ('vigente', 'vencido', 'en_mora', 'por_vencer', 'en_gracia', 'pre_remate');

    -- Upsert en la tabla caché
    INSERT INTO metricas_uso_tenant (
        empresa_id, 
        nombre_empresa, 
        usuarios_activos, 
        sucursales_activas, 
        creditos_historicos, 
        creditos_vigentes, 
        monto_cartera_vigente,
        last_updated
    )
    VALUES (
        p_empresa_id,
        v_nombre,
        v_usuarios,
        v_sucursales,
        v_creditos_hist,
        v_creditos_vig,
        v_monto_vigente,
        NOW()
    )
    ON CONFLICT (empresa_id) DO UPDATE SET
        nombre_empresa = EXCLUDED.nombre_empresa,
        usuarios_activos = EXCLUDED.usuarios_activos,
        sucursales_activas = EXCLUDED.sucursales_activas,
        creditos_historicos = EXCLUDED.creditos_historicos,
        creditos_vigentes = EXCLUDED.creditos_vigentes,
        monto_cartera_vigente = EXCLUDED.monto_cartera_vigente,
        last_updated = NOW();
END;
$$;


-- 3. Crea la función Trigger
CREATE OR REPLACE FUNCTION public.trg_update_metrics_proxy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_empresa_id UUID;
BEGIN
    -- Intentar deducir empresa_id del NEW record
    IF (TG_TABLE_NAME = 'creditos' OR TG_TABLE_NAME = 'sucursales') THEN
        IF (TG_OP = 'DELETE') THEN v_empresa_id := OLD.empresa_id;
        ELSE v_empresa_id := NEW.empresa_id;
        END IF;
    ELSIF (TG_TABLE_NAME = 'empleados') THEN
        -- Empleados no tiene empresa_id directo, tiene sucursal_id
        IF (TG_OP = 'DELETE') THEN 
            SELECT empresa_id INTO v_empresa_id FROM sucursales WHERE id = OLD.sucursal_id;
        ELSE 
            SELECT empresa_id INTO v_empresa_id FROM sucursales WHERE id = NEW.sucursal_id;
        END IF;
    END IF;

    IF v_empresa_id IS NOT NULL THEN
        PERFORM public.recalc_tenant_metrics(v_empresa_id);
    END IF;
    
    RETURN NULL; -- Trigger AFTER, return value ignored
END;
$$;


-- 4. Asociar Triggers
DROP TRIGGER IF EXISTS trg_metrics_creditos ON public.creditos;
CREATE TRIGGER trg_metrics_creditos
AFTER INSERT OR UPDATE OR DELETE ON public.creditos
FOR EACH ROW EXECUTE FUNCTION public.trg_update_metrics_proxy();

DROP TRIGGER IF EXISTS trg_metrics_sucursales ON public.sucursales;
CREATE TRIGGER trg_metrics_sucursales
AFTER INSERT OR UPDATE OR DELETE ON public.sucursales
FOR EACH ROW EXECUTE FUNCTION public.trg_update_metrics_proxy();

DROP TRIGGER IF EXISTS trg_metrics_empleados ON public.empleados;
CREATE TRIGGER trg_metrics_empleados
AFTER INSERT OR UPDATE OR DELETE ON public.empleados
FOR EACH ROW EXECUTE FUNCTION public.trg_update_metrics_proxy();


-- 5. Backfill Inicial (Poblar datos existentes)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.empresas LOOP
        PERFORM public.recalc_tenant_metrics(r.id);
    END LOOP;
END;
$$;
