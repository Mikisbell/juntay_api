
# Diseño de Integración Bancaria Perú (JUNTAY-PERU-BANKING)

## 1. El Problema (Tu observación)
El sistema actual permite crear una cuenta llamada "Banco", pero no entiende la diferencia operativa entre una **Transferencia BCP** (Inmediata, sin costo) y un **CCI** (Interbancaria, horarios, comisiones). Tampoco valida si un número de operación tiene el formato correcto de Yape vs Plin.

## 2. Solución Propuesta: Normalización Financiera

### 2.1 Catálogo de Entidades (ENUM)
Formalizamos los jugadores principales del mercado peruano.
```sql
CREATE TYPE public.banco_peru AS ENUM (
    'BCP', 
    'INTERBANK', 
    'BBVA', 
    'SCOTIABANK', 
    'BANCO_NACION', 
    'CAJA_MUNICIPAL', -- Piura, Arequipa, etc.
    'OTRO'
);
```

### 2.2 Métodos de Pago Locales (ENUM)
Para conciliación bancaria precisa.
```sql
CREATE TYPE public.metodo_pago_peru AS ENUM (
    'EFECTIVO',
    'YAPE',          -- BCP Ecosystem
    'PLIN',          -- IBK/BBVA/Scotia Ecosystem
    'TRANSFERENCIA', -- Mismo banco
    'CCI',           -- Interbancaria
    'CHEQUE'
);
```

### 2.3 Refinamiento de Tablas

**A) `cuentas_financieras`**:
Se le agrega `banco_asociado` (Nullable, solo para tipo BANCO/DIGITAL).
> *Regla:* Si creas una cuenta "Yape Corporativo", el banco asociado debe ser `BCP`.

**B) `transacciones_capital`**:
Se agrega `metodo_pago` y `numero_operacion` (El código único del voucher).
> *Validación futura:* Podríamos impedir números de operación duplicados para evitar que dos cajeros registren el mismo voucher.

## 3. Ejemplo de Uso Realista

1.  **Socio** envía S/ 500.
2.  **Sistema** registra: 
    *   Banco: `BCP`
    *   Método: `YAPE`
    *   Nro Op: `123456`
    *   Destino: Cuenta "Yape BCP Soles".

Esto permite sacar reportes: *"¿Cuánto ingresó por Plin vs Yape este mes?"* (Métrica clave para un negocio en Perú).
