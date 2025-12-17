'use server'

/**
 * Análisis de Imagen con IA para Tasación
 * 
 * Este módulo analiza fotos de bienes empeñados para:
 * - Detectar categoría del artículo
 * - Identificar marca/modelo si es visible
 * - Evaluar estado visual (rayones, daños, etc.)
 * 
 * OPCIONES GRATUITAS (2025):
 * 1. GOOGLE_GEMINI_API_KEY - 60 req/min GRATIS ⭐ RECOMENDADO
 * 2. HUGGINGFACE_API_KEY - 300 req/hora gratis
 * 3. OPENAI_API_KEY - Pago (~$0.01/imagen)
 */

import { CATEGORIAS_BIENES } from '../constants/categorias-bienes'

export interface AnalisisImagenResult {
    success: boolean
    sugerencias?: {
        categoria: string
        categoriaConfianza: number // 0-100
        subcategoria?: string
        marca?: string
        modelo?: string
        estadoVisual?: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO'
        detalles?: {
            defectos: string[] // ej: "pantalla rayada", "abolladura esquina"
            accesorios: string[] // ej: "cargador original", "caja", "manuales"
        }
        observaciones?: string[]
    }
    error?: string
    apiUsada?: 'gemini' | 'huggingface' | 'openai' | 'mock'
}

/**
 * Analiza una imagen de un bien para sugerir categoría, marca, modelo y estado
 */
export async function analizarImagenBien(
    imagenBase64: string,
    mimeType: string = 'image/jpeg'
): Promise<AnalisisImagenResult> {

    // PRIORIDAD 1: Google Gemini (GRATIS - 60 req/min)
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (geminiKey) {
        return analizarConGemini(imagenBase64, mimeType, geminiKey)
    }

    // PRIORIDAD 2: Hugging Face (GRATIS - 300 req/hora)
    const hfKey = process.env.HUGGINGFACE_API_KEY
    if (hfKey) {
        return analizarConHuggingFace(imagenBase64, hfKey)
    }

    // PRIORIDAD 3: OpenAI (pago)
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
        return analizarConOpenAI(imagenBase64, mimeType, openaiKey)
    }

    // Sin API configurada
    console.warn('[analizarImagenBien] No hay API de visión configurada.')
    return {
        success: true,
        apiUsada: 'mock',
        sugerencias: {
            categoria: 'electronica',
            categoriaConfianza: 0,
            observaciones: ['Configure GOOGLE_GEMINI_API_KEY (GRATIS) en https://aistudio.google.com/apikey']
        }
    }
}

/**
 * Análisis usando Google Gemini (GRATIS - 60 req/min)
 * https://aistudio.google.com/apikey
 */
async function analizarConGemini(
    imagenBase64: string,
    mimeType: string,
    apiKey: string
): Promise<AnalisisImagenResult> {
    // Generar lista de subcategorías para el prompt
    const todasLasSubcategorias = CATEGORIAS_BIENES.flatMap(c => c.subcategorias.map(s => s.value)).join('|')

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: `Eres un tasador experto en una casa de empeño peruana.
                                Analiza esta imagen del artículo y responde SOLO en JSON con este formato exacto:
                                {
                                    "categoria": "electronica|electrodomesticos|vehiculos|joyas_oro|herramientas|otro",
                                    "categoriaConfianza": 0-100,
                                    "subcategoria": "${todasLasSubcategorias}",
                                    "marca": "marca si es visible o null",
                                    "modelo": "modelo si es visible o null",
                                    "estadoVisual": "EXCELENTE|BUENO|REGULAR|MALO",
                                    "detalles": {
                                        "defectos": ["lista corta de defectos visuales visibles como: pantalla rayada, golpe en borde, desgaste teclas"],
                                        "accesorios": ["lista de accesorios visibles en la foto como: cargador, caja, control remoto"]
                                    },
                                    "observaciones": ["resumen narrativo"]
                                }
                                IMPORTANTE: Usa la subcategoria exacta de la lista (ej: "celular", "laptop", "refrigeradora").`
                            },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: imagenBase64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 500
                    }
                })
            }
        )

        if (!response.ok) {
            const error = await response.text()
            console.error('[Gemini Vision] Error:', error)
            return { success: false, error: `Error Gemini: ${response.status}` }
        }

        const data = await response.json()
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!content) {
            return { success: false, error: 'Respuesta vacía de Gemini' }
        }

        // Parsear JSON de la respuesta
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return { success: false, error: 'Respuesta no contiene JSON válido' }
        }

        const sugerencias = JSON.parse(jsonMatch[0])

        return {
            success: true,
            apiUsada: 'gemini',
            sugerencias
        }

    } catch (error) {
        console.error('[Gemini Vision] Exception:', error)
        return { success: false, error: `Exception: ${error}` }
    }
}

