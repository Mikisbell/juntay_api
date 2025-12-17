
# ADR-006: Tesorería Multi-Activo y Segregación de Fondos

## Estado
Propuesto

## Contexto
El negocio requiere incorporar "Socios Inversionistas" que aportan capital mediante canales digitales (Yape, Plin, Transferencias) y efectivo.
Actualmente, el sistema maneja una única entidad `boveda_central` que asume custodia física del dinero.

## El Problema
Mezclar saldo digital y efectivo en una sola cuenta ("Bóveda") genera una falsa percepción de liquidez operativa.
- Si Bóveda dice "S/ 10,000" pero 8,000 están en Yape:
    - El cajero no puede desembolsar un préstamo de S/ 5,000 en efectivo.
    - El arqueo de caja física fallará sistemáticamente.

## Decisión
Implementar una arquitectura de **Tesorería Multi-Cuenta**.

1.  **Segregación**:
    - `boveda_fisica` (Efectivo en custodia).
    - `cuentas_bancarias` (Dinero en instituciones financieras/wallets).

2.  **Trazabilidad**:
    - Los aportes de socios deben especificar el `destino_id` (a qué cuenta entró).
    - Se permiten transferencias internas (Retiro de Banco -> Ingreso a Bóveda).

## Consecuencias
- **Positivas**:
    - Arqueos exactos (Efectivo vs Efectivo).
    - Control real de liquidez operativa para desembolsos.
    - Preparado para múltiples cuentas bancarias futuras.
- **Negativas**:
    - Requiere gestionar "Transferencias de Fondeo" (ir al banco a retirar dinero para operar).
    - Mayor complejidad en el registro de aportes.

## Esquema Propuesto

```sql
CREATE TABLE cuentas_financieras (
    id UUID PRIMARY KEY,
    nombre VARCHAR(50) (Ej: "Caja Fuerte Principal", "BCP Yape"),
    tipo VARCHAR(20) (EFECTIVO, BANCO, WALLET),
    saldo NUMERIC(15,2),
    ...
);
```
