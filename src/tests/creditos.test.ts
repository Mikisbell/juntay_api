import { describe, it, expect, vi, beforeAll } from 'vitest'
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
import {
    obtenerCreditoPorId,
    obtenerTodosCreditos,
    obtenerResumenEstados
} from '../lib/actions/creditos-actions'

// Cliente directo para assertions
const supabase = createClient(supabaseUrl, supabaseKey)

describe('Módulo de Créditos - Integración', () => {

    /**
     * PRUEBA 1: Verificar estructura de tabla créditos
     */
    it('Debe tener las columnas correctas en creditos', async () => {
        const { data, error } = await supabase
            .from('creditos')
            .select('id, codigo, monto_prestado, saldo_pendiente, tasa_interes, estado, fecha_vencimiento')
            .limit(1)

        expect(error).toBeNull()
    })

    /**
     * PRUEBA 2: Verificar estados válidos
     */
    it('Los créditos deben tener estados válidos', async () => {
        const { data: creditos } = await supabase
            .from('creditos')
            .select('estado')
            .limit(10)

        if (creditos && creditos.length > 0) {
            const estadosValidos = ['vigente', 'pendiente', 'vencido', 'liquidado', 'en_mora', 'renovado']
            creditos.forEach(c => {
                expect(estadosValidos).toContain(c.estado)
            })
        }
    })

    /**
     * PRUEBA 3: Obtener crédito por ID
     */
    it('Debe obtener crédito por ID con datos completos', async () => {
        const { data: primerCredito } = await supabase
            .from('creditos')
            .select('id')
            .limit(1)
            .single()

        if (primerCredito) {
            const credito = await obtenerCreditoPorId(primerCredito.id)
            if (credito) {
                expect(credito).toHaveProperty('id')
                expect(credito).toHaveProperty('monto_prestado')
                expect(credito).toHaveProperty('saldo_pendiente')
            }
        }
    })

    /**
     * PRUEBA 4: Obtener todos los créditos
     */
    it('Debe obtener lista de créditos', async () => {
        const creditos = await obtenerTodosCreditos(10, 0)
        expect(Array.isArray(creditos)).toBe(true)
    })

    /**
     * PRUEBA 5: Verificar integridad cliente <-> crédito
     */
    it('Los créditos deben tener cliente_id válido', async () => {
        const { data: credito } = await supabase
            .from('creditos')
            .select('cliente_id')
            .limit(1)
            .single()

        if (credito) {
            const { data: cliente, error } = await supabase
                .from('clientes')
                .select('id')
                .eq('id', credito.cliente_id)
                .single()

            expect(error).toBeNull()
            expect(cliente).toBeDefined()
        }
    })

    /**
     * PRUEBA 6: Verificar cálculos de saldo
     */
    it('El saldo_pendiente debe ser <= monto_prestado', async () => {
        const { data: creditos } = await supabase
            .from('creditos')
            .select('monto_prestado, saldo_pendiente')
            .limit(10)

        if (creditos) {
            creditos.forEach(c => {
                expect(Number(c.saldo_pendiente)).toBeLessThanOrEqual(Number(c.monto_prestado))
            })
        }
    })

    /**
     * PRUEBA 7: Resumen de estados
     */
    it('Debe obtener resumen de estados', async () => {
        const resumen = await obtenerResumenEstados()
        expect(resumen).toBeDefined()
        expect(typeof resumen.total).toBe('number')
    })
})
