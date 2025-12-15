/**
 * Tipos compartidos para documentos de impresión
 * Sistema de Empeños - Juntay
 */

export interface PrintData {
    codigo?: string
    monto?: number
    cliente?: string
    clienteNombre?: string
    clienteDocumento?: string
    clienteDireccion?: string
    descripcion?: string
    garantiaDescripcion?: string
    garantiaEstado?: string
    valorTasacion?: number
    estado?: string
    tasaInteres?: number
    fotos?: string[]
    creditoId?: string
    // Campos del RPC
    fechaVencimiento?: string
    totalPagar?: number
    interes?: number
    fechaInicio?: Date | string
    periodoDias?: number
}

/**
 * Datos de la empresa (centralizado para fácil actualización)
 */
export const EMPRESA = {
    nombre: 'FREECLOUD SOCIEDAD ANÓNIMA CERRADA',
    marca: 'JUNTAY',
    ruc: '20600345665',
    direccion: 'Jr. Cahuide 298, El Tambo, Huancayo',
    telefono: '920120843',
    web: 'www.juntay.com'
} as const

/**
 * Calcula fechas de vencimiento y montos de interés
 */
export function calcularFinancieros(data: PrintData) {
    const fechaHoy = new Date()
    const periodoDias = data.periodoDias || 30
    const fechaVencimiento = data.fechaVencimiento
        ? new Date(data.fechaVencimiento)
        : new Date(fechaHoy.getTime() + periodoDias * 24 * 60 * 60 * 1000)

    const tasaMensual = data.tasaInteres || 20
    const monto = data.monto || 0
    const interes = data.interes || (monto * tasaMensual / 100)
    const totalPagar = data.totalPagar || (monto + interes)

    return {
        fechaHoy,
        fechaVencimiento,
        tasaMensual,
        monto,
        interes,
        totalPagar,
        periodoDias
    }
}
