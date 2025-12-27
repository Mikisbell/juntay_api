-- ============================================================================
-- MIGRATION: Super Admin Foundation
-- FECHA: 2025-12-26
-- DESCRIPCIÓN: Crea el rol 'super_admin', función is_super_admin() y políticas RLS.
-- ============================================================================

-- 1. Crear Rol Super Admin (Nivel 1000 - "Modo Dios")
INSERT INTO public.roles (nombre, descripcion, nivel_acceso)
VALUES ('super_admin', 'Administrador Global del Sistema (SaaS Owner)', 1000)
ON CONFLICT (nombre) DO NOTHING;

-- 2. Función Helper Segura (SECURITY DEFINER)
-- Retorna true si el usuario actual tiene el rol 'super_admin'
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rol_nombre VARCHAR;
BEGIN
    SELECT r.nombre INTO v_rol_nombre
    FROM public.usuarios u
    JOIN public.roles r ON u.rol_id = r.id
    WHERE u.id = auth.uid();
    
    RETURN v_rol_nombre = 'super_admin';
END;
$$;

COMMENT ON FUNCTION public.is_super_admin IS 'Verifica si el usuario autenticado es un Super Admin.';

-- 3. Actualizar RLS en Tabla EMPRESAS
-- Permitir que super_admin vea TODAS las empresas
DROP POLICY IF EXISTS "super_admin_select_all_empresas" ON public.empresas;
CREATE POLICY "super_admin_select_all_empresas"
    ON public.empresas
    FOR SELECT
    TO authenticated
    USING (
        -- Política original: Mi propia empresa
        id = get_user_empresa() 
        OR 
        -- Nueva puerta trasera: Soy Super Admin
        is_super_admin()
    );

DROP POLICY IF EXISTS "super_admin_update_all_empresas" ON public.empresas;
CREATE POLICY "super_admin_update_all_empresas"
    ON public.empresas
    FOR UPDATE
    TO authenticated
    USING (is_super_admin()) -- Solo super admin puede editar otras empresas (O el admin propio, si mantenemos la original)
    WITH CHECK (is_super_admin());

-- Nota: Para UPDATE, es mejor tener políticas separadas si la lógica es compleja.
-- La política original "Users can update own company" probablemente use get_user_empresa().
-- Vamos a añadir una política ADICIONAL para super admin, en lugar de modificar la existente para evitar conflictos.

CREATE POLICY "super_admin_full_access_empresas"
    ON public.empresas
    FOR ALL
    TO authenticated
    USING (is_super_admin());

-- 4. Actualizar RLS en Tabla USUARIOS
-- Permitir ver todos los usuarios para soporte
CREATE POLICY "super_admin_select_all_usuarios"
    ON public.usuarios
    FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- 5. Actualizar RLS en Tabla FACTURAS
-- Para ver historial de facturación global
CREATE POLICY "super_admin_select_all_facturas"
    ON public.facturas
    FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- 6. Actualizar RLS en Tabla SUSCRIPCIONES
CREATE POLICY "super_admin_select_all_suscripciones"
    ON public.suscripciones
    FOR SELECT
    TO authenticated
    USING (is_super_admin());
