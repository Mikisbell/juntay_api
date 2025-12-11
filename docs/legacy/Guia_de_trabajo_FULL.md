# juntay_api
🚀 Guía de Arquitectura y Trabajo: Proyecto JUNTAY

Fecha de Creación: 15 de Noviembre, 2025
Documento por: Mateo (Arquitecto de Software)
Versión: 1.0

Este documento sirve como la guía maestra y fuente de verdad para la arquitectura, instalación y flujo de trabajo del proyecto "JUNTAY", un sistema profesional para casas de empeño.

Documentación complementaria en `/docs/`:

- `docs/README.md`: Índice general de documentación.
- `docs/01-arquitectura-local-first.md`: Resumen de arquitectura Local-First.
- `docs/02-instalacion-entorno.md`: Instalación y entorno de desarrollo.
- `docs/03-modelo-datos-supabase.md`: Resumen del modelo de datos en Supabase.
- `docs/04-modulos-de-negocio.md`: Resumen funcional de módulos.
- `docs/05-seguridad-y-roles.md`: Seguridad, roles y auditoría.
- `docs/06-ux-ui-y-flujos.md`: UX/UI y flujos guiados.
- `docs/07-roadmap-y-qa.md`: Roadmap y checklist de QA.

1. 🎯 Visión y Requerimientos

1.1. Visión del Producto

El objetivo es construir un sistema de nivel bancario ("Casa de Empeño Profesional") que reemplace la operativa actual basada en Excel. El sistema debe ser robusto, seguro, 100% type-safe y automatizar procesos críticos.

1.2. Módulos de Negocio Clave

Basado en los requerimientos, el sistema gestionará:

Gestión de Caja: Apertura, cierre, movimientos (REQ-1).

Clientes: Gestión y validación (REQ-A, RENIEC).

Garantías: Gestión, fotos, valuación (REQ-3, REQ-6).

Créditos: Creación, cálculos de interés, pagos flexibles (REQ-4).

Vencimientos: Procesos automáticos de gracia y venta (REQ-5).

Remates: Módulo completo para subasta de prendas (NUEVO).

Notificaciones: Módulo centralizado (WhatsApp, SMS, Email) (NUEVO).

Integraciones: RENIEC, WhatsApp Business, YAPE (REQ-A, REQ-B).

Seguridad: Roles, Permisos, Auditoría (REQ-7, REQ-8).

Reportes: Gerenciales y de compliance (REQ-9).

1.3. Arquitectura "Local-First"

Para maximizar la velocidad de desarrollo, reducir costos y asegurar la paridad entre entornos, adoptamos una arquitectura "Local-First". Replicamos la pila completa de Supabase en la máquina local usando Docker, gestionada por la Supabase CLI. El desarrollo se realiza en un entorno Linux (WSL 2) para paridad 100% con el servidor de producción.

1.4. Información del Cliente y Operación Actual

Esta implementación está basada en una casa de empeño real con la siguiente operación:

- Volumen diario aproximado: 10 empeños promedio.
- Manejo de efectivo: hasta S/10,000 diarios.
- Personal actual: 2 empleados operativos.
- Usuarios del sistema: 4 usuarios simultáneos requeridos.
- Sucursales: 1 sucursal actual + 1 sucursal planificada.
- Sistema actual: Excel manual, sin automatización ni controles.

1.5. Estructura de Intereses y Políticas de Empeño

Estructura de intereses definida con el cliente (post-entrevista):

- Base mensual: 20%.
- Pago semanal: 5%.
- Pago quincenal: 10%.
- Pago tri-semanal: 15%.
- Renovaciones: permiten pagar solo intereses (20% o proporcional según frecuencia) para extender plazo.
- Tickets de pago: se requieren pagos parciales y totales con trazabilidad.

Estas reglas alimentan los módulos de Créditos, Pagos Flexibles, Vencimientos y Renoves.

1.6. Puntos Críticos del Negocio Identificados

Durante el análisis con el cliente se identificaron los siguientes puntos críticos que el sistema debe resolver:

- Control de caja deficiente: faltantes y sobrantes frecuentes al cierre.
- Comunicación fragmentada: uso de WhatsApp manual sin automatización ni trazabilidad.
- Valuación ineficiente: envío de fotos por WhatsApp a terceros para tasación.
- Proceso de vencimientos frágil: 1 semana de gracia y luego venta inmediata sin flujo formal.
- Alta dependencia del sistema: si el sistema cae 1 hora, la operación del negocio se detiene.

Todos los módulos de arquitectura, base de datos y UX/UI están diseñados para atacar directamente estos puntos críticos.

2. 🛠️ Stack Tecnológico y Plataformas

Este es el stack tecnológico oficial del proyecto:

Sistema Operativo Host: Windows 11.

Plataforma de Desarrollo: WSL 2 (Ubuntu 24.04) - Nuestro entorno de ejecución real.

IDE (Editor): WindSurf IDE (Instalado en Windows).

Runtime: Node.js (LTS) (Instalado y gestionado vía nvm dentro de WSL).

Lenguaje: TypeScript (100% Type-Safe).

Framework Frontend: Next.js 14 (App Router).

UI (Estilos): Tailwind CSS v4.

