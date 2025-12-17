-- Migración: Tabla maestra de tipos de parentesco
-- Fecha: 2025-12-17
-- Descripción: Normaliza los tipos de parentesco para reportes y consultas

-- 1. Crear tabla maestra
CREATE TABLE IF NOT EXISTS public.tipos_parentesco (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    orden INT DEFAULT 99,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insertar valores iniciales
INSERT INTO public.tipos_parentesco (nombre, orden) VALUES
    ('Esposa/o', 1),
    ('Padre', 2),
    ('Madre', 3),
    ('Hermano/a', 4),
    ('Hijo/a', 5),
    ('Abuelo/a', 6),
    ('Tío/a', 7),
    ('Primo/a', 8),
    ('Amigo/a', 9),
    ('Vecino/a', 10),
    ('Otro', 99)
ON CONFLICT (nombre) DO NOTHING;

-- 3. Crear vista para lookup rápido
CREATE OR REPLACE VIEW public.parentesco_opciones AS
SELECT id, nombre, orden
FROM public.tipos_parentesco
WHERE activo = TRUE
ORDER BY orden;

-- 4. Agregar FK a clientes (sin destruir datos existentes)
-- Primero agregamos la columna tipo_parentesco_id si no existe
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS tipo_parentesco_id INT;

-- 5. Agregar columna para "Otro" personalizado
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS parentesco_otro VARCHAR(100);

-- Nota: NO agregamos FK estricta todavía para no romper datos existentes.
-- En producción: migrar datos existentes y luego agregar:
-- ALTER TABLE public.clientes ADD CONSTRAINT fk_clientes_parentesco 
--     FOREIGN KEY (tipo_parentesco_id) REFERENCES public.tipos_parentesco(id);

COMMENT ON TABLE public.tipos_parentesco IS 'Catálogo de tipos de parentesco para contactos de referencia';
COMMENT ON COLUMN public.clientes.tipo_parentesco_id IS 'FK a tipos_parentesco (normalizado)';
COMMENT ON COLUMN public.clientes.parentesco_otro IS 'Texto libre cuando tipo_parentesco = Otro';
