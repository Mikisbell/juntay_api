-- Agrega la columna metadata a la tabla clientes si no existe
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Comentario para documentación
COMMENT ON COLUMN public.clientes.metadata IS 'Datos adicionales del cliente (RUC, Ubigeo, etc)';
