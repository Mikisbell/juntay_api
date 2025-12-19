# 📏 Convenciones de Código - JUNTAY

> Guía de estilo y convenciones para mantener consistencia en el proyecto.

---

## 📛 Nomenclatura

### Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componente React | PascalCase | `ClienteCard.tsx` |
| Hook | camelCase con `use` prefix | `useClientes.ts` |
| Server Action | kebab-case con `-actions` suffix | `clientes-actions.ts` |
| Schema Zod | kebab-case con `-schemas` suffix | `empeno-schemas.ts` |
| Utilidad | kebab-case | `format-currency.ts` |
| Constantes | kebab-case | `categorias-bienes.ts` |
| Tipos | kebab-case o junto al archivo que los usa | `database.types.ts` |

### Variables y Funciones

```typescript
// Variables: camelCase
const clienteActual = await getCliente(id)
const totalPagado = calcularTotal(pagos)

// Funciones: camelCase, verbos descriptivos
async function obtenerCliente(id: string) { ... }
function calcularInteresMensual(monto: number, tasa: number) { ... }

// Constantes: UPPER_SNAKE_CASE
const MAX_INTENTOS = 3
const ESTADOS_CREDITO = ['vigente', 'vencido', 'liquidado']

// Tipos/Interfaces: PascalCase
interface Cliente { ... }
type EstadoCredito = 'vigente' | 'vencido' | 'liquidado'

// Enums: PascalCase con valores UPPER_SNAKE_CASE
enum TipoDocumento {
  DNI = 'DNI',
  RUC = 'RUC',
  CE = 'CE'
}
```

---

## 🧩 Componentes React

### Estructura de Componente

```typescript
// 1. Imports (ordenados: react, next, third-party, local)
'use client' // Solo si es necesario

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/format'
import type { Cliente } from '@/types/database'

// 2. Props interface (si es exportado)
interface ClienteCardProps {
  cliente: Cliente
  onSelect?: (id: string) => void
  className?: string
}

// 3. Componente
export function ClienteCard({ cliente, onSelect, className }: ClienteCardProps) {
  // 3a. Hooks primero
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // 3b. Handlers
  const handleClick = () => {
    onSelect?.(cliente.id)
  }
  
  // 3c. JSX
  return (
    <div className={cn('p-4 rounded-lg', className)}>
      {/* ... */}
    </div>
  )
}
```

### Reglas de Componentes

```typescript
// ✅ Componentes pequeños y focalizados
function ClienteAvatar({ nombre, foto }: Props) { ... }  // ~20 líneas

// ❌ Componentes monolíticos
function ClientePage() { ... }  // 500+ líneas

// ✅ Composición sobre herencia
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>

// ✅ Props destructuradas con defaults
function Button({ variant = 'default', size = 'md', ...props }: ButtonProps) { ... }
```

---

## 🔧 Server Actions

### Estructura

```typescript
// src/lib/actions/clientes-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { clienteSchema } from '@/lib/validators/cliente-schemas'
import { revalidatePath } from 'next/cache'

// Tipo de respuesta consistente
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function crearCliente(input: unknown): Promise<ActionResult<Cliente>> {
  // 1. Validar
  const parsed = clienteSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' }
  }
  
  // 2. Ejecutar
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clientes')
    .insert(parsed.data)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  // 3. Revalidar caché
  revalidatePath('/dashboard/clientes')
  
  return { success: true, data }
}
```

---

## 🏷️ TypeScript

### Preferencias

```typescript
// ✅ Tipos explícitos en parámetros de función
function calcular(monto: number, plazo: number): Decimal { ... }

// ✅ Inferencia para variables locales obvias
const clientes = await getClientes() // tipo inferido

// ✅ Usar `interface` para objetos extensibles
interface Cliente {
  id: string
  nombre: string
}

// ✅ Usar `type` para unions, intersections, mapped types
type Estado = 'activo' | 'inactivo'
type ClienteConCreditos = Cliente & { creditos: Credito[] }

// ❌ Evitar `any`
const data: any = await fetch(...) // NO

// ✅ Usar `unknown` + type guards
const data: unknown = await fetch(...)
if (isCliente(data)) { ... }

// ❌ Evitar type assertions innecesarias
const cliente = data as Cliente // NO, si puedes validar

// ✅ Validar en runtime
const cliente = clienteSchema.parse(data) // Zod valida
```

