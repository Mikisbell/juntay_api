'use server'

import { createClient } from '@/lib/supabase/server'

const GOLDAPI_KEY = process.env.GOLDAPI_KEY || 'goldapi-4tl219mixuxvbt-io'
const GOLDAPI_URL = 'https://www.goldapi.io/api/XAU/USD' // USD porque PEN no está disponible
const TIPO_CAMBIO_USD_PEN = 3.75 // Tipo de cambio aproximado USD -> PEN

export type PreciosOro = {
    k24: number
    k22: number
    k21: number
    k18: number
    k14: number
    k10: number
}

export type PrecioOroResponse = {
    success: boolean
    cached: boolean
    precios: PreciosOro
    updatedAt: string
    source: 'goldapi' | 'manual'
    error?: string
}

/**
 * Obtiene los precios del oro desde caché o desde GoldAPI.io
 * Estrategia: Caché de 24 horas para no agotar los 100 requests/mes
 */
export async function getPreciosOro(forceRefresh = false): Promise<PrecioOroResponse> {
    const supabase = await createClient()

    try {
        // 1. Leer caché actual de system_settings
        const { data: settings, error: settingsError } = await supabase
            .from('system_settings')
            .select('id, precio_oro_24k_pen, precio_oro_22k_pen, precio_oro_21k_pen, precio_oro_18k_pen, precio_oro_14k_pen, precio_oro_10k_pen, precio_oro_updated_at, precio_oro_source')
            .single()

        if (settingsError) {
            console.error('Error leyendo system_settings:', settingsError)
            return { success: false, cached: false, precios: getDefaultPrecios(), updatedAt: '', source: 'manual', error: 'Error leyendo configuración' }
        }

        // 2. Verificar si el caché es válido (< 24 horas)
        const lastUpdate = new Date(settings?.precio_oro_updated_at || 0)
        const hoursAgo = (Date.now() - lastUpdate.getTime()) / 1000 / 60 / 60
        const cacheValid = hoursAgo < 24 && settings?.precio_oro_24k_pen && !forceRefresh

        if (cacheValid) {
            return {
                success: true,
                cached: true,
                precios: {
                    k24: Number(settings.precio_oro_24k_pen),
                    k22: Number(settings.precio_oro_22k_pen),
                    k21: Number(settings.precio_oro_21k_pen),
                    k18: Number(settings.precio_oro_18k_pen),
                    k14: Number(settings.precio_oro_14k_pen),
                    k10: Number(settings.precio_oro_10k_pen),
                },
                updatedAt: settings.precio_oro_updated_at,
                source: settings.precio_oro_source as 'goldapi' | 'manual'
            }
        }

        // 3. Fetch nuevo precio desde GoldAPI.io
        const response = await fetch(GOLDAPI_URL, {
            headers: {
                'x-access-token': GOLDAPI_KEY,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 3600 } // Revalidar cada hora en Next.js
        })

        if (!response.ok) {
            console.error('GoldAPI error:', response.status, response.statusText)
            // Retornar caché viejo si existe
            if (settings?.precio_oro_24k_pen) {
                return {
                    success: true,
                    cached: true,
                    precios: {
                        k24: Number(settings.precio_oro_24k_pen),
                        k22: Number(settings.precio_oro_22k_pen),
                        k21: Number(settings.precio_oro_21k_pen),
                        k18: Number(settings.precio_oro_18k_pen),
                        k14: Number(settings.precio_oro_14k_pen),
                        k10: Number(settings.precio_oro_10k_pen),
                    },
                    updatedAt: settings.precio_oro_updated_at,
                    source: settings.precio_oro_source as 'goldapi' | 'manual',
                    error: 'API no disponible, usando caché'
                }
            }
            return { success: false, cached: false, precios: getDefaultPrecios(), updatedAt: '', source: 'manual', error: 'Error conectando a GoldAPI' }
        }

        const data = await response.json()

        // GoldAPI devuelve precios en USD, convertimos a PEN
        const nuevosPrecios: PreciosOro = {
            k24: roundTo2(data.price_gram_24k * TIPO_CAMBIO_USD_PEN),
            k22: roundTo2(data.price_gram_22k * TIPO_CAMBIO_USD_PEN),
            k21: roundTo2(data.price_gram_21k * TIPO_CAMBIO_USD_PEN),
            k18: roundTo2(data.price_gram_18k * TIPO_CAMBIO_USD_PEN),
            k14: roundTo2(data.price_gram_14k * TIPO_CAMBIO_USD_PEN),
            k10: roundTo2(data.price_gram_10k * TIPO_CAMBIO_USD_PEN),
        }

        // 4. Guardar en caché (system_settings)
        const { error: updateError } = await supabase
            .from('system_settings')
            .update({
                precio_oro_24k_pen: nuevosPrecios.k24,
                precio_oro_22k_pen: nuevosPrecios.k22,
                precio_oro_21k_pen: nuevosPrecios.k21,
                precio_oro_18k_pen: nuevosPrecios.k18,
                precio_oro_14k_pen: nuevosPrecios.k14,
                precio_oro_10k_pen: nuevosPrecios.k10,
                precio_oro_updated_at: new Date().toISOString(),
                precio_oro_source: 'goldapi'
            })
            .eq('id', settings.id)

        if (updateError) {
            console.error('Error actualizando precios en system_settings:', updateError)
        }

        return {
            success: true,
            cached: false,
            precios: nuevosPrecios,
            updatedAt: new Date().toISOString(),
            source: 'goldapi'
        }

    } catch (error) {
        console.error('Error en getPreciosOro:', error)
        return {
            success: false,
            cached: false,
            precios: getDefaultPrecios(),
            updatedAt: '',
            source: 'manual',
            error: 'Error inesperado'
        }
    }
}

/**
 * Fuerza una actualización del precio del oro desde la API
 * Solo para uso de administradores
 */
export async function actualizarPreciosOro(): Promise<PrecioOroResponse> {
    return getPreciosOro(true)
}

// Helpers
function roundTo2(num: number): number {
    return Math.round(num * 100) / 100
}

function getDefaultPrecios(): PreciosOro {
    // Valores aproximados Dic 2024 (fallback si API no disponible)
    return {
        k24: 505.00,
        k22: 463.00,
        k21: 442.00,
        k18: 379.00,
        k14: 295.00,
        k10: 211.00
    }
}
