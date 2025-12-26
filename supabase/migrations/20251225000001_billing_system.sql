-- ============================================================
-- Q3 2026: Billing/Suscripciones System
-- ============================================================
-- Tables: planes_suscripcion, suscripciones, facturas
-- Adds plan_id to empresas for subscription tracking
-- ============================================================

-- 1. PLANES DE SUSCRIPCIÓN
CREATE TABLE IF NOT EXISTS planes_suscripcion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) NOT NULL UNIQUE,           -- 'basico', 'pro', 'enterprise'
    nombre_display VARCHAR(100) NOT NULL,          -- 'Plan Básico'
    descripcion TEXT,
    precio_mensual DECIMAL(10,2) NOT NULL,
    precio_anual DECIMAL(10,2),
    moneda VARCHAR(3) DEFAULT 'PEN',
    -- Límites del plan
    max_usuarios INT DEFAULT 3,
    max_sucursales INT DEFAULT 1,
    max_creditos_mes INT DEFAULT 100,
    max_creditos_activos INT DEFAULT 50,
    -- Features como JSON para flexibilidad
    features JSONB DEFAULT '[]'::jsonb,
    -- Control
    orden INT DEFAULT 0,                          -- Para ordenar en UI
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,              -- Para resaltar plan recomendado
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUSCRIPCIONES ACTIVAS
CREATE TABLE IF NOT EXISTS suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES planes_suscripcion(id),
    -- Estado de la suscripción
    estado VARCHAR(20) DEFAULT 'trial' CHECK (estado IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
    -- Fechas importantes
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE,                               -- NULL = indefinido
    fecha_proximo_cobro DATE,
    dias_trial INT DEFAULT 14,
    -- Integración con pasarela (futuro)
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Una suscripción activa por empresa
    UNIQUE(empresa_id)
);

-- 3. HISTORIAL DE FACTURAS
CREATE TABLE IF NOT EXISTS facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(20) NOT NULL UNIQUE,           -- F001-00001
    empresa_id UUID NOT NULL REFERENCES empresas(id),
    suscripcion_id UUID REFERENCES suscripciones(id),
    -- Montos
    subtotal DECIMAL(10,2) NOT NULL,
    igv DECIMAL(10,2) DEFAULT 0,                  -- 18% en Perú
    total DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    -- Estado
    estado VARCHAR(20) DEFAULT 'pending' CHECK (estado IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
    -- Fechas
    fecha_emision TIMESTAMPTZ DEFAULT NOW(),
    fecha_vencimiento DATE,
    fecha_pago TIMESTAMPTZ,
    -- Integración con pasarela
    stripe_invoice_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    -- Documento
    pdf_url TEXT,
    concepto VARCHAR(255) DEFAULT 'Suscripción mensual',
    notas TEXT,
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AGREGAR plan_id A EMPRESAS
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'plan_id'
    ) THEN
        ALTER TABLE empresas ADD COLUMN plan_id UUID REFERENCES planes_suscripcion(id);
    END IF;
END $$;

-- 5. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_suscripciones_empresa ON suscripciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_empresa ON facturas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_emision);

-- 6. RLS POLICIES
ALTER TABLE planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Planes: visibles para todos (son públicos)
CREATE POLICY "Planes visibles para todos" ON planes_suscripcion
    FOR SELECT USING (activo = true);

-- Suscripciones: solo la propia empresa
CREATE POLICY "Empresa ve su suscripción" ON suscripciones
    FOR SELECT USING (empresa_id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "Super admin ve todas las suscripciones" ON suscripciones
    FOR ALL USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'SUPER_ADMIN')
    );

-- Facturas: solo la propia empresa
CREATE POLICY "Empresa ve sus facturas" ON facturas
    FOR SELECT USING (empresa_id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY "Super admin ve todas las facturas" ON facturas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'SUPER_ADMIN')
    );

