-- ============================================================================
-- MIGRACIÓN: Contacto de Emergencia y Estados Granulares para Empleados
-- ============================================================================
-- Implementa modelo KYE (Know Your Employee) simplificado para casa de empeño.
-- Fecha: 16 Diciembre 2025
-- ============================================================================

-- 1. Agregar columnas de Contacto de Emergencia a empleados
ALTER TABLE public.empleados 
  ADD COLUMN IF NOT EXISTS nombre_contacto_emergencia VARCHAR(100),
  ADD COLUMN IF NOT EXISTS parentesco_emergencia VARCHAR(50),
  ADD COLUMN IF NOT EXISTS telefono_emergencia VARCHAR(20);

-- 2. Agregar columna de Estado granular (reemplaza 'activo' booleano)
ALTER TABLE public.empleados 
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'ACTIVO';

-- 3. Agregar columna para motivo del estado (cuando no es ACTIVO)
ALTER TABLE public.empleados 
  ADD COLUMN IF NOT EXISTS motivo_estado TEXT;

-- 4. Migrar datos existentes: si activo=false, poner estado='BAJA'
UPDATE public.empleados 
SET estado = CASE 
  WHEN activo = false THEN 'BAJA'
  ELSE 'ACTIVO'
END
WHERE estado IS NULL OR estado = '';

-- 5. Agregar constraint para valores válidos de estado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'empleados_estado_check'
  ) THEN
    ALTER TABLE public.empleados 
      ADD CONSTRAINT empleados_estado_check 
      CHECK (estado IN ('ACTIVO', 'LICENCIA', 'SUSPENDIDO', 'BAJA'));
  END IF;
END $$;

-- 6. Actualizar vista empleados_completo para incluir nuevos campos
CREATE OR REPLACE VIEW public.empleados_completo AS
SELECT 
    e.id,
    e.persona_id,
    e.user_id,
    e.cargo,
    e.sucursal_id,
    e.activo,
    e.estado,
    e.motivo_estado,
    e.fecha_ingreso,
    e.fecha_salida,
    e.nombre_contacto_emergencia,
    e.parentesco_emergencia,
    e.telefono_emergencia,
    e.created_at,
    p.tipo_documento,
    p.numero_documento,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    (p.nombres || ' ' || p.apellido_paterno || ' ' || p.apellido_materno) AS nombre_completo,
    p.email,
    p.telefono_principal,
    p.telefono_secundario,
    p.direccion
FROM public.empleados e
JOIN public.personas p ON e.persona_id = p.id;

-- 7. Comentarios de documentación
COMMENT ON COLUMN public.empleados.estado IS 'Estado del empleado: ACTIVO, LICENCIA, SUSPENDIDO, BAJA';
COMMENT ON COLUMN public.empleados.motivo_estado IS 'Razón del estado cuando no es ACTIVO (ej: Licencia médica, Suspensión por faltante)';
COMMENT ON COLUMN public.empleados.nombre_contacto_emergencia IS 'Nombre completo del contacto de emergencia';
COMMENT ON COLUMN public.empleados.parentesco_emergencia IS 'Relación con el empleado: Esposa, Padre, Hermano, etc.';
COMMENT ON COLUMN public.empleados.telefono_emergencia IS 'Teléfono del contacto de emergencia';

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
