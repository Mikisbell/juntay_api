# 📝 Changelog

> Registro de cambios significativos del proyecto JUNTAY.
> Formato basado en [Keep a Changelog](https://keepachangelog.com/)

---

## [Unreleased]
### Added
- Script `npm run docs:audit` para verificar health de documentación
- Archivo `STATUS.md` auto-generado
- Helper `src/lib/auth/empresa-context.ts` para contexto multi-tenant centralizado
- Estrategia "SaaS-Ready Single-Tenant" en ROADMAP (Fase 0)
- Script `scripts/test-onboarding.ts` para verificar flujo E2E de onboarding
- **SaaS Super Admin**: Implementado rol `SUPER_ADMIN` con dashboard global `/dashboard/saas`.
- **Impersonation**: Funcionalidad "Modo Camaleón" que permite al Super Admin operar como cualquier empresa.
- **Script**: `scripts/make-user-superadmin.ts` para autopromoción de privilegios.

### Security - Q1 2026 RLS COMPLETADO
- **RLS 100% Coverage**: 41/41 tablas públicas con RLS habilitado, 53 políticas definidas.
- **Tenant Isolation Verified**: `verify_tenant_isolation.ts` pasó 4/4 tests:
  - ✅ Self-Access (User A → Client A)
  - ✅ Cross-Tenant READ blocked (User A ↛ Client B)
  - ✅ Cross-Tenant WRITE blocked (RLS policy violation)
  - ✅ User Profile Integrity (empresa_id correct)

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
