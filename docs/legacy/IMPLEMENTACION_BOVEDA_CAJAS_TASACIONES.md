# 🏆 Sistema de Gestión Jerárquica de Caja - Implementación Completada

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de gestión jerárquica de efectivo para una casa de empeños (pawn shop) que incluye:

1. **Bóveda Central (🏦)**: Gestión centralizada del efectivo total del negocio
2. **Cajas Personales (💼)**: Cajas individuales por usuario/cajero con asignación desde bóveda
3. **Tasaciones (📊)**: Sistema de appraisal con matriz de préstamo por condición (30%-85%)
4. **Originación de Créditos (📝)**: Creación de créditos vinculados a tasaciones con tasas de interés variables
5. **Flujo de Pagos**: Integración con frecuencias de pago flexibles (diario, semanal, quincenal, 3 semanas, mensual)

---

## 🗂️ Estructura de Archivos Creados/Modificados

### Servicios (Backend)

#### 1. **`src/lib/bovedaService.ts`** (580+ líneas)
- **Interfaz `BovedaCentral`**: Gestión de bóveda central
- **Interfaz `CajaPersonal`**: Gestión de cajas personales por usuario
- **Interfaz `MovimientoCajaPersonal`**: Registro de movimientos individuales
- **Interfaz `MovimientoBovedaAuditoria`**: Auditoría de todos los movimientos

**Funciones principales:**
```typescript
- obtenerBovedaCentral()           // Obtiene la bóveda central (única)
- crearBovedaCentral()             // Crea la bóveda (una sola vez)
- ingresoBoveda()                  // Depósito de efectivo a bóveda
- asignarEfectivoCajaPesonal()    // Asigna efectivo a caja personal
- devolverEfectivoBovedaDesdeCAjaPesonal()  // Devuelve efectivo de caja a bóveda
- obtenerCajaPersonalPorUsuario()  // Obtiene caja de un usuario
- crearCajaPersonal()              // Crea caja personal para usuario
- obtenerTodasCajasPersonales()    // Lista todas las cajas activas
- obtenerMovimientosCajaPersonal() // Historial de movimientos
- solicitarEfectivoDeBoveda()      // Solicita efectivo (alias)
- devolverEfectivoABoveda()        // Devuelve efectivo (alias)
- obtenerAuditoriaBoveda()         // Historial de auditoría
```

#### 2. **`src/lib/garantiasService.ts`** (310+ líneas)
- **Tipos**: `CondicionBien`, `TipoBien`, `EstadoGarantia`
- **Interfaz `Bien`**: Objeto físico a empeñar
- **Interfaz `Tasacion`**: Appraisal con autorización de préstamo
- **Matriz `MATRIZ_PORCENTAJE_PRESTAMO`**: Porcentajes por condición

```typescript
Condición          | Porcentaje
Excelente         | 85%
Muy Buena         | 75%
Buena             | 65%
Regular           | 50%
Deficiente        | 30%
```

**Funciones principales:**
```typescript
- crearBien()                           // Registra un bien físico
- crearTasacion()                       // Tasación con cálculo de monto máximo
- obtenerTasacion()                     // Obtiene tasación por ID
- obtenerTasacionesPorCliente()         // Lista tasaciones de cliente
- obtenerGarantiasActivasPorCliente()   // Garantías con estado 'en_prenda'
- actualizarEstadoGarantia()            // Cambia estado (registrada → en_prenda, etc)
- calcularSugerenciaTasacion()          // Calcula monto sugerido
- descripcionCondicion()                // Helper UI para mostrar condición
```

#### 3. **`src/lib/creditsService.ts`** (Enhanced)
**Cambios principales:**
- Agregada `'renovado'` a enum `CreditStatus`
- Cambio: `garantia_id` → `tasacion_id` (más semántico)
- Agregada `'tres_semanas'` a `PaymentFrequency`
- Nueva constante `TASAS_INTERES_SUGERIDAS`:
  ```typescript
  daily: 25%
  weekly: 22%
  biweekly: 20%
  tres_semanas: 20%
  monthly: 18%
  ```

**Nuevas funciones:**
```typescript
- crearCreditoDesdeTasacion()   // Origina crédito desde tasación
  Parámetros: clienteId, tasacionId, monto, frecuencia, tasaInteres
  Calcula: intereses, cuotas, cronograma
  
- renovarCredito()              // Renova crédito con nueva tasa/plazo
  
- sugerirTasaPorFrecuencia()    // Retorna tasa según frecuencia
  
- descripcionFrecuencia()       // Helper UI para mostrar frecuencia
```

