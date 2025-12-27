# Database Schema Report

## Table: alert_rules
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| active | boolean | YES | true |
| nombre | character varying | NO |  |
| descripcion | text | YES |  |
| metrica | character varying | NO |  |
| operador | character varying | NO |  |
| valor_umbral | numeric | NO |  |
| severidad | character varying | YES | 'warning'::character varying |
| titulo_template | character varying | NO |  |
| mensaje_template | text | NO |  |
| notificar_email | boolean | YES | true |
| notificar_dashboard | boolean | YES | true |
| cooldown_minutes | integer | YES | 60 |

## Table: alertas_sistema
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| empresa_id | uuid | YES |  |
| sucursal_id | uuid | YES |  |
| tipo | character varying | NO |  |
| severidad | character varying | YES | 'warning'::character varying |
| titulo | character varying | NO |  |
| mensaje | text | NO |  |
| estado | character varying | YES | 'activa'::character varying |
| visto_por | uuid | YES |  |
| visto_at | timestamp with time zone | YES |  |
| resuelto_por | uuid | YES |  |
| resuelto_at | timestamp with time zone | YES |  |
| notas_resolucion | text | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| accion_requerida | boolean | YES | false |
| accion_url | character varying | YES |  |
| auto_resolve_at | timestamp with time zone | YES |  |
| expires_at | timestamp with time zone | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`
- `sucursal_id` -> `sucursales.id`

## Table: audit_log
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| tabla | text | NO |  |
| registro_id | uuid | NO |  |
| accion | text | NO |  |
| usuario_id | uuid | YES |  |
| datos_anteriores | jsonb | YES |  |
| datos_nuevos | jsonb | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |

## Table: audit_logs
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| timestamp | timestamp with time zone | YES | now() |
| user_id | uuid | YES |  |
| user_email | character varying | YES |  |
| user_role | character varying | YES |  |
| empresa_id | uuid | YES |  |
| action | character varying | NO |  |
| entity_type | character varying | NO |  |
| entity_id | uuid | YES |  |
| old_values | jsonb | YES |  |
| new_values | jsonb | YES |  |
| metadata | jsonb | YES |  |
| ip_address | inet | YES |  |
| user_agent | text | YES |  |
| session_id | character varying | YES |  |
| category | character varying | YES | 'general'::character varying |
| severity | character varying | YES | 'info'::character varying |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`

## Table: auditoria_transacciones
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| tabla_afectada | character varying | NO |  |
| registro_id | uuid | NO |  |
| accion | character varying | NO |  |
| usuario_id | uuid | YES |  |
| empleado_id | uuid | YES |  |
| datos_antes | jsonb | YES |  |
| datos_despues | jsonb | YES |  |
| ip_address | inet | YES |  |
| user_agent | text | YES |  |
| timestamp | timestamp with time zone | NO | now() |

**Foreign Keys**:
- `empleado_id` -> `empleados.id`

## Table: cajas_operativas
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| usuario_id | uuid | NO |  |
| boveda_origen_id | uuid | YES |  |
| numero_caja | integer | NO |  |
| estado | character varying | NO | 'cerrada'::character varying |
| saldo_inicial | numeric | YES | 0 |
| saldo_actual | numeric | YES | 0 |
| saldo_final_cierre | numeric | YES |  |
| diferencia_cierre | numeric | YES |  |
| fecha_apertura | timestamp with time zone | YES | now() |
| fecha_cierre | timestamp with time zone | YES |  |
| observaciones_cierre | text | YES |  |
| _deleted | boolean | NO | false |
| _modified | timestamp with time zone | NO | now() |
| empresa_id | uuid | YES |  |

## Table: capacitaciones_cumplimiento
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| empresa_id | uuid | NO |  |
| usuario_id | uuid | NO |  |
| tipo | character varying | NO |  |
| tema | character varying | NO |  |
| descripcion | text | YES |  |
| fecha | date | NO |  |
| horas | numeric | NO |  |
| completado | boolean | YES | false |
| puntaje | integer | YES |  |
| certificado_url | text | YES |  |
| proveedor | character varying | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`

## Table: categoria_sugerida
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | integer | NO | nextval('categoria_sugerida_id_seq'::regclass) |
| tipo | character varying | NO |  |
| texto_ingresado | character varying | NO |  |
| texto_normalizado | character varying | NO |  |
| veces_usado | integer | YES | 1 |
| ultimo_uso | timestamp with time zone | YES | now() |
| promovido_a | character varying | YES | NULL::character varying |
| promovido_en | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | YES | now() |

## Table: categorias_garantia
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| nombre | character varying | NO |  |
| porcentaje_prestamo_maximo | numeric | YES | 60.00 |

## Table: clientes
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| empresa_id | uuid | YES |  |
| tipo_documento | character varying | NO |  |
| numero_documento | character varying | NO |  |
| nombres | character varying | YES |  |
| apellido_paterno | character varying | YES |  |
| apellido_materno | character varying | YES |  |
| email | character varying | YES |  |
| telefono_principal | character varying | YES |  |
| direccion | text | YES |  |
| score_crediticio | integer | YES | 500 |
| activo | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| persona_id | uuid | YES |  |
| ubigeo_cod | character varying | YES |  |
| departamento | character varying | YES |  |
| provincia | character varying | YES |  |
| distrito | character varying | YES |  |
| _deleted | boolean | NO | false |
| _modified | timestamp with time zone | NO | now() |
| telefono_secundario | character varying | YES |  |
| parentesco_referencia | character varying | YES |  |
| tipo_parentesco_id | integer | YES |  |
| parentesco_otro | character varying | YES |  |
| party_id | uuid | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`
- `party_id` -> `parties.id`
- `persona_id` -> `personas.id`

