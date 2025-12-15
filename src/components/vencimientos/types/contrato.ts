// Tipo unificado para contratos de vencimiento
// Usado por todos los componentes de vencimientos

export type ContratoVencimiento = {
    id: string
    codigo: string
    cliente: string
    clienteId: string
    dni?: string           // Opcional, solo TablaVencimientos lo usa
    telefono: string
    monto: number
    saldo: number
    fechaVencimiento: string
    diasRestantes: number
}

export type UrgenciaTipo = 'hoy' | 'semana' | 'mes'

export type NotificacionTipo = 'vencimiento_hoy' | 'vencimiento_proximo' | 'cobranza'

// Helpers para determinar urgencia
export function getUrgenciaTipo(diasRestantes: number): UrgenciaTipo {
    if (diasRestantes === 0) return 'hoy'
    if (diasRestantes <= 7) return 'semana'
    return 'mes'
}

export function getNotificacionTipo(diasRestantes: number): NotificacionTipo {
    return diasRestantes === 0 ? 'vencimiento_hoy' : 'vencimiento_proximo'
}
