🏛️ MANUAL TÉCNICO MAESTRO - PROYECTO JUNTAY

Versión: 2.0.0 (Actualizado con Motor de Reglas y Tesorería)
Fecha: 20 Noviembre 2025
Arquitecto Líder: Mikis
Objetivo: Sistema de Gestión Financiera de Nivel Bancario

1. 🎯 VISIÓN Y FILOSOFÍA

Estamos construyendo un sistema financiero, no una simple página web. La integridad de los datos es sagrada.

La Regla de Oro: "Conservación de la Materia Financiera"

El dinero nunca se crea ni se destruye en el Frontend. El dinero solo se transfiere de una entidad a otra mediante transacciones atómicas en el Backend.

Incorrecto: usuario.saldo += 100 (Mágico, inseguro).

Correcto: Transferencia(Origen: Boveda, Destino: Caja, Monto: 100) (Auditado, seguro).

Jerarquía de Flujo

Bóveda Central (Nivel 0): Todo el capital de la empresa (Físico + Bancario).

Caja Operativa (Nivel 1): Capital asignado temporalmente a un cajero (Sesión).

Crédito/Cliente (Nivel 2): Capital prestado contra garantía.

Filosofía de Configuración

No "quemamos" reglas en el código (Hardcode). Usamos un Motor de Reglas (system_settings) para que el Administrador ajuste límites, permisos y comportamientos (ej: límites de Yape) sin reprogramar.

2. 🏗️ STACK TECNOLÓGICO (ESTRICTO)

Todo desarrollador debe adherirse a estas tecnologías. No instalar librerías extra sin autorización.

Frontend: Next.js 14 (App Router).

Lenguaje: TypeScript (Strict Mode activado. Prohibido usar any).

UI Framework: Tailwind CSS v4 + shadcn/ui (Componentes Radix).

Base de Datos: Supabase (PostgreSQL).

Lógica de Negocio: Server Actions ('use server').

Estado Local: React Hooks / Context (Minimizar estado global complejo).

**Integraciones de Terceros:**

- **WhatsApp Business**: WAHA (WhatsApp HTTP API) en Oracle Cloud  
  - Motor: NOWEB (estable, compatible)
  - Servidor: 129.151.98.218:3000
  - Límite: 100 mensajes/hora
  - Uso: Verificación de clientes + notificaciones

- **APIs Gubernamentales**: RENIEC/SUNAT vía consultasperu.dev

3. 💾 ARQUITECTURA DE DATOS (SCHEMA)

La base de datos es la única fuente de la verdad.

3.1 Tablas Core (Financieras)

Tabla

Descripción

Reglas

boveda_central

Saldo total de la empresa.

Solo 1 registro (Singleton). Custodia capital mixto (Efectivo + Bancos).

cajas_operativas

Sesiones de trabajo de cajeros.

Estado: abierta, cerrada. Vinculada a usuario_id.

movimientos_caja_operativa

LIBRO MAYOR. Cada centavo que se mueve.

INSERT ONLY. Nunca se borra ni edita.

creditos

Contratos de deuda activos.

Vinculado a una garantia_id y caja_origen_id.

garantias

Bienes físicos en custodia.

Contiene tasación y fotos.

3.2 Tablas de Auditoría y Configuración

Tabla

Descripción

Reglas

movimientos_boveda_auditoria

Log de tesorería (Fondeo).

Campo Crítico: metadata (JSONB) para guardar origen (Socio) y canal (Yape/Banco).

system_settings

Motor de Reglas.

Configuración global (Límites Yape, Reglas de Remate, etc.). Solo editable por Admin.

profiles

Usuarios y Roles.

Roles: admin, gerente, cajero.

**verificacion_whatsapp**

**Códigos de verificación WhatsApp.**

**Códigos expiran en 5 minutos. RLS habilitado para Service Role.**

---

## 3.3 Sistema de Notificaciones WhatsApp

**Tabla:** `verificacion_whatsapp`  
**Propósito:** Verificación 2FA de números telefónicos  
**Expiración:** 5 minutos  
**Motor:** WAHA (Oracle Cloud)

**Funciones:**

- `enviarCodigoWhatsapp(telefono)` - Genera código 6 dígitos y envía  
- `verificarCodigoWhatsapp(telefono, codigo)` - Valida y marca como verificado  
- `limpiar_codigos_expirados()` - Limpieza automática (ejecutar cada hora)

**Límites Anti-Bloqueo:**

- Máximo 100 mensajes/hora
- Delay 5-10 segundos entre mensajes  
- Personalización obligatoria (usar nombre del cliente)
- No enviar entre 02:00-07:00 AM

4. 📂 ESTRUCTURA DE PROYECTO

Mantener el orden es obligatorio.