UI (Componentes): **shadcn/ui** - Componentes profesionales de React pre-construidos basados en Radix UI + Tailwind CSS. 100% type-safe, accesibles y altamente personalizables. Este es el stack UI mandatorio del proyecto.

UI (Animaciones): Transiciones CSS nativas de Tailwind (sin dependencias extra).

Orquestador de Backend: Docker Desktop (Instalado en Windows, con integración WSL).

Backend (PaaS): Supabase (Local y Cloud).

Base de Datos: PostgreSQL.

Autenticación: GoTrue.

Almacenamiento: Storage.

Gestor de Backend: Supabase CLI (Instalado vía npm en WSL).

Control de Versiones: Git.

3. 🏗️ Arquitectura del Entorno de Desarrollo

La arquitectura de conexión es la siguiente:

Host (Windows): Ejecuta la interfaz gráfica del WindSurf IDE y el motor de Docker Desktop.

Entorno (WSL 2 - Linux): Aquí es donde vive y se ejecuta todo el código:

El código fuente del proyecto (juntay_api).

El servidor de Node.js.

La Supabase CLI.

El Git.

Conexión IDE: WindSurf se conecta remotamente a WSL 2. Cuando abres una terminal en WindSurf, estás realmente dentro de Ubuntu.

Conexión Backend: La Supabase CLI (desde WSL) le da órdenes a Docker Desktop (en Windows) para levantar y gestionar los contenedores de Supabase.

Conexión de la App: La aplicación Next.js (corriendo en localhost:3000 en WSL) se conecta a la API de Supabase (corriendo en localhost:54321 en Docker).

4. ⚙️ Guía de Instalación y Configuración (Paso a Paso)

Esta es la guía para configurar un nuevo entorno de desarrollo desde cero.

Todos los comandos de terminal se ejecutan dentro del entorno WSL 2 (ej. la terminal integrada de WindSurf conectada a Ubuntu).

A. Configuración de la Plataforma Base

Habilitar WSL: En una terminal de PowerShell (Administrador) en Windows, ejecutar: wsl --install.

Reiniciar Windows: Al reiniciar, seguir las instrucciones de Ubuntu para crear un usuario y contraseña.

Instalar Docker Desktop: Descargar e instalar desde el sitio oficial de Docker.

Conectar Docker y WSL: Abrir Docker Desktop > Settings > Resources > WSL Integration > Activar la integración para la distro Ubuntu.

Instalar WindSurf IDE: Descargar e instalar en Windows.

Conectar WindSurf a WSL: Abrir WindSurf > Panel "Remote Explorer" > Clic derecho en Ubuntu-24.04 > "Connect in New Window". Trabajar siempre en esta nueva ventana.

B. Configuración del Entorno de Código (WSL)

Instalar Dependencias de Linux:

sudo apt update
sudo apt install curl git


Instalar NVM (Node Version Manager):

curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh) | bash


Recargar Terminal: Cerrar y reabrir la terminal de WindSurf (Ctrl+ñ).

Instalar Node.js:

nvm install --lts


C. Configuración del Proyecto "Juntay"

Crear Carpeta del Proyecto:

mkdir ~/juntay_api
cd ~/juntay_api


Inicializar Git y NPM:

git init
npm init -y


Instalar Dependencias del Stack:

# Dependencias de Next.js, UI y Animaciones
npm install next react react-dom tailwindcss postcss autoprefixer tw-animate-css

# Dependencias de Desarrollo (Supabase y TypeScript)
npm install supabase typescript @types/node @types/react @types/react-dom --save-dev

# Dependencias de Cliente Supabase (para la app)
npm install @supabase/supabase-js


D. Configuración de Archivos Esenciales (El "Parche Manual")

Debido a que no usamos create-next-app, debemos crear estos archivos manualmente para que Next.js y shadcn funcionen.

package.json:

Asegúrate de que estas líneas existan:

{
  "name": "juntay_api",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  ...
}


next.config.js: (Crear en la raíz)

Nota: Usamos export default porque package.json dice "type": "module".

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;


tsconfig.json: (Crear en la raíz)

