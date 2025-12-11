# 🏦 MODELO CORREGIDO DE FLUJO DE CAJAS - JUNTAY

## 📋 Documento de Referencia - Migración del Sistema

**Fecha**: 18 de Noviembre 2025  
**Versión**: 2.0 (Modelo Bancario Correcto)  
**Estado**: Listo para migración

---

## 🔄 CICLO COMPLETO DEL DINERO

```
┌──────────────────────────────────────────────────────────────┐
│                      GERENTE DE SEDE                         │
└────────────────────────────────┬─────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
          ┌─────────▼────────┐     ┌─────────▼────────┐
          │  TRANSFERENCIA   │     │    EFECTIVO      │
          │ (Banco/YaPe/Plin)│     │   EN MANO        │
          └─────────┬────────┘     └─────────┬────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │   BÓVEDA CENTRAL          │
                    │ Saldo Total: $50,000      │
                    │ Disponible: $50,000       │
                    │ Asignado a Cajas: $0      │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │  ASIGNACIÓN A CAJAS       │
                    │  (Gerente desconecta)     │
                    │  Caja #1: $10,000         │
                    │  Caja #2: $8,000          │
                    │  Caja #3: $7,000          │
                    └────────────┬──────────────┘
                                 │
        ┌────────────┬───────────┴───────────┬────────────┐
        │            │                       │            │
  ┌─────▼─────┐┌─────▼─────┐         ┌─────▼─────┐┌─────▼─────┐
  │ CAJA #1   ││ CAJA #2   │ ....... │ CAJA #N   ││ EMPLEADO  │
  │Empleado 1 ││Empleado 2 │         │Empleado N ││  1, 2, N  │
  │$10,000    ││$8,000     │         │$7,000     ││           │
  └─────┬─────┘└─────┬─────┘         └─────┬─────┘└─────┬─────┘
        │            │                       │            │
        ├────────────┼───────────────────────┴────────────┤
        │                                                  │
  ┌─────▼──────────────────────────────────────────────────▼──┐
  │            OPERACIONES DEL DÍA                            │
  │  • Préstamos                                              │
  │  • Recepción de pagos                                    │
  │  • Devoluciones de prendas                              │
  └─────┬──────────────────────────────────────────────────┬──┘
        │                                                  │
  ┌─────▼──────────────────────────────────────────────────▼──┐
  │            CIERRE DE CAJA (Fin de Turno)                  │
  │  • Corte de caja                                          │
  │  • Conciliación de efectivo                              │
  │  • Reporte de movimientos                                │
  └─────┬──────────────────────────────────────────────────┬──┘
        │                                                  │
        └────────────┬──────────────────────────────────┬─┘
                     │                                  │
        ┌────────────▼──────────────────────────────────▼─┐
        │  DEVOLUCIÓN A BÓVEDA                            │
        │  Caja #1 devuelve: $9,200                       │
        │  Caja #2 devuelve: $7,800                       │
        │  Total devuelto: $17,000                        │
        └────────────┬──────────────────────────────────┬─┘
                     │                                  │
                    ┌────────────▼──────────────────────▼─┐
                    │   BÓVEDA CENTRAL (Actualizada)    │
                    │ Saldo Total: $67,000              │
                    │ Disponible: $67,000               │
                    │ Asignado a Cajas: $0              │
                    └──────────────────────────────────┘
```

---

## 📊 TABLA DE DATOS CORREGIDA

### ANTES (❌ INCORRECTO)
```
cajas_pesonales (CON TYPO)
├── id
├── usuario_id
├── numero_caja
├── estado (permanente)
├── saldo_total
└── fecha_ultima_actualizacion

Problema: No hay ciclo de apertura/cierre, confusión con "personal"
```

