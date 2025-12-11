# ADR-001: Arquitectura Local-First con Supabase

**Status:** Accepted  
**Date:** 2025-11-26  
**Deciders:** Mikis, Mateo

## Contexto y Problema

El desarrollo de software financiero requiere una paridad estricta entre el entorno de desarrollo y producción para evitar errores de "funciona en mi máquina". Además, necesitamos un backend robusto (Auth, DB, Realtime) sin gastar meses construyéndolo desde cero.

## Drivers de Decisión

* **Velocidad de Desarrollo:** Necesitamos iterar rápido.
* **Integridad de Datos:** Requerimos PostgreSQL con tipos estrictos.
* **Paridad Dev/Prod:** El entorno local debe ser idéntico a la nube.
* **Costos:** Minimizar costos de infraestructura inicial.

## Opciones Consideradas

* **Opción 1: Arquitectura Local-First (Supabase + Docker)**
* **Opción 2:** Backend Custom (Node.js + Express + PostgreSQL nativo)
* **Opción 3:** Firebase (NoSQL)

## Resultado de la Decisión

Opción elegida: **Opción 1: Arquitectura Local-First (Supabase + Docker)**.

### Justificación

Supabase nos ofrece un "Backend-as-a-Service" que corre sobre Docker. Esto nos permite tener una instancia completa de la infraestructura (Auth, DB, Storage, Edge Functions) corriendo localmente en la laptop del desarrollador, sin depender de internet y con latencia cero.

### Consecuencias Positivas

* **Velocidad:** Backend listo en segundos con `npx supabase start`.
* **Seguridad:** RLS (Row Level Security) nativo en la base de datos.
* **Tipado:** Generación automática de tipos TypeScript desde el esquema SQL.
* **Offline:** Se puede desarrollar sin internet (ej. en un avión).

### Consecuencias Negativas

* **Dependencia:** Fuerte acoplamiento a la plataforma Supabase.
* **Recursos:** Requiere Docker corriendo localmente (consumo de RAM).

## Notas de Implementación

* Todos los desarrolladores deben usar WSL 2 en Windows para ejecutar Docker de manera eficiente.
* Las migraciones de base de datos son la única forma de modificar el esquema (`supabase migration`).
