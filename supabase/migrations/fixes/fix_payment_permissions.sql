-- Allow authenticated users to manage treasury tables
-- (Assuming tenant isolation is handled by policy definitions using get_empresa_id() or similar, 
-- or temporary permissive policy for specific tables if they lack one)

-- 1. Cuentas Financieras
ALTER TABLE "public"."cuentas_financieras" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON "public"."cuentas_financieras"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true); -- Ideally: empresa_id = auth_empresa_id()

CREATE POLICY "Enable update access for authenticated users" ON "public"."cuentas_financieras"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Transacciones Capital
ALTER TABLE "public"."transacciones_capital" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert access for authenticated users" ON "public"."transacciones_capital"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Cronograma Pagos Fondeo (ensure update is allowed)
ALTER TABLE "public"."cronograma_pagos_fondeo" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable update for authenticated users" ON "public"."cronograma_pagos_fondeo"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant privileges just in case
GRANT ALL ON TABLE "public"."cuentas_financieras" TO "authenticated";
GRANT ALL ON TABLE "public"."transacciones_capital" TO "authenticated";
GRANT ALL ON TABLE "public"."cronograma_pagos_fondeo" TO "authenticated";
GRANT ALL ON TABLE "public"."contratos_fondeo" TO "authenticated"; -- For updating state if needed