## Table: contratos_fondeo
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| inversionista_id | uuid | NO |  |
| tipo | USER-DEFINED | NO |  |
| monto_pactado | numeric | NO |  |
| tasa_retorno | numeric | NO |  |
| fecha_inicio | date | NO | CURRENT_DATE |
| fecha_vencimiento | date | YES |  |
| frecuencia_pago | USER-DEFINED | YES | 'MENSUAL'::frecuencia_pago_fondeo |
| estado | USER-DEFINED | YES | 'ACTIVO'::estado_contrato_fondeo |
| monto_capital_devuelto | numeric | YES | 0 |
| monto_rendimientos_pagados | numeric | YES | 0 |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| created_by | uuid | YES |  |
| empresa_id | uuid | YES |  |
| interes_devengado | numeric | YES | 0 |
| ultimo_calculo_rendimiento | date | YES |  |
| proximo_pago_programado | date | YES |  |
| dias_transcurridos | integer | YES | 0 |
| tipo_interes | character varying | YES | 'SIMPLE'::character varying |
| frecuencia_capitalizacion | character varying | YES |  |
| interes_capitalizado | numeric | YES | 0 |
| hurdle_rate | numeric | YES | 8.00 |
| hurdle_acumulado | numeric | YES | 0 |
| carried_interest_rate | numeric | YES | 20.00 |
| tir_actual | numeric | YES |  |
| tasa_penalidad_empresa | numeric | YES | 0.50 |
| dias_gracia_empresa | integer | YES | 5 |
| penalidad_acumulada | numeric | YES | 0 |
| permite_reinversion | boolean | YES | false |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`
- `inversionista_id` -> `inversionistas.id`

## Table: creditos
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| codigo | character varying | YES |  |
| cliente_id | uuid | NO |  |
| caja_origen_id | uuid | YES |  |
| empresa_id | uuid | YES |  |
| monto_prestado | numeric | NO |  |
| tasa_interes | numeric | NO |  |
| periodo_dias | integer | NO |  |
| fecha_desembolso | timestamp without time zone | YES | now() |
| fecha_vencimiento | date | NO |  |
| saldo_pendiente | numeric | NO |  |
| interes_acumulado | numeric | YES | 0 |
| estado | character varying | YES | 'vigente'::character varying |
| created_at | timestamp without time zone | YES | now() |
| updated_at | timestamp without time zone | YES | now() |
| estado_detallado | character varying | NO |  |
| dias_transcurridos | integer | YES |  |
| interes_devengado_actual | numeric | YES | 0 |
| codigo_credito | character varying | YES |  |
| fecha_inicio | date | YES |  |
| observaciones | text | YES |  |
| created_by | uuid | YES |  |
| _deleted | boolean | NO | false |
| _modified | timestamp with time zone | NO | now() |
| fecha_cancelacion | timestamp with time zone | YES |  |
| sucursal_id | uuid | YES |  |
| interes_mora_acumulado | numeric | YES | 0 |
| dias_en_mora | integer | YES | 0 |
| dias_en_gracia_usados | integer | YES | 0 |
| fecha_ultimo_recalculo | date | YES |  |
| interes_capitalizado | numeric | YES | 0 |

**Foreign Keys**:
- `cliente_id` -> `clientes.id`
- `empresa_id` -> `empresas.id`
- `sucursal_id` -> `sucursales.id`

## Table: cronograma_pagos_fondeo
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| contrato_id | uuid | NO |  |
| numero_cuota | integer | NO |  |
| tipo_pago | character varying | NO | 'INTERES'::character varying |
| fecha_programada | date | NO |  |
| fecha_pago_real | date | YES |  |
| monto_capital | numeric | YES | 0 |
| monto_interes | numeric | NO |  |
| monto_total | numeric | NO |  |
| monto_pagado | numeric | YES |  |
| estado | character varying | YES | 'PENDIENTE'::character varying |
| referencia_transaccion | uuid | YES |  |
| notas | text | YES |  |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| empresa_id | uuid | YES |  |

**Foreign Keys**:
- `contrato_id` -> `contratos_fondeo.id`
- `empresa_id` -> `empresas.id`

## Table: cuentas_financieras
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| nombre | character varying | NO |  |
| tipo | USER-DEFINED | NO |  |
| saldo | numeric | NO | 0.00 |
| moneda | character varying | NO | 'PEN'::character varying |
| activo | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| banco_asociado | USER-DEFINED | YES |  |
| numero_cuenta | character varying | YES |  |
| titular_cuenta | character varying | YES |  |
| es_principal | boolean | YES | false |
| empresa_id | uuid | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`

