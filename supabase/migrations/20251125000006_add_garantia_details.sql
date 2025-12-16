-- Add detailed columns to garantias table
ALTER TABLE public.garantias
ADD COLUMN IF NOT EXISTS marca varchar(100),
ADD COLUMN IF NOT EXISTS modelo varchar(100),
ADD COLUMN IF NOT EXISTS serie varchar(100),
ADD COLUMN IF NOT EXISTS subcategoria varchar(100),
ADD COLUMN IF NOT EXISTS estado_bien varchar(50),

-- Vehículos
ADD COLUMN IF NOT EXISTS anio integer,
ADD COLUMN IF NOT EXISTS placa varchar(20),
ADD COLUMN IF NOT EXISTS kilometraje numeric(10,2),

-- Inmuebles
ADD COLUMN IF NOT EXISTS area numeric(10,2),
ADD COLUMN IF NOT EXISTS ubicacion text,
ADD COLUMN IF NOT EXISTS partida_registral varchar(50),

-- Joyas
ADD COLUMN IF NOT EXISTS peso numeric(10,2),
ADD COLUMN IF NOT EXISTS quilataje varchar(20);

COMMENT ON COLUMN public.garantias.estado_bien IS 'Estado físico: NUEVO, EXCELENTE, BUENO, REGULAR, MALO';
COMMENT ON COLUMN public.garantias.subcategoria IS 'Subcategoría específica del bien (ej: Laptop Gamer, Sedan, Anillo)';
