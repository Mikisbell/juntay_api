
-- ============================================================================
-- JUNTAY API - FIX ENUM TYPES
-- Fecha: 2025-12-16
-- Descripción: Agrega tipos de operación de caja al enum de capital.
-- ============================================================================

BEGIN;

-- PostgreSQL permite agregar valores a un ENUM dentro de una transacción, 
-- pero no se puede usar el nuevo valor en la misma transacción si se usa SQL estandar.
-- Sin embargo, ALTER TYPE ... ADD VALUE no puede correr dentro de un bloque anonimo DO $$ en versiones antiguas, 
-- pero sí en script directo.

ALTER TYPE public.tipo_transaccion_capital ADD VALUE IF NOT EXISTS 'APERTURA_CAJA';
ALTER TYPE public.tipo_transaccion_capital ADD VALUE IF NOT EXISTS 'CIERRE_CAJA';

COMMIT;
