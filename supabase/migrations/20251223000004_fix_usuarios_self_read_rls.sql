-- Migración: Corregir RLS de usuarios para permitir lectura del propio registro
-- Fecha: 2025-12-23
-- Descripción: El problema es que get_user_empresa() puede devolver NULL y la comparación
--              NULL = NULL siempre es FALSE en SQL. Esto causa que usuarios sin empresa_id
--              asignado no puedan ni siquiera leer su propio registro.

-- ============================================================================
-- 1. CORREGIR POLÍTICA DE USUARIOS PARA PERMITIR LECTURA DEL PROPIO REGISTRO
-- ============================================================================

-- Eliminar política actual
DROP POLICY IF EXISTS "tenant_select_usuarios" ON public.usuarios;

-- Crear política corregida:
-- Un usuario SIEMPRE puede leer su propio registro (por auth.uid())
-- O puede leer usuarios de su misma empresa
CREATE POLICY "tenant_select_usuarios" ON public.usuarios
FOR SELECT USING (
    id = auth.uid()  -- Siempre puedo leer mi propio registro
    OR empresa_id = get_user_empresa()  -- O del mismo tenant
);

-- Nota: El orden importa para optimización, ponemos id = auth.uid() primero
-- porque es la condición más común y rápida de evaluar.

COMMENT ON POLICY "tenant_select_usuarios" ON public.usuarios IS 
'Usuarios pueden leer su propio registro siempre, y registros de usuarios del mismo tenant.';
