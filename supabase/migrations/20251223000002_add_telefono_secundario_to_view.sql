-- Migration: Add telefono_secundario to clientes_completo view
-- Issue: clientes-actions.ts requests this column but view doesn't include it

-- Must DROP first because column order is changing (PostgreSQL restriction)
DROP VIEW IF EXISTS clientes_completo CASCADE;

-- Recreate view with telefono_secundario from parties_completo
CREATE VIEW clientes_completo AS
SELECT 
    c.id,
    c.party_id,
    c.empresa_id,
    c.score_crediticio,
    c.activo,
    c.created_at,
    pc.tax_id_type AS tipo_documento,
    pc.tax_id AS numero_documento,
    pc.nombre_completo,
    pc.nombres,
    pc.apellido_paterno,
    pc.apellido_materno,
    pc.razon_social,
    pc.email,
    pc.telefono_principal,
    pc.telefono_secundario, -- ADDED: Missing column that clientes-actions.ts expects
    pc.direccion,
    pc.party_type
FROM clientes c
JOIN parties_completo pc ON c.party_id = pc.id;

-- Add comment for documentation
COMMENT ON VIEW clientes_completo IS 'Vista completa de clientes incluyendo datos de party. Actualizada para incluir telefono_secundario.';
