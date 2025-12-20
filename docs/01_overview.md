# 🎯 Visión General de JUNTAY

> Introducción al proyecto para nuevos desarrolladores y stakeholders.

---

## ¿Qué es JUNTAY?

**JUNTAY** es un sistema de gestión financiera diseñado para casas de empeño modernas. Permite:

- ✅ Gestión de créditos prendarios
- ✅ Control de garantías (joyas, electrónicos, etc.)
- ✅ Caja operativa con cierre diario
- ✅ Recordatorios automáticos por WhatsApp
- ✅ Operación offline-first

---

## Modelo de Negocio

```
Cliente → Deja garantía → Recibe préstamo → Paga cuotas → Recupera garantía
              ↓
         Si no paga
              ↓
       Garantía → Remate
```

---

## Usuarios del Sistema

| Rol | Responsabilidades |
|-----|-------------------|
| **Admin** | Configuración, reportes, gestión total |
| **Gerente** | Supervisión de sucursales, ver reportes |
| **Cajero** | Operar caja, crear créditos, cobrar |
| **Cobrador** | Visitas de cobranza en campo |

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 + React 19 + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Local DB | RxDB (offline-first) |
| Finanzas | Decimal.js (precisión exacta) |

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────┐
│            Next.js Frontend             │
│  (React Components + Server Actions)    │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
┌─────────┐           ┌──────────┐
│  RxDB   │◄─────────►│ Supabase │
│ (Local) │   Sync    │ (Cloud)  │
└─────────┘           └──────────┘
```

---

## Repositorio

| Item | Ubicación |
|------|-----------|
| Código | `src/` |
| Actions | `src/lib/actions/` |
| Componentes | `src/components/` |
| Migraciones | `supabase/migrations/` |
| Tests | `src/**/*.test.ts` |
| Scripts | `scripts/` |

---

## Cómo Empezar

```bash
# 1. Clonar
git clone https://github.com/Mikisbell/juntay_api.git
cd juntay_api

# 2. Instalar
npm install

# 3. Configurar
cp .env.example .env

# 4. Base de datos local
npx supabase start

# 5. Desarrollar
npm run dev
```

---

## Documentación Relacionada

- [02_architecture.md](./02_architecture.md) - Arquitectura detallada
- [SYSTEM_BLUEPRINT.md](./SYSTEM_BLUEPRINT.md) - Blueprint técnico completo
- [ROADMAP.md](../ROADMAP.md) - Plan de desarrollo

---

*Última actualización: Diciembre 2025*
