# 🧠 JUNTAY - Contexto Maestro del Proyecto

> Documento vivo para establecer un lenguaje común entre humanos e IA.
> **Última actualización:** 26 de Diciembre 2025

---

## 1. IDENTIDAD DEL PRODUCTO

### ¿Qué es JUNTAY?

**Un SaaS para casas de empeño en Perú** que les permite:
- Gestionar créditos prendarios digitalmente
- Cumplir con regulación SBS/UIF automáticamente
- Reducir mora con recordatorios WhatsApp
- Operar sin internet (offline-first)

### Propuesta de Valor

```
"JUNTAY: El único sistema de gestión para casas de empeño que funciona 
sin internet y te mantiene al día con la SBS."
```

### Modelo de Negocio

**SaaS B2B** con suscripción mensual:

| Plan | Precio | Target |
|------|--------|--------|
| Starter | $49/mes | 1 local |
| Pro | $149/mes | 2-5 locales |
| Business | $299/mes | 5-15 locales |
| Enterprise | $499+/mes | 15+ locales |

---

## 2. MERCADO

### Datos Clave 2025

| Métrica | Valor |
|---------|-------|
| Casas de empeño en Perú | 2,000-2,500 |
| Registradas SBS | 600+ |
| Informales | ~1,500 |
| Cartera total | S/4,000-5,000M |
| Sin digitalizar | **80%** |
| Tu SAM | $4.8M/año |

### Regulación Clave

- **SBS N° 00650-2024**: Registro obligatorio
- **SBS N° 00413-2025**: Supervisión reforzada
- **DS 010-2025-JUS**: Política Lavado de Activos 2030

> ⚠️ Incumplimiento = cierre del local

### Geografía Inicial

**Selva Central de Perú**: Chanchamayo, Satipo, Oxapampa
- Conectividad intermitente → offline-first es ventaja
- Menos competencia que Lima
- Tu red de contactos

---

## 3. USUARIOS

| Rol | Descripción | Necesidades |
|-----|-------------|-------------|
| **Dueño** | Propietario de la casa | Rentabilidad, cumplimiento |
| **Admin** | Gerente de sucursal | Control, reportes |
| **Cajero** | Atención al cliente | Velocidad, simplicidad |
| **Cobrador** | Trabajo de campo | Mobile, offline |
| **Super Admin** | TÚ (JUNTAY) | Gestionar todos los tenants |

---

## 4. ARQUITECTURA

### Stack Tecnológico

```yaml
Frontend:   Next.js 15 + React 18 + TypeScript
Estilos:    Tailwind CSS + Glassmorphism
DB Cloud:   Supabase (PostgreSQL + Auth + RLS)
DB Local:   RxDB (IndexedDB, offline-first)
Finanzas:   Decimal.js
Mensajería: WAHA (WhatsApp)
```

### Modelo de Datos (Simplificado)

```
EMPRESA (tenant)
├── SUCURSAL (1:N)
│   ├── CAJA (1:1)
│   ├── USUARIO (1:N)
│   └── CLIENTE (1:N)
│       └── CREDITO (1:N)
│           ├── GARANTIA (1:N)
│           └── PAGO (1:N)
└── SUSCRIPCION (plan)
```

### Multi-Tenant

- **RLS (Row Level Security)** en TODAS las tablas
- Cada empresa solo ve sus datos
- Super Admin ve todo

---

## 5. MÓDULOS IMPLEMENTADOS

### Core (✅ Completo)

| Módulo | Estado | Notas |
|--------|--------|-------|
| Créditos | ✅ | CRUD completo |
| Pagos | ✅ | Con triggers |
| Clientes | ✅ | Con scoring |
| Garantías | ✅ | Fotos, valoración |
| Caja | ✅ | Cierre diario |
| WhatsApp | ✅ | WAHA integrado |

### SaaS (✅ Recién Implementado)

| Módulo | Estado | Notas |
|--------|--------|-------|
| Multi-tenant | ✅ | RLS activo |
| Empresas CRUD | ✅ | Master Panel |
| Sucursales CRUD | ✅ | Enterprise fields |
| Billing Center | ✅ | Facturas SaaS |
| Alerts System | ✅ | Mora, vencimientos |
| Audit Logs | ✅ | Registro de acciones |
| Health Dashboard | ✅ | Monitoreo sistema |

### Pendiente (⚠️)

| Módulo | Prioridad | Por qué |
|--------|-----------|---------|
| Cumplimiento SBS/UIF | 🔴 Alta | Requisito legal |
| Integración RENIEC | 🔴 Alta | KYC diferenciador |
| Reportes para regulador | 🟡 Media | Demanda alta |

---

## 6. REGLAS DE NEGOCIO

### Créditos

- Tasa de interés: configurable por empresa (default: 20%)
- Tipos: Diario, Semanal, Quincenal, Mensual
- Estados: activo → pagado | vencido | refinanciado

### Mora

- Se calcula automáticamente basado en días vencidos
- Tasa de mora: configurable (default: 0.5%/día)
- Alertas automáticas al sistema

### Garantías

- LTV (Loan-to-Value): 30%-85% según categoría
- Categorías: Oro, Plata, Electrónicos, Vehículos
- Fotos obligatorias

---

## 7. DECISIONES TÉCNICAS (ADRs)

| ADR | Decisión | Justificación |
|-----|----------|---------------|
| 001 | Offline-first con RxDB | Conectividad intermitente en Selva |
| 002 | WhatsApp con WAHA | Más barato que Meta API oficial |
| 004 | RxDB + Supabase Sync | Mejor balance costo/complejidad |
| 006 | Multi-cuenta Tesorería | Socios e inversionistas |
| 007 | Ledger inmutable | Integridad financiera |

---

## 8. MÉTRICAS DE ÉXITO 2026

| Métrica | Q1 | Q2 | Q3 | Q4 |
|---------|-----|-----|-----|-----|
| Tenants | 3 | 10 | 20 | 30 |
| MRR | $500 | $2K | $4K | $6K |
| Churn | <10% | <10% | <5% | <5% |
| NPS | >50 | >60 | >70 | >70 |

---

## 9. TERMINOLOGÍA

| Término | Significado |
|---------|-------------|
| **Tenant** | Una empresa cliente de JUNTAY |
| **Empresa** | Sinónimo de tenant |
| **Sucursal** | Local físico de una empresa |
| **Empeño** | Sinónimo de crédito prendario |
| **Garantía** | Artículo dejado como colateral |
| **Desempeño** | Cuando el cliente recupera su garantía |
| **Remate** | Venta de garantía no reclamada |
| **LTV** | Loan-to-Value (% del valor prestado) |
| **Mora** | Días de atraso en pago |
| **ROS** | Reporte de Operación Sospechosa (UIF) |
| **SPLAFT** | Sistema Prevención Lavado de Activos |

---

## 10. CÓMO USAR ESTE DOCUMENTO

### Para la IA (Claude/Gemini):

1. **Antes de implementar**: Consultar secciones 4 (Arquitectura) y 6 (Reglas)
2. **Al tomar decisiones**: Verificar contra sección 7 (ADRs)
3. **Al nombrar cosas**: Usar terminología de sección 9
4. **Al priorizar**: Consultar mercado (sección 2) y pendientes (sección 5)

### Para Humanos:

1. Actualizar este documento cuando cambien reglas de negocio
2. Agregar nuevos términos a la terminología
3. Documentar nuevas decisiones como ADRs

---

*Este documento es la fuente única de verdad para el proyecto JUNTAY.*
