import { describe, it, expect, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-placeholder'

// Mock server client
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
import { obtenerResumenDiario, obtenerContratosUrgentes } from '../lib/actions/dashboard-actions'

// Cliente directo para assertions
const supabase = createClient(supabaseUrl, supabaseKey)

describe('Módulo de Dashboard - Integración', () => {

    /**
     * PRUEBA 1: Verificar resumen diario
     */
    it('Debe obtener resumen diario del dashboard', async () => {
        const stats = await obtenerResumenDiario()

        expect(stats).toBeDefined()
        expect(stats).toHaveProperty('creditosHoy')
        expect(stats).toHaveProperty('pagosHoy')
        expect(stats).toHaveProperty('montoPagosHoy')
    })

    /**
     * PRUEBA 2: Verificar que los conteos son numéricos
     */
    it('Los conteos deben ser numéricos y >= 0', async () => {
        const stats = await obtenerResumenDiario()

        expect(typeof stats.creditosHoy).toBe('number')
        expect(typeof stats.pagosHoy).toBe('number')
        expect(typeof stats.montoPagosHoy).toBe('number')

        expect(stats.creditosHoy).toBeGreaterThanOrEqual(0)
        expect(stats.pagosHoy).toBeGreaterThanOrEqual(0)
    })

    /**
     * PRUEBA 3: Verificar contratos urgentes
     */
    it('Debe obtener contratos urgentes', async () => {
        const urgentes = await obtenerContratosUrgentes()

        expect(urgentes).toBeDefined()
        expect(urgentes).toHaveProperty('vencenHoy')
        expect(urgentes).toHaveProperty('vencidos')
        expect(urgentes).toHaveProperty('totalUrgentes')
        expect(Array.isArray(urgentes.vencenHoy)).toBe(true)
    })

    /**
     * PRUEBA 4: Verificar vistas necesarias existen
     */
    it('Debe existir vista clientes_completo', async () => {
        const { error } = await supabase
            .from('clientes_completo')
            .select('count')
            .limit(1)

        expect(error).toBeNull()
    })

    /**
     * PRUEBA 5: Verificar tabla creditos tiene datos coherentes
     */
    it('Créditos vigentes deben tener saldo > 0', async () => {
        const { data: creditosVigentes } = await supabase
            .from('creditos')
            .select('saldo_pendiente')
            .eq('estado', 'vigente')
            .limit(10)

        if (creditosVigentes && creditosVigentes.length > 0) {
            creditosVigentes.forEach(c => {
                expect(Number(c.saldo_pendiente)).toBeGreaterThan(0)
            })
        }
    })
})
