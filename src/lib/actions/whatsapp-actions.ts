'use server'

import { createClient } from '@supabase/supabase-js'
import { sendMessage } from '@/lib/actions/waha-actions'

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

    try {
        const supabase = getServiceClient()

        // Limpiar códigos anteriores del mismo número (no verificados)
        await supabase
            .from('verificacion_whatsapp')
            .delete()
            .eq('telefono', limpio)
            .eq('verificado', false)

        // Guardar nuevo código en BD con expiración de 5 minutos
        const expiraEn = new Date(Date.now() + 5 * 60 * 1000) // 5 minutos

        const { error: dbError } = await supabase
            .from('verificacion_whatsapp')
            .insert({
                telefono: limpio,
                codigo: codigo,
                expira_en: expiraEn.toISOString(),
                verificado: false
            })

        if (dbError) {
            console.error('Error guardando código en BD:', dbError)
            return { success: false, error: 'Error guardando código de verificación' }
        }

        // Enviar código por WhatsApp usando WAHA
        const mensaje = `🔐 Tu código de verificación JUNTAY es: *${codigo}*\n\nVálido por 5 minutos.\nNo lo compartas con nadie.`

        const resultado = await sendMessage(limpio, mensaje)

        if (!resultado.success) {
            console.error('Error enviando WhatsApp:', resultado.error)
            return { success: false, error: 'Error enviando mensaje de WhatsApp. Verifica que el servicio esté conectado.' }
        }

        console.log(`✅ Código ${codigo} enviado a ${limpio}`)
        return {
            success: true,
            message: 'Código enviado por WhatsApp'
        }

    } catch (error) {
        console.error('Error en enviarCodigoWhatsapp:', error)
        return { success: false, error: 'Error de conexión' }
    }
}

/**
 * Verifica el código ingresado por el usuario
 */
export async function verificarCodigoWhatsapp(telefono: string, codigo: string) {
    const limpio = telefono.replace(/\D/g, '')

    try {
        const supabase = getServiceClient()

        // Buscar código válido (no expirado, no verificado)
        const { data, error } = await supabase
            .from('verificacion_whatsapp')
            .select('*')
            .eq('telefono', limpio)
            .eq('codigo', codigo)
            .eq('verificado', false)
            .gt('expira_en', new Date().toISOString())
            .order('creado_en', { ascending: false })
            .limit(1)
            .single()

        if (error || !data) {
            return { success: false, error: 'Código incorrecto o expirado.' }
        }

        // Marcar como verificado
        await supabase
            .from('verificacion_whatsapp')
            .update({ verificado: true })
            .eq('id', data.id)

        return { success: true, message: 'Teléfono verificado correctamente' }

    } catch (error) {
        console.error('Error verificando código:', error)
        return { success: false, error: 'Error verificando código' }
    }
}

// ============================================
// MENSAJES A CLIENTES
// ============================================

/**
 * Envía un mensaje personalizado a un cliente
 */
export async function enviarMensajeCliente(
    telefono: string,
    mensaje: string,
    nombreCliente?: string
) {
    const limpio = telefono.replace(/\D/g, '')

    if (!limpio || limpio.length < 9) {
        return { success: false, error: 'Número de teléfono inválido' }
    }

    try {
        // Personalizar mensaje si tiene nombre
        const mensajeFinal = nombreCliente
            ? `Hola ${nombreCliente},\n\n${mensaje}\n\n— JUNTAY Financiera`
            : `${mensaje}\n\n— JUNTAY Financiera`

        const resultado = await sendMessage(limpio, mensajeFinal)

        if (!resultado.success) {
            return { success: false, error: 'Error enviando mensaje. Verifica que WhatsApp esté conectado.' }
        }

        console.log(`✅ Mensaje enviado a ${limpio}`)
        return { success: true, message: 'Mensaje enviado correctamente' }

    } catch (error) {
        console.error('Error en enviarMensajeCliente:', error)
        return { success: false, error: 'Error de conexión' }
    }
}

/**
 * Envía un recordatorio de pago al cliente
 */
export async function enviarRecordatorioCliente(
    telefono: string,
    nombreCliente: string,
    codigoCredito: string,
    diasRestantes: number,
    montoPendiente: number
) {
    const limpio = telefono.replace(/\D/g, '')

    if (!limpio || limpio.length < 9) {
        return { success: false, error: 'Número de teléfono inválido' }
    }

    try {
        let mensaje: string

        if (diasRestantes > 0) {
            mensaje = `🔔 *Recordatorio de Pago*\n\nHola ${nombreCliente},\n\nTu crédito *#${codigoCredito}* vence en *${diasRestantes} día${diasRestantes > 1 ? 's' : ''}*.\n\n💰 Monto pendiente: *S/ ${montoPendiente.toFixed(2)}*\n\n¿Deseas renovar o cancelar? Responde a este mensaje.\n\n— JUNTAY Financiera`
        } else if (diasRestantes === 0) {
            mensaje = `⚠️ *¡Tu crédito vence HOY!*\n\nHola ${nombreCliente},\n\nTu crédito *#${codigoCredito}* vence *hoy*.\n\n💰 Monto a pagar: *S/ ${montoPendiente.toFixed(2)}*\n\nEvita recargos, contáctanos ahora.\n\n— JUNTAY Financiera`
        } else {
            mensaje = `🚨 *AVISO URGENTE*\n\nHola ${nombreCliente},\n\nTu crédito *#${codigoCredito}* está *VENCIDO* hace ${Math.abs(diasRestantes)} día${Math.abs(diasRestantes) > 1 ? 's' : ''}.\n\n💰 Monto pendiente: *S/ ${montoPendiente.toFixed(2)}*\n\n⚠️ Tu garantía podría ir a remate. Contáctanos urgente.\n\n— JUNTAY Financiera`
        }

        const resultado = await sendMessage(limpio, mensaje)

        if (!resultado.success) {
            return { success: false, error: 'Error enviando recordatorio. Verifica que WhatsApp esté conectado.' }
        }

        console.log(`✅ Recordatorio enviado a ${limpio} (${diasRestantes} días)`)
        return { success: true, message: 'Recordatorio enviado correctamente' }

    } catch (error) {
        console.error('Error en enviarRecordatorioCliente:', error)
        return { success: false, error: 'Error de conexión' }
    }
}