-- 7. SEED: PLANES INICIALES
INSERT INTO planes_suscripcion (nombre, nombre_display, descripcion, precio_mensual, precio_anual, max_usuarios, max_sucursales, max_creditos_mes, max_creditos_activos, features, orden, destacado) VALUES
(
    'basico', 
    'Plan Básico', 
    'Ideal para empezar. Todo lo esencial para gestionar tu casa de empeño.',
    99.00, 
    990.00, 
    3, 
    1, 
    100,
    50,
    '["Dashboard básico", "Gestión de créditos", "Reportes PDF", "WhatsApp manual", "Soporte por email"]'::jsonb,
    1,
    false
),
(
    'pro', 
    'Plan Pro', 
    'Para negocios en crecimiento. Automatización y múltiples sucursales.',
    199.00, 
    1990.00, 
    10, 
    3, 
    500,
    200,
    '["Dashboard premium con KPIs", "WhatsApp automático", "Integración bancaria", "Multi-sucursal", "Reportes avanzados", "Soporte prioritario"]'::jsonb,
    2,
    true  -- Plan destacado
),
(
    'enterprise', 
    'Plan Enterprise', 
    'Solución completa para grandes operaciones. Sin límites.',
    499.00, 
    4990.00, 
    -1,  -- Ilimitado
    -1,  -- Ilimitado
    -1,  -- Ilimitado
    -1,  -- Ilimitado
    '["Todo incluido", "Usuarios ilimitados", "Sucursales ilimitadas", "API acceso", "White-label", "Soporte dedicado 24/7", "Capacitación incluida"]'::jsonb,
    3,
    false
)
ON CONFLICT (nombre) DO UPDATE SET
    nombre_display = EXCLUDED.nombre_display,
    descripcion = EXCLUDED.descripcion,
    precio_mensual = EXCLUDED.precio_mensual,
    precio_anual = EXCLUDED.precio_anual,
    max_usuarios = EXCLUDED.max_usuarios,
    max_sucursales = EXCLUDED.max_sucursales,
    max_creditos_mes = EXCLUDED.max_creditos_mes,
    features = EXCLUDED.features,
    orden = EXCLUDED.orden,
    destacado = EXCLUDED.destacado,
    updated_at = NOW();

-- 8. FUNCIÓN HELPER: Obtener plan de empresa
CREATE OR REPLACE FUNCTION get_empresa_plan(p_empresa_id UUID)
RETURNS TABLE (
    plan_nombre VARCHAR,
    max_usuarios INT,
    max_sucursales INT,
    max_creditos_mes INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.nombre,
        p.max_usuarios,
        p.max_sucursales,
        p.max_creditos_mes
    FROM empresas e
    LEFT JOIN suscripciones s ON s.empresa_id = e.id
    LEFT JOIN planes_suscripcion p ON p.id = COALESCE(s.plan_id, e.plan_id)
    WHERE e.id = p_empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. FUNCIÓN: Verificar límite de usuarios
CREATE OR REPLACE FUNCTION check_usuario_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_max_usuarios INT;
    v_current_count INT;
    v_empresa_id UUID;
BEGIN
    -- Obtener empresa_id del nuevo usuario
    v_empresa_id := (SELECT empresa_id FROM sucursales WHERE id = NEW.sucursal_id);
    
    IF v_empresa_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener límite del plan
    SELECT COALESCE(p.max_usuarios, 999)
    INTO v_max_usuarios
    FROM empresas e
    LEFT JOIN suscripciones s ON s.empresa_id = e.id AND s.estado IN ('active', 'trial')
    LEFT JOIN planes_suscripcion p ON p.id = COALESCE(s.plan_id, e.plan_id)
    WHERE e.id = v_empresa_id;
    
    -- -1 significa ilimitado
    IF v_max_usuarios = -1 THEN
        RETURN NEW;
    END IF;
    
    -- Contar usuarios actuales
    SELECT COUNT(*)
    INTO v_current_count
    FROM empleados emp
    JOIN sucursales suc ON suc.id = emp.sucursal_id
    WHERE suc.empresa_id = v_empresa_id
    AND emp.estado = 'ACTIVO';
    
    IF v_current_count >= v_max_usuarios THEN
        RAISE EXCEPTION 'Límite de usuarios alcanzado (% de %). Actualiza tu plan para agregar más usuarios.', 
            v_current_count, v_max_usuarios;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar límite (comentado para evitar bloqueos en desarrollo)
-- CREATE TRIGGER trg_check_usuario_limit
-- BEFORE INSERT ON empleados
-- FOR EACH ROW EXECUTE FUNCTION check_usuario_limit();

-- 10. SECUENCIA PARA NÚMEROS DE FACTURA
CREATE SEQUENCE IF NOT EXISTS seq_factura_numero START 1;

CREATE OR REPLACE FUNCTION generate_factura_numero()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero := 'F001-' || LPAD(nextval('seq_factura_numero')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_factura_numero
BEFORE INSERT ON facturas
FOR EACH ROW
WHEN (NEW.numero IS NULL)
EXECUTE FUNCTION generate_factura_numero();

-- ============================================================
-- FIN DE MIGRACIÓN: Billing System
-- ============================================================
