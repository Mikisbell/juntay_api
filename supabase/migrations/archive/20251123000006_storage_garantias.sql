-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                   JUNTAY - MIGRACIÓN STORAGE GARANTÍAS                      ║
-- ║                      BUCKET PARA FOTOS DE BIENES                           ║
-- ║                                                                            ║
-- ║  Crear bucket público 'garantias' para almacenamiento de imágenes          ║
-- ║  de los bienes en empeño. Incluye policies para seguridad.                ║
-- ║                                                                            ║
-- ║  Fecha: 23 Noviembre 2025                                                  ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

-- ============================================================================
-- FASE 1: CREAR BUCKET DE GARANTÍAS
-- ============================================================================

-- Crear bucket público para fotos de garantías
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'garantias',
    'garantias',
    true,  -- Público para que las URLs funcionen sin autenticación
    5242880,  -- 5MB máximo por archivo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']  -- Solo imágenes
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FASE 2: POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================================

-- POLÍTICA 1: Usuarios autenticados pueden SUBIR fotos
CREATE POLICY "Usuarios autenticados pueden subir fotos de garantías"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'garantias' AND
    (storage.foldername(name))[1] = 'garantias'  -- Validar que esté en carpeta correcta
);

-- POLÍTICA 2: Público puede VER fotos (necesario para mostrar en UI)
CREATE POLICY "Público puede ver fotos de garantías"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'garantias');

-- POLÍTICA 3: Solo dueño o admin puede ELIMINAR fotos
CREATE POLICY "Solo propietario o admin puede eliminar fotos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'garantias' AND (
        auth.uid() = owner OR
        EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'gerente'))
    )
);

-- ============================================================================
-- FASE 3: COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

-- Comentarios eliminados para evitar error de permisos en local

-- ============================================================================
-- FIN DE MIGRACIÓN STORAGE GARANTÍAS
-- ============================================================================
-- Bucket listo para almacenar hasta 5MB por imagen
-- Formatos permitidos: JPEG, PNG, WebP
-- Acceso público de lectura, escritura autenticada