### AHORA (✅ CORRECTO)
```
cajas_operativas
├── id
├── usuario_id (Empleado que la opera)
├── numero_caja
├── estado (abierta/cerrada)
├── saldo_inicial (Lo que gerente asigna)
├── saldo_actual (Dinero presente)
├── saldo_devuelto (Lo que se devuelve al cerrar)
├── gerente_asigno_id (Quién la abrió)
├── fecha_apertura (Inicio de turno)
├── fecha_cierre (Fin de turno)
└── observaciones

movimientos_caja_operativa (NUEVO)
├── id
├── caja_operativa_id
├── tipo (asignacion_inicial, prestamo, pago_prestamo, devolucion_cierre, ajuste)
├── monto
├── saldo_anterior
├── saldo_nuevo
├── referencia_id (ID del crédito/pago)
├── descripcion
├── usuario_registro_id
├── fecha
└── metadata (JSONB - datos extra)

reportes_cierre_caja (NUEVO)
├── id
├── caja_operativa_id
├── saldo_inicial
├── total_prestamos
├── total_pagos_recibidos
├── total_devoluciones
├── total_ajustes
├── saldo_esperado
├── saldo_real
├── diferencia
├── estado_cierre (conciliado, diferencia_menor, diferencia_mayor)
├── generado_por_id
├── fecha_generacion
└── observaciones

movimientos_boveda_auditoria (MEJORADO)
├── id
├── boveda_id
├── tipo (ingreso, asignacion_caja, devolucion_caja, ajuste)
├── monto
├── caja_operativa_id
├── saldo_anterior
├── saldo_nuevo
├── usuario_id
├── referencia
├── fecha
└── metadata
```

---

## 🎯 PROCESOS OPERATIVOS

### 1️⃣ INICIO DE DÍA - GERENTE ABRE CAJAS

```typescript
// Función: aperturaCajaOperativa
aperturaCajaOperativa({
  usuario_id: "emp_001",           // Empleado que abrirá la caja
  numero_caja: 1,                  // Identificador
  saldo_inicial: 10000.00,         // Dinero que el gerente asigna
  gerente_id: "ger_001"            // Quién abre
})

Resultado:
✓ Se crea registro en cajas_operativas
✓ Se registra movimiento en movimientos_caja_operativa (tipo: asignacion_inicial)
✓ Se actualiza boveda: saldo_disponible -10000, saldo_asignado +10000
✓ Se registra en movimientos_boveda_auditoria (tipo: asignacion_caja)
```

### 2️⃣ DURANTE EL DÍA - EMPLEADO OPERA LA CAJA

**Ejemplo A: Préstamo**
```typescript
crearPrestamo({
  caja_operativa_id: "caja_001",
  cliente_id: "cli_001",
  monto: 1000.00,
  tasa: 20,
  frecuencia: "semanal"
})

Resultado:
✓ Se crea crédito con caja_operativa_id = "caja_001"
✓ Se registra movimiento (tipo: prestamo, monto: -1000)
✓ Saldo caja: $10,000 → $9,000
```

**Ejemplo B: Pago de Préstamo**
```typescript
registrarPagoPrestamo({
  prestamo_id: "prestamo_001",
  caja_operativa_id: "caja_001",
  monto_pago: 200.00
})

Resultado:
✓ Se actualiza crédito (capital_pagado += 200)
✓ Se registra movimiento (tipo: pago_prestamo, monto: +200)
✓ Saldo caja: $9,000 → $9,200
```

### 3️⃣ CIERRE DE CAJA - EMPLEADO + GERENTE

```typescript
cierreCajaOperativa({
  caja_operativa_id: "caja_001",
  saldo_real: 9150.00,    // Lo que contó el empleado
  empleado_id: "emp_001",
  gerente_id: "ger_001"
})

Proceso interno:
1. Calcula saldo_esperado desde movimientos
2. Compara con saldo_real
3. Si diferencia < $5 → estado_cierre = 'conciliado'
4. Si diferencia $5-50 → estado_cierre = 'diferencia_menor' (investigar)
5. Si diferencia > $50 → estado_cierre = 'diferencia_mayor' (reporte)
6. Registra en reportes_cierre_caja
7. Devuelve dinero a bóveda

Resultado:
✓ cajas_operativas.estado = 'cerrada'
✓ cajas_operativas.saldo_devuelto = 9150.00
✓ cajas_operativas.fecha_cierre = NOW()
✓ Se registra movimiento (tipo: devolucion_cierre)
✓ Bóveda: saldo_disponible +9150, saldo_asignado -9150
✓ Reporte generado
```

---

## 🔐 SEGURIDAD Y PERMISOS

