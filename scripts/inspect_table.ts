
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function inspect() {
    console.log('Inspecting table: creditos');
    const { data, error } = await supabase
        .from('creditos')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting *:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns found in object keys:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, cannot infer columns from result. Checking RPC/Schema not possible via JS client easily without admin API.');
        }
    }

    // Try dummy insert to see error details or specific columns
    // Actually, let's try to query information_schema if we have permissions?
    // Pgst and others might not be exposed.
    // Let's try to use the 'check_report_data.ts' approach but for columns?
}

inspect();