src/
├── app/
│   ├── (auth)/               # Login, Register (Rutas públicas)
│   ├── (dashboard)/          # Rutas protegidas
│   │   ├── dashboard/
│   │   │   ├── admin/        # Configuración del Sistema (Reglas)
│   │   │   ├── caja/         # Apertura, Cierre, Operaciones
│   │   │   ├── tesoreria/    # Inyección de Capital (Recargas)
│   │   │   ├── whatsapp/     # Panel de integración WhatsApp
│   │   │   └── page.tsx      # Dashboard Inteligente
├── components/
│   ├── ui/                   # Componentes shadcn (Botones, Inputs)
│   ├── business/             # Componentes de negocio (FormRecargaBoveda, TablaCreditos)
│   ├── whatsapp/             # Componentes WhatsApp (WhatsAppQR)
│   └── layout/               # Sidebar, Header
├── lib/
│   ├── actions/              # SERVER ACTIONS (Toda la lógica va aquí)
│   │   ├── tesoreria-actions.ts # Nueva: Manejo de Fondeo y Socios
│   │   ├── waha-actions.ts      # WhatsApp HTTP API (WAHA)
│   │   ├── whatsapp-actions.ts  # Verificación de teléfonos
│   │   ├── caja-actions.ts
│   │   └── config-actions.ts    # Nueva: Lectura de System Settings
│   ├── types/                # Definiciones TypeScript globales
│   └── config.ts             # Helper para leer reglas de negocio

5. 🛡️ PROTOCOLOS DE DESARROLLO

Protocolo A: Crear una Nueva Operación Financiera

Cualquier botón que mueva dinero debe seguir este patrón:

Interfaz: Definir tipos en src/lib/types/.

Server Action:

Validar Auth y Permisos.

Leer Configuración: Usar getSystemSettings() para verificar reglas dinámicas (ej: ¿Está permitido recibir Yape?).

Ejecutar transacción en BD.

UI: Usar shadcn/ui y manejo de errores con Toast.

Protocolo B: Seguridad RLS (Row Level Security)

Cajeros: Solo ven/editan su propia caja activa.

Admins: Acceso total.

Configuración: Solo Admins pueden hacer UPDATE en system_settings.

**Protocolo C: Integración WhatsApp Business**

Uso del Sistema de Verificación:

1. **Envío de Código:**

```typescript
const res = await enviarCodigoWhatsapp(telefono)
// Genera código 6 dígitos, guarda en BD, envía por WhatsApp
```

2. **Validación de Código:**

```typescript
const res = await verificarCodigoWhatsapp(telefono, codigo)
// Verifica código no expirado (5 min), marca como verificado
```

3. **Límites de Uso:**
   - Service Role Key: Usa `getServiceClient()` para bypasear RLS
   - Códigos expiran automáticamente
   - Respetar límite de 100 msg/hora

4. **UX Estándar:**
   - Toast notifications (no alerts)
   - Enter key para confirmar códigos
   - Opción de reenvío visible
   - Feedback claro de errores

6. 🚀 FLUJOS DE TRABAJO (WORKFLOWS)

Flujo 1: Inyección de Capital (Tesoreria)

El dinero entra a la empresa desde fuera (Socios/Bancos).

Admin selecciona Fuente (Socio/Propio) y Canal (Efectivo/Yape/Banco).

Sistema registra ingreso en movimientos_boveda_auditoria con metadata JSONB (Evidencia).

boveda_central aumenta su saldo disponible.

Flujo 2: Apertura de Caja (Transferencia de Custodia)

El dinero pasa de Bóveda a Cajero.

Gerente selecciona Cajero y Monto.

Sistema valida fondos en Bóveda.

Sistema bloquea fondos y crea caja_operativa.

Flujo 3: Operativa Diaria (Créditos y Cobros)

Interacción con el cliente.

Cobro Yape: Cajero registra cobro. Sistema verifica system_settings (¿Exigir evidencia?). Si es TRUE, obliga a subir foto/código.

Préstamo: Sistema verifica saldo caja. Crea crédito y desembolsa.

Flujo 4: Cierre de Caja (Conciliación)

Cajero realiza "Cierre Ciego" (cuenta dinero sin ver el sistema).

Sistema compara y genera reporte de sobrante/faltante.

Dinero retorna virtualmente a la custodia de la Bóveda.

7. 🧪 CHECKLIST DE CALIDAD (DEFINITION OF DONE)

Antes de hacer un Pull Request (PR) o subir código:

[ ] Type Check: npm run build sin errores.

[ ] Reglas de Negocio: ¿Tu código consultó system_settings antes de operar? (Ej: límites de montos).

[ ] Trazabilidad: ¿Si es un ingreso externo, guardaste la evidencia en metadata?

[ ] Validación Server-Side: Backend valida datos nuevamente.

[ ] Código Limpio: Sin console.logs ni librerías innecesarias.

**[ ] WhatsApp:** Si envías mensajes, ¿respetas límite 100/hora y personalizas contenido?

**[ ] UX Consistente:** ¿Inputs importantes tienen soporte de tecla Enter?

Nota Final para el Equipo:
La flexibilidad del sistema depende de system_settings. No hardcodear valores como "límite 500 soles". Leerlos siempre de la base de datos.

**Integración WhatsApp:**  
El sistema está conectado a WAHA (Oracle Cloud) para verificación 2FA y notificaciones. Todos los mensajes se registran en BD con timestamp. Respetar límites anti-bloqueo es OBLIGATORIO para evitar suspensión de la cuenta.
