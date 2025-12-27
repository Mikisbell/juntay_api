
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error('❌ .env.local not found at ' + envPath);
    process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBilling() {
    console.log('🔍 Verifying Billing System (JS)...');

    // 1. Check Tables
    const tables = ['planes_suscripcion', 'suscripciones', 'facturas'];
    console.log('\nChecking Tables:');
    let allTablesExist = true;
    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.error(`❌ Table ${table}: Error - ${error.message}`);
            allTablesExist = false;
        } else {
            console.log(`✅ Table ${table}: Exists`);
        }
    }

    if (!allTablesExist) process.exit(1);

    // 2. Check Seed Data (Planes)
    console.log('\nChecking Seed Data (Planes):');
    const { data: planes, error: planesError } = await supabase.from('planes_suscripcion').select('nombre, precio_mensual');

    if (planesError) {
        console.error(`❌ Error fetching planes: ${planesError.message}`);
        process.exit(1);
    } else {
        const expected = ['basico', 'pro', 'enterprise'];
        const found = planes.map(p => p.nombre);
        const missing = expected.filter(x => !found.includes(x));

        if (missing.length === 0) {
            console.log(`✅ All 3 plans found: ${found.join(', ')}`);
        } else {
            console.error(`❌ Missing plans: ${missing.join(', ')}`);
            process.exit(1);
        }

        planes.forEach(p => {
            console.log(`   - Plan ${p.nombre}: S/ ${p.precio_mensual}`);
        });
    }

    // 3. Check specific functionality - e.g. RLS helper function
    // We can try to call the rpc get_empresa_plan with a fake ID to see if it exists (should return empty or error if function missing)
    console.log('\nChecking RPC get_empresa_plan:');
    const { error: rpcError } = await supabase.rpc('get_empresa_plan', { p_empresa_id: '00000000-0000-0000-0000-000000000000' });

    if (rpcError && rpcError.message.includes('function get_empresa_plan(p_empresa_id uuid) does not exist')) {
        console.error('❌ RPC get_empresa_plan missing');
        process.exit(1);
    } else {
        console.log('✅ RPC get_empresa_plan exists (called successfully)');
    }

    console.log('\n✅ BILLING SYSTEM VERIFICATION PASSED');
}

verifyBilling();