## Table: departamentos
| Column | Type | Nullable | Default |
|---|---|---|---|
| codigo | character varying | NO |  |
| nombre | character varying | NO |  |
| activo | boolean | NO | true |

## Table: distritos
| Column | Type | Nullable | Default |
|---|---|---|---|
| ubigeo_inei | character varying | NO |  |
| nombre | character varying | NO |  |
| provincia_codigo | character varying | NO |  |
| activo | boolean | NO | true |

**Foreign Keys**:
- `provincia_codigo` -> `provincias.codigo`

## Table: empleados
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| persona_id | uuid | NO |  |
| user_id | uuid | YES |  |
| cargo | character varying | NO |  |
| sucursal_id | uuid | YES |  |
| activo | boolean | YES | true |
| fecha_ingreso | date | YES | CURRENT_DATE |
| fecha_salida | date | YES |  |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| nombre_contacto_emergencia | character varying | YES |  |
| parentesco_emergencia | character varying | YES |  |
| telefono_emergencia | character varying | YES |  |
| estado | character varying | YES | 'ACTIVO'::character varying |
| motivo_estado | text | YES |  |
| party_id | uuid | YES |  |

**Foreign Keys**:
- `party_id` -> `parties.id`
- `persona_id` -> `personas.id`

## Table: empresas
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| ruc | character varying | NO |  |
| razon_social | character varying | NO |  |
| nombre_comercial | character varying | YES |  |
| direccion | text | YES |  |
| telefono | character varying | YES |  |
| email | character varying | YES |  |
| logo_url | text | YES |  |
| activo | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| tasa_interes_default | numeric | YES | 20.00 |
| config_intereses | jsonb | YES | '{"base_dias": 30, "dias_gracia": 3, "tipo_calculo": "simple", "tasa_mora_diaria": 0.5, "interes_minimo_dias": 1, "capitalizacion_mensual": false}'::jsonb |
| plan_id | uuid | YES |  |

**Foreign Keys**:
- `plan_id` -> `planes_suscripcion.id`

## Table: eventos_sistema
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | bigint | NO | nextval('eventos_sistema_id_seq'::regclass) |
| agregado_tipo | character varying | NO |  |
| agregado_id | uuid | NO |  |
| evento_tipo | character varying | NO |  |
| payload | jsonb | NO | '{}'::jsonb |
| version | integer | NO | 1 |
| usuario_id | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

## Table: facturas
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| numero | character varying | NO |  |
| empresa_id | uuid | NO |  |
| suscripcion_id | uuid | YES |  |
| subtotal | numeric | NO |  |
| igv | numeric | YES | 0 |
| total | numeric | NO |  |
| moneda | character varying | YES | 'PEN'::character varying |
| estado | character varying | YES | 'pending'::character varying |
| fecha_emision | timestamp with time zone | YES | now() |
| fecha_vencimiento | date | YES |  |
| fecha_pago | timestamp with time zone | YES |  |
| stripe_invoice_id | character varying | YES |  |
| stripe_payment_intent_id | character varying | YES |  |
| pdf_url | text | YES |  |
| concepto | character varying | YES | 'Suscripción mensual'::character varying |
| notas | text | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`
- `suscripcion_id` -> `suscripciones.id`

## Table: facturas_saas
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| numero | character varying | NO |  |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| empresa_id | uuid | NO |  |
| periodo_inicio | date | NO |  |
| periodo_fin | date | NO |  |
| plan_id | uuid | YES |  |
| plan_nombre | character varying | YES |  |
| subtotal | numeric | NO |  |
| descuento | numeric | YES | 0 |
| impuestos | numeric | YES | 0 |
| total | numeric | NO |  |
| moneda | character varying | YES | 'USD'::character varying |
| estado | character varying | YES | 'pendiente'::character varying |
| fecha_emision | date | YES | CURRENT_DATE |
| fecha_vencimiento | date | NO |  |
| fecha_pago | timestamp with time zone | YES |  |
| metodo_pago | character varying | YES |  |
| referencia_pago | character varying | YES |  |
| comprobante_url | text | YES |  |
| items | jsonb | NO | '[]'::jsonb |
| notas | text | YES |  |
| notas_internas | text | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`
- `plan_id` -> `planes_suscripcion.id`

