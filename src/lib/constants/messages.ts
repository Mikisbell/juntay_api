/**
 * Mensajes y textos centralizados para mantener consistencia en toda la aplicación
 * Filosofía: Profesional-Amigable, accionable, directo
 */

export const PAGE_TITLES = {
    dashboard: 'Dashboard',
    empenos: 'Empeños',
    nuevoEmpeno: 'Nuevo Empeño',
    pagos: 'Pagos',
    caja: 'Caja',
    contratos: 'Contratos',
    inventario: 'Inventario',
    remates: 'Remates',
    reportes: 'Reportes',
    tesoreria: 'Tesorería',
} as const

export const PAGE_DESCRIPTIONS = {
    dashboard: 'Acceda rápidamente a las operaciones diarias del negocio',
    empenos: 'Registre nuevos contratos y consulte el historial de operaciones',
    nuevoEmpeno: 'Siga los pasos para registrar un nuevo contrato de empeño',
    pagos: 'Registre cobros de intereses y desempeños de garantías',
    caja: 'Abra, cierre y administre su turno de caja operativa',
    contratos: 'Consulte contratos vigentes y gestione renovaciones',
    inventario: 'Administre las garantías en custodia y disponibles para remate',
    remates: 'Gestione el proceso de remate de garantías vencidas',
    reportes: 'Consulte informes de operaciones y estadísticas',
    tesoreria: 'Supervise el flujo de efectivo y movimientos de caja',
} as const

export const ACTION_LABELS = {
    nuevoEmpeno: 'Nuevo Empeño',
    registrarPago: 'Registrar Pago',
    abrirCaja: 'Abrir Caja',
    cerrarCaja: 'Cerrar Caja',
    buscar: 'Buscar',
    ver: 'Ver',
    editar: 'Editar',
    eliminar: 'Eliminar',
    descargar: 'Descargar',
    imprimir: 'Imprimir',
    renovar: 'Renovar',
    desempenar: 'Desempeñar',
} as const

export const STATUS_MESSAGES = {
    cajaAbierta: {
        title: 'Caja Abierta',
        description: (fecha: string) => `Turno iniciado el ${fecha}`
    },
    cajaCerrada: {
        title: 'Caja Cerrada',
        description: 'Debe abrir caja para realizar operaciones monetarias'
    },
    sinRegistros: 'No hay registros disponibles',
    cargando: 'Cargando...',
    error: 'Ocurrió un error. Intente nuevamente.',
} as const

export const KEYBOARD_SHORTCUTS = {
    nuevoEmpeno: 'F1',
    buscar: 'F2',
    caja: 'F3',
} as const
