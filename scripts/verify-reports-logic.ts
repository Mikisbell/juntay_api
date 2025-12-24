
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS for verification

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyReports() {
    console.log('🔍 Verifying Report Data Availability...\n');

    try {
        // 1. Verify Cartera Data
        console.log('1️⃣  Checking Cartera Report Data...');
        const { data: creditos, error: errCartera } = await supabase
            .from('creditos')
            .select(`
                codigo,
                monto_prestado,
                saldo_pendiente,
                estado_detallado,
                fecha_vencimiento,
                clientes(nombres, apellido_paterno)
            `)
            .not('estado_detallado', 'in', '("cancelado","anulado","ejecutado")')
            .limit(5);

        if (errCartera) throw new Error(`Cartera Query Error: ${errCartera.message}`);

        console.log(`   ✅ Found ${creditos?.length} active credits for Cartera.`);
        if (creditos?.length === 0) console.warn('   ⚠️  Warning: No active credits found. Did seeding work?');
        else console.log(`   📝 Sample: ${creditos[0].codigo} - ${creditos[0].clientes?.nombres}`);

        // 2. Verify Client Account Statement Data
        console.log('\n2️⃣  Checking Client Account Statement Data...');
        // Find the latest test client created by qa-core-flow
        const { data: cliente } = await supabase
            .from('clientes')
            .select('id, nombres')
            .eq('nombres', 'Cliente')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!cliente) throw new Error('No test client found (nombres="Cliente")');

        const { data: creditosCliente } = await supabase
            .from('creditos')
            .select('codigo, monto_prestado, saldo_pendiente')
            .eq('cliente_id', cliente.id);

        const { data: pagosCliente } = await supabase
            .from('pagos')
            .select('monto_total, created_at, creditos!inner(cliente_id)')
            .eq('creditos.cliente_id', cliente.id);

        console.log(`   ✅ Client: ${cliente.nombres} (${cliente.id})`);
        console.log(`   ✅ Credits: ${creditosCliente?.length}`);
        console.log(`   ✅ Payments: ${pagosCliente?.length}`);

        if (creditosCliente?.length === 0 || pagosCliente?.length === 0) {
            console.warn('   ⚠️  Warning: Client missing credits or payments.');
        }

        // 3. Verify Mora Report Data
        console.log('\n3️⃣  Checking Mora Report Data...');
        // We expect 0 here usually if seed is fresh and healthy, unless we mock a late credit.
        const hoy = new Date();
        const { data: mora } = await supabase
            .from('creditos')
            .select('codigo, fecha_vencimiento')
            .lt('fecha_vencimiento', hoy.toISOString())
            .in('estado_detallado', ['vencido', 'en_mora', 'en_gracia']);

        console.log(`   ℹ️  Overdue credits found: ${mora?.length}`);

        console.log('\n✨ Verification Logic Complete');

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

verifyReports();
