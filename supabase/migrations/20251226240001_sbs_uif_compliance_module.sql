-- =====================================================
-- SBS/UIF COMPLIANCE MODULE
-- Resolución SBS N° 00650-2024
-- Ley N.º 27693 (UIF-Perú)
-- =====================================================

-- =====================================================
-- 1. COMPLIANCE OFFICERS TABLE
-- Oficial de Cumplimiento requerido por SBS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.oficiales_cumplimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Personal Info
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    
    -- SBS Registration
    fecha_designacion DATE NOT NULL,
    numero_resolucion VARCHAR(50), -- Resolución interna de designación
    registrado_uif BOOLEAN DEFAULT false,
    fecha_registro_uif DATE,
    
    -- Training
    ultima_capacitacion DATE,
    horas_capacitacion INTEGER DEFAULT 0,
    
    -- Status
    activo BOOLEAN DEFAULT true,
    fecha_baja DATE,
    motivo_baja TEXT,
    
    UNIQUE(empresa_id, activo) -- Solo un oficial activo por empresa
);

CREATE INDEX IF NOT EXISTS idx_oficiales_empresa ON oficiales_cumplimiento(empresa_id);

-- =====================================================
-- 2. SUSPICIOUS OPERATIONS REPORTS (ROS)
-- Reporte de Operación Sospechosa - UIF
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reportes_operacion_sospechosa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
    sucursal_id UUID REFERENCES sucursales(id),
    
    -- Report Details
    numero_reporte VARCHAR(20) NOT NULL UNIQUE,
    fecha_deteccion DATE NOT NULL,
    fecha_reporte DATE,
    
    -- Client Info
    cliente_id UUID REFERENCES clientes(id),
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_dni VARCHAR(20),
    
    -- Operation Info
    tipo_operacion VARCHAR(50) NOT NULL, -- 'empeno', 'desempeno', 'pago', 'remate'
    monto DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    descripcion_operacion TEXT NOT NULL,
    
    -- Suspicion Details
    motivo_sospecha TEXT NOT NULL,
    indicadores_alerta TEXT[], -- Array de indicadores
    
    -- Status
    estado VARCHAR(30) DEFAULT 'borrador', -- 'borrador', 'revision', 'enviado', 'confirmado'
    enviado_uif_at TIMESTAMPTZ,
    confirmacion_uif VARCHAR(50),
    
    -- Internal
    detectado_por UUID NOT NULL,
    revisado_por UUID,
    notas_internas TEXT,
    
    -- Documents
    documentos_adjuntos JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_ros_empresa ON reportes_operacion_sospechosa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ros_estado ON reportes_operacion_sospechosa(estado);
CREATE INDEX IF NOT EXISTS idx_ros_fecha ON reportes_operacion_sospechosa(fecha_deteccion DESC);

-- =====================================================
-- 3. CLIENT KYC VERIFICATION
-- Conoce a tu Cliente - Obligatorio SBS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.verificaciones_kyc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Verification Status
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'verificado', 'rechazado', 'vencido'
    nivel_riesgo VARCHAR(20) DEFAULT 'normal', -- 'bajo', 'normal', 'alto', 'pep'
    
    -- Document Verification
    dni_verificado BOOLEAN DEFAULT false,
    dni_fecha_verificacion TIMESTAMPTZ,
    dni_fuente VARCHAR(50), -- 'RENIEC', 'manual'
    
    -- Address Verification
    direccion_verificada BOOLEAN DEFAULT false,
    direccion_fecha_verificacion TIMESTAMPTZ,
    
    -- Source of Funds (for large operations)
    origen_fondos_declarado TEXT,
    origen_fondos_verificado BOOLEAN DEFAULT false,
    
    -- PEP Check (Politically Exposed Person)
    es_pep BOOLEAN DEFAULT false,
    pep_cargo TEXT,
    pep_fecha_verificacion TIMESTAMPTZ,
    
    -- List Checks
    lista_negra_verificada BOOLEAN DEFAULT false,
    lista_negra_fecha TIMESTAMPTZ,
    en_lista_negra BOOLEAN DEFAULT false,
    
    -- Validity
    fecha_vencimiento DATE,
    
    -- Notes
    notas TEXT,
    
    UNIQUE(cliente_id, empresa_id)
);

CREATE INDEX IF NOT EXISTS idx_kyc_cliente ON verificaciones_kyc(cliente_id);
CREATE INDEX IF NOT EXISTS idx_kyc_empresa ON verificaciones_kyc(empresa_id);
CREATE INDEX IF NOT EXISTS idx_kyc_estado ON verificaciones_kyc(estado);
CREATE INDEX IF NOT EXISTS idx_kyc_riesgo ON verificaciones_kyc(nivel_riesgo);

-- =====================================================
-- 4. COMPLIANCE TRAINING RECORDS
-- Registro de Capacitaciones - Obligatorio SBS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.capacitaciones_cumplimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL,
    
    -- Training Info
    tipo VARCHAR(50) NOT NULL, -- 'induccion', 'anual', 'actualizacion'
    tema VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Duration
    fecha DATE NOT NULL,
    horas DECIMAL(4,2) NOT NULL,
    
    -- Completion
    completado BOOLEAN DEFAULT false,
    puntaje INTEGER, -- Si hay evaluación
    
    -- Certificate
    certificado_url TEXT,
    
    -- Provider
    proveedor VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_capacitaciones_empresa ON capacitaciones_cumplimiento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_capacitaciones_usuario ON capacitaciones_cumplimiento(usuario_id);

