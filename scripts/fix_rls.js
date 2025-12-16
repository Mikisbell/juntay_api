require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');
const path = require('path');

const DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DB_URL) {
    console.error("❌ No DATABASE_URL found in .env.local");
    process.exit(1);
}

// SQL command to fix policies
const SQL = `
DO $$
BEGIN
    -- 1. Eliminar política restrictiva anterior
    DROP POLICY IF EXISTS "Usuarios autenticados pueden subir fotos de garantías" ON storage.objects;
    DROP POLICY IF EXISTS "Público puede ver fotos de garantías" ON storage.objects;
    DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar fotos" ON storage.objects;

    -- 2. Crear nueva política permisiva para INSERT
    CREATE POLICY "Usuarios autenticados pueden subir fotos de garantías fixed"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK ( bucket_id = 'garantias' );

    -- 3. Asegurar lectura pública
    CREATE POLICY "Público puede ver fotos de garantías fixed"
    ON storage.objects FOR SELECT TO public
    USING ( bucket_id = 'garantias' );

    -- 4. Permitir update
    CREATE POLICY "Usuarios autenticados pueden actualizar fotos"
    ON storage.objects FOR UPDATE TO authenticated
    USING ( bucket_id = 'garantias' );
END
$$;
`;

console.log("🛠️ Applying Storage RLS Fix...");

// Use psql to execute raw SQL
// We pass the password via PGPASSWORD env var just in case, though connection string usually handles it.
const command = `psql "${DB_URL}" -c '${SQL}'`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error executing migration: ${error.message}`);
        console.error(stderr);
        return;
    }
    if (stderr) console.error(stderr);
    console.log(stdout);
    console.log("✅ Storage RLS Policy Fixed Successfully.");
});
