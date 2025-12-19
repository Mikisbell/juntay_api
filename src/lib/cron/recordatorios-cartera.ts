'use server'

/**
 * Cron Job para Recordatorios Automáticos de Cartera
 * 
 * Envía recordatorios por WhatsApp a clientes con créditos:
 * - Vencidos (días > 0)
 * - Vence HOY (días = 0)
 * - Vence mañana (días = -1)
 * 
 * Características:
 * - Idempotente: no envía duplicados el mismo día
 * - Loggable: registra todo en notificaciones_enviadas
 * - Reusable: puede ejecutarse manualmente
 */

import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/actions/waha-actions'

// Tipos
interface ContratoParaRecordatorio {
    id: string
    codigo: string
    cliente_id: string
    cliente_nombre: string
    cliente_telefono: string | null
    monto: number
    saldo: number
    fecha_vencimiento: string
    dias_vencido: number
}

type TipoRecordatorio = 'VENCIDO' | 'VENCE_HOY' | 'VENCE_MANANA'

interface ResultadoEjecucion {
    total_procesados: number
    enviados_exitosos: number
    errores: number
    omitidos_sin_telefono: number
    omitidos_ya_notificados: number
    detalles: {
        codigo: string
        tipo: TipoRecordatorio
        resultado: 'enviado' | 'error' | 'omitido'
        razon?: string
    }[]
}

/**
 * Obtiene los contratos que necesitan recordatorio
 */
async function obtenerContratosParaRecordatorio(): Promise<ContratoParaRecordatorio[]> {
    const supabase = await createClient()

    // Usar RPC existente para obtener vencimientos
    const { data, error } = await supabase.rpc('get_contratos_vencimientos', { p_dias: 30 })

    if (error) {
        console.error('Error obteniendo contratos:', error)
        return []
    }

    // Filtrar solo los que necesitan recordatorio (vencidos, hoy, mañana)
    return (data || [])
        .filter((c: { dias_restantes: number }) => c.dias_restantes <= 1) // -1, 0, o positivo (vencido)
        .map((c: {
            id: string
            codigo: string
            cliente_id: string
            cliente: string
            telefono: string | null
            monto: string | number
            saldo: string | number
            fecha_vencimiento: string
            dias_restantes: string | number
        }) => ({
            id: c.id,
            codigo: c.codigo,
            cliente_id: c.cliente_id,
            cliente_nombre: c.cliente,
            cliente_telefono: c.telefono,
            monto: Number(c.monto),
            saldo: Number(c.saldo),
            fecha_vencimiento: c.fecha_vencimiento,
            dias_vencido: -Number(c.dias_restantes) // Invertir: dias_restantes negativos = vencido
        }))
}

/**
 * Verifica si ya se envió notificación hoy para este crédito
 */
async function yaNotificadoHoy(creditoId: string): Promise<boolean> {
    const supabase = await createClient()

    const hoy = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('notificaciones_enviadas')
        .select('id')
        .eq('credito_id', creditoId)
        .eq('tipo_notificacion', 'RECORDATORIO_AUTOMATICO')
        .gte('created_at', `${hoy}T00:00:00`)
        .lte('created_at', `${hoy}T23:59:59`)
        .limit(1)

    if (error) {
        console.error('Error verificando notificación:', error)
        return false // En caso de error, permitir envío
    }

    return (data?.length || 0) > 0
}

/**
 * Determina el tipo de recordatorio basado en días vencidos
 */
function getTipoRecordatorio(diasVencido: number): TipoRecordatorio {
    if (diasVencido > 0) return 'VENCIDO'
    if (diasVencido === 0) return 'VENCE_HOY'
    return 'VENCE_MANANA'
}

/**
 * Genera el mensaje de recordatorio según el tipo
 */
function generarMensaje(contrato: ContratoParaRecordatorio, tipo: TipoRecordatorio): string {
    const nombre = contrato.cliente_nombre.split(' ')[0] // Solo primer nombre
    const monto = contrato.saldo.toFixed(2)

    switch (tipo) {
        case 'VENCIDO':
            return `⚠️ *CRÉDITO VENCIDO*

Hola ${nombre},

Tu crédito *${contrato.codigo}* presenta *${contrato.dias_vencido} día${contrato.dias_vencido > 1 ? 's' : ''} de atraso*.

💰 Monto pendiente: *S/ ${monto}*

Por favor acércate a regularizarlo para evitar recargos.

— JUNTAY Financiera`

        case 'VENCE_HOY':
            return `🔔 *RECORDATORIO DE PAGO*

Hola ${nombre},

Tu crédito *${contrato.codigo}* vence *HOY*.

💰 Monto a pagar: *S/ ${monto}*

Evita mora, realiza tu pago hoy.

— JUNTAY Financiera`

        case 'VENCE_MANANA':
            return `📅 *AVISO PREVENTIVO*

Hola ${nombre},

Tu crédito *${contrato.codigo}* vence *mañana*.

💰 Monto a pagar: *S/ ${monto}*

Te esperamos para renovar o cancelar.

— JUNTAY Financiera`
    }
}

/**
 * Registra el envío de recordatorio en el historial
 */
