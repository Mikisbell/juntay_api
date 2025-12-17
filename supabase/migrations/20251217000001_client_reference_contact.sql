-- Migración: Agregar campos de referencia familiar a clientes
-- Fecha: 2025-12-17
-- Descripción: Agrega telefono_secundario (ya existente en código) y parentesco_referencia

ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS telefono_secundario VARCHAR(20),
ADD COLUMN IF NOT EXISTS parentesco_referencia VARCHAR(50);

COMMENT ON COLUMN public.clientes.telefono_secundario IS 'Teléfono de referencia/emergencia (familiar)';
COMMENT ON COLUMN public.clientes.parentesco_referencia IS 'Parentesco del contacto de referencia: Esposa, Padre, Hermano, etc.';
