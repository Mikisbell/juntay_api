-- ============================================================================
-- OPTIMIZACIÓN DE ÍNDICES - JUNTAY
-- Basado en análisis de queries en /src/lib/actions/*.ts
-- Fecha: 10 Diciembre 2025
-- ============================================================================

-- ============================================================================
-- ÍNDICES PARA TABLA: creditos
-- Queries más frecuentes:
--   .eq('cliente_id', ?)
--   .eq('estado', ?)
--   .eq('estado_detallado', ?)
--   .order('fecha_vencimiento')
--   .order('created_at')
-- ============================================================================

-- Índice compuesto para búsquedas por cliente + estado
CREATE INDEX IF NOT EXISTS idx_creditos_cliente_estado 
ON public.creditos(cliente_id, estado);

-- Índice para búsquedas por estado_detallado (muy usado)
CREATE INDEX IF NOT EXISTS idx_creditos_estado_detallado 
ON public.creditos(estado_detallado);

-- Índice para ordenar por vencimiento (dashboard de vencimientos)
CREATE INDEX IF NOT EXISTS idx_creditos_fecha_vencimiento 
ON public.creditos(fecha_vencimiento);

-- Índice para créditos vigentes/vencidos ordenados
CREATE INDEX IF NOT EXISTS idx_creditos_estado_vencimiento 
ON public.creditos(estado, fecha_vencimiento);

-- Índice para garantía (join frecuente)
CREATE INDEX IF NOT EXISTS idx_creditos_garantia 
ON public.creditos(garantia_id);

-- Índice para caja origen
CREATE INDEX IF NOT EXISTS idx_creditos_caja_origen 
ON public.creditos(caja_origen_id);

-- ============================================================================
-- ÍNDICES PARA TABLA: clientes
-- Queries más frecuentes:
--   .eq('numero_documento', ?)
--   .eq('activo', true)
--   .order('created_at')
-- ============================================================================

-- Índice para búsqueda por DNI (única vez)
CREATE INDEX IF NOT EXISTS idx_clientes_documento 
ON public.clientes(numero_documento);

-- Índice para clientes activos ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_clientes_activo_created 
ON public.clientes(activo, created_at DESC);

-- Índice para persona_id (join con personas)
CREATE INDEX IF NOT EXISTS idx_clientes_persona 
ON public.clientes(persona_id);

-- ============================================================================
-- ÍNDICES PARA TABLA: cajas_operativas
-- Queries más frecuentes:
--   .eq('usuario_id', ?)
--   .eq('estado', 'abierta')
-- ============================================================================

-- Índice compuesto para buscar caja abierta de usuario
CREATE INDEX IF NOT EXISTS idx_cajas_usuario_estado 
ON public.cajas_operativas(usuario_id, estado);

-- ============================================================================
-- ÍNDICES PARA TABLA: movimientos_caja_operativa
-- Queries más frecuentes:
--   .eq('caja_operativa_id', ?)
--   .eq('caja_id', ?)
--   .order('created_at')
-- ============================================================================

-- Índice para movimientos por caja ordenados
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_created 
ON public.movimientos_caja_operativa(caja_operativa_id, fecha DESC);

-- Índice alternativo para caja_id
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_id 
ON public.movimientos_caja_operativa(caja_id);

-- Índice para fecha
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha 
ON public.movimientos_caja_operativa(fecha DESC);

-- ============================================================================
-- ÍNDICES PARA TABLA: garantias
-- Queries más frecuentes:
--   .eq('cliente_id', ?)
--   .eq('estado', ?)
-- ============================================================================

-- Índice para garantías por cliente
CREATE INDEX IF NOT EXISTS idx_garantias_cliente 
ON public.garantias(cliente_id);

-- Índice para estado de garantía
CREATE INDEX IF NOT EXISTS idx_garantias_estado 
ON public.garantias(estado);

-- ============================================================================
-- ÍNDICES PARA TABLA: pagos
-- Queries más frecuentes:
--   .eq('credito_id', ?)
--   .order('fecha_pago')
-- ============================================================================

-- Índice para pagos por crédito
CREATE INDEX IF NOT EXISTS idx_pagos_credito 
ON public.pagos(credito_id);

-- Índice para caja
CREATE INDEX IF NOT EXISTS idx_pagos_caja 
ON public.pagos(caja_operativa_id);

-- Índice para fecha de pago
CREATE INDEX IF NOT EXISTS idx_pagos_fecha 
ON public.pagos(fecha_pago DESC);

-- ============================================================================
-- ÍNDICES PARA TABLA: personas
-- Queries más frecuentes:
--   .eq('numero_documento', ?)
-- ============================================================================

-- Ya tiene UNIQUE en numero_documento, pero agregar index si no existe
CREATE INDEX IF NOT EXISTS idx_personas_documento 
ON public.personas(numero_documento);

-- ============================================================================
-- ÍNDICES PARA TABLA: empleados
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_empleados_user_id 
ON public.empleados(user_id);

CREATE INDEX IF NOT EXISTS idx_empleados_persona 
ON public.empleados(persona_id);

-- ============================================================================
-- ÍNDICES PARA TABLA: usuarios
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_email 
ON public.usuarios(email);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol 
ON public.usuarios(rol);

-- ============================================================================
-- ÍNDICES PARA VISTAS MATERIALIZADAS (si aplica)
-- ============================================================================

-- Índice en clientes_completo si es vista materializada
-- (ignorar si es vista normal)

-- ============================================================================
-- ANALYZE - Actualizar estadísticas
-- ============================================================================

ANALYZE public.creditos;
ANALYZE public.clientes;
ANALYZE public.cajas_operativas;
ANALYZE public.movimientos_caja_operativa;
ANALYZE public.garantias;
ANALYZE public.pagos;
ANALYZE public.personas;
ANALYZE public.empleados;
ANALYZE public.usuarios;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON INDEX idx_creditos_cliente_estado IS 'Optimiza: buscar créditos de cliente por estado';
COMMENT ON INDEX idx_creditos_estado_detallado IS 'Optimiza: filtrar por estado_detallado en dashboard';
COMMENT ON INDEX idx_creditos_fecha_vencimiento IS 'Optimiza: ordenar créditos por vencimiento';
COMMENT ON INDEX idx_cajas_usuario_estado IS 'Optimiza: buscar caja abierta de usuario (muy frecuente)';

-- ============================================================================
-- FIN
-- ============================================================================
