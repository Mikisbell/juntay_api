
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

async function checkCreditStatus() {
    const creditoId = '0dd457a1-a88e-415a-8f67-2ca4f184ad2c'; // ID obtained from previous step
    console.log(`--- Checking Credit ${creditoId} ---`);

    const { data: credito, error } = await supabase
        .from('creditos')
        .select('*')
        .eq('id', creditoId)
        .single();

    if (error) {
        console.error('Error fetching credit:', error);
        return;
    }

    if (!credito) {
        console.log('Credit not found.');
        return;
    }

    console.log('\n✅ Credit Found:');
    console.log({
        id: credito.id,
        estado: credito.estado,
        monto_prestamo: credito.monto_prestamo,
        fecha_inicio: credito.fecha_inicio,
        fecha_vencimiento: credito.fecha_vencimiento,
        dias: credito.dias,
        interes_mensual: credito.interes_mensual,
        created_at: credito.created_at
    });

    // Calculate expected due date logic check
    const fechaVencimiento = new Date(credito.fecha_vencimiento);
    console.log(`\nFecha Vencimiento (Date object): ${fechaVencimiento.toDateString()}`);
}

checkCreditStatus();
