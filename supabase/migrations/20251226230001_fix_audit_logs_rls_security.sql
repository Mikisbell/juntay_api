-- =====================================================
-- FIX: RLS POLICIES FOR AUDIT_LOGS (Append-Only)
-- Security fix: audit logs should never be deletable
-- =====================================================

-- Drop the existing policy that allows ALL (including DELETE)
DROP POLICY IF EXISTS super_admin_audit_logs ON audit_logs;

-- Create separate policies for INSERT and SELECT only (no DELETE/UPDATE)
CREATE POLICY audit_logs_insert ON audit_logs
    FOR INSERT
    WITH CHECK (true); -- Anyone can insert (service will handle auth)

CREATE POLICY audit_logs_select_super_admin ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.rol = 'super_admin'
        )
    );

-- Tenant admins can see their own audit logs
CREATE POLICY audit_logs_select_tenant ON audit_logs
    FOR SELECT
    USING (
        empresa_id IN (
            SELECT empresa_id FROM usuarios
            WHERE usuarios.id = auth.uid()
        )
    );

-- NOTE: No UPDATE or DELETE policies = audit logs are immutable
-- This is intentional for security and compliance

COMMENT ON TABLE audit_logs IS 'Immutable audit trail. No DELETE or UPDATE allowed by design.';