## Table: fotos_garantia
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| garantia_id | uuid | NO |  |
| url | text | NO |  |
| descripcion | text | YES |  |
| tipo | character varying | YES | 'foto'::character varying |
| es_principal | boolean | YES | false |
| uploaded_by | uuid | YES |  |
| created_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `garantia_id` -> `garantias.id`
- `uploaded_by` -> `usuarios.id`

## Table: garantias
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| cliente_id | uuid | YES |  |
| categoria_id | uuid | YES |  |
| descripcion | text | NO |  |
| valor_tasacion | numeric | NO |  |
| valor_prestamo_sugerido | numeric | YES |  |
| estado | character varying | YES | 'custodia'::character varying |
| fotos_urls | ARRAY | YES |  |
| created_at | timestamp without time zone | YES | now() |
| marca | character varying | YES |  |
| modelo | character varying | YES |  |
| serie | character varying | YES |  |
| subcategoria | character varying | YES |  |
| estado_bien | character varying | YES |  |
| anio | integer | YES |  |
| placa | character varying | YES |  |
| kilometraje | numeric | YES |  |
| area | numeric | YES |  |
| ubicacion | text | YES |  |
| partida_registral | character varying | YES |  |
| peso | numeric | YES |  |
| quilataje | character varying | YES |  |
| capacidad | character varying | YES |  |
| fecha_venta | timestamp with time zone | YES |  |
| precio_venta | numeric | YES |  |
| credito_id | uuid | YES |  |
| fotos | ARRAY | YES |  |
| updated_at | timestamp with time zone | YES | now() |
| _deleted | boolean | NO | false |
| _modified | timestamp with time zone | NO | now() |
| para_remate | boolean | YES | false |
| valor_tasado | numeric | YES |  |
| empresa_id | uuid | YES |  |

**Foreign Keys**:
- `categoria_id` -> `categorias_garantia.id`
- `cliente_id` -> `clientes.id`
- `credito_id` -> `creditos.id`
- `empresa_id` -> `empresas.id`

## Table: historial_calculo_intereses
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| credito_id | uuid | NO |  |
| fecha_calculo | date | NO | CURRENT_DATE |
| monto_base | numeric | NO |  |
| tasa_aplicada | numeric | NO |  |
| dias_regulares | integer | NO | 0 |
| dias_gracia | integer | NO | 0 |
| dias_mora | integer | NO | 0 |
| interes_regular | numeric | NO | 0 |
| interes_mora | numeric | NO | 0 |
| interes_total | numeric | NO | 0 |
| config_usada | jsonb | NO |  |
| tipo_evento | character varying | YES | 'RECALCULO_DIARIO'::character varying |
| created_at | timestamp with time zone | NO | now() |
| empresa_id | uuid | YES |  |

**Foreign Keys**:
- `credito_id` -> `creditos.id`
- `empresa_id` -> `empresas.id`

## Table: inversionistas
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| persona_id | uuid | NO |  |
| tipo_relacion | USER-DEFINED | NO |  |
| participacion_porcentaje | numeric | YES | 0 |
| fecha_ingreso | date | YES | CURRENT_DATE |
| activo | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| metadata | jsonb | YES | '{}'::jsonb |
| empresa_id | uuid | YES |  |
| party_id | uuid | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`
- `party_id` -> `parties.id`
- `persona_id` -> `personas.id`

## Table: leads
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| nombre | text | NO |  |
| telefono | text | NO |  |
| mensaje | text | YES |  |
| monto_interes | numeric | YES |  |
| articulo_interes | text | YES |  |
| estado | text | YES | 'NUEVO'::text |
| empresa_id | uuid | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`

