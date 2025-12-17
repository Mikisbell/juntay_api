
# 8. Patrón de Auto-Liquidación de Cajas (Trigger-Based Liquidation)

Fecha: 2025-12-16

## Estado

Aceptado

## Contexto

En el flujo de efectivo de Juntay, detectamos un riesgo crítico de "Capital Atrapado".
Cuando un cajero cerraba su caja (`estado: cerrada`), el dinero remanente (Saldo Final) se quedaba registrado en la tabla `cajas_operativas`, pero no retornaba contablemente a la `boveda_central` (ahora `cuentas_financieras` Principal).

Esto causaba que el dinero disponible para re-asignación disminuyera con cada cierre, exigiendo procesos manuales de conciliación o "inyecciones fantasma" para cuadrar la bóveda.

## Decisión

Implementar un patrón de **"Auto-Liquidación Reactiva"** basado en Triggers de Base de Datos.

En lugar de crear un endpoint complejo `POST /api/cerrar-caja` que orqueste múltiples pasos (Actualizar Estado -> Crear Transacción Bóveda), delegamos la responsabilidad de la integridad financiera a la base de datos:

1.  ** Trigger**: `trg_auto_liquidar_caja` en la tabla `cajas_operativas`.
2.  **Evento**: Se dispara `AFTER UPDATE` solo cuando el estado cambia de `abierta` a `cerrada`.
3.  **Acción**:
    *   Lee el `saldo_final_cierre` de la caja.
    *   Inserta automáticamente una transacción de tipo `CIERRE_CAJA` en `transacciones_capital`.
    *   Asigna `destino_cuenta_id` = Bóveda Principal (identificada por `es_principal=TRUE`).
    *   Incluye metadata de auditoría (diferencia, usuario).

## Consecuencias

### Positivas
*   **Ciclo Cerrado Garantizado**: Es imposible cerrar una caja sin que el dinero vuelva a la bóveda. Cero fugas.
*   **Simplicidad en Frontend**: El UI solo necesita llamar a `update({ estado: 'cerrada' })`. No necesita saber de contabilidad.
*   **Resiliencia**: Si el servidor de API muere justo después de cerrar la caja, el movimiento financiero ya ocurrió atómicamente en la BD.

### Negativas
*   **Lógica "Mágica"**: Un desarrollador nuevo podría no entender por qué aparece dinero en la bóveda si no ve código explícito en el backend. (Mitigado por esta documentación).
