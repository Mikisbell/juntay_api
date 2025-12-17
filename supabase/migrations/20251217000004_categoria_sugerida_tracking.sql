-- Migración: Sistema de tracking de categorías "Otro" inteligente
-- Fecha: 2025-12-17
-- Descripción: Registra cuando usuarios usan "Otro" para detectar nuevas categorías

-- 1. Tabla de tracking
CREATE TABLE IF NOT EXISTS public.categoria_sugerida (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('categoria', 'subcategoria', 'marca')),
    texto_ingresado VARCHAR(200) NOT NULL,
    texto_normalizado VARCHAR(200) NOT NULL,
    veces_usado INT DEFAULT 1,
    ultimo_uso TIMESTAMPTZ DEFAULT NOW(),
    promovido_a VARCHAR(100) DEFAULT NULL,
    promovido_en TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tipo, texto_normalizado)
);

-- 2. Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_categoria_sugerida_ranking 
ON public.categoria_sugerida(tipo, veces_usado DESC);

-- 3. Función upsert para registrar uso
CREATE OR REPLACE FUNCTION public.registrar_categoria_otro(
    p_tipo VARCHAR,
    p_texto VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_normalizado VARCHAR;
BEGIN
    -- Normalizar texto: lowercase, trim, quitar acentos básicos
    v_normalizado := lower(trim(p_texto));
    
    INSERT INTO public.categoria_sugerida (tipo, texto_ingresado, texto_normalizado)
    VALUES (p_tipo, p_texto, v_normalizado)
    ON CONFLICT (tipo, texto_normalizado) DO UPDATE SET
        veces_usado = public.categoria_sugerida.veces_usado + 1,
        ultimo_uso = NOW(),
        -- Guardar el texto original más reciente (puede tener mejor formato)
        texto_ingresado = CASE 
            WHEN length(EXCLUDED.texto_ingresado) > length(public.categoria_sugerida.texto_ingresado) 
            THEN EXCLUDED.texto_ingresado
            ELSE public.categoria_sugerida.texto_ingresado
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Vista para dashboard admin
CREATE OR REPLACE VIEW public.categorias_pendientes_promocion AS
SELECT 
    id,
    tipo,
    texto_ingresado,
    veces_usado,
    ultimo_uso,
    created_at,
    CASE 
        WHEN veces_usado >= 10 THEN 'URGENTE'
        WHEN veces_usado >= 5 THEN 'REVISAR'
        ELSE 'MONITOREAR'
    END as prioridad,
    CASE 
        WHEN veces_usado >= 10 THEN 1
        WHEN veces_usado >= 5 THEN 2
        ELSE 3
    END as prioridad_orden
FROM public.categoria_sugerida
WHERE promovido_a IS NULL
ORDER BY prioridad_orden, veces_usado DESC;

-- 5. Función para promocionar una categoría sugerida
CREATE OR REPLACE FUNCTION public.promover_categoria_sugerida(
    p_id INT,
    p_promovido_a VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.categoria_sugerida
    SET promovido_a = p_promovido_a,
        promovido_en = NOW()
    WHERE id = p_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON TABLE public.categoria_sugerida IS 'Tracking de categorías personalizadas para detectar nuevas subcategorías frecuentes';
COMMENT ON VIEW public.categorias_pendientes_promocion IS 'Dashboard de categorías pendientes de promoción';
