-- ============================================================================
-- Migration: Add Default Interest Rate to Companies
-- Date: 2025-12-23
-- Description: Adds tasa_interes_default column to empresas table
--              Allows each tenant to configure their default interest rate
-- ============================================================================

-- Add the column with default value of 20%
ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS tasa_interes_default NUMERIC(5,2) DEFAULT 20.00;

-- Add documentation
COMMENT ON COLUMN public.empresas.tasa_interes_default IS 
'Default interest rate for new credits in this company. Value is percentage (e.g., 20.00 = 20%). Can be overridden per-credit.';

-- Update existing companies to have the default rate
UPDATE public.empresas
SET tasa_interes_default = 20.00
WHERE tasa_interes_default IS NULL;

-- ============================================================================
-- End of migration
-- ============================================================================
