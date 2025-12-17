
# 7. Inmutabilidad Inteligente del Ledger (Smart Locking)

Fecha: 2025-12-16

## Estado

Aceptado

## Contexto

En sistemas financieros tradicionales, la integridad del "Libro Mayor" (Ledger) es sagrada. Sin embargo, en la operación diaria de una PYME (como Juntay), ocurren errores humanos (mal concepto en descripción, olvido de adjuntar foto del voucher) que requieren corrección.

Detectamos una vulnerabilidad crítica: Un administrador con acceso a la BD podía alterar montos de transacciones cerradas (`UPDATE`) o eliminar registros (`DELETE`), comprometiendo toda la auditoría contable.

## Decisión

Implementar un mecanismo de **"Smart Locking"** (Candado Inteligente) a nivel de base de datos (Trigger en PostgreSQL) que impone reglas estrictas pero pragmáticas:

1.  **Inmutabilidad Financiera**: Es **IMPOSIBLE** modificar los campos `monto`, `tipo`, `origen_cuenta_id`, `destino_cuenta_id` o `fecha_operacion` una vez creada la transacción.
    *   *Razón:* Estos campos alteran el balance. Si hubo un error, se debe crear una contra-transacción (extorno) para corregirlo transparentemente.
2.  **Prohibición de Borrado**: Es **IMPOSIBLE** eliminar (`DELETE`) registros de `transacciones_capital`.
    *   *Razón:* La evidencia nunca debe desaparecer.
3.  **Flexibilidad Informativa**: Se **PERMITE** modificar campos no financieros (`descripcion`, `metadata`, `evidencia_ref`).
    *   *Razón:* Permite corregir typos u operativos sin burocracia.

## Consecuencias

### Positivas
*   **Integridad Garantizada:** Matemáticamente imposible descuadrar saldos históricos editando el pasado.
*   **Confianza Auditora:** El sistema pasa de "confiable" a "probablemente seguro".
*   **Operativa Fluida:** El Gerente mantiene control sobre la calidad de la data (descripciones) sin riesgo de fraude.

### Negativas
*   **Rigidez:** Errores de monto requieren dos pasos para corregir (Extorno + Nuevo Asiento) en lugar de un "Quick Edit". Esto es intencional.
