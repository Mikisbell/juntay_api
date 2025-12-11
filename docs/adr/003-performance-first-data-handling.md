# ADR-003: Principio "Performance First" en Manejo de Datos

**Status:** Accepted
**Date:** 2025-11-27
**Deciders:** Mikis, Mateo

## Contexto y Problema

En aplicaciones web modernas, la latencia de red es el principal enemigo de la experiencia de usuario (UX). Consultar bases de datos para datos estáticos o semi-estáticos (como listas de países, monedas, o UBIGEO) introduce retardos innecesarios, "loading spinners" y dependencia de la conectividad.

El usuario ha establecido explícitamente que la velocidad del sistema es una prioridad absoluta ("siempre haremos lo mejor para mayor velocidad del sistema").

## Drivers de Decisión

* **Velocidad Extrema:** La UI debe responder en < 100ms.
* **Experiencia de Usuario:** Eliminar estados de carga innecesarios.
* **Resiliencia:** El sistema debe funcionar bien incluso con conexiones inestables.
* **Simplicidad:** Reducir la complejidad de queries SQL para datos que no cambian.

## Opciones Consideradas

* **Opción 1: Base de Datos Relacional (Tradicional)**
  * Guardar catálogos en tablas SQL (`ubigeo_distritos`, etc.).
  * Hacer `fetch` en cada interacción o carga de página.
* **Opción 2: Performance First (Hardcoded / Static Generation)**
  * Empaquetar datos estáticos directamente en el bundle de la aplicación (TypeScript/JSON).
  * Carga instantánea, cero latencia de red.

## Resultado de la Decisión

Opción elegida: **Opción 2: Performance First**.

### Justificación

Para datos que cambian con muy poca frecuencia (menos de una vez al año), como la división política del Perú (UBIGEO), tipos de moneda, o configuraciones estáticas, es arquitectónicamente superior incluirlos como constantes en el código (`src/lib/data/`).

Esto garantiza que:

1. Los selectores (dropdowns) abren instantáneamente.
2. No se consume ancho de banda ni conexiones a la BD.
3. La aplicación se siente "nativa" y ultra-rápida.

### Consecuencias

* **Positivas:** UX superior, menor carga en el servidor de base de datos, funcionamiento offline para estas funcionalidades.
* **Negativas:** Aumenta ligeramente el tamaño del bundle inicial (KB). Requiere un despliegue de código para actualizar estos datos (lo cual es aceptable dado que cambian muy raramente).

## Aplicación del Principio

Siempre que nos enfrentemos a la decisión de "¿Base de Datos o Código?", si los datos son:

1. **Estáticos o Semi-estáticos** (cambian < 1 vez/mes).
2. **Públicos/No sensibles**.
3. **De tamaño razonable** (< 1MB comprimido).

**-> Se optará por incluirlos en el código (Client-side o Server-side constants) para maximizar la velocidad.**
