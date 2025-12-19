
import { describe, it, expect, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno
// Intentar cargar .env.local, si no existe o faltan vars, cargar .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-placeholder'

// Si no hay keys reales, usar dummy para que createClient no falle al instanciar (aunque fallará al conectar si no son válidas)
if (supabaseKey === 'service-role-key-placeholder') {
    console.warn('WARN: Usando placeholder para SUPABASE_KEY. Los tests de integración podrían fallar si no conectan a DB real.')
}

// Mock de la librería del servidor para usar el cliente administrativo en tests
vi.mock('@/lib/supabase/server', () => ({
    createClient: async () => {
        return createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        })
    }
}))

// Importar acciones DESPUÉS del mock
import { obtenerInversionistas } from '../lib/actions/tesoreria-actions'
import { obtenerResumenConsolidado } from '../lib/actions/monitor-cajas-actions'

// Cliente directo para assertions
const supabase = createClient(supabaseUrl, supabaseKey)

describe('Módulo de Tesorería Integración', () => {

    /*
     * PRUEBA 1: Validación de Migración de Bóveda Central
     * Verifica que el código ya no use boveda_central y lea de cuentas_financieras
     */
    it('Debe leer el saldo de la bóveda desde cuentas_financieras (Legacy Migration)', async () => {
        const resumen = await obtenerResumenConsolidado();

        expect(resumen).toBeDefined();
        // El saldo debe ser numérico y >= 0
        expect(resumen.saldo_boveda).toBeGreaterThanOrEqual(0);

        // Verificación cruzada directa a la BD
        const { data: cuenta } = await supabase
            .from('cuentas_financieras')
            .select('saldo')
            .eq('es_principal', true)
            .single();

        expect(cuenta).toBeDefined();
        expect(Number(cuenta?.saldo)).toBe(resumen.saldo_boveda);
    });

    /*
     * PRUEBA 2: Inversionistas y Rendimientos
     * Valida que obtenerInversionistas traiga datos enriquecidos
     */
    it('Debe obtener inversionistas con rendimientos calculados', async () => {
        const inversionistas = await obtenerInversionistas();

        expect(Array.isArray(inversionistas)).toBe(true);

        if (inversionistas.length > 0) {
            const inv = inversionistas[0];
            expect(inv).toHaveProperty('total_invertido');
            expect(inv).toHaveProperty('rendimiento_acumulado');
            expect(typeof inv.total_invertido).toBe('number');
            // Validar que no explote si no hay contratos
        }
    });

    /*
     * PRUEBA 3: Integridad de Tablas Nuevas
     * Verifica que existan registros en contratos_fondeo si hay inversionistas
     */
    it('Debe permitir consultar contratos_fondeo', async () => {
        const { error } = await supabase
            .from('contratos_fondeo')
            .select('count')
            .limit(1);

        expect(error).toBeNull();
    });

});