/**
 * Análisis usando Hugging Face (GRATIS - 300 req/hora)
 */
async function analizarConHuggingFace(
    imagenBase64: string,
    apiKey: string
): Promise<AnalisisImagenResult> {
    try {
        const response = await fetch(
            'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: imagenBase64 })
            }
        )

        if (!response.ok) {
            return { success: false, error: `Error HuggingFace: ${response.status}` }
        }

        const results = await response.json()
        const topLabel = results[0]?.label || 'unknown'
        const confidence = Math.round((results[0]?.score || 0) * 100)

        return {
            success: true,
            apiUsada: 'huggingface',
            sugerencias: {
                categoria: mapearLabelACategoria(topLabel),
                categoriaConfianza: confidence,
                observaciones: [`Detectado: ${topLabel}`]
            }
        }

    } catch (error) {
        console.error('[HuggingFace Vision] Exception:', error)
        return { success: false, error: `Exception: ${error}` }
    }
}

function mapearLabelACategoria(label: string): string {
    const l = label.toLowerCase()
    if (l.includes('phone') || l.includes('laptop') || l.includes('computer')) return 'electronica'
    if (l.includes('refrigerator') || l.includes('washer') || l.includes('microwave')) return 'electrodomesticos'
    if (l.includes('car') || l.includes('motorcycle') || l.includes('bicycle')) return 'vehiculos'
    if (l.includes('ring') || l.includes('necklace') || l.includes('watch')) return 'joyas_oro'
    if (l.includes('drill') || l.includes('hammer') || l.includes('saw')) return 'herramientas'
    return 'otro'
}

/**
 * Análisis usando OpenAI (PAGO - ~$0.01/imagen)
 */
async function analizarConOpenAI(
    imagenBase64: string,
    mimeType: string,
    apiKey: string
): Promise<AnalisisImagenResult> {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Eres un tasador experto.Responde SOLO en JSON:
                            { "categoria": "electronica|electrodomesticos|vehiculos|joyas_oro|herramientas|otro", "categoriaConfianza": 0 - 100, "marca": "..", "modelo": "..", "estadoVisual": "EXCELENTE|BUENO|REGULAR|MALO", "observaciones": [".."] }`
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Analiza este artículo para empeño.' },
                            { type: 'image_url', image_url: { url: `data: ${mimeType}; base64, ${imagenBase64}`, detail: 'low' } }
                        ]
                    }
                ],
                max_tokens: 300
            })
        })

        if (!response.ok) {
            return { success: false, error: `Error OpenAI: ${response.status}` }
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content
        const jsonMatch = content?.match(/\{[\s\S]*\}/)

        if (!jsonMatch) {
            return { success: false, error: 'Respuesta inválida de OpenAI' }
        }

        return {
            success: true,
            apiUsada: 'openai',
            sugerencias: JSON.parse(jsonMatch[0])
        }

    } catch (error) {
        return { success: false, error: `Exception: ${error}` }
    }
}
