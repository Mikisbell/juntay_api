
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    const { data, error } = await supabase
        .from('creditos')
        .select('*')
        .eq('id', '0dd457a1-a88e-415a-8f67-2ca4f184ad2c')
        .single();

    if (error) {
        console.error(error);
    } else {
        // Print logic relevant fields
        console.log('--- CREDIT DATA ---');
        console.log('ID:', data.id);
        console.log('Fecha Inicio:', data.fecha_inicio);
        console.log('Fecha Vencimiento:', data.fecha_vencimiento);
        console.log('Dias (column):', data.dias);
        console.log('Periodo Dias (column):', data.periodo_dias || 'Does not exist under this name');
        console.log('Plazo (column):', data.plazo || 'Does not exist under this name');

        // Check if period logic works
        const period = data.dias || data.periodo_dias || 30;
        const dueDate = new Date(data.fecha_vencimiento);
        console.log('Calculated Duration (Period):', period);
    }
}

run();
