# 🏗️ Arquitectura del Sistema Jerárquico de Caja

## 📐 Diagrama de Flujo - Cash Flow Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    BÓVEDA CENTRAL (🏦)                          │
│                                                                 │
│  saldo_total: $50,000                                           │
│  ├─ saldo_disponible: $20,000  (sin asignar)                   │
│  └─ saldo_asignado: $30,000    (en cajas personales)           │
│                                                                 │
│  Acciones:                                                      │
│  • Ingreso de efectivo                                          │
│  • Asignación a cajas personales                               │
│  • Devolución desde cajas personales                           │
│  • Auditoría completa de todos los movimientos               │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    SPLIT INTO          SPLIT INTO            SPLIT INTO
    $10,000             $10,000               $10,000
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐
│ CAJA PERSONAL 1  ││ CAJA PERSONAL 2  ││ CAJA PERSONAL 3  │
│ (Usuario: Juan)  ││ (Usuario: Maria) ││ (Usuario: Pedro) │
│                  ││                  ││                  │
│ saldo_total:     ││ saldo_total:     ││ saldo_total:     │
│ $10,000          ││ $10,000          ││ $10,000          │
│                  ││                  ││                  │
│ Movimientos:     ││ Movimientos:     ││ Movimientos:     │
│ • Asignaciones   ││ • Asignaciones   ││ • Asignaciones   │
│ • Devoluciones   ││ • Devoluciones   ││ • Devoluciones   │
│ • Pagos préstamo ││ • Pagos préstamo ││ • Pagos préstamo │
└──────────────────┘└──────────────────┘└──────────────────┘
      │ FROM                │ FROM                │ FROM
      │ $5,000              │ $8,000              │ $7,000
      ▼                     ▼                     ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐
│  ORIGINAR         ││  ORIGINAR        ││  ORIGINAR        │
│  CRÉDITOS        ││  CRÉDITOS        ││  CRÉDITOS        │
│  (Loans)         ││  (Loans)         ││  (Loans)         │
│                  ││                  ││                  │
│ Basados en:      ││ Basados en:      ││ Basados en:      │
│ • Tasación del   ││ • Tasación del   ││ • Tasación del   │
│   bien (30-85%)  ││   bien (30-85%)  ││   bien (30-85%)  │
│ • Frecuencia de  ││ • Frecuencia de  ││ • Frecuencia de  │
│   pago (5 tipos) ││   pago (5 tipos) ││   pago (5 tipos) │
│ • Tasa de int.   ││ • Tasa de int.   ││ • Tasa de int.   │
│   (18-25%)       ││   (18-25%)       ││   (18-25%)       │
└──────────────────┘└──────────────────┘└──────────────────┘
```

---

## 📊 Diagrama de Tablas - Database Schema

```
┌────────────────────────────────────┐
│     BOVEDA_CENTRAL (único)         │
├────────────────────────────────────┤
│ PK: id (UUID)                      │
│ numero: 1                          │
│ saldo_total: DECIMAL               │
│ saldo_disponible: DECIMAL          │
│ saldo_asignado: DECIMAL            │
│ fecha_creacion: TIMESTAMP          │
│ fecha_ultima_actualizacion: TIME   │
│ descripcion: TEXT                  │
│ estado: VARCHAR (activa|pausa|...)│
└────────────────────────────────────┘
            │
            │ ONE-TO-MANY
            │
            ▼
