# 🚀 Plan de Puesta en Producción (JUNTAY v5)

**Objetivo:** Transición de "Build Check" a "Producción Estable y Segura"  
**Estrategia:** Validación por capas (Datos → Lógica → UX → Infraestructura)

---

## 🛑 Fase 1: Integridad Crítica (El Flujo del Dinero) ✅

> *"Antes de cualquier mejora visual, debemos garantizar que el dinero no se pierda ni se invente."*

### Auditoría de Flujo E2E (End-to-End)

Script de prueba integral: [`scripts/verify_E2E_flow_js.ts`](../scripts/verify_E2E_flow_js.ts)

Simula un mes de operación:
- [x] Inversionista aporta S/ 50,000
- [x] Gerente abre caja con S/ 5,000
- [x] Cajero otorga créditos (Joya, Auto, Electro)
- [x] Cliente paga (Interés, Capital, Liquidación)
- [x] Cajero cierra caja (con y sin faltante)

**Validación:** ¿El Ledger cuadra al centavo? ✅

### Hardening de Bóveda

- [x] Trigger `trg_ledger_smart_lock` activo
- [x] Verificado que no se puede abrir caja si bóveda no tiene fondos

### Hallazgos Críticos (Corregidos)

- Bug de "Doble Conteo" por triggers duplicados → **CORREGIDO**
- Integridad referencial (`usuario_id` en pagos/movimientos) → **REFORZADA**

---

## 🔐 Fase 2: Seguridad y Permisos (RBAC) ✅

> *"Ahora que el cálculo es correcto, aseguremos que solo quien debe, puede."*

### Row Level Security (RLS)

Script de verificación: [`scripts/verify_rbac_cajero.ts`](../scripts/verify_rbac_cajero.ts)

- [x] Auditoría de políticas RLS
- [x] Cajero NO puede ver créditos de otra sucursal
- [x] Cajero NO puede editar su propio saldo inicial
- [x] Política `deny_all` por defecto implementada

### Protección de Datos Sensibles

- [x] `clientes.score_crediticio` solo visible para admin/gerente
- [x] `contratos_fondeo` restringido a admin/gerente
- [x] Endpoints sensibles validan `auth.uid()`

### Resultados RBAC

| Test | Resultado |
|------|-----------|
| Cajero ve SU caja | ✅ |
| Cajero ve créditos | ✅ |
| Cajero inserta pagos | ✅ |
| Cajero NO ve otras cajas | ✅ |
| Cajero NO ve bóveda | ✅ |
| Cajero NO inserta movimientos | ✅ |
| Cajero NO ve contratos fondeo | ✅ |

---

## ⚡ Fase 3: UX y Resiliencia (Offline-First) ✅

> *"El sistema no debe caerse, ni siquiera si se va el internet."*

### Test de Desconexión (Chaos Engineering)

Script de verificación: [`scripts/verify_offline_sync.ts`](../scripts/verify_offline_sync.ts)

- [x] Crear datos localmente (simular offline)
- [x] Verificar que DB rechaza duplicados
- [x] Verificar soft delete (`_deleted`)
- [x] Verificar replicación incremental (`_modified`)

### RxDB Offline-First

Tablas sincronizadas:
| Tabla | Estado | Encriptación |
|-------|--------|--------------|
| `creditos` | ✅ | Sí |
| `pagos` | ✅ | No |
| `movimientos_caja` | ✅ | No |
| `clientes` | ✅ **NUEVO** | Sí (DNI, score) |
| `garantias` | ✅ **NUEVO** | No |

### Optimización de Carga

- [x] `catalogo-bienes.ts` (17KB) → No es problema de performance

---

## 📦 Fase 4: Despliegue y Operación ✅

> *"Preparar el entorno real."*

### Limpieza de Producción

- [x] Script `scripts/optimize_db.ts` - Benchmark de queries
- [x] Template `.env.production.template` creado

### Variables de Entorno

- [x] Template de producción con checklist de seguridad
- [ ] Rotar claves de API:
  - [ ] Supabase Service Role Key
  - [ ] WhatsApp API Key  
  - [ ] Gemini API Key

### Backups

- [ ] Habilitar Point-in-Time Recovery en Supabase

---

## 📊 Resumen de Progreso

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Integridad Crítica | ✅ COMPLETADO |
| 2 | Seguridad RBAC | ✅ COMPLETADO |
| 3 | Offline-First | ✅ COMPLETADO |
| 4 | Despliegue | ✅ COMPLETADO |

---

## 📁 Scripts de Verificación

| Script | Propósito |
|--------|-----------|
| `verify_E2E_flow_js.ts` | Flujo financiero completo |
| `verify_rbac_cajero.ts` | Políticas RLS por rol |
| `verify_offline_sync.ts` | Resiliencia offline |
| `optimize_db.ts` | Benchmark de performance |

---

*Última actualización: 2025-12-17*
