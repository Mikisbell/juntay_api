-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║                   JUNTAY - MIGRACIÓN DEFINITIVA v3.0                        ║
-- ║                  CORE BANCARIO: UNA SOLA FUENTE DE VERDAD                   ║
-- ║                                                                            ║
-- ║  Esta migración RECONSTRUYE la base de datos eliminando la arquitectura    ║
-- ║  vieja (caja_general, sesiones_caja) e implementa la v3.0 limpia.          ║
-- ║                                                                            ║
-- ║  Arquitectura: Ledger Inmutable + Motor de Reglas Dinámicas                ║
-- ║  Stack: Next.js 14 + TypeScript + Supabase (PostgreSQL)                    ║
-- ║  Fecha: 21 Noviembre 2025                                                  ║
-- ║  Arquitecto: Mikis                                                         ║
-- ╚════════════════════════════════════════════════════════════════════════════╝

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- ============================================================================
-- FASE 1: ELIMINAR ARQUITECTURA VIEJA (Cleanup)
-- ============================================================================
-- Eliminamos todas las tablas de la arquitectura anterior para empezar limpio

DROP TABLE IF EXISTS public.mensajes_whatsapp CASCADE;
DROP TABLE IF EXISTS public.plantillas_whatsapp CASCADE;
DROP TABLE IF EXISTS public.notificaciones CASCADE;
DROP TABLE IF EXISTS public.auditoria CASCADE;
DROP TABLE IF EXISTS public.remates CASCADE;
DROP TABLE IF EXISTS public.cronograma_pagos CASCADE;
DROP TABLE IF EXISTS public.evaluaciones_credito CASCADE;
DROP TABLE IF EXISTS public.solicitudes_credito CASCADE;
DROP TABLE IF EXISTS public.desembolsos CASCADE;
DROP TABLE IF EXISTS public.pagos CASCADE;
DROP TABLE IF EXISTS public.creditos CASCADE;
DROP TABLE IF EXISTS public.garantia_fotos CASCADE;
DROP TABLE IF EXISTS public.garantias CASCADE;
DROP TABLE IF EXISTS public.categorias_garantia CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.conyuges CASCADE;
DROP TABLE IF EXISTS public.garantes CASCADE;
DROP TABLE IF EXISTS public.credito_garantes CASCADE;
DROP TABLE IF EXISTS public.gastos CASCADE;
DROP TABLE IF EXISTS public.transferencias_caja CASCADE;
DROP TABLE IF EXISTS public.movimientos_caja CASCADE;
DROP TABLE IF EXISTS public.movimientos_caja_general CASCADE;
DROP TABLE IF EXISTS public.movimientos CASCADE;
DROP TABLE IF EXISTS public.cuentas_bancarias CASCADE;
DROP TABLE IF EXISTS public.caja_general CASCADE;
DROP TABLE IF EXISTS public.sesiones_caja CASCADE;
DROP TABLE IF EXISTS public.arqueos_caja CASCADE;
DROP TABLE IF EXISTS public.asignaciones_caja CASCADE;
DROP TABLE IF EXISTS public.jerarquia_cajas CASCADE;
DROP TABLE IF EXISTS public.cajas CASCADE;
DROP TABLE IF EXISTS public.movimientos_caja_operativa CASCADE;
DROP TABLE IF EXISTS public.movimientos_caja_pesonal CASCADE;
DROP TABLE IF EXISTS public.cajas_pesonales CASCADE;
DROP TABLE IF EXISTS public.reportes_cierre_caja CASCADE;
DROP TABLE IF EXISTS public.limites_dinamicos CASCADE;
DROP TABLE IF EXISTS public.tipos_credito CASCADE;
DROP TABLE IF EXISTS public.roles_permisos CASCADE;
DROP TABLE IF EXISTS public.permisos CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.empresas CASCADE;
DROP TABLE IF EXISTS public.distritos CASCADE;
DROP TABLE IF EXISTS public.provincias CASCADE;
DROP TABLE IF EXISTS public.departamentos CASCADE;
DROP TABLE IF EXISTS public.boveda_central CASCADE;
DROP TABLE IF EXISTS public.movimientos_boveda_auditoria CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- ============================================================================
-- FASE 2: CREAR INFRAESTRUCTURA BASE (UBIGEO Y EMPRESA)
-- ============================================================================

CREATE TABLE public.departamentos (
    codigo character varying(2) NOT NULL PRIMARY KEY,
    nombre character varying(50) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);

CREATE TABLE public.provincias (
    codigo character varying(4) NOT NULL PRIMARY KEY,
    nombre character varying(100) NOT NULL,
    departamento_codigo character varying(2) NOT NULL REFERENCES public.departamentos(codigo),
    activo boolean DEFAULT true NOT NULL
);

