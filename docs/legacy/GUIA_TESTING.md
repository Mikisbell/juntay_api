# 🧪 GUÍA DE TESTING - JUNTAY API

## Inicio rápido para probar lo implementado

Este documento te guía a través de todos los módulos completados en Tier 1.

---

## 1️⃣ CONFIGURACIÓN INICIAL

### Prerequisitos:
- Node.js 18+ instalado
- Supabase CLI configurado (opcional, para BD local)
- Variables de entorno configuradas

### Variables de Entorno Necesarias:
```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Ejecutar el proyecto:
```bash
npm install
npm run dev
```

Abre: http://localhost:3000

---

## 2️⃣ FLUJO DE TESTING

### A. AUTENTICACIÓN

#### Paso 1: Registro
1. Serás redirigido automáticamente a `/login`
2. Haz clic en "Regístrate aquí"
3. Ingresa:
   - Email: `prueba@example.com`
   - Contraseña: `Prueba123`
   - Confirmación: `Prueba123`
4. Haz clic en "Registrarse"
5. Deberías ver: "¡Cuenta creada exitosamente!"
6. Se redirige automáticamente a login en 2 segundos

#### Paso 2: Login
1. Ingresa credenciales:
   - Email: `prueba@example.com`
   - Contraseña: `Prueba123`
2. Haz clic en "Iniciar Sesión"
3. **Resultado esperado**: Redirigido a `/dashboard`

#### Paso 3: Menú de Usuario
1. En la esquina superior derecha verás tu email
2. Haz clic en el menú
3. Deberías ver botón "Cerrar Sesión"
4. Haz clic en "Cerrar Sesión"
5. **Resultado esperado**: Redirigido a `/login`

#### Paso 4: Protección de Rutas
1. Intenta acceder a `/dashboard` sin estar autenticado
2. **Resultado esperado**: Redirigido a `/login`

---

### B. MÓDULO DE CLIENTES

#### Paso 1: Crear Cliente
1. Autentícate
2. En el sidebar, haz clic en "Clientes"
3. Haz clic en botón "+ Nuevo Cliente"
4. Completa el formulario:
   - **Documento**: `12345678`
   - **Nombres**: Juan
   - **Apellido Paterno**: Pérez
   - **Apellido Materno**: García
   - **Teléfono**: `987654321`
   - **Email**: `juan@example.com`
   - **Dirección**: Av. Principal 123
5. Haz clic en "Guardar"
6. **Resultado esperado**: Redirigido a lista de clientes, cliente visible en tabla

#### Paso 2: Buscar Cliente
1. En la página de clientes
2. Usa el campo de búsqueda en la tabla
3. Escribe "Juan" o "12345678"
4. **Resultado esperado**: La tabla se filtra mostrando solo el cliente

#### Paso 3: Ver Estadísticas
1. En la página de clientes
2. Arriba verás estadísticas:
   - Total de Clientes
   - Clientes Activos
   - Créditos Otorgados
   - Cartera Total
3. **Resultado esperado**: Los números son correctos

---

### C. MÓDULO DE CAJA

#### Paso 1: Abrir Caja
1. En el sidebar, haz clic en "Caja"
2. Haz clic en botón "Abrir Caja"
3. Verás formulario con denominaciones de billetes/monedas
4. Ingresa cantidades (ejemplo):
   - S/100: 5 (= 500)
   - S/20: 3 (= 60)
   - S/10: 2 (= 20)
   - Total: S/ 580.00
5. Haz clic en "Abrir Caja"
6. **Resultado esperado**:
   - Estado cambia a "🟢 Abierta"
   - Saldo inicial: S/ 580.00
   - Puedes registrar movimientos

#### Paso 2: Registrar Movimiento
1. Con la caja abierta
2. Haz clic en botón "Registrar Movimiento"
3. Completa:
   - **Tipo**: Ingreso de Operación
   - **Concepto**: Pago cliente
   - **Monto**: 100.00
   - **Medio de Pago**: Efectivo
4. Haz clic en "Registrar"
5. **Resultado esperado**:
   - Movimiento aparece en tabla
   - Saldo teórico se actualiza: 580.00 + 100.00 = 680.00

#### Paso 3: Cerrar Caja
1. Con movimientos registrados
2. Haz clic en botón "Cerrar Caja"
3. Ingresa:
   - **Monto Físico**: El monto contado (ej: 680.00)
4. Si es igual al saldo teórico:
   - Diferencia: S/ 0.00 (✓ Equilibrada)
   - Puedes cerrar directamente
5. Haz clic en "Cerrar Caja"
6. **Resultado esperado**:
   - Estado cambia a "🔴 Cerrada"
   - Resumen de cierre visible
   - Opción para abrir nueva sesión

---

### D. MÓDULO DE CRÉDITOS

#### Paso 1: Crear Crédito
1. En el sidebar, haz clic en "Créditos"
2. Haz clic en botón "+ Nuevo Crédito"
3. Completa:
   - **Cliente**: Selecciona "Juan Pérez" (creado anteriormente)
   - **Monto de Crédito**: 1000.00
   - **Tasa de Interés**: 15 (%)
   - **Frecuencia de Pago**: Quincenal
   - **Plazo**: 30 días
4. **En tiempo real verás**:
   - Intereses calculados: ~S/ 41.67
   - Monto total a pagar: ~S/ 1,041.67
5. Haz clic en "Crear Crédito"
6. **Resultado esperado**: Redirigido a lista de créditos

#### Paso 2: Ver Listado de Créditos
1. En la página de Créditos verás:
   - **Estadísticas**:
     - Créditos Activos: 1
     - Monto Total: S/ 1,041.67
     - Vencidos: 0
     - Intereses Acumulados: S/ 41.67
   - **Tabla**: Crédito listado con:
     - Cliente: Juan Pérez
     - Monto: S/ 1,000.00
     - Saldo Pendiente: S/ 1,041.67
     - Vencimiento: (30 días desde hoy)
     - Estado: ✓ Activo

#### Paso 3: Filtrar por Estado
1. Usa botones de filtro: "Todos", "Activos", "Pagados", "Vencidos"
2. Selecciona "Activos"
3. **Resultado esperado**: Solo muestra créditos activos

---

### E. SISTEMA DE ROLES Y PERMISOS

#### Verificación (requiere acceso a código):
1. Abre `/src/lib/roleService.ts`
2. Verifica que existan:
   - Rol: `admin` - Acceso total
   - Rol: `gerente` - Acceso a módulos principales
   - Rol: `cajero` - Solo caja y pagos
   - Rol: `analista_credito` - Clientes y créditos
   - Rol: `user` - Perfil propio

3. En BD Supabase, tabla `profiles`:
   - Debe tener columna `role`
   - Default: 'user'

---

## 3️⃣ FLUJO COMPLETO DE PRUEBA (5 minutos)

1. **Registrarse** → Login automático
2. **Crear Cliente** → Juan Pérez
3. **Abrir Caja** → S/ 500
4. **Crear Crédito** → S/ 1,000 a Juan
5. **Registrar Pago** → S/ 100 en caja
6. **Cerrar Caja** → Arqueo S/ 600
7. **Ver Reportes** → Estadísticas actualizadas

---

## 4️⃣ CHECKLIST DE VALIDACIÓN

### Autenticación ✅
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Rutas protegidas redirigen a login
- [ ] Usuario aparece en menú

### Clientes ✅
- [ ] Crear cliente funciona
- [ ] Búsqueda funciona
- [ ] Tabla de clientes carga
- [ ] Estadísticas se calculan

### Caja ✅
- [ ] Apertura con desglose funciona
- [ ] Movimientos se registran
- [ ] Saldo teórico se actualiza
- [ ] Cierre calcula diferencia
- [ ] Reporte de cierre es correcto

### Créditos ✅
- [ ] Crear crédito funciona
- [ ] Cálculo de intereses es correcto
- [ ] Listado muestra todos los créditos
- [ ] Filtros funcionan
- [ ] Estadísticas se calculan

### Roles ✅
- [ ] Tabla `profiles` existe en BD
- [ ] Función `checkRole()` valida correctamente
- [ ] Función `hasPermission()` valida correctamente

---

## 5️⃣ PRUEBAS DE CASOS EDGE

### Caso 1: Diferencia en Cierre
1. Abrir caja: S/ 500
2. Registrar movimiento: +100
3. Al cerrar, ingresar S/ 590 (hay S/ 100 faltante)
4. Sistema pide observaciones obligatoriamente
5. Ingresa: "Error en conteo"
6. Debe permitir cerrar y registrar diferencia

### Caso 2: Intereses Frecuentes
1. Crear crédito con:
   - Monto: S/ 1,000
   - Tasa: 20%
   - Frecuencia: **Diario** (no quincenal)
   - Plazo: 30 días
2. Intereses deben ser ~S/ 16.44
3. Verificar cálculo en formulario

### Caso 3: Búsqueda Multi-campo
1. Crear 3 clientes
2. Buscar por:
   - Nombre
   - DNI/Documento
   - Email
3. Cada búsqueda debe filtrar correctamente

---

## 6️⃣ TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| "Supabase no está configurado" | Verifica NEXT_PUBLIC_SUPABASE_URL |
| Login no funciona | Verifica GoTrue en Supabase configurado |
| Tabla `profiles` no existe | Crea manualmente o ejecuta migración |
| Errores de TypeScript al buildear | Ejecuta `npm run lint` para verificar |
| Base de datos vacía | Inicia con seed data o crea registros manualmente |

---

## 7️⃣ PRÓXIMOS PASOS (Tier 2)

Después de validar Tier 1, continuaremos con:

1. **Módulo de Garantías**
   - Upload de fotos
   - Galería visual
   - Vinculación a créditos

2. **Módulo de Créditos Avanzado**
   - Detalle individual
   - Historial de pagos
   - Amortización

3. **Pagos Flexibles**
   - Renovaciones
   - Cambio de términos
   - Penalties por vencimiento

---

**📝 Nota:** Este documento será actualizado con cada milestone completado.

¡Buen testing! 🚀
