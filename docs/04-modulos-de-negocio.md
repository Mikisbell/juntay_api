# 📦 Módulos de Negocio – JUNTAY

Resumen funcional de los principales módulos del sistema JUNTAY.

Para detalles técnicos y requerimientos completos, ver sección 6 y 8 de `Guia_de_trabajo.md`.

---

## 1. Caja

### 1.1 Objetivo

Controlar la apertura, operación y cierre de caja con trazabilidad completa.

### 1.2 Funcionalidades Clave

- Apertura de caja con monto inicial y desglose por denominaciones.
- Registro de movimientos de ingreso y egreso.
- Cierre de caja con comparación físico vs sistema.
- Reporte de cierre con diferencias y observaciones.

---

## 2. Clientes

### 2.1 Objetivo

Centralizar la información de clientes, documentos y comportamiento de pago.

### 2.2 Funcionalidades Clave

- Registro y edición de clientes.
- Control de documentos requeridos (DNI, recibos, comprobantes).
- Historial de pagos y clasificación de riesgo (`historial_pagos`).
- Integración futura con RENIEC para autocompletar datos por DNI.

---

## 3. Garantías

### 3.1 Objetivo

Gestionar las prendas físicas, tasaciones y ubicación en almacén.

### 3.2 Funcionalidades Clave

- Registro de garantías con descripción detallada.
- Tasación con valor máximo de préstamo.
- Ubicación física en almacén (`ubicacion_estante`).
- Sistema de fotos de garantías (mínimo 3, máximo 10).

---

## 4. Créditos y Pagos Flexibles

### 4.1 Objetivo

Gestionar créditos prendarios con estructuras de interés flexibles.

### 4.2 Funcionalidades Clave

- Creación de créditos vinculados a cliente y garantía.
- Cálculo de intereses según frecuencia:
  - Mensual: 20%.
  - Semanal: 5%.
  - Quincenal: 10%.
  - Tri-semanal: 15%.
- Pagos parciales, totales y renovaciones.
- Control de días de gracia y mora.

---

## 5. Vencimientos

### 5.1 Objetivo

Controlar créditos vencidos, periodo de gracia y transición a remate.

### 5.2 Funcionalidades Clave

- Identificación de créditos próximos a vencer.
- Periodo de gracia de 1 semana.
- Cambios de estado: vigente → en gracia → vencido → en remate.
- Integración con notificaciones automáticas.

---

## 6. Remates

### 6.1 Objetivo

Gestionar la venta de garantías no recuperadas mediante remates.

### 6.2 Funcionalidades Clave

- Programar remates para garantías elegibles.
- Gestión de ofertas y precios de venta.
- Registro de comprador y método de pago.
- Historial de remates y reportes.

---

## 7. Notificaciones y WhatsApp Business

### 7.1 Objetivo

Automatizar la comunicación con clientes (recordatorios, confirmaciones, avisos).

### 7.2 Funcionalidades Clave

- Centro de notificaciones unificado.
- Plantillas para WhatsApp, SMS, Email.
- Programación de recordatorios de vencimiento.
- Envío y registro de confirmaciones de pago.
- Integración con YAPE (solicitud y confirmación de pagos).

---

## 8. Evaluaciones Crediticias

### 8.1 Objetivo

Evaluar el riesgo crediticio del cliente y sugerir límites.

### 8.2 Funcionalidades Clave

- Registro de evaluaciones con score y recomendaciones.
- Factores positivos y negativos documentados.
- Condiciones especiales y vigencia de la evaluación.

---

## 9. Reportes

### 9.1 Objetivo

Proveer información clara para operación, gerencia y cumplimiento.

### 9.2 Funcionalidades Clave

- Reportes de caja.
- Reportes de cartera y morosidad.
- Reportes de inventario de garantías.
- Reportes para SUNAT (comprobantes, libro de operaciones).

Estos módulos se conectan entre sí a través del modelo de datos documentado en `03-modelo-datos-supabase.md`.
