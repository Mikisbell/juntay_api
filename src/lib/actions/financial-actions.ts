'use server'

interface FinancialData {
    usdPen: number
    goldPriceUsd: number // Precio por onza
    goldGram24k: number // Precio por gramo PEN
    goldGram18k: number // Precio por gramo PEN
    silverGram: number // Precio por gramo PEN (Estimado)
    timestamp: number
}

// Cache simple en memoria para no saturar las APIs (TTL 5 minutos)
let cache: { data: FinancialData; expires: number } | null = null

export async function getFinancialData(): Promise<FinancialData> {
    // Verificar cache
    if (cache && Date.now() < cache.expires) {
        return cache.data
    }

    try {
        // 1. Obtener Tipo de Cambio (USD -> PEN)
        const forexRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { next: { revalidate: 300 } })
        const forexData = await forexRes.json()
        const usdPen = forexData.rates.PEN || 3.78 // Fallback seguro

        // 2. Obtener Precio Oro (XAU -> USD)
        // Usamos una API pública común para widgets
        const goldRes = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 300 }
        })
        const goldData = await goldRes.json()

        // La API devuelve algo como: { "items": [ { "xauPrice": 2650.50, ... } ] } o similar
        // Ajustamos según la respuesta típica de goldprice.org
        const goldPriceUsd = goldData.items?.[0]?.xauPrice || 2650.00

        // 3. Cálculos
        const onzaToGram = 31.1035
        const goldGramUsd24k = goldPriceUsd / onzaToGram

        // Precios en Soles
        const goldGramPen24k = goldGramUsd24k * usdPen
        const goldGramPen18k = goldGramPen24k * 0.75 // 18k es 75% pureza

        // Plata (Estimado ratio 1:85 aprox frente al oro o valor fijo referencial si no hay API)
        // Por ahora usaremos un valor referencial de mercado ajustado por el dólar
        const silverGramUsd = 30.50 / onzaToGram // Precio aprox onza plata $30.50
        const silverGramPen = silverGramUsd * usdPen

        const data = {
            usdPen,
            goldPriceUsd,
            goldGram24k: goldGramPen24k,
            goldGram18k: goldGramPen18k,
            silverGram: silverGramPen,
            timestamp: Date.now()
        }

        // Guardar en cache (5 min)
        cache = { data, expires: Date.now() + 1000 * 60 * 5 }

        return data

    } catch (error) {
        console.error('Error fetching financial data:', error)
        // Retornar datos fallback si falla la API (Valores aprox Nov 2025)
        return {
            usdPen: 3.78,
            goldPriceUsd: 2650.00,
            goldGram24k: 322.05, // (2650 / 31.1035) * 3.78
            goldGram18k: 241.54,
            silverGram: 3.70,
            timestamp: Date.now()
        }
    }
}
