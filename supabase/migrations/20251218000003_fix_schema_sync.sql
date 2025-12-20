-- Migración: Sincronizar schema con código
-- Fecha: 2025-12-18
-- Descripción: 
--   1. Agregar parentesco_referencia a personas
--   2. Actualizar vista clientes_completo

-- 1. Agregar columna faltante a personas
ALTER TABLE public.personas
ADD COLUMN IF NOT EXISTS parentesco_referencia VARCHAR(50);

COMMENT ON COLUMN public.personas.parentesco_referencia IS 'Parentesco del contacto de referencia: Esposa, Padre, Hermano, etc.';

-- 2. Recrear vista clientes_completo con la nueva columna
DROP VIEW IF EXISTS public.clientes_completo;

CREATE VIEW public.clientes_completo AS
SELECT 
    c.id,
    c.persona_id,
    c.empresa_id,
    c.score_crediticio,
    c.activo,
    c.created_at,
    p.tipo_documento,
    p.numero_documento,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    CONCAT(p.nombres, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) AS nombre_completo,
    p.email,
    p.telefono_principal,
    p.telefono_secundario,
    p.parentesco_referencia,
    p.direccion
FROM public.clientes c
JOIN public.personas p ON c.persona_id = p.id;

COMMENT ON VIEW public.clientes_completo IS 'Vista desnormalizada de clientes con datos de persona. Incluye datos de referencia.';

-- 3. Grant permisos
GRANT SELECT ON public.clientes_completo TO anon, authenticated, service_role;
