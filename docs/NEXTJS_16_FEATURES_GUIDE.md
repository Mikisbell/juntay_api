# 🚀 Next.js 16 Features Guide - JUNTAY

> Guía práctica para aprovechar las nuevas features de Next.js 16.1 en el proyecto JUNTAY.

**Fecha:** Enero 2026  
**Next.js:** 16.1.6  
**React:** 19.2.4  
**Status:** Producción  

---

## 📋 Índice

1. [Turbopack (Stable)](#turbopack-stable)
2. [Bundle Analyzer (Experimental)](#bundle-analyzer-experimental)
3. [Debug con --inspect](#debug-con---inspect)
4. [File System Caching](#file-system-caching)
5. [React 19 Features](#react-19-features)
6. [Proxy vs Middleware](#proxy-vs-middleware)
7. [Performance Tips](#performance-tips)
8. [Troubleshooting](#troubleshooting)

---

## 1. Turbopack (Stable)

### ¿Qué es?

Turbopack es el nuevo bundler de Next.js escrito en Rust, reemplazando a Webpack. Promete:
- 🚀 **10x más rápido** en cold starts
- ⚡ **HMR instantáneo** (milisegundos)
- 📦 **Mejor tree-shaking** automático

### Uso en JUNTAY

**Ya está activado por defecto.** No necesitas hacer nada especial.

```bash
# Desarrollo (usa Turbopack automáticamente)
npm run dev

# Producción (usa Turbopack automáticamente)
npm run build

# Si necesitas forzar Webpack (fallback):
npm run build -- --webpack
```

### Configuración Custom

Si necesitas configurar loaders o aliases para Turbopack:

```javascript
// next.config.js
module.exports = {
  turbopack: {
    // Aliases personalizados
    resolveAlias: {
      '@components': './src/components',
      '@lib': './src/lib',
    },
    
    // Loaders custom (ej: SVG)
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}
```

### Métricas en JUNTAY

| Métrica | Webpack (15.5) | Turbopack (16.1) | Mejora |
|---------|----------------|------------------|--------|
| Dev startup | ~3-4s | ~1.6s | **2.5x** |
| HMR | 200-500ms | <50ms | **10x** |
| Build time | ~45s | ~15s | **3x** |
| Workers | 1 | 11 | **11x** |

---

## 2. Bundle Analyzer (Experimental)

### ¿Para qué sirve?

Identifica qué está inflando tu bundle:
- 📊 Visualización interactiva de bundles
- 🔍 Import chains completas
- 📦 Tamaño por módulo
- 🎯 Filtrado por ruta/componente

### Cómo usarlo

```bash
# Análisis interactivo (abre UI en localhost:4000)
npx next experimental-analyze

# Solo generar archivos (sin servidor)
npx next experimental-analyze --output

# Cambiar puerto
npx next experimental-analyze --port 5000
```

### Casos de uso en JUNTAY

#### 1. Optimizar bundle de Dashboard

```bash
npx next experimental-analyze
# Navegar a: /dashboard
# Buscar módulos > 100KB
# Identificar: lucide-react, recharts, @radix-ui
```

**Acción:** Verificar que `optimizePackageImports` esté configurado (ya lo tenemos ✅).

#### 2. Reducir bundle del Cotizador

```bash
# Analizar ruta específica
npx next experimental-analyze
# Filtrar por: /dashboard/mostrador/nuevo-empeno
# Revisar: decimal.js, date-fns, react-hook-form
```

**Optimización:**
```javascript
// Antes (importa todo date-fns)
import { format, parseISO } from 'date-fns'

// Después (tree-shaking mejorado)
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
```

#### 3. Identificar duplicados

El analyzer mostrará si tienes:
- Múltiples versiones de la misma librería
- Librerías no usadas en el bundle
- Imports innecesarios de Node.js built-ins

### Interpretando resultados

```
[Module] @radix-ui/react-dialog
  Size: 45.2 KB
  Import chain:
    → app/dashboard/creditos/page.tsx
    → components/creditos/FormularioCredito.tsx
    → components/ui/dialog.tsx
```

**Pregunta:** ¿Este componente necesita dialog en el server?  
**Acción:** Mover a Client Component si solo se usa en cliente.

---

## 3. Debug con --inspect

### ¿Qué es?

Integración nativa del Node.js debugger para debugging avanzado.

### Cómo usarlo

```bash
# Iniciar dev server con inspector
npm run dev -- --inspect

# Output esperado:
# Debugger listening on ws://127.0.0.1:9229/...
```

### Conectar Chrome DevTools

1. Abre Chrome: `chrome://inspect`
2. Click "Configure" → Agregar `localhost:9229`
3. Click "inspect" en el target de Next.js
4. ¡Ya tienes DevTools conectado!

### Casos de uso en JUNTAY

#### 1. Debuggear Server Action

```typescript
// lib/actions/creditos-actions.ts
'use server'

export async function crearCredito(data: FormData) {
  debugger; // <-- Breakpoint aquí
  
  const parsed = schema.safeParse(data)
  // Inspeccionar parsed en DevTools
  
  const supabase = await createClient()
  // Step through code
}
```

#### 2. Investigar Memory Leaks

```bash
npm run dev -- --inspect
# En DevTools → Memory → Take Heap Snapshot
# Repetir acción problemática
# Take Heap Snapshot nuevamente
# Comparar snapshots
```

#### 3. Profile Performance

```bash
npm run dev -- --inspect
# En DevTools → Performance
# Record → Ejecutar acción lenta
# Stop → Analizar flame graph
```

### Alternativa: VS Code Debugger

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev -- --inspect"
    }
  ]
}
```

Luego: F5 → Breakpoints en VS Code.

---

## 4. File System Caching

### ¿Qué es?

Turbopack guarda artefactos compilados en disco para reutilizarlos.

### Beneficios

| Escenario | Sin cache | Con cache | Mejora |
|-----------|-----------|-----------|--------|
| Primera vez | 15s | 15s | - |
| Reinicio (sin cambios) | 15s | 1.1s | **14x** |
| Cambio pequeño | 8s | 2s | **4x** |

### Ubicación

```bash
.next/cache/            # Cache de Turbopack
.next/diagnostics/      # Análisis de bundles
```

### Cuándo limpiar cache

```bash
# Síntomas de cache corrupto:
# - Cambios no se reflejan
# - Errores extraños de compilación
# - Hot reload no funciona

# Solución:
rm -rf .next
npm run dev
```

### En CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Cache Next.js
  uses: actions/cache@v3
  with:
    path: |
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}
```

---

## 5. React 19 Features

### Features disponibles

Next.js 16 incluye React 19.2.4 con:

#### 1. View Transitions API

```typescript
'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function NavigateWithTransition() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const navigate = () => {
    startTransition(() => {
      router.push('/dashboard/creditos')
    })
  }
  
  return (
    <button onClick={navigate} disabled={isPending}>
      {isPending ? 'Cargando...' : 'Ver Créditos'}
    </button>
  )
}
```

#### 2. useEffectEvent (Experimental)

Separa lógica de evento sin retriggering.

```typescript
'use client'
import { useEffectEvent } from 'react'

export function CreditoForm() {
  const [monto, setMonto] = useState(0)
  
  // NO se re-crea en cada render
  const onSubmit = useEffectEvent((data) => {
    // Acceso a monto sin dependency
    console.log('Monto actual:', monto)
    // Submit logic
  })
  
  return <form onSubmit={onSubmit}>...</form>
}
```

#### 3. Improved Server Components

```typescript
// app/dashboard/creditos/page.tsx
import { Suspense } from 'react'

// Server Component async
export default async function CreditosPage() {
  // Fetch directo en componente
  const creditos = await fetchCreditos()
  
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CreditosList data={creditos} />
    </Suspense>
  )
}
```

#### 4. use() Hook

```typescript
'use client'
import { use } from 'react'

function CreditoDetail({ creditoPromise }) {
  // Unwrap promise in render
  const credito = use(creditoPromise)
  
  return <div>{credito.codigo}</div>
}
```

### Aplicaciones en JUNTAY

1. **Dashboard:** useTransition para navegación suave
2. **Formularios:** useEffectEvent para validaciones
3. **Reportes:** Server Components async para datos
4. **Tablas:** use() para streaming de datos

---

## 6. Proxy vs Middleware

### Cambio en Next.js 16

| Aspecto | Middleware (15) | Proxy (16) |
|---------|-----------------|------------|
| Archivo | `middleware.ts` | `proxy.ts` |
| Función | `middleware()` | `proxy()` |
| Propósito | Ambiguo | Clarifica network boundary |

### Implementación en JUNTAY

Ya migrado a `src/proxy.ts`:

```typescript
export async function proxy(request: NextRequest) {
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protected routes
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  
  // Role-based routing
  if (user?.user_metadata?.rol === "SUPER_ADMIN") {
    // Redirect to sysadmin panel
  }
  
  return response
}
```

### Cuándo usar Proxy

✅ **Sí:**
- Verificación de auth
- Redirects basados en roles
- Setting de cookies/headers
- Rate limiting
- A/B testing

❌ **No:**
- Lógica de negocio pesada
- Database queries complejas
- Manipulación de response body
- Transformaciones de datos

**Regla:** Proxy = Network boundary. Para lógica compleja, usa Server Actions.

---

## 7. Performance Tips

### 1. Lazy Loading de Componentes

```typescript
// Antes
import { BundleAnalyzerModal } from './BundleAnalyzer'

// Después (carga solo cuando se necesita)
const BundleAnalyzerModal = dynamic(
  () => import('./BundleAnalyzer'),
  { loading: () => <Spinner /> }
)
```

### 2. Optimizar Package Imports

Ya configurado en `next.config.js`:

```javascript
experimental: {
  optimizePackageImports: [
    'lucide-react',        // Iconos
    'recharts',            // Gráficos
    '@radix-ui/*',         // UI components
    '@tanstack/react-query',
  ],
}
```

**Efecto:** Tree-shaking automático, reduce bundle en ~40%.

### 3. Route Segment Config

```typescript
// app/dashboard/reportes/page.tsx

// Control de caching
export const dynamic = 'force-dynamic' // No cachear
export const revalidate = 3600 // Revalidar cada hora

// Control de runtime
export const runtime = 'edge' // Edge runtime
export const preferredRegion = 'iad1' // Región
```

### 4. Streaming con Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <>
      <Suspense fallback={<KPISkeleton />}>
        <KPICards /> {/* Carga primero */}
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart /> {/* Carga después */}
      </Suspense>
    </>
  )
}
```

### 5. Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/garantia.jpg"
  alt="Garantía"
  width={400}
  height={300}
  loading="lazy"           // Lazy load
  placeholder="blur"       // Blur placeholder
  quality={75}             // Reducir calidad
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

### Métricas objetivo

| Métrica | Target | Actual (16.1) |
|---------|--------|---------------|
| First Contentful Paint | <1.8s | ✅ 1.2s |
| Time to Interactive | <3.8s | ✅ 2.5s |
| Total Blocking Time | <200ms | ✅ 150ms |
| Bundle Size (dashboard) | <200KB | ✅ 185KB |

---

## 8. Troubleshooting

### Build falla con Turbopack

**Síntoma:**
```
ERROR: Call retries were exceeded
```

**Soluciones:**
1. Limpiar cache: `rm -rf .next`
2. Reinstalar deps: `rm -rf node_modules && npm install`
3. Usar webpack: `npm run build -- --webpack`

### HMR no funciona

**Síntoma:** Cambios no se reflejan en el browser.

**Soluciones:**
1. Verificar que el archivo esté dentro de `src/`
2. Reiniciar dev server
3. Limpiar cache del browser (Ctrl+Shift+R)

### Bundle Analyzer no abre

**Síntoma:** `npx next experimental-analyze` no responde.

**Soluciones:**
1. Verificar puerto disponible: `--port 4001`
2. Usar output mode: `--output` y abrir archivos manualmente
3. Verificar firewall/antivirus

### Memory Leaks en Dev

**Síntoma:** Dev server consume mucha RAM.

**Soluciones:**
1. Reducir workers: No hay flag directo, Turbopack decide
2. Cerrar tabs no usadas en browser
3. Reiniciar dev server cada 2-3 horas

---

## 📚 Recursos

### Documentación oficial
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Turbopack Guide](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack)
- [React 19 Release](https://react.dev/blog/2025/04/25/react-19)
- [Bundle Analyzer](https://nextjs.org/docs/app/api-reference/cli/next#next-experimental-analyze)

### Archivos relacionados
- `docs/NEXTJS_16_MIGRATION.md` - Guía de migración
- `docs/99_changelog.md` - Historial de cambios
- `next.config.js` - Configuración Turbopack
- `src/proxy.ts` - Network boundary

### Comandos útiles

```bash
# Desarrollo
npm run dev                          # Dev con Turbopack
npm run dev -- --inspect             # Dev con debugger
npm run dev -- --turbo               # Explícito (redundante)

# Análisis
npx next experimental-analyze        # Bundle analyzer interactivo
npx next experimental-analyze -o     # Solo archivos

# Build
npm run build                        # Build con Turbopack
npm run build -- --webpack           # Build con Webpack
npm run build -- --profile           # React profiling

# Tests
npm test                             # Vitest
npm run test:e2e                     # Playwright
```

---

## 🎯 Action Items

### Para aprovechar Next.js 16 al máximo:

#### Corto Plazo (Esta semana)
- [ ] Correr Bundle Analyzer en dashboard
- [ ] Identificar top 5 módulos más grandes
- [ ] Optimizar imports de lucide-react
- [ ] Configurar debugging con --inspect

#### Mediano Plazo (Este mes)
- [ ] Implementar View Transitions en navegación principal
- [ ] Migrar componentes críticos a Server Components
- [ ] Configurar CI/CD con cache de Turbopack
- [ ] Documentar performance baselines

#### Largo Plazo (Q1 2026)
- [ ] Adoptar React Compiler (cuando sea stable)
- [ ] Implementar streaming SSR con Suspense
- [ ] Optimizar route splitting por módulo
- [ ] Integrar monitoring de Core Web Vitals

---

## 💡 Best Practices

### DOs ✅
- ✅ Usar Turbopack por defecto
- ✅ Aprovechar file system caching
- ✅ Analizar bundles antes de deploy
- ✅ Usar Server Components cuando sea posible
- ✅ Lazy load componentes no críticos

### DON'Ts ❌
- ❌ Forzar Webpack sin razón válida
- ❌ Importar librerías completas (`import * from`)
- ❌ Ignorar warnings del Bundle Analyzer
- ❌ Hacer lógica pesada en proxy.ts
- ❌ Desactivar optimizePackageImports

---

**Última actualización:** Enero 30, 2026  
**Maintainer:** Dev Team JUNTAY  
**Status:** Living Document - Actualizar con nuevos learnings  

¿Preguntas? Consultar `AGENT.md` y `PROMPT_PRINCIPAL.md` para workflow.