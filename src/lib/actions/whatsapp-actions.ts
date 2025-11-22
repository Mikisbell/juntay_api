'use server'

import { createClient } from '@supabase/supabase-js'
import { enviarWhatsApp } from '@/lib/utils/whatsapp'

// Mock store para códigos de verificación (en producción usar Redis o DB)
// Como las server actions son stateless, esto solo funcionará en memoria del proceso actual
// Para persistencia real necesitamos una tabla, pero por ahora simulemos
const verificationCodes = new Map<string, string>()

const getServiceClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

/**
 * Envía un código de verificación por WhatsApp
 */
export async function enviarCodigoWhatsapp(telefono: string) {
    // Validar formato (Perú: 9 dígitos, empieza con 9)
    const limpio = telefono.replace(/\D/g, '')
    if (!/^9\d{8}$/.test(limpio)) {
        return { success: false, error: 'Número de celular inválido. Debe tener 9 dígitos y empezar con 9.' }
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()

    // Guardar código (simulado en memoria por ahora)
    verificationCodes.set(limpio, codigo)

    // SIMULACIÓN DE ENVÍO WHATSAPP
    // Aquí iría la llamada a Twilio / Meta Cloud API
    console.log(`📲 [WHATSAPP MOCK] Enviando código ${codigo} al número ${limpio}`)

    // ---------------------------------------------------------
    // MODO RENDER (WAHA WHATSAPP HTTP API)
    // ---------------------------------------------------------
    let enviado = false
    try {
        console.log(`📲 [WHATSAPP RENDER] Intentando enviar a ${limpio} vía Render...`)

        const mensaje = `🔐 Tu código de verificación JUNTAY es: *${codigo}*\n\nNo lo compartas con nadie.`
        const resultado = await enviarWhatsApp(limpio, mensaje)

        if (resultado && !resultado.error) {
            console.log('✅ [WHATSAPP RENDER] Mensaje enviado exitosamente:', resultado)
            enviado = true
        } else {
            console.warn('⚠️ [WHATSAPP RENDER] Error:', resultado?.error || 'Error desconocido')
        }
    } catch (error) {
        console.warn('⚠️ [WHATSAPP RENDER] Error de conexión:', error)
    }

    // ---------------------------------------------------------
    // SIEMPRE RETORNAR ÉXITO (Para desarrollo y testing)
    // ---------------------------------------------------------
    // En desarrollo, siempre mostramos el código en consola
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📱 CÓDIGO DE VERIFICACIÓN WHATSAPP`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`Teléfono: +51${limpio}`)
    console.log(`Código:   ${codigo}`)
    console.log(`Estado:   ${enviado ? '✅ ENVIADO por WhatsApp' : '⚠️ SOLO EN CONSOLA (WhatsApp falló)'}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Si NO se envió, retornamos con debug_code para que la UI muestre alerta
    // Si SÍ se envió, retornamos sin debug_code (se assume que llegó al WhatsApp real)
    if (!enviado) {
        return {
            success: true,
            message: 'Código generado (revisa consola del servidor)',
            debug_code: codigo
        }
    }

    return {
        success: true,
        message: 'Código enviado por WhatsApp'
    }
}

/**
 * Verifica el código ingresado por el usuario
 */
export async function verificarCodigoWhatsapp(telefono: string, codigo: string) {
    const limpio = telefono.replace(/\D/g, '')

    // En producción, consultar DB/Redis
    const codigoGuardado = verificationCodes.get(limpio)

    if (!codigoGuardado) {
        return { success: false, error: 'El código ha expirado o no se ha solicitado.' }
    }

    if (codigoGuardado === codigo) {
        verificationCodes.delete(limpio) // Consumir código
        return { success: true, message: 'Teléfono verificado correctamente' }
    } else {
        return { success: false, error: 'Código incorrecto. Intente nuevamente.' }
    }
}
