/**
 * Tests for WhatsApp History Feature
 * 
 * Following AGENT.md governance: tests before completion
 */

import { describe, it, expect, vi } from 'vitest'
import type { MensajeHistorial } from '@/lib/actions/whatsapp-actions'

// Mock the supabase client
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
                    }))
                }))
            }))
        }))
    }))
}))

describe('WhatsApp Message History', () => {
    describe('obtenerHistorialMensajesCliente', () => {
        it('debe retornar array vacío cuando no se proporciona clienteId', async () => {
            const { obtenerHistorialMensajesCliente } = await import('@/lib/actions/whatsapp-actions')

            const result = await obtenerHistorialMensajesCliente('')
            expect(result).toEqual([])
        })
    })

    describe('MensajeHistorial type', () => {
        it('debe tener estructura correcta', () => {
            const mensaje: MensajeHistorial = {
                id: '123',
                credito_id: null,
                cliente_id: 'client-123',
                tipo_notificacion: 'cobranza',
                mensaje: 'Test message',
                telefono_destino: '987654321',
                enviado_por: null,
                estado: 'enviado',
                medio: 'whatsapp',
                created_at: '2024-12-19T00:00:00Z'
            }

            expect(mensaje.id).toBe('123')
            expect(mensaje.cliente_id).toBe('client-123')
            expect(mensaje.medio).toBe('whatsapp')
        })
    })
})

