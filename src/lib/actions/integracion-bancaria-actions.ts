'use server'

/**
 * Integración Bancaria
 * 
 * - Lectura de estados de cuenta
 * - Conciliación automática de pagos
 * - Alertas de depósitos
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============ TYPES ============

export type EstadoTransaccion = 'pendiente' | 'conciliado' | 'ignorado'
export type TipoBanco = 'bcp' | 'interbank' | 'bbva' | 'scotiabank' | 'otro'

export interface TransaccionBancaria {
    id: string
    banco: TipoBanco
    fecha: string
    descripcion: string
    referencia?: string
    monto: number
    estado: EstadoTransaccion
    pagoRelacionadoId?: string
    creditoRelacionadoId?: string
    clienteNombre?: string
    createdAt: string
}

export interface SugerenciaConciliacion {
    transaccionId: string
    pagoId: string
    creditoId: string
    creditoCodigo: string
    clienteNombre: string
    montoPago: number
    confianza: number  // 0-100
    razon: string
}

export interface ResumenBancario {
    depositosHoy: number
    montoPendienteConciliar: number
    transaccionesPendientes: number
    ultimaConciliacion: string | null
}

// ============ IMPORTACIÓN ============

/**
 * Importa transacciones desde un array de datos parseados
 */
export async function importarTransacciones(
    banco: TipoBanco,
    transacciones: Array<{
        fecha: string
        descripcion: string
        referencia?: string
        monto: number
    }>
): Promise<{ success: boolean; importadas: number; duplicadas: number; error?: string }> {
    const supabase = await createClient()

    let importadas = 0
    let duplicadas = 0

    for (const tx of transacciones) {
        // Verificar duplicados por fecha + monto + referencia
        const { data: existente } = await supabase
            .from('transacciones_bancarias')
            .select('id')
            .eq('banco', banco)
            .eq('fecha', tx.fecha)
            .eq('monto', tx.monto)
            .eq('referencia', tx.referencia || '')
            .single()

        if (existente) {
            duplicadas++
            continue
        }

        const { error } = await supabase
            .from('transacciones_bancarias')
            .insert({
                banco,
                fecha: tx.fecha,
                descripcion: tx.descripcion,
                referencia: tx.referencia || '',
                monto: tx.monto,
                estado: 'pendiente'
            })

        if (!error) {
            importadas++
        }
    }

    revalidatePath('/dashboard/banco')
    return { success: true, importadas, duplicadas }
}

/**
 * Parsea una línea de extracto bancario (formato genérico)
 */
export function parsearLineaExtracto(linea: string, _banco: TipoBanco): {
    fecha: string
    descripcion: string
    referencia?: string
    monto: number
} | null {
    // Formato BCP: DD/MM/YYYY | DESCRIPCION | REFERENCIA | MONTO
    // Formato genérico para CSV
    const partes = linea.split(/[,;\t|]/).map(p => p.trim())

    if (partes.length < 3) return null

    try {
        const fecha = partes[0]
        const descripcion = partes[1]
        const monto = parseFloat(partes[partes.length - 1].replace(/[^\d.-]/g, ''))
        const referencia = partes.length > 3 ? partes[2] : undefined

        if (isNaN(monto) || monto <= 0) return null

        // Convertir fecha DD/MM/YYYY a ISO
        const [d, m, y] = fecha.split('/')
        const fechaISO = y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : fecha

        return { fecha: fechaISO, descripcion, referencia, monto }
    } catch {
        return null
    }
}

// ============ CONCILIACIÓN ============

/**
 * Obtiene transacciones pendientes de conciliar
 */
