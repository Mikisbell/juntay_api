# 🚀 Event System - Quick Start Guide

> Guía de inicio rápido de 5 minutos para el sistema de eventos de JUNTAY

---

## ⚡ Setup (Ya está hecho)

El sistema ya está instalado y configurado. Solo necesitas importar:

```typescript
import { useSystemEvents } from '@/lib/events'
```

---

## 📝 Caso de Uso #1: Agregar Evento Simple

```typescript
'use client' // o 'use server'

import { useSystemEvents } from '@/lib/events'

function MiComponente() {
  const handleAction = () => {
    // Agregar evento
    useSystemEvents.getState().addEvent({
      severity: 'info',          // debug | info | warning | error | critical
      module: 'business',        // replication | auth | database | business | ui | system | external
      category: 'user_action',   // sync | validation | security | performance | user_action | background | notification
      message: 'Cliente creado exitosamente',
      metadata: {
        clienteId: '123',
        nombre: 'Juan Pérez'
      }
    })
  }
  
  return <button onClick={handleAction}>Crear Cliente</button>
}
```

---

## 🔥 Caso de Uso #2: Log de Error

```typescript
try {
  const result = await crearCredito(data)
} catch (error) {
  useSystemEvents.getState().addEvent({
    severity: 'error',
    module: 'business',
    category: 'validation',
    message: 'Error al crear crédito',
    error: error as Error,  // ← Incluye stack trace
    metadata: {
      monto: data.monto,
    }
  })
}
```

---

## 🎯 Caso de Uso #3: Helpers Rápidos

```typescript
const { 
  logReplicationError,
  logAuthEvent,
  logBusinessEvent,
  logPerformanceWarning 
} = useSystemEvents.getState()

// Replication error
logReplicationError('creditos', new Error('Timeout'))

// Auth event
logAuthEvent('login', userId, true)

// Business event
logBusinessEvent('Pago registrado', { monto: '500.00' })

// Performance warning (si tarda más de 2s)
const start = performance.now()
await obtenerCartera()
const duration = performance.now() - start
if (duration > 2000) {
  logPerformanceWarning('obtenerCartera', duration)
}
```

---

## 📊 Caso de Uso #4: Mostrar Eventos en UI

```typescript
'use client'

import { useSystemEvents, useErrorCount } from '@/lib/events'

function MiDashboard() {
  // Get recent events
  const recentEvents = useSystemEvents(state => state.getRecent(10))
  
  // Get error count
  const errorCount = useErrorCount()
  
  // Get errors only
  const errors = useSystemEvents(state => state.getErrors())
  
  return (
    <div>
      <h2>Errores: {errorCount}</h2>
      <ul>
        {recentEvents.map(event => (
          <li key={event.id}>{event.message}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 🎨 Caso de Uso #5: Server Actions

```typescript
'use server'

import { useSystemEvents } from '@/lib/events'
import { revalidatePath } from 'next/cache'

export async function crearCredito(data: CreditoInput) {
  try {
    // Validación
    const parsed = creditoSchema.safeParse(data)
    if (!parsed.success) {
      useSystemEvents.getState().addEvent({
        severity: 'warning',
        module: 'business',
        category: 'validation',
        message: 'Datos de crédito inválidos',
        metadata: { errors: parsed.error.errors }
      })
      return { error: 'Datos inválidos' }
    }
    
    // Insert en DB
    const result = await supabase
      .from('creditos')
      .insert(parsed.data)
      .select()
      .single()
    
    // Log success
    useSystemEvents.getState().logBusinessEvent('Crédito creado', {
      creditoId: result.data.id,
      monto: parsed.data.monto_prestado
    })
    
    revalidatePath('/dashboard/creditos')
    return { success: true, data: result.data }
    
  } catch (error) {
    useSystemEvents.getState().addEvent({
      severity: 'error',
      module: 'business',
      category: 'user_action',
      message: 'Error crítico al crear crédito',
      error: error as Error
    })
    return { error: 'Error al crear crédito' }
  }
}
```

---

## 🛠️ Niveles de Severidad (Cuándo Usar Cada Uno)

```typescript
// DEBUG - Solo desarrollo, info técnica detallada
severity: 'debug'
// Ejemplo: "Entrando a función obtenerCartera()"

