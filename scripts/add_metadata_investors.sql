
-- Add metadata column to inversionistas if it doesn't exist
ALTER TABLE inversionistas ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
-- Also ensure fecha_ingreso is nullable if legal/business logic permits "undetermined start" (though unlikely, user asked for "libre")
-- ALTER TABLE inversionistas ALTER COLUMN fecha_ingreso DROP NOT NULL;
