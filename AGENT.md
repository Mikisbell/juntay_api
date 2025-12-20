# JUNTAY – AI GOVERNANCE DOCUMENT

This document defines how AI agents must behave when working on this repository.

**This is the highest authority for this repository.**

If a rule here conflicts with:
- code
- comments  
- external tutorials
- AI defaults

**THIS DOCUMENT WINS.**

If something is not explicit here or in `/docs`, **STOP and ASK**.

---

## 0. Authority & Scope

This document governs all automated and AI-assisted contributions.

> ⚠️ **ANTES DE EMPEZAR:** Lee `PROMPT_PRINCIPAL.md` primero.

Precedence order:
1. `PROMPT_PRINCIPAL.md` (comportamiento y reglas de interacción)
2. `AGENT.md` (this file - reglas técnicas)
3. `/docs/*.md`
4. Existing code patterns
5. External references

**These rules apply equally to humans and AI contributors.**

AI must cite the document it relied on when proposing changes.

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project name** | JUNTAY |
| **Type** | Frontend Web Application |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict) |
| **Backend** | Supabase (Auth + PostgreSQL) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Local DB** | RxDB (offline-first) |

All architectural and behavioral decisions are documented in `/docs`.

---

## 2. Documentation Rules (CRITICAL)

### 2.1 Documentation as Source of Truth

- `/docs` contains the authoritative documentation.
- AI **MUST** read relevant docs before writing or modifying code.
- If documentation is missing or unclear, **ASK** before proceeding.

### 2.2 Documentation Updates

Any change that affects:
- behavior
- architecture
- data flow
- auth
- public interfaces

**MUST** be reflected in `/docs`.

- Update or append documentation files as needed.
- Add entries to `docs/99_changelog.md` for significant changes.
- AI must cite the document it relied on when proposing changes.

---

## 3. Project Structure Rules

Code is organized by **DOMAIN**.

`/src/modules` is the preferred location for domain logic, but incremental adoption is allowed unless explicitly refactored.

Current structure:
```
src/
├── app/           # Next.js App Router (pages, API routes)
├── components/    # UI organized by domain
│   ├── caja/
│   ├── creditos/
│   ├── pagos/
│   ├── dashboard/
│   ├── cotizador/
│   └── ui/        # Generic shadcn components
├── hooks/         # Global reusable hooks
├── lib/           # Business logic and utilities
│   ├── actions/   # Server Actions
│   ├── supabase/  # Client configuration
│   ├── rxdb/      # Local database
│   ├── validators/# Zod schemas
│   └── utils/     # Helper functions
└── types/         # Global TypeScript types
```

Rules:
- UI components must not contain business logic.
- Services handle Supabase interactions.
- Hooks handle state and side effects.
- Shared utilities go under `/src/shared` (when migrated).

AI **MUST** follow the existing structure unless instructed otherwise.

---

## 4. Coding Conventions

Summary (details in `docs/06_conventions.md`):

- TypeScript strict mode assumed.
- **No `any`** unless explicitly justified.
- Functions must be small and composable.
- Prefer explicit over implicit behavior.
- Spanish comments allowed where helpful.
- No `console.log` in production code.
- Use Decimal.js for all monetary calculations.
- Validate all inputs with Zod.

AI must prefer minimal diffs over stylistic rewrites.

---

## 5. Supabase & Data Access Rules

- Supabase access **ONLY** via service files or Server Actions.
- **Never** call Supabase directly from components.
- Auth logic must follow `docs/03_auth.md`.
- Environment variables must not be modified.
- Row Level Security (RLS) is mandatory for all tables.

Server Actions pattern:
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'

export async function action(input: unknown) {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: 'Invalid input' }
  
  const supabase = await createClient()
  // ... operation
}
```

---

## 6. Testing Strategy

### 6.1 Testing Stack

| Type | Tool |
|------|------|
| Unit tests | Vitest |
| Component tests | Testing Library |
| E2E tests | Playwright |

### 6.2 Testing Rules

- All new features must include tests.
- Test files end with `.test.ts` or `.test.tsx`.
- Coverage target: ≥ 80%.
- Tests must pass before proposing commits.
- No feature is considered complete without tests.

Testing strategy details are in `docs/05_testing.md`.

---

## 7. AI Workflow Rules

### Before modifying code:

1. Read relevant documentation in `/docs`
2. Identify the domain affected
3. Check for existing tests
4. Verify patterns in similar files

### After modifying code:

1. Run `npm run lint`
2. Run `npx tsc --noEmit`
3. Run `npm test`
4. Update documentation if behavior changed

### AI must explain:
- **What** changed
- **Why** it changed
- **Which docs** were updated (if any)

### AI should NOT:
- Delete files without permission
- Introduce new dependencies casually
- Rewrite unrelated code
- Make large refactors without confirmation
- Assume behavior not documented

AI must prefer incremental changes over big rewrites.

---

## 8. Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Unit tests | `npm test` |
| E2E tests | `npx playwright test` |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` |
| Build | `npm run build` |

AI must use these commands when validating changes.

---

## 9. Safety Rules

- **Never** expose secrets or env values in code.
- **Never** bypass auth rules or RLS.
- **Never** auto-commit without explicit approval.
- **Never** use `@ts-ignore` or `eslint-disable` without justification.
- If uncertain, **STOP and ASK**.

---

## 10. Final Principles

```
Correctness > Speed
Documentation > Assumptions  
Small steps > Big rewrites
Ask > Assume
```

---

## Quick Reference: Key Files

| Purpose | Location |
|---------|----------|
| Architecture | `docs/SYSTEM_BLUEPRINT.md` |
| Auth flow | `docs/03_auth.md` |
| Testing | `docs/05_testing.md` |
| Conventions | `docs/06_conventions.md` |
| Roadmap | `ROADMAP.md` |
| Changelog | `docs/99_changelog.md` |

---

*Version: 1.0.0 (Governance Baseline) | Last updated: December 2024*
