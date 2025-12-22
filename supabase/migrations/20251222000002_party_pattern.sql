-- Migración: Implementación del Patrón Party (Estándar de Industria)
-- Fecha: 2025-12-22
-- Descripción: Refactoring de tabla 'personas' para soportar personas naturales y jurídicas.
--              Sigue el patrón Party usado en SAP, Oracle ERP, sistemas bancarios.

-- ============================================================================
-- FASE 1: CREAR NUEVAS TABLAS
-- ============================================================================

-- 1.1 Tabla base PARTIES
CREATE TABLE IF NOT EXISTS public.parties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    party_type VARCHAR(10) NOT NULL CHECK (party_type IN ('NATURAL', 'JURIDICA')),
    tax_id_type VARCHAR(10) NOT NULL CHECK (tax_id_type IN ('DNI', 'CE', 'RUC', 'PASAPORTE')),
    tax_id VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    telefono_principal VARCHAR(20),
    telefono_secundario VARCHAR(20),
    direccion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    _modified TIMESTAMPTZ DEFAULT NOW(),
    _deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(tax_id_type, tax_id)
);

COMMENT ON TABLE public.parties IS 'Tabla base del patrón Party. Entidad abstracta que representa persona natural o jurídica.';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_parties_tax_id ON public.parties(tax_id);
CREATE INDEX IF NOT EXISTS idx_parties_type ON public.parties(party_type);


-- 1.2 Extensión para Personas Naturales
CREATE TABLE IF NOT EXISTS public.personas_naturales (
    party_id UUID PRIMARY KEY REFERENCES public.parties(id) ON DELETE CASCADE,
    nombres VARCHAR(200) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE,
    sexo VARCHAR(1) CHECK (sexo IN ('M', 'F', NULL))
);

COMMENT ON TABLE public.personas_naturales IS 'Extensión de parties para personas naturales (DNI, CE, Pasaporte).';


-- 1.3 Extensión para Personas Jurídicas
CREATE TABLE IF NOT EXISTS public.personas_juridicas (
    party_id UUID PRIMARY KEY REFERENCES public.parties(id) ON DELETE CASCADE,
    razon_social VARCHAR(300) NOT NULL,
    nombre_comercial VARCHAR(200),
    representante_legal_id UUID REFERENCES public.parties(id),
    fecha_constitucion DATE,
    tipo_sociedad VARCHAR(20) CHECK (tipo_sociedad IN ('SAC', 'SA', 'SRL', 'EIRL', 'ASOCIACION', 'OTRO'))
);

COMMENT ON TABLE public.personas_juridicas IS 'Extensión de parties para personas jurídicas (RUC).';


-- ============================================================================
-- FASE 2: MIGRAR DATOS EXISTENTES
-- ============================================================================

-- 2.1 Insertar en parties desde personas existente
INSERT INTO public.parties (id, party_type, tax_id_type, tax_id, email, telefono_principal, telefono_secundario, direccion, created_at, updated_at)
SELECT 
    id, 
    'NATURAL' as party_type, 
    tipo_documento as tax_id_type, 
    numero_documento as tax_id, 
    email, 
    telefono_principal, 
    telefono_secundario, 
    direccion, 
    created_at, 
    updated_at
FROM public.personas
ON CONFLICT (tax_id_type, tax_id) DO NOTHING;

-- 2.2 Insertar en personas_naturales
INSERT INTO public.personas_naturales (party_id, nombres, apellido_paterno, apellido_materno)
SELECT id, nombres, apellido_paterno, apellido_materno
FROM public.personas
ON CONFLICT (party_id) DO NOTHING;


-- ============================================================================
-- FASE 3: ACTUALIZAR FOREIGN KEYS EN TABLAS HIJAS
-- ============================================================================

-- 3.1 CLIENTES: Añadir party_id y migrar datos
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES public.parties(id);

UPDATE public.clientes 
SET party_id = persona_id 
WHERE party_id IS NULL AND persona_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_party_id ON public.clientes(party_id);


-- 3.2 EMPLEADOS: Añadir party_id y migrar datos
ALTER TABLE public.empleados 
ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES public.parties(id);

UPDATE public.empleados 
SET party_id = persona_id 
WHERE party_id IS NULL AND persona_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_empleados_party_id ON public.empleados(party_id);


-- 3.3 INVERSIONISTAS: Añadir party_id y migrar datos
ALTER TABLE public.inversionistas 
ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES public.parties(id);

UPDATE public.inversionistas 
SET party_id = persona_id 
WHERE party_id IS NULL AND persona_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inversionistas_party_id ON public.inversionistas(party_id);


-- ============================================================================
-- FASE 4: VISTAS DE COMPATIBILIDAD
-- ============================================================================