## Table: metricas_uso_tenant
| Column | Type | Nullable | Default |
|---|---|---|---|
| empresa_id | uuid | NO |  |
| nombre_empresa | text | YES |  |
| usuarios_activos | integer | YES | 0 |
| sucursales_activas | integer | YES | 0 |
| creditos_historicos | integer | YES | 0 |
| creditos_vigentes | integer | YES | 0 |
| monto_cartera_vigente | numeric | YES | 0 |
| last_updated | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`

## Table: movimientos_caja_operativa
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| caja_operativa_id | uuid | NO |  |
| tipo | character varying | NO |  |
| motivo | character varying | NO |  |
| monto | numeric | NO |  |
| saldo_anterior | numeric | NO |  |
| saldo_nuevo | numeric | NO |  |
| referencia_id | uuid | YES |  |
| descripcion | text | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| usuario_id | uuid | NO |  |
| fecha | timestamp with time zone | YES | now() |
| caja_id | uuid | YES |  |
| anulado | boolean | YES | false |
| motivo_anulacion | text | YES |  |
| anulado_por | uuid | YES |  |
| anulado_at | timestamp with time zone | YES |  |
| movimiento_reversion_id | uuid | YES |  |
| es_reversion | boolean | YES | false |
| movimiento_original_id | uuid | YES |  |
| _deleted | boolean | NO | false |
| _modified | timestamp with time zone | NO | now() |

**Foreign Keys**:
- `caja_operativa_id` -> `cajas_operativas.id`

## Table: notificaciones_enviadas
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| credito_id | uuid | NO |  |
| cliente_id | uuid | NO |  |
| tipo_notificacion | character varying | NO |  |
| mensaje_enviado | text | NO |  |
| telefono_destino | character varying | NO |  |
| enviado_por | uuid | YES |  |
| fecha_envio | timestamp with time zone | YES | now() |
| estado | character varying | YES | 'enviado'::character varying |
| medio | character varying | YES | 'whatsapp'::character varying |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `cliente_id` -> `clientes.id`
- `credito_id` -> `creditos.id`

## Table: notificaciones_pendientes
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| cliente_id | uuid | YES |  |
| credito_id | uuid | YES |  |
| tipo | text | NO |  |
| titulo | text | NO |  |
| mensaje | text | NO |  |
| monto | numeric | YES |  |
| telefono | text | YES |  |
| email | text | YES |  |
| estado | text | YES | 'pendiente'::text |
| fecha_envio | timestamp with time zone | YES |  |
| fecha_procesado | timestamp with time zone | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `cliente_id` -> `clientes.id`
- `credito_id` -> `creditos.id`

## Table: oficiales_cumplimiento
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| empresa_id | uuid | NO |  |
| nombres | character varying | NO |  |
| apellidos | character varying | NO |  |
| dni | character varying | NO |  |
| email | character varying | NO |  |
| telefono | character varying | YES |  |
| fecha_designacion | date | NO |  |
| numero_resolucion | character varying | YES |  |
| registrado_uif | boolean | YES | false |
| fecha_registro_uif | date | YES |  |
| ultima_capacitacion | date | YES |  |
| horas_capacitacion | integer | YES | 0 |
| activo | boolean | YES | true |
| fecha_baja | date | YES |  |
| motivo_baja | text | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`

## Table: pagos
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| credito_id | uuid | YES |  |
| caja_operativa_id | uuid | YES |  |
| monto_total | numeric | NO |  |
| desglose_capital | numeric | YES |  |
| desglose_interes | numeric | YES |  |
| desglose_mora | numeric | YES |  |
| medio_pago | character varying | YES |  |
| metadata | jsonb | YES |  |
| fecha_pago | timestamp without time zone | YES | now() |
| tipo | character varying | YES | 'PAGO'::character varying |
| metodo_pago | character varying | YES |  |
| observaciones | text | YES |  |
| usuario_id | uuid | YES |  |
| created_at | timestamp with time zone | YES | now() |
| anulado | boolean | YES | false |
| motivo_anulacion | text | YES |  |
| anulado_por | uuid | YES |  |
| anulado_at | timestamp with time zone | YES |  |
| _deleted | boolean | NO | false |
| _modified | timestamp with time zone | NO | now() |
| sucursal_id | uuid | YES |  |
| transaccion_bancaria_id | uuid | YES |  |
| empresa_id | uuid | YES |  |

**Foreign Keys**:
- `credito_id` -> `creditos.id`
- `empresa_id` -> `empresas.id`
- `sucursal_id` -> `sucursales.id`
- `transaccion_bancaria_id` -> `transacciones_bancarias.id`

## Table: pagos_rendimientos
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| contrato_id | uuid | NO |  |
| cuota_id | uuid | YES |  |
| tipo_pago | character varying | NO |  |
| monto_capital | numeric | YES | 0 |
| monto_interes | numeric | NO |  |
| monto_penalidad | numeric | YES | 0 |
| monto_total | numeric | NO |  |
| fecha_programada | date | YES |  |
| fecha_pago | date | NO |  |
| dias_atraso | integer | YES | 0 |
| medio_pago | character varying | YES |  |
| cuenta_destino_id | uuid | YES |  |
| referencia_transaccion | text | YES |  |
| notas | text | YES |  |
| created_by | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |
| empresa_id | uuid | YES |  |

**Foreign Keys**:
- `contrato_id` -> `contratos_fondeo.id`
- `cuota_id` -> `cronograma_pagos_fondeo.id`
- `empresa_id` -> `empresas.id`

## Table: parties
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| party_type | character varying | NO |  |
| tax_id_type | character varying | NO |  |
| tax_id | character varying | NO |  |
| email | character varying | YES |  |
| telefono_principal | character varying | YES |  |
| telefono_secundario | character varying | YES |  |
| direccion | text | YES |  |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| _modified | timestamp with time zone | YES | now() |
| _deleted | boolean | YES | false |

