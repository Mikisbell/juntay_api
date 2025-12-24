
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing env vars')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runForceSeed() {
    console.log('🚀 Starting Force Seed (Direct Insert Mode v2)')

    try {
        // 1. Get or Create Admin User
        let userId = '00000000-0000-0000-0000-000000000000';
        const { data: users } = await supabase.from('usuarios').select('id').limit(1);

        if (users && users.length > 0) {
            userId = users[0].id;
            console.log(`✅ Using existing user: ${userId}`);
        } else {
            console.log('⚠️ No users found. Creating dummy user...');
            const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
                email: `admin_${Date.now()}@juntay.test`,
                password: 'password123',
                email_confirm: true,
                user_metadata: { nombres: 'Admin', apellido_paterno: 'Seed' }
            });
            if (userError) throw userError;
            userId = user!.id;

            await supabase.from('usuarios').insert({
                id: userId,
                email: user!.email!,
                nombres: 'Admin',
                apellido_paterno: 'Seed',
                rol: 'admin'
            });
            console.log(`✅ Created user: ${userId}`);
        }

        // 1.5. Get Empresa
        let empresaId = '00000000-0000-0000-0000-000000000000';
        const { data: empresas } = await supabase.from('empresas').select('id').limit(1);
        if (empresas && empresas.length > 0) {
            empresaId = empresas[0].id;
            console.log(`✅ Using existing empresa: ${empresaId}`);
        } else {
            console.log('⚠️ No empresa found. Creating dummy empresa...');
            const { data: emp, error: empError } = await supabase.from('empresas').insert({
                nombre: 'Empresa Test Limitada',
                ruc: '20123456789',
                direccion: 'Calle Falsa 123'
            }).select().single();

            if (emp) {
                empresaId = emp.id;
                console.log(`✅ Created empresa: ${empresaId}`);
            } else {
                console.warn('⚠️ Could not create empresa (RLS/Error), attempting to proceed with dummy UUID...');
            }
        }

        // 2. Create/Get Persona & Cliente
        const dni = `DNI${Date.now().toString().slice(-8)}`;
        const { data: persona, error: pError } = await supabase.from('personas').insert({
            nombres: 'Cliente',
            apellido_paterno: 'Prueba',
            apellido_materno: 'Reportes',
            tipo_documento: 'DNI',
            numero_documento: dni,
            // telefono removed
            email: `cliente_${Date.now()}@test.com`
        }).select().single();

        if (pError) throw new Error(`Persona Insert Error: ${pError.message}`);
        console.log(`✅ Persona created: ${persona.id}`);

        // Insert Cliente with all required fields
        const { data: cliente, error: cError } = await supabase.from('clientes').insert({
            persona_id: persona.id,
            empresa_id: empresaId,
            tipo_documento: 'DNI',
            numero_documento: dni,
            nombres: 'Cliente',
            apellido_paterno: 'Prueba',
            apellido_materno: 'Reportes',
            telefono_principal: '999000111',
            direccion: 'Av. Test 123',
            score_crediticio: 650,
            activo: true
        }).select().single();

        if (cError) throw new Error(`Cliente Insert Error: ${cError.message}`);
        console.log(`✅ Cliente created: ${cliente.id}`);

        // 3. Create Dummy Caja
        const { data: caja, error: cajaError } = await supabase.from('cajas_operativas').insert({
            usuario_id: userId,
            numero_caja: 99, // Use a distinct number for testing
            saldo_inicial: 1000,
            saldo_actual: 1000,
            estado: 'abierta',
            fecha_apertura: new Date().toISOString()
        }).select().single();

        if (cajaError) throw new Error(`Caja Insert Error: ${cajaError.message}`);
        console.log(`✅ Caja created: ${caja.id}`);

        // 4. Create Garantia
        const { data: garantia, error: gError } = await supabase.from('garantias').insert({
            cliente_id: cliente.id,
            descripcion: 'Laptop Dell Inspiron',
            valor_tasacion: 1500,
            estado: 'custodia'
        }).select().single();

        if (gError) throw new Error(`Garantia Insert Error: ${gError.message}`);
        console.log(`✅ Garantia: ${garantia.id}`);

        // 5. Create Credito
        const fechaInicio = new Date();
        const fechaVenc = new Date();
        fechaVenc.setDate(fechaVenc.getDate() + 30);

        const { data: credito, error: credError } = await supabase.from('creditos').insert({
            cliente_id: cliente.id,
            // garantia_id removed as it does not exist in creditos according to schema cache/types
            caja_origen_id: caja.id,
            created_by: userId, // Mapped from usuario_id
            monto_prestado: 500,
            saldo_pendiente: 300,
            fecha_inicio: fechaInicio.toISOString(),
            fecha_vencimiento: fechaVenc.toISOString(),
            tasa_interes: 10,
            periodo_dias: 30,
            estado: 'vigente',
            estado_detallado: 'vigente',
            codigo_credito: `LOC-${Date.now().toString().slice(-6)}`
        }).select().single();

        if (credError) throw new Error(`Credito Insert Error: ${credError.message}`);
        console.log(`✅ Credito created: ${credito.id}`);

        // Link Garantia to Credito (Inverse relationship)
        const { error: linkError } = await supabase.from('garantias').update({
            credito_id: credito.id,
            estado: 'custodia' // Update status to valid value
        }).eq('id', garantia.id);

        if (linkError) throw new Error(`Link Garantia Error: ${linkError.message}`);
        console.log(`✅ Garantia linked to Credito`);

        // 6. Create Pago (Partial)
        const { error: pagoError } = await supabase.from('pagos').insert({
            credito_id: credito.id,
            caja_operativa_id: caja.id,
            usuario_id: userId,
            monto_total: 250,
            desglose_capital: 200, // mapped from monto_capital if schema has it? database.types says 'desglose_capital'
            desglose_interes: 50,  // database.types says 'desglose_interes'
            metodo_pago: 'EFECTIVO',
            fecha_pago: new Date().toISOString()
        });

        if (pagoError) {
            // If error is about missing cliente_id, we know. But let's log it.
            console.error(`Pago Insert Error: ${pagoError.message}`);
        } else {
            console.log(`✅ Pago created: 250.00`);
        }

        console.log('\n✨ Database Seeded Successfully!');
        console.log(`👉 Verify at: http://localhost:3000/dashboard/clientes/${cliente.id}`);

    } catch (err: any) {
        console.error('❌ Seed Failed:', err.message);
        process.exit(1);
    }
}

runForceSeed();