export async function obtenerTransaccionesPendientes(): Promise<TransaccionBancaria[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('transacciones_bancarias')
        .select('*')
        .eq('estado', 'pendiente')
        .order('fecha', { ascending: false })

    if (error) {
        console.error('Error obteniendo transacciones:', error)
        return []
    }

    return (data || []).map(tx => ({
        id: tx.id,
        banco: tx.banco,
        fecha: tx.fecha,
        descripcion: tx.descripcion,
        referencia: tx.referencia,
        monto: tx.monto,
        estado: tx.estado,
        pagoRelacionadoId: tx.pago_relacionado_id,
        creditoRelacionadoId: tx.credito_relacionado_id,
        clienteNombre: tx.cliente_nombre,
        createdAt: tx.created_at
    }))
}

/**
 * Busca sugerencias de conciliación para una transacción
 */
export async function buscarSugerenciasConciliacion(
    transaccionId: string
): Promise<SugerenciaConciliacion[]> {
    const supabase = await createClient()

    // Obtener la transacción
    const { data: tx } = await supabase
        .from('transacciones_bancarias')
        .select('*')
        .eq('id', transaccionId)
        .single()

    if (!tx) return []

    const sugerencias: SugerenciaConciliacion[] = []

    // Buscar pagos con monto similar
    const margen = tx.monto * 0.01 // 1% de margen
    const { data: pagos } = await supabase
        .from('pagos')
        .select(`
            id,
            monto,
            credito_id,
            creditos(codigo, clientes(nombres, apellido_paterno))
        `)
        .gte('monto', tx.monto - margen)
        .lte('monto', tx.monto + margen)
        .is('transaccion_bancaria_id', null)
        .gte('created_at', tx.fecha)

    for (const pago of (pagos || [])) {
        const credito = pago.creditos as unknown as {
            codigo: string;
            clientes: { nombres: string; apellido_paterno: string }
        }

        let confianza = 50
        let razon = 'Monto similar'

        // Monto exacto
        if (pago.monto === tx.monto) {
            confianza += 30
            razon = 'Monto exacto'
        }

        // Referencia coincide con código de crédito
        if (tx.referencia && credito?.codigo && tx.referencia.includes(credito.codigo)) {
            confianza += 40
            razon = 'Referencia coincide con código de crédito'
        }

        // Descripción contiene nombre del cliente
        const nombreCliente = credito?.clientes
            ? `${credito.clientes.nombres} ${credito.clientes.apellido_paterno}`
            : ''
        if (nombreCliente && tx.descripcion.toLowerCase().includes(nombreCliente.toLowerCase().split(' ')[0])) {
            confianza += 20
            razon += ' + Nombre en descripción'
        }

        sugerencias.push({
            transaccionId: tx.id,
            pagoId: pago.id,
            creditoId: pago.credito_id,
            creditoCodigo: credito?.codigo || 'N/A',
            clienteNombre: nombreCliente,
            montoPago: pago.monto,
            confianza: Math.min(100, confianza),
            razon
        })
    }

    // Ordenar por confianza
    return sugerencias.sort((a, b) => b.confianza - a.confianza)
}

/**
 * Concilia una transacción con un pago
 */
export async function conciliarTransaccion(
    transaccionId: string,
    pagoId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Obtener datos del pago para referencia
    const { data: pago } = await supabase
        .from('pagos')
        .select('credito_id, creditos(codigo, clientes(nombres, apellido_paterno))')
        .eq('id', pagoId)
        .single()

    const credito = pago?.creditos as unknown as {
        codigo: string;
        clientes: { nombres: string; apellido_paterno: string }
    } | null
    const nombreCliente = credito?.clientes
        ? `${credito.clientes.nombres} ${credito.clientes.apellido_paterno}`
        : null

    // Actualizar transacción
    const { error: txError } = await supabase
        .from('transacciones_bancarias')
        .update({
            estado: 'conciliado',
            pago_relacionado_id: pagoId,
            credito_relacionado_id: pago?.credito_id,
            cliente_nombre: nombreCliente
        })
        .eq('id', transaccionId)

    if (txError) {
        return { success: false, error: txError.message }
    }

    // Enlazar pago con transacción
    await supabase
        .from('pagos')
        .update({ transaccion_bancaria_id: transaccionId })
        .eq('id', pagoId)

    revalidatePath('/dashboard/banco')
    return { success: true }
}

