-- Add metadata column to inversionistas for flexible contract terms
-- Idempotent check to avoid errors if re-run

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'inversionistas'
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE inversionistas ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
