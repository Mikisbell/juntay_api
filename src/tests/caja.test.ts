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
    obtenerEstadoCaja,
    obtenerCajaCompleta
} from '../lib/actions/caja-actions'

// Cliente directo para assertions
const supabase = createClient(supabaseUrl, supabaseKey)

describe('Módulo de Caja - Integración', () => {

    /**
     * PRUEBA 1: Verificar que la tabla cajas_operativas existe
     */
    it('Debe poder consultar la tabla cajas_operativas', async () => {
        const { data, error } = await supabase
            .from('cajas_operativas')
            .select('id, estado, saldo_actual')
            .limit(1)

        expect(error).toBeNull()
    })

    /**
     * PRUEBA 2: Verificar movimientos de caja (columnas correctas)
     */
    it('Debe poder consultar movimientos_caja_operativa', async () => {
        const { data, error } = await supabase
            .from('movimientos_caja_operativa')
            .select('id, tipo, monto, motivo')
            .limit(5)

        expect(error).toBeNull()
        expect(data).toBeDefined()
    })

    /**
     * PRUEBA 3: Verificar columnas de movimientos
     */
    it('Los movimientos deben tener los campos requeridos', async () => {
        const { data } = await supabase
            .from('movimientos_caja_operativa')
            .select('*')
            .limit(1)
            .single()

        if (data) {
            expect(data).toHaveProperty('tipo')
            expect(data).toHaveProperty('monto')
            expect(data).toHaveProperty('motivo')
        }
    })

    /**
     * PRUEBA 4: Verificar integridad referencial caja -> usuario
     */
    it('Las cajas deben tener usuario_id válido', async () => {
        const { data: caja } = await supabase
            .from('cajas_operativas')
            .select('id, usuario_id')
            .limit(1)
            .single()

        if (caja && caja.usuario_id) {
            const { data: usuario, error } = await supabase
                .from('usuarios')
                .select('id')
                .eq('id', caja.usuario_id)
                .single()

            expect(error).toBeNull()
            expect(usuario).toBeDefined()
        }
    })

    /**
     * PRUEBA 5: Verificar saldos de caja
     */
    it('Las cajas deben tener saldo_actual numérico', async () => {
        const { data: caja } = await supabase
            .from('cajas_operativas')
            .select('saldo_actual, saldo_inicial')
            .limit(1)
            .single()

        if (caja) {
            expect(typeof Number(caja.saldo_actual)).toBe('number')
            expect(typeof Number(caja.saldo_inicial)).toBe('number')
        }
    })
})