## Table: personas
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| tipo_documento | character varying | NO | 'DNI'::character varying |
| numero_documento | character varying | NO |  |
| nombres | character varying | NO |  |
| apellido_paterno | character varying | NO |  |
| apellido_materno | character varying | NO |  |
| email | character varying | YES |  |
| telefono_principal | character varying | YES |  |
| telefono_secundario | character varying | YES |  |
| direccion | text | YES |  |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| parentesco_referencia | character varying | YES |  |

## Table: personas_juridicas
| Column | Type | Nullable | Default |
|---|---|---|---|
| party_id | uuid | NO |  |
| razon_social | character varying | NO |  |
| nombre_comercial | character varying | YES |  |
| representante_legal_id | uuid | YES |  |
| fecha_constitucion | date | YES |  |
| tipo_sociedad | character varying | YES |  |

**Foreign Keys**:
- `party_id` -> `parties.id`
- `representante_legal_id` -> `parties.id`

## Table: personas_naturales
| Column | Type | Nullable | Default |
|---|---|---|---|
| party_id | uuid | NO |  |
| nombres | character varying | NO |  |
| apellido_paterno | character varying | NO |  |
| apellido_materno | character varying | YES |  |
| fecha_nacimiento | date | YES |  |
| sexo | character varying | YES |  |

**Foreign Keys**:
- `party_id` -> `parties.id`

## Table: planes_suscripcion
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| nombre | character varying | NO |  |
| nombre_display | character varying | NO |  |
| descripcion | text | YES |  |
| precio_mensual | numeric | NO |  |
| precio_anual | numeric | YES |  |
| moneda | character varying | YES | 'PEN'::character varying |
| max_usuarios | integer | YES | 3 |
| max_sucursales | integer | YES | 1 |
| max_creditos_mes | integer | YES | 100 |
| max_creditos_activos | integer | YES | 50 |
| features | jsonb | YES | '[]'::jsonb |
| orden | integer | YES | 0 |
| activo | boolean | YES | true |
| destacado | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## Table: provincias
| Column | Type | Nullable | Default |
|---|---|---|---|
| codigo | character varying | NO |  |
| nombre | character varying | NO |  |
| departamento_codigo | character varying | NO |  |
| activo | boolean | NO | true |

**Foreign Keys**:
- `departamento_codigo` -> `departamentos.codigo`

## Table: reportes_operacion_sospechosa
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| empresa_id | uuid | NO |  |
| sucursal_id | uuid | YES |  |
| numero_reporte | character varying | NO |  |
| fecha_deteccion | date | NO |  |
| fecha_reporte | date | YES |  |
| cliente_id | uuid | YES |  |
| cliente_nombre | character varying | NO |  |
| cliente_dni | character varying | YES |  |
| tipo_operacion | character varying | NO |  |
| monto | numeric | NO |  |
| moneda | character varying | YES | 'PEN'::character varying |
| descripcion_operacion | text | NO |  |
| motivo_sospecha | text | NO |  |
| indicadores_alerta | ARRAY | YES |  |
| estado | character varying | YES | 'borrador'::character varying |
| enviado_uif_at | timestamp with time zone | YES |  |
| confirmacion_uif | character varying | YES |  |
| detectado_por | uuid | NO |  |
| revisado_por | uuid | YES |  |
| notas_internas | text | YES |  |
| documentos_adjuntos | jsonb | YES | '[]'::jsonb |

**Foreign Keys**:
- `cliente_id` -> `clientes.id`
- `empresa_id` -> `empresas.id`
- `sucursal_id` -> `sucursales.id`

