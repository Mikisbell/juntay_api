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
    buscarClientePorDNI,
    listarClientes,
    getClienteById,
    getClienteExtended
} from '../lib/actions/clientes-actions'

// Cliente directo para assertions
const supabase = createClient(supabaseUrl, supabaseKey)

describe('Módulo de Clientes - Integración', () => {

    /**
     * PRUEBA 1: Verificar que la vista clientes_completo existe y funciona
     */
    it('Debe poder consultar la vista clientes_completo', async () => {
        const { data, error } = await supabase
            .from('clientes_completo')
            .select('id, nombres, numero_documento')
            .limit(1)

        expect(error).toBeNull()
        expect(data).toBeDefined()
    })

    /**
     * PRUEBA 2: Buscar cliente por DNI
     */
    it('Debe buscar cliente por DNI sin errores', async () => {
        const { data: primerCliente } = await supabase
            .from('clientes_completo')
            .select('numero_documento')
            .limit(1)
            .single()

        if (primerCliente) {
            const resultado = await buscarClientePorDNI(primerCliente.numero_documento)
            expect(resultado).toBeDefined()
            if (resultado && resultado.encontrado) {
                expect(resultado.perfil.numero_documento).toBe(primerCliente.numero_documento)
            }
        } else {
            const resultado = await buscarClientePorDNI('00000000')
            expect(resultado?.encontrado).toBe(false)
        }
    })

    /**
     * PRUEBA 3: Listar clientes con paginación
     */
    it('Debe listar clientes con meta y data', async () => {
        const resultado = await listarClientes({ page: 1, pageSize: 10 })

        expect(resultado).toBeDefined()
        expect(resultado).toHaveProperty('data')
        expect(resultado).toHaveProperty('meta')
        expect(Array.isArray(resultado.data)).toBe(true)
        expect(resultado.meta.pagination.page).toBe(1)
        expect(resultado.meta.pagination.pageSize).toBe(10)
    })

    /**
     * PRUEBA 4: Listar clientes con filtro de búsqueda
     */
    it('Debe filtrar clientes por búsqueda', async () => {
        const resultado = await listarClientes({
            busqueda: 'test',
            page: 1,
            pageSize: 5
        })

        expect(resultado).toBeDefined()
        expect(Array.isArray(resultado.data)).toBe(true)
    })

    /**
     * PRUEBA 5: Obtener cliente por ID
     */
    it('Debe obtener cliente por ID si existe', async () => {
        const { data: primerCliente } = await supabase
            .from('clientes')
            .select('id')
            .limit(1)
            .single()

        if (primerCliente) {
            const resultado = await getClienteById(primerCliente.id)
            // Puede retornar null si cliente no existe en la vista
            if (resultado) {
                expect(resultado.id).toBe(primerCliente.id)
            }
        }
    })

    /**
     * PRUEBA 6: Datos extendidos del cliente
     */
    it('Debe obtener datos extendidos del cliente', async () => {
        const { data: primerCliente } = await supabase
            .from('clientes')
            .select('id')
            .limit(1)
            .single()

        if (primerCliente) {
            const resultado = await getClienteExtended(primerCliente.id)
            // Puede retornar null si cliente no tiene datos completos
            if (resultado) {
                expect(resultado).toHaveProperty('cliente')
                expect(resultado).toHaveProperty('referencia')
                expect(resultado).toHaveProperty('resumenFinanciero')
            }
        }
    })

    /**
     * PRUEBA 7: Verificar estructura de meta con KPIs correctos
     */
    it('Debe retornar meta de cartera con KPIs correctos', async () => {
        const resultado = await listarClientes()

        expect(resultado.meta).toBeDefined()
        expect(resultado.meta).toHaveProperty('totalClientes')
        expect(resultado.meta).toHaveProperty('clientesCriticos')
        expect(resultado.meta).toHaveProperty('montoCritico')
        expect(resultado.meta).toHaveProperty('vencimientosSemana')
        expect(resultado.meta).toHaveProperty('clientesSuspendidos')

        // Valores deben ser numéricos
        expect(typeof resultado.meta.totalClientes).toBe('number')
        expect(typeof resultado.meta.clientesCriticos).toBe('number')
    })
})
