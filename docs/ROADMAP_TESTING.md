# 🗺️ JUNTAY — ROADMAP & PLAN DE PRUEBAS

**Versión:** 1.0  
**Estado Actual:** v3.3.0 ("Intelligent Catalog")

---

## 1️⃣ Roadmap v4.0 (Futuro Inmediato)

### 1.1 Prioridad Alta (Q4 2025)

- [ ] **Impresoras Térmicas (Ticketera):**
  - Integración con WebUSB / Web Bluetooth API.
  - Impresión de: Ticket de Empeño, Recibo de Pago, Cierre de Caja.
  - Formato: 80mm ESC/POS.

- [ ] **Biometría RENIEC:**
  - Integración con lectores de huella digital (DigitalPersona/Futronic).
  - Validación 1:1 contra base de datos RENIEC (vía API intermedia).
  - Objetivo: Eliminar suplantación de identidad.

- [ ] **WhatsApp Marketing / Cobranza Masiva:**
  - Cron jobs para detectar vencimientos mañana/hoy.
  - Envío automático de recordatorios de pago.
  - Campañas de "Recupera tu joya" para clientes en mora.

### 1.2 Prioridad Media (2026)

- [ ] **Dashboard Analytics Avanzado:** Gráficos de proyección de flujo de caja.
- [ ] **App Móvil Nativa (React Native):** Para clientes (ver sus empeños, pagar online).
- [ ] **Marketplace de Remates:** Web pública para vender joyas vencidas.

---

## 2️⃣ Plan de Pruebas (QA) - v3.3.0

### 2.1 Pruebas de Bóveda y Tesorería

- [ ] **Inyección de Capital:** Registrar ingreso de S/ 10,000 de Socio A. Verificar saldo Bóveda.
- [ ] **Asignación a Caja:** Transferir S/ 1,000 a Caja 1. Verificar resta en Bóveda y suma en Caja.
- [ ] **Auditoría:** Verificar que `movimientos_boveda_auditoria` tenga el registro con metadata correcta.

### 2.2 Pruebas de Operativa de Caja

- [ ] **Apertura:** Abrir caja con saldo inicial.
- [ ] **Crédito Nuevo:**
  - Crear cliente (o buscar existente).
  - Tasar artículo (Oro/Electro).
  - Generar contrato.
  - Verificar: Saldo Caja disminuye, Crédito creado, Estado "Vigente".
- [ ] **Cobro:**
  - Buscar crédito.
  - Registrar pago (Interés o Capital).
  - Verificar: Saldo Caja aumenta, Crédito actualizado.
- [ ] **Cierre Ciego:**
  - Ingresar monto contado físico.
  - Sistema calcula sobrante/faltante.
  - Verificar reporte final.

### 2.3 Pruebas de WhatsApp & UX

- [ ] **Verificación:** Enviar código a número nuevo. Verificar recepción < 10s.
- [ ] **Anti-Bloqueo:** Enviar 5 mensajes seguidos. Verificar delay y no bloqueo.
- [ ] **Enter Key:** Probar "Enter" en todos los buscadores (Clientes, Contratos).
- [ ] **Resiliencia:** Desconectar internet y probar operación (debe fallar gracefulmente o encolar si PWA).

---

## 3️⃣ Métricas de Éxito (KPIs)

| Métrica | Meta v3.3 | Estado Actual |
| :--- | :--- | :--- |
| **Tiempo de Atención** | < 3 min por crédito | ~4.5 min (Mejorando con Smart Paste) |
| **Errores de Caja** | 0 (Cero) | 0 (Garantizado por Ledger) |
| **Tasa de Verificación** | 100% Clientes Nuevos | Implementado (WhatsApp) |
| **Uptime Sistema** | 99.9% | 99.9% (Local-First + Cloud) |
