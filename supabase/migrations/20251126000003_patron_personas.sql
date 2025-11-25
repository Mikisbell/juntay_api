-- ============================================================================
-- MIGRACIÓN: Patrón "Personas" (Enterprise)
-- Descripción: Implementa una arquitectura escalable separando datos personales
--              de roles de negocio (clientes, empleados, etc.)
-- ============================================================================

-- PASO 1: Crear tabla maestra de PERSONAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Datos de Identificación
    tipo_documento VARCHAR(10) NOT NULL DEFAULT 'DNI', -- DNI, RUC, CE
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    
    -- Datos Personales
    nombres VARCHAR(200) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    
    -- Datos de Contacto
    email VARCHAR(100),
    telefono_principal VARCHAR(20),
    telefono_secundario VARCHAR(20),
    direccion TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_personas_numero_documento ON public.personas(numero_documento);
CREATE INDEX idx_personas_nombres ON public.personas(nombres);
CREATE INDEX idx_personas_apellido_paterno ON public.personas(apellido_paterno);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_personas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER personas_updated_at_trigger
    BEFORE UPDATE ON public.personas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_personas_updated_at();

-- ============================================================================
-- PASO 2: Migrar datos existentes de CLIENTES a PERSONAS
-- ============================================================================
INSERT INTO public.personas (
    tipo_documento,
    numero_documento,
    nombres,
    apellido_paterno,
    apellido_materno,
    email,
    telefono_principal,
    direccion,
    created_at
)
SELECT DISTINCT
    tipo_documento,
    numero_documento,
    nombres,
    COALESCE(apellido_paterno, ''),
    COALESCE(apellido_materno, ''),
    email,
    telefono_principal,
    direccion,
    created_at
FROM public.clientes
ON CONFLICT (numero_documento) DO NOTHING;

-- ============================================================================
-- PASO 3: Refactorizar tabla CLIENTES
-- ============================================================================

-- Agregar columna persona_id
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES public.personas(id);

-- Poblar persona_id basándose en numero_documento
UPDATE public.clientes c
SET persona_id = p.id
FROM public.personas p
WHERE c.numero_documento = p.numero_documento;

-- Remover campos duplicados (ahora están en personas)
-- NOTA: No los eliminamos aún para mantener compatibilidad. Lo haremos en una migración futura.
-- ALTER TABLE public.clientes DROP COLUMN IF EXISTS nombres;
-- ALTER TABLE public.clientes DROP COLUMN IF EXISTS apellido_paterno;
-- ALTER TABLE public.clientes DROP COLUMN IF EXISTS apellido_materno;
-- etc.

-- ============================================================================
-- PASO 4: Crear tabla EMPLEADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación con Persona
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    
    -- Relación con Autenticación (Supabase Auth)
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Información Laboral
    cargo VARCHAR(50) NOT NULL, -- 'cajero', 'gerente', 'admin', 'tasador'
    sucursal_id UUID, -- Para cuando haya múltiples sucursales
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    fecha_salida DATE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT empleados_persona_id_unique UNIQUE(persona_id)
);

-- Índices
CREATE INDEX idx_empleados_persona_id ON public.empleados(persona_id);
CREATE INDEX idx_empleados_user_id ON public.empleados(user_id);
CREATE INDEX idx_empleados_cargo ON public.empleados(cargo);

-- Trigger para updated_at
CREATE TRIGGER empleados_updated_at_trigger
    BEFORE UPDATE ON public.empleados
    FOR EACH ROW
    EXECUTE FUNCTION public.update_personas_updated_at();

-- ============================================================================
-- PASO 5: Crear VISTAS para mantener compatibilidad con código existente
-- ============================================================================

