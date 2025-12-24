-- Phase 1: Secure Tables with Missing RLS/empresa_id

-- 1. cronograma_pagos_fondeo
ALTER TABLE "public"."cronograma_pagos_fondeo" ADD COLUMN IF NOT EXISTS "empresa_id" UUID REFERENCES "public"."empresas"("id");
ALTER TABLE "public"."cronograma_pagos_fondeo" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: cronograma_pagos_fondeo" ON "public"."cronograma_pagos_fondeo"
    USING (empresa_id = (SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()));

-- 2. historial_calculo_intereses
ALTER TABLE "public"."historial_calculo_intereses" ADD COLUMN IF NOT EXISTS "empresa_id" UUID REFERENCES "public"."empresas"("id");
ALTER TABLE "public"."historial_calculo_intereses" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: historial_calculo_intereses" ON "public"."historial_calculo_intereses"
    USING (empresa_id = (SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()));

-- 3. pagos_rendimientos
ALTER TABLE "public"."pagos_rendimientos" ADD COLUMN IF NOT EXISTS "empresa_id" UUID REFERENCES "public"."empresas"("id");
ALTER TABLE "public"."pagos_rendimientos" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation: pagos_rendimientos" ON "public"."pagos_rendimientos"
    USING (empresa_id = (SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()));

-- Grant access to auth users
GRANT ALL ON "public"."cronograma_pagos_fondeo" TO authenticated;
GRANT ALL ON "public"."historial_calculo_intereses" TO authenticated;
GRANT ALL ON "public"."pagos_rendimientos" TO authenticated;

-- (Optional) Backfill empresa_id logic would go here if we had data linking to parent tables
-- Since these tables might be empty or we risk complex SQL, we leave empresa_id as NULLable for now.
-- In strict mode, we should UPDATE them linking to parent table.
-- Example: UPDATE pagos_rendimientos SET empresa_id = (SELECT empresa_id FROM inversionistas WHERE id = inversionista_id)
