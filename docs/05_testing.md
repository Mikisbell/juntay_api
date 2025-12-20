# 🧪 Estrategia de Testing

> Guía de testing para JUNTAY.

---

## Stack de Testing

| Tipo | Herramienta | Ubicación |
|------|-------------|-----------|
| Unit | Vitest | `src/**/*.test.ts` |
| Component | Testing Library | `src/**/*.test.tsx` |
| Integration | tsx scripts | `scripts/test-*.ts` |
| E2E | Playwright | `tests/e2e/` |

---

## Comandos

```bash
# Unit tests
npm test

# Unit tests en modo watch
npm test -- --watch

# E2E tests
npm run test:e2e

# Integration tests
npx tsx scripts/test-e2e-q3.ts

# Coverage
npm test -- --coverage
```

---

## Estructura de Tests

```
src/
├── lib/
│   └── actions/
│       ├── caja-actions.ts
│       └── caja-actions.test.ts  ← Junto al código
scripts/
├── test-e2e-q3.ts               ← Integration tests
├── test-l2-integration.ts
└── test-interes-flexible.ts
```

---

## Convenciones

### Naming
- `*.test.ts` para unit tests
- `*.spec.ts` para specs
- `test-*.ts` para scripts de integración

### Estructura de Test

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('nombreModulo', () => {
    describe('nombreFuncion', () => {
        it('should do expected behavior', async () => {
            // Arrange
            const input = { ... }
            
            // Act
            const result = await funcion(input)
            
            // Assert
            expect(result).toEqual(expected)
        })
    })
})
```

---

## Mocking Supabase

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                data: mockData,
                error: null
            }))
        }))
    }))
}))
```

---

## Tests de Integración (E2E con DB)

Los scripts en `/scripts/test-*.ts` conectan a la DB real:

```typescript
// scripts/test-e2e-q3.ts
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// Test real CRUD
const { data, error } = await supabase
    .from('sucursales')
    .insert({ codigo: 'TEST', nombre: 'Test' })
    .select()
    .single()

// Cleanup
await supabase.from('sucursales').delete().eq('id', data.id)
```

---

## Coverage Goals

| Nivel | Target | Actual |
|-------|--------|--------|
| Unit tests | 80% | TBD |
| Actions | 100% | ~70% |
| E2E critical paths | 100% | ✅ 24/24 |

---

## Tests Actuales

### Unit Tests (Vitest)
- 9 archivos de test
- 43 tests pasando

### Integration Tests
- `test-e2e-q3.ts` - 24 tests (Scoring, Banco, Sucursales, Remates, Cobrador, Fotos)
- `test-l2-integration.ts` - 4 tests CRUD

---

## Reglas (AGENT.md)

1. **Todo feature nuevo debe incluir tests**
2. Tests deben pasar antes de proponer commits
3. No feature está completa sin tests
4. Coverage target: ≥ 80%

---

*Última actualización: Diciembre 2025*
