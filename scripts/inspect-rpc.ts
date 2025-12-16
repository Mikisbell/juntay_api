
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    const { data, error } = await supabase.rpc('get_contratos_vencimientos', {
        p_dias: 30
    });

    if (error) {
        console.error('Error:', error);
    } else {
        if (data && data.length > 0) {
            console.log('First record keys:', Object.keys(data[0]));
            console.log('Sample record:', data[0]);
        } else {
            console.log('RPC returned no data (empty array).');
        }
    }
}

run();