---

### Componentes UI (Frontend)

#### 1. **`src/app/(dashboard)/dashboard/boveda/page.tsx`** (330+ líneas)
**Características:**
- ✅ Tres tarjetas de estado (Total, Disponible, Asignado)
- ✅ Barra de progreso de utilización
- ✅ Formulario de Ingreso a Bóveda
- ✅ Formulario de Asignación a Cajas Personales
- ✅ Tabla de auditoría con historial completo
- ✅ Tab view: Resumen, Movimientos, Acciones

**Estados mostrados:**
- Total en Bóveda
- Saldo Disponible (sin asignar)
- Saldo Asignado (en cajas personales)

---

#### 2. **`src/app/(dashboard)/dashboard/cajas-personales/page.tsx`** (370+ líneas)
**Características:**
- ✅ Carga automática de caja personal del usuario
- ✅ Crea caja si no existe
- ✅ Tres tarjetas: Saldo en Caja, Disponible en Bóveda, Total Sistema
- ✅ Tab view: Resumen, Movimientos, Acciones
- ✅ Formulario de Solicitud (asignación desde bóveda)
- ✅ Formulario de Devolución (regreso a bóveda)
- ✅ Historial de movimientos filtrado

**Funcionalidades:**
- Validación de montos (no puede exceder disponible)
- Actualización automática cada 30 segundos
- Cálculo de porcentaje de utilización

---

#### 3. **`src/app/(dashboard)/dashboard/tasaciones/page.tsx`** (380+ líneas)
**Características:**
- ✅ Formulario para registrar nueva tasación
- ✅ Selector de cliente dinámico
- ✅ Campo de descripción del bien
- ✅ Selector de condición (5 opciones)
- ✅ Entrada de precio de venta y referencia
- ✅ Observaciones adicionales
- ✅ Panel lateral con sugerencia de monto

**Lado derecho: Sugerencia de Préstamo**
Muestra en tiempo real:
- Valor tasado
- Condición seleccionada
- Monto máximo autorizado
- Porcentaje del valor

**Tab "Historial":**
- Lista todas las tasaciones registradas
- Filtrable por cliente
- Muestra: Condición, Valor, %, Monto Autorizado, Estado

---

#### 4. **`src/app/(dashboard)/dashboard/crear-credito-tasacion/page.tsx`** (390+ líneas)
**Características:**
- ✅ Selector de tasación disponible
- ✅ Entrada de monto solicitado (validado contra máximo)
- ✅ Selector de frecuencia de pago (5 opciones)
- ✅ Input de tasa de interés con botón "Usar Sugerida"
- ✅ Panel lateral con detalles de tasación

**Flujo:**
1. Selecciona tasación
2. Ingresa monto (≤ autorizado)
3. Elige frecuencia de pago
4. Acepta tasa (manual o sugerida)
5. Origina crédito

---

### Migración SQL

#### **`supabase/migrations/20251118_boveda_cajas_tasaciones.sql`**

**Tablas creadas:**
1. `boveda_central` - Bóveda única del sistema
2. `cajas_pesonales` - Cajas personales (una por usuario)
3. `movimientos_caja_pesonal` - Historial de movimientos
4. `movimientos_boveda_auditoria` - Auditoría de bóveda
5. `bienes` - Inventario de bienes
6. `tasaciones` - Appraisals con autorización

**Cambios a tabla existente:**
- `creditos`: Agregadas columnas `tasacion_id`, `caja_personal_id`, `fecha_renovacion`

**Índices:**
- Por usuario, estado, fecha (optimizados para búsquedas)

**RLS (Row Level Security):**
- Usuarios solo ven sus propias cajas
- Admin acceso total a bóveda

**Triggers:**
- Actualización automática de `fecha_ultima_actualizacion`

---

### Navegación (Sidebar)

**`src/app/(dashboard)/layout.tsx`** - Updated

Nuevos enlaces agregados:
```
🏦 Bóveda Central           → /dashboard/boveda
💼 Mi Caja Personal          → /dashboard/cajas-personales
📊 Tasaciones               → /dashboard/tasaciones
📝 Crear Crédito            → /dashboard/crear-credito-tasacion
```

---

## 🔄 Flujo de Procesos Implementado

### 1. **Ingreso de Efectivo a Bóveda** 
```
Usuario Admin
    ↓
Bóveda Central → Ingreso (depósito)
    ↓
Se actualiza saldo_total y saldo_disponible
    ↓
Se registra en movimientos_boveda_auditoria
```