---

## 🎨 Estilos (Tailwind)

### Orden de clases

```tsx
// Orden recomendado: layout → spacing → sizing → visual → states
<div className="
  flex flex-col items-center     /* Layout */
  gap-4 p-6                      /* Spacing */
  w-full max-w-md                /* Sizing */
  bg-white rounded-lg shadow     /* Visual */
  hover:shadow-lg                /* States */
">
```

### Componentes UI

```tsx
// ✅ Usar cn() para merge de clases
import { cn } from '@/lib/utils'

<Button className={cn(
  'base-styles',
  isActive && 'active-styles',
  className
)} />

// ✅ Variantes con cva (class-variance-authority)
const buttonVariants = cva('base', {
  variants: {
    variant: { default: '...', destructive: '...' },
    size: { sm: '...', md: '...', lg: '...' }
  }
})
```

---

## 🧪 Testing

### Nombres de Tests

```typescript
describe('calcularInteres', () => {
  it('debe retornar 0 cuando el monto es 0', () => { ... })
  it('debe calcular correctamente el interés simple', () => { ... })
  it('debe lanzar error con tasa negativa', () => { ... })
})

// Patrón: "debe [verbo] [resultado esperado] [condición opcional]"
```

### Estructura AAA

```typescript
it('debe calcular el interés mensual correctamente', () => {
  // Arrange
  const monto = 1000
  const tasa = 0.10
  
  // Act
  const resultado = calcularInteres(monto, tasa)
  
  // Assert
  expect(resultado).toBe(100)
})
```

---

## 📝 Commits

### Formato

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactorización sin cambio funcional |
| `style` | Cambios de formato (no CSS) |
| `docs` | Documentación |
| `test` | Añadir/modificar tests |
| `chore` | Tareas de mantenimiento |

### Ejemplos

```bash
feat(creditos): añadir cálculo de mora por días vencidos
fix(caja): corregir error en cierre cuando hay pendientes
refactor(pagos): extraer lógica de cuotas a hook
docs: actualizar AGENT.md con nuevas convenciones
test(auth): añadir tests de login fallido
```

---

## 🔐 Seguridad

### Nunca en Frontend

```typescript
// ❌ No exponer keys en cliente
const SUPABASE_SERVICE_KEY = 'eyJ...'  // NO

// ❌ No hacer queries directas desde cliente sin RLS
const { data } = await supabase.from('usuarios').select('*')  // NO

// ✅ Usar Server Actions
const usuarios = await obtenerUsuarios()  // Validación en servidor
```

### Validación

```typescript
// ✅ Siempre validar input del usuario
const parsed = schema.safeParse(userInput)
if (!parsed.success) {
  throw new Error('Input inválido')
}

// ✅ Sanitizar antes de mostrar
import DOMPurify from 'dompurify'
const safeHTML = DOMPurify.sanitize(userInput)
```

---

## 📦 Imports

### Orden

```typescript
// 1. React/Next
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party
import { toast } from 'sonner'
import Decimal from 'decimal.js'

// 3. Componentes UI (@/components/ui)
import { Button } from '@/components/ui/button'

// 4. Componentes de dominio (@/components/*)
import { ClienteCard } from '@/components/clientes/ClienteCard'

// 5. Hooks, utils, types (@/*)
import { useClientes } from '@/hooks/useClientes'
import { formatCurrency } from '@/lib/utils/format'
import type { Cliente } from '@/types/database'

// 6. Relativos (evitar si es posible)
import { helper } from './helper'
```

### Path Aliases

```typescript
// ✅ Usar aliases
import { Button } from '@/components/ui/button'

// ❌ Evitar paths relativos largos
import { Button } from '../../../components/ui/button'
```

---

*Última actualización: Diciembre 2024*
