'use server'

/**
 * Dashboard Gerencial - Flujo de Caja y Top Clientes
 * 
 * Queries read-only para gráficos y rankings.
 */

import { createClient } from '@/lib/supabase/server'

// ============ TYPES ============

export interface FlujoCajaDiario {
    fecha: string
    ingresos: number
    egresos: number
    neto: number
}

export interface TopCliente {
    id: string
    nombre: string
    total_pagado: number
    creditos_activos: number
    ultimo_pago: string | null
}

// ============ FLUJO DE CAJA ============

/**
 * Obtiene el flujo de caja de los últimos N días
 */
export async function obtenerFlujoCaja(dias: number = 30): Promise<FlujoCajaDiario[]> {
    const supabase = await createClient()
    const resultado: FlujoCajaDiario[] = []

    const hoy = new Date()

    for (let i = dias - 1; i >= 0; i--) {
        const fecha = new Date(hoy)
        fecha.setDate(fecha.getDate() - i)
        const fechaStr = fecha.toISOString().split('T')[0]

        // Ingresos del día (pagos recibidos)
        const { data: pagos } = await supabase
            .from('pagos')
            .select('monto')
            .gte('created_at', `${fechaStr}T00:00:00`)
            .lte('created_at', `${fechaStr}T23:59:59`)

        const ingresos = (pagos || []).reduce((sum, p) => sum + (p.monto || 0), 0)

        // Egresos del día (desembolsos de créditos)
        const { data: desembolsos } = await supabase
            .from('creditos')
            .select('monto')
            .gte('fecha_desembolso', `${fechaStr}T00:00:00`)
            .lte('fecha_desembolso', `${fechaStr}T23:59:59`)

        const egresos = (desembolsos || []).reduce((sum, c) => sum + (c.monto || 0), 0)

        resultado.push({
            fecha: fechaStr,
            ingresos,
            egresos,
            neto: ingresos - egresos
        })
    }

    return resultado
}

/**
 * Obtiene resumen semanal de flujo de caja
 */
export async function obtenerFlujoCajaSemanal(): Promise<{
    semanas: { semana: number; inicio: string; fin: string; ingresos: number; egresos: number; neto: number }[]
    totalIngresos: number
    totalEgresos: number
}> {
    const flujoDiario = await obtenerFlujoCaja(28) // 4 semanas

    const semanas: { semana: number; inicio: string; fin: string; ingresos: number; egresos: number; neto: number }[] = []

    for (let i = 0; i < 4; i++) {
        const inicioIdx = i * 7
        const finIdx = inicioIdx + 6
        const diasSemana = flujoDiario.slice(inicioIdx, finIdx + 1)

        if (diasSemana.length > 0) {
            semanas.push({
                semana: i + 1,
                inicio: diasSemana[0].fecha,
                fin: diasSemana[diasSemana.length - 1].fecha,
                ingresos: diasSemana.reduce((sum, d) => sum + d.ingresos, 0),
                egresos: diasSemana.reduce((sum, d) => sum + d.egresos, 0),
                neto: diasSemana.reduce((sum, d) => sum + d.neto, 0)
            })
        }
    }

    return {
        semanas,
        totalIngresos: flujoDiario.reduce((sum, d) => sum + d.ingresos, 0),
        totalEgresos: flujoDiario.reduce((sum, d) => sum + d.egresos, 0)
    }
}

// ============ TOP CLIENTES ============

/**
 * Obtiene los top 10 clientes por monto pagado
 */
export async function obtenerTop10Clientes(): Promise<TopCliente[]> {
    const supabase = await createClient()

    // Obtener pagos agrupados por cliente
    const { data: pagos, error } = await supabase
        .from('pagos')
        .select(`
            monto,
            created_at,
            creditos!inner(
                cliente_id,
                clientes!inner(id, nombres, apellido_paterno)
            )
        `)
        .order('created_at', { ascending: false })

    if (error || !pagos) {
        console.error('Error obteniendo pagos:', error)
        return []
    }

    // Agrupar por cliente
    const clienteMap = new Map<string, {
        nombre: string
        total: number
        ultimoPago: string
    }>()

    for (const pago of pagos) {
        const credito = pago.creditos as unknown as {
            cliente_id: string
            clientes: { id: string; nombres: string; apellido_paterno: string }
        }

        if (!credito?.clientes) continue

        const clienteId = credito.clientes.id
        const nombre = `${credito.clientes.nombres} ${credito.clientes.apellido_paterno}`

        const existing = clienteMap.get(clienteId)
        if (existing) {
            existing.total += pago.monto || 0
        } else {
            clienteMap.set(clienteId, {
                nombre,
                total: pago.monto || 0,
                ultimoPago: pago.created_at
            })
        }
    }

    // Convertir a array y ordenar
    const clientes = Array.from(clienteMap.entries())
        .map(([id, data]) => ({
            id,
            nombre: data.nombre,
            total_pagado: data.total,
            creditos_activos: 0, // Se llenará después
            ultimo_pago: data.ultimoPago
        }))
        .sort((a, b) => b.total_pagado - a.total_pagado)
        .slice(0, 10)

    // Obtener créditos activos para cada top cliente
    for (const cliente of clientes) {
        const { count } = await supabase
            .from('creditos')
            .select('id', { count: 'exact', head: true })
            .eq('cliente_id', cliente.id)
            .in('estado', ['vigente', 'por_vencer'])

        cliente.creditos_activos = count || 0
    }

    return clientes
}

// ============ KPIs CONSOLIDADOS ============