-- Vista: clientes_completo (une clientes con personas)
CREATE OR REPLACE VIEW public.clientes_completo AS
SELECT 
    c.id,
    c.persona_id,
    c.empresa_id,
    c.score_crediticio,
    c.activo,
    c.created_at,
    -- Datos de persona
    p.tipo_documento,
    p.numero_documento,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    (p.nombres || ' ' || p.apellido_paterno || ' ' || p.apellido_materno) as nombre_completo,
    p.email,
    p.telefono_principal,
    p.telefono_secundario,
    p.direccion
FROM public.clientes c
JOIN public.personas p ON c.persona_id = p.id;

-- Vista: empleados_completo (une empleados con personas)
CREATE OR REPLACE VIEW public.empleados_completo AS
SELECT 
    e.id,
    e.persona_id,
    e.user_id,
    e.cargo,
    e.sucursal_id,
    e.activo,
    e.fecha_ingreso,
    e.fecha_salida,
    e.created_at,
    -- Datos de persona
    p.tipo_documento,
    p.numero_documento,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    (p.nombres || ' ' || p.apellido_paterno || ' ' || p.apellido_materno) as nombre_completo,
    p.email,
    p.telefono_principal,
    p.direccion
FROM public.empleados e
JOIN public.personas p ON e.persona_id = p.id;

-- ============================================================================
-- PASO 6: Actualizar RPCs existentes para usar VISTAS
-- ============================================================================

-- Actualizar get_upcoming_expirations para usar la vista
DROP FUNCTION IF EXISTS public.get_upcoming_expirations(int);

CREATE OR REPLACE FUNCTION public.get_upcoming_expirations(p_days int DEFAULT 7)
RETURNS TABLE (
    id uuid,
    codigo varchar,
    cliente_nombre text,
    garantia_descripcion text,
    garantia_foto text,
    fecha_vencimiento date,
    dias_restantes int,
    monto_prestamo numeric,
    telefono varchar
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.codigo,
        cl.nombre_completo as cliente_nombre,
        g.descripcion as garantia_descripcion,
        (g.fotos_urls)[1] as garantia_foto,
        c.fecha_vencimiento,
        (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
        c.monto_prestado,
        cl.telefono_principal as telefono
    FROM public.creditos c
    JOIN public.clientes_completo cl ON c.cliente_id = cl.id
    JOIN public.garantias g ON c.garantia_id = g.id
    WHERE
        c.estado IN ('vigente', 'vencido')
        AND c.fecha_vencimiento BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE + p_days
    ORDER BY c.fecha_vencimiento ASC
    LIMIT 20;
END;
$$;

-- ============================================================================
-- PASO 7: RPC Helper para crear/obtener persona
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_or_create_persona(
    p_tipo_documento VARCHAR,
    p_numero_documento VARCHAR,
    p_nombres VARCHAR,
    p_apellido_paterno VARCHAR,
    p_apellido_materno VARCHAR,
    p_telefono VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_direccion TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Intentar encontrar persona existente
    SELECT id INTO v_persona_id
    FROM public.personas
    WHERE numero_documento = p_numero_documento;
    
    -- Si no existe, crearla
    IF v_persona_id IS NULL THEN
        INSERT INTO public.personas (
            tipo_documento,
            numero_documento,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono_principal,
            email,
            direccion
        ) VALUES (
            p_tipo_documento,
            p_numero_documento,
            p_nombres,
            p_apellido_paterno,
            p_apellido_materno,
            p_telefono,
            p_email,
            p_direccion
        ) RETURNING id INTO v_persona_id;
    END IF;
    
    RETURN v_persona_id;
END;
$$;

-- ============================================================================
-- COMENTARIOS FINALES
-- ============================================================================
COMMENT ON TABLE public.personas IS 'Tabla maestra de personas físicas o jurídicas. Centraliza datos de identificación.';
COMMENT ON TABLE public.empleados IS 'Empleados de la empresa. Referencia a personas y auth.users.';
COMMENT ON VIEW public.clientes_completo IS 'Vista desnormalizada de clientes con datos de persona. Usar en consultas.';
COMMENT ON VIEW public.empleados_completo IS 'Vista desnormalizada de empleados con datos de persona.';
