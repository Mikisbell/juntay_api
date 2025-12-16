# ADR-002: Integración WhatsApp vía WAHA (Self-Hosted)

**Status:** Accepted  
**Date:** 2025-11-26 (Actualizado: 2025-12-13)  
**Deciders:** Mikis, Mateo

## Contexto y Problema

Necesitamos enviar notificaciones y códigos de verificación por WhatsApp. La API oficial de WhatsApp Business (Meta) tiene costos por conversación y requiere procesos de verificación de negocio complejos que pueden tardar semanas.

## Drivers de Decisión

* **Costo:** El cliente prefiere evitar costos recurrentes por mensaje.
* **Inmediatez:** Necesitamos la funcionalidad AHORA.
* **Flexibilidad:** Capacidad de usar un número existente sin perder el historial.

## Opciones Consideradas

* **Opción 1: API Oficial de Meta (Cloud API)**
* **Opción 2: WAHA (WhatsApp HTTP API) Self-Hosted**
* **Opción 3:** SaaS de terceros (Twilio, etc.)

## Resultado de la Decisión

Opción elegida: **Opción 2: WAHA (WhatsApp HTTP API) Self-Hosted**.

### Justificación

WAHA nos permite "dockerizar" una sesión de WhatsApp Web. Al alojarlo en un VPS gratuito (Oracle Cloud Free Tier), obtenemos una API REST completa sin costo por mensaje y sin procesos de aprobación de Meta.

### Consecuencias Positivas

* **Costo Cero:** Solo infraestructura (gratis en Oracle Free Tier).
* **Control Total:** No dependemos de aprobaciones de plantillas de Meta.
* **Setup Rápido:** Despliegue en Docker en minutos.

### Consecuencias Negativas

* **Riesgo de Bloqueo:** Si se hace spam, WhatsApp puede bloquear el número. (Mitigado con límites de tasa).
* **Dependencia de Teléfono:** El teléfono físico debe estar encendido (o usar la versión multi-device correctamente).
* **Mantenimiento:** Somos responsables de mantener el servidor VPS.

## Estrategia de Mitigación (Anti-Bloqueo)

* Límite estricto de 100 mensajes/hora implementado en código.
* Delay aleatorio entre mensajes.
* Uso exclusivo para mensajes transaccionales (no marketing masivo agresivo).