-- =====================================================
-- 5. COMPLIANCE REPORTS LOG
-- Registro de Reportes Regulatorios Enviados
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reportes_regulatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Report Info
    tipo_reporte VARCHAR(50) NOT NULL, -- 'sbs_mensual', 'uif_trimestral', 'ros', 'declaracion_anual'
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    
    -- Status
    estado VARCHAR(20) DEFAULT 'generado', -- 'generado', 'enviado', 'aceptado', 'rechazado'
    fecha_envio TIMESTAMPTZ,
    confirmacion VARCHAR(100),
    
    -- Content
    datos JSONB NOT NULL,
    archivo_url TEXT,
    
    -- Rejection (if any)
    motivo_rechazo TEXT,
    fecha_correccion TIMESTAMPTZ,
    
    -- Who
    generado_por UUID NOT NULL,
    enviado_por UUID
);

CREATE INDEX IF NOT EXISTS idx_reportes_reg_empresa ON reportes_regulatorios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_reportes_reg_tipo ON reportes_regulatorios(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_reg_estado ON reportes_regulatorios(estado);

-- =====================================================
-- 6. OPERATION THRESHOLDS CONFIG
-- Umbrales para detección automática
-- =====================================================
CREATE TABLE IF NOT EXISTS public.umbrales_operacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE, -- NULL = global
    
    -- Threshold
    nombre VARCHAR(100) NOT NULL,
    tipo_operacion VARCHAR(50) NOT NULL, -- 'empeno', 'desempeno', 'pago', 'all'
    monto_umbral DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    
    -- Action
    accion VARCHAR(50) NOT NULL, -- 'alerta', 'bloqueo', 'kyc_reforzado', 'ros_automatico'
    requiere_aprobacion BOOLEAN DEFAULT false,
    
    -- Status
    activo BOOLEAN DEFAULT true,
    
    -- Notes
    descripcion TEXT
);

-- Insert default thresholds (SBS requirement)
INSERT INTO umbrales_operacion (empresa_id, nombre, tipo_operacion, monto_umbral, moneda, accion, descripcion)
VALUES 
    (NULL, 'Operación mayor a S/10,000', 'empeno', 10000, 'PEN', 'kyc_reforzado', 'Requiere verificación adicional de origen de fondos'),
    (NULL, 'Operación mayor a S/30,000', 'all', 30000, 'PEN', 'alerta', 'Alerta automática al Oficial de Cumplimiento'),
    (NULL, 'Operación mayor a S/50,000', 'all', 50000, 'PEN', 'ros_automatico', 'Genera ROS automático para revisión')
ON CONFLICT DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE oficiales_cumplimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_operacion_sospechosa ENABLE ROW LEVEL SECURITY;
ALTER TABLE verificaciones_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacitaciones_cumplimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_regulatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE umbrales_operacion ENABLE ROW LEVEL SECURITY;

-- Super Admin full access
CREATE POLICY super_admin_oficiales ON oficiales_cumplimiento FOR ALL 
    USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'super_admin'));

CREATE POLICY super_admin_ros ON reportes_operacion_sospechosa FOR ALL 
    USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'super_admin'));

CREATE POLICY super_admin_kyc ON verificaciones_kyc FOR ALL 
    USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'super_admin'));

CREATE POLICY super_admin_capacitaciones ON capacitaciones_cumplimiento FOR ALL 
    USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'super_admin'));

CREATE POLICY super_admin_reportes ON reportes_regulatorios FOR ALL 
    USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'super_admin'));

CREATE POLICY super_admin_umbrales ON umbrales_operacion FOR ALL 
    USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'super_admin'));

-- Tenant access to their own data
CREATE POLICY tenant_oficiales ON oficiales_cumplimiento FOR ALL 
    USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY tenant_ros ON reportes_operacion_sospechosa FOR ALL 
    USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY tenant_kyc ON verificaciones_kyc FOR ALL 
    USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY tenant_capacitaciones ON capacitaciones_cumplimiento FOR ALL 
    USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY tenant_reportes ON reportes_regulatorios FOR ALL 
    USING (empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

CREATE POLICY tenant_umbrales ON umbrales_operacion FOR SELECT 
    USING (empresa_id IS NULL OR empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE oficiales_cumplimiento IS 'Oficiales de Cumplimiento designados según Res. SBS N° 00650-2024';
COMMENT ON TABLE reportes_operacion_sospechosa IS 'Reportes de Operaciones Sospechosas (ROS) para UIF-Perú';
COMMENT ON TABLE verificaciones_kyc IS 'Verificación Conoce a tu Cliente (KYC) según normativa SBS';
COMMENT ON TABLE capacitaciones_cumplimiento IS 'Registro de capacitaciones PLAFT obligatorias';
COMMENT ON TABLE reportes_regulatorios IS 'Log de reportes enviados a reguladores (SBS/UIF)';
COMMENT ON TABLE umbrales_operacion IS 'Umbrales para detección automática de operaciones de riesgo';