-- 4.1 Vista unificada de parties
CREATE OR REPLACE VIEW public.parties_completo AS
SELECT 
    p.id,
    p.party_type,
    p.tax_id_type,
    p.tax_id,
    p.email,
    p.telefono_principal,
    p.telefono_secundario,
    p.direccion,
    -- Campos de persona natural
    pn.nombres,
    pn.apellido_paterno,
    pn.apellido_materno,
    pn.fecha_nacimiento,
    pn.sexo,
    -- Campos de persona jurídica
    pj.razon_social,
    pj.nombre_comercial,
    pj.representante_legal_id,
    pj.fecha_constitucion,
    pj.tipo_sociedad,
    -- Nombre display unificado
    CASE 
        WHEN p.party_type = 'NATURAL' THEN 
            CONCAT(pn.nombres, ' ', pn.apellido_paterno, ' ', COALESCE(pn.apellido_materno, ''))
        ELSE 
            pj.razon_social
    END as nombre_completo,
    p.created_at,
    p.updated_at
FROM public.parties p
LEFT JOIN public.personas_naturales pn ON p.id = pn.party_id
LEFT JOIN public.personas_juridicas pj ON p.id = pj.party_id;


-- 4.2 Actualizar vista clientes_completo para usar party
DROP VIEW IF EXISTS public.clientes_completo;
CREATE VIEW public.clientes_completo AS
SELECT 
    c.id,
    c.party_id,
    c.empresa_id,
    c.score_crediticio,
    c.activo,
    c.created_at,
    pc.tax_id_type as tipo_documento,
    pc.tax_id as numero_documento,
    pc.nombre_completo,
    pc.nombres,
    pc.apellido_paterno,
    pc.apellido_materno,
    pc.razon_social,
    pc.email,
    pc.telefono_principal,
    pc.direccion,
    pc.party_type
FROM public.clientes c
JOIN public.parties_completo pc ON c.party_id = pc.id;


-- 4.3 Actualizar vista empleados_completo para usar party  
DROP VIEW IF EXISTS public.empleados_completo;
CREATE VIEW public.empleados_completo AS
SELECT 
    e.id,
    e.party_id,
    e.user_id,
    e.cargo,
    e.sucursal_id,
    e.activo,
    e.fecha_ingreso,
    e.fecha_salida,
    e.created_at,
    pc.tax_id_type as tipo_documento,
    pc.tax_id as numero_documento,
    pc.nombre_completo,
    pc.nombres,
    pc.apellido_paterno,
    pc.apellido_materno,
    pc.email,
    pc.telefono_principal,
    s.nombre as sucursal_nombre,
    s.empresa_id
FROM public.empleados e
JOIN public.parties_completo pc ON e.party_id = pc.id
LEFT JOIN public.sucursales s ON e.sucursal_id = s.id;


-- ============================================================================
-- FASE 5: RLS PARA NUEVAS TABLAS
-- ============================================================================

-- 5.1 Parties: Lectura para autenticados (datos de identidad compartidos)
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_parties" ON public.parties
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_parties" ON public.parties
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- 5.2 Personas Naturales: Misma política que parties
ALTER TABLE public.personas_naturales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_naturales" ON public.personas_naturales
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_naturales" ON public.personas_naturales
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- 5.3 Personas Jurídicas: Misma política que parties
ALTER TABLE public.personas_juridicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_juridicas" ON public.personas_juridicas
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_juridicas" ON public.personas_juridicas
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================================
-- FASE 6: FUNCIÓN HELPER PARA CREAR PARTIES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_or_create_party(
    p_party_type VARCHAR(10),
    p_tax_id_type VARCHAR(10),
    p_tax_id VARCHAR(20),
    p_nombres VARCHAR(200) DEFAULT NULL,
    p_apellido_paterno VARCHAR(100) DEFAULT NULL,
    p_apellido_materno VARCHAR(100) DEFAULT NULL,
    p_razon_social VARCHAR(300) DEFAULT NULL,
    p_email VARCHAR(100) DEFAULT NULL,
    p_telefono VARCHAR(20) DEFAULT NULL,
    p_direccion TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_party_id UUID;
BEGIN
    -- Buscar si ya existe
    SELECT id INTO v_party_id
    FROM public.parties
    WHERE tax_id_type = p_tax_id_type AND tax_id = p_tax_id;

    IF v_party_id IS NULL THEN
        -- Crear party base
        INSERT INTO public.parties (party_type, tax_id_type, tax_id, email, telefono_principal, direccion)
        VALUES (p_party_type, p_tax_id_type, p_tax_id, p_email, p_telefono, p_direccion)
        RETURNING id INTO v_party_id;

        -- Crear extensión según tipo
        IF p_party_type = 'NATURAL' THEN
            INSERT INTO public.personas_naturales (party_id, nombres, apellido_paterno, apellido_materno)
            VALUES (v_party_id, p_nombres, p_apellido_paterno, p_apellido_materno);
        ELSIF p_party_type = 'JURIDICA' THEN
            INSERT INTO public.personas_juridicas (party_id, razon_social)
            VALUES (v_party_id, p_razon_social);
        END IF;
    END IF;

    RETURN v_party_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_or_create_party IS 'Obtiene o crea una party (persona natural o jurídica) de forma atómica.';
