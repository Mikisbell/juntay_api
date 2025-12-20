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

### 7. App Móvil para Cobradores ✅ COMPLETADO

- [x] Login seguro
- [x] Lista de cobros del día
- [x] Registrar pago en campo
- [x] Geolocalización de visitas
- [x] Tomar fotos de garantías

### 8. Sistema Multi-sucursal ✅ COMPLETADO

- [x] Cada sucursal con su caja
- [x] Consolidación de reportes
- [x] Transferencia de garantías entre sucursales
- [x] Permisos por sucursal

### 9. Módulo de Remates ✅ COMPLETADO

- [x] Catálogo de artículos a rematar
- [x] Precio mínimo de venta
- [x] Registro de ventas
- [x] Cálculo de utilidad

### 10. Integración Bancaria ✅ COMPLETADO

- [x] Lectura de estados de cuenta
- [x] Conciliación automática
- [x] Alertas de depósitos

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

---

# 📅 ROADMAP 2026

## 🔧 Q1 2026 - Estabilización y Producción

### 1. Verificación Offline/RxDB [ ]
> **CRÍTICO**: Validar que el sistema offline-first funciona correctamente

- [ ] Test sincronización después de reconexión
- [ ] Verificar resolución de conflictos
- [ ] Probar app cobrador sin conexión
- [ ] Documentar flujo offline

### 2. Seguridad RLS [ ]
- [ ] Implementar RLS en todas las tablas Q3
- [ ] Test: Cajero solo ve su sucursal
- [ ] Test: Cliente no ve datos de otros
- [ ] Auditoría de permisos

### 3. Monitoreo y Observabilidad [ ]
- [ ] Configurar Sentry para errores
- [ ] Logs estructurados en acciones críticas
- [ ] Dashboard de health check
- [ ] Alertas de fallos

### 4. Documentación Técnica [ ]
- [ ] API docs con ejemplos
- [ ] Guía de deployment
- [ ] Manual de usuario (cajero/admin)
- [ ] Onboarding de desarrolladores

---

## 🚀 Q2 2026 - Optimización UX

### 5. Mejoras de Interfaz [ ]
- [ ] Dark mode completo
- [ ] Accesibilidad (WCAG 2.1)
- [ ] Optimización mobile
- [ ] Micro-animaciones

### 6. Performance [ ]
- [ ] Lazy loading de componentes pesados
- [ ] Optimización de queries N+1
- [ ] Cache de datos frecuentes
- [ ] Bundle size reduction

### 7. PWA Completa [ ]
- [ ] Install prompt
- [ ] Push notifications
- [ ] Background sync
- [ ] Offline indicator mejorado

---

## 📊 Q3 2026 - Analytics Avanzado

### 8. BI Dashboard [ ]
- [ ] Reportes personalizables
- [ ] Gráficos interactivos
- [ ] Exportación programada
- [ ] Comparativas YoY/MoM

### 9. Predicción de Mora [ ]
- [ ] ML model para riesgo de impago
- [ ] Alertas predictivas
- [ ] Recomendaciones automáticas
- [ ] A/B testing de estrategias

### 10. Análisis de Rentabilidad [ ]
- [ ] Cálculo de ROI por cliente
- [ ] Análisis de categorías más rentables
- [ ] Optimización de tasas

---

## 🔗 Q4 2026 - Integraciones

### 11. API Pública [ ]
- [ ] REST API documentada
- [ ] Webhooks para eventos
- [ ] Rate limiting
- [ ] API keys por cliente

### 12. Integraciones Terceros [ ]
- [ ] Contabilidad (Contasis, etc)
- [ ] RENIEC/validación DNI
- [ ] Centrales de riesgo
- [ ] Pasarelas de pago adicionales

### 13. Multi-tenant [ ]
- [ ] Soporte para múltiples empresas
- [ ] Aislamiento de datos
- [ ] Facturación por uso
- [ ] White-label

---

## ✅ Verificación 2025

| Nivel | Tests | Estado |
|-------|-------|--------|
| Build | Compila | ✅ |
| Lint | 0 warnings | ✅ |
| Unit | 43/43 | ✅ |
| E2E CRUD | 24/24 | ✅ |
| DB Schema | 8 tablas Q3 | ✅ |

---

## 🎯 ¿Qué Sigue?

> ROADMAP 2025 completado al 100%. Opciones para comenzar 2026:

| Opción | Descripción | Recomendado |
|--------|-------------|-------------|
| **A. Estabilización** | Q1 completo (RLS, offline, docs) | ⭐ Si vas a producción |
| **B. Features nuevas** | Saltar a Q2-Q3 | Si ya tienes usuarios |
| **C. Optimización** | Performance y UX polish | Si sistema es lento |
| **D. Documentación** | API docs, user guides | Si onboardeas equipo |

### Mi Recomendación:
> **Opción A primero** → El sistema tiene código completo pero gaps de producción.
> Resolver RLS + Offline antes de agregar más features.

---

## Métricas 2026

| Métrica | Objetivo |
|---------|----------|
| Uptime | 99.5% |
| Error rate | < 0.1% |
| Page load | < 2s |
| Mobile score | > 90 |
| Test coverage | > 80% |
