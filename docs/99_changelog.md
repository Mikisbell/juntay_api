# 📝 Changelog

> Registro de cambios significativos del proyecto JUNTAY.
> Formato basado en [Keep a Changelog](https://keepachangelog.com/)

---

## [Unreleased]

### Changed - Next.js 16.1 Upgrade (Ene 2026)
- **Next.js 16.1.6**: Upgraded from Next.js 15.5.9 to 16.1.6
  - Turbopack now stable and enabled by default (10x faster cold starts)
  - File system caching for faster development server restarts
  - Improved build times with parallel workers (11 workers)
  - React 19.2.4 support with latest features
- **Architecture Changes**:
  - Migrated from `middleware.ts` to `proxy.ts` (Next.js 16 convention)
  - Updated `next.config.js` to support Turbopack configuration
  - Removed deprecated `eslint` config from next.config.js
  - Added `turbopack` section with resolve aliases and rules
- **Performance**:
  - Development server startup: ~1.6s (from ~3-4s)
  - Production build: 15.4s with Turbopack
  - 51 pages built successfully
- **Compatibility**:
  - Node.js 22.15.1 (compatible with Next.js 16 requirements)
  - All 42 unit tests passing
  - Build successful with zero errors
- **Available Features**:
  - Bundle Analyzer (experimental): `npx next experimental-analyze`
  - Debug mode: `next dev --inspect`
  - File system caching for development (stable)

### Added - Event Architecture (Dic 2024)
</text>

- **System Events Store**: Arquitectura de eventos centralizada con Zustand para monitoreo en tiempo real
  - Store tipado con 5 niveles de severidad (debug, info, warning, error, critical)
  - 7 módulos observables (replication, auth, database, business, ui, system, external)
  - 7 categorías de eventos (sync, validation, security, performance, user_action, background, notification)
  - Redux DevTools integration para debugging
  - Hooks convenientes: `useCriticalEvents`, `useErrorCount`, `useUnacknowledgedCount`, `useModuleEvents`
- **System Health Dashboard**: Dashboard de monitoreo en `/dashboard/system-health`
  - Top 3 métricas críticas (Errores Activos, Estado de Red, Sincronización)
  - Estadísticas por módulo y severidad
  - Log en tiempo real de últimos 50 eventos
  - Filtrado, acknowledgment y limpieza de eventos
  - System info cards (RxDB status, Supabase status, Performance)
- **Event Integration**: Integración completa con RxDB replication
  - Logs automáticos de errores de sincronización
  - Detección de conflictos con alertas contextuales
  - Eventos de offline/online mode
  - Metadata estructurada para debugging
- **Documentación**: Nueva documentación completa en `docs/EVENT_ARCHITECTURE.md`
  - Decisiones de arquitectura (por qué Zustand vs EventEmitter)
  - Guías de uso con ejemplos
  - Mejores prácticas
  - Roadmap de integración

### Added
- Script `npm run docs:audit` para verificar health de documentación
- Archivo `STATUS.md` auto-generado
- Helper `src/lib/auth/empresa-context.ts` para contexto multi-tenant centralizado
- Estrategia "SaaS-Ready Single-Tenant" en ROADMAP (Fase 0)
- Script `scripts/test-onboarding.ts` para verificar flujo E2E de onboarding
- **SaaS Super Admin**: Implementado rol `super_admin` (Level 1000) en DB con acceso global seguro via RLS policies (`super_admin_select_all_*`).
- **Analytics de Uso (Scalable)**: Arquitectura "Materialized Cache" con triggers en tiempo real (`metricas_uso_tenant`) y visualización con Recharts.
- **Limit Enforcement**: Gatekeeping transaccional activo (bloqueo real) para usuarios, sucursales y créditos según plan.
- **Tasas de Mora Configurables** (25 Dic 2025):
  - Nuevo: `config-intereses-actions.ts` con `obtenerConfigIntereses()`, `actualizarConfigIntereses()`
  - UI: `/dashboard/admin/configuracion` - Formulario para editar tasa_mora_diaria, dias_gracia, tope_mora_mensual
  - Preview: Cálculo en vivo de ejemplo en la UI
  - Fix: `TablaVencimientos.tsx` ahora usa `calcularMora()` centralizado
  - Default: 0.5% diario (15% mensual)
- **UX Polish** (25 Dic 2025):
  - Dark Mode: `ThemeToggle.tsx` con animación sun/moon, agregado a `DashboardHeader.tsx`
  - Loading States: `skeleton.tsx` base, `/dashboard/loading.tsx` con `DashboardSkeleton`
  - Estilos dark mode en header (dark:bg-slate-950, dark:border-slate-800)
- **Billing/Suscripciones System (Q3 2026)** (25 Dic 2025):
  - **Database**: Tablas `planes_suscripcion`, `suscripciones`, `facturas`.
  - **Planes**: Básico (S/99), Pro (S/199), Enterprise (S/499).
  - **Límites**: Control automático de usuarios, sucursales y créditos máximos por mes.
  - **UI**: Dashboard de gestión de suscripciones `/dashboard/admin/suscripcion`.
  - **Server Actions**: CRUD completo para planes, suscripciones y facturación.

### Security - Q1 2026 RLS COMPLETADO
- **RLS 100% Coverage**: 41/41 tablas públicas con RLS habilitado, 53 políticas definidas.
- **Tenant Isolation Verified**: `verify_tenant_isolation.ts` pasó 4/4 tests:
  - ✅ Self-Access (User A → Client A)
  - ✅ Cross-Tenant READ blocked (User A ↛ Client B)
  - ✅ Cross-Tenant WRITE blocked (RLS policy violation)
  - ✅ User Profile Integrity (empresa_id correct)

### Fixed - Build & Structure (Dic 2024)
- **Build Errors Resolved**: Build ahora compila exitosamente sin errores
  - Eliminada estructura duplicada `src/app/(dashboard)/` que causaba conflicto de rutas
  - Movido `gerencial/page.tsx` duplicado (se conservó versión de `dashboard/`)
  - Fixed JSX structure errors en `reportes/page.tsx` (indentación incorrecta)
  - Creado `reportes/page.tsx` limpio con estructura correcta
  - Backup del archivo original en `page.tsx.broken` para referencia
- **Middleware Refactored**: Actualizado a Next.js 15.5 best practices
  - Pattern de proxy correcto con single `NextResponse.next()`
  - Cookie handling simplificado (sin reasignación múltiple)
  - Redirects modernos con `new URL()` en lugar de `url.clone()`
  - Eliminado parámetro `NextFetchEvent` no utilizado

### Fixed
- **Dashboard Database Errors**:
  - Restored `cajas_operativas` table (migration applied)
  - Fixed `useDashboardData.ts`: `monto` → `monto_total`, `created_at` → `fecha`
  - Rewrote `caja-actions.ts` to use existing `cajas_operativas` tables
- **Empleados RLS (Professional Fix)**: New policy `tenant_empleados_with_self_read` allows:
  - Self-read via `user_id = auth.uid()`
  - Tenant isolation via `sucursal_id → empresa_id`
- **Onboarding Actions**: Corregidos 6 bugs de schema en `onboarding-actions.ts`:
  - Categorías globales (no per-tenant), RUC único, columnas correctas

## [2025.12.24] - Dashboard Premium y Fixes Críticos

### Added
- **Dashboard Gerencial Premium**:
  - `AIInsightsCard`: Motor de insights en tiempo real.
  - Granularidad en cartera: "Por Vencer" vs "Mora" vs "Al Día".
  - Animaciones de entrada escalonada (Framer Motion).
- **Database Functions**:
  - `crear_contrato_oficial`: Función transaccional (`SECURITY DEFINER`) para contratos + garantías + ledger.

### Fixed
- **Database Drift Repair**:
  - Solucionado conflicto de versiones en migraciones (`migration repair`).
  - Estandarización de nombres de migración a timestamp `YYYYMMDDHHMMSS`.
- **Data Integrity**:
  - Agregadas columnas faltantes: `creditos.fecha_cancelacion`, `pagos.usuario_id`.
  - Policies RLS actualizadas para `pagos`.

## [2025.12.20] - Producción Multi-Tentant Core
### Security & Architecture
- **Schema Hardening**: `empresa_id` agregado a tablas financieras críticas (`pagos`, `cajas_operativas`, `movimientos_caja_operativa`, `garantias`, `inversionistas`, `transacciones_capital`).
- **RLS Enforced**: Implementado aislamiento total "Deny by Default" en las 12 tablas principales usando `get_user_empresa()`.
- **RPCs Seguros**: Nuevas versiones de `registrar_pago_oficial`, `admin_asignar_caja` y `cerrar_caja_oficial` con validación de empresa y aislamiento de datos.
- **Server Actions**: `pagos-actions.ts` y `caja-actions.ts` actualizados para usar `requireEmpresaActual` y prevenir fugas de datos.

### Deployment
- **Producción**: Configuración final para Vercel + Supabase Prod.
- **Data Seed**: Script mejorado para inicializar Empresa Piloto, Sucursal y Admin.
- **Verification**: Script `verify-cloud.ts` validado contra producción.

### Frontend
- **Landing Page B2C**: IMPLEMENTADO **PREMIUM GOLD VAULT UI**.
- **Design System**: Nueva paleta Dark/Gold para transmitir solidez financiera y lujo.
- **Glassmorphism**: Componentes flotantes con efectos de vidrio y luz.
- **Components**: Reescritura total de Hero, Navbar, Process y Footer.



---

## [2025.12.20] - ROADMAP 2026 SaaS

### Added
- ROADMAP 2026 orientado a producto SaaS
- Migraciones Q3: sucursales, banco, remates, cobrador, fotos
- 24 tests E2E para features Q3
- `TODO-PRE-PROD.md` con gaps pre-producción

### Changed
- ROADMAP 2026 reenfocado de sistema interno a SaaS
- Multi-tenant movido de Q4 a Q1 2026

---

## [2025.12.19] - Features Q3-Q4 Completadas

### Added
- Integración Bancaria (importar/conciliar)
- Sistema Multi-sucursal
- Módulo de Remates
- App Cobrador (ubicación/visitas)
- Galería de Fotos para garantías
- TrustScore dinámico en UI

### Database
- `sucursales` + FKs en 4 tablas
- `transacciones_bancarias`
- `ventas_remates` + VIEW `inventario`
- `ubicaciones_cobradores` + `visitas`
- `fotos_garantia` + trigger

---

## [2025.12.17] - Tesorería y Capital

### Added
- Módulo de inversionistas
- Gestión multi-cuenta
- Triggers de integridad financiera

---

## [2025.Q2] - Core Operativo

### Added
- Dashboard Gerencial con KPIs
- Recibos digitales PDF + QR
- Scoring de cliente
- Gestión de garantías mejorada
- Integración Yape/Plin

---

## [2025.Q1] - Fundación

### Added
- Sistema offline-first con RxDB
- Sincronización Supabase
- Recordatorios WhatsApp
- Gestión de créditos y pagos
- Sistema de interés flexible

---

*Actualizar este archivo con cada release significativo.*
