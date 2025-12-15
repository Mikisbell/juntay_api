
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Initialize Supabase Client (Service Role for Admin Access)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * CRON JOB: Recordatorios de Vencimiento
 * Frecuencia Sugerida: Diario a las 9:00 AM
 */
async function runDailyReminders() {
    console.log('--- STARTING DAILY REMINDERS ---');
    try {
        // 1. Obtener créditos que vencen HOY
        const today = new Date().toISOString().split('T')[0];
        console.log(`Checking for due dates on: ${today}`);

        const { data: vencimientosHoy, error } = await supabase
            .from('creditos')
            .select(`
                id,
                codigo,
                monto_prestado,
                saldo_pendiente,
                fecha_vencimiento,
                clientes (
                    id,
                    nombres,
                    apellido_paterno,
                    telefono_principal
                )
            `)
            .eq('fecha_vencimiento', today)
            .eq('estado', 'vigente');

        if (error) throw error;

        console.log(`Found ${vencimientosHoy?.length || 0} credits due today.`);

        // 2. Procesar cada vencimiento
        for (const credito of vencimientosHoy || []) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cliente: any = credito.clientes;
            // Mapeo de campos
            const telefono = cliente?.telefono_principal;
            const nombre = `${cliente?.nombres} ${cliente?.apellido_paterno}`;

            if (!telefono) {
                console.log(`Skipping credit ${credito.codigo}: No phone number.`);
                continue;
            }

            console.log(`Sending WhatsApp to ${nombre} (${telefono})...`);

            // SIMULACIÓN: En producción, aquí llamaríamos a la API de WhatsApp
            // await whatsappApi.sendMessage(telefono, message);

            // Registrar intento en historial
            await supabase.from('notificaciones_historial').insert({
                credito_id: credito.id,
                cliente_id: cliente.id,
                tipo: 'vencimiento_hoy_auto',
                canal: 'whatsapp',
                estado: 'enviado',
                destino: telefono,
                contenido: `Recordatorio automático: Su crédito ${credito.codigo} vence hoy.`,
            });
        }

        console.log('--- COMPLETED SUCCESSFULLY ---');

    } catch (err) {
        console.error('CRON ERROR:', err);
    }
}

// Ejecutar directamente
runDailyReminders();
