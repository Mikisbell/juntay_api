
export type AlertType =
    | 'mora_alta'
    | 'pago_vencido'
    | 'uso_bajo'
    | 'error_sistema'
    | 'nuevo_tenant'
    | 'billing'
    | 'seguridad'
    | 'limite_plan'
    | 'mantenimiento'

export const ALERT_TYPE_LABELS: Record<AlertType, { label: string; icon: string; color: string }> = {
    mora_alta: { label: 'Mora Alta', icon: '📊', color: 'red' },
    pago_vencido: { label: 'Pago Vencido', icon: '💰', color: 'orange' },
    uso_bajo: { label: 'Uso Bajo', icon: '📉', color: 'yellow' },
    error_sistema: { label: 'Error Sistema', icon: '🔴', color: 'red' },
    nuevo_tenant: { label: 'Nuevo Tenant', icon: '🏢', color: 'blue' },
    billing: { label: 'Facturación', icon: '💳', color: 'purple' },
    seguridad: { label: 'Seguridad', icon: '🔒', color: 'red' },
    limite_plan: { label: 'Límite de Plan', icon: '⚠️', color: 'orange' },
    mantenimiento: { label: 'Mantenimiento', icon: '🔧', color: 'gray' }
}
