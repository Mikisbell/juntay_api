
# Plan de Pruebas Rigurosas: Supabase & Base de Datos
Fecha: 2025-12-16
Estado: Borrador de Planificación

## 1. Filosofía de Pruebas
> "No confiamos, verificamos."

Adoptamos una postura escéptica. No asumimos que una FK impide huérfanos; lo probamos intentando crear un huérfano. No asumimos que un trigger actualiza el saldo; lo probamos midiendo el saldo antes y después.

## 2. Alcance (Matriz de Riesgo)

Clasificamos las 28 tablas del sistema según su criticidad.

### Nivel 1: Core Financiero (Riesgo Crítico)
*Objetivo:* Integridad absoluta, Concurrencia, Inmutabilidad.
*   `transacciones_capital` (Smart Locking, Append-Only)
*   `cuentas_financieras` (Saldo único, Bóveda Principal única)
*   `cajas_operativas` (Saldo = Movimientos)
*   `movimientos_caja_operativa` (Secuencialidad)
*   `pagos` (Vinculación estricta a Préstamo)

### Nivel 2: Core Operativo (Riesgo Alto)
*Objetivo:* Consistencia de datos maestros y reglas de negocio.
*   `prestamos` (Cálculo de intereses, Estados Válidos de LTV)
*   `garantias` (Valoración, Status)
*   `personas` (Unicidad DNI, Normalización)
*   `usuarios` (Auth Link, Roles)
*   `inversionistas` (Relación Persona-Finanzas)

### Nivel 3: Soporte y Configuración (Riesgo Bajo)
*Objetivo:* Disponibilidad y Referencia.
*   `bancos_peru`, `roles`, `system_settings`, `departamentos`, `provincias`, `distritos`.
*   *Estrategia:* Validar carga inicial (Seeds) y FKs. No se requieren tests de stress.

## 3. Estrategia de Pruebas Funcionales

### 3.1 Integridad Referencial (El "Anti-Orphaning")
*   **Herramienta**: `scripts/audit_schema_integrity.sql` (Ya existente, se ampliará).
*   **Prueba**:
    *   Barrido de todas las FKs buscando registros hijos sin padre.
    *   Verificación de `ON DELETE RESTRICT` en tablas críticas (Prohibido borrar un Cliente con Préstamos).

### 3.2 Lógica de Negocio (Triggers & Functions)
*   **Flujos a probar:**
    1.  **Ciclo Crédito**: Crear Cliente -> Crear Garantía -> Aprobar Préstamo -> Desembolsar (Caja) -> Pagar Cuota -> Cerrar Préstamo.
    2.  **Ciclo Capital (Blind Cashier)**: Aporte -> Bóveda -> Caja Ciega -> Cierre Caja -> Arqueo.
    3.  **Seguridad**: Intento de Fraude (Modificar Pago, Borrar Transacción).

### 3.3 Vistas y Reportes
*   Verificar que `view_reporte_diario` (o equivalentes RPC) cuadren con la sumatoria manual de tablas base.

## 4. Ejecución
Se desarrollará una suite de scripts SQL automatizados (`testing_suite/`) que el CI/CD pueda ejecutar.

1.  `01_integrity_check.sql`: Assertions de FKs y Constraints.
2.  `02_business_logic.sql`: Simulación de casos de uso (Happy Path + Edge Cases).
3.  `03_security_audit.sql`: Intentos de SQL Injection a RPCs y Violación de RLS (si aplica).

## 5. Criterios de Aceptación
*   0 Registros Huérfanos.
*   0 Violaciones de Constraints durante flujos normales.
*   100% de Bloqueo en intentos de modificación de Ledger (`Smart Locking`).
*   Tiempos de respuesta de RPCs críticos < 200ms.