### 2. **Asignación a Caja Personal**
```
Bóveda Central (Disponible)
    ↓
Reduce saldo_disponible
    ↓
Aumenta saldo_asignado
    ↓
Caja Personal recibe efectivo
    ↓
Se registran movimientos en ambas tablas
```

### 3. **Tasación de Bien**
```
Cliente trae bien
    ↓
Tasador entra descripción, condición, valor
    ↓
Sistema calcula: Monto Máximo = Valor × Porcentaje[Condición]
    ↓
Se registra en tasaciones con estado 'registrada'
    ↓
Se crea bien en tabla bienes
```

### 4. **Originación de Crédito**
```
Tasación 'registrada'
    ↓
Selecciona monto (≤ autorizado)
    ↓
Elige frecuencia de pago
    ↓
Sistema sugiere tasa según frecuencia
    ↓
Se origina Crédito con:
  - cliente_id
  - tasacion_id
  - monto
  - tasa_interes
  - frecuencia_pago
  - saldo_pendiente = monto + (intereses calculados)
    ↓
Se actualiza tasacion.estado = 'en_prenda'
    ↓
Se descuenta de caja_personal.saldo_total
```

### 5. **Devolución de Efectivo**
```
Cajero termina turno
    ↓
Devuelve efectivo a Bóveda
    ↓
Reduce saldo de caja personal
    ↓
Aumenta saldo_disponible de bóveda
    ↓
Se registran movimientos
```

---

## 💾 Modelos de Datos

### BovedaCentral
```typescript
{
  id: UUID
  numero: 1 (único)
  saldo_total: number          // Dinero total en el negocio
  saldo_disponible: number     // Sin asignar a cajas
  saldo_asignado: number       // En poder de cajeros
  fecha_creacion: timestamp
  fecha_ultima_actualizacion: timestamp
  descripcion?: string
  estado: 'activa' | 'pausada' | 'cerrada'
}
```

### CajaPersonal
```typescript
{
  id: UUID
  usuario_id: UUID            // Vinculado al usuario
  numero_caja: integer        // Identificador secuencial
  saldo_total: number         // Efectivo en poder del cajero
  estado: 'activa' | 'pausada' | 'cerrada'
  fecha_apertura: timestamp
  fecha_ultima_actualizacion: timestamp
  descripcion?: string
}
```

### Tasacion
```typescript
{
  id: UUID
  bien_id: UUID
  cliente_id: UUID
  fecha_tasacion: timestamp
  usuario_tasador_id?: UUID
  descripcion_bien: string
  condicion: 'excelente' | 'muy_buena' | 'buena' | 'regular' | 'deficiente'
  precio_compra_referencia?: number
  precio_venta_mercado?: number
  valor_tasacion: number                    // Valor determinado
  porcentaje_prestamo: integer (30-85)      // % del valor a prestar
  monto_prestamo_autorizado: number         // valor_tasacion × porcentaje
  observaciones?: string
  estado: 'registrada' | 'en_prenda' | 'vencida' | 'devuelta' | 'rematada'
}
```

### Credito (Enhanced)
```typescript
{
  id: UUID
  cliente_id: UUID
  tasacion_id: UUID          // NEW: Referencia a appraisal
  caja_personal_id?: UUID    // NEW: Caja que originó el crédito
  monto: number              // Cantidad prestada
  tasa_interes: number       // % anual
  frecuencia_pago: 'daily' | 'weekly' | 'biweekly' | 'tres_semanas' | 'monthly'
  saldo_pendiente: number    // Monto + intereses
  estado: 'activo' | 'pagado' | 'vencido' | 'en_remate' | 'cancelado' | 'renovado'
  fecha_creacion: timestamp
  fecha_vencimiento: timestamp
  fecha_renovacion?: timestamp
  // ...otros campos existentes
}
```

---

## 🔐 Características de Seguridad

### Row Level Security (RLS)
- ✅ Usuarios solo pueden ver/modificar sus propias cajas personales
- ✅ Acceso a bóveda restringido a admin
- ✅ Movimientos auditados en tabla de auditoría

### Validaciones
- ✅ Monto no puede exceder disponible en bóveda
- ✅ Monto de crédito no puede exceder autorizado en tasación
- ✅ Tasas de interés validadas (0-100%)
- ✅ Frecuencia de pago limitada a opciones válidas

### Auditoría
- ✅ Todos los movimientos registrados en `movimientos_boveda_auditoria`
- ✅ Timestamp automático en cada operación
- ✅ Usuario que realizó la operación registrado

---

## 📊 Matriz de Préstamo

