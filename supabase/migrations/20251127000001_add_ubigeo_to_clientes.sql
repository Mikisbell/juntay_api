-- Add UBIGEO fields to clientes table
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS ubigeo_cod VARCHAR(6),
ADD COLUMN IF NOT EXISTS departamento VARCHAR(50),
ADD COLUMN IF NOT EXISTS provincia VARCHAR(50),
ADD COLUMN IF NOT EXISTS distrito VARCHAR(50);

COMMENT ON COLUMN public.clientes.ubigeo_cod IS 'Código de 6 dígitos del distrito (INEI)';
