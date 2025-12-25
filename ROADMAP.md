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

# 📅 ROADMAP 2026 - Producto SaaS

> **Objetivo:** Producto listo para vender a casas de empeño como SaaS o white-label.

---

## 🚨 Fase 0: Producción Urgente (Actual)

> **Estrategia:** "SaaS-Ready Single-Tenant" - Desplegar para el cliente #1 sin crear deuda técnica.

### 0.1 Infraestructura SaaS-Ready [/] EN PROGRESO
- [x] Crear helper `getEmpresaActual()` centralizado
- [ ] Auditar server actions críticos (creditos, pagos, clientes)
- [ ] Agregar filtros `empresa_id` donde falten
- [ ] Documentar reglas de compatibilidad futura

### 0.2 Deploy Producción [ ]
- [ ] Configurar Supabase producción
- [ ] Configurar Vercel con variables de entorno
- [ ] Seed: Empresa #1 + Sucursal + Admin
- [ ] Go-live cliente piloto

---

## 🏢 Q1 2026 - Multi-Tenant Completo

### 1. Multi-tenant [/] 🔴 CRÍTICO (Ya tiene 70% base)
> Tablas `empresas` y `sucursales` ya existen. Falta completar.

- [x] Tabla `empresas` con datos de cada empresa *(YA EXISTE)*
- [x] Columna `empresa_id` en tablas principales *(PARCIAL: usuarios, clientes, creditos, boveda)*
- [x] Completar `empresa_id` en tablas faltantes (garantias, pagos, movimientos, cajas, inversionistas)
- [x] RLS policies por tenant - Aislamiento Total Activado 🛡️
- [x] Aislamiento completo de datos
- [x] Landing Page B2C (juntay.app) - 💎 PREMIUM REDESIGN
  - [x] Identidad "Gold Vault" (Dark Mode + Gold)
  - [x] Componentes Glassmorphism
  - [x] Conversión optimizada (WhatsApp CTA)
- [x] Script de creación de nuevo tenant


### 2. Onboarding Automatizado [/] EN PROGRESO
- [x] Wizard de configuración inicial (`/start` page)
- [x] Crear empresa + sucursal + admin en 5 min ✅ FIXED
- [ ] Importar catálogo de categorías (N/A: global lookup)
- [x] Configurar tasas de interés por defecto (20% default)

### 3. Landing Page + Demo [x]
- [x] Landing page de producto
- [x] Demo interactivo con datos ficticios
- [x] Formulario de contacto/solicitud
- [ ] Video explicativo

### 4. Seguridad RLS [x] ✅ COMPLETADO
- [x] RLS en TODAS las tablas (41/41 tablas, 53 políticas)
- [x] Test: Empresa A no ve datos de B (`verify_tenant_isolation.ts` 4/4 ✅)
- [x] Audit log de accesos (`audit_log` + `auditoria_transacciones`)
- [ ] 2FA para admins *(Diferido a Q3 - Enterprise feature)*

---

## 🎨 Q2 2026 - El "Wow" del Demo

### 5. Dashboard Gerencial Premium [ ]
- [ ] Gráficos animados e interactivos
- [ ] KPIs en tiempo real
- [ ] Comparativas mes a mes
- [ ] Diseño ejecutivo que impresione

### 6. Reportes PDF Profesionales [ ]
- [ ] Reporte de cartera con logo empresa
- [ ] Estado de cuenta por cliente
- [ ] Reporte de mora con gráficos
- [ ] Exportación programada automática

### 7. WhatsApp API Real [ ]
- [ ] Integración con API oficial de Meta (Por ahora usar WAHA, solo cuando el cliente adquiera el plan Pro lo configuramos)
- [ ] Templates pre-aprobados
- [ ] Envío masivo de recordatorios
- [ ] Métricas de entrega/lectura

### 8. UX Polish [/] 🎨 EN PROGRESO
- [x] Dark mode - `ThemeToggle.tsx` con animación sun/moon
- [x] Micro-animaciones - Ya existían en `globals.css` (hover-lift, shimmer, pulse-glow)
- [x] Loading states mejorados - `skeleton.tsx`, `/dashboard/loading.tsx`
- [ ] Mobile responsive perfecto

---

##  Q3 2026 - Monetización

### 9. Billing/Suscripciones [ ]
- [ ] Planes: Básico / Pro / Enterprise
- [ ] Cobro mensual automático
- [ ] Límites por plan (usuarios, créditos)
- [ ] Portal de facturación para cliente

### 10. Admin Panel (Super Admin) [ ]
- [ ] Ver todos los tenants
- [ ] Métricas de uso por tenant
- [ ] Activar/desactivar tenants
- [ ] Soporte técnico interno

### 11. Analytics de Uso [ ]
- [ ] Qué features usan más
- [ ] Retención de usuarios
- [ ] Churn prediction
- [ ] Feedback in-app

---

## 🔗 Q4 2026 - Diferenciadores

### 12. Integraciones [ ](De Preferencia planes gratuitos)
- [ ] RENIEC (validación DNI)
- [ ] Centrales de riesgo (Sentinel, Equifax)
- [ ] Contabilidad (Contasis, etc)
- [ ] Pasarelas de pago (Culqi, MercadoPago)

### 13. API Pública [ ] (imagino que revisaste mi proeycto a detalle para recomendarme estas opciones)
- [ ] REST API documentada 
- [ ] Webhooks para eventos
- [ ] SDK JavaScript/Python
- [ ] Rate limiting por plan

### 14. White-label Completo [ ]
- [ ] Dominio personalizado por cliente
- [ ] Logo y colores por tenant
- [ ] Emails con branding del cliente
- [ ] App móvil con marca del cliente

### 15. App Cobradores (Opcional) [ ]
- [ ] Solo para clientes enterprise
- [ ] GPS y fotos de visitas
- [ ] Offline mode
- [ ] Cobro en campo

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

## 🎯 Próximos Pasos Inmediatos

> Para comenzar Q1 2026:

| Prioridad | Tarea | Tiempo Est. |
|-----------|-------|-------------|
| 1 | Diseñar schema multi-tenant | 2-3 días |
| 2 | Migración tenant_id | 1 día |
| 3 | RLS policies | 2 días |
| 4 | Script onboarding | 2 días |
| 5 | Landing page | 3-5 días |

---

## 📊 Métricas de Éxito 2026

| Métrica | Q1 | Q2 | Q3 | Q4 |
|---------|----|----|----|----|
| Tenants activos | 1-3 | 5-10 | 15-25 | 30+ |
| MRR objetivo | $500 | $2,000 | $5,000 | $10,000 |
| Churn | <10% | <10% | <5% | <5% |
| NPS | >50 | >60 | >70 | >70 |

