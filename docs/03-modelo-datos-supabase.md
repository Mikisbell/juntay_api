# 🗄️ Modelo de Datos – Supabase (Resumen)

Este documento resume las tablas y conceptos principales del modelo de datos de JUNTAY en Supabase.

Para ver el SQL completo de las migraciones y todos los campos, revisar:
- Carpeta `supabase/migrations/`
- Sección 5 de `Guia_de_trabajo.md` (Modelo de Datos y Supabase)

---

## 1. Principales Entidades

### 1.1 Clientes (`public.clientes`)

Representa a las personas que realizan empeños / créditos.

Campos clave (resumen):

- `id` (UUID, PK)
- `numero_documento` (DNI u otro, único)
- `nombres`, `apellido_paterno`, `apellido_materno`
- `telefono_principal`, `telefono_whatsapp`
- `email`, `email_verificado`, `telefono_verificado`
- Ubicación estructurada: `departamento_id`, `provincia_id`, `distrito_id`, `direccion`
- Variables crediticias: `score_crediticio`, `limite_credito_aprobado`, `historial_pagos`
- Control de documentos: `tiene_dni_copia`, `tiene_recibo_servicios`, `tiene_comprobante_ingresos`, `documentos_completos`

Uso principal:
- Base para el módulo de Clientes.
- Fuente para evaluaciones de crédito y scoring.
- Integración con RENIEC (autocompletar datos).

---

### 1.2 Garantías (`public.garantias`)

Bienes físicos dejados en prenda.

Campos clave (resumen):

- `id` (UUID, PK)
- `cliente_id` (FK → `clientes`)
- `numero_boleta` (único)
- `descripcion`, `categoria`
- Detalle físico: `peso`, `dimensiones`, `material`, `color`
- Ubicación: `ubicacion_estante`
- Tasación: `fecha_tasacion`, `valor_tasacion`, `valor_prestamo_maximo`
- Control legal: `fecha_vencimiento_legal`, `periodo_gracia_dias`
- Flags: `requiere_evaluacion_especial`, `notas_tasador`
- `estado`: `'disponible' | 'en_prenda' | 'liberado' | 'vendido' | 'perdido' | 'evaluacion'`

Uso principal:
- Módulos de Garantías, Créditos, Remates.
- Control de almacén físico y tasaciones.

---

### 1.3 Créditos (`public.creditos`)

Créditos otorgados al cliente con una o varias garantías asociadas.

Campos clave (resumen):

- `id` (UUID, PK)
- `cliente_id` (FK → `clientes`)
- `garantia_id` (FK → `garantias`)
- `numero_contrato` (único)
- `fecha_desembolso`, `fecha_vencimiento_legal`, `dias_gracia`
- `monto_prestado`
- Tasas: `tasa_interes_mensual`, `tasa_interes_anual`
- Seguimiento financiero: `interes_acumulado`, `mora_acumulada`, `fecha_inicio_mora`
- Riesgo: `valor_garantias`, `porcentaje_cobertura`
- Control: `estado`, `notificaciones_enviadas`, `fecha_ultima_notificacion`

Uso principal:
- Módulo de Créditos y Pagos Flexibles.
- Proceso de Vencimientos y Remates.

---

### 1.4 Remates (`public.remates`)

Proceso de venta de garantías no recuperadas.

Campos clave (resumen):

- `id` (UUID, PK)
- `garantia_id` (FK → `garantias`)
- `credito_id` (FK → `creditos`)
- `numero_remate` (único)
- `fecha_inicio_remate`, `fecha_fin_remate`
- `precio_base`, `precio_venta`
- `estado`: `'programado' | 'en_proceso' | 'vendido' | 'no_vendido' | 'cancelado'`
- Datos comprador: `comprador_nombre`, `comprador_documento`, `comprador_telefono`
- `metodo_pago`, `observaciones`

Uso principal:
- Módulo de Remates.
- Reportes de recuperación y pérdida.

---

### 1.5 Notificaciones (`public.notificaciones`)

Registro de notificaciones enviadas o programadas.

Campos clave (resumen):

- `id` (UUID, PK)
- `cliente_id` (FK → `clientes`)
- `credito_id` (FK → `creditos`)
- `tipo`: `'vencimiento' | 'mora' | 'remate' | 'pago_recibido' | 'recordatorio'`
- `canal`: `'whatsapp' | 'sms' | 'email' | 'llamada' | 'presencial'`
- `estado`: `'pendiente' | 'enviado' | 'entregado' | 'fallido'`
- `contenido`
- `fecha_programada`, `fecha_enviado`
- `mensaje_id_externo`, `error_detalle`

Uso principal:
- Módulo de Notificaciones y WhatsApp Business.
- Auditoría de comunicaciones con clientes.

---

### 1.6 Evaluaciones de Crédito (`public.evaluaciones_credito`)

Evaluaciones formales de riesgo crediticio (tabla descrita conceptualmente en la guía).

Campos típicos:

- `id` (UUID, PK)
- `cliente_id` (FK → `clientes`)
- `score_calculado`
- `limite_recomendado`
- `factores_positivos`, `factores_negativos`
- `recomendacion`: `'aprobar' | 'rechazar' | 'aprobar_con_condiciones'`
- `condiciones_especiales`
- `vigente_hasta`
- `evaluado_por`

Uso principal:
- Módulo de Evaluaciones Crediticias.
- Soporte al futuro módulo de IA y scoring.

---

## 2. Funciones y Automatizaciones Clave

### 2.1 Numeración Automática

- `generar_numero_boleta()` → BOL-AAAA-000001
- `generar_numero_contrato()` → CON-AAAA-000001

Objetivo:
- Evitar colisiones de números manuales.
- Mantener secuencias legibles para el negocio.

### 2.2 Cálculo de Mora y Vencimientos

- `calcular_dias_mora(fecha_vencimiento)`
- Campos derivados: `interes_acumulado`, `mora_acumulada`.

Objetivo:
- Automatizar lógica de negocio de vencimientos y mora.

---

## 3. Índices y Constraints Importantes

- Índices frecuentes:
  - `clientes(numero_documento)`, `clientes(telefono_principal)`, `clientes(email)`
  - `garantias(estado)`, `garantias(credito_id)`, `garantias(numero_boleta)`
  - `creditos(estado)`, `creditos(cliente_id)`, `creditos(fecha_vencimiento_legal)`
  - `notificaciones(estado)`, `notificaciones(fecha_programada)`

- Constraints:
  - CHECK en campos `estado` para asegurar valores válidos.
  - UNIQUE en `numero_boleta`, `numero_contrato`, `numero_remate`.
  - FKs entre todas las relaciones (clientes, garantías, créditos, remates, notificaciones).

Para ver la definición exacta de cada índice y constraint, revisar las migraciones SQL en `supabase/migrations/`.