## Table: reportes_regulatorios
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| empresa_id | uuid | NO |  |
| tipo_reporte | character varying | NO |  |
| periodo_inicio | date | NO |  |
| periodo_fin | date | NO |  |
| estado | character varying | YES | 'generado'::character varying |
| fecha_envio | timestamp with time zone | YES |  |
| confirmacion | character varying | YES |  |
| datos | jsonb | NO |  |
| archivo_url | text | YES |  |
| motivo_rechazo | text | YES |  |
| fecha_correccion | timestamp with time zone | YES |  |
| generado_por | uuid | NO |  |
| enviado_por | uuid | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`

## Table: roles
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| nombre | character varying | NO |  |
| descripcion | text | YES |  |
| nivel_acceso | integer | YES | 1 |
| activo | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

## Table: sucursales
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| codigo | character varying | NO |  |
| nombre | character varying | NO |  |
| direccion | text | YES |  |
| telefono | character varying | YES |  |
| activa | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| empresa_id | uuid | YES |  |
| es_principal | boolean | YES | false |
| ubigeo_cod | character varying | YES |  |
| departamento | character varying | YES |  |
| provincia | character varying | YES |  |
| distrito | character varying | YES |  |
| tipo_sucursal | character varying | YES | 'secundaria'::character varying |
| referencia | text | YES |  |
| horario_apertura | time without time zone | YES | '09:00:00'::time without time zone |
| horario_cierre | time without time zone | YES | '19:00:00'::time without time zone |
| dias_operacion | ARRAY | YES | ARRAY['L'::text, 'M'::text, 'X'::text, 'J'::text, 'V'::text, 'S'::text] |
| administrador_id | uuid | YES |  |
| auto_crear_caja | boolean | YES | true |
| email | character varying | YES |  |
| telefono_secundario | character varying | YES |  |

**Foreign Keys**:
- `administrador_id` -> `empleados.id`
- `empresa_id` -> `empresas.id`

## Table: sugerencias_catalogos
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| tipo | character varying | NO |  |
| categoria_padre | character varying | YES |  |
| valor_sugerido | character varying | NO |  |
| usuario_id | uuid | YES |  |
| estado | character varying | YES | 'pendiente'::character varying |
| created_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `usuario_id` -> `usuarios.id`

## Table: suscripciones
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| empresa_id | uuid | NO |  |
| plan_id | uuid | NO |  |
| estado | character varying | YES | 'trial'::character varying |
| fecha_inicio | date | NO | CURRENT_DATE |
| fecha_fin | date | YES |  |
| fecha_proximo_cobro | date | YES |  |
| dias_trial | integer | YES | 14 |
| stripe_subscription_id | character varying | YES |  |
| stripe_customer_id | character varying | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`
- `plan_id` -> `planes_suscripcion.id`

## Table: system_health_metrics
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| timestamp | timestamp with time zone | YES | now() |
| status | character varying | YES | 'healthy'::character varying |
| api_latency_avg | numeric | YES |  |
| api_latency_p95 | numeric | YES |  |
| api_latency_p99 | numeric | YES |  |
| db_latency_avg | numeric | YES |  |
| requests_total | integer | YES | 0 |
| requests_success | integer | YES | 0 |
| requests_error | integer | YES | 0 |
| active_users | integer | YES | 0 |
| db_connections_active | integer | YES |  |
| db_connections_idle | integer | YES |  |
| db_size_bytes | bigint | YES |  |
| storage_used_bytes | bigint | YES |  |
| storage_limit_bytes | bigint | YES |  |
| tenant_metrics | jsonb | YES | '{}'::jsonb |
| error_breakdown | jsonb | YES | '{}'::jsonb |

## Table: system_settings
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| yape_limite_diario | numeric | YES | 500.00 |
| yape_exigir_evidencia | boolean | YES | true |
| yape_destino_personal_permitido | boolean | YES | false |
| tesoreria_separar_cuentas_socios | boolean | YES | true |
| tesoreria_retiro_desde_caja | boolean | YES | false |
| credito_renovacion_genera_nuevo_contrato | boolean | YES | false |
| credito_calculo_interes_anticipado | text | YES | 'PERIODO_COMPLETO'::text |
| credito_liberacion_garantia_parcial | boolean | YES | false |
| credito_interes_moratorio_diario | numeric | YES | 0.5 |
| remate_precio_base_automatico | boolean | YES | true |
| remate_devolver_excedente | boolean | YES | true |
| caja_permiso_anular_recibo | boolean | YES | false |
| caja_cierre_ciego | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| updated_by | uuid | YES |  |
| precio_oro_24k_pen | numeric | YES | 220.00 |
| precio_oro_22k_pen | numeric | YES | 200.00 |
| precio_oro_21k_pen | numeric | YES | 190.00 |
| precio_oro_18k_pen | numeric | YES | 165.00 |
| precio_oro_14k_pen | numeric | YES | 128.00 |
| precio_oro_10k_pen | numeric | YES | 92.00 |
| precio_oro_updated_at | timestamp with time zone | YES | now() |
| precio_oro_source | character varying | YES | 'manual'::character varying |

**Foreign Keys**:
- `updated_by` -> `usuarios.id`

## Table: tipos_parentesco
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | integer | NO | nextval('tipos_parentesco_id_seq'::regclass) |
| nombre | character varying | NO |  |
| orden | integer | YES | 99 |
| activo | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

## Table: transacciones_bancarias
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| banco | character varying | NO |  |
| fecha | date | NO |  |
| descripcion | text | YES |  |
| referencia | character varying | YES | ''::character varying |
| monto | numeric | NO |  |
| estado | character varying | YES | 'pendiente'::character varying |
| pago_relacionado_id | uuid | YES |  |
| credito_relacionado_id | uuid | YES |  |
| cliente_nombre | character varying | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `credito_relacionado_id` -> `creditos.id`
- `pago_relacionado_id` -> `pagos.id`

