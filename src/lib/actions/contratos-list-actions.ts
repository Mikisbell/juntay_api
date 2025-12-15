'use server'

import { createClient } from '@/lib/supabase/server'

export async function obtenerContratosVigentes() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('creditos')
        .select(`
      id,
      codigo_credito,
      estado,
      monto_prestado,
      saldo_pendiente,
      interes_acumulado,
      tasa_interes,
      fecha_vencimiento,
      cliente:clientes(nombres, apellido_paterno, apellido_materno),
      garantia:garantias(descripcion, valor_tasacion)
    `)
        .in('estado', ['vigente', 'vencido', 'en_mora', 'renovado']) // Ampliar estados para mostrar más
        .order('fecha_vencimiento', { ascending: true })

    if (error) {
        console.error('Error obteniendo contratos:', error)
        return []
    }

    // Transformar datos para el Sheet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((credito: any) => {
        const cliente = Array.isArray(credito.cliente) ? credito.cliente[0] : credito.cliente
        const garantia = Array.isArray(credito.garantia) ? credito.garantia[0] : credito.garantia

        return {
            id: credito.id,
            codigo: credito.codigo_credito, // Mapear codigo_credito a codigo
            estado: credito.estado,
            monto_prestado: credito.monto_prestado,
            saldo_pendiente: credito.saldo_pendiente,
            interes_acumulado: credito.interes_acumulado || 0,
            tasa_interes: credito.tasa_interes,
            fecha_vencimiento: credito.fecha_vencimiento,
            periodo_dias: 30, // Default o calcular si tenemos fecha inicio
            cliente_nombre: cliente
                ? `${cliente.nombres} ${cliente.apellido_paterno || ''} ${cliente.apellido_materno || ''}`.trim()
                : 'Sin cliente',
            garantia_descripcion: garantia?.descripcion || 'Sin descripción',
            garantia_valor: garantia?.valor_tasacion || 0
        }
    })
}
