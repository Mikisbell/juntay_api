🏛️ DOCUMENTACIÓN MAESTRA OFICIAL - PROYECTO JUNTAY
Versión: 3.0 (Arquitectura Bancaria + Motor de Tasación) Fecha: 21 Noviembre 2025 Estado: Producción / Desarrollo Activo

1. 🏗️ ARQUITECTURA OFICIAL (Local-First Bancaria)
El sistema opera bajo una arquitectura híbrida: Frontend Moderno con Lógica de Core Bancario.

Principios Fundamentales
Inmutabilidad del Dinero: El dinero no se edita, solo se mueve. Usamos un Ledger Append-Only (movimientos_caja_operativa).

Cerebro Centralizado: No hay reglas "quemadas" en el código. Todo límite (Yape, tasas, montos) se lee de la tabla system_settings.

Entorno Local-First: El desarrollo ocurre en una réplica exacta de producción usando contenedores.

El Stack Tecnológico Oficial
Host: Windows 11 (UI / IDE WindSurf).

Ejecución: WSL 2 (Ubuntu 24.04) -> Aquí corre Node.js y Git.

Base de Datos: Supabase (PostgreSQL) corriendo en Docker Desktop.

Frontend: Next.js 14 (App Router) + TypeScript Estricto.

UI System: Shadcn/UI + Tailwind CSS v4.

2. ⚙️ INSTALACIÓN DEL ENTORNO OFICIAL
Pasos exactos para un desarrollador nuevo o para reiniciar el entorno.

Prerrequisitos:

WSL 2 instalado (wsl --install).

Docker Desktop corriendo en Windows (Integración WSL activada).

Node.js LTS en WSL (nvm install --lts).

Arranque Diario:

Bash

# Terminal 1 (WSL): Levantar Base de Datos y Auth

npx supabase start

# Terminal 2 (WSL): Levantar Aplicación

npm run dev
Variables de Entorno (.env.local):

Fragmento de código

NEXT_PUBLIC_SUPABASE_URL=<http://127.0.0.1:54321>
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Tu clave de npx supabase status]
3. 🗄️ MODELO DE DATOS OFICIAL (Supabase v3.0)
Este esquema reemplaza a todos los anteriores. Se basa en la migración 20251121_db_completa_v3.sql.

A. El Núcleo Financiero
boveda_central (Singleton): La suma total del dinero de la empresa.

cajas_operativas: Sesiones temporales de los cajeros.

movimientos_caja_operativa (Ledger): Tabla inmutable de transacciones.

movimientos_boveda_auditoria: Registro de fondeo (entradas de socios/bancos).

B. El Motor de Negocio
system_settings (Singleton): Configuración dinámica (Precio oro, Límites Yape, Switches de seguridad).

creditos: Contratos vinculados a un cliente y una garantía.

garantias: El bien físico. Contiene el valor_tasacion y estado (Custodia/Remate).

C. Seguridad
Row Level Security (RLS): Activado en todas las tablas críticas.

Políticas: Cajeros solo ven su propia caja. Admins ven todo.

4. 💼 MÓDULOS DE NEGOCIO OFICIALES
Módulo A: Tesorería (El Fondeo)
Objetivo: Inyectar capital a la empresa y distribuirlo a los cajeros.

Flujo: Socio aporta capital -> Bóveda Central -> Asignación a Caja Operativa.

Regla: Todo ingreso externo requiere evidencia en metadata (JSONB).

Módulo B: El Mostrador (Atención al Cliente)
Cotizador Inteligente (Nuevo):

Oro: Gramaje x Precio (de system_settings).

Electro: Valor Mercado x Factor de Estado (Matriz 85%-30%).

Formalización: Creación atómica de Cliente + Contrato + Desembolso.

Módulo C: Gestión de Vida del Crédito
Interés al Vencimiento: El interés no se descuenta al inicio, se cobra al final.

Renovación: Pago de interés acumulado para extender plazo.

Desempeño: Pago de Capital + Interés para liberar la prenda.

Módulo D: Cierre y Control
Cierre Ciego: El cajero cuenta el dinero físico y lo ingresa. El sistema calcula la diferencia (Sobrante/Faltante) contra el Ledger.

5. 🔐 SEGURIDAD Y ROLES OFICIAL
Matriz de Roles
Admin: Acceso total. Único capaz de editar system_settings y ver Bóveda.

Gerente: Puede abrir/cerrar cajas de otros y ver reportes. No toca configuración crítica.

Cajero: Solo ve su caja activa y opera transacciones.

Trazabilidad (Auditoría)
Campo metadata (JSONB): Obligatorio para cualquier operación no-efectivo.

Ejemplo Yape: { "codigo_operacion": "123456", "banco": "BCP" }.

Logs: updated_by y created_at en todas las tablas sensibles.

6. 🎨 UX/UI Y FLUJOS OFICIAL
Diseño Visual (Shadcn/UI)
Estilo: Minimalista, alta densidad de información (tipo Dashboard Financiero).

Componentes Clave: DataTable (TanStack), Sheet (Paneles laterales), Card (KPIs).

Flujo Crítico: "Nuevo Empeño" (Wizard)
No usar modales simples. Usar un proceso paso a paso en pantalla completa:

Identificación: DNI/RUC (Búsqueda rápida).

Tasación: Calculadora interactiva (Oro/Electro).

Acuerdo: Definición de monto y plazo.

Firma: Generación de contrato y desembolso.

7. 🗺️ ROADMAP Y QA (Plan de Ejecución)
Tier 1: Infraestructura (✅ COMPLETADO)
Base de datos v3.0 (Schema, RLS, Triggers).

Configuración del entorno Local-First.

Motor de Reglas (system_settings).

Tier 2: El Núcleo Operativo (🚧 EN PROGRESO)
Semana Actual:

Implementar el Cotizador UI (con la lógica de matriz que definimos).

Conectar Cotizador a Server Action crear_contrato.

Siguiente Semana:

Módulo de Caja (Apertura/Cierre) conectado a cajas_operativas.

Tier 3: Ciclo de Vida Avanzado (Pendiente)
Proceso de Remates (Paso automático de Vencido -> En Remate).

Integración de impresoras térmicas (Tickets).

8. 🤖 REGLAS DE DESARROLLO (AI RULES)
Para mantener la calidad, cada línea de código debe seguir estas directivas:

Consultar siempre system_settings: Nunca hardcodear valores como "20% interés". Leerlos de la BD.

Server Actions Seguras: Toda mutación de datos ocurre en src/lib/actions, validada con Zod.

Tipado Estricto: Usar los tipos generados por Supabase (database.types.ts). Prohibido any.

UI Consistente: Usar componentes de src/components/ui (Shadcn), no crear CSS a mano.

Esta documentación anula cualquier archivo anterior que contradiga estos puntos. Este es nuestro plano de construcción.
