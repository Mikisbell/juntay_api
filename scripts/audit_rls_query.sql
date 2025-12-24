SELECT 
    t.tablename,
    c.relrowsecurity AS rls_enabled,
    (SELECT COUNT(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = t.tablename AND column_name = 'empresa_id'
    ) AS has_empresa_id
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE t.schemaname = 'public'
ORDER BY t.tablename;