async function registrarRecordatorio(
    contrato: ContratoParaRecordatorio,
    tipo: TipoRecordatorio,
    exito: boolean,
    error?: string
) {
    const supabase = await createClient()

    await supabase.from('notificaciones_enviadas').insert({
        credito_id: contrato.id,
        cliente_id: contrato.cliente_id,
        tipo_notificacion: 'RECORDATORIO_AUTOMATICO',
        mensaje: `${tipo}: Crédito ${contrato.codigo} - S/${contrato.saldo.toFixed(2)}`,
        telefono_destino: contrato.cliente_telefono || '',
        enviado_por: null, // Automático
        estado: exito ? 'enviado' : 'error',
        medio: 'whatsapp',
        metadata: {
            tipo_recordatorio: tipo,
            dias_vencido: contrato.dias_vencido,
            codigo_credito: contrato.codigo,
            monto_pendiente: contrato.saldo,
            error: error || null
        }
    })
}

/**
 * Ejecuta el cron de recordatorios de cartera
 * 
 * Esta función es idempotente y puede llamarse múltiples veces al día
 * sin enviar duplicados.
 * 
 * @returns Resultado de la ejecución con estadísticas
 */
export async function runRecordatoriosCartera(): Promise<ResultadoEjecucion> {
    console.log('🔔 Iniciando cron de recordatorios de cartera...')
    const inicio = Date.now()

    const resultado: ResultadoEjecucion = {
        total_procesados: 0,
        enviados_exitosos: 0,
        errores: 0,
        omitidos_sin_telefono: 0,
        omitidos_ya_notificados: 0,
        detalles: []
    }

    try {
        // 1. Obtener contratos que necesitan recordatorio
        const contratos = await obtenerContratosParaRecordatorio()
        resultado.total_procesados = contratos.length

        console.log(`📋 Encontrados ${contratos.length} contratos para procesar`)

        // 2. Procesar cada contrato
        for (const contrato of contratos) {
            const tipo = getTipoRecordatorio(contrato.dias_vencido)

            // Verificar teléfono
            if (!contrato.cliente_telefono) {
                resultado.omitidos_sin_telefono++
                resultado.detalles.push({
                    codigo: contrato.codigo,
                    tipo,
                    resultado: 'omitido',
                    razon: 'Sin teléfono registrado'
                })
                continue
            }

            // Verificar si ya se notificó hoy
            if (await yaNotificadoHoy(contrato.id)) {
                resultado.omitidos_ya_notificados++
                resultado.detalles.push({
                    codigo: contrato.codigo,
                    tipo,
                    resultado: 'omitido',
                    razon: 'Ya notificado hoy'
                })
                continue
            }

            // Generar y enviar mensaje
            const mensaje = generarMensaje(contrato, tipo)
            const resultadoEnvio = await sendMessage(contrato.cliente_telefono, mensaje)

            if (resultadoEnvio.success) {
                resultado.enviados_exitosos++
                resultado.detalles.push({
                    codigo: contrato.codigo,
                    tipo,
                    resultado: 'enviado'
                })
                await registrarRecordatorio(contrato, tipo, true)
                console.log(`✅ ${contrato.codigo} → ${contrato.cliente_telefono} (${tipo})`)
            } else {
                resultado.errores++
                resultado.detalles.push({
                    codigo: contrato.codigo,
                    tipo,
                    resultado: 'error',
                    razon: resultadoEnvio.error
                })
                await registrarRecordatorio(contrato, tipo, false, resultadoEnvio.error)
                console.log(`❌ ${contrato.codigo} → Error: ${resultadoEnvio.error}`)
            }

            // Pequeño delay para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 500))
        }

    } catch (error) {
        console.error('Error en cron de recordatorios:', error)
    }

    const duracion = ((Date.now() - inicio) / 1000).toFixed(2)
    console.log(`✅ Cron completado en ${duracion}s:`)
    console.log(`   - Procesados: ${resultado.total_procesados}`)
    console.log(`   - Enviados: ${resultado.enviados_exitosos}`)
    console.log(`   - Errores: ${resultado.errores}`)
    console.log(`   - Sin teléfono: ${resultado.omitidos_sin_telefono}`)
    console.log(`   - Ya notificados: ${resultado.omitidos_ya_notificados}`)

    return resultado
}

/**
 * Versión de prueba que no envía mensajes reales
 * Solo simula el proceso y genera estadísticas
 */
export async function runRecordatoriosCarteraDryRun(): Promise<ResultadoEjecucion> {
    console.log('🔔 [DRY RUN] Simulando cron de recordatorios...')

    const resultado: ResultadoEjecucion = {
        total_procesados: 0,
        enviados_exitosos: 0,
        errores: 0,
        omitidos_sin_telefono: 0,
        omitidos_ya_notificados: 0,
        detalles: []
    }

    const contratos = await obtenerContratosParaRecordatorio()
    resultado.total_procesados = contratos.length

    for (const contrato of contratos) {
        const tipo = getTipoRecordatorio(contrato.dias_vencido)

        if (!contrato.cliente_telefono) {
            resultado.omitidos_sin_telefono++
            resultado.detalles.push({
                codigo: contrato.codigo,
                tipo,
                resultado: 'omitido',
                razon: 'Sin teléfono'
            })
        } else if (await yaNotificadoHoy(contrato.id)) {
            resultado.omitidos_ya_notificados++
            resultado.detalles.push({
                codigo: contrato.codigo,
                tipo,
                resultado: 'omitido',
                razon: 'Ya notificado hoy'
            })
        } else {
            resultado.enviados_exitosos++
            resultado.detalles.push({
                codigo: contrato.codigo,
                tipo,
                resultado: 'enviado'
            })
            console.log(`[DRY] ${contrato.codigo} → ${contrato.cliente_telefono} (${tipo})`)
        }
    }

    console.log(`[DRY RUN] Resultado simulado:`, resultado)
    return resultado
}
