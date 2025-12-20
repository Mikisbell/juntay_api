# JUNTAY - Roadmap de Desarrollo

## Visión del Producto

Sistema integral de gestión de casa de empeño con enfoque offline-first, automatización de cobros y análisis de datos.

---

## 🚀 Prioridad ALTA (Q1 2025)

### 1. Recordatorios Automáticos WhatsApp ✅ COMPLETADO

- [x] Cron job para detectar vencimientos próximos
- [x] Mensaje 3 días antes del vencimiento
- [x] Mensaje el día del vencimiento
- [x] Mensaje 1 día después (mora)
- [x] Configuración de horarios de envío
- [x] Historial de mensajes enviados

### 2. Dashboard Gerencial ✅ COMPLETADO

- [x] KPIs principales - Mora (% cartera en mora)
- [x] KPIs principales (ingresos, cartera, recibos)
- [x] Gráfico de flujo de caja diario/semanal
- [x] Top 10 clientes más rentables
- [x] Alertas de cartera vencida
- [x] Exportar reportes a Excel/PDF

### 3. Recibos Digitales ✅ COMPLETADO

- [x] Generar PDF de recibo al pagar
- [x] Enviar por WhatsApp automáticamente
- [x] Código QR de verificación
- [x] Historial de recibos por cliente

---

## 🔶 Prioridad MEDIA (Q2 2025)

### 4. Scoring de Cliente ✅ COMPLETADO

- [x] Calcular puntaje basado en historial
- [x] Indicador visual en ficha de cliente
- [x] Tasas preferenciales para VIPs
- [x] Alertas para clientes riesgosos

### 5. Gestión de Garantías Mejorada ✅ COMPLETADO

- [x] Galería de fotos por artículo
- [x] Registro de estado (nuevo/usado/dañado)
- [x] Historial de tasaciones
- [x] Pre-valoración automática por categoría

### 6. Integración Yape/Plin ✅ COMPLETADO

- [x] Generar QR de cobro
- [x] Confirmar pagos manualmente
- [x] Conciliación con movimientos de caja

---

## 🔷 Prioridad BAJA (Q3-Q4 2025)

### 7. App Móvil para Cobradores (En Progreso)

- [x] Login seguro
- [x] Lista de cobros del día
- [x] Registrar pago en campo
- [x] Geolocalización de visitas
- [ ] Tomar fotos de garantías

### 8. Sistema Multi-sucursal

- [ ] Cada sucursal con su caja
- [ ] Consolidación de reportes
- [ ] Transferencia de garantías entre sucursales
- [ ] Permisos por sucursal

### 9. Módulo de Remates

- [ ] Catálogo de artículos a rematar
- [ ] Precio mínimo de venta
- [ ] Registro de ventas
- [ ] Cálculo de utilidad

### 10. Integración Bancaria

- [ ] Lectura de estados de cuenta
- [ ] Conciliación automática
- [ ] Alertas de depósitos

---

## ✅ Completado

- [x] Sistema offline-first con RxDB
- [x] Sincronización con Supabase
- [x] Gestión de créditos y pagos
- [x] Notificaciones WhatsApp manuales
- [x] **Sistema de interés flexible (días/semanas)**
- [x] Módulo de vencimientos refactorizado

---

## Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Reducción de mora | -30% con recordatorios automáticos |
| Tiempo de atención | -50% con sistema offline |
| Errores de cálculo | 0% con sistema flexible |
| Satisfacción cliente | +40% con recibos digitales |