┌────────────────────────────────────┐
│    CAJAS_PESONALES (por usuario)   │
├────────────────────────────────────┤
│ PK: id (UUID)                      │
│ FK: usuario_id (users.id)          │
│ numero_caja: INTEGER (auto-inc)    │
│ saldo_total: DECIMAL               │
│ estado: VARCHAR (activa|pausa|...)│
│ fecha_apertura: TIMESTAMP          │
│ fecha_ultima_actualizacion: TIME   │
│ descripcion: TEXT                  │
│ UNIQUE: (usuario_id, estado)       │
└────────────────────────────────────┘
            │
            │ ONE-TO-MANY
            │
            ├──────┬────────┬──────────┐
            ▼      ▼        ▼          ▼
    ┌──────────────────────────────────────┐
    │ MOVIMIENTOS_CAJA_PESONAL             │
    ├──────────────────────────────────────┤
    │ PK: id (UUID)                        │
    │ FK: caja_pesonal_id                  │
    │ tipo: VARCHAR (asignacion|devolución)│
    │ monto: DECIMAL                       │
    │ descripcion: TEXT                    │
    │ saldo_anterior: DECIMAL              │
    │ saldo_nuevo: DECIMAL                 │
    │ fecha: TIMESTAMP                     │
    │ referencia: VARCHAR                  │
    └──────────────────────────────────────┘

    ┌──────────────────────────────────────┐
    │ MOVIMIENTOS_BOVEDA_AUDITORIA         │
    ├──────────────────────────────────────┤
    │ PK: id (UUID)                        │
    │ FK: boveda_id                        │
    │ tipo: VARCHAR (ingreso|egreso|...)  │
    │ monto: DECIMAL                       │
    │ descripcion: TEXT                    │
    │ usuario_id: UUID                     │
    │ caja_personal_id: UUID (nullable)    │
    │ fecha: TIMESTAMP                     │
    │ saldo_anterior: DECIMAL              │
    │ saldo_nuevo: DECIMAL                 │
    └──────────────────────────────────────┘
```

---

## 🎯 Diagrama de Procesos

### 1️⃣ INGRESO A BÓVEDA

```
ADMIN
  │
  ├─ Accede a Bóveda Central
  │
  ├─ Ingresa monto y descripción
  │
  ├─ Presiona "Registrar Ingreso"
  │
  └─► SISTEMA:
      ├─ Valida monto > 0
      ├─ Actualiza boveda_central.saldo_total += monto
      ├─ Actualiza boveda_central.saldo_disponible += monto
      ├─ Registra en movimientos_boveda_auditoria
      └─ Notifica: "Ingreso registrado"
```

### 2️⃣ ASIGNACIÓN A CAJA PERSONAL

```
ADMIN
  │
  ├─ Accede a Bóveda Central
  │
  ├─ Ingresa monto y selecciona caja personal
  │
  ├─ Presiona "Asignar a Caja"
  │
  └─► SISTEMA:
      ├─ Valida: monto ≤ saldo_disponible
      ├─ Actualiza boveda_central:
      │  ├─ saldo_disponible -= monto
      │  └─ saldo_asignado += monto
      ├─ Actualiza cajas_pesonales:
      │  └─ saldo_total += monto
      ├─ Registra movimiento en AMBAS tablas
      └─ Notifica: "Efectivo asignado"
```

### 3️⃣ TASACIÓN DE BIEN

```
TASADOR
  │
  ├─ Accede a Tasaciones
  │
  ├─ Selecciona cliente
  │
  ├─ Ingresa:
  │  ├─ Descripción del bien
  │  ├─ Condición (5 opciones)
  │  ├─ Precio de venta en mercado
  │  └─ Observaciones
  │
  ├─ Sistema calcula en TIEMPO REAL:
  │  └─ Monto máximo = Precio × MATRIZ[Condición]
  │
  ├─ Tasador revisa sugerencia
  │
  └─► SISTEMA:
      ├─ Crea registro bienes
      ├─ Crea tasacion con estado 'registrada'
      ├─ Calcula porcentaje_prestamo (30-85%)
      ├─ Calcula monto_prestamo_autorizado
      └─ Notifica: "Tasación registrada"
```

### 4️⃣ ORIGINACIÓN DE CRÉDITO

```
CAJERO
  │
  ├─ Accede a Crear Crédito
  │
  ├─ Selecciona tasación (estado 'registrada')
  │
  ├─ Ingresa:
  │  ├─ Monto solicitado (≤ monto_prestamo_autorizado)
  │  ├─ Frecuencia de pago (5 opciones)
  │  └─ Tasa de interés (manual o sugerida)
  │
  ├─ Sistema calcula:
  │  ├─ Intereses según frecuencia
  │  ├─ Saldo pendiente = Monto + Intereses
  │  └─ Cronograma de cuotas
  │
  ├─ Cajero revisa y confirma
  │
  └─► SISTEMA:
      ├─ Valida: monto ≤ monto_prestamo_autorizado
      ├─ Valida: tasa entre 0-100%
      ├─ Crea credito:
      │  ├─ estado = 'activo'
      │  ├─ tasacion_id = referencia
      │  ├─ caja_personal_id = cajero
      │  └─ monto, tasa, frecuencia
      ├─ Actualiza tasacion.estado = 'en_prenda'
      ├─ Descuenta de caja personal saldo
      └─ Notifica: "Crédito originado"