/**
 * Marca transacción como ignorada
 */
export async function ignorarTransaccion(
    transaccionId: string,
    motivo?: string
): Promise<{ success: boolean }> {
    const supabase = await createClient()

    await supabase
        .from('transacciones_bancarias')
        .update({
            estado: 'ignorado',
            metadata: { motivo_ignorado: motivo }
        })
        .eq('id', transaccionId)

    revalidatePath('/dashboard/banco')
    return { success: true }
}

// ============ ALERTAS ============

/**
 * Obtiene resumen bancario para alertas
 */
export async function obtenerResumenBancario(): Promise<ResumenBancario> {
    const supabase = await createClient()
    const hoy = new Date().toISOString().split('T')[0]

    // Depósitos de hoy
    const { data: hoyData } = await supabase
        .from('transacciones_bancarias')
        .select('monto')
        .eq('fecha', hoy)

    const depositosHoy = (hoyData || []).reduce((sum, t) => sum + (t.monto || 0), 0)

    // Pendientes de conciliar
    const { data: pendientes } = await supabase
        .from('transacciones_bancarias')
        .select('monto')
        .eq('estado', 'pendiente')

    const montoPendienteConciliar = (pendientes || []).reduce((sum, t) => sum + (t.monto || 0), 0)
    const transaccionesPendientes = (pendientes || []).length

    // Última conciliación
    const { data: ultima } = await supabase
        .from('transacciones_bancarias')
        .select('created_at')
        .eq('estado', 'conciliado')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return {
        depositosHoy,
        montoPendienteConciliar,
        transaccionesPendientes,
        ultimaConciliacion: ultima?.created_at || null
    }
}

/**
 * Obtiene alertas pendientes
 */
export async function obtenerAlertasBancarias(): Promise<Array<{
    tipo: 'deposito_nuevo' | 'pendiente_antiguo' | 'monto_alto'
    mensaje: string
    transaccionId: string
    prioridad: 'alta' | 'media' | 'baja'
}>> {
    const supabase = await createClient()
    const alertas: Array<{
        tipo: 'deposito_nuevo' | 'pendiente_antiguo' | 'monto_alto'
        mensaje: string
        transaccionId: string
        prioridad: 'alta' | 'media' | 'baja'
    }> = []

    // Transacciones pendientes de más de 3 días
    const hace3Dias = new Date()
    hace3Dias.setDate(hace3Dias.getDate() - 3)

    const { data: antiguas } = await supabase
        .from('transacciones_bancarias')
        .select('id, monto, fecha')
        .eq('estado', 'pendiente')
        .lt('fecha', hace3Dias.toISOString().split('T')[0])

    for (const tx of (antiguas || [])) {
        alertas.push({
            tipo: 'pendiente_antiguo',
            mensaje: `Depósito de S/ ${tx.monto.toFixed(2)} pendiente desde ${tx.fecha}`,
            transaccionId: tx.id,
            prioridad: 'alta'
        })
    }

    // Montos altos (> 1000)
    const { data: altos } = await supabase
        .from('transacciones_bancarias')
        .select('id, monto')
        .eq('estado', 'pendiente')
        .gt('monto', 1000)

    for (const tx of (altos || [])) {
        if (!alertas.find(a => a.transaccionId === tx.id)) {
            alertas.push({
                tipo: 'monto_alto',
                mensaje: `Depósito grande: S/ ${tx.monto.toFixed(2)} pendiente`,
                transaccionId: tx.id,
                prioridad: 'media'
            })
        }
    }

    return alertas.sort((a, b) => {
        const prioridadOrden = { alta: 0, media: 1, baja: 2 }
        return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]
    })
}