Basada en condición del bien:

| Condición | Porcentaje | Descripción |
|-----------|-----------|-------------|
| Excelente | 85% | Como nuevo, sin defectos |
| Muy Buena | 75% | Mínimas marcas de uso |
| Buena | 65% | Uso normal, funciona perfecto |
| Regular | 50% | Defectos menores, funciona |
| Deficiente | 30% | Defectos mayores, funciona con dificultad |

**Ejemplo:**
- Reloj valuado en $1,000 en condición "Buena" (65%)
- Máximo a prestar: $1,000 × 0.65 = $650

---

## 💹 Tasas de Interés Sugeridas

Según frecuencia de pago:

| Frecuencia | Tasa Sugerida | Uso |
|-----------|--------------|-----|
| Diario | 25% | Clientes con capacidad de pago diaria |
| Semanal | 22% | Pagos semanales |
| Quincenal | 20% | **ESTÁNDAR** - Más común |
| 3 Semanas | 20% | Intermediario |
| Mensual | 18% | Mayor plazo, tasa reducida |

---

## ✅ Checklist de Implementación

### Backend Services
- [x] bovedaService completo con CRUD + auditoría
- [x] garantiasService con matriz de préstamo
- [x] Integración con creditsService
- [x] Funciones de validación

### Frontend Components
- [x] Bóveda Central (ingreso, asignación, auditoría)
- [x] Cajas Personales (solicitar, devolver, historial)
- [x] Tasaciones (nueva, historial)
- [x] Crear Crédito desde Tasación

### Database
- [x] Migración SQL con todas las tablas
- [x] Índices para performance
- [x] RLS policies
- [x] Triggers para auditoría

### Navigation
- [x] Enlaces en sidebar
- [x] Iconos descriptivos
- [x] Orden lógico

---

## 🚀 Próximos Pasos Sugeridos

### Priority 1: Core Payment Flow
- [ ] Página de "Registrar Pagos" (daily/weekly/biweekly/etc)
- [ ] Cálculo de intereses acumulados
- [ ] Estados de transición de crédito (activo → pagado)
- [ ] Generación de cronograma de pagos

### Priority 2: Reports & Analytics
- [ ] Dashboard de KPIs (total prestado, tasa de pago, vencidos)
- [ ] Reporte de créditos vencidos/en remate
- [ ] Análisis de condiciones de bienes
- [ ] Forecast de ingresos por intereses

### Priority 3: Admin Features
- [ ] Gestión de usuarios/cajeros
- [ ] Asignación de límites de caja
- [ ] Reporte de auditoría (exportar)
- [ ] Cierre de turno con conciliación

### Priority 4: Client-Facing
- [ ] WhatsApp notifications de pagos vencidos
- [ ] Portal de cliente para ver estado del crédito
- [ ] Opción de renovar crédito automáticamente
- [ ] Generador de PDF de contrato

### Priority 5: Advanced Features
- [ ] Proceso de remate (cuando vencido)
- [ ] Foto de bienes en tasación
- [ ] Blockchain para auditoría inmutable
- [ ] Integración con banco (transferencias automáticas)

---

## 📝 Notas Técnicas

### Tabla Name con Typo
⚠️ **IMPORTANTE**: Las tablas se crean con nombre `cajas_pesonales` (typo: "pesonal" vs "personal")

Para corregir en el futuro:
```sql
ALTER TABLE cajas_pesonales RENAME TO cajas_personales;
ALTER TABLE movimientos_caja_pesonal RENAME TO movimientos_caja_personal;
```

Actualizar todas las referencias en los servicios.

### Testing
- Recomendado crear datos de prueba:
  - Una bóveda con $10,000
  - 2-3 usuarios con cajas personales
  - Varias tasaciones con diferentes condiciones
  - Créditos en diferentes estados

---

## 📚 Referencias Rápidas

**Archivos principales:**
```
src/lib/
  ├─ bovedaService.ts        (Bóveda central + cajas personales)
  ├─ garantiasService.ts     (Tasaciones + matriz de préstamo)
  └─ creditsService.ts       (Créditos con nuevas funciones)

src/app/(dashboard)/dashboard/
  ├─ boveda/
  ├─ cajas-personales/
  ├─ tasaciones/
  └─ crear-credito-tasacion/

supabase/migrations/
  └─ 20251118_boveda_cajas_tasaciones.sql
```

---

**Implementación completada**: 18 de Noviembre, 2024
**Desarrollador**: GitHub Copilot
**Estatus**: ✅ LISTO PARA TESTING
