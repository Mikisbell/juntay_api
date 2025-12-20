'use server'

/**
 * Scoring de Cliente
 * 
 * Sistema de puntuación basado en historial de pagos.
 * 
 * Factores del puntaje (0-100):
 * - Pagos a tiempo: +5 por cada pago
 * - Pagos atrasados: -3 por cada día de atraso
 * - Antigüedad: +1 por cada mes de cliente
 * - Créditos completados: +10 por cada uno
 * - Monto total pagado: bonus por volumen
 * 
 * Categorías:
 * - VIP (85-100): Tasas preferenciales
 * - BUENO (70-84): Cliente confiable
 * - REGULAR (50-69): Cliente normal
 * - RIESGOSO (0-49): Requiere atención
 */

import { createClient } from '@/lib/supabase/server'

// ============ TYPES ============

export type CategoriaCliente = 'VIP' | 'BUENO' | 'REGULAR' | 'RIESGOSO'

export interface ScoringCliente {
    clienteId: string
    puntaje: number
    categoria: CategoriaCliente
    detalles: {
        pagosATiempo: number
        pagosAtrasados: number
        diasAtrasoTotal: number
        creditosCompletados: number
        antiguedadMeses: number
        montoTotalPagado: number
    }
    factoresPositivos: string[]
    factoresNegativos: string[]
    tasaSugerida: number  // % de descuento sugerido
    fechaCalculo: string
}

export interface AlertaRiesgo {
    clienteId: string
    clienteNombre: string
    puntaje: number
    razon: string
    urgencia: 'alta' | 'media' | 'baja'
}

// ============ ALGORITMO DE SCORING ============

/**
 * Calcula el puntaje de un cliente
 */
