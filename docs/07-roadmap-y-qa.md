# 🗺️ Roadmap y Checklist de QA – JUNTAY

## 1. Roadmap del Proyecto

### 1.1 Estado Actual (Nov 2025)

- **Backend / Datos**
  - Esquema Supabase extendido (clientes, garantías, créditos, remates, notificaciones, evaluaciones, etc.).
  - Funciones automáticas (numeración, cálculos, triggers).
  - Índices y constraints clave definidos.

- **Frontend / Módulos**
  - Control de Caja.
  - Contratos PDF.
  - Sistema de Fotos de Garantías.
  - Módulo de Remates.
  - Módulo de Notificaciones.
  - Navegación principal del dashboard.
  - Roles y permisos básicos.
  - Integración WhatsApp + YAPE (flujo principal).

- **Calidad Técnica**
  - Proyecto 100% Type-Safe (errores TS = 0).
  - Build de Next.js funcionando.
  - Integración con Supabase estable.

### 1.2 Próximas Fases

#### Fase 1 – Bloque Crítico Negocio (Muy Alta Prioridad)

- RENIEC API (autocompletado, validación y DNIs duplicados).
- Formularios actualizados (cliente, garantía, crédito) con todos los campos nuevos.
- Pagos flexibles (todas las frecuencias, pagos parciales/totales, renovaciones).
- Proceso completo de vencimientos (gracia, mora, remate) automatizado.

#### Fase 2 – Seguridad, Auditoría y Reportes

- Seguridad: 2FA, timeout por rol, logs de seguridad detallados.
- Auditoría: historial de cambios en registros sensibles y pantallas de revisión.
- Reportes: financieros, caja, morosidad, inventario, exportes SUNAT.

#### Fase 3 – Diferenciadores y Escalabilidad

- IA de Valuación (tasación con imagen y confianza).
- Scoring de Clientes (probabilidad de mora, límite sugerido).
- Dashboards ejecutivos y optimización de tiempos de operación.

---

## 2. Checklist de QA / Aceptación

### 2.1 Caja y Operación Diaria

- [ ] Puedo abrir caja con monto inicial y desglose por billetes/monedas.
- [ ] Puedo registrar ingresos/egresos con concepto y ver el saldo en tiempo real.
- [ ] Puedo cerrar caja y ver diferencias entre físico y sistema.
- [ ] Obtengo un reporte de cierre de caja claro (fecha, usuario, diferencias).

### 2.2 Clientes, Garantías y Créditos

- [ ] Puedo registrar un cliente nuevo con todos los datos necesarios.
- [ ] (Cuando esté listo) DNI → se rellenan automáticamente los campos básicos (RENIEC).
- [ ] Puedo registrar una garantía con descripción, fotos y ubicación física.
- [ ] Puedo crear un crédito asociado a un cliente y una garantía con la tasa acordada.
- [ ] Veo claramente: cuánto recibe hoy, cuánto paga en total y cuándo vence.

### 2.3 Pagos, Renovaciones y Vencimientos

- [ ] Puedo registrar pagos parciales y ver el saldo actualizado.
- [ ] Puedo registrar pagos totales y ver el crédito como cancelado.
- [ ] Puedo hacer renovaciones (pago solo intereses) y ver el nuevo vencimiento.
- [ ] Veo listados de créditos por estado: al día, en gracia, vencidos, en remate.

### 2.4 Remates y Notificaciones

- [ ] Puedo ver garantías que ya pasaron el proceso de vencimiento y son elegibles para remate.
- [ ] Puedo programar un remate con fecha, precio base y condiciones.
- [ ] Puedo registrar la venta de una garantía en remate y ver el resultado.
- [ ] El sistema envía o registra notificaciones de recordatorio de pago / vencimiento.
- [ ] Puedo ver un historial de notificaciones por cliente/crédito.

### 2.5 WhatsApp, YAPE y Comunicación

- [ ] Al registrar un pago, el cliente recibe un mensaje de confirmación.
- [ ] Antes del vencimiento, el cliente recibe recordatorios en los días acordados.
- [ ] Puedo enviar o simular el envío de una solicitud de pago YAPE.
- [ ] El sistema registra qué mensajes se enviaron y su estado (pendiente, enviado, error).

### 2.6 Seguridad y Roles

- [ ] Un cajero solo puede ver/hacer lo que le corresponde.
- [ ] Un gerente puede ver reportes y configuraciones avanzadas.
- [ ] Un administrador puede configurar usuarios, roles y parámetros globales.
- [ ] Se registran en un log las acciones importantes (quién hizo qué y cuándo).

### 2.7 Reportes y Control

- [ ] Puedo generar un reporte diario de caja.
- [ ] Puedo ver un resumen de cartera (créditos activos, vencidos, en remate).
- [ ] Puedo exportar información para el contador (CSV/Excel mínimo).
- [ ] La información clave que hoy está en Excel está cubierta por este sistema.

### 2.8 Experiencia de Uso

- [ ] El flujo de “nuevo empeño” es claro y guiado (cliente → garantía → crédito → contrato).
- [ ] El flujo de “pago / renovación / recuperación de prenda” se entiende sin explicación extra.
- [ ] Las pantallas muestran información clara, sin términos confusos.
- [ ] Un usuario nuevo puede aprender el sistema en pocas horas con esta guía.
