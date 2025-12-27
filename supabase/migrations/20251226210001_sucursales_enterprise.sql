-- ============================================================
-- Migration: Enterprise Sucursales Fields
-- Descripción: Añade campos enterprise para gestión profesional de sucursales
-- ============================================================

-- 1. Tipo de sucursal (principal, secundaria, express)
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS tipo_sucursal VARCHAR(20) DEFAULT 'secundaria';

-- 2. Referencia de ubicación
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS referencia TEXT;

-- 3. Horarios de operación
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS horario_apertura TIME DEFAULT '09:00';

ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS horario_cierre TIME DEFAULT '19:00';

-- 4. Días de operación (array de códigos: L,M,X,J,V,S,D)
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS dias_operacion TEXT[] DEFAULT ARRAY['L','M','X','J','V','S'];

-- 5. Administrador responsable
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS administrador_id UUID REFERENCES empleados(id);

-- 6. Flag para auto-crear caja al crear sucursal
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS auto_crear_caja BOOLEAN DEFAULT true;

-- 7. Email y teléfono secundario de la sucursal
ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS email VARCHAR(100);

ALTER TABLE public.sucursales 
ADD COLUMN IF NOT EXISTS telefono_secundario VARCHAR(20);

-- 8. Comentarios para documentación
COMMENT ON COLUMN public.sucursales.tipo_sucursal IS 'principal | secundaria | express';
COMMENT ON COLUMN public.sucursales.referencia IS 'Punto de referencia para ubicar la sucursal';
COMMENT ON COLUMN public.sucursales.horario_apertura IS 'Hora de apertura (HH:MM)';
COMMENT ON COLUMN public.sucursales.horario_cierre IS 'Hora de cierre (HH:MM)';
COMMENT ON COLUMN public.sucursales.dias_operacion IS 'Array de días: L,M,X,J,V,S,D';
COMMENT ON COLUMN public.sucursales.administrador_id IS 'Empleado responsable de la sucursal';
COMMENT ON COLUMN public.sucursales.auto_crear_caja IS 'Crear caja operativa automáticamente';

-- 9. Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_sucursales_tipo ON public.sucursales(tipo_sucursal);
CREATE INDEX IF NOT EXISTS idx_sucursales_admin ON public.sucursales(administrador_id);

-- 10. Actualizar sucursal principal existente
UPDATE public.sucursales 
SET tipo_sucursal = 'principal' 
WHERE nombre ILIKE '%principal%' AND tipo_sucursal = 'secundaria';
