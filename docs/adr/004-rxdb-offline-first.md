# ADR-004: Arquitectura Local-First Real con RxDB

**Status:** ✅ Implemented  
**Date:** 2025-12-13  
**Deciders:** Mikis, Mateo

## Contexto y Problema

Juntay opera en la **Selva Central de Perú** (Chanchamayo, Satipo, Oxapampa) donde la conectividad es intermitente. La arquitectura actual es 100% dependiente de internet - cada operación de caja, empeño o pago requiere conexión a Supabase Cloud.

**Riesgo de negocio:** Cuando se corta la luz o la red (común en zonas rurales durante lluvias torrenciales), el cajero no puede trabajar. Esto significa pérdida directa de ingresos y clientes frustrados.

## Drivers de Decisión

* **Resiliencia:** El negocio NO puede detenerse por falta de internet.
* **Consistencia Financiera:** Los datos de caja y créditos deben ser transaccionalmente correctos.
* **Sincronización:** Múltiples tiendas deben poder operar offline y sincronizar cuando vuelva la conexión.
* **Mantenibilidad:** Solución que no requiera infraestructura adicional compleja.

## Opciones Consideradas

### Opción 1: Queue Offline Simple (localStorage)

```javascript
// Guardar mutaciones en localStorage cuando no hay red
saveToOfflineQueue('crear_empeno', variables)
```

**RECHAZADA:**

* No es transaccional
* No maneja conflictos entre dispositivos
* Alto riesgo de inconsistencia en datos financieros
* Race conditions entre cajeros

### Opción 2: PowerSync / ElectricSQL

* SQLite en el cliente (WASM)

* Servicio adicional de sincronización

**RECHAZADA por ahora:**

* Requiere infraestructura adicional (servicio de sync)
* Mayor complejidad operacional
* Curva de aprendizaje más alta

### Opción 3: RxDB + Supabase Replication Plugin ✅

* Base de datos NoSQL reactiva en el navegador

* Sincronización bidireccional con Supabase (PostgreSQL)
* No requiere servidores adicionales

## Resultado de la Decisión

Opción elegida: **Opción 3: RxDB con Supabase Replication**.

### Justificación

RxDB ofrece el mejor balance entre:

1. **Facilidad de implementación:** Es una librería npm, no infraestructura
2. **Compatibilidad:** Plugin oficial para Supabase
3. **Madurez:** Proyecto establecido con buena documentación
4. **Costo:** Open-source para nuestro caso de uso (storage Dexie.js)

### Arquitectura Resultante

```
┌─────────────────────────────────────────────────────────────┐
│                         TIENDA                               │
│  ┌─────────────┐     ┌──────────────────┐                   │
│  │   Browser   │     │    RxDB          │                   │
│  │   (React)   │◄───►│  (IndexedDB)     │                   │
│  │             │     │                  │                   │
│  └─────────────┘     └────────┬─────────┘                   │
│                               │                              │
│                    ╔══════════╧══════════╗                   │
│                    ║   SYNC ENGINE       ║                   │
│                    ║  (cuando hay red)   ║                   │
│                    ╚══════════╤══════════╝                   │
└───────────────────────────────┼──────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   SUPABASE CLOUD      │
                    │   (PostgreSQL)        │
                    │   "Source of Truth"   │
                    └───────────────────────┘
```

### Flujo de Datos

1. **Usuario opera:** Crea empeño, registra pago, etc.
2. **RxDB guarda localmente:** Instantáneo, sin esperar red
3. **UI responde:** El usuario ve confirmación inmediata
4. **Sync en background:** Cuando hay conexión, RxDB sincroniza con Supabase
5. **Conflictos:** Resueltos con "Last Write Wins" (timestamp `_modified`)

### Tablas a Sincronizar

| Tabla | Dirección | Prioridad |
|-------|-----------|-----------|
| `creditos` | Bidireccional | Alta |
| `pagos` | Bidireccional | Alta |
| `cajas_operativas` | Bidireccional | Alta |
| `movimientos_caja_operativa` | Bidireccional | Alta |
| `garantias` | Bidireccional | Alta |
| `clientes` | Pull-only | Media |

### Consecuencias Positivas

* **Resiliencia total:** El negocio opera sin importar la conexión
* **UX superior:** Operaciones instantáneas (latencia cero)
* **Sincronización automática:** Sin intervención manual del usuario
* **Compatible con stack actual:** No requiere reescribir el backend

### Consecuencias Negativas

* **Complejidad adicional:** Nueva capa de datos en el cliente
* **Cambios en DB:** Requiere campos `_modified` y `_deleted` en tablas
* **Migraciones necesarias:** Schemas de RxDB deben coincidir con Supabase
* **Conflictos posibles:** Aunque raros, pueden ocurrir (mitigados con estrategia definida)

## Notas de Implementación

1. **Soft Delete obligatorio:** No usar `DELETE`, solo `UPDATE _deleted = true`
2. **Primary keys como strings:** RxDB requiere que todas las PK sean texto (UUID)
3. **Campos de sincronización:** Agregar `_modified` (timestamp) y `_deleted` (boolean) a todas las tablas replicadas
4. **Triggers automáticos:** Usar extensión `moddatetime` para actualizar `_modified` automáticamente
5. **Realtime habilitado:** Las tablas deben estar en la publicación `supabase_realtime`

## Plan de Migración

Ver [implementation_plan.md](/home/mateo/.gemini/antigravity/brain/6000327d-71b2-4f15-83be-3089b76e08a5/implementation_plan.md) para el plan detallado.

Estimación: **~9 días de trabajo**.

## Referencias

* [RxDB Supabase Replication Plugin](https://rxdb.info/replication-supabase.html)
* [RxDB Documentation](https://rxdb.info/)
* [ADR-001: Entorno de Desarrollo](./001-local-first-architecture.md)
