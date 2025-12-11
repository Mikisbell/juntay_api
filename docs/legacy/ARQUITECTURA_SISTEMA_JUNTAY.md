
🏛️ ARQUITECTURA DEL SISTEMA JUNTAY

Documento de Diseño Técnico de Alto Nivel

Versión: 3.0 (Final - Post Definición de Reglas)
Enfoque: Core Bancario / Trazabilidad Total / Configurable
Autor: Mikis (Arquitecto Líder)

1. VISIÓN ARQUITECTÓNICA

El sistema JUNTAY no es un simple CRUD. Es un Sistema Transaccional de Libro Mayor (Ledger) con un Motor de Reglas Configurables.

Principios Fundamentales

Inmutabilidad Financiera: Los movimientos de dinero son Append-Only. Nunca se editan. Si hay un error, se crea un contra-movimiento.

Jerarquía de Custodia: El dinero siempre tiene un "dueño": Bóveda -> Gerente -> Cajero -> Cliente.

Configuración Dinámica: Las reglas de negocio (límites, permisos) no están en el código ("hardcoded"), sino en la base de datos, permitiendo ajustes en tiempo real sin reprogramar.

2. DIAGRAMA DE COMPONENTES

Arquitectura Server-Side Rendering (SSR) robusta.

graph TD
    subgraph "CLIENTE"
        UI[Interfaz Next.js]
    end

    subgraph "SERVIDOR (Next.js)"
        Middleware[🛡️ Auth Middleware]
        ConfigLoader[⚙️ Config Loader]
        ServerActions[⚡ Server Actions]
    end

    subgraph "DATOS (Supabase)"
        CoreDB[(💰 Tablas Financieras)]
        SettingsDB[(⚙️ System Settings)]
        AuditDB[(📝 Auditoría)]
        RLS[🛡️ Políticas de Seguridad]
    end

    UI -->|Acción| ServerActions
    ServerActions -->|1. Leer Reglas| ConfigLoader
    ConfigLoader -->|Query| SettingsDB
    ServerActions -->|2. Validar & Ejecutar| RLS
    RLS -->|Persistir| CoreDB
    RLS -->|Log| AuditDB


3. MODELO DE DATOS (SCHEMA DESIGN)

El corazón del sistema actualizado.

3.1 Módulo de Tesorería (El Dinero)

boveda_central (Singleton)

Capital total (Efectivo + Bancos).

Campos: saldo_disponible, saldo_asignado.

cajas_operativas (Sesiones)

Ventanilla temporal del cajero.

Ciclo: Abierta -> Operando -> Cerrada.

movimientos_caja_operativa (Ledger)

Registro contable atómico.

Tipos: APERTURA, PRESTAMO, COBRO, GASTO, CIERRE.

3.2 Estructura de Fondeo y Auditoría

movimientos_boveda_auditoria

Registra inyecciones de capital.

Metadata JSONB: Campo vital para trazabilidad externa.

Ejemplo: { "origen": "Socio A", "canal": "BCP", "operacion": "12345", "foto_voucher": "url..." }

3.3 Motor de Reglas y Seguridad (NUEVO)

system_settings (Singleton)

Tabla de configuración global editable por Admin.

Reglas: yape_limite_diario, exigir_evidencia_yape, permitir_cierre_ciego, etc.

profiles (Roles)

Extensión de usuarios. Roles: admin, gerente, cajero.

3.4 Módulo de Negocio (El Activo)

clientes: Datos KYC y Scoring.

garantias: Bienes físicos + Tasación + Fotos.

creditos: Contratos vinculados (Caja + Cliente + Garantía).

4. MÁQUINA DE ESTADOS FINANCIEROS

4.1 Ciclo de Vida del Efectivo

stateDiagram-v2
    [*] --> Boveda: Inyección (Socio/Banco)
    Boveda --> CajaOperativa: Asignación
    
    state CajaOperativa {
        [*] --> SaldoInicial
        SaldoInicial --> Prestamo: Salida
        Prestamo --> Cliente
        Cliente --> Cobro: Entrada
        Cobro --> SaldoFinal
    }
    
    CajaOperativa --> Boveda: Cierre y Conciliación


4.2 Flujo de Validación de Reglas

Antes de cualquier movimiento, el sistema consulta:

¿Quién eres? (Auth + Profiles)

¿Qué está permitido hoy? (System Settings)

¿Hay saldo? (Validación Financiera)

5. ESTRATEGIA DE SEGURIDAD

Nivel Base de Datos (RLS):

Nadie ve datos que no le corresponden.

Admin ve todo.

Settings solo editable por Admin.

Nivel Aplicación:

Server Actions: Único punto de entrada para mutaciones.

Validación Zod: Sanitización de entradas.

Check de Reglas: if (!settings.allow_yape) throw Error.

Auditoría Forense:

Cada billete digital tiene un rastro JSONB.

6. GUÍA DE IMPLEMENTACIÓN RÁPIDA

Consultar Reglas: Antes de programar una restricción, revisa si existe en system_settings.

Trazabilidad: Si entra dinero de afuera, OBLIGATORIO llenar metadata.

Tipado: Usar interfaces estrictas en src/lib/types.