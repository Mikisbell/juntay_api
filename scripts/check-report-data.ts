
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
    console.log('--- Verifying Data for Reports ---');

    // 1. Check Credits for Cartera Report
    const { count: creditosCount, error: err1 } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .not('estado_detallado', 'in', '("cancelado","anulado")');

    if (err1) console.error('Error checking credits:', err1.message);
    else console.log(`✅ Active Credits for Cartera Report: ${creditosCount}`);

    // 2. Check Overdue for Mora Report
    const { count: moraCount, error: err2 } = await supabase
        .from('creditos')
        .select('*', { count: 'exact', head: true })
        .in('estado_detallado', ['vencido', 'en_mora', 'en_gracia', 'pre_remate']);

    if (err2) console.error('Error checking mora:', err2.message);
    else console.log(`✅ Overdue Credits for Mora Report: ${moraCount}`);

    // 3. Check Payments for Account Statement
    const { count: pagosCount, error: err3 } = await supabase
        .from('pagos')
        .select('*', { count: 'exact', head: true });

    if (err3) console.error('Error checking payments:', err3.message);
    else console.log(`✅ Total Payments for History: ${pagosCount}`);

    // 4. Get a sample Client ID for testing
    const { data: client } = await supabase
        .from('creditos')
        .select('cliente_id')
        .limit(1)
        .single();

    if (client) {
        console.log(`\nℹ️ Suggested Client ID for testing: ${client.cliente_id}`);
        console.log(`   URL: http://localhost:3000/dashboard/clientes/${client.cliente_id}`);
    } else {
        console.log('\n⚠️ No clients with credits found. Reports may be empty.');
    }
}

checkData();
