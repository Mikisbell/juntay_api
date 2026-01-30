# 🎯 JUNTAY - Event Architecture

> **Versión:** 1.0.0  
> **Última actualización:** Diciembre 2024  
> **Estado:** ✅ Implementado y Operacional

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Decisiones de Arquitectura](#decisiones-de-arquitectura)
3. [Estructura del Sistema](#estructura-del-sistema)
4. [Uso del Sistema de Eventos](#uso-del-sistema-de-eventos)
5. [Dashboard System Health](#dashboard-system-health)
6. [Integración con Módulos](#integración-con-módulos)
7. [Mejores Prácticas](#mejores-prácticas)
8. [Troubleshooting](#troubleshooting)
9. [Roadmap](#roadmap)

---

## 🌟 Visión General

JUNTAY implementa un **sistema de eventos centralizado y observable** para:

- **Monitoreo en tiempo real** de todos los módulos del sistema
- **Debugging eficiente** con logs estructurados y trazabilidad
- **Alertas proactivas** para errores críticos y problemas de sincronización
- **Auditoría completa** de eventos de seguridad y negocio

### Arquitectura Reactiva

```
┌─────────────────────────────────────────────────────────┐
│                    JUNTAY APPLICATION                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  RxDB    │  │   Auth   │  │ Business │  │   UI    │ │
│  │ Replica. │  │  Events  │  │  Logic   │  │ Events  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │             │             │       │
│       └─────────────┴─────────────┴─────────────┘       │
│                         │                               │
│                         ▼                               │
│          ┌──────────────────────────────┐               │
│          │   System Events Store        │               │
│          │   (Zustand + DevTools)       │               │
│          └──────────────┬───────────────┘               │
│                         │                               │
│                         ▼                               │
│          ┌──────────────────────────────┐               │
│          │   System Health Dashboard    │               │
│          │   Real-time Monitoring       │               │
│          └──────────────────────────────┘               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Decisiones de Arquitectura

### ¿Por qué Zustand y no EventEmitter?

| Criterio | EventEmitter (Node.js) | **Zustand (Elegido)** |
|----------|------------------------|------------------------|
| **React Integration** | ⚠️ Requiere wrapping manual | ✅ Nativo para React |
| **DevTools** | ❌ No disponible | ✅ Redux DevTools out-of-the-box |
| **TypeScript** | ⚠️ Soporte básico | ✅ TypeScript-first design |
| **Performance** | ✅ Muy rápido | ✅ Optimizado para React |
| **State Persistence** | ❌ No incluido | ✅ Built-in middleware |
| **Time Travel Debugging** | ❌ No disponible | ✅ Via DevTools |
| **Learning Curve** | Familiar (Node.js) | Minimal (similar a hooks) |

**Decisión:** Zustand porque JUNTAY es una aplicación React-first y necesitamos:
1. Integración directa con componentes
2. Debugging visual (DevTools)
3. TypeScript strict mode compliance

### ¿Por qué no extender RxDB Observables directamente?

**RxDB Observables son excelentes para datos, pero:**

- ❌ Solo observan cambios de base de datos
- ❌ No capturan eventos de sistema (auth, network, errors)
- ❌ No permiten logging centralizado cross-module
- ❌ No tienen severidad/categorización built-in

**System Events Store complementa RxDB:**
- ✅ Observa TODOS los módulos (no solo DB)
- ✅ Agrega contexto (severity, module, category)
- ✅ Centraliza logs para dashboard
- ✅ Permite filtering y analytics

---

## 📦 Estructura del Sistema

### Ubicación de Archivos

```
src/lib/events/
├── system-events-store.ts    # Core store (Zustand)
├── index.ts                   # Public API
└── README.md                  # Documentation

src/app/dashboard/system-health/
└── page.tsx                   # Monitoring dashboard

src/lib/rxdb/
└── replication.ts            # Integración con eventos
```

### Type System

```typescript
// Event Severity (5 niveles)
type EventSeverity = 
  | 'debug'      // Información de desarrollo
  | 'info'       // Eventos normales
  | 'warning'    // Problemas no críticos
  | 'error'      // Errores recuperables
  | 'critical'   // Fallas críticas del sistema

// Modules (7 módulos principales)
type EventModule =
  | 'replication'    // RxDB sync
  | 'auth'          // Authentication
  | 'database'      // DB operations
  | 'business'      // Business logic
  | 'ui'            // UI interactions
  | 'system'        // System-level
  | 'external'      // External APIs

// Categories (7 categorías)
type EventCategory =
  | 'sync'          // Sincronización
  | 'validation'    // Validación de datos
  | 'security'      // Seguridad
  | 'performance'   // Performance
  | 'user_action'   // Acciones de usuario
  | 'background'    // Trabajos en background
  | 'notification'  // Notificaciones
```

### Event Structure

```typescript
interface SystemEvent {
  id: string                     // UUID único
  severity: EventSeverity        // Nivel de severidad
  module: EventModule            // Módulo origen
  category: EventCategory        // Categoría
  message: string                // Mensaje legible
  timestamp: Date                // Timestamp
  metadata?: Record<string, unknown>  // Datos adicionales
  error?: Error                  // Error object si aplica
  userId?: string                // Usuario si aplica
  empresaId?: string             // Tenant si aplica
  acknowledged?: boolean         // Si fue visto
}
```

---

## 🚀 Uso del Sistema de Eventos

### 1. Importación Básica

```typescript
import { useSystemEvents } from '@/lib/events'

function MyComponent() {
  const addEvent = useSystemEvents(state => state.addEvent)
  const events = useSystemEvents(state => state.events)
  
  // Tu lógica aquí
}
```

### 2. Agregar Eventos

#### Método Completo

```typescript
import { useSystemEvents } from '@/lib/events'

// Dentro de tu componente o función
const addEvent = useSystemEvents.getState().addEvent

addEvent({
  severity: 'error',
  module: 'business',
  category: 'validation',
  message: 'Error al procesar pago',
  metadata: {
    creditoId: '123',
    monto: '500.00'
  }
})
```

#### Métodos Helper (Recomendado)

```typescript
const { 
  logReplicationError,
  logAuthEvent,
  logBusinessEvent,
  logPerformanceWarning 
} = useSystemEvents.getState()

// Replication error
logReplicationError('creditos', new Error('Network timeout'))

// Auth event
logAuthEvent('login', 'user-123', true)

// Business event
logBusinessEvent('Crédito aprobado', { 
  creditoId: '456',
  monto: '1000.00' 
})

// Performance warning
logPerformanceWarning('obtenerCartera', 3500) // 3.5 segundos
```

### 3. Consultar Eventos

```typescript
import { useSystemEvents } from '@/lib/events'

function EventViewer() {
  // Get specific module events
  const replicationEvents = useSystemEvents(
    state => state.getByModule('replication')
  )
  
  // Get only errors
  const errors = useSystemEvents(state => state.getErrors())
  
  // Get unacknowledged
  const unread = useSystemEvents(state => state.getUnacknowledged())
  
  // Get recent 10
  const recent = useSystemEvents(state => state.getRecent(10))
  
  return (
    <div>
      {recent.map(event => (
        <div key={event.id}>{event.message}</div>
      ))}
    </div>
  )
}
```

### 4. Hooks Convenientes

```typescript
import {
  useCriticalEvents,
  useErrorCount,
  useUnacknowledgedCount,
  useModuleEvents
} from '@/lib/events'

function StatusBar() {
  const criticalEvents = useCriticalEvents()
  const errorCount = useErrorCount()
  const unreadCount = useUnacknowledgedCount()
  const replicationEvents = useModuleEvents('replication')
  
  return (
    <div>
      Errores: {errorCount} | Sin leer: {unreadCount}
    </div>
  )
}
```

---

## 📊 Dashboard System Health

### Ubicación

```
/dashboard/system-health
```

### Características

#### 1. Top 3 Métricas Críticas

- **Errores Activos**: Contador de errores no resueltos
- **Estado de Red**: Online/Offline detection
- **Sincronización**: Estado de replicación RxDB ↔ Supabase

#### 2. Estadísticas por Módulo

Gráfico de barras mostrando eventos por módulo:
- Replication
- Auth
- Database
- Business
- UI
- System
- External

#### 3. Estadísticas por Severidad

Distribución de eventos:
- Critical (🚨)
- Error (❌)
- Warning (⚠️)
- Info (ℹ️)
- Debug (🐛)

#### 4. Log en Tiempo Real

- **Últimos 50 eventos** con scroll infinito
- **Filtrado** por módulo, severidad, categoría
- **Detalles expandibles** (metadata, stack trace)
- **Marcar como leído** individual o masivo

#### 5. System Info Cards

- RxDB Status (5 colecciones)
- Supabase Status (Connected/Disconnected)
- Performance (Óptimo/Degradado)

### Acceso Según Rol

| Rol | Acceso |
|-----|--------|
| **SUPER_ADMIN** | ✅ Full access (todas las empresas) |
| **ADMIN** | ✅ Solo eventos de su empresa |
| **GERENTE** | ⚠️ Solo critical/error events |
| **CAJERO** | ❌ No access |

---

## 🔌 Integración con Módulos

### RxDB Replication (Implementado)

```typescript
// src/lib/rxdb/replication.ts

import { useSystemEvents } from '@/lib/events'

replications.creditos.error$.subscribe(err => {
  if (!isNetworkError(err)) {
    // Log to event store
    useSystemEvents.getState().logReplicationError('creditos', err)
    
    // Additional handling for conflicts
    if (err.code === 'CONFLICT') {
      useSystemEvents.getState().addEvent({
        severity: 'warning',
        module: 'replication',
        category: 'sync',
        message: 'Conflicto detectado en créditos',
        metadata: { collection: 'creditos', code: err.code }
      })
    }
  }
})
```

### Server Actions (Próximamente)

```typescript
// src/lib/actions/creditos-actions.ts

'use server'

import { useSystemEvents } from '@/lib/events'

export async function crearCredito(data: CreditoInput) {
  try {
    // Validación
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      useSystemEvents.getState().addEvent({
        severity: 'warning',
        module: 'business',
        category: 'validation',
        message: 'Validación de crédito fallida',
        metadata: { errors: parsed.error }
      })
      return { error: 'Datos inválidos' }
    }
    
    // Lógica de negocio
    const result = await supabase.from('creditos').insert(parsed.data)
    
    // Log success
    useSystemEvents.getState().logBusinessEvent('Crédito creado', {
      creditoId: result.data.id,
      monto: parsed.data.monto_prestado
    })
    
    return { success: true, data: result.data }
  } catch (error) {
    // Log error
    useSystemEvents.getState().addEvent({
      severity: 'error',
      module: 'business',
      category: 'user_action',
      message: 'Error al crear crédito',
      error: error as Error
    })
    throw error
  }
}
```

### Auth Events (Próximamente)

```typescript
// src/lib/auth/middleware.ts

export async function middleware(request: NextRequest) {
  const { user } = await supabase.auth.getUser()
  
  if (!user && isProtectedRoute) {
    useSystemEvents.getState().logAuthEvent(
      'unauthorized_access_attempt',
      'anonymous',
      false
    )
    return NextResponse.redirect('/login')
  }
  
  if (user) {
    useSystemEvents.getState().logAuthEvent(
      'authenticated_request',
      user.id,
      true
    )
  }
  
  return NextResponse.next()
}
```

---

## ✅ Mejores Prácticas

### 1. Cuándo Usar Cada Severidad

```typescript
// DEBUG - Solo en desarrollo, información de debugging
addEvent({ severity: 'debug', ... })

// INFO - Eventos normales del sistema
logBusinessEvent('Cliente creado exitosamente')

// WARNING - Problemas no críticos, el sistema sigue funcionando
logPerformanceWarning('obtenerCartera', 2500)

// ERROR - Error recuperable, requiere atención
logReplicationError('creditos', new Error('Timeout'))

// CRITICAL - Falla crítica, el sistema no puede continuar
addEvent({ 
  severity: 'critical',
  message: 'Database connection lost'
})
```

### 2. Metadata Útil

```typescript
// ✅ BUENO - Metadata estructurada
addEvent({
  severity: 'error',
  module: 'business',
  category: 'validation',
  message: 'Pago rechazado',
  metadata: {
    creditoId: '123',
    monto: '500.00',
    razon: 'fondos_insuficientes',
    timestamp: Date.now()
  }
})

// ❌ MALO - Información insuficiente
addEvent({
  severity: 'error',
  module: 'business',
  category: 'validation',
  message: 'Error en pago'
})
```

### 3. No Abusar de Critical

```typescript
// ❌ MALO - Critical usado para errores comunes
addEvent({ severity: 'critical', message: 'Cliente no encontrado' })

// ✅ BUENO - Critical solo para fallas de sistema
addEvent({ 
  severity: 'critical', 
  message: 'RxDB database corruption detected' 
})
```

### 4. Limpieza de Eventos

```typescript
// En production, limpiar eventos viejos periódicamente
useEffect(() => {
  const interval = setInterval(() => {
    // Limpiar eventos de más de 1 hora
    useSystemEvents.getState().clearOldEvents(60)
  }, 60000) // Cada minuto
  
  return () => clearInterval(interval)
}, [])
```

### 5. Contextualización con Tenant

```typescript
// Siempre incluir empresaId en contextos multi-tenant
const { empresaId } = await getEmpresaActual()

addEvent({
  severity: 'info',
  module: 'business',
  category: 'user_action',
  message: 'Crédito aprobado',
  empresaId,  // ← Importante para filtering
  metadata: { creditoId: '456' }
})
```

---

## 🔧 Troubleshooting

### Problema: Eventos No Aparecen en Dashboard

**Solución:**

1. Verificar que `addEvent` se está llamando:
   ```typescript
   console.log('Event added:', useSystemEvents.getState().events.length)
   ```

2. Verificar que no está pausado:
   ```typescript
   console.log('Paused:', useSystemEvents.getState().isPaused)
   ```

3. Abrir Redux DevTools y verificar actions

### Problema: Performance Issues

Si tienes muchos eventos (>1000), considera:

```typescript
// Reducir max events
useSystemEvents.getState().setMaxEvents(100)

// Limpiar más frecuentemente
useSystemEvents.getState().clearOldEvents(30) // 30 min
```

### Problema: TypeScript Errors

```typescript
// Si TypeScript se queja de módulos no existentes
import type { EventModule } from '@/lib/events'

const module: EventModule = 'replication' // ✅ Autocomplete
```

---

## 🗺️ Roadmap

### ✅ Fase 1: Fundamentos (Completado)

- [x] Zustand store básico
- [x] Type system completo
- [x] Integración con RxDB replication
- [x] Dashboard System Health MVP
- [x] Helper methods

### 🔄 Fase 2: Integración (En Progreso)

- [ ] Integración con todos los Server Actions
- [ ] Auth events en middleware
- [ ] Performance monitoring automático
- [ ] Export de eventos a CSV/JSON

### 📋 Fase 3: Avanzado (Q1 2026)

- [ ] Event filtering por tenant
- [ ] Alertas push para critical events
- [ ] Integration con external monitoring (Sentry)
- [ ] Event analytics dashboard
- [ ] Webhook support para external systems

### 🚀 Fase 4: Enterprise (Q2 2026)

- [ ] Event retention policies (30/60/90 días)
- [ ] Compliance logging (GDPR, SOC2)
- [ ] Advanced filtering y search
- [ ] Event playback (time travel)
- [ ] AI-powered anomaly detection

---

## 📚 Referencias

### Documentos Relacionados

- [SYSTEM_BLUEPRINT.md](./SYSTEM_BLUEPRINT.md) - Arquitectura general
- [AGENT.md](../AGENT.md) - Reglas de desarrollo
- [06_conventions.md](./06_conventions.md) - Convenciones de código

### Librerías Utilizadas

- [Zustand](https://github.com/pmndrs/zustand) - State management
- [date-fns](https://date-fns.org/) - Date formatting
- [Lucide React](https://lucide.dev/) - Iconos

### Patrones de Diseño

- **Observer Pattern**: Subscribers observan cambios en el store
- **Pub/Sub Pattern**: Eventos publicados, múltiples suscriptores
- **Singleton Pattern**: Store único global

---

## 🤝 Contribución

Para agregar nuevos módulos o categorías:

1. Actualizar types en `system-events-store.ts`
2. Documentar en este archivo
3. Actualizar dashboard si es necesario
4. Agregar tests (próximamente)

---

**Versión:** 1.0.0  
**Mantenido por:** JUNTAY Development Team  
**Última revisión:** Diciembre 2024