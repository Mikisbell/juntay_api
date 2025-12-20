# 📝 Changelog

> Registro de cambios significativos del proyecto JUNTAY.
> Formato basado en [Keep a Changelog](https://keepachangelog.com/)

---

## [Unreleased]

### Added
- Script `npm run docs:audit` para verificar health de documentación
- Archivo `STATUS.md` auto-generado

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
