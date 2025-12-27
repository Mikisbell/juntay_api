
export const AUDIT_ACTIONS = {
    // Auth
    LOGIN: 'user.login',
    LOGOUT: 'user.logout',
    LOGIN_FAILED: 'user.login_failed',
    PASSWORD_CHANGE: 'user.password_change',

    // Empresa
    EMPRESA_CREATED: 'empresa.created',
    EMPRESA_UPDATED: 'empresa.updated',
    EMPRESA_SUSPENDED: 'empresa.suspended',
    EMPRESA_ACTIVATED: 'empresa.activated',

    // Sucursal
    SUCURSAL_CREATED: 'sucursal.created',
    SUCURSAL_UPDATED: 'sucursal.updated',
    SUCURSAL_DEACTIVATED: 'sucursal.deactivated',

    // Financial
    CREDITO_CREATED: 'credito.created',
    CREDITO_APPROVED: 'credito.approved',
    CREDITO_CANCELLED: 'credito.cancelled',
    PAGO_REGISTERED: 'pago.registered',
    DESEMBOLSO_DONE: 'desembolso.done',

    // Config
    PLAN_CHANGED: 'plan.changed',
    CONFIG_UPDATED: 'config.updated',
    USER_CREATED: 'user.created',
    USER_ROLE_CHANGED: 'user.role_changed',

    // SysAdmin
    SYSADMIN_IMPERSONATE: 'sysadmin.impersonate',
    SYSADMIN_MANUAL_INVOICE: 'sysadmin.manual_invoice',
    SYSADMIN_ALERT_CREATED: 'sysadmin.alert_created'
} as const
