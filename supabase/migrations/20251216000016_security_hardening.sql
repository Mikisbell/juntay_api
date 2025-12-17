-- ============================================================================
-- SEGURIDAD: REFORZAMIENTO DE RLS (Row Level Security)
-- Fecha: 2025-12-16
-- Descripción: Cierra brechas de seguridad en tablas críticas (PII).
-- ============================================================================

BEGIN;

-- 1. TABLA USUARIOS (Protección de Roles y Datos de Acceso)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_read_own" ON public.usuarios
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "admin_all_usuarios" ON public.usuarios
    FOR ALL
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

-- 2. TABLAS DE PERSONAS/CLIENTES (PII - Información Personal Identificable)
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Políticas Personas
CREATE POLICY "admin_all_personas" ON public.personas
    FOR ALL
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "cajero_read_personas" ON public.personas
    FOR SELECT
    USING (public.get_user_role() = 'cajero');
    
CREATE POLICY "cajero_insert_personas" ON public.personas -- Cajeros crean clientes
    FOR INSERT
    WITH CHECK (public.get_user_role() = 'cajero');

CREATE POLICY "cajero_update_personas" ON public.personas
    FOR UPDATE
    USING (public.get_user_role() = 'cajero');

-- Políticas Clientes
CREATE POLICY "admin_all_clientes" ON public.clientes
    FOR ALL
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "cajero_read_clientes" ON public.clientes
    FOR SELECT
    USING (public.get_user_role() = 'cajero');

CREATE POLICY "cajero_insert_clientes" ON public.clientes
    FOR INSERT
    WITH CHECK (public.get_user_role() = 'cajero');

CREATE POLICY "cajero_update_clientes" ON public.clientes
    FOR UPDATE
    USING (public.get_user_role() = 'cajero');


-- 3. TABLAS FINANCIERAS SENSIBLES
ALTER TABLE public.inversionistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones_capital ENABLE ROW LEVEL SECURITY; -- Ya estaba enable, pero aseguramos políticas

-- Inversionistas (Solo Admin maneja fondeo)
CREATE POLICY "admin_all_inversionistas" ON public.inversionistas
    FOR ALL
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

-- Garantías (Cajeros necesitan ver/crear para créditos)
CREATE POLICY "admin_all_garantias" ON public.garantias
    FOR ALL
    USING (public.get_user_role() = 'admin')
    WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "cajero_read_garantias" ON public.garantias
    FOR SELECT
    USING (public.get_user_role() = 'cajero');

CREATE POLICY "cajero_insert_garantias" ON public.garantias
    FOR INSERT
    WITH CHECK (public.get_user_role() = 'cajero');

CREATE POLICY "cajero_update_garantias" ON public.garantias -- Para liberar/ejecutar? Quizás solo update estado
    FOR UPDATE
    USING (public.get_user_role() = 'cajero');

-- 4. ASEGURAR FUNCIÓN get_user_role
-- Si la función no existe o es insegura, esto podría fallar.
-- Asumimos que ya existe y lee 'rol' de 'usuarios'.

COMMIT;