## Table: transacciones_capital
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| inversionista_id | uuid | YES |  |
| origen_cuenta_id | uuid | YES |  |
| destino_cuenta_id | uuid | YES |  |
| tipo | USER-DEFINED | NO |  |
| monto | numeric | NO |  |
| descripcion | text | YES |  |
| evidencia_ref | text | YES |  |
| fecha_operacion | timestamp with time zone | YES | now() |
| created_by | uuid | YES |  |
| metodo_pago | USER-DEFINED | NO | 'EFECTIVO'::metodo_pago_peru |
| numero_operacion | character varying | YES |  |
| banco_origen | USER-DEFINED | YES |  |
| metadata | jsonb | YES | '{}'::jsonb |
| empresa_id | uuid | YES |  |

**Foreign Keys**:
- `destino_cuenta_id` -> `cuentas_financieras.id`
- `empresa_id` -> `empresas.id`
- `inversionista_id` -> `inversionistas.id`
- `origen_cuenta_id` -> `cuentas_financieras.id`

## Table: transferencias_garantias
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| articulo_id | uuid | NO |  |
| sucursal_origen_id | uuid | YES |  |
| sucursal_destino_id | uuid | YES |  |
| motivo | text | YES |  |
| usuario_id | uuid | YES |  |
| created_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `sucursal_destino_id` -> `sucursales.id`
- `sucursal_origen_id` -> `sucursales.id`
- `usuario_id` -> `usuarios.id`

## Table: ubicaciones_cobradores
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| cobrador_id | uuid | NO |  |
| ubicacion | jsonb | NO |  |
| timestamp | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `cobrador_id` -> `empleados.id`

## Table: umbrales_operacion
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| empresa_id | uuid | YES |  |
| nombre | character varying | NO |  |
| tipo_operacion | character varying | NO |  |
| monto_umbral | numeric | NO |  |
| moneda | character varying | YES | 'PEN'::character varying |
| accion | character varying | NO |  |
| requiere_aprobacion | boolean | YES | false |
| activo | boolean | YES | true |
| descripcion | text | YES |  |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`

## Table: usuarios
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| empresa_id | uuid | YES |  |
| email | character varying | NO |  |
| nombres | character varying | NO |  |
| apellido_paterno | character varying | YES |  |
| apellido_materno | character varying | YES |  |
| dni | character varying | YES |  |
| rol_id | uuid | YES |  |
| rol | character varying | YES |  |
| activo | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `empresa_id` -> `empresas.id`
- `rol_id` -> `roles.id`

## Table: ventas_remates
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| articulo_id | uuid | NO |  |
| precio_venta | numeric | NO |  |
| valor_original | numeric | YES |  |
| utilidad | numeric | YES |  |
| comprador | character varying | YES |  |
| comprador_telefono | character varying | YES |  |
| metodo_pago | character varying | YES |  |
| vendedor_id | uuid | YES |  |
| created_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `articulo_id` -> `garantias.id`
- `vendedor_id` -> `empleados.id`

## Table: verificacion_whatsapp
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() |
| telefono | character varying | NO |  |
| codigo | character varying | NO |  |
| creado_en | timestamp with time zone | YES | now() |
| expira_en | timestamp with time zone | NO |  |
| verificado | boolean | YES | false |
| creado_por | uuid | YES |  |

## Table: verificaciones_kyc
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| cliente_id | uuid | NO |  |
| empresa_id | uuid | NO |  |
| estado | character varying | YES | 'pendiente'::character varying |
| nivel_riesgo | character varying | YES | 'normal'::character varying |
| dni_verificado | boolean | YES | false |
| dni_fecha_verificacion | timestamp with time zone | YES |  |
| dni_fuente | character varying | YES |  |
| direccion_verificada | boolean | YES | false |
| direccion_fecha_verificacion | timestamp with time zone | YES |  |
| origen_fondos_declarado | text | YES |  |
| origen_fondos_verificado | boolean | YES | false |
| es_pep | boolean | YES | false |
| pep_cargo | text | YES |  |
| pep_fecha_verificacion | timestamp with time zone | YES |  |
| lista_negra_verificada | boolean | YES | false |
| lista_negra_fecha | timestamp with time zone | YES |  |
| en_lista_negra | boolean | YES | false |
| fecha_vencimiento | date | YES |  |
| notas | text | YES |  |

**Foreign Keys**:
- `cliente_id` -> `clientes.id`
- `empresa_id` -> `empresas.id`

## Table: visitas
| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| cobrador_id | uuid | NO |  |
| credito_id | uuid | NO |  |
| resultado | character varying | NO |  |
| monto_cobrado | numeric | YES |  |
| ubicacion | jsonb | YES |  |
| fotos | ARRAY | YES |  |
| notas | text | YES |  |
| created_at | timestamp with time zone | YES | now() |

**Foreign Keys**:
- `cobrador_id` -> `empleados.id`
- `credito_id` -> `creditos.id`

