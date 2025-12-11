# 🔐 Seguridad, Roles y Auditoría – JUNTAY

Este documento resume los requisitos de seguridad, el modelo de roles/permisos y la auditoría del sistema.

Para más detalle, ver sección 8 y el Plan de Seguridad en `Guia_de_trabajo.md`.

---

## 1. Roles y Permisos

### 1.1 Roles Principales

- **Administrador**
  - Acceso total al sistema.
  - Gestión de usuarios, roles, configuración global.

- **Gerente**
  - Acceso a reportes, aprobaciones, configuraciones de negocio.

- **Analista de Crédito**
  - Evaluación de clientes.
  - Aprobación/rechazo de créditos.

- **Cajero**
  - Operaciones de caja y pagos.
  - Registro de créditos y cobranzas.

### 1.2 Permisos Granulares (Ejemplo)

```typescript
interface PermisosUsuario {
  // Clientes
  clientes_ver: boolean
  clientes_crear: boolean
  clientes_editar: boolean
  clientes_eliminar: boolean

  // Créditos
  creditos_ver: boolean
  creditos_crear: boolean
  creditos_aprobar: boolean
  creditos_desembolsar: boolean

  // Caja
  caja_abrir: boolean
  caja_cerrar: boolean
  caja_movimientos: boolean
  caja_reportes: boolean

  // Reportes
  reportes_financieros: boolean
  reportes_gerenciales: boolean
  reportes_auditoria: boolean
}
```

---

## 2. Plan de Seguridad (Fases)

### 2.1 Fase 1 – Seguridad Inmediata

- Autenticación 2FA para gerentes y administradores.
- Timeout automático de sesión según rol.
- Logs de seguridad básicos (intentos de acceso, accesos exitosos, errores).
- Encriptación de datos sensibles (contraseñas, claves, algunos campos de clientes).

### 2.2 Fase 2 – Compliance Básico

- Reportes automáticos (diarios, semanales, mensuales).
- Sistema de backup automatizado.
- Políticas de retención de datos (transacciones, contratos, fotos, logs).
- Auditoría de cambios críticos con justificación obligatoria.

### 2.3 Fase 3 – Optimización Operativa

- Alertas inteligentes (intentos sospechosos, montos inusuales).
- Notificaciones multicanal para eventos críticos.
- Integración con sistemas contables y de cumplimiento.

---

## 3. Auditoría

### 3.1 Log de Auditoría

```typescript
interface LogAuditoria {
  id: string
  usuario_id: string
  accion: string
  modulo: string
  registro_id?: string
  datos_anteriores?: object
  datos_nuevos?: object
  ip_address: string
  user_agent: string
  timestamp: Date
}
```

### 3.2 Eventos a Auditar

- Cambios en datos de clientes, créditos y garantías.
- Creación y cierre de cajas.
- Aprobación y desembolso de créditos.
- Cambios de configuración crítica (tasas, límites, roles).

---

## 4. Consideraciones Adicionales

- Usar HTTPS/SSL en producción.
- No exponer claves privadas en frontend ni repositorios.
- Separar entornos (desarrollo, pruebas, producción) con sus propias claves.

Cualquier nueva funcionalidad que afecte seguridad o permisos debe actualizar este documento y `Guia_de_trabajo.md`.