export async function calcularScoringCliente(clienteId: string): Promise<ScoringCliente> {
    const supabase = await createClient()

    // 1. Obtener datos del cliente
    const { data: cliente } = await supabase
        .from('clientes')
        .select('created_at')
        .eq('id', clienteId)
        .single()

    const antiguedadMeses = cliente?.created_at
        ? Math.floor((Date.now() - new Date(cliente.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 0

    // 2. Obtener créditos del cliente
    const { data: creditos } = await supabase
        .from('creditos')
        .select('id, estado, fecha_vencimiento, monto')
        .eq('cliente_id', clienteId)

    const creditosCompletados = (creditos || []).filter(c => c.estado === 'cancelado').length

    // 3. Obtener historial de pagos
    const creditoIds = (creditos || []).map(c => c.id)

    let pagosATiempo = 0
    let pagosAtrasados = 0
    let diasAtrasoTotal = 0
    let montoTotalPagado = 0

    if (creditoIds.length > 0) {
        const { data: pagos } = await supabase
            .from('pagos')
            .select('created_at, monto, credito_id')
            .in('credito_id', creditoIds)

        for (const pago of (pagos || [])) {
            montoTotalPagado += pago.monto || 0

            // Buscar el crédito correspondiente para ver si fue a tiempo
            const credito = (creditos || []).find(c => c.id === pago.credito_id)
            if (credito) {
                const fechaPago = new Date(pago.created_at)
                const fechaVenc = new Date(credito.fecha_vencimiento)

                if (fechaPago <= fechaVenc) {
                    pagosATiempo++
                } else {
                    pagosAtrasados++
                    const diasAtraso = Math.floor((fechaPago.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24))
                    diasAtrasoTotal += diasAtraso
                }
            }
        }
    }

    // 4. Calcular puntaje
    let puntaje = 50 // Base

    // Factores positivos
    puntaje += pagosATiempo * 5        // +5 por pago a tiempo
    puntaje += creditosCompletados * 10 // +10 por crédito completado
    puntaje += Math.min(antiguedadMeses, 24) // +1 por mes, máx 24

    // Bonus por volumen
    if (montoTotalPagado > 10000) puntaje += 5
    if (montoTotalPagado > 50000) puntaje += 5
    if (montoTotalPagado > 100000) puntaje += 5

    // Factores negativos
    puntaje -= pagosAtrasados * 3      // -3 por pago atrasado
    puntaje -= Math.min(diasAtrasoTotal, 30) // -1 por día de atraso, máx -30

    // Normalizar 0-100
    puntaje = Math.max(0, Math.min(100, puntaje))

    // 5. Determinar categoría
    let categoria: CategoriaCliente
    if (puntaje >= 85) categoria = 'VIP'
    else if (puntaje >= 70) categoria = 'BUENO'
    else if (puntaje >= 50) categoria = 'REGULAR'
    else categoria = 'RIESGOSO'

    // 6. Calcular tasa sugerida (0-5% descuento)
    let tasaSugerida = 0
    if (categoria === 'VIP') tasaSugerida = 5
    else if (categoria === 'BUENO') tasaSugerida = 2

    // 7. Generar factores
    const factoresPositivos: string[] = []
    const factoresNegativos: string[] = []

    if (pagosATiempo > 5) factoresPositivos.push(`${pagosATiempo} pagos a tiempo`)
    if (creditosCompletados > 0) factoresPositivos.push(`${creditosCompletados} créditos completados`)
    if (antiguedadMeses > 6) factoresPositivos.push(`${antiguedadMeses} meses de antigüedad`)
    if (montoTotalPagado > 10000) factoresPositivos.push(`S/ ${montoTotalPagado.toFixed(0)} pagado en total`)

    if (pagosAtrasados > 0) factoresNegativos.push(`${pagosAtrasados} pagos atrasados`)
    if (diasAtrasoTotal > 0) factoresNegativos.push(`${diasAtrasoTotal} días de atraso acumulados`)

    return {
        clienteId,
        puntaje,
        categoria,
        detalles: {
            pagosATiempo,
            pagosAtrasados,
            diasAtrasoTotal,
            creditosCompletados,
            antiguedadMeses,
            montoTotalPagado
        },
        factoresPositivos,
        factoresNegativos,
        tasaSugerida,
        fechaCalculo: new Date().toISOString()
    }
}

// ============ ALERTAS DE RIESGO ============

/**
 * Obtiene clientes riesgosos para alertas
 */
export async function obtenerClientesRiesgosos(): Promise<AlertaRiesgo[]> {
    const supabase = await createClient()

    // Obtener clientes con créditos activos
    const { data: creditosActivos } = await supabase
        .from('creditos')
        .select(`
            cliente_id,
            clientes!inner(id, nombres, apellido_paterno)
        `)
        .in('estado', ['vigente', 'vencido', 'en_mora'])

    if (!creditosActivos) return []

    // Obtener IDs únicos de clientes
    const clienteIds = [...new Set(creditosActivos.map(c => c.cliente_id))]

    const alertas: AlertaRiesgo[] = []

    for (const clienteId of clienteIds.slice(0, 20)) { // Limitar a 20 para performance
        const scoring = await calcularScoringCliente(clienteId)

        if (scoring.categoria === 'RIESGOSO') {
            const credito = creditosActivos.find(c => c.cliente_id === clienteId)
            const cliente = credito?.clientes as unknown as { nombres: string; apellido_paterno: string } | null

            let razon = 'Puntaje bajo'
            let urgencia: 'alta' | 'media' | 'baja' = 'media'

            if (scoring.detalles.diasAtrasoTotal > 30) {
                razon = `${scoring.detalles.diasAtrasoTotal} días de atraso`
                urgencia = 'alta'
            } else if (scoring.detalles.pagosAtrasados > 3) {
                razon = `${scoring.detalles.pagosAtrasados} pagos atrasados`
                urgencia = 'alta'
            } else if (scoring.puntaje < 30) {
                razon = 'Historial muy bajo'
                urgencia = 'media'
            }

            alertas.push({
                clienteId,
                clienteNombre: cliente ? `${cliente.nombres} ${cliente.apellido_paterno}` : 'N/A',
                puntaje: scoring.puntaje,
                razon,
                urgencia
            })
        }
    }

    return alertas.sort((a, b) => a.puntaje - b.puntaje)
}

// ============ HELPER PARA TASAS VIP ============

/**
 * Obtiene el descuento de tasa para un cliente
 */
export async function obtenerDescuentoTasaCliente(clienteId: string): Promise<{
    descuento: number
    categoria: CategoriaCliente
}> {
    const scoring = await calcularScoringCliente(clienteId)
    return {
        descuento: scoring.tasaSugerida,
        categoria: scoring.categoria
    }
}