```

### 5️⃣ DEVOLUCIÓN A BÓVEDA

```
CAJERO
  │
  ├─ Accede a Mi Caja Personal
  │
  ├─ Fin de turno, desea devolver efectivo
  │
  ├─ Ingresa monto a devolver
  │
  ├─ Presiona "Devolver a Bóveda"
  │
  └─► SISTEMA:
      ├─ Valida: monto ≤ saldo_caja
      ├─ Actualiza cajas_pesonales:
      │  └─ saldo_total -= monto
      ├─ Actualiza boveda_central:
      │  ├─ saldo_disponible += monto
      │  └─ saldo_asignado -= monto
      ├─ Registra movimientos
      └─ Notifica: "Efectivo devuelto"
```

---

## 🔐 Flujo de Seguridad

```
┌─────────────────────────────────────────────────────────┐
│           AUTENTICACIÓN & AUTORIZACIÓN                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. USUARIO INICIA SESIÓN (Supabase Auth)             │
│     │                                                  │
│     ├─► auth.users (de Supabase)                      │
│     │                                                  │
│     └─► Obtiene JWT token                             │
│                                                         │
│  2. TOKEN VALIDA VÍA RLS POLICIES                      │
│     │                                                  │
│     ├─ Bóveda Central: Solo ADMIN (role: 'admin')     │
│     │  └─ Policy: auth.jwt() ->> 'role' = 'admin'     │
│     │                                                  │
│     ├─ Cajas Personales: Usuario owna su caja         │
│     │  └─ Policy: auth.uid() = usuario_id             │
│     │                                                  │
│     └─ Movimientos: Usuario ve sus propios             │
│        └─ Policy: Caja → Usuario                      │
│                                                         │
│  3. OPERACIÓN EJECUTADA CON CONTEXTO DE USUARIO        │
│     │                                                  │
│     └─► Auditoría registra: usuario_id                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Persistencia de Datos

```
┌──────────────────────────────────────┐
│    SUPABASE PostgreSQL DATABASE      │
├──────────────────────────────────────┤
│                                      │
│  TABLAS PRINCIPALES:                │
│  ├─ boveda_central (1 fila)         │
│  ├─ cajas_pesonales (1+ filas)      │
│  ├─ bienes (varios)                 │
│  ├─ tasaciones (varios)             │
│  └─ creditos (referencia tasaciones)│
│                                      │
│  TABLAS DE AUDITORÍA:                │
│  ├─ movimientos_boveda_auditoria    │
│  └─ movimientos_caja_pesonal        │
│                                      │
│  ÍNDICES:                            │
│  ├─ idx_cajas_usuario               │
│  ├─ idx_tasaciones_estado           │
│  ├─ idx_creditos_tasacion           │
│  └─ idx_movimientos_fecha           │
│                                      │
└──────────────────────────────────────┘
         ▲
         │
         │ Replicado por Supabase
         │
         ▼
  ┌──────────────┐
  │ BACKUPS      │
  │ (Diario)     │
  └──────────────┘
```

---

## 🎨 Interfaz de Usuario - Component Tree

```
LAYOUT
├─ Header
│  ├─ Logo "JUNTAY"
│  └─ UserMenu (Logout, Profile)
│
└─ Dashboard
   ├─ Sidebar (Navigation)
   │  ├─ 🏦 Bóveda Central
   │  ├─ 💼 Mi Caja Personal
   │  ├─ 📊 Tasaciones
   │  ├─ 📝 Crear Crédito
   │  ├─ Caja
   │  ├─ Clientes
   │  └─ Créditos
   │
   └─ Main Content
      ├─ [BÓVEDA]
      │  ├─ Status Cards (3)
      │  ├─ Progress Bar
      │  ├─ Tabs: Resumen | Movimientos | Acciones
      │  └─ Forms: Ingreso | Asignación
      │
      ├─ [CAJAS PERSONALES]
      │  ├─ Status Cards (3)
      │  ├─ Tabs: Resumen | Movimientos | Acciones
      │  └─ Forms: Solicitar | Devolver
      │
      ├─ [TASACIONES]
      │  ├─ Tabs: Nueva Tasación | Historial
      │  ├─ Form + Sugerencia en tiempo real
      │  └─ Historial filtrable
      │
      └─ [CREAR CRÉDITO]
         ├─ Form: Tasación → Monto → Frecuencia → Tasa
         ├─ Panel lateral: Detalles tasación
         └─ Confirmación
```

