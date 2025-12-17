
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatest() {
    console.log("--- Latest Personas ---");
    const { data: personas, error: errP } = await supabase
        .from('personas')
        .select('id, nombres, apellido_paterno, numero_documento, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

    if (errP) console.error(errP);
    else console.table(personas);

    console.log("\n--- Latest Inversionistas ---");
    const { data: inversionistas, error: errI } = await supabase
        .from('inversionistas')
        .select('id, persona_id, tipo_relacion, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

    if (errI) console.error(errI);
    else console.table(inversionistas);
}

checkLatest();
