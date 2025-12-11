-- ==========================================
-- 1. BUCKET: EVIDENCIAS (NUEVO)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidencias', 'evidencias', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies for evidencias
DROP POLICY IF EXISTS "Authenticated users can upload evidences" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view evidences" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own evidences" ON storage.objects;

-- Create policies for evidencias
CREATE POLICY "Authenticated users can upload evidences" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'evidencias');

CREATE POLICY "Authenticated users can view evidences" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'evidencias');

CREATE POLICY "Users can delete own evidences" 
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidencias' AND auth.uid() = owner);


-- ==========================================
-- 2. BUCKET: GARANTIAS (FIX RESTRICTIONS)
-- ==========================================
-- Drop restrictive policies if they exist (using dynamic names from error logs)
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir fotos de garantías" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir fotos de garantías fixed" ON storage.objects;
DROP POLICY IF EXISTS "Público puede ver fotos de garantías" ON storage.objects;
DROP POLICY IF EXISTS "Público puede ver fotos de garantías fixed" ON storage.objects;

-- Re-create simple, permissive policies for garantias
CREATE POLICY "Authenticated users can upload garantias"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'garantias');

CREATE POLICY "Public can view garantias"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'garantias');

