
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
    console.log("--- Inspecting 'inversionistas' columns ---");
    // Using a trick query or just selecting * limit 1 to see keys
    const { data, error } = await supabase
        .from('inversionistas')
        .select('*')
        .limit(1);

    if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    } else {
        // If empty, try to insert dummy and fail to see columns in error? No, unsafe.
        // Just try to select metadata column explicitly.
        const { data: metaCheck, error: metaError } = await supabase
            .from('inversionistas')
            .select('metadata')
            .limit(1);

        if (!metaError) {
            console.log("Column 'metadata' EXISTS.");
        } else {
            console.log("Column 'metadata' MISSING:", metaError.message);
        }

        console.log("Sample Data (if any):", data);
    }
}

inspectSchema();
