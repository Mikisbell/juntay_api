# 🧪 Plan de Testing - Sistema de Bóveda y Cajas Personales

## 📋 Checklist de Testing

### FASE 1: SETUP INICIAL

- [ ] **Base de Datos**
  - [ ] Ejecutar migración SQL: `20251118_boveda_cajas_tasaciones.sql`
  - [ ] Verificar que todas las tablas se crearon
  - [ ] Verificar índices creados correctamente
  - [ ] Verificar RLS policies activas
  - [ ] Verificar triggers funcionan (fecha_ultima_actualizacion)

- [ ] **Usuarios de Prueba**
  - [ ] Crear usuario ADMIN (role: 'admin')
  - [ ] Crear usuario CAJERO 1 (Juan)
  - [ ] Crear usuario CAJERO 2 (María)
  - [ ] Crear usuario TASADOR
  - [ ] Verificar permisos RLS asignados correctamente

- [ ] **Datos Iniciales**
  - [ ] Crear Bóveda Central con saldo inicial de $50,000
  - [ ] Crear caja personal para cada cajero
  - [ ] Crear 5 clientes de prueba
  - [ ] Crear 3 bienes de prueba

---

### FASE 2: BÓVEDA CENTRAL

#### 2.1 Ingreso a Bóveda
- [ ] **Test: Admin realiza ingreso a bóveda**
  - [ ] Accede a `/dashboard/boveda`
  - [ ] Ingresa monto de $5,000
  - [ ] Ingresa descripción "Ingreso inicial"
  - [ ] Presiona "Registrar Ingreso"
  - [ ] ✅ Verifica: saldo_total aumenta en $5,000
  - [ ] ✅ Verifica: saldo_disponible aumenta en $5,000
  - [ ] ✅ Verifica: movimiento registrado en auditoría

- [ ] **Test: Validación de monto**
  - [ ] Intenta ingresar $0
  - [ ] ✅ Verifica: mensaje de error "mayor a 0"
  - [ ] Intenta ingresar -$100
  - [ ] ✅ Verifica: rechaza valores negativos

#### 2.2 Asignación a Cajas Personales
- [ ] **Test: Asignar $10,000 a Caja de Juan**
  - [ ] Selecciona Caja Personal #1 (Juan)
  - [ ] Ingresa monto $10,000
  - [ ] Presiona "Asignar"
  - [ ] ✅ Verifica: boveda.saldo_disponible = 45,000
  - [ ] ✅ Verifica: boveda.saldo_asignado = 10,000
  - [ ] ✅ Verifica: juan_caja.saldo_total = 10,000
  - [ ] ✅ Verifica: movimiento en ambas tablas

- [ ] **Test: Asignar $8,000 a Caja de María**
  - [ ] Selecciona Caja Personal #2 (María)
  - [ ] Ingresa monto $8,000
  - [ ] ✅ Verifica: boveda.saldo_disponible = 37,000
  - [ ] ✅ Verifica: boveda.saldo_asignado = 18,000
  - [ ] ✅ Verifica: maria_caja.saldo_total = 8,000

- [ ] **Test: Validación de disponibilidad**
  - [ ] Intenta asignar $100,000 (mayor que disponible)
  - [ ] ✅ Verifica: mensaje de error con saldo disponible actual

#### 2.3 Auditoría
- [ ] **Test: Ver historial de auditoría**
  - [ ] Accede a pestaña "Movimientos" en Bóveda
  - [ ] ✅ Verifica: Ingreso aparece listado
  - [ ] ✅ Verifica: Asignaciones aparecen listadas
  - [ ] ✅ Verifica: Timestamps correctos
  - [ ] ✅ Verifica: Descripciones correctas

#### 2.4 Permisos (RLS)
- [ ] **Test: Cajero intenta acceder a Bóveda**
  - [ ] Login como Juan (cajero)
  - [ ] Intenta acceder a `/dashboard/boveda`
  - [ ] ✅ Verifica: Acceso denegado o página vacía