---

## 📈 Flujo de Datos

```
USUARIO
  │
  ├─► [Front-End Component]
  │   (React + Next.js)
  │
  ├─► API Client
  │   (supabase.from().select())
  │
  ├─► Supabase (Realtime)
  │   ├─ RLS Policies
  │   └─ Row Level Security
  │
  ├─► PostgreSQL Database
  │   ├─ Lectura/Escritura
  │   ├─ Triggers
  │   └─ Índices
  │
  ├─► [Service Layer]
  │   (TypeScript Services)
  │   ├─ bovedaService
  │   ├─ garantiasService
  │   └─ creditsService
  │
  └─► [Front-End]
      ├─ State Update (React)
      ├─ UI Refresh
      └─ Notificación al usuario
```

---

## ⚡ Performance Optimization

```
ÍNDICES DE BASE DE DATOS
├─ cajas_pesonales(usuario_id)          → Búsquedas por usuario
├─ cajas_pesonales(estado)              → Filtros de estado
├─ movimientos_caja_pesonal(fecha)      → Ordenamiento temporal
├─ movimientos_boveda_auditoria(fecha)  → Auditoría ordenada
├─ tasaciones(cliente_id)               → Búsquedas por cliente
├─ tasaciones(estado)                   → Filtros de estado
└─ creditos(tasacion_id)                → Relación crédito-tasación

CACHING EN CLIENTE
├─ useEffect dependencias               → Evita re-renders
├─ useState para estado local            → Minimiza queries
└─ Auto-refresh cada 30 segundos         → Mantiene datos frescos

VALIDACIONES EN CLIENTE
├─ Campos requeridos                    → Previene requests vacíos
├─ Ranges de números                    → Evita valores inválidos
└─ Disponibilidad verificada            → Previene errores de BD
```

---

## 🔄 Ciclo de Vida de un Crédito

```
┌──────────────┐
│  REGISTRADA  │ ◄─── Tasación creada, esperando crédito
│              │
└──────┬───────┘
       │ Cliente solicita crédito
       ▼
┌──────────────┐
│   ACTIVO     │ ◄─── Crédito originado, saldo pendiente > 0
│              │ ┌──► Genera intereses diarios/semanales/quincenales
└──────┬───────┘ │
       │ Cliente realiza pagos
       ├─────────┘
       │
       ├─ PARCIAL: Saldo > 0 ──┐
       │                       │
       │ COMPLETO: Saldo = 0   ▼
       │                   ┌──────────────┐
       │                   │   PAGADO     │
       │                   │              │
       │                   └──────────────┘
       │
       ├─ NO PAGA (vencido)
       │      ▼
       │   ┌──────────────┐
       │   │   VENCIDO    │
       │   │              │
       │   └──────┬───────┘
       │          │
       │          ├─ Se negocia ──► RENOVADO
       │          │
       │          └─ Se remata ──► EN_REMATE ──► CANCELADO
       │
       └─ RENOVADO (extender plazo, nueva tasa)
              ▼
           ┌──────────────┐
           │  RENOVADO    │
           │              │
           └──────────────┘
                  │
                  └─ Vuelve a ACTIVO
```

---

## 📊 KPIs Disponibles

```
DESDE BÓVEDA:
├─ Total en Bóveda
├─ Disponible (sin asignar)
├─ Asignado (en cajas)
├─ Tasa de asignación (%)
└─ Historial de movimientos

DESDE CAJAS PERSONALES:
├─ Efectivo por cajero
├─ Movimientos por usuario
├─ Frecuencia de solicitud/devolución
└─ Tiempo promedio de rotación

DESDE TASACIONES:
├─ Total tasado por período
├─ Distribución por condición
├─ Promedio de valuación
└─ Tasa de rechazo

DESDE CRÉDITOS:
├─ Total originado
├─ Saldo pendiente
├─ Tasa de pago
├─ Vencidos vs activos
├─ Ingresos por intereses
└─ ROI del negocio
```

---

**Diagrama de Arquitectura Actualizado**: 18 de Noviembre, 2024
