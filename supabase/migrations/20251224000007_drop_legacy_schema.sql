-- Drop Legacy Tables for "Cajas Operativas"
-- These have been replaced by "Cuentas Financieras" (Tesoreria Module)

-- Drop dependent table first
DROP TABLE IF EXISTS "public"."movimientos_caja_operativa" CASCADE;

-- Drop main table
DROP TABLE IF EXISTS "public"."cajas_operativas" CASCADE;

-- Optional: Drop associated RPCs/Functions if known (best effort)
DROP FUNCTION IF EXISTS "public"."admin_asignar_caja";
DROP FUNCTION IF EXISTS "public"."cerrar_caja_oficial";

-- Optional: Clean up audit logs that might reference these tables (or keep for history)
-- We keep history.
