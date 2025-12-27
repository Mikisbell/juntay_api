-- =====================================================
-- ENTERPRISE SYSADMIN MODULES
-- Audit Logs, Alerts, Billing, Health Metrics
-- =====================================================

-- =====================================================
-- 1. AUDIT LOGS TABLE
-- Registro de todas las acciones del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    
    -- Who performed the action
    user_id UUID,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    
    -- What action was performed
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Details of the change
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Categorization
    category VARCHAR(50) DEFAULT 'general', -- 'auth', 'financial', 'config', 'general'
    severity VARCHAR(20) DEFAULT 'info' -- 'info', 'warning', 'critical'
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_empresa ON audit_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_category ON audit_logs(category);

-- =====================================================
-- 2. SYSTEM ALERTS TABLE
-- Alertas configurables para monitoreo
-- =====================================================
CREATE TABLE IF NOT EXISTS public.alertas_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Target (nullable for global alerts)
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE CASCADE,
    
    -- Alert Details
    tipo VARCHAR(50) NOT NULL, -- 'mora_alta', 'pago_vencido', 'uso_bajo', 'error_sistema', 'nuevo_tenant', 'billing'
    severidad VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'critical'
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- State Management
    estado VARCHAR(20) DEFAULT 'activa', -- 'activa', 'vista', 'resuelta', 'ignorada'
    visto_por UUID,
    visto_at TIMESTAMPTZ,
    resuelto_por UUID,
    resuelto_at TIMESTAMPTZ,
    notas_resolucion TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    accion_requerida BOOLEAN DEFAULT false,
    accion_url VARCHAR(255),
    
    -- Auto-resolve
    auto_resolve_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas_sistema(estado);
CREATE INDEX IF NOT EXISTS idx_alertas_empresa ON alertas_sistema(empresa_id);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_sistema(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_severidad ON alertas_sistema(severidad);
CREATE INDEX IF NOT EXISTS idx_alertas_created ON alertas_sistema(created_at DESC);

-- =====================================================
-- 3. SaaS INVOICES TABLE
-- Facturación de suscripciones
-- =====================================================
CREATE TABLE IF NOT EXISTS public.facturas_saas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Company
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
    
    -- Period
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    
    -- Plan info at time of invoice
    plan_id UUID REFERENCES planes_suscripcion(id),
    plan_nombre VARCHAR(100),
    
    -- Amounts (USD)
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    
    -- Status
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'borrador', 'pendiente', 'pagada', 'vencida', 'cancelada'
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago TIMESTAMPTZ,
    
    -- Payment Info
    metodo_pago VARCHAR(50),
    referencia_pago VARCHAR(100),
    comprobante_url TEXT,
    
    -- Line Items
    items JSONB NOT NULL DEFAULT '[]', -- [{concepto, cantidad, precio_unitario, total}]
    
    -- Notes
    notas TEXT,
    notas_internas TEXT
);

CREATE INDEX IF NOT EXISTS idx_facturas_empresa ON facturas_saas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas_saas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas_saas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_facturas_vencimiento ON facturas_saas(fecha_vencimiento);

-- =====================================================
-- 4. SYSTEM HEALTH METRICS TABLE
-- Métricas de salud del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    
    -- Overall Status
    status VARCHAR(20) DEFAULT 'healthy', -- 'healthy', 'degraded', 'critical'
    
    -- Response Times (milliseconds)
    api_latency_avg DECIMAL(10,2),
    api_latency_p95 DECIMAL(10,2),
    api_latency_p99 DECIMAL(10,2),
    db_latency_avg DECIMAL(10,2),
    
    -- Request Counts
    requests_total INTEGER DEFAULT 0,
    requests_success INTEGER DEFAULT 0,
    requests_error INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    
    -- Database Stats
    db_connections_active INTEGER,
    db_connections_idle INTEGER,
    db_size_bytes BIGINT,
    
    -- Storage
    storage_used_bytes BIGINT,
    storage_limit_bytes BIGINT,
    
    -- By Tenant breakdown
    tenant_metrics JSONB DEFAULT '{}',
    
    -- Error details
    error_breakdown JSONB DEFAULT '{}' -- {type: count}
);

CREATE INDEX IF NOT EXISTS idx_health_timestamp ON system_health_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_status ON system_health_metrics(status);

-- =====================================================
-- 5. ALERT RULES TABLE (optional, for configurable alerts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    active BOOLEAN DEFAULT true,
    
    -- Rule definition
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    -- Trigger
    metrica VARCHAR(100) NOT NULL, -- 'mora_porcentaje', 'dias_sin_login', 'facturas_vencidas'
    operador VARCHAR(10) NOT NULL, -- '>', '<', '>=', '<=', '=='
    valor_umbral DECIMAL(10,2) NOT NULL,
    
    -- Alert Config
    severidad VARCHAR(20) DEFAULT 'warning',
    titulo_template VARCHAR(255) NOT NULL,
    mensaje_template TEXT NOT NULL,
    
    -- Notification
    notificar_email BOOLEAN DEFAULT true,
    notificar_dashboard BOOLEAN DEFAULT true,
    
    -- Cooldown
    cooldown_minutes INTEGER DEFAULT 60
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_alertas_sistema_updated_at') THEN
        CREATE TRIGGER update_alertas_sistema_updated_at
            BEFORE UPDATE ON alertas_sistema
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_facturas_saas_updated_at') THEN
        CREATE TRIGGER update_facturas_saas_updated_at
            BEFORE UPDATE ON facturas_saas
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- SEQUENCE FOR INVOICE NUMBERS
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS factura_saas_seq START 1000;

-- =====================================================
-- RLS POLICIES (Super Admin access)
-- =====================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_saas ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Super admin can see everything
CREATE POLICY super_admin_audit_logs ON audit_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'super_admin'
        )
    );

CREATE POLICY super_admin_alertas ON alertas_sistema
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'super_admin'
        )
    );

CREATE POLICY super_admin_facturas ON facturas_saas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'super_admin'
        )
    );

CREATE POLICY super_admin_health ON system_health_metrics
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'super_admin'
        )
    );

-- Tenant admins can see their own alerts
CREATE POLICY tenant_admin_alertas ON alertas_sistema
    FOR SELECT
    USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios
            WHERE usuarios.id = auth.uid()
        )
    );
