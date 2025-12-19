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
import {
    buscarContratoPorCodigo,
    buscarClientes,
    buscarContratosPorClienteId
} from '../lib/actions/pagos-actions'

// Cliente directo para assertions
const supabase = createClient(supabaseUrl, supabaseKey)

describe('Módulo de Pagos - Integración', () => {

    /**
     * PRUEBA 1: Verificar que la tabla pagos existe con estructura correcta
     */
    it('Debe poder consultar la tabla pagos', async () => {
        const { data: _data, error } = await supabase
            .from('pagos')
            .select('id, monto_total, desglose_capital, desglose_interes, desglose_mora')
            .limit(1)

        expect(error).toBeNull()
    })

    /**
     * PRUEBA 2: Verificar estructura de contrato para pago
     */
    it('Debe obtener estructura correcta de contrato para pago', async () => {
        const { data: credito } = await supabase
            .from('creditos')
            .select('codigo')
            .limit(1)
            .single()

        if (credito) {
            const contrato = await buscarContratoPorCodigo(credito.codigo)
            if (contrato) {
                expect(contrato).toHaveProperty('id')
                expect(contrato).toHaveProperty('codigo')
                expect(contrato).toHaveProperty('monto_prestado')
                expect(contrato).toHaveProperty('saldo_pendiente')
                expect(contrato).toHaveProperty('tasa_interes')
            }
        }
    })

    /**
     * PRUEBA 3: Buscar clientes para pago
     */
    it('Debe buscar clientes por DNI', async () => {
        const { data: cliente } = await supabase
            .from('clientes_completo')
            .select('numero_documento')
            .limit(1)
            .single()

        if (cliente) {
            const clientes = await buscarClientes(cliente.numero_documento)
            expect(Array.isArray(clientes)).toBe(true)
            if (clientes.length > 0) {
                expect(clientes[0]).toHaveProperty('id')
                expect(clientes[0]).toHaveProperty('nombre')
                expect(clientes[0]).toHaveProperty('documento')
            }
        }
    })

    /**
     * PRUEBA 4: Verificar columnas de pagos (schema correcto)
     */
    it('Los pagos deben usar monto_total y desglose_*', async () => {
        const { data } = await supabase
            .from('pagos')
            .select('*')
            .limit(1)
            .single()

        if (data) {
            // Verificar que usa las columnas correctas
            expect(data).toHaveProperty('monto_total')
            expect(data).toHaveProperty('desglose_capital')
            expect(data).toHaveProperty('desglose_interes')
            expect(data).toHaveProperty('desglose_mora')

            // Verificar que NO existe la columna legacy 'monto'
            expect(data).not.toHaveProperty('monto')
        }
    })

    /**
     * PRUEBA 5: Buscar contratos por cliente ID
     */
    it('Debe buscar contratos de cliente por ID', async () => {
        const { data: cliente } = await supabase
            .from('clientes')
            .select('id')
            .limit(1)
            .single()

        if (cliente) {
            const contratos = await buscarContratosPorClienteId(cliente.id)
            expect(Array.isArray(contratos)).toBe(true)
            // Los contratos pueden estar vacíos si el cliente no tiene créditos
        }
    })

    /**
     * PRUEBA 6: Verificar integridad referencial pago -> crédito
     */
    it('Los pagos deben tener credito_id válido', async () => {
        const { data: pago } = await supabase
            .from('pagos')
            .select('id, credito_id')
            .not('credito_id', 'is', null)
            .limit(1)
            .single()

        if (pago) {
            const { data: credito, error } = await supabase
                .from('creditos')
                .select('id')
                .eq('id', pago.credito_id)
                .single()

            expect(error).toBeNull()
            expect(credito).toBeDefined()
        }
    })

    /**
     * PRUEBA 7: Verificar créditos tienen columnas para cálculo de interés
     */
    it('Los créditos deben tener campos para cálculo de interés', async () => {
        const { data: credito } = await supabase
            .from('creditos')
            .select('*')
            .limit(1)
            .single()

        if (credito) {
            expect(credito).toHaveProperty('tasa_interes')
            expect(credito).toHaveProperty('saldo_pendiente')
            expect(credito).toHaveProperty('monto_prestado')
            expect(credito).toHaveProperty('fecha_vencimiento')
        }
    })
})