// INFO - Eventos normales del sistema
severity: 'info'
// Ejemplo: "Cliente creado exitosamente"

// WARNING - Algo no ideal, pero el sistema funciona
severity: 'warning'
// Ejemplo: "Query lenta (2.5s)"

// ERROR - Error recuperable, requiere atención
severity: 'error'
// Ejemplo: "Error al sincronizar créditos"

// CRITICAL - Falla crítica, sistema no puede continuar
severity: 'critical'
// Ejemplo: "Database connection lost"
```

---

## 🔍 Ver Eventos en el Dashboard

1. Navega a `/dashboard/system-health`
2. Verás en tiempo real todos los eventos
3. Filtra por módulo, severidad o categoría
4. Expande metadata para ver detalles

---

## 🐛 Debugging con DevTools

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Redux"
3. Verás todos los eventos en tiempo real
4. Puedes hacer "time travel" (retroceder acciones)

---

## 📋 Cheat Sheet de Módulos y Categorías

### Módulos
- `replication` - RxDB sync
- `auth` - Login, logout, permisos
- `database` - Operaciones Supabase
- `business` - Lógica de negocio (créditos, pagos)
- `ui` - Interacciones de usuario
- `system` - Sistema (build, config)
- `external` - APIs externas (WhatsApp, etc)

### Categorías
- `sync` - Sincronización de datos
- `validation` - Errores de validación
- `security` - Eventos de seguridad
- `performance` - Problemas de performance
- `user_action` - Acciones del usuario
- `background` - Jobs en background
- `notification` - Notificaciones

---

## ⚠️ Errores Comunes

### Error: "useSystemEvents is not a function"

**Solución:**
```typescript
// ❌ MAL
import useSystemEvents from '@/lib/events'

// ✅ BIEN
import { useSystemEvents } from '@/lib/events'
```

### Error: "Cannot call useSystemEvents outside component"

**Solución:**
```typescript
// En Server Actions o fuera de componentes:
useSystemEvents.getState().addEvent(...)

// En componentes React:
const addEvent = useSystemEvents(state => state.addEvent)
addEvent(...)
```

---

## 🎯 Top 3 Métricas para Ver SIEMPRE

```typescript
import { 
  useErrorCount,
  useCriticalEvents,
  useUnacknowledgedCount 
} from '@/lib/events'

function StatusBar() {
  const errorCount = useErrorCount()
  const criticalEvents = useCriticalEvents()
  const unreadCount = useUnacknowledgedCount()
  
  return (
    <div className="flex gap-4">
      <Badge variant={errorCount > 0 ? 'destructive' : 'success'}>
        Errores: {errorCount}
      </Badge>
      <Badge variant={criticalEvents.length > 0 ? 'destructive' : 'success'}>
        Críticos: {criticalEvents.length}
      </Badge>
      <Badge>
        Sin leer: {unreadCount}
      </Badge>
    </div>
  )
}
```

---

## 🔗 Documentación Completa

- **Arquitectura detallada:** `docs/EVENT_ARCHITECTURE.md`
- **Resumen ejecutivo:** `docs/CLEAN_ARCHITECTURE_SUMMARY.md`
- **Código fuente:** `src/lib/events/system-events-store.ts`
- **Dashboard:** `/dashboard/system-health`

---

## 💡 Tips Pro

1. **Usa metadata siempre** - Facilita debugging
2. **No abuses de critical** - Reserva para fallas reales del sistema
3. **Incluye empresaId** - En contextos multi-tenant
4. **Limpia eventos viejos** - Para mantener performance

```typescript
// Limpieza automática cada hora
useEffect(() => {
  const interval = setInterval(() => {
    useSystemEvents.getState().clearOldEvents(60) // 60 minutos
  }, 3600000) // 1 hora
  
  return () => clearInterval(interval)
}, [])
```

---

**¿Dudas?** Lee la documentación completa en `docs/EVENT_ARCHITECTURE.md`

**¿Bug?** Reporta en el dashboard System Health con detalles completos