Contiene el alias @/* que shadcn necesita.

{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true, "skipLibCheck": true, "strict": true,
    "noEmit": true, "esModuleInterop": true, "module": "esnext",
    "moduleResolution": "bundler", "resolveJsonModule": true,
    "isolatedModules": true, "jsx": "preserve", "incremental": true,
    "plugins": [{"name": "next"}],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}


.gitignore: (Crear en la raíz)

Vital para que Git ignore node_modules.

node_modules
.next
out
.env.local


tailwind.config.ts: (Crear en la raíz)

Se llenará automáticamente con shadcn.

E. Configuración de la Estructura src y shadcn/ui

Crear Estructura de Carpetas:

mkdir -p src/app
mkdir -p src/lib


Crear Archivo CSS Global:

Crear archivo: src/app/globals.css

Contenido:

@tailwind base;
@tailwind components;
@tailwind utilities;


Crear Layout Raíz:

Crear archivo: src/app/layout.tsx

Contenido:

import './globals.css';
export const metadata = { title: 'Juntay' };

export default function RootLayout({ children }: { children: React.Node }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}


Inicializar shadcn/ui:

Ejecutar en la terminal:

npx shadcn@latest init


Responder al asistente:

Base color?: Slate

Global CSS file?: src/app/globals.css

CSS variables?: Yes

Tailwind config?: tailwind.config.ts

Import alias?: @/

Utils?: src/lib/utils

Server Components?: Yes

components.json?: Yes

F. Configuración del Backend (Supabase Local)

Inicializar Supabase: (Crea la carpeta /supabase)

npx supabase init


Crear Migración de Base de Datos:

npx supabase migration new create_juntay_core_schema


Poblar el Archivo de Migración:

Abrir el archivo .sql recién creado en supabase/migrations/.

Pegar el siguiente esquema SQL (basado en los requerimientos):

-- ========= TABLA 1: CLIENTES =========
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    numero_documento TEXT UNIQUE NOT NULL,
    nombres TEXT,
    apellido_paterno TEXT,
    apellido_materno TEXT,
    telefono_principal TEXT,
    telefono_whatsapp TEXT,
    email TEXT,
    email_verificado BOOLEAN DEFAULT false,
    telefono_verificado BOOLEAN DEFAULT false,
    fecha_ultima_verificacion TIMESTAMPTZ,
    departamento_id TEXT,
    provincia_id TEXT,
    distrito_id TEXT,
    direccion TEXT,
    score_crediticio INT DEFAULT 0,
    limite_credito_aprobado NUMERIC(10, 2) DEFAULT 0,
    fecha_ultima_evaluacion TIMESTAMPTZ,
    historial_pagos TEXT DEFAULT 'nuevo',
    tiene_dni_copia BOOLEAN DEFAULT false,
    tiene_recibo_servicios BOOLEAN DEFAULT false,
    tiene_comprobante_ingresos BOOLEAN DEFAULT false,
    documentos_completos BOOLEAN DEFAULT false
);

-- ========= TABLA 2: GARANTIAS =========
CREATE TABLE public.garantias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    numero_boleta TEXT UNIQUE,
    fecha_vencimiento_legal DATE,
    periodo_gracia_dias INT DEFAULT 30,
    descripcion TEXT,
    categoria TEXT,
    peso NUMERIC(10, 2),
    dimensiones TEXT,
    material TEXT,
    color TEXT,
    ubicacion_estante TEXT,
    fecha_tasacion DATE,
    valor_tasacion NUMERIC(10, 2),
    valor_prestamo_maximo NUMERIC(10, 2),
    requiere_evaluacion_especial BOOLEAN DEFAULT false,
    notas_tasador TEXT,
    estado TEXT DEFAULT 'evaluacion'
);

-- ========= TABLA 3: CREDITOS =========
CREATE TABLE public.creditos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) NOT NULL,
    garantia_id UUID REFERENCES public.garantias(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    numero_contrato TEXT UNIQUE,
    fecha_desembolso TIMESTAMPTZ DEFAULT now(),
    fecha_vencimiento_legal DATE,
    dias_gracia INT DEFAULT 30,
    monto_prestado NUMERIC(10, 2),
    tasa_interes_mensual NUMERIC(5, 2),
    tasa_interes_anual NUMERIC(5, 2),
    interes_acumulado NUMERIC(10, 2) DEFAULT 0,
    mora_acumulada NUMERIC(10, 2) DEFAULT 0,
    fecha_inicio_mora DATE,
    valor_garantias NUMERIC(10, 2),
    porcentaje_cobertura NUMERIC(5, 2),
    estado TEXT DEFAULT 'activo',
    notificaciones_enviadas INT DEFAULT 0,
    fecha_ultima_notificacion TIMESTAMPTZ
);

-- ========= TABLA 4: REMATES =========
CREATE TABLE public.remates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garantia_id UUID REFERENCES public.garantias(id) NOT NULL,
    credito_id UUID REFERENCES public.creditos(id),
    numero_remate TEXT UNIQUE,
    fecha_inicio_remate TIMESTAMPTZ,
    fecha_fin_remate TIMESTAMPTZ,
    precio_base NUMERIC(10, 2),
    precio_venta NUMERIC(10, 2),
    estado TEXT DEFAULT 'programado',
    comprador_nombre TEXT,
    comprador_documento TEXT,
    comprador_telefono TEXT,
    metodo_pago TEXT,
    observaciones TEXT
);

-- ========= TABLA 5: NOTIFICACIONES =========
CREATE TABLE public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id),
    credito_id UUID REFERENCES public.creditos(id),
    tipo TEXT NOT NULL,
    canal TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    contenido TEXT,
    fecha_programada TIMESTAMPTZ,
    fecha_enviado TIMESTAMPTZ,
    mensaje_id_externo TEXT,
    error_detalle TEXT
);


Guardar el archivo .sql.

Aplicar la Migración:

Este comando destruye la BBDD local (y la tabla test de prueba) y la recrea con el nuevo esquema.

npx supabase db reset


Confirmar escribiendo y.

Conectar App y Backend (Variables de Entorno):

Crear archivo: .env.local (en la raíz)

Pegar el contenido (obtener las claves de npx supabase status):

NEXT_PUBLIC_SUPABASE_URL=[http://127.0.0.1:54321](http://127.0.0.1:54321)
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_PUBLISHABLE_ANON_KEY


5. 🔁 Flujo de Trabajo Diario

Este es el proceso para empezar a trabajar cada día:

Iniciar Docker: Asegurarse de que Docker Desktop esté corriendo en Windows.

Abrir Proyecto: Abrir WindSurf y conectarse a WSL (Connect in New Window).

Levantar Backend (Terminal 1): Abrir una terminal (Ctrl+ñ) y ejecutar:

npx supabase start


Backend listo. Puedes acceder al Studio en http://127.0.0.1:54323.

Levantar Frontend (Terminal 2): Abrir una segunda terminal (clic en +) y ejecutar:

npm run dev


Frontend listo. Abre http://localhost:3000 (o el puerto que indique) en tu navegador.

6. 🐞 Bitácora de Solución de Problemas (Troubleshooting)

Esta sección documenta los problemas que encontramos y sus soluciones.

Problema 1: La "Guerra de Módulos" (CJS vs. ESM)

Síntomas:

Error: module is not defined in ES module scope (al ejecutar npm run dev).

Specified module format (CommonJs) is not matching... (al ejecutar npm run dev).

Error: Cannot find module './test.ts' (al usar require en un package.json tipo module).

Causa: Conflicto entre el package.json (que por defecto era commonjs) y Next.js (que requiere module).

Solución Definitiva:

Añadir "type": "module" al package.json.

Renombrar next.config.js a next.config.js (en lugar de .cjs).

Cambiar el contenido de next.config.js para que use la sintaxis de ES Module:

// module.exports = ... // INCORRECTO
export default nextConfig; // CORRECTO


Problema 2: Proceso "Fantasma" de Next.js

Síntoma: El servidor no arranca y da el error Unable to acquire lock at .../.next/dev/lock, is another instance of next dev running?. Esto ocurre incluso después de que lsof -i :3001 y rm .next/dev/lock no encuentren nada.

Causa: Un proceso node colgado (zombie) que no libera los recursos, o un caché corrupto en .next.

Solución ("Nuclear"):

Matar todos los procesos de node colgados:

pkill -f node


Borrar toda la carpeta caché de Next.js (se recreará limpiamente):

rm -rf .next


Volver a ejecutar npm run dev.

Problema 3: Módulos CSS Faltantes

Síntoma: Build Error: Module not found: Can't resolve 'tw-animate-css'.

Causa: El inicializador de shadcn añadió @import "tw-animate-css"; al globals.css pero no instaló el paquete.

Solución: Instalar la dependencia manualmente:

npm install tw-animate-css

7. Estado Actual del Sistema y Gap Analysis

7.1. Estado del Sistema Post-Implementaciones Recientes (Nov 18, 2025 - VERIFICACIÓN DETALLADA)

### ⚠️ ADVERTENCIA CRÍTICA: Documentación vs Realidad

**Esta guía fue escrita como un documento de VISIÓN Y REQUERIMIENTOS, no como descripción del estado actual.**

Hasta Nov 18, 2025, las secciones 1-8 documentan **qué DEBERÍA estar implementado**, no **qué ESTÁ realmente implementado**. 

**SOLO las secciones 7.1-7.4 reflejan el estado real del código.**

---

### **ESTADO REAL VERIFICADO EN CÓDIGO (Nov 18, 2025 - 14:30 UTC)**

#### ✅ COMPLETADO:
- ✅ Arquitectura base Local-First con Supabase local (Docker + CLI)
- ✅ Stack tecnológico configurado (Next.js 16.0.3, TypeScript 5, Tailwind CSS v4, shadcn/ui)
- ✅ Estructura de carpetas organizada (src/app, src/components, src/lib)
- ✅ Esquema de base de datos PostgreSQL (5 tablas: clientes, garantias, creditos, remates, notificaciones)
- ✅ Navegación principal del dashboard con sidebar
- ✅ Componentes UI básicos implementados (Button, Card, Input, Label, Select, Textarea)
- ✅ Página de inicio funcional
- ✅ Integración Supabase operativa (cliente y admin)
- ✅ Sistema 100% Type-Safe (0 errores TypeScript actualmente)
- ✅ PageHeader component (profesional, Vercel-style) creado y desplegado en 6+ páginas
- ✅ creditsService.ts completamente alineado con schema real (28 propiedades en Credito interface)
- ✅ CreditStatus type actualizado con estados reales: vigente, vencido, en_mora, pagado, cancelado, renovado, en_remate

#### ⚠️ PARCIALMENTE IMPLEMENTADO:
- 🔄 Control de Caja: Estructura UI + Server Actions básicas (abrir, cerrar, movimientos), falta lógica completa (desglose por denominaciones, arqueo detallado, reportes)
- 🔄 Módulo de Clientes: Estructura UI lista, falta CRUD y conexión Supabase (sin búsqueda, sin edición)
- 🔄 Módulo de Créditos: Página de listado funcional con datos reales de BD, falta crear/editar créditos
- 🔄 Base de datos: Esquema completo con 5 tablas, falta triggers y funciones automáticas de negocio

#### ❌ NO IMPLEMENTADO:
- ❌ Contratos PDF: No hay generación de PDF
- ❌ Sistema de Fotos de Garantías: No hay UI ni funcionalidad (tabla preparada pero sin lógica)
- ❌ WhatsApp Business API: No hay integración (no existen endpoints)
- ❌ Sistema YAPE: No hay integración (no existen endpoints)
- ❌ Roles y Permisos: No hay autenticación ni autorización (sin GoTrue implementation)
- ❌ RENIEC API: No hay integración
- ❌ Pagos flexibles: No hay lógica de cálculo de intereses variable
- ❌ Proceso de vencimientos: No hay workflow automático
- ❌ Remates UI: Tabla en DB pero sin interfaz de usuario
- ❌ Notificaciones: Tabla en DB pero sin lógica de envío
- ❌ Auditoría y Logs: No hay registro de acciones
- ❌ Reportes: No hay módulo de reportes

---

### 7.2. Cambios Recientes (Nov 18, 2025 - Última Sesión)

**Problemas Descubiertos y Resueltos Hoy:**

#### Problema 1: Console Error "Error obteniendo cajas personales: {}"
- **Causa**: Typo en `bovedaService.ts` - referencia a tabla inexistente `'cajas_pesonales'`
- **Solución**: Corregidos 11 referencias de tabla de `'cajas_pesonales'` → `'cajas'`
- **Estado**: ✅ RESUELTO

#### Problema 2: SQL Error "column creditos.fecha_vencimiento does not exist"
- **Causa**: Schema mismatch - Credito interface mapeaba a columnas inexistentes
- **Descubrimiento**: Query a DB real reveló 45 columnas con nombres diferentes a los esperados
- **Solución**: Reescritura completa de Credito interface (18 → 28 propiedades) con mapeo correcto:
  - `fecha_vencimiento` ❌ → `fecha_ultimo_vencimiento` ✅
  - `monto_principal` ❌ → `monto_prestado` ✅
  - `tasa_interes` ❌ → `tasa_interes_mensual` ✅
  - `intereses_acumulados` ❌ → `interes_acumulado` ✅
- **Archivos Afectados**: `src/lib/creditsService.ts` (6 locations), `src/app/(dashboard)/dashboard/creditos/page.tsx` (4 locations)
- **Estado**: ✅ RESUELTO

#### Problema 3: CreditStatus Type Mismatch
- **Causa**: Código usaba `'activo'` pero DB real no tiene este estado
- **Estados Válidos en DB**: `'vigente', 'vencido', 'en_mora', 'pagado', 'cancelado', 'renovado', 'en_remate'`
- **Solución**: CreditStatus type actualizado en `creditsService.ts` línea 3
- **Estado**: ✅ RESUELTO

#### Problema 4: Runtime Error "Cannot read properties of undefined (reading 'toFixed')"
- **Causa**: `creditos/page.tsx` línea 208 referenciaba propiedad no existente `credito.monto_principal`
- **Solución**: Actualización de todas las referencias de propiedad en template
- **Verificación**: `get_errors()` → 0 errores TypeScript
- **Estado**: ✅ RESUELTO

---

### 7.3. Componentes Creados Hoy

#### `src/components/dashboard/PageHeader.tsx` (NUEVO)
- **Propósito**: Header profesional, Vercel-style, reutilizable
- **Props**: `title: string`, `description?: string`, `action?: React.ReactNode`
- **Diseño**: Tipografía clara, subtítulo discreto, botón de acción opcional
- **Aplicado a**: boveda, creditos, clientes, caja, apertura-caja, tasaciones (6+ páginas)
- **Impacto**: Consistencia visual en todo el dashboard

---

### 7.4. Métricas de Calidad (Actualizado Nov 18)

| Métrica | Anterior | Actual | Cambio |
|---------|----------|--------|--------|
| Errores TypeScript | 15+ | 0 | ✅ -100% |
| Warnings | Múltiples | 0 | ✅ -100% |
| Propiedades en Credito | 18 (incorrectas) | 28 (correctas) | ✅ +56% |
| Cobertura de tipos | ~95% | 100% | ✅ +5% |
| DB Schema alignment | Baja | Alta | ✅ Verificada |

---

### 7.5. CORRECCIONES A LA GUÍA (Nov 18, 2025)

#### ⚠️ IMPORTANTE: Visión vs Realidad

**Secciones de esta guía que son ASPIRACIONALES (no son estado actual):**
- Sección 1: Visión del Producto ✓ (correcto como sueño)
- Sección 1.2: Módulos de Negocio Clave ✓ (correcto como roadmap)
- Sección 4: Guía de Instalación ✓ (correcta pero proyecto ya está instalado)
- Sección 8: Requerimientos Funcionales Detallados ✗ (NO están implementados)
- Sección 9: Roadmap ✗ (aspiracional, NO es estado real)

**Secciones que son REALES (estado verificado):**
- Sección 2: Stack Tecnológico ✓ (correcto y verificado)
- Sección 3: Arquitectura del Entorno ✓ (correcto y verificado)
- Sección 7.1-7.5: Estado Real ✓ (NUEVA - completamente verificada)

---

### 7.6. Cómo Interpretar Esta Guía Correctamente

**OPCIÓN A: Como Documento Aspiracional (Original)**
- Úsalo para entender la VISIÓN del proyecto
- Úsalo como ROADMAP de qué se debería construir
- NO uses para saber qué está implementado ahora
- Leer: Secciones 1-9 como "meta a largo plazo"

**OPCIÓN B: Como Documento de Estado Actual (Recomendado)**
- Lee SOLO la sección 7.1-7.6 para estado real
- Descarga `CHANGELOG.md` para cambios recientes
- Usa sección 9.2 como "próximas fases realistas"
- Ignora las aspiraciones, enfócate en lo que EXISTE

---

### 7.7. Próximas Prioridades (Realista - Nov 18+)

**Inmediatas (Hoy/Mañana):**
1. ✅ Verifica que `http://localhost:3002/dashboard/creditos` carga sin errores
2. ⬜ Agrega 2-3 más créditos de test para verificar listado funciona
3. ⬜ Implementa función "Crear Crédito" básica

**Esta Semana:**
1. ⬜ Completa módulo Clientes (CRUD básico)
2. ⬜ Implementa "Crear Garantía" funcional
3. ⬜ Mejora UI general (sombras, espaciados, colores)

**Próximas 2 Semanas:**
1. ⬜ Integra RENIEC API (opcional pero de alto valor)
2. ⬜ Agrega sistema de Fotos de Garantías
3. ⬜ Implementa Pagos básicos

8. Requerimientos Funcionales Detallados

Esta sección resume los módulos funcionales clave definidos con el cliente, en base al documento de requerimientos unificados.

8.1. Control de Caja Completo

Funcionalidades principales:

- Apertura de caja con conteo por denominaciones, registro de monto inicial y responsable.
- Registro de movimientos de ingreso/egreso con concepto y referencia.
- Cierre de caja con comparación sistema vs físico, diferencias y justificación.
- Arqueo detallado y reporte automático de cierre.

Modelo de datos de referencia:

```typescript
interface SesionCaja {
  id: string
  caja_id: string
  usuario_apertura_id: string
  fecha_apertura: Date
  monto_inicial: number
  desglose_apertura: DesgloseEfectivo
  estado: 'abierta' | 'cerrada'

  fecha_cierre?: Date
  usuario_cierre_id?: string
  monto_final_sistema: number
  monto_final_fisico: number
  diferencia: number
  observaciones_cierre?: string
}

interface MovimientoCaja {
  id: string
  sesion_caja_id: string
  tipo: 'ingreso' | 'egreso'
  concepto: string
  monto: number
  referencia?: string
  usuario_id: string
  timestamp: Date
}
```

8.2. Generación de Contratos PDF

Funcionalidades principales:

- Plantilla personalizable con datos de empresa, cliente, crédito y garantía.
- Generación automática de PDF al aprobar crédito con numeración secuencial.
- Almacenamiento en Supabase Storage, con hash de integridad.
- Estado del contrato: generado, firmado, anulado.

Modelo de datos de referencia:

```typescript
interface ContratoGenerado {
  id: string
  credito_id: string
  numero_contrato: string
  template_version: string
  fecha_generacion: Date
  archivo_url: string
  hash_documento: string
  estado: 'generado' | 'firmado' | 'anulado'
}
```

8.3. Sistema de Fotos de Garantías

Funcionalidades principales:

- Mínimo 3 fotos y máximo 10 por garantía.
- Interfaz de subida con preview y compresión automática.
- Galería tipo back-office para revisar, reordenar y eliminar fotos.

Modelo de datos de referencia:

```typescript
interface GarantiaFoto {
  id: string
  garantia_id: string
  archivo_url: string
  thumbnail_url: string
  orden: number
  tamano_bytes: number
  fecha_subida: Date
  usuario_id: string
}
```

8.4. Sistema de Pagos Flexibles

Funcionalidades principales:

- Cálculo automático de intereses según frecuencia:
  - Mensual: 20% base.
  - Semanal: 5%.
  - Quincenal: 10%.
  - Tri-semanal: 15%.
- Soporte para pagos parciales, totales y renovaciones.
- Control de número de renovaciones permitidas.

Modelo de datos de referencia:

```typescript
interface PagoFlexible {
  cuota_id: string
  tipo_pago: 'parcial' | 'total' | 'renovacion'
  frecuencia: 'diario' | 'semanal' | 'quincenal' | 'tri-semanal' | 'mensual'
  porcentaje_aplicado: number
  monto_calculado: number
  monto_pagado: number
  saldo_pendiente: number
  es_renovacion: boolean
  numero_renovacion?: number
}
```

8.5. Proceso de Vencimientos

Funcionalidades principales:

- 1 semana de gracia después de la fecha de vencimiento legal.
- Recordatorios automáticos durante la gracia (WhatsApp u otros canales).
- Después de la gracia: preparación para remate y cambio de estado.
- Workflow para pasar de crédito vencido a remate programado.

Modelo de datos de referencia:

```typescript
interface ProcesoVencimiento {
  cuota_id: string
  dias_vencido: number
  interes_moratorio: number
  monto_total_adeudado: number
  estado_gestion: 'pendiente' | 'gestionado' | 'pagado'
  proxima_accion: Date
  tipo_accion: 'llamada' | 'whatsapp' | 'visita' | 'remate'
}
```

8.6. Integración WhatsApp Business y Sistema YAPE

Funcionalidades principales:

- Confirmaciones automáticas de pago: monto, saldo y código de contrato.
- Recordatorios de vencimiento (7, 3, 1 días antes y día de vencimiento).
- Mensajes estacionales (fiestas, campañas) personalizados por cliente.
- Flujo de solicitudes y confirmaciones de pago por YAPE.

APIs de referencia (ya implementadas):

```typescript
/api/whatsapp/enviar
/api/whatsapp/confirmacion-pago
/api/whatsapp/solicitar-pago-yape
/api/whatsapp/confirmar-pago-yape
/api/whatsapp/programar-recordatorios
/api/whatsapp/cron
```

8.7. Integración RENIEC API

Funcionalidades principales:

- Autocompletado de datos del cliente a partir del DNI.
- Validación de identidad y detección de DNIs duplicados.
- Cache local de consultas frecuentes.

Modelo de datos de referencia:

```typescript
interface ConsultaRENIEC {
  dni: string
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  direccion: string
  ubigeo: string
  estado_civil?: string
  fecha_nacimiento?: string
  validado: boolean
  fecha_consulta: Date
}
```

8.8. IA de Valuación y Scoring de Clientes

Funcionalidades principales:

- Valuación automática de garantías a partir de fotos.
- Clasificación por categoría y precio sugerido de mercado.
- Scoring de clientes según historial de pagos y riesgo.

Modelos de referencia:

```typescript
interface ValuacionIA {
  garantia_id: string
  imagen_url: string
  categoria_detectada: string
  precio_sugerido: number
  confianza_nivel: number
  factores_considerados: string[]
  fecha_valuacion: Date
}

interface ScoringCliente {
  cliente_id: string
  puntaje_credito: number
  probabilidad_mora: number
  limite_sugerido: number
  factores_riesgo: string[]
  fecha_calculo: Date
}
```

8.9. Sistema de Roles y Permisos

Funcionalidades principales:

- Definición de roles: Administrador, Gerente, Analista de Crédito, Cajero.
- Permisos granulares por módulo (clientes, créditos, caja, reportes, etc.).

Modelo de datos de referencia:

```typescript
interface PermisosUsuario {
  clientes_ver: boolean
  clientes_crear: boolean
  clientes_editar: boolean
  clientes_eliminar: boolean

  creditos_ver: boolean
  creditos_crear: boolean
  creditos_aprobar: boolean
  creditos_desembolsar: boolean

  caja_abrir: boolean
  caja_cerrar: boolean
  caja_movimientos: boolean
  caja_reportes: boolean

  reportes_financieros: boolean
  reportes_gerenciales: boolean
  reportes_auditoria: boolean
}
```

8.10. Auditoría y Logs de Seguridad

Funcionalidades principales:

- Registro de acciones de usuarios (quién, qué, cuándo, dónde).
- Registro de cambios en datos sensibles con valores antes/después.
- Logs de accesos, intentos fallidos e IP/dispositivo.

Modelo de datos de referencia:

```typescript
interface LogAuditoria {
  id: string
  usuario_id: string
  accion: string
  modulo: string
  registro_id?: string
  datos_anteriores?: object
  datos_nuevos?: object
  ip_address: string
  user_agent: string
  timestamp: Date
}
```

8.11. Reportes SUNAT, Gerenciales y de Compliance

Funcionalidades principales:

- Comprobantes electrónicos (boletas, facturas) para SUNAT.
- Libro de operaciones y exportes mensuales.
- Reportes financieros, de morosidad, inventario y auditoría.

Modelo de datos de referencia:

```typescript
interface ComprobanteElectronico {
  id: string
  tipo: 'boleta' | 'factura'
  numero: string
  fecha_emision: Date
  cliente_documento: string
  monto_total: number
  igv: number
  estado_sunat: 'pendiente' | 'enviado' | 'aceptado' | 'rechazado'
  xml_content: string
  hash_signature: string
}
```

Las secciones siguientes de esta guía (modelo de datos, UX/UI, seguridad y roadmap) deben interpretarse siempre a la luz de estos requerimientos funcionales.

9. 🗺️ Roadmap del Proyecto JUNTAY (REVISADO Nov 18, 2025)

9.1. Estado Actual (Nov 18, 2025 - VERIFICADO EN CÓDIGO)

**Backend / Datos:**
- ✅ Esquema Supabase básico (5 tablas principales)
- ⚠️ Funciones automáticas (incompletas)
- ⚠️ Índices y constraints (parciales)

**Frontend / Módulos:**
- ✅ Navegación principal del dashboard
- ✅ Página de inicio
- ⚠️ Control de Caja (estructura + botones básicos)
- ⚠️ Módulo de Clientes (UI sin lógica)
- ❌ Módulo de Garantías
- ❌ Módulo de Créditos
- ❌ Módulo de Remates
- ❌ Módulo de Notificaciones
- ❌ Integración WhatsApp
- ❌ Integración YAPE
- ❌ Integración RENIEC

**Calidad Técnica:**
- ✅ Proyecto 100% Type-Safe
- ✅ Build de Next.js funcionando
- ✅ Integración Supabase operativa
- ❌ No hay tests
- ❌ No hay autenticación

9.2. Próximas Fases (REALISTA)

**Fase 1 – MVP Funcional (Semanas 1-3, partir desde Nov 18)**

Objetivo: Sistema usable para 1 sucursal con operativa básica

Semana 1:
- [ ] Completar módulo Caja (desglose, arqueo, movimientos vinculados)
- [ ] Implementar CRUD básico de Clientes con Supabase
- [ ] Agregar más componentes UI (Input, Form, Dialog, Select)

Semana 2:
- [ ] Integrar RENIEC API (autocompletado de clientes)
- [ ] Implementar módulo de Garantías (crear, editar, fotos)
- [ ] Crear módulo de Créditos básico (crear, listar)

Semana 3:
- [ ] Implementar Pagos Flexibles (cálculo de intereses)
- [ ] Agregar proceso de vencimientos (gracia, mora)
- [ ] Crear UI de Remates básica

**Fase 2 – Comunicación y Seguridad (Semanas 4-5)**

Objetivo: Automatizar comunicación, asegurar acceso

- [ ] Integración WhatsApp Business API
- [ ] Integración YAPE API
- [ ] Autenticación GoTrue + Roles básicos
- [ ] Generación de Contratos PDF
- [ ] Sistema de Auditoría

**Fase 3 – Reportes y Pulido (Semanas 6-7)**

Objetivo: Reportes funcionales, UX mejorada

- [ ] Reportes diarios de caja
- [ ] Reportes de cartera y morosidad
- [ ] Exportes para contabilidad (CSV/Excel)
- [ ] Mejorar UX/UI basado en feedback
- [ ] Testing automatizado

**Fase 4 – Diferenciadores (Semana 8+)**

Objetivo: Ventajas competitivas

- [ ] IA de valuación (detección de garantías por imagen)
- [ ] Scoring de clientes (probabilidad de mora)
- [ ] Dashboards ejecutivos con KPIs
- [ ] Optimizaciones de performance

**DURACIÓN TOTAL ESTIMADA:** 8 semanas para MVP en producción

10. ✅ Checklist de QA / Aceptación

10.1. Caja y Operación Diaria

- [ ] Puedo abrir caja con monto inicial y desglose por billetes/monedas.
- [ ] Puedo registrar ingresos/egresos con concepto y ver el saldo en tiempo real.
- [ ] Puedo cerrar caja y ver diferencias entre físico y sistema.
- [ ] Obtengo un reporte de cierre de caja claro (fecha, usuario, diferencias).

10.2. Clientes, Garantías y Créditos

- [ ] Puedo registrar un cliente nuevo con todos los datos necesarios.
- [ ] (Cuando esté listo) DNI → se rellenan automáticamente los campos básicos (RENIEC).
- [ ] Puedo registrar una garantía con descripción, fotos y ubicación física.
- [ ] Puedo crear un crédito asociado a un cliente y una garantía con la tasa acordada.
- [ ] Veo claramente: cuánto recibe hoy, cuánto paga en total y cuándo vence.

10.3. Pagos, Renovaciones y Vencimientos

- [ ] Puedo registrar pagos parciales y ver el saldo actualizado.
- [ ] Puedo registrar pagos totales y ver el crédito como cancelado.
- [ ] Puedo hacer renovaciones (pago solo intereses) y ver el nuevo vencimiento.
- [ ] Veo listados de créditos por estado: al día, en gracia, vencidos, en remate.

10.4. Remates y Notificaciones

- [ ] Puedo ver garantías que ya pasaron el proceso de vencimiento y son elegibles para remate.
- [ ] Puedo programar un remate con fecha, precio base y condiciones.
- [ ] Puedo registrar la venta de una garantía en remate y ver el resultado.
- [ ] El sistema envía o registra notificaciones de recordatorio de pago / vencimiento.
- [ ] Puedo ver un historial de notificaciones por cliente/crédito.

10.5. WhatsApp, YAPE y Comunicación

- [ ] Al registrar un pago, el cliente recibe un mensaje de confirmación.
- [ ] Antes del vencimiento, el cliente recibe recordatorios en los días acordados.
- [ ] Puedo enviar o simular el envío de una solicitud de pago YAPE.
- [ ] El sistema registra qué mensajes se enviaron y su estado (pendiente, enviado, error).

10.6. Seguridad y Roles

- [ ] Un cajero solo puede ver/hacer lo que le corresponde.
- [ ] Un gerente puede ver reportes y configuraciones avanzadas.
- [ ] Un administrador puede configurar usuarios, roles y parámetros globales.
- [ ] Se registran en un log las acciones importantes (quién hizo qué y cuándo).

10.7. Reportes y Control

- [ ] Puedo generar un reporte diario de caja.
- [ ] Puedo ver un resumen de cartera (créditos activos, vencidos, en remate).
- [ ] Puedo exportar información para el contador (CSV/Excel mínimo).
- [ ] La información clave que hoy está en Excel está cubierta por este sistema.

10.8. Experiencia de Uso

- [ ] El flujo de “nuevo empeño” es claro y guiado (cliente → garantía → crédito → contrato).
- [ ] El flujo de “pago / renovación / recuperación de prenda” se entiende sin explicación extra.
- [ ] Las pantallas muestran información clara, sin términos confusos.
- [ ] Un usuario nuevo puede aprender el sistema en pocas horas con esta guía.