- [ ] **Test: Admin accede a Bóveda**
  - [ ] Login como ADMIN
  - [ ] Accede a `/dashboard/boveda`
  - [ ] ✅ Verifica: Todo visible y funcional

---

### FASE 3: CAJAS PERSONALES

#### 3.1 Vista de Caja Personal
- [ ] **Test: Cajero accede a su caja personal**
  - [ ] Login como Juan
  - [ ] Accede a `/dashboard/cajas-personales`
  - [ ] ✅ Verifica: Ve su saldo actual ($10,000)
  - [ ] ✅ Verifica: Ve saldo disponible en bóveda ($37,000)
  - [ ] ✅ Verifica: Número de caja correcto (#1)
  - [ ] ✅ Verifica: Tres tarjetas: Saldo, Disponible, Total

#### 3.2 Solicitar Efectivo
- [ ] **Test: Juan solicita $3,000 de la bóveda**
  - [ ] Va a tab "Acciones"
  - [ ] Sección "Solicitar Efectivo"
  - [ ] Ingresa $3,000
  - [ ] Ingresa descripción "Para préstamos"
  - [ ] Presiona "Solicitar Efectivo"
  - [ ] ✅ Verifica: juan_caja.saldo_total = $13,000
  - [ ] ✅ Verifica: boveda.saldo_disponible = $34,000
  - [ ] ✅ Verifica: boveda.saldo_asignado = $21,000
  - [ ] ✅ Verifica: movimiento registrado

- [ ] **Test: María solicita $5,000**
  - [ ] Login como María
  - [ ] Accede a su caja
  - [ ] Solicita $5,000
  - [ ] ✅ Verifica: maria_caja = $13,000
  - [ ] ✅ Verifica: boveda.saldo_disponible = $29,000

#### 3.3 Devolver Efectivo
- [ ] **Test: Juan devuelve $2,000 al final del turno**
  - [ ] Login como Juan
  - [ ] Accede a `/dashboard/cajas-personales`
  - [ ] Tab "Acciones"
  - [ ] Sección "Devolver Efectivo"
  - [ ] Ingresa $2,000
  - [ ] Ingresa "Cierre de turno"
  - [ ] Presiona "Devolver"
  - [ ] ✅ Verifica: juan_caja.saldo_total = $11,000
  - [ ] ✅ Verifica: boveda.saldo_disponible = $31,000
  - [ ] ✅ Verifica: boveda.saldo_asignado = $19,000

#### 3.4 Validaciones
- [ ] **Test: Intenta devolver más de lo que tiene**
  - [ ] Ingresa $20,000 (más que su saldo de $11,000)
  - [ ] ✅ Verifica: error "Saldo insuficiente en la caja"

- [ ] **Test: Intenta solicitar más del disponible**
  - [ ] Ingresa $100,000 (más que disponible)
  - [ ] ✅ Verifica: error mostrando disponible actual

#### 3.5 Historial de Movimientos
- [ ] **Test: Ver historial de caja**
  - [ ] Tab "Movimientos"
  - [ ] ✅ Verifica: Asignación inicial $10,000
  - [ ] ✅ Verifica: Solicitud $3,000
  - [ ] ✅ Verifica: Devolución $2,000
  - [ ] ✅ Verifica: Saldos correctos en cada fila
  - [ ] ✅ Verifica: Timestamps en orden (más reciente primero)

#### 3.6 Auto-refresh
- [ ] **Test: Auto-actualización cada 30 segundos**
  - [ ] Abre dos navegadores: Juan y Admin
  - [ ] Juan ve su saldo
  - [ ] Admin hace asignación adicional
  - [ ] Espera 30 segundos
  - [ ] ✅ Verifica: Juan ve automáticamente el nuevo saldo

---

### FASE 4: TASACIONES

#### 4.1 Nueva Tasación
- [ ] **Test: Tasador registra joya en condición Excelente**
  - [ ] Login como TASADOR
  - [ ] Accede a `/dashboard/tasaciones`
  - [ ] Selecciona Cliente 1
  - [ ] Descripción: "Reloj Rolex de oro blanco, modelo Submariner"
  - [ ] Condición: 🌟 Excelente (85%)
  - [ ] Precio de venta: $1,000
  - [ ] Presiona "Registrar Tasación"
  - [ ] ✅ Verifica: Tasación creada con estado 'registrada'
  - [ ] ✅ Verifica: porcentaje_prestamo = 85
  - [ ] ✅ Verifica: monto_prestamo_autorizado = $850

- [ ] **Test: Sugerencia de monto en tiempo real**
  - [ ] Mientras ingresa precio $2,000 y condición "Buena" (65%)
  - [ ] ✅ Verifica: Panel derecho muestra monto sugerido $1,300
  - [ ] Cambia condición a "Regular" (50%)
  - [ ] ✅ Verifica: Monto actualiza a $1,000

#### 4.2 Diferentes Condiciones
- [ ] **Test: Tasación Muy Buena**
  - [ ] Bien valuado en $500, condición "Muy Buena"
  - [ ] ✅ Verifica: monto_prestamo_autorizado = $375 (75%)

- [ ] **Test: Tasación Regular**
  - [ ] Bien valuado en $800, condición "Regular"
  - [ ] ✅ Verifica: monto_prestamo_autorizado = $400 (50%)

- [ ] **Test: Tasación Deficiente**
  - [ ] Bien valuado en $600, condición "Deficiente"
  - [ ] ✅ Verifica: monto_prestamo_autorizado = $180 (30%)

#### 4.3 Historial
- [ ] **Test: Ver historial de tasaciones**
  - [ ] Tab "Historial"
  - [ ] ✅ Verifica: Todas las tasaciones listadas
  - [ ] ✅ Verifica: Mostrando estado 'registrada'
  - [ ] Filtra por cliente
  - [ ] ✅ Verifica: Solo tasaciones del cliente seleccionado

#### 4.4 Validaciones
- [ ] **Test: Intenta registrar sin cliente**
  - [ ] Presiona "Registrar" sin seleccionar cliente
  - [ ] ✅ Verifica: error requerido

- [ ] **Test: Intenta precio negativo o cero**
  - [ ] Ingresa precio $0
  - [ ] ✅ Verifica: error "mayor a 0"

---

### FASE 5: ORIGINACIÓN DE CRÉDITOS

#### 5.1 Crear Crédito desde Tasación
- [ ] **Test: Juan origina crédito de Reloj Rolex ($850 máximo)**
  - [ ] Login como Juan (cajero con $11,000 en caja)
  - [ ] Accede a `/dashboard/crear-credito-tasacion`
  - [ ] Selecciona tasación del Reloj
  - [ ] Ingresa monto: $500 (menor al máximo de $850)
  - [ ] Frecuencia: 📊 Quincenal (20%)
  - [ ] Tasa: Presiona "Usar Sugerida" → 20%
  - [ ] Presiona "Originar Crédito"
  - [ ] ✅ Verifica: Crédito creado con estado 'activo'
  - [ ] ✅ Verifica: tasacion.estado cambia a 'en_prenda'
  - [ ] ✅ Verifica: juan_caja.saldo_total = $10,500 (descuento)

#### 5.2 Frecuencias de Pago
- [ ] **Test: Crear crédito con diferentes frecuencias**
  - [ ] Frecuencia Diaria → Tasa sugerida 25%
  - [ ] Frecuencia Semanal → Tasa sugerida 22%
  - [ ] Frecuencia Quincenal → Tasa sugerida 20%
  - [ ] Frecuencia 3 Semanas → Tasa sugerida 20%
  - [ ] Frecuencia Mensual → Tasa sugerida 18%
  - [ ] ✅ Verifica: Todas las tasas correctas

#### 5.3 Tasas Personalizadas
- [ ] **Test: Override tasa sugerida**
  - [ ] Selecciona frecuencia Quincenal (sugerida 20%)
  - [ ] Cambia manualmente a 22%
  - [ ] ✅ Verifica: Sistema acepta 22%

- [ ] **Test: Validación de tasa**
  - [ ] Intenta ingresar tasa 150%
  - [ ] ✅ Verifica: error "entre 0 y 100"

#### 5.4 Validaciones
- [ ] **Test: Monto excede autorizado**
  - [ ] Tasación autorizada por $850
  - [ ] Intenta solicitar $1,000
  - [ ] ✅ Verifica: error "El monto no puede exceder"

- [ ] **Test: Monto 0 o negativo**
  - [ ] Intenta ingresar $0
  - [ ] ✅ Verifica: error

#### 5.5 Panel Lateral
- [ ] **Test: Detalles de tasación visible**
  - [ ] Al seleccionar tasación
  - [ ] ✅ Verifica: Descripción visible
  - [ ] ✅ Verifica: Valor tasado mostrado
  - [ ] ✅ Verifica: Condición mostrada
  - [ ] ✅ Verifica: Porcentaje préstamo mostrado
  - [ ] ✅ Verifica: Monto máximo destacado

---

### FASE 6: INTEGRACIÓN TOTAL (End-to-End)

#### 6.1 Flujo Completo
- [ ] **Test: Flujo del cliente desde entrada a crédito**
  
  **PASO 1: Admin deposita $50,000 a bóveda**
  - [ ] Ingreso registrado
  
  **PASO 2: Admin asigna $10,000 a Juan**
  - [ ] Juan recibe efectivo en su caja
  
  **PASO 3: Cliente llega con Rolex**
  - [ ] Tasador registra: $1,000, Excelente, monto máx $850
  
  **PASO 4: Juan origina crédito**
  - [ ] Juan solicita $500 al cliente
  - [ ] Crédito se crea con 20% interés
  - [ ] Caja de Juan se reduce a $9,500
  - [ ] Tasación cambia estado a 'en_prenda'
  
  **PASO 5: Cierre de turno**
  - [ ] Juan devuelve $9,500 a bóveda
  - [ ] Bóveda recibe efectivo
  
  **Resultado Final:**
  - [ ] ✅ Bóveda: saldo_total = $49,500 (ganó interés)
  - [ ] ✅ Crédito registrado y en seguimiento
  - [ ] ✅ Auditoría completa

---

### FASE 7: SEGURIDAD Y RLS

#### 7.1 RLS Policies
- [ ] **Test: Cajero no puede acceder a bóveda**
  - [ ] Login como Juan
  - [ ] Intenta query directa a boveda_central
  - [ ] ✅ Verifica: RLS rechaza acceso

- [ ] **Test: Cajero solo ve su caja**
  - [ ] Query cajas_pesonales sin filtro
  - [ ] ✅ Verifica: RLS retorna solo su caja

- [ ] **Test: Admin ve todo**
  - [ ] Login como ADMIN
  - [ ] Accede a todas las tablas
  - [ ] ✅ Verifica: Acceso completo

#### 7.2 Auditoría
- [ ] **Test: Todos los movimientos auditados**
  - [ ] Realiza 10 operaciones diferentes
  - [ ] ✅ Verifica: 10 registros en movimientos_boveda_auditoria
  - [ ] ✅ Verifica: usuario_id correcto en cada uno

---

### FASE 8: PERFORMANCE

#### 8.1 Cargas de Datos
- [ ] **Test: 1000 créditos en lista**
  - [ ] Genera 1000 créditos en base de datos
  - [ ] Accede a historial
  - [ ] ✅ Verifica: Carga en < 2 segundos
  - [ ] ✅ Verifica: Paginación/virtualización funciona

#### 8.2 Índices
- [ ] **Test: Búsquedas rápidas**
  - [ ] Búsqueda por usuario (indizado)
  - [ ] ✅ Verifica: Rápida (< 100ms)
  - [ ] Búsqueda por estado (indizado)
  - [ ] ✅ Verifica: Rápida (< 100ms)

---

### FASE 9: EDGE CASES

#### 9.1 Concurrencia
- [ ] **Test: Dos usuarios solicitan simultáneamente**
  - [ ] Abre dos navegadores
  - [ ] Ambos solicitan $5,000 al mismo tiempo
  - [ ] ✅ Verifica: Sistema maneja correctamente (una se ejecuta después)
  - [ ] ✅ Verifica: Saldos correctos

#### 9.2 Límites
- [ ] **Test: Valores muy grandes**
  - [ ] Intenta ingresar $999,999,999
  - [ ] ✅ Verifica: Sistema maneja correctamente

- [ ] **Test: Valores muy pequeños**
  - [ ] Intenta ingresar $0.01
  - [ ] ✅ Verifica: Acepta con precisión

#### 9.3 Transacciones Fallidas
- [ ] **Test: Desconexión durante operación**
  - [ ] Desconecta internet durante solicitud
  - [ ] ✅ Verifica: Mensaje de error claro
  - [ ] ✅ Verifica: Estado no queda corrupto

---

### FASE 10: UX/USABILIDAD

#### 10.1 Validaciones
- [ ] **Test: Mensajes de error claros**
  - [ ] Todos los errores son descriptivos
  - [ ] Sugieren solución (ej. "Disponible: $5,000")
  - [ ] ✅ Verifica: Usuario entiende qué falló

#### 10.2 Feedback
- [ ] **Test: Confirmación de acciones**
  - [ ] Mensajes de éxito aparecen
  - [ ] Desaparecen después de 3 segundos
  - [ ] Estados se actualizan inmediatamente

#### 10.3 Navegación
- [ ] **Test: Todos los links funcionan**
  - [ ] Sidebar completo
  - [ ] Botones de navegación
  - [ ] ✅ Verifica: Sin 404s

---

## 📊 Resultados Esperados

### Bóveda Central
- ✅ Total, Disponible, Asignado se actualizan correctamente
- ✅ Auditoría registra todos los cambios
- ✅ RLS impide acceso a no-admin

### Cajas Personales
- ✅ Cada usuario ve solo su caja
- ✅ Solicitud/Devolución actualiza bóveda
- ✅ Historial completo y ordenado

### Tasaciones
- ✅ Matriz de porcentaje funciona (30-85%)
- ✅ Sugerencia de monto en tiempo real
- ✅ Estado cambia a 'en_prenda' al crear crédito

### Créditos
- ✅ Se crean vinculados a tasación
- ✅ Intereses calculados correctamente
- ✅ Frecuencias de pago soportadas

### General
- ✅ Sin errores de TypeScript
- ✅ Rendimiento adecuado
- ✅ UI responsivo (mobile-friendly)
- ✅ Acceso controlado por RLS

---

## 🐛 Bugs Conocidos / A Revisar

- [ ] **Typo en tabla**: `cajas_pesonales` vs `cajas_personales`
  - Decidir si corregir ahora o deprecar después
  - Impacta: Service layer + SQL queries

- [ ] **NextAuth vs Supabase Auth**
  - Verificar que se está usando Supabase Auth correctamente
  - SessionProvider setup

- [ ] **Timezone**
  - Verificar que timestamps se guardan en UTC
  - Mostrar en zona horaria local del usuario

---

## 🚀 Checklist Pre-Producción

- [ ] Ejecutar suite de tests
- [ ] Review de código de seguridad
- [ ] Documentación actualizada
- [ ] Backups de base de datos configurados
- [ ] Monitoreo de errores (Sentry/LogRocket)
- [ ] Analytics (Mixpanel/Segment)
- [ ] Rate limiting en APIs
- [ ] HTTPS en todos los endpoints
- [ ] CORS policies configuradas
- [ ] Documentación para usuarios

---

**Plan de Testing Creado**: 18 de Noviembre, 2024
**Estado**: 🟢 LISTO PARA EJECUTAR
