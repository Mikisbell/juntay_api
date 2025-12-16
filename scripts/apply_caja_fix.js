require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' }); // También intentar cargar .env
const { exec } = require('child_process');

// Intentar encontrar la URL en varias variables comunes
const DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

if (!DB_URL) {
    console.error("❌ No DATABASE_URL found in .env.local or .env");
    console.log("Keys found:", Object.keys(process.env).filter(k => k.includes('URL') || k.includes('DB')));
    process.exit(1);
}

const SQL = `
DO $$
BEGIN
    -- 1. Eliminar la restricción única incorrecta que impide historiales
    ALTER TABLE public.cajas_operativas 
    DROP CONSTRAINT IF EXISTS cajas_operativas_usuario_id_estado_key;

    -- 2. Crear índice único parcial SOLO para cajas abiertas
    -- Esto permite tener múltiples cajas 'cerrada' o 'arqueada' para el mismo usuario
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_caja 
    ON public.cajas_operativas (usuario_id) 
    WHERE estado = 'abierta';
END
$$;
`;

console.log("🛠️ Applying Cajas Operativas Constraint Fix...");

const command = `psql "${DB_URL}" -c "${SQL}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error executing fix: ${error.message}`);
        console.error(stderr);
        return;
    }
    if (stderr) console.error(stderr);
    console.log(stdout);
    console.log("✅ Constraint Fixed Successfully. You can now open/close boxes freely.");
});
