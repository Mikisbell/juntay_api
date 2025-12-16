
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLatestRenewal() {
    console.log('--- Checking Latest Payments (Pagos) ---');

    const { data: pagos, error } = await supabase
        .from('pagos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching pagos:', error);
        return;
    }

    if (!pagos || pagos.length === 0) {
        console.log('No payments found.');
        return;
    }

    console.table(pagos.map(p => ({
        id: p.id,
        tipo: p.tipo,
        monto: p.monto,
        metodo: p.metodo_pago || p.medio_pago, // Handle potential column name variance
        created_at: p.created_at,
        credito_id: p.credito_id
    })));

    const latestRenewal = pagos.find(p => p.tipo === 'renovacion');

    if (latestRenewal) {
        console.log('\n✅ Latest Renewal Found:');
        console.log(latestRenewal);
    } else {
        console.log('\n❌ No recent "renovacion" found in the last 5 payments.');
    }
}

checkLatestRenewal();
