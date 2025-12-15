
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    const creditoId = '0dd457a1-a88e-415a-8f67-2ca4f184ad2c';

    // Use 'fecha' instead of 'created_at' based on error
    const { data, error } = await supabase
        .from('movimientos_caja_operativa')
        .select('*')
        .eq('referencia_id', creditoId)
        .order('fecha', { ascending: false });

    if (error) {
        console.error('Error fetching movement:', error);
    } else if (!data || data.length === 0) {
        console.log('No movements found for this credit.');
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.forEach((m: any) => {
            console.log('--- MOVEMENT LOG ---');
            console.log('ID:', m.id);
            console.log('Tipo:', m.tipo);
            console.log('Motivo:', m.motivo);
            console.log('Monto:', m.monto);
            console.log('Descripcion:', m.descripcion);
            console.log('Fecha:', m.fecha);
        });
    }
}

run();
