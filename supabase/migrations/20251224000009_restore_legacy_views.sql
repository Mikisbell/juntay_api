-- ============================================================================
-- Migration: Restore Legacy Tables for useDashboardData Compatibility
-- 
-- The 20251224000007_drop_legacy_schema.sql migration dropped these tables,
-- but the frontend (useDashboardData.ts) still depends on them.
-- This migration recreates the original tables.
-- ============================================================================

-- 1. RESTORE cajas_operativas TABLE
CREATE TABLE IF NOT EXISTS "public"."cajas_operativas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "usuario_id" "uuid" NOT NULL,
    "boveda_origen_id" "uuid",
    "numero_caja" integer NOT NULL,
    "estado" character varying(20) DEFAULT 'cerrada'::character varying NOT NULL,
    "saldo_inicial" numeric(15,2) DEFAULT 0,
    "saldo_actual" numeric(15,2) DEFAULT 0,
    "saldo_final_cierre" numeric(15,2),
    "diferencia_cierre" numeric(15,2),
    "fecha_apertura" timestamp with time zone DEFAULT "now"(),
    "fecha_cierre" timestamp with time zone,
    "observaciones_cierre" "text",
    "_deleted" boolean DEFAULT false NOT NULL,
    "_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "empresa_id" "uuid" -- Added for multi-tenant support
);

COMMENT ON TABLE "public"."cajas_operativas" IS 'Sesiones de trabajo de cajeros. Ciclo: abierta -> operando -> cerrada.';

-- 2. RESTORE movimientos_caja_operativa TABLE
CREATE TABLE IF NOT EXISTS "public"."movimientos_caja_operativa" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL PRIMARY KEY,
    "caja_operativa_id" "uuid" NOT NULL,
    "tipo" character varying(50) NOT NULL,
    "motivo" character varying(50) NOT NULL,
    "monto" numeric(15,2) NOT NULL,
    "saldo_anterior" numeric(15,2) NOT NULL,
    "saldo_nuevo" numeric(15,2) NOT NULL,
    "referencia_id" "uuid",
    "descripcion" "text",
    "metadata" "jsonb" DEFAULT '{}'::jsonb,
    "usuario_id" "uuid" NOT NULL,
    "fecha" timestamp with time zone DEFAULT "now"(),
    "caja_id" "uuid",
    "anulado" boolean DEFAULT false,
    "motivo_anulacion" "text",
    "anulado_por" "uuid",
    "anulado_at" timestamp with time zone,
    "movimiento_reversion_id" "uuid",
    "es_reversion" boolean DEFAULT false,
    "movimiento_original_id" "uuid",
    "_deleted" boolean DEFAULT false NOT NULL,
    "_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_monto_positivo" CHECK (("monto" > (0)::numeric))
);

COMMENT ON TABLE "public"."movimientos_caja_operativa" IS 'APPEND-ONLY: Ledger inmutable. Cada centavo que circule.';

-- 3. ADD FOREIGN KEY CONSTRAINTS
ALTER TABLE "public"."movimientos_caja_operativa" 
    ADD CONSTRAINT "fk_movimientos_caja" 
    FOREIGN KEY ("caja_operativa_id") REFERENCES "public"."cajas_operativas"("id");

-- 4. ENABLE RLS AND GRANT PERMISSIONS
ALTER TABLE "public"."cajas_operativas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."movimientos_caja_operativa" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "tenant_cajas" ON "public"."cajas_operativas";
DROP POLICY IF EXISTS "tenant_movimientos" ON "public"."movimientos_caja_operativa";

-- Create tenant isolation policies
CREATE POLICY "tenant_cajas" ON "public"."cajas_operativas"
    FOR ALL USING (
        usuario_id = auth.uid() 
        OR empresa_id IN (SELECT empresa_id FROM public.usuarios WHERE id = auth.uid())
    );

CREATE POLICY "tenant_movimientos" ON "public"."movimientos_caja_operativa"
    FOR ALL USING (
        usuario_id = auth.uid()
        OR caja_operativa_id IN (SELECT id FROM public.cajas_operativas WHERE usuario_id = auth.uid())
    );

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON "public"."cajas_operativas" TO authenticated;
GRANT SELECT, INSERT ON "public"."movimientos_caja_operativa" TO authenticated;

-- 5. RECREATE VIEW (used by some reports)
CREATE OR REPLACE VIEW "public"."movimientos_efectivos" AS
 SELECT "id",
    "caja_operativa_id",
    "tipo",
    "motivo",
    "monto",
    "saldo_anterior",
    "saldo_nuevo",
    "referencia_id",
    "descripcion",
    "metadata",
    "usuario_id",
    "fecha",
    "caja_id",
    "anulado",
    "motivo_anulacion",
    "anulado_por",
    "anulado_at",
    "movimiento_reversion_id",
    "es_reversion",
    "movimiento_original_id",
        CASE
            WHEN "anulado" THEN (0)::numeric
            ELSE
            CASE "tipo"
                WHEN 'INGRESO'::"text" THEN "monto"
                ELSE (- "monto")
            END
        END AS "efecto_neto"
   FROM "public"."movimientos_caja_operativa" "m"
  ORDER BY "fecha" DESC;

GRANT SELECT ON "public"."movimientos_efectivos" TO authenticated;