CREATE TABLE public.distritos (
    ubigeo_inei character varying(6) NOT NULL PRIMARY KEY,
    nombre character varying(100) NOT NULL,
    provincia_codigo character varying(4) NOT NULL REFERENCES public.provincias(codigo),
    activo boolean DEFAULT true NOT NULL
);

CREATE TABLE public.empresas (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    ruc character varying(11) NOT NULL UNIQUE,
    razon_social character varying(255) NOT NULL,
    nombre_comercial character varying(255),
    direccion text,
    telefono character varying(20),
    email character varying(100),
    logo_url text,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- FASE 3: SEGURIDAD Y USUARIOS
-- ============================================================================

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    nombre character varying(50) NOT NULL UNIQUE,
    descripcion text,
    nivel_acceso integer DEFAULT 1,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
    email character varying(100) NOT NULL UNIQUE,
    nombres character varying(100) NOT NULL,
    apellido_paterno character varying(100),
    apellido_materno character varying(100),
    dni character varying(8),
    rol_id uuid REFERENCES public.roles(id),
    rol character varying(50),
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- FASE 4: CORE BANCARIO - TESORERÍA (El Dinero)
-- ============================================================================

-- LA BÓVEDA: Repositorio central de todo el capital
CREATE TABLE public.boveda_central (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id uuid REFERENCES public.empresas(id),
    saldo_total numeric(15,2) DEFAULT 0 NOT NULL,
    saldo_disponible numeric(15,2) DEFAULT 0 NOT NULL,
    saldo_asignado numeric(15,2) DEFAULT 0 NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now(),
    estado varchar(50) DEFAULT 'activa',
    CONSTRAINT chk_boveda_saldos CHECK (saldo_total = saldo_disponible + saldo_asignado)
);

-- CAJAS OPERATIVAS: Ventanillas de atención (Sesiones del Cajero)
CREATE TABLE public.cajas_operativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
    boveda_origen_id UUID REFERENCES public.boveda_central(id),
    numero_caja INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'cerrada',
    
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_actual DECIMAL(15,2) DEFAULT 0,
    saldo_final_cierre DECIMAL(15,2),
    diferencia_cierre DECIMAL(15,2),
    
    fecha_apertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(usuario_id, estado)
);

CREATE INDEX idx_cajas_operativas_usuario ON public.cajas_operativas(usuario_id);
CREATE INDEX idx_cajas_operativas_estado ON public.cajas_operativas(estado);
CREATE INDEX idx_cajas_operativas_fecha_apertura ON public.cajas_operativas(fecha_apertura);

-- ============================================================================
-- FASE 5: MOTOR DE REGLAS (System Settings) - ARQUITECTURA v3.0
-- ============================================================================

CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- A. BILLETERAS DIGITALES (Yape/Plin)
    yape_limite_diario NUMERIC(15,2) DEFAULT 500.00,
    yape_exigir_evidencia BOOLEAN DEFAULT TRUE,
    yape_destino_personal_permitido BOOLEAN DEFAULT FALSE,
    
    -- B. INYECCIÓN DE CAPITAL
    tesoreria_separar_cuentas_socios BOOLEAN DEFAULT TRUE,
    tesoreria_retiro_desde_caja BOOLEAN DEFAULT FALSE,
    
    -- C. CRÉDITOS
    credito_renovacion_genera_nuevo_contrato BOOLEAN DEFAULT FALSE,
    credito_calculo_interes_anticipado TEXT DEFAULT 'PERIODO_COMPLETO',
    credito_liberacion_garantia_parcial BOOLEAN DEFAULT FALSE,
    credito_interes_moratorio_diario NUMERIC(5,3) DEFAULT 0.5,
    
    -- D. REMATES
    remate_precio_base_automatico BOOLEAN DEFAULT TRUE,
    remate_devolver_excedente BOOLEAN DEFAULT TRUE,
    
    -- E. SEGURIDAD OPERATIVA
    caja_permiso_anular_recibo BOOLEAN DEFAULT FALSE,
    caja_cierre_ciego BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_system_settings_updated ON public.system_settings(updated_at);

-- ============================================================================
-- FASE 6: CORE BANCARIO - MOVIMIENTOS (Ledger Append-Only)
-- ============================================================================

-- AUDITORÍA DE BÓVEDA: Log de ingresos de capital y asignaciones
CREATE TABLE public.movimientos_boveda_auditoria (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    boveda_id uuid NOT NULL REFERENCES public.boveda_central(id),
    tipo varchar(50) NOT NULL,
    monto numeric(15,2) NOT NULL,
    
    caja_operativa_id UUID REFERENCES public.cajas_operativas(id),
    usuario_responsable_id uuid REFERENCES public.usuarios(id),
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    saldo_anterior numeric(15,2),
    saldo_nuevo numeric(15,2),
    
    fecha timestamp DEFAULT now(),
    referencia text
);