export interface KPIsGerenciales {
    carteraTotal: number
    carteraAlDia: number
    carteraPorVencer: number
    carteraEnMora: number
    tasaMora: number // Porcentaje
    ingresosMes: number
    egresosMes: number
    flujonetoMes: number
    clientesActivos: number
    creditosVigentes: number
}

/**
 * Obtiene KPIs consolidados para el dashboard gerencial
 */
export async function obtenerKPIsGerenciales(): Promise<KPIsGerenciales> {
    const supabase = await createClient()

    // Inicio del mes actual
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]

    // 1. Cartera total (saldo pendiente de créditos no cancelados)
    const { data: creditos } = await supabase
        .from('creditos')
        .select('saldo_pendiente, estado_detallado')
        .not('estado_detallado', 'in', '("cancelado","anulado","ejecutado")')

    const carteraTotal = (creditos || []).reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
    const creditosVigentes = creditos?.length || 0

    // 2. Cartera al día vs por vencer vs en mora
    const alDia = (creditos || []).filter(c =>
        ['vigente', 'al_dia'].includes(c.estado_detallado || '')
    )
    const porVencer = (creditos || []).filter(c =>
        ['por_vencer'].includes(c.estado_detallado || '')
    )
    const enMora = (creditos || []).filter(c =>
        ['vencido', 'en_mora', 'en_gracia', 'pre_remate', 'en_remate'].includes(c.estado_detallado || '')
    )

    const carteraAlDia = alDia.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
    const carteraPorVencer = porVencer.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
    const carteraEnMora = enMora.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
    const tasaMora = carteraTotal > 0 ? (carteraEnMora / carteraTotal) * 100 : 0

    // 3. Ingresos del mes (pagos)
    const { data: pagosMes } = await supabase
        .from('pagos')
        .select('monto')
        .gte('created_at', `${inicioMes}T00:00:00`)

    const ingresosMes = (pagosMes || []).reduce((sum, p) => sum + (p.monto || 0), 0)

    // 4. Egresos del mes (desembolsos)
    const { data: desembolsosMes } = await supabase
        .from('creditos')
        .select('monto')
        .gte('fecha_desembolso', `${inicioMes}T00:00:00`)

    const egresosMes = (desembolsosMes || []).reduce((sum, c) => sum + (c.monto || 0), 0)

    // 5. Clientes activos (con créditos vigentes)
    const { count: clientesActivos } = await supabase
        .from('creditos')
        .select('cliente_id', { count: 'exact', head: true })
        .not('estado_detallado', 'in', '("cancelado","anulado","ejecutado")')

    return {
        carteraTotal,
        carteraAlDia,
        carteraPorVencer,
        carteraEnMora,
        tasaMora: Math.round(tasaMora * 10) / 10,
        ingresosMes,
        egresosMes,
        flujonetoMes: ingresosMes - egresosMes,
        clientesActivos: clientesActivos || 0,
        creditosVigentes
    }
}

export interface ComparativaMensual {
    mesActual: { ingresos: number; egresos: number; neto: number; creditos: number }
    mesAnterior: { ingresos: number; egresos: number; neto: number; creditos: number }
    variacion: { ingresos: number; egresos: number; neto: number; creditos: number }
}

/**
 * Compara métricas del mes actual vs el anterior
 */
export async function obtenerComparativaMensual(): Promise<ComparativaMensual> {
    const supabase = await createClient()
    const hoy = new Date()

    const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)

    // Mes actual
    const { data: pagosActual } = await supabase
        .from('pagos')
        .select('monto')
        .gte('created_at', inicioMesActual.toISOString())

    const { data: creditosActual } = await supabase
        .from('creditos')
        .select('monto')
        .gte('fecha_desembolso', inicioMesActual.toISOString())

    const ingresosActual = (pagosActual || []).reduce((sum, p) => sum + (p.monto || 0), 0)
    const egresosActual = (creditosActual || []).reduce((sum, c) => sum + (c.monto || 0), 0)

    // Mes anterior
    const { data: pagosAnterior } = await supabase
        .from('pagos')
        .select('monto')
        .gte('created_at', inicioMesAnterior.toISOString())
        .lte('created_at', finMesAnterior.toISOString())

    const { data: creditosAnterior } = await supabase
        .from('creditos')
        .select('monto')
        .gte('fecha_desembolso', inicioMesAnterior.toISOString())
        .lte('fecha_desembolso', finMesAnterior.toISOString())

    const ingresosAnterior = (pagosAnterior || []).reduce((sum, p) => sum + (p.monto || 0), 0)
    const egresosAnterior = (creditosAnterior || []).reduce((sum, c) => sum + (c.monto || 0), 0)

    // Calcular variaciones porcentuales
    const calcVariacion = (actual: number, anterior: number) =>
        anterior > 0 ? ((actual - anterior) / anterior) * 100 : 0

    return {
        mesActual: {
            ingresos: ingresosActual,
            egresos: egresosActual,
            neto: ingresosActual - egresosActual,
            creditos: creditosActual?.length || 0
        },
        mesAnterior: {
            ingresos: ingresosAnterior,
            egresos: egresosAnterior,
            neto: ingresosAnterior - egresosAnterior,
            creditos: creditosAnterior?.length || 0
        },
        variacion: {
            ingresos: Math.round(calcVariacion(ingresosActual, ingresosAnterior) * 10) / 10,
            egresos: Math.round(calcVariacion(egresosActual, egresosAnterior) * 10) / 10,
            neto: Math.round(calcVariacion(ingresosActual - egresosActual, ingresosAnterior - egresosAnterior) * 10) / 10,
            creditos: Math.round(calcVariacion(creditosActual?.length || 0, creditosAnterior?.length || 0) * 10) / 10
        }
    }
}

