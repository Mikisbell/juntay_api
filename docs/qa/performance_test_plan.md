
# Plan de Pruebas de Rendimiento (Performance Testing)
Fecha: 2025-12-16

## 1. Objetivos
Demostrar que JUNTAY API puede escalar de una PYME (100 tx/día) a una Fintech Regional (10,000 tx/día) sin degradarse.

## 2. Escenarios de Prueba

### 2.1 Prueba de Volumen (The "Dala Flood")
**Objetivo:** Inundar la base de datos con data histórica para ver si las consultas de reportes se vuelven lentas.
**Datos a Generar:**
*   10,000 Clientes.
*   50,000 Préstamos Históricos.
*   200,000 Transacciones de Caja.
*   20,000 Movimientos de Capital.

### 2.2 Prueba de Concurrencia (Simulada)
**Objetivo:** Verificar bloqueos (Deadlocks) cuando múltiples cajeros operan simultáneamente.
**Simulación:**
*   Script PL/PGSQL que lanza 50 operaciones de asignación de caja en paralelo (usando loop o sesiones background si es posible, sino estrés secuencial rápido para medir latencia media).

### 2.3 Análisis de Consultas (Slow Query Log)
**Objetivo:** Optimizar los "Cuellos de Botella".
**Queries a Analizar (`EXPLAIN ANALYZE`):**
1.  `conciliar_caja_dia()` con 200k registros.
2.  `buscar_clientes_con_creditos()` con 10k clientes y wildcard search (`LIKE '%...%'`).
3.  Cálculo de Mora en batch.

## 3. Scripts a Desarrollar
*   `scripts/perf_volume_seed.sql`: Generador de data sintética masiva.
*   `scripts/perf_analyze_queries.sql`: Runner de `EXPLAIN ANALYZE` sobre escenarios cargados.

## 4. Métricas de Éxito
*   Búsqueda de Cliente: < 100ms.
*   Cierre de Caja (con Auto-Liquidación): < 500ms.
*   Reporte Diario: < 2 segundos.