| Acción | Gerente | Empleado | Admin |
|--------|---------|----------|-------|
| **Crear Caja** | ✅ | ❌ | ✅ |
| **Abrir Caja** | ✅ | ❌ | ✅ |
| **Hacer Préstamos** | ✅ | ✅ (en su caja) | ✅ |
| **Recibir Pagos** | ✅ | ✅ (en su caja) | ✅ |
| **Cerrar Caja** | ✅ | ✅ (solo la propia) | ✅ |
| **Ver Reporte Cierre** | ✅ | ✅ (solo la propia) | ✅ |
| **Ver Auditoría Bóveda** | ✅ | ❌ | ✅ |
| **Hacer Ajustes** | ✅ | ❌ | ✅ |

---

## 📈 VISTAS Y REPORTES DISPONIBLES

### 1. `cajas_activas`
Muestra todas las cajas abiertas en este momento:
```
ID | Caja | Empleado | Saldo Inicial | Saldo Actual | Hora Apertura
```

### 2. `resumen_movimientos_caja`
Resumen de actividad de cada caja:
```
ID | Caja | Empleado | Total Movs | Préstamos | Pagos | Monto Prestado | Monto Pagado | Último Movimiento
```

### 3. `reportes_cierre_caja`
Reportes finales con conciliación:
```
ID | Caja | Saldo Inicial | Total Préstamos | Total Pagos | Saldo Esperado | Saldo Real | Diferencia | Estado
```

---

## 📝 CAMBIOS A REALIZAR EN SERVICIOS

### `bovedaService.ts`
```typescript
// ELIMINAR
- obtenerCajaPersonalPorUsuario()
- obtenerMovimientosCajaPersonal()
- crearCajaPersonal()
- solicitarEfectivoDeBoveda()
- devolverEfectivoABoveda()

// AGREGAR
+ aperturaCajaOperativa()        // Gerente abre caja
+ cierreCajaOperativa()          // Cierre de turno
+ obtenerCajasOperativasActivas() // Cajas abiertas
+ obtenerMovimientosCajaOperativa() // Historial
+ calcularSaldoCajaOperativa()   // Saldo actual
+ registrarMovimientoCaja()      // Registrar movimiento
+ obtenerReporteCierreCaja()     // Reporte de cierre
```

### `creditsService.ts`
```typescript
// MODIFICAR
- crearCreditoDesdeTasacion()
  CAMBIAR: tasacionId, clienteId, montoPrestamo
  POR: cajaOperativaId, tasacionId, clienteId, montoPrestamo

// AGREGAR
+ registrarPagoPrestamoDesdeCaja() // Pago desde caja operativa
```

---

## 🗄️ ÓRDENES DE EJECUCIÓN SQL

1. Crear tabla `cajas_operativas`
2. Crear tabla `movimientos_caja_operativa`
3. Crear tabla `reportes_cierre_caja`
4. Mejorar tabla `movimientos_boveda_auditoria`
5. Agregar columnas a `creditos` (caja_operativa_id, tipo_prestamo)
6. Crear índices
7. Crear RLS policies
8. Crear funciones helper
9. Crear vistas
10. ⚠️ ELIMINAR tabla `cajas_pesonales` (HACER BACKUP PRIMERO)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Ejecutar archivo SQL en Supabase
- [ ] Revisar que no haya errores
- [ ] Hacer backup de datos antiguos
- [ ] Actualizar `bovedaService.ts`
- [ ] Actualizar `creditsService.ts`
- [ ] Crear nuevos componentes React:
  - [ ] `aperturaCaja.tsx`
  - [ ] `operacionesCaja.tsx`
  - [ ] `cierreCaja.tsx`
  - [ ] `reporteCierreCaja.tsx`
- [ ] Actualizar layout de dashboard
- [ ] Pruebas E2E del flujo completo
- [ ] Deploy a producción

---

## 📞 NOTAS IMPORTANTES

1. **Backup**: Hacer backup de `cajas_pesonales` antes de migración
2. **Migración de datos**: Convertir datos antiguos a nuevo formato si es necesario
3. **Transacciones**: Usar transacciones para asegurar consistencia
4. **Auditoría**: Todo debe quedar registrado en movimientos_boveda_auditoria
5. **Reportes**: El cierre de caja es crítico - hacer validaciones exhaustivas

---

**Versión**: 2.0  
**Estado**: 🟢 Listo para implementar