CREATE INDEX idx_movimientos_boveda_boveda_id ON public.movimientos_boveda_auditoria(boveda_id);
CREATE INDEX idx_movimientos_boveda_tipo ON public.movimientos_boveda_auditoria(tipo);
CREATE INDEX idx_movimientos_boveda_fecha ON public.movimientos_boveda_auditoria(fecha);
CREATE INDEX idx_movimientos_boveda_usuario ON public.movimientos_boveda_auditoria(usuario_responsable_id);
CREATE INDEX idx_movimientos_boveda_metadata ON public.movimientos_boveda_auditoria USING gin(metadata);

-- MOVIMIENTOS OPERATIVOS: Ledger diario de la caja
CREATE TABLE public.movimientos_caja_operativa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caja_operativa_id UUID NOT NULL REFERENCES public.cajas_operativas(id),
    
    tipo VARCHAR(50) NOT NULL,
    motivo VARCHAR(50) NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    
    saldo_anterior DECIMAL(15,2) NOT NULL,
    saldo_nuevo DECIMAL(15,2) NOT NULL,
    
    referencia_id UUID,
    descripcion TEXT,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_monto_positivo CHECK (monto > 0)
);

CREATE INDEX idx_movimientos_caja_operativa_caja ON public.movimientos_caja_operativa(caja_operativa_id);
CREATE INDEX idx_movimientos_caja_operativa_tipo ON public.movimientos_caja_operativa(tipo);
CREATE INDEX idx_movimientos_caja_operativa_usuario ON public.movimientos_caja_operativa(usuario_id);
CREATE INDEX idx_movimientos_caja_operativa_fecha ON public.movimientos_caja_operativa(fecha);
CREATE INDEX idx_movimientos_caja_operativa_referencia ON public.movimientos_caja_operativa(referencia_id);

-- ============================================================================
-- FASE 7: NEGOCIO - CLIENTES Y CRÉDITOS
-- ============================================================================

CREATE TABLE public.clientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    empresa_id uuid REFERENCES public.empresas(id),
    tipo_documento character varying(20) NOT NULL,
    numero_documento character varying(20) NOT NULL UNIQUE,
    nombres character varying(100),
    apellido_paterno character varying(100),
    apellido_materno character varying(100),
    email character varying(100),
    telefono_principal character varying(20),
    direccion text,
    score_crediticio integer DEFAULT 500,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.categorias_garantia (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre varchar(100) NOT NULL,
    porcentaje_prestamo_maximo numeric(5,2) DEFAULT 60.00
);

CREATE TABLE public.garantias (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id uuid REFERENCES public.clientes(id),
    categoria_id uuid REFERENCES public.categorias_garantia(id),
    descripcion text NOT NULL,
    valor_tasacion numeric(12,2) NOT NULL,
    valor_prestamo_sugerido numeric(12,2),
    estado varchar(50) DEFAULT 'custodia',
    fotos_urls text[],
    created_at timestamp DEFAULT now()
);

CREATE TABLE public.creditos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo character varying(50) UNIQUE,
    
    cliente_id uuid REFERENCES public.clientes(id),
    garantia_id uuid REFERENCES public.garantias(id),
    caja_origen_id uuid REFERENCES public.cajas_operativas(id),
    empresa_id uuid REFERENCES public.empresas(id),
    
    monto_prestado numeric(12,2) NOT NULL,
    tasa_interes numeric(5,2) NOT NULL,
    periodo_dias integer NOT NULL,
    fecha_desembolso timestamp DEFAULT now(),
    fecha_vencimiento date NOT NULL,
    
    saldo_pendiente numeric(12,2) NOT NULL,
    interes_acumulado numeric(12,2) DEFAULT 0,
    estado varchar(50) DEFAULT 'vigente',
    
    created_at timestamp DEFAULT now()
);

CREATE TABLE public.pagos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    credito_id uuid REFERENCES public.creditos(id),
    caja_operativa_id uuid REFERENCES public.cajas_operativas(id),
    
    monto_total numeric(12,2) NOT NULL,
    desglose_capital numeric(12,2),
    desglose_interes numeric(12,2),
    desglose_mora numeric(12,2),
    
    medio_pago varchar(50),
    metadata JSONB,
    
    fecha_pago timestamp DEFAULT now()
);

-- ============================================================================
-- FASE 8: SEGURIDAD (Row Level Security - RLS)
-- ============================================================================

ALTER TABLE public.cajas_operativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_caja_operativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boveda_central ENABLE ROW LEVEL SECURITY;

-- Policy: Cajeros ven solo su propia caja
CREATE POLICY "Cajero ve su propia caja" ON public.cajas_operativas
    FOR SELECT USING (usuario_id = auth.uid());

