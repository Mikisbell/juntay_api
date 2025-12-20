# 🏗️ Arquitectura del Sistema

> Guía de arquitectura técnica de JUNTAY.

---

## Patrón Arquitectónico

**Híbrido Offline-First + Server Actions**

```
┌────────────────────────────────────────────┐
│                CLIENTE                      │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │   RxDB      │    │  React Components │  │
│  │  (Local DB) │    │   + Server Actions│  │
│  └──────┬──────┘    └────────┬─────────┘  │
│         │                    │             │
│         │    ┌───────────────┘             │
│         ▼    ▼                             │
│  ┌─────────────────┐                       │
│  │   Sync Layer    │                       │
│  └────────┬────────┘                       │
└───────────┼────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────┐
│              SUPABASE CLOUD                │
│  ┌──────────┐  ┌─────┐  ┌────────────┐    │
│  │PostgreSQL│  │ Auth│  │   Storage  │    │
│  │ + RLS    │  │     │  │  (Fotos)   │    │
│  └──────────┘  └─────┘  └────────────┘    │
└────────────────────────────────────────────┘
```

---

## Capas del Sistema

### 1. Presentación (UI)
- **Ubicación:** `src/components/`
- **Tecnología:** React + shadcn/ui
- **Regla:** NO contienen lógica de negocio

### 2. Acciones (Backend)
- **Ubicación:** `src/lib/actions/`
- **Tecnología:** Next.js Server Actions
- **Regla:** Toda la lógica de negocio aquí

### 3. Datos (Persistencia)
- **Local:** RxDB (IndexedDB encriptado)
- **Cloud:** Supabase PostgreSQL
- **Regla:** RLS en todas las tablas

---

## Flujo de Datos

### Escritura (Create/Update)
```
1. Usuario → Componente
2. Componente → Server Action
3. Server Action → Supabase (validación + RLS)
4. Supabase → Trigger (integridad)
5. RxDB ← Sync ← Supabase
```

### Lectura (Read)
```
1. Usuario → Componente
2. Componente → RxDB (local, instantáneo)
3. Background: RxDB ← Sync ← Supabase
```

---

## Módulos Principales

| Módulo | Archivos | Propósito |
|--------|----------|-----------|
| **Caja** | `caja-actions.ts` | Apertura, cierre, movimientos |
| **Créditos** | `creditos-actions.ts` | CRUD de préstamos |
| **Pagos** | `pagos-actions.ts` | Cobros y recibos |
| **Clientes** | `clientes-actions.ts` | CRM básico |
| **Garantías** | `garantias-*-actions.ts` | Inventario de bienes |
| **Tesorería** | `tesoreria-actions.ts` | Multi-cuenta, capital |
| **Reportes** | `reportes-*-actions.ts` | Dashboard, exportaciones |

---

## Decisiones Arquitectónicas (ADRs)

| ADR | Decisión |
|-----|----------|
| ADR-001 | Arquitectura Local-First con RxDB |
| ADR-004 | RxDB para operación offline |
| ADR-005 | AI-Driven Input Normalization |

Ver más en: `/docs/adr/`

---

## Seguridad

### Capas de Protección

1. **Auth:** Supabase Auth (JWT)
2. **RLS:** Row Level Security en PostgreSQL
3. **Validación:** Zod en Server Actions
4. **Encriptación:** RxDB con AES-256 local

### Matriz de Permisos

| Tabla | Admin | Gerente | Cajero |
|-------|-------|---------|--------|
| creditos | CRUD | Read | Read (own) |
| pagos | CRUD | Read | Create |
| cajas | CRUD | Read/Update | Read (own) |
| clientes | CRUD | Read | Read |

---

## Dependencias Críticas

| Paquete | Propósito | Versión |
|---------|-----------|---------|
| next | Framework | 15.x |
| @supabase/ssr | Auth + DB | latest |
| rxdb | Local DB | 15.x |
| decimal.js | Precisión financiera | 10.x |
| zod | Validación | 3.x |

---

## Relacionado

- [SYSTEM_BLUEPRINT.md](./SYSTEM_BLUEPRINT.md) - Blueprint completo
- [04_database.md](./04_database.md) - Modelo de datos
- [03_auth.md](./03_auth.md) - Autenticación

---

*Última actualización: Diciembre 2025*
