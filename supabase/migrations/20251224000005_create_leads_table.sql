-- Create Leads table for B2C Landing Page
CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "mensaje" TEXT,
    "monto_interes" NUMERIC(12, 2),
    "articulo_interes" TEXT,
    "estado" TEXT DEFAULT 'NUEVO', -- NUEVO, CONTACTADO, DESCARTADO, CONVERTIDO
    "empresa_id" UUID REFERENCES "public"."empresas"("id"),
    "metadata" JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;

-- Policy: Anon can INSERT (Public Form)
CREATE POLICY "Anon can insert leads" 
ON "public"."leads" 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy: Only Admins can VIEW leads (Multi-tenant)
CREATE POLICY "Admins can view own leads" 
ON "public"."leads" 
FOR SELECT 
TO authenticated 
USING (
    empresa_id = (SELECT empresa_id FROM public.usuarios WHERE id = auth.uid())
    OR 
    auth.uid() IN (SELECT id FROM public.usuarios WHERE rol = 'SUPER_ADMIN')
);

-- Grant permissions
GRANT INSERT ON "public"."leads" TO anon, authenticated;
GRANT SELECT, UPDATE ON "public"."leads" TO authenticated;