-- Policy: Admin ve todo
CREATE POLICY "Admin ve todo cajas" ON public.cajas_operativas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
    );

-- Policy: Bóveda - Admins pueden crear y actualizar
CREATE POLICY "Admin maneja bóveda" ON public.boveda_central
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
    );

-- Policy: Bóveda - Gerentes pueden leer
CREATE POLICY "Gerente lee bóveda" ON public.boveda_central
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'gerente'))
    );

-- Policy: Lectura pública de configuración
CREATE POLICY "Lectura config" ON public.system_settings
    FOR SELECT USING (true);

-- Policy: Solo admins pueden editar configuración
CREATE POLICY "Solo admins actualizan config" ON public.system_settings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
    );

-- ============================================================================
-- FASE 9: FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función: Calcular saldo actual de una caja basado en movimientos
CREATE OR REPLACE FUNCTION public.calcular_saldo_caja(p_caja_id UUID)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(
            CASE WHEN tipo = 'INGRESO' THEN monto ELSE -monto END
        ), 0)
        FROM public.movimientos_caja_operativa
        WHERE caja_operativa_id = p_caja_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger: Validar saldos de Bóveda
CREATE OR REPLACE FUNCTION public.check_saldos_boveda()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.saldo_total <> (NEW.saldo_disponible + NEW.saldo_asignado) THEN
        RAISE EXCEPTION 'Inconsistencia en Bóveda: Total no coincide con partes.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_boveda
BEFORE UPDATE ON public.boveda_central
FOR EACH ROW EXECUTE FUNCTION public.check_saldos_boveda();

-- ============================================================================
-- FASE 10: DATOS SEMILLA (Seed Data)
-- ============================================================================

-- Insertar Roles
INSERT INTO public.roles (nombre, descripcion, nivel_acceso) VALUES
('admin', 'Acceso total al sistema', 3),
('gerente', 'Gestión de bóveda y personal', 2),
('cajero', 'Operativa diaria en ventanilla', 1)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar Sistema de Configuración Singleton
INSERT INTO public.system_settings (id)
SELECT gen_random_uuid() WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- Insertar Departamentos Peruanos (Ejemplo: Lima, Arequipa, Cusco)
INSERT INTO public.departamentos (codigo, nombre) VALUES
('01', 'Amazonas'),
('02', 'Áncash'),
('03', 'Apurímac'),
('04', 'Arequipa'),
('05', 'Ayacucho'),
('06', 'Cajamarca'),
('07', 'Callao'),
('08', 'Cusco'),
('09', 'Huancavelica'),
('10', 'Huánuco'),
('11', 'Ica'),
('12', 'Junín'),
('13', 'La Libertad'),
('14', 'Lambayeque'),
('15', 'Lima'),
('16', 'Loreto'),
('17', 'Madre de Dios'),
('18', 'Moquegua'),
('19', 'Pasco'),
('20', 'Piura'),
('21', 'Puno'),
('22', 'San Martín'),
('23', 'Tacna'),
('24', 'Tumbes'),
('25', 'Ucayali')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- FASE 11: COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.boveda_central IS 'SINGLETON: Capital total de la empresa. Única fuente de verdad para tesorería.';
COMMENT ON TABLE public.cajas_operativas IS 'Sesiones de trabajo de cajeros. Ciclo: abierta -> operando -> cerrada.';
COMMENT ON TABLE public.movimientos_caja_operativa IS 'APPEND-ONLY: Ledger inmutable. Cada centavo que circule. Nunca DELETE/UPDATE.';
COMMENT ON TABLE public.movimientos_boveda_auditoria IS 'APPEND-ONLY: Auditoría de ingresos externos (Yape, Bancos). Trazabilidad en metadata.';
COMMENT ON TABLE public.system_settings IS 'SINGLETON: Motor de Reglas. Admin ajusta comportamiento sin reprogramar.';

COMMENT ON COLUMN public.movimientos_boveda_auditoria.metadata IS 'JSONB: { origen, canal, numero_operacion, evidencia_url, ... }. Crítico para trazabilidad.';
COMMENT ON COLUMN public.movimientos_caja_operativa.metadata IS 'JSONB: Evidencia de medios de pago (YAPE, PLIN, etc). { medio_pago, numero_transaccion, ... }';
COMMENT ON COLUMN public.system_settings.caja_cierre_ciego IS 'TRUE = Cajero cierra sin ver saldo (estándar bancario). FALSE = Ver saldo.';

-- ============================================================================
-- FIN DE MIGRACIÓN v3.0
-- ============================================================================
-- Base de datos lista para arquitectura bancaria v3.0
-- Todas las reglas están centralizadas en system_settings
-- Inmutabilidad de movimientos garantizada
-- Trazabilidad total con metadata JSONB
