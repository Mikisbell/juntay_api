


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."actualizar_estado_credito"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_dias_hasta_vencimiento INT;
    v_dias_vencido INT;
    v_nuevo_estado VARCHAR(30);
BEGIN
    -- Solo actualizar si el estado no es terminal
    IF NEW.estado_detallado IN ('cancelado', 'renovado', 'ejecutado', 'anulado') THEN
        RETURN NEW;
    END IF;

    -- Calcular días hasta vencimiento
    v_dias_hasta_vencimiento := NEW.fecha_vencimiento - CURRENT_DATE;
    
    -- Calcular días vencido (solo si ya venció)
    IF CURRENT_DATE > NEW.fecha_vencimiento THEN
        v_dias_vencido := CURRENT_DATE - NEW.fecha_vencimiento;
    ELSE
        v_dias_vencido := 0;
    END IF;

    -- Determinar estado según días
    IF v_dias_vencido > 60 THEN
        v_nuevo_estado := 'pre_remate';
    ELSIF v_dias_vencido > 30 THEN
        v_nuevo_estado := 'en_gracia';
    ELSIF v_dias_vencido > 15 THEN
        v_nuevo_estado := 'en_mora';
    ELSIF v_dias_vencido > 0 THEN
        v_nuevo_estado := 'vencido';
    ELSIF v_dias_hasta_vencimiento <= 7 AND v_dias_hasta_vencimiento > 0 THEN
        v_nuevo_estado := 'por_vencer';
    ELSE
        -- Si saldo_pendiente = 0, está cancelado
        IF NEW.saldo_pendiente = 0 THEN
            v_nuevo_estado := 'cancelado';
        ELSE
            v_nuevo_estado := 'vigente';
        END IF;
    END IF;

    NEW.estado_detallado := v_nuevo_estado;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."actualizar_estado_credito"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."actualizar_estado_credito"() IS 'Calcula automáticamente el estado_detallado basándose en fecha_vencimiento y saldo_pendiente.';



CREATE OR REPLACE FUNCTION "public"."actualizar_interes_devengado"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_dias INT;
    v_interes NUMERIC;
BEGIN
    -- Calcular días transcurridos
    v_dias := CURRENT_DATE - NEW.fecha_desembolso::date;
    
    -- Asegurar que no sea negativo
    IF v_dias < 0 THEN
        v_dias := 0;
    END IF;
    
    -- Calcular interés devengado
    IF v_dias > 0 AND NEW.monto_prestado > 0 THEN
        v_interes := ROUND(
            NEW.monto_prestado * (NEW.tasa_interes / 100.0) * (v_dias / 30.0),
            2
        );
    ELSE
        v_interes := 0.00;
    END IF;
    
    -- Actualizar valores
    NEW.dias_transcurridos := v_dias;
    NEW.interes_devengado_actual := v_interes;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."actualizar_interes_devengado"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_asignar_caja"("p_usuario_cajero_id" "uuid", "p_monto" numeric, "p_observacion" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_boveda_id UUID;
    v_caja_id UUID;
    v_saldo_disponible DECIMAL;
    v_saldo_anterior_caja DECIMAL;
BEGIN
    -- 1. Validar Fondos en Bóveda
    SELECT id, saldo_disponible INTO v_boveda_id, v_saldo_disponible 
    FROM public.boveda_central LIMIT 1;

    IF v_saldo_disponible < p_monto THEN
        RAISE EXCEPTION 'Fondos insuficientes en Bóveda Central. Disponible: S/ %, Requerido: S/ %', v_saldo_disponible, p_monto;
    END IF;

    -- 2. Buscar si el cajero ya tiene caja abierta
    SELECT id, saldo_actual INTO v_caja_id, v_saldo_anterior_caja 
    FROM public.cajas_operativas
    WHERE usuario_id = p_usuario_cajero_id AND estado = 'abierta';

    -- 3. Asegurar que saldo_anterior_caja no sea NULL
    v_saldo_anterior_caja := COALESCE(v_saldo_anterior_caja, 0);

    -- 4. Lógica: Abrir nueva o Recargar existente
    IF v_caja_id IS NULL THEN
        -- ABRIR NUEVA CAJA
        INSERT INTO public.cajas_operativas (
            usuario_id, boveda_origen_id, numero_caja, estado,
            saldo_inicial, saldo_actual, fecha_apertura
        ) VALUES (
            p_usuario_cajero_id, v_boveda_id, 
            (SELECT COALESCE(MAX(numero_caja), 0) + 1 FROM public.cajas_operativas),
            'abierta',
            p_monto, p_monto, NOW()
        ) RETURNING id INTO v_caja_id;
    ELSE
        -- RECARGAR (Reposición)
        UPDATE public.cajas_operativas
        SET saldo_actual = saldo_actual + p_monto
        WHERE id = v_caja_id;
    END IF;

    -- 5. Mover dinero de Bóveda (Atomicidad)
    UPDATE public.boveda_central
    SET 
        saldo_disponible = saldo_disponible - p_monto,
        saldo_asignado = saldo_asignado + p_monto
    WHERE id = v_boveda_id;

    -- 6. Registrar Auditoría Bóveda
    INSERT INTO public.movimientos_boveda_auditoria (
        boveda_id, caja_operativa_id, tipo, monto, referencia, usuario_responsable_id
    ) VALUES (
        v_boveda_id, v_caja_id, 'ASIGNACION_CAJA', p_monto, 
        'Asignación a cajero: ' || p_observacion, auth.uid()
    );

    -- 7. Registrar Ingreso en Ledger de Caja (CON usuario_id)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, 
        tipo, 
        motivo, 
        monto, 
        saldo_anterior, 
        saldo_nuevo, 
        descripcion,
        usuario_id  -- ← AGREGADO
    ) VALUES (
        v_caja_id, 
        'INGRESO', 
        'ASIGNACION_BOVEDA', 
        p_monto,
        v_saldo_anterior_caja, 
        v_saldo_anterior_caja + p_monto,
        'Fondos iniciales/reposición desde Bóveda: ' || p_observacion,
        p_usuario_cajero_id  -- ← AGREGADO
    );

    RETURN v_caja_id;
END;
$$;


ALTER FUNCTION "public"."admin_asignar_caja"("p_usuario_cajero_id" "uuid", "p_monto" numeric, "p_observacion" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_inyectar_capital"("p_monto" numeric, "p_origen" "text", "p_referencia" "text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_boveda_id UUID;
    v_movimiento_id UUID;
    v_saldo_anterior DECIMAL;
BEGIN
    -- 1. Obtener la Bóveda (Singleton)
    SELECT id, saldo_total INTO v_boveda_id, v_saldo_anterior 
    FROM public.boveda_central LIMIT 1;
    
    IF v_boveda_id IS NULL THEN
        RAISE EXCEPTION 'No existe una bóveda central inicializada.';
    END IF;

    -- 2. Actualizar Saldos Bóveda
    UPDATE public.boveda_central
    SET 
        saldo_total = saldo_total + p_monto,
        saldo_disponible = saldo_disponible + p_monto,
        fecha_actualizacion = NOW()
    WHERE id = v_boveda_id;

    -- 3. Registrar Auditoría
    INSERT INTO public.movimientos_boveda_auditoria (
        boveda_id, tipo, monto, 
        saldo_anterior, saldo_nuevo,
        referencia, metadata, usuario_responsable_id
    ) VALUES (
        v_boveda_id, 'INYECCION_CAPITAL', p_monto,
        v_saldo_anterior, v_saldo_anterior + p_monto,
        p_referencia || ' (' || p_origen || ')', 
        p_metadata,
        auth.uid()
    ) RETURNING id INTO v_movimiento_id;

    RETURN v_movimiento_id;
END;
$$;


ALTER FUNCTION "public"."admin_inyectar_capital"("p_monto" numeric, "p_origen" "text", "p_referencia" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."anular_pago"("p_pago_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("success" boolean, "mensaje" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_pago RECORD;
    v_credito RECORD;
BEGIN
    -- 1. Obtener pago
    SELECT * INTO v_pago FROM public.pagos WHERE id = p_pago_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Pago no encontrado'::TEXT;
        RETURN;
    END IF;
    
    IF v_pago.anulado THEN
        RETURN QUERY SELECT FALSE, 'Este pago ya fue anulado'::TEXT;
        RETURN;
    END IF;
    
    -- 2. Marcar pago como anulado
    UPDATE public.pagos
    SET 
        anulado = TRUE,
        motivo_anulacion = p_motivo,
        anulado_por = p_usuario_id,
        anulado_at = NOW()
    WHERE id = p_pago_id;
    
    -- 3. Revertir efecto en crédito (si aplica)
    IF v_pago.credito_id IS NOT NULL THEN
        UPDATE public.creditos
        SET 
            saldo_pendiente = saldo_pendiente + COALESCE(v_pago.desglose_capital, 0),
            interes_acumulado = interes_acumulado + COALESCE(v_pago.desglose_interes, 0)
        WHERE id = v_pago.credito_id;
    END IF;
    
    -- 4. Registrar en auditoría
    INSERT INTO public.audit_log (
        tabla, registro_id, accion, usuario_id,
        datos_anteriores, datos_nuevos, metadata
    ) VALUES (
        'pagos', p_pago_id, 'ANULACION', p_usuario_id,
        to_jsonb(v_pago),
        jsonb_build_object('anulado', TRUE, 'motivo', p_motivo),
        jsonb_build_object('saldo_revertido', COALESCE(v_pago.desglose_capital, 0))
    );
    
    RETURN QUERY SELECT TRUE, 'Pago anulado y saldo de crédito restaurado'::TEXT;
END;
$$;


ALTER FUNCTION "public"."anular_pago"("p_pago_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."anular_pago"("p_pago_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") IS 'Marca pago como anulado y revierte efecto en crédito. Historial preservado.';



CREATE OR REPLACE FUNCTION "public"."audit_trigger_function"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_usuario_id UUID;
    v_empleado_id UUID;
BEGIN
    -- Intentar obtener el usuario actual de Supabase
    BEGIN
        v_usuario_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;
    
    -- Si hay usuario, intentar obtener su empleado vinculado
    IF v_usuario_id IS NOT NULL THEN
        SELECT id INTO v_empleado_id 
        FROM public.empleados 
        WHERE user_id = v_usuario_id;
    END IF;
    
    -- Insertar registro de auditoría
    INSERT INTO public.auditoria_transacciones (
        tabla_afectada,
        registro_id,
        accion,
        usuario_id,
        empleado_id,
        datos_antes,
        datos_despues,
        ip_address
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        v_usuario_id,
        v_empleado_id,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
        inet_client_addr() -- IP del cliente
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."audit_trigger_function"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."audit_trigger_function"() IS 'Trigger automático que captura cambios en tablas críticas';



CREATE OR REPLACE FUNCTION "public"."buscar_clientes_con_creditos"("p_search_term" "text", "p_is_dni" boolean DEFAULT false, "p_limit" integer DEFAULT 15) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(t), '[]'::json)
        FROM (
            SELECT 
                c.id,
                c.nombres,
                c.apellido_paterno,
                c.apellido_materno,
                c.numero_documento,
                COUNT(cr.id) FILTER (WHERE cr.estado IN ('vigente', 'pendiente')) AS contratos_vigentes
            FROM public.clientes c
            LEFT JOIN public.creditos cr ON cr.cliente_id = c.id
            WHERE 
                CASE 
                    WHEN p_is_dni THEN 
                        c.numero_documento ILIKE '%' || p_search_term || '%'
                    ELSE 
                        c.nombres ILIKE '%' || p_search_term || '%'
                        OR c.apellido_paterno ILIKE '%' || p_search_term || '%'
                        OR c.apellido_materno ILIKE '%' || p_search_term || '%'
                END
            GROUP BY c.id, c.nombres, c.apellido_paterno, c.apellido_materno, c.numero_documento
            ORDER BY contratos_vigentes DESC, c.nombres ASC
            LIMIT p_limit
        ) t
    );
END;
$$;


ALTER FUNCTION "public"."buscar_clientes_con_creditos"("p_search_term" "text", "p_is_dni" boolean, "p_limit" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."buscar_clientes_con_creditos"("p_search_term" "text", "p_is_dni" boolean, "p_limit" integer) IS 'Búsqueda optimizada de clientes con conteo de créditos vigentes. Reparación para garantizar su existencia.';



CREATE OR REPLACE FUNCTION "public"."calcular_interes_actual"("p_credito_id" "uuid", "p_fecha_calculo" "date" DEFAULT CURRENT_DATE) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_monto NUMERIC;
    v_tasa NUMERIC;
    v_fecha_inicio DATE;
    v_dias INT;
    v_interes NUMERIC;
BEGIN
    -- Obtener datos del crédito
    SELECT 
        monto_prestado,
        tasa_interes,
        fecha_desembolso::

date
    INTO v_monto, v_tasa, v_fecha_inicio
    FROM public.creditos
    WHERE id = p_credito_id;
    
    IF v_monto IS NULL THEN
        RAISE EXCEPTION 'Crédito no encontrado: %', p_credito_id;
    END IF;
    
    -- Calcular días transcurridos
    v_dias := p_fecha_calculo - v_fecha_inicio;
    
    -- Si es negativo o cero, no hay interés
    IF v_dias <= 0 THEN
        RETURN 0.00;
    END IF;
    
    -- Calcular interés simple
    -- Fórmula: Capital × (Tasa/100) × (Días/30)
    v_interes := ROUND(
        v_monto * (v_tasa / 100.0) * (v_dias / 30.0),
        2
    );
    
    RETURN v_interes;
END;
$$;


ALTER FUNCTION "public"."calcular_interes_actual"("p_credito_id" "uuid", "p_fecha_calculo" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calcular_interes_actual"("p_credito_id" "uuid", "p_fecha_calculo" "date") IS 'Calcula el interés devengado para un crédito en una fecha específica';



CREATE OR REPLACE FUNCTION "public"."calcular_saldo_caja"("p_caja_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_saldo DECIMAL;
BEGIN
    -- Obtener el saldo actual directamente de la caja
    SELECT saldo_actual INTO v_saldo
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    RETURN COALESCE(v_saldo, 0);
END;
$$;


ALTER FUNCTION "public"."calcular_saldo_caja"("p_caja_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cerrar_caja_oficial"("p_caja_id" "uuid", "p_monto_fisico" numeric, "p_observaciones" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_saldo_sistema DECIMAL;
    v_diferencia DECIMAL;
    v_estado_cierre TEXT;
    v_caja RECORD;
BEGIN
    -- 1. OBTENER DATOS DE LA CAJA
    SELECT * INTO v_caja
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caja no encontrada';
    END IF;
    
    IF v_caja.estado != 'abierta' THEN
        RAISE EXCEPTION 'La caja ya está cerrada';
    END IF;

    -- 2. CALCULAR SALDO TEÓRICO (La verdad del sistema)
    v_saldo_sistema := public.calcular_saldo_caja(p_caja_id);

    -- 3. CALCULAR DIFERENCIA (Sobrante o Faltante)
    v_diferencia := p_monto_fisico - v_saldo_sistema;

    -- 4. DETERMINAR ESTADO DEL CIERRE
    IF ABS(v_diferencia) < 0.01 THEN  -- Tolerancia de 1 centavo
        v_estado_cierre := 'PERFECTO';
    ELSIF v_diferencia > 0 THEN
        v_estado_cierre := 'SOBRANTE';
    ELSE
        v_estado_cierre := 'FALTANTE';
    END IF;

    -- 5. CERRAR LA CAJA
    UPDATE public.cajas_operativas
    SET 
        estado = 'cerrada',
        fecha_cierre = NOW(),
        saldo_final_cierre = p_monto_fisico,
        diferencia_cierre = v_diferencia,
        observaciones_cierre = p_observaciones
    WHERE id = p_caja_id;

    -- 6. REGISTRAR EL MOVIMIENTO DE CIERRE
    -- 6. REGISTRAR EL MOVIMIENTO DE CIERRE
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto, 
        saldo_anterior, saldo_nuevo,
        descripcion, metadata,
        usuario_id  -- <--- CORRECCIÓN: Campo obligatorio
    ) VALUES (
        p_caja_id, 'INFO', 'CIERRE_CAJA', 0.01, -- Fix monto > 0 constraint (simbólico) o ajustar constraint
        v_saldo_sistema, 0, -- Saldo nuevo es 0 tras cierre
        'Cierre de caja. Estado: ' || v_estado_cierre || '. Diferencia: ' || v_diferencia,
        jsonb_build_object(
            'estado', v_estado_cierre,
            'diferencia', v_diferencia,
            'monto_fisico', p_monto_fisico,
            'saldo_sistema', v_saldo_sistema,
            'observaciones', p_observaciones
        ),
        v_caja.usuario_id -- <--- CORRECCIÓN: Valor del usuario
    );

    -- 7. RETORNAR REPORTE
    RETURN jsonb_build_object(
        'saldo_sistema', v_saldo_sistema,
        'saldo_fisico', p_monto_fisico,
        'diferencia', v_diferencia,
        'estado', v_estado_cierre,
        'fecha_cierre', NOW()
    );
END;
$$;


ALTER FUNCTION "public"."cerrar_caja_oficial"("p_caja_id" "uuid", "p_monto_fisico" numeric, "p_observaciones" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_saldos_boveda"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.saldo_total <> (NEW.saldo_disponible + NEW.saldo_asignado) THEN
        RAISE EXCEPTION 'Inconsistencia en Bóveda: Total no coincide con partes.';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_saldos_boveda"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."conciliar_caja_dia"("p_fecha" "date") RETURNS TABLE("cuadra" boolean, "diferencia" numeric, "saldo_esperado" numeric, "saldo_real" numeric, "detalle" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_prestamos_total NUMERIC DEFAULT 0;
    v_pagos_total NUMERIC DEFAULT 0;
    v_saldo_inicial NUMERIC DEFAULT 0;
    v_saldo_final_esperado NUMERIC;
    v_saldo_final_real NUMERIC DEFAULT 0;
    v_diferencia NUMERIC;
BEGIN
    -- 1. Obtener saldo inicial (cierre del día anterior)
    SELECT COALESCE(saldo_final_efectivo, 0) INTO v_saldo_inicial
    FROM cajas
    WHERE DATE(fecha_cierre) = p_fecha - 1
      AND estado = 'cerrada'
    ORDER BY fecha_cierre DESC
    LIMIT 1;
    
    -- 2. Sumar préstamos del día (egresos)
    SELECT COALESCE(SUM(monto_prestado), 0) INTO v_prestamos_total
    FROM creditos
    WHERE DATE(fecha_desembolso) = p_fecha;
    
    -- 3. Sumar pagos del día (ingresos)
    SELECT COALESCE(SUM(monto), 0) INTO v_pagos_total
    FROM pagos
    WHERE DATE(fecha_pago) = p_fecha
      AND estado = 'completado';
    
    -- 4. Calcular saldo esperado al final del día
    v_saldo_final_esperado := v_saldo_inicial - v_prestamos_total + v_pagos_total;
    
    -- 5. Obtener saldo real reportado por cajero
    SELECT COALESCE(saldo_final_efectivo, 0) INTO v_saldo_final_real
    FROM cajas
    WHERE DATE(fecha_cierre) = p_fecha
      AND estado = 'cerrada'
    ORDER BY fecha_cierre DESC
    LIMIT 1;
    
    -- 6. Calcular diferencia
    v_diferencia := v_saldo_final_real - v_saldo_final_esperado;
    
    -- 7. Retornar resultado
    RETURN QUERY SELECT 
        ABS(v_diferencia) < 0.01 as cuadra,
        v_diferencia as diferencia,
        v_saldo_final_esperado as saldo_esperado,
        v_saldo_final_real as saldo_real,
        jsonb_build_object(
            'saldo_inicial', v_saldo_inicial,
            'prestamos', v_prestamos_total,
            'pagos', v_pagos_total,
            'fecha', p_fecha
        ) as detalle;
END;
$$;


ALTER FUNCTION "public"."conciliar_caja_dia"("p_fecha" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."conciliar_caja_dia"("p_fecha" "date") IS 'Concilia la caja del día comparando saldo esperado vs real';



CREATE OR REPLACE FUNCTION "public"."crear_contrato_oficial"("p_caja_id" "uuid", "p_cliente_doc_tipo" "text", "p_cliente_doc_num" "text", "p_cliente_nombre" "text", "p_garantia_data" "jsonb", "p_contrato_data" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_cliente_id UUID;
    v_garantia_id UUID;
    v_contrato_id UUID;
    v_saldo_caja DECIMAL;
    v_monto_prestamo DECIMAL;
    v_usuario_id UUID;
    v_empresa_id UUID; -- ✅ NUEVO: Variable para empresa_id
BEGIN
    -- 1. VALIDACIÓN PREVIA + Obtener usuario/empresa de la caja
    v_monto_prestamo := (p_contrato_data->>'monto')::DECIMAL;
    
    -- Obtener el usuario_id de la caja operativa
    SELECT usuario_id INTO v_usuario_id
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Caja no encontrada o sin usuario asignado: %', p_caja_id;
    END IF;

    -- ✅ Obtener empresa_id del usuario
    SELECT empresa_id INTO v_empresa_id
    FROM public.usuarios
    WHERE id = v_usuario_id;
    
    -- 2. GESTIÓN DE CLIENTE (Buscar o Crear)
    SELECT id INTO v_cliente_id 
    FROM public.clientes 
    WHERE numero_documento = p_cliente_doc_num;

    IF v_cliente_id IS NULL THEN
        INSERT INTO public.clientes (
            tipo_documento, numero_documento, nombres, 
            empresa_id
        ) VALUES (
            p_cliente_doc_tipo, p_cliente_doc_num, p_cliente_nombre, 
            v_empresa_id -- Usar variable ya obtenida
        ) RETURNING id INTO v_cliente_id;
    END IF;

    -- 3. CREAR GARANTÍA
    INSERT INTO public.garantias (
        cliente_id,
        descripcion,
        valor_tasacion,
        estado,
        categoria_id,
        fotos_urls,
        marca,
        modelo,
        serie,
        subcategoria,
        estado_bien
    ) VALUES (
        v_cliente_id,
        p_garantia_data->>'descripcion',
        (p_garantia_data->>'valor_tasacion')::DECIMAL,
        'custodia',
        NULL,
        (SELECT ARRAY(SELECT jsonb_array_elements_text(p_garantia_data->'fotos'))),
        p_garantia_data->>'marca',
        p_garantia_data->>'modelo',
        p_garantia_data->>'serie',
        p_garantia_data->>'subcategoria',
        COALESCE(p_garantia_data->>'estado_bien', p_garantia_data->>'estado', 'BUENO')
    ) RETURNING id INTO v_garantia_id;

    -- 4. CREAR CONTRATO (✅ AHORA CON empresa_id)
    INSERT INTO public.creditos (
        codigo,
        cliente_id,
        garantia_id,
        caja_origen_id,
        monto_prestado,
        tasa_interes,
        periodo_dias,
        fecha_vencimiento,
        saldo_pendiente,
        estado,
        estado_detallado,
        empresa_id -- ✅ Campo nuevo insertado
    ) VALUES (
        'CON-' || substr(md5(random()::text), 1, 6),
        v_cliente_id,
        v_garantia_id,
        p_caja_id,
        v_monto_prestamo,
        (p_contrato_data->>'interes')::DECIMAL,
        (p_contrato_data->>'dias')::INT,
        (p_contrato_data->>'fecha_venc')::DATE,
        v_monto_prestamo,
        'vigente',
        'vigente',
        v_empresa_id -- ✅ Valor insertado
    ) RETURNING id INTO v_contrato_id;

    -- 5. MOVER EL DINERO (El Ledger)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id,
        tipo,
        motivo,
        monto,
        saldo_anterior,
        saldo_nuevo,
        referencia_id,
        descripcion,
        usuario_id
    ) VALUES (
        p_caja_id,
        'EGRESO',
        'PRESTAMO',
        v_monto_prestamo,
        0,
        0 - v_monto_prestamo,
        v_contrato_id,
        'Desembolso contrato para ' || p_cliente_nombre,
        v_usuario_id
    );

    RETURN v_contrato_id;
END;
$$;


ALTER FUNCTION "public"."crear_contrato_oficial"("p_caja_id" "uuid", "p_cliente_doc_tipo" "text", "p_cliente_doc_num" "text", "p_cliente_nombre" "text", "p_garantia_data" "jsonb", "p_contrato_data" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."crear_contrato_oficial"("p_caja_id" "uuid", "p_cliente_doc_tipo" "text", "p_cliente_doc_num" "text", "p_cliente_nombre" "text", "p_garantia_data" "jsonb", "p_contrato_data" "jsonb") IS 'Versión 3.1: Actualizada para incluir campos detallados de garantías (marca, modelo, serie, subcategoria, estado_bien)';



CREATE OR REPLACE FUNCTION "public"."crear_credito_completo"("p_cliente_id" "uuid", "p_monto_prestamo" numeric, "p_valor_tasacion" numeric, "p_tasa_interes" numeric, "p_periodo_dias" integer, "p_fecha_inicio" timestamp with time zone, "p_descripcion_garantia" "text", "p_fotos" "text"[], "p_observaciones" "text" DEFAULT NULL::"text", "p_usuario_id" "uuid" DEFAULT NULL::"uuid", "p_caja_id" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_credito_id UUID;
    v_garantia_id UUID;
    v_codigo_credito TEXT;
    v_interes NUMERIC;
    v_total_pagar NUMERIC;
    v_fecha_vencimiento TIMESTAMPTZ;
    v_saldo_caja NUMERIC;
    v_es_desembolso_inmediato BOOLEAN;
BEGIN
    -- ========================================
    -- VALIDACIONES
    -- ========================================
    
    -- 1. Monto mínimo y máximo (ACTUALIZADO: S/10)
    IF p_monto_prestamo < 10 THEN
        RAISE EXCEPTION 'El monto mínimo de préstamo es S/10';
    END IF;
    
    IF p_monto_prestamo > 50000 THEN
        RAISE EXCEPTION 'El monto máximo de préstamo es S/50,000. Contacte a gerencia.';
    END IF;
    
    -- 3. Tasa de interés válida
    IF p_tasa_interes < 1 OR p_tasa_interes > 50 THEN
        RAISE EXCEPTION 'La tasa de interés debe estar entre 1%% y 50%%';
    END IF;
    
    -- 4. Verificar que el cliente exista
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_cliente_id) THEN
        RAISE EXCEPTION 'El cliente no existe';
    END IF;
    
    -- ========================================
    -- CÁLCULOS
    -- ========================================
    v_interes := p_monto_prestamo * (p_tasa_interes / 100);
    v_total_pagar := p_monto_prestamo + v_interes;
    v_fecha_vencimiento := p_fecha_inicio + (p_periodo_dias || ' days')::INTERVAL;
    
    -- Generar código único
    v_codigo_credito := 'JT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Verificar caja si se proporciona
    v_es_desembolso_inmediato := FALSE;
    IF p_caja_id IS NOT NULL THEN
        SELECT saldo_actual INTO v_saldo_caja
        FROM cajas_operativas
        WHERE id = p_caja_id AND estado = 'abierta';
        
        IF FOUND AND v_saldo_caja >= p_monto_prestamo THEN
            v_es_desembolso_inmediato := TRUE;
        END IF;
    END IF;
    
    -- ========================================
    -- INSERT CRÉDITO
    -- ========================================
    INSERT INTO creditos (
        cliente_id,
        codigo,           -- FIX: Added this column
        codigo_credito,
        monto_prestado,
        tasa_interes,
        interes_acumulado,
        saldo_pendiente,
        fecha_inicio,
        fecha_vencimiento,
        fecha_desembolso,
        periodo_dias,
        estado,
        estado_detallado,
        observaciones
    ) VALUES (
        p_cliente_id,
        v_codigo_credito, -- FIX: Value for codigo
        v_codigo_credito,
        p_monto_prestamo,
        p_tasa_interes,
        v_interes,
        v_total_pagar,
        p_fecha_inicio,
        v_fecha_vencimiento,
        CASE WHEN v_es_desembolso_inmediato THEN p_fecha_inicio ELSE NULL END,
        p_periodo_dias,
        CASE WHEN v_es_desembolso_inmediato THEN 'vigente' ELSE 'pendiente' END,
        CASE WHEN v_es_desembolso_inmediato THEN 'vigente' ELSE 'aprobado' END,
        p_observaciones
    )
    RETURNING id INTO v_credito_id;
    
    -- ========================================
    -- INSERT GARANTÍA
    -- ========================================
    INSERT INTO garantias (
        credito_id,
        descripcion,
        valor_tasacion,
        estado,
        fotos
    ) VALUES (
        v_credito_id,
        p_descripcion_garantia,
        p_valor_tasacion,
        'custodia_caja',
        p_fotos
    )
    RETURNING id INTO v_garantia_id;
    
    -- Actualizar crédito con referencia a garantía
    UPDATE creditos SET garantia_id = v_garantia_id WHERE id = v_credito_id;
    
    -- ========================================
    -- MOVIMIENTO DE CAJA (si aplica)
    -- ========================================
    IF v_es_desembolso_inmediato THEN
        INSERT INTO movimientos_caja_operativa (
            caja_operativa_id,
            tipo,
            motivo,
            monto,
            referencia_id,
            descripcion,
            usuario_id,
            saldo_anterior,
            saldo_nuevo
        ) VALUES (
            p_caja_id,
            'EGRESO',
            'DESEMBOLSO_EMPENO',
            p_monto_prestamo,
            v_credito_id,
            'Desembolso Crédito #' || v_codigo_credito,
            p_usuario_id,
            v_saldo_caja,
            v_saldo_caja - p_monto_prestamo
        );
        
        -- Actualizar saldo de caja
        UPDATE cajas_operativas 
        SET saldo_actual = saldo_actual - p_monto_prestamo
        WHERE id = p_caja_id;
    END IF;
    
    -- ========================================
    -- RETORNO
    -- ========================================
    RETURN json_build_object(
        'success', TRUE,
        'creditoId', v_credito_id,
        'garantiaId', v_garantia_id,
        'codigo', v_codigo_credito,
        'estado', CASE WHEN v_es_desembolso_inmediato THEN 'DESEMBOLSADO' ELSE 'PENDIENTE_CAJA' END,
        'monto', p_monto_prestamo,
        'valorTasacion', p_valor_tasacion,
        'tasaInteres', p_tasa_interes,
        'interes', v_interes,
        'totalPagar', v_total_pagar,
        'fechaVencimiento', v_fecha_vencimiento,
        'mensaje', CASE WHEN v_es_desembolso_inmediato 
            THEN '¡Crédito desembolsado!' 
            ELSE 'Crédito aprobado (pendiente desembolso)' 
        END
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback automático por la transacción
        RAISE EXCEPTION 'Error al crear crédito: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."crear_credito_completo"("p_cliente_id" "uuid", "p_monto_prestamo" numeric, "p_valor_tasacion" numeric, "p_tasa_interes" numeric, "p_periodo_dias" integer, "p_fecha_inicio" timestamp with time zone, "p_descripcion_garantia" "text", "p_fotos" "text"[], "p_observaciones" "text", "p_usuario_id" "uuid", "p_caja_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."crear_credito_completo"("p_cliente_id" "uuid", "p_monto_prestamo" numeric, "p_valor_tasacion" numeric, "p_tasa_interes" numeric, "p_periodo_dias" integer, "p_fecha_inicio" timestamp with time zone, "p_descripcion_garantia" "text", "p_fotos" "text"[], "p_observaciones" "text", "p_usuario_id" "uuid", "p_caja_id" "uuid") IS 'Crea un crédito con garantía de forma atómica. Incluye validaciones de límites y tasa.';



CREATE OR REPLACE FUNCTION "public"."detectar_actividad_sospechosa"() RETURNS TABLE("alerta" character varying, "empleado_id" "uuid", "empleado_nombre" "text", "acciones_count" bigint, "ultima_accion" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Alerta: Más de 50 transacciones en 1 hora
    RETURN QUERY
    SELECT 
        'VOLUMEN_ALTO' as alerta,
        a.empleado_id,
        e.nombre_completo,
        COUNT(*) as acciones_count,
        MAX(a.timestamp) as ultima_accion
    FROM public.auditoria_transacciones a
    JOIN public.empleados_completo e ON a.empleado_id = e.id
    WHERE a.timestamp > now() - interval '1 hour'
    GROUP BY a.empleado_id, e.nombre_completo
    HAVING COUNT(*) > 50;
    
    -- Alerta: Eliminaciones fuera de horario (9pm-6am)
    RETURN QUERY
    SELECT 
        'DELETE_FUERA_HORARIO' as alerta,
        a.empleado_id,
        e.nombre_completo,
        COUNT(*) as acciones_count,
        MAX(a.timestamp) as ultima_accion
    FROM public.auditoria_transacciones a
    JOIN public.empleados_completo e ON a.empleado_id = e.id
    WHERE a.accion = 'DELETE'
      AND a.timestamp > now() - interval '24 hours'
      AND (EXTRACT(HOUR FROM a.timestamp) > 21 OR EXTRACT(HOUR FROM a.timestamp) < 6)
    GROUP BY a.empleado_id, e.nombre_completo;
END;
$$;


ALTER FUNCTION "public"."detectar_actividad_sospechosa"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."detectar_actividad_sospechosa"() IS 'Detecta patrones anómalos que podrían indicar fraude';



CREATE OR REPLACE FUNCTION "public"."detectar_descuadres"("p_ultimos_dias" integer DEFAULT 7) RETURNS TABLE("fecha" "date", "diferencia" numeric, "saldo_esperado" numeric, "saldo_real" numeric, "caja_id" "uuid", "cajero_nombre" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(c.fecha_cierre) as fecha,
        (c.saldo_final_efectivo - 
            (c.saldo_inicial_efectivo + 
             COALESCE(ingresos.total, 0) - 
             COALESCE(egresos.total, 0)
            )
        ) as diferencia,
        (c.saldo_inicial_efectivo + 
         COALESCE(ingresos.total, 0) - 
         COALESCE(egresos.total, 0)
        ) as saldo_esperado,
        c.saldo_final_efectivo as saldo_real,
        c.id as caja_id,
        COALESCE(e.nombre_completo, 'Desconocido') as cajero_nombre
    FROM cajas c
    LEFT JOIN empleados_completo e ON c.usuario_id = e.user_id
    LEFT JOIN LATERAL (
        SELECT SUM(monto) as total
        FROM pagos
        WHERE DATE(fecha_pago) = DATE(c.fecha_cierre)
    ) ingresos ON true
    LEFT JOIN LATERAL (
        SELECT SUM(monto_prestado) as total
        FROM creditos
        WHERE DATE(fecha_desembolso) = DATE(c.fecha_cierre)
    ) egresos ON true
    WHERE c.estado = 'cerrada'
      AND DATE(c.fecha_cierre) >= CURRENT_DATE - p_ultimos_dias
      AND ABS(c.saldo_final_efectivo - 
              (c.saldo_inicial_efectivo + 
               COALESCE(ingresos.total, 0) - 
               COALESCE(egresos.total, 0)
              )
          ) > 0.01
    ORDER BY c.fecha_cierre DESC;
END;
$$;


ALTER FUNCTION "public"."detectar_descuadres"("p_ultimos_dias" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."detectar_descuadres"("p_ultimos_dias" integer) IS 'Detecta cajas con descuadres en los últimos N días';



CREATE OR REPLACE FUNCTION "public"."generar_reporte_cierre"("p_fecha" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_reporte JSONB;
BEGIN
    SELECT jsonb_build_object(
        'fecha', p_fecha,
        'resumen', (
            SELECT jsonb_build_object(
                'prestamos', jsonb_build_object(
                    'cantidad', COUNT(*),
                    'monto_total', COALESCE(SUM(monto_prestado), 0)
                ),
                'pagos', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*),
                        'monto_total', COALESCE(SUM(monto), 0)
                    )
                    FROM pagos
                    WHERE DATE(fecha_pago) = p_fecha
                ),
                'renovaciones', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*),
                        'monto_total', COALESCE(SUM(monto_prestado), 0)
                    )
                    FROM creditos
                    WHERE DATE(fecha_desembolso) = p_fecha
                      AND estado = 'renovado'
                ),
                'cancelaciones', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*)
                    )
                    FROM creditos
                    WHERE DATE(fecha_cancelacion) = p_fecha
                      AND estado = 'cancelado'
                )
            )
            FROM creditos
            WHERE DATE(fecha_desembolso) = p_fecha
        ),
        'conciliacion', (
            SELECT row_to_json(r)
            FROM (SELECT * FROM public.conciliar_caja_dia(p_fecha)) r
        )
    ) INTO v_reporte;
    
    RETURN v_reporte;
END;
$$;


ALTER FUNCTION "public"."generar_reporte_cierre"("p_fecha" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generar_reporte_cierre"("p_fecha" "date") IS 'Genera un reporte JSON completo del cierre del día';



CREATE OR REPLACE FUNCTION "public"."get_actividad_empleado"("p_empleado_id" "uuid", "p_limit" integer DEFAULT 50) RETURNS TABLE("created_at" timestamp with time zone, "accion" character varying, "tabla" character varying, "registro_id" "uuid", "descripcion" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.timestamp as created_at,
        a.accion,
        a.tabla_afectada as tabla,
        a.registro_id,
        CASE a.tabla_afectada
            WHEN 'creditos' THEN 'Contrato de empeño'
            WHEN 'pagos' THEN 'Registro de pago'
            WHEN 'garantias' THEN 'Bien en custodia'
            WHEN 'cajas' THEN 'Operación de caja'
            ELSE a.tabla_afectada
        END as descripcion
    FROM public.auditoria_transacciones a
    WHERE a.empleado_id = p_empleado_id
    ORDER BY a.timestamp DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_actividad_empleado"("p_empleado_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_auditoria_registro"("p_tabla" character varying, "p_registro_id" "uuid") RETURNS TABLE("audit_id" "uuid", "accion" character varying, "empleado_nombre" "text", "datos_antes" "jsonb", "datos_despues" "jsonb", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as audit_id,
        a.accion,
        COALESCE(
            (SELECT nombre_completo FROM empleados_completo WHERE id = a.empleado_id),
            'Sistema'
        ) as empleado_nombre,
        a.datos_antes,
        a.datos_despues,
        a.timestamp as created_at
    FROM public.auditoria_transacciones a
    WHERE a.tabla_afectada = p_tabla
      AND a.registro_id = p_registro_id
    ORDER BY a.timestamp DESC;
END;
$$;


ALTER FUNCTION "public"."get_auditoria_registro"("p_tabla" character varying, "p_registro_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_auditoria_registro"("p_tabla" character varying, "p_registro_id" "uuid") IS 'Historial de cambios de un registro específico';



CREATE OR REPLACE FUNCTION "public"."get_cartera_risk_summary"() RETURNS TABLE("estado_grupo" "text", "cantidad" bigint, "total_saldo" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN c.estado = 'vigente' AND c.fecha_vencimiento > CURRENT_DATE + 7 THEN 'VIGENTE'
            WHEN c.estado = 'vigente' AND c.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 7 THEN 'POR_VENCER'
            WHEN c.estado = 'vencido' OR c.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
            ELSE 'OTROS'
        END as estado_grupo,
        COUNT(*) as cantidad,
        COALESCE(SUM(c.saldo_pendiente), 0) as total_saldo
    FROM public.creditos c
    WHERE c.estado NOT IN ('cancelado', 'anulado')
    GROUP BY 1;
END;
$$;


ALTER FUNCTION "public"."get_cartera_risk_summary"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_cartera_risk_summary"() IS 'Retorna resumen de riesgo de cartera para dashboard';



CREATE OR REPLACE FUNCTION "public"."get_contratos_renovables"("p_dias" integer DEFAULT 30) RETURNS TABLE("id" "uuid", "codigo" character varying, "cliente_id" "uuid", "cliente_nombre" "text", "cliente_telefono" character varying, "fecha_vencimiento" "date", "fecha_creacion" timestamp without time zone, "dias_restantes" integer, "dias_transcurridos" integer, "monto_prestado" numeric, "tasa_interes" numeric, "interes_acumulado" numeric, "saldo_pendiente" numeric, "garantia_descripcion" "text", "urgencia" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.codigo,
        c.cliente_id,
        cl.nombre_completo,
        cl.telefono_principal,
        c.fecha_vencimiento,
        c.created_at as fecha_creacion,                               -- NUEVO
        (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
        GREATEST(1, EXTRACT(DAY FROM NOW() - c.created_at)::int) as dias_transcurridos,  -- NUEVO
        c.monto_prestado,
        c.tasa_interes,                                               -- NUEVO
        c.interes_acumulado,
        c.saldo_pendiente,
        g.descripcion as garantia_descripcion,
        CASE
            WHEN c.fecha_vencimiento - CURRENT_DATE <= 3 THEN 'alta'
            WHEN c.fecha_vencimiento - CURRENT_DATE <= 7 THEN 'media'
            ELSE 'baja'
        END as urgencia
    FROM public.creditos c
    JOIN public.clientes_completo cl ON c.cliente_id = cl.id
    JOIN public.garantias g ON c.garantia_id = g.id
    WHERE
        c.estado = 'vigente'
        AND c.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + p_dias
    ORDER BY c.fecha_vencimiento ASC;
END;
$$;


ALTER FUNCTION "public"."get_contratos_renovables"("p_dias" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_contratos_renovables"("p_dias" integer) IS 'Retorna contratos próximos a vencer con campos para sistema de interés flexible (tasa_interes, dias_transcurridos)';



CREATE OR REPLACE FUNCTION "public"."get_contratos_vencimientos"("p_dias" integer DEFAULT 30) RETURNS TABLE("id" "uuid", "codigo" "text", "cliente_id" "uuid", "cliente" "text", "dni" "text", "telefono" "text", "monto" numeric, "saldo" numeric, "fecha_vencimiento" "date", "dias_restantes" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.codigo::TEXT,
        cl.id,
        cl.nombre_completo::TEXT,
        cl.numero_documento::TEXT as dni,
        cl.telefono_principal::TEXT,
        c.monto_prestado,
        c.saldo_pendiente,
        c.fecha_vencimiento::DATE,
        (c.fecha_vencimiento::DATE - CURRENT_DATE)::INTEGER as dias_restantes
    FROM creditos c
    JOIN clientes_completo cl ON c.cliente_id = cl.id
    WHERE c.fecha_vencimiento::DATE >= CURRENT_DATE
      AND c.fecha_vencimiento::DATE <= CURRENT_DATE + p_dias
      AND (c.estado_detallado = 'vigente' OR c.estado_detallado = 'al_dia' OR c.estado_detallado = 'por_vencer')
    ORDER BY c.fecha_vencimiento ASC;
END;
$$;


ALTER FUNCTION "public"."get_contratos_vencimientos"("p_dias" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_contratos_vencimientos"("p_dias" integer) IS 'Obtiene contratos que vencen en los próximos N días con DNI del cliente';



CREATE OR REPLACE FUNCTION "public"."get_historial_notificaciones"("p_credito_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', id,
                'tipo', tipo_notificacion,
                'mensaje', LEFT(mensaje_enviado, 100) || '...', -- Solo primeros 100 caracteres
                'fecha', fecha_envio,
                'estado', estado,
                'medio', medio,
                'horas_transcurridas', EXTRACT(EPOCH FROM (NOW() - fecha_envio)) / 3600
            ) ORDER BY fecha_envio DESC
        )
        FROM notificaciones_enviadas
        WHERE credito_id = p_credito_id
        LIMIT 10
    );
END;
$$;


ALTER FUNCTION "public"."get_historial_notificaciones"("p_credito_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_historial_notificaciones"("p_credito_id" "uuid") IS 'Obtiene el historial de notificaciones de un contrato';



CREATE OR REPLACE FUNCTION "public"."get_movimientos_dia"("p_fecha" "date") RETURNS TABLE("tipo_movimiento" character varying, "categoria" character varying, "cantidad_operaciones" bigint, "monto_total" numeric, "monto_promedio" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    -- 1. Préstamos otorgados (egresos de caja)
    SELECT 
        'PRESTAMO'::VARCHAR as tipo_movimiento,
        'EGRESO'::VARCHAR as categoria,
        COUNT(*) as cantidad_operaciones,
        SUM(monto_prestado) as monto_total,
        AVG(monto_prestado) as monto_promedio
    FROM creditos
    WHERE DATE(fecha_desembolso) = p_fecha
    
    UNION ALL
    
    -- 2. Pagos recibidos (ingresos a caja)
    SELECT 
        'PAGO',
        'INGRESO',
        COUNT(*),
        SUM(monto),
        AVG(monto)
    FROM pagos
    WHERE DATE(fecha_pago) = p_fecha
      AND estado = 'completado'
    
    UNION ALL
    
    -- 3. Renovaciones (ingreso + egreso)
    SELECT 
        'RENOVACION',
        'MIXTO',
        COUNT(*),
        SUM(monto_prestado),
        AVG(monto_prestado)
    FROM creditos
    WHERE DATE(fecha_desembolso) = p_fecha
      AND estado = 'renovado'
    
    UNION ALL
    
    -- 4. Cancelaciones (ingreso final)
    SELECT 
        'CANCELACION',
        'INGRESO',
        COUNT(*),
        SUM(p.monto),
        AVG(p.monto)
    FROM pagos p
    JOIN creditos c ON p.credito_id = c.id
    WHERE DATE(p.fecha_pago) = p_fecha
      AND c.estado = 'cancelado'
      AND DATE(c.fecha_cancelacion) = p_fecha;
END;
$$;


ALTER FUNCTION "public"."get_movimientos_dia"("p_fecha" "date") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_movimientos_dia"("p_fecha" "date") IS 'Obtiene todos los movimientos financieros de un día específico';



CREATE OR REPLACE FUNCTION "public"."get_or_create_persona"("p_tipo_documento" character varying, "p_numero_documento" character varying, "p_nombres" character varying, "p_apellido_paterno" character varying, "p_apellido_materno" character varying, "p_telefono" character varying DEFAULT NULL::character varying, "p_email" character varying DEFAULT NULL::character varying, "p_direccion" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Intentar encontrar persona existente
    SELECT id INTO v_persona_id
    FROM public.personas
    WHERE numero_documento = p_numero_documento;
    
    -- Si no existe, crearla
    IF v_persona_id IS NULL THEN
        INSERT INTO public.personas (
            tipo_documento,
            numero_documento,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono_principal,
            email,
            direccion
        ) VALUES (
            p_tipo_documento,
            p_numero_documento,
            p_nombres,
            p_apellido_paterno,
            p_apellido_materno,
            p_telefono,
            p_email,
            p_direccion
        ) RETURNING id INTO v_persona_id;
    END IF;
    
    RETURN v_persona_id;
END;
$$;


ALTER FUNCTION "public"."get_or_create_persona"("p_tipo_documento" character varying, "p_numero_documento" character varying, "p_nombres" character varying, "p_apellido_paterno" character varying, "p_apellido_materno" character varying, "p_telefono" character varying, "p_email" character varying, "p_direccion" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_saldo_caja_efectivo"("p_caja_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_saldo_inicial NUMERIC;
    v_movimientos NUMERIC;
BEGIN
    SELECT COALESCE(saldo_inicial, 0) INTO v_saldo_inicial
    FROM public.cajas_operativas WHERE id = p_caja_id;
    
    SELECT COALESCE(SUM(
        CASE 
            WHEN anulado = TRUE THEN 0  -- Ignorar anulados
            WHEN tipo = 'INGRESO' THEN monto 
            ELSE -monto 
        END
    ), 0) INTO v_movimientos
    FROM public.movimientos_caja_operativa
    WHERE (caja_operativa_id = p_caja_id OR caja_id = p_caja_id);
    
    RETURN v_saldo_inicial + v_movimientos;
END;
$$;


ALTER FUNCTION "public"."get_saldo_caja_efectivo"("p_caja_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_upcoming_expirations"("p_days" integer DEFAULT 7) RETURNS TABLE("id" "uuid", "codigo" character varying, "cliente_nombre" "text", "garantia_descripcion" "text", "garantia_foto" "text", "fecha_vencimiento" "date", "dias_restantes" integer, "monto_prestamo" numeric, "telefono" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.codigo,
        cl.nombre_completo as cliente_nombre,
        g.descripcion as garantia_descripcion,
        (g.fotos_urls)[1] as garantia_foto,
        c.fecha_vencimiento,
        (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
        c.monto_prestado,
        cl.telefono_principal as telefono
    FROM public.creditos c
    JOIN public.clientes_completo cl ON c.cliente_id = cl.id
    JOIN public.garantias g ON c.garantia_id = g.id
    WHERE
        c.estado IN ('vigente', 'vencido')
        AND c.fecha_vencimiento BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE + p_days
    ORDER BY c.fecha_vencimiento ASC
    LIMIT 20;
END;
$$;


ALTER FUNCTION "public"."get_upcoming_expirations"("p_days" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_upcoming_expirations"("p_days" integer) IS 'Retorna próximos vencimientos para timeline';



CREATE OR REPLACE FUNCTION "public"."get_vencimientos_agrupados"() RETURNS TABLE("periodo" "text", "cantidad" bigint, "contratos" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH vencimientos AS (
        SELECT
            c.id,
            c.codigo,
            cl.nombre_completo as cliente,
            cl.telefono_principal as telefono,
            c.fecha_vencimiento,
            c.monto_prestado,
            c.saldo_pendiente,
            (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
            CASE
                WHEN c.fecha_vencimiento = CURRENT_DATE THEN 'hoy'
                WHEN c.fecha_vencimiento BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7 THEN 'semana'
                WHEN c.fecha_vencimiento BETWEEN CURRENT_DATE + 8 AND CURRENT_DATE + 30 THEN 'mes'
                ELSE 'futuro'
            END as periodo_grupo
        FROM public.creditos c
        JOIN public.clientes_completo cl ON c.cliente_id = cl.id
        WHERE c.estado = 'vigente'
          AND c.fecha_vencimiento >= CURRENT_DATE
    )
    SELECT
        v.periodo_grupo as periodo,
        COUNT(*)::bigint as cantidad,
        jsonb_agg(
            jsonb_build_object(
                'id', v.id,
                'codigo', v.codigo,
                'cliente', v.cliente,
                'telefono', v.telefono,
                'fechaVencimiento', v.fecha_vencimiento,
                'diasRestantes', v.dias_restantes,
                'monto', v.monto_prestado,
                'saldo', v.saldo_pendiente
            ) ORDER BY v.fecha_vencimiento
        ) as contratos
    FROM vencimientos v
    GROUP BY v.periodo_grupo
    ORDER BY 
        CASE v.periodo_grupo
            WHEN 'hoy' THEN 1
            WHEN 'semana' THEN 2
            WHEN 'mes' THEN 3
            ELSE 4
        END;
END;
$$;


ALTER FUNCTION "public"."get_vencimientos_agrupados"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_vencimientos_agrupados"() IS 'Retorna vencimientos agrupados por período (hoy/semana/mes)';



CREATE OR REPLACE FUNCTION "public"."job_actualizar_estados_creditos"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Esto dispara el trigger de _modified para cada registro
    -- y también los triggers de estado automático
    UPDATE creditos 
    SET _modified = NOW() 
    WHERE estado IN ('vigente', 'vencido', 'en_mora')
      AND fecha_vencimiento < CURRENT_DATE;
END;
$$;


ALTER FUNCTION "public"."job_actualizar_estados_creditos"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."limpiar_codigos_expirados"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM verificacion_whatsapp
    WHERE expira_en < NOW() - INTERVAL '1 hour';
END;
$$;


ALTER FUNCTION "public"."limpiar_codigos_expirados"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."procesar_pago_trigger_fn"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_credito RECORD;
    v_nuevo_vencimiento DATE;
    v_interes_pagado DECIMAL := 0;
    v_capital_pagado DECIMAL := 0;
    v_mensaje TEXT;
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
    v_monto_decimal DECIMAL;
BEGIN
    -- Evitar recursión si ya se procesó (usando un flag en metadata o checkeando movimientos)
    -- En este caso, asumimos que todo INSERT a pagos debe procesarse si viene de cliente (usuario_id not null)
    
    -- Convertir monto a decimal (monto puede venir como string o numeric)
    -- Usamos CASE para manejar ambos tipos correctamente
    IF NEW.monto IS NOT NULL THEN
        v_monto_decimal := NEW.monto::DECIMAL;
    ELSIF NEW.monto_total IS NOT NULL THEN
        v_monto_decimal := NEW.monto_total;
    ELSE
        v_monto_decimal := 0;
    END IF;

    -- Actualizar el monto_total numérico si es nulo
    IF NEW.monto_total IS NULL THEN
        NEW.monto_total := v_monto_decimal;
    END IF;

    -- 1. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = NEW.credito_id;

    IF NOT FOUND THEN
        -- Si no hay crédito, no podemos procesar lógica de negocio (ej. pago huerfano)
        RETURN NEW;
    END IF;

    -- 2. CALCULAR MONTOS Y ACTUALIZAR CRÉDITO (Estado)
    IF NEW.tipo = 'renovacion' THEN
        v_interes_pagado := v_monto_decimal;
        
        -- Extender vencimiento
        -- Usar periodo_dias o default 30
        v_nuevo_vencimiento := v_credito.fecha_vencimiento + (COALESCE(v_credito.periodo_dias, 30) || ' days')::INTERVAL;
        
        UPDATE public.creditos 
        SET fecha_vencimiento = v_nuevo_vencimiento,
            interes_acumulado = 0,
            estado = 'vigente',
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        v_mensaje := 'Renovación (Sync). Nuevo vencimiento: ' || v_nuevo_vencimiento;

    ELSIF NEW.tipo = 'desempeno' THEN
        v_capital_pagado := v_credito.saldo_pendiente; 
        v_interes_pagado := v_monto_decimal - v_capital_pagado;
        
        UPDATE public.creditos 
        SET saldo_pendiente = 0,
            interes_acumulado = 0,
            estado = 'cancelado',
            fecha_cancelacion = NOW(),
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        -- Liberar garantía
        UPDATE public.garantias 
        SET estado = 'devuelta',
            fecha_venta = NOW(),
            updated_at = NOW()
        WHERE id = v_credito.garantia_id;
        
        v_mensaje := 'Cancelación (Sync). Prenda devuelta.';
        
    ELSIF NEW.tipo = 'capital' OR NEW.tipo = 'interes' THEN
        -- Amortización parcial (simple)
        UPDATE public.creditos
        SET saldo_pendiente = saldo_pendiente - v_monto_decimal,
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        v_mensaje := 'Pago parcial (Sync).';
    END IF;

    -- 3. INSERTAR MOVIMIENTO DE CAJA (Si no existe ya)
    -- Verificar si ya existe movimiento para este pago (idempotencia)
    IF NOT EXISTS (SELECT 1 FROM public.movimientos_caja_operativa WHERE referencia_id = NEW.credito_id AND fecha = NEW.created_at) THEN
        -- Obtener saldo caja
        SELECT saldo_actual INTO v_saldo_anterior 
        FROM public.cajas_operativas 
        WHERE id = NEW.caja_operativa_id;
        
        IF v_saldo_anterior IS NULL THEN v_saldo_anterior := 0; END IF;
        
        v_saldo_nuevo := v_saldo_anterior + v_monto_decimal;
        
        INSERT INTO public.movimientos_caja_operativa (
            caja_operativa_id, tipo, motivo, monto,
            saldo_anterior, saldo_nuevo,
            referencia_id, descripcion, metadata,
            usuario_id, fecha
        ) VALUES (
            NEW.caja_operativa_id, 'INGRESO', 
            CASE WHEN NEW.tipo = 'renovacion' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
            v_monto_decimal,
            v_saldo_anterior, v_saldo_nuevo,
            NEW.credito_id, v_mensaje, NEW.metadata,
            NEW.usuario_id, NEW.created_at -- Usar fecha del pago original
        );

        -- 4. ACTUALIZAR SALDO CAJA
        UPDATE public.cajas_operativas
        SET saldo_actual = v_saldo_nuevo
        WHERE id = NEW.caja_operativa_id;
    END IF;

    -- Actualizar campos derivados en el registro de pago actual
    NEW.desglose_capital := v_capital_pagado;
    NEW.desglose_interes := v_interes_pagado;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."procesar_pago_trigger_fn"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."proyectar_interes"("p_credito_id" "uuid", "p_dias_adicionales" integer) RETURNS TABLE("dias_totales" integer, "interes_proyectado" numeric, "total_a_pagar" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_monto NUMERIC;
    v_tasa NUMERIC;
    v_dias_actuales INT;
BEGIN
    -- Obtener datos del crédito
    SELECT 
        monto_prestado,
        tasa_interes,
        dias_transcurridos
    INTO v_monto, v_tasa, v_dias_actuales
    FROM public.creditos
    WHERE id = p_credito_id;
    
    IF v_monto IS NULL THEN
        RAISE EXCEPTION 'Crédito no encontrado: %', p_credito_id;
    END IF;
    
    -- Calcular proyección
    dias_totales := COALESCE(v_dias_actuales, 0) + p_dias_adicionales;
    
    interes_proyectado := ROUND(
        v_monto * (v_tasa / 100.0) * (dias_totales / 30.0),
        2
    );
    
    total_a_pagar := v_monto + interes_proyectado;
    
    RETURN NEXT;
END;
$$;


ALTER FUNCTION "public"."proyectar_interes"("p_credito_id" "uuid", "p_dias_adicionales" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."proyectar_interes"("p_credito_id" "uuid", "p_dias_adicionales" integer) IS 'Proyecta el interés futuro agregando días adicionales';



CREATE OR REPLACE FUNCTION "public"."puede_anular_movimiento"("p_movimiento_id" "uuid", "p_usuario_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_rol VARCHAR;
    v_mov_fecha TIMESTAMPTZ;
    v_horas_transcurridas NUMERIC;
BEGIN
    -- Obtener rol del usuario
    SELECT rol INTO v_rol FROM public.usuarios WHERE id = p_usuario_id;
    
    -- Obtener fecha del movimiento
    SELECT fecha INTO v_mov_fecha 
    FROM public.movimientos_caja_operativa 
    WHERE id = p_movimiento_id;
    
    v_horas_transcurridas := EXTRACT(EPOCH FROM (NOW() - v_mov_fecha)) / 3600;
    
    -- Reglas por rol:
    -- Admin: puede anular cualquier cosa
    -- Gerente: puede anular hasta 7 días
    -- Cajero: solo puede anular del mismo día
    RETURN CASE
        WHEN v_rol IN ('admin', 'super_admin') THEN TRUE
        WHEN v_rol = 'gerente' AND v_horas_transcurridas <= 168 THEN TRUE  -- 7 días
        WHEN v_rol = 'cajero' AND v_horas_transcurridas <= 24 THEN TRUE   -- 1 día
        ELSE FALSE
    END;
END;
$$;


ALTER FUNCTION "public"."puede_anular_movimiento"("p_movimiento_id" "uuid", "p_usuario_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."puede_anular_movimiento"("p_movimiento_id" "uuid", "p_usuario_id" "uuid") IS 'Verifica permisos: Admin=todo, Gerente=7días, Cajero=mismo día';



CREATE OR REPLACE FUNCTION "public"."puede_enviar_notificacion"("p_credito_id" "uuid", "p_horas_minimas" numeric DEFAULT 4) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_ultima_notificacion TIMESTAMP;
    v_horas_transcurridas NUMERIC;
    v_puede_enviar BOOLEAN;
    v_mensaje TEXT;
BEGIN
    -- Obtener última notificación
    SELECT MAX(fecha_envio) INTO v_ultima_notificacion
    FROM notificaciones_enviadas
    WHERE credito_id = p_credito_id
    AND estado = 'enviado';
    
    -- Si no hay notificaciones previas
    IF v_ultima_notificacion IS NULL THEN
        RETURN json_build_object(
            'puede_enviar', true,
            'mensaje', 'No se han enviado notificaciones previas',
            'ultima_notificacion', null,
            'horas_transcurridas', null
        );
    END IF;
    
    -- Calcular horas transcurridas
    v_horas_transcurridas := EXTRACT(EPOCH FROM (NOW() - v_ultima_notificacion)) / 3600;
    
    -- Verificar si cumple el cooldown
    v_puede_enviar := v_horas_transcurridas >= p_horas_minimas;
    
    IF v_puede_enviar THEN
        v_mensaje := 'Puede enviar notificación';
    ELSE
        v_mensaje := format(
            'Espere %s horas más antes de enviar otro mensaje',
            ROUND(p_horas_minimas - v_horas_transcurridas, 1)
        );
    END IF;
    
    RETURN json_build_object(
        'puede_enviar', v_puede_enviar,
        'mensaje', v_mensaje,
        'ultima_notificacion', v_ultima_notificacion,
        'horas_transcurridas', ROUND(v_horas_transcurridas, 1)
    );
END;
$$;


ALTER FUNCTION "public"."puede_enviar_notificacion"("p_credito_id" "uuid", "p_horas_minimas" numeric) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."puede_enviar_notificacion"("p_credito_id" "uuid", "p_horas_minimas" numeric) IS 'Verifica si se puede enviar una notificación basado en cooldown';



CREATE OR REPLACE FUNCTION "public"."registrar_evento"("p_agregado_tipo" character varying, "p_agregado_id" "uuid", "p_evento_tipo" character varying, "p_payload" "jsonb" DEFAULT '{}'::"jsonb", "p_usuario_id" "uuid" DEFAULT NULL::"uuid") RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_version INT;
    v_evento_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
    FROM public.eventos_sistema
    WHERE agregado_tipo = p_agregado_tipo AND agregado_id = p_agregado_id;
    
    INSERT INTO public.eventos_sistema (
        agregado_tipo, agregado_id, evento_tipo, payload, version, usuario_id
    ) VALUES (
        p_agregado_tipo, p_agregado_id, p_evento_tipo, p_payload, v_version, p_usuario_id
    ) RETURNING id INTO v_evento_id;
    
    RETURN v_evento_id;
END;
$$;


ALTER FUNCTION "public"."registrar_evento"("p_agregado_tipo" character varying, "p_agregado_id" "uuid", "p_evento_tipo" character varying, "p_payload" "jsonb", "p_usuario_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_credito RECORD;
    v_nuevo_vencimiento DATE;
    v_interes_pagado DECIMAL := 0;
    v_capital_pagado DECIMAL := 0;
    v_mensaje TEXT;
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
BEGIN
    -- 1. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = p_credito_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crédito no encontrado';
    END IF;

    IF v_credito.estado = 'pagado' OR v_credito.estado = 'cancelado' THEN
        RAISE EXCEPTION 'Este crédito ya está cancelado.';
    END IF;

    -- 2. LÓGICA SEGÚN TIPO DE OPERACIÓN
    IF p_tipo_operacion = 'RENOVACION' THEN
        -- Regla: Para renovar, debe cubrir al menos el interés acumulado
        v_interes_pagado := p_monto_pago;
        
        -- Extender vencimiento (usar el periodo original del crédito)
        v_nuevo_vencimiento := v_credito.fecha_vencimiento + (v_credito.periodo_dias || ' days')::INTERVAL;
        
        UPDATE public.creditos 
        SET fecha_vencimiento = v_nuevo_vencimiento,
            interes_acumulado = 0, -- Resetear interés acumulado
            estado = 'vigente' -- Si estaba vencido, revive
        WHERE id = p_credito_id;
        
        v_mensaje := 'Renovación exitosa. Nuevo vencimiento: ' || v_nuevo_vencimiento;

    ELSIF p_tipo_operacion = 'DESEMPENO' THEN
        -- Regla: Debe cubrir Todo (Capital + Interés)
        v_capital_pagado := v_credito.saldo_pendiente; 
        v_interes_pagado := p_monto_pago - v_capital_pagado;
        
        UPDATE public.creditos 
        SET saldo_pendiente = 0,
            interes_acumulado = 0,
            estado = 'cancelado',
            fecha_cancelacion = NOW()
        WHERE id = p_credito_id;
        
        -- Liberar garantía automáticamente
        UPDATE public.garantias 
        SET estado = 'liberada' 
        WHERE id = v_credito.garantia_id;
        
        v_mensaje := 'Crédito cancelado y prenda liberada.';
    ELSE
        RAISE EXCEPTION 'Tipo de operación inválido';
    END IF;

    -- 3. REGISTRAR EL PAGO (Historial)
    INSERT INTO public.pagos (
        credito_id, caja_operativa_id, monto_total, 
        desglose_capital, desglose_interes, medio_pago, metadata
    ) VALUES (
        p_credito_id, p_caja_id, p_monto_pago,
        v_capital_pagado, v_interes_pagado, p_metodo_pago, p_metadata
    );

    -- 4. OBTENER SALDO ACTUAL DE CAJA Y CALCULAR NUEVO
    SELECT saldo_actual INTO v_saldo_anterior 
    FROM public.cajas_operativas 
    WHERE id = p_caja_id;
    
    v_saldo_nuevo := v_saldo_anterior + p_monto_pago;

    -- 5. MOVER EL DINERO (Ledger de Caja)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto,
        saldo_anterior, saldo_nuevo,
        referencia_id, descripcion, metadata
    ) VALUES (
        p_caja_id, 'INGRESO', 
        CASE WHEN p_tipo_operacion = 'RENOVACION' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
        p_monto_pago,
        v_saldo_anterior, v_saldo_nuevo,
        p_credito_id, v_mensaje, p_metadata
    );

    -- 6. ACTUALIZAR SALDO DE CAJA
    UPDATE public.cajas_operativas
    SET saldo_actual = v_saldo_nuevo
    WHERE id = p_caja_id;

    RETURN jsonb_build_object(
        'success', true, 
        'mensaje', v_mensaje,
        'nuevo_saldo_caja', v_saldo_nuevo
    );
END;
$$;


ALTER FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb", "p_usuario_id" "uuid" DEFAULT "auth"."uid"()) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_credito RECORD;
    v_nuevo_vencimiento DATE;
    v_interes_pagado DECIMAL := 0;
    v_capital_pagado DECIMAL := 0;
    v_mensaje TEXT;
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
BEGIN
    -- 1. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = p_credito_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crédito no encontrado';
    END IF;

    IF v_credito.estado = 'pagado' OR v_credito.estado = 'cancelado' THEN
        RAISE EXCEPTION 'Este crédito ya está cancelado.';
    END IF;

    -- Validar usuario_id
    IF p_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no identificado (p_usuario_id es NULL)';
    END IF;

    -- 2. CALCULAR MONTOS Y ACTUALIZAR CREDITOS
    IF p_tipo_operacion = 'RENOVACION' THEN
        -- Regla: Para renovar, debe cubrir al menos el interés acumulado
        v_interes_pagado := p_monto_pago;
        
        -- Extender vencimiento (usar el periodo original del crédito)
        v_nuevo_vencimiento := v_credito.fecha_vencimiento + (v_credito.periodo_dias || ' days')::INTERVAL;
        
        UPDATE public.creditos 
        SET fecha_vencimiento = v_nuevo_vencimiento,
            interes_acumulado = 0, -- Resetear interés acumulado
            estado = 'vigente' -- Si estaba vencido, revive
        WHERE id = p_credito_id;
        
        v_mensaje := 'Renovación exitosa. Nuevo vencimiento: ' || v_nuevo_vencimiento;

    ELSIF p_tipo_operacion = 'DESEMPENO' THEN
        -- Regla: Debe cubrir Todo (Capital + Interés)
        v_capital_pagado := v_credito.saldo_pendiente; 
        v_interes_pagado := p_monto_pago - v_capital_pagado;
        
        UPDATE public.creditos 
        SET saldo_pendiente = 0,
            interes_acumulado = 0,
            estado = 'cancelado',
            fecha_cancelacion = NOW()
        WHERE id = p_credito_id;
        
        -- Liberar garantía automáticamente
        UPDATE public.garantias 
        SET estado = 'devuelta',
            fecha_venta = NOW() 
        WHERE id = v_credito.garantia_id;
        
        v_mensaje := 'Crédito cancelado y prenda devuelta.';
    ELSE
        RAISE EXCEPTION 'Tipo de operación inválido';
    END IF;

    -- 3. REGISTRAR EL PAGO (Historial)
    -- FIX: Insertar explícitamente en 'metodo_pago' (Requerido por RxDB) y 'medio_pago' (Legacy)
    INSERT INTO public.pagos (
        credito_id, caja_operativa_id, monto_total, 
        desglose_capital, desglose_interes, 
        metodo_pago, medio_pago,
        metadata, usuario_id
    ) VALUES (
        p_credito_id, p_caja_id, p_monto_pago,
        v_capital_pagado, v_interes_pagado, 
        LOWER(p_metodo_pago), p_metodo_pago, -- 'metodo_pago' lowercase for RxDB match
        p_metadata, p_usuario_id
    );

    -- 4. OBTENER SALDO ACTUAL DE CAJA Y CALCULAR NUEVO
    SELECT saldo_actual INTO v_saldo_anterior 
    FROM public.cajas_operativas 
    WHERE id = p_caja_id;
    
    v_saldo_nuevo := v_saldo_anterior + p_monto_pago;

    -- 5. MOVER EL DINERO (Ledger de Caja)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto,
        saldo_anterior, saldo_nuevo,
        referencia_id, descripcion, metadata,
        usuario_id
    ) VALUES (
        p_caja_id, 'INGRESO', 
        CASE WHEN p_tipo_operacion = 'RENOVACION' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
        p_monto_pago,
        v_saldo_anterior, v_saldo_nuevo,
        p_credito_id, v_mensaje, p_metadata,
        p_usuario_id
    );

    -- 6. ACTUALIZAR SALDO DE CAJA
    UPDATE public.cajas_operativas
    SET saldo_actual = v_saldo_nuevo
    WHERE id = p_caja_id;

    RETURN jsonb_build_object(
        'success', true, 
        'mensaje', v_mensaje,
        'nuevo_saldo_caja', v_saldo_nuevo
    );
END;
$$;


ALTER FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb", "p_usuario_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reversar_movimiento"("p_movimiento_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("success" boolean, "mensaje" "text", "movimiento_reversion_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_mov RECORD;
    v_tipo_inverso VARCHAR(50);
    v_nuevo_id UUID;
    v_caja RECORD;
BEGIN
    -- 1. Obtener movimiento original
    SELECT * INTO v_mov 
    FROM public.movimientos_caja_operativa 
    WHERE id = p_movimiento_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Movimiento no encontrado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 2. Verificar que no esté ya anulado
    IF v_mov.anulado THEN
        RETURN QUERY SELECT FALSE, 'Este movimiento ya fue anulado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 3. Verificar que no sea una reversión
    IF v_mov.es_reversion THEN
        RETURN QUERY SELECT FALSE, 'No se puede reversar una reversión'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 4. Determinar tipo inverso
    v_tipo_inverso := CASE v_mov.tipo 
        WHEN 'INGRESO' THEN 'EGRESO' 
        ELSE 'INGRESO' 
    END;
    
    -- 5. Obtener saldo actual de caja
    SELECT saldo_actual INTO v_caja 
    FROM public.cajas_operativas 
    WHERE id = v_mov.caja_operativa_id;
    
    -- 6. Crear movimiento de reversión
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id,
        caja_id,
        tipo,
        motivo,
        monto,
        saldo_anterior,
        saldo_nuevo,
        descripcion,
        usuario_id,
        es_reversion,
        movimiento_original_id,
        metadata
    ) VALUES (
        v_mov.caja_operativa_id,
        v_mov.caja_id,
        v_tipo_inverso,
        'REVERSION',
        v_mov.monto,
        v_caja.saldo_actual,
        CASE v_tipo_inverso 
            WHEN 'INGRESO' THEN v_caja.saldo_actual + v_mov.monto
            ELSE v_caja.saldo_actual - v_mov.monto
        END,
        'REVERSIÓN: ' || p_motivo || ' (Original: ' || v_mov.descripcion || ')',
        COALESCE(p_usuario_id, v_mov.usuario_id),
        TRUE,
        p_movimiento_id,
        jsonb_build_object(
            'movimiento_original', p_movimiento_id,
            'monto_original', v_mov.monto,
            'motivo_reversion', p_motivo
        )
    ) RETURNING id INTO v_nuevo_id;
    
    -- 7. Marcar movimiento original como anulado
    UPDATE public.movimientos_caja_operativa
    SET 
        anulado = TRUE,
        motivo_anulacion = p_motivo,
        anulado_por = p_usuario_id,
        anulado_at = NOW(),
        movimiento_reversion_id = v_nuevo_id
    WHERE id = p_movimiento_id;
    
    -- 8. Actualizar saldo de caja
    UPDATE public.cajas_operativas
    SET saldo_actual = CASE v_tipo_inverso 
        WHEN 'INGRESO' THEN saldo_actual + v_mov.monto
        ELSE saldo_actual - v_mov.monto
    END
    WHERE id = v_mov.caja_operativa_id;
    
    RETURN QUERY SELECT TRUE, 
        ('Movimiento reversado. Nuevo saldo ajustado.')::TEXT, 
        v_nuevo_id;
END;
$$;


ALTER FUNCTION "public"."reversar_movimiento"("p_movimiento_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."reversar_movimiento"("p_movimiento_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") IS 'Crea movimiento inverso y marca original como anulado. NO borra nada. Auditoría completa.';



CREATE OR REPLACE FUNCTION "public"."security_prevent_self_credit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_employee_persona_id UUID;
    v_client_persona_id UUID;
BEGIN
    -- Solo aplica si el usuario está autenticado
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    -- A. Obtener Persona del Usuario actual (Empleado que opera)
    SELECT persona_id INTO v_employee_persona_id
    FROM public.empleados
    WHERE user_id = auth.uid();

    -- Si no es empleado (ej. admin puro sin rol de empleado o service_role), permitimos (auditoría lo capturará)
    IF v_employee_persona_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- B. Obtener Persona del Cliente que solicita el crédito
    SELECT persona_id INTO v_client_persona_id
    FROM public.clientes
    WHERE id = NEW.cliente_id;

    -- C. COMPARAR: Si son la misma persona física -> BLOQUEAR
    IF v_employee_persona_id = v_client_persona_id THEN
        RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD (SoD): Conflicto de Interés. No puedes procesar un crédito para ti mismo. Solicita a otro cajero.';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."security_prevent_self_credit"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."security_prevent_self_credit"() IS 'SoD: Impide que un empleado cree créditos para sí mismo.';



CREATE OR REPLACE FUNCTION "public"."security_prevent_self_payment"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_cajero_persona_id UUID;
    v_cliente_persona_id UUID;
BEGIN
    -- A. Obtener Persona del Cajero dueño de la Caja Operativa
    -- Nota: Usamos la caja_operativa_id del pago para saber quién está cobrando, 
    -- independiente de quién esté logueado (aunque debería coincidir por RLS).
    SELECT e.persona_id INTO v_cajero_persona_id
    FROM public.cajas_operativas c
    JOIN public.usuarios u ON c.usuario_id = u.id -- Link legacy
    JOIN public.empleados e ON e.user_id = u.id   -- Link enterprise
    WHERE c.id = NEW.caja_operativa_id;

    IF v_cajero_persona_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- B. Obtener Persona del Cliente dueño del Crédito
    SELECT cl.persona_id INTO v_cliente_persona_id
    FROM public.creditos cr
    JOIN public.clientes cl ON cr.cliente_id = cl.id
    WHERE cr.id = NEW.credito_id;

    -- C. COMPARAR
    IF v_cajero_persona_id = v_cliente_persona_id THEN
         RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD (SoD): Conflicto de Interés. No puedes registrar cobros de tus propios créditos en tu caja.';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."security_prevent_self_payment"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."security_prevent_self_payment"() IS 'SoD: Impide que un cajero cobre sus propios pagos en su caja.';



CREATE OR REPLACE FUNCTION "public"."sync_caja_ids"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.caja_id IS NULL AND NEW.caja_operativa_id IS NOT NULL THEN
        NEW.caja_id := NEW.caja_operativa_id;
    ELSIF NEW.caja_operativa_id IS NULL AND NEW.caja_id IS NOT NULL THEN
        NEW.caja_operativa_id := NEW.caja_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_caja_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_personas_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_personas_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_saldo_credito_on_pago"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Handle RENEWALS (Renovacion)
    IF NEW.tipo = 'renovacion' THEN
        -- For renewals, we DO NOT subtract from the principal (saldo_pendiente).
        -- The payment covers interest.
        -- We ensure the status is 'vigente'.
        -- Note: The date extension and interest reset are handled by the Client (RxDB) 
        -- and will sync separately. We just ensure we don't mess up the balance here.
        UPDATE public.creditos
        SET 
            estado = 'vigente',
            updated_at = NOW()
        WHERE id = NEW.credito_id;

    ELSE
        -- Standard Logic (Amortizacion, Liquidacion, Interes normal? maybe)
        -- For standard payments, we subtract from balance.
        UPDATE public.creditos
        SET 
            saldo_pendiente = saldo_pendiente - NEW.monto,
            -- Auto-close if balance is near zero
            estado = CASE 
                WHEN (saldo_pendiente - NEW.monto) <= 0.5 THEN 'cancelado' 
                ELSE estado 
            END,
            estado_detallado = CASE 
                WHEN (saldo_pendiente - NEW.monto) <= 0.5 THEN 'cancelado' 
                ELSE estado_detallado 
            END,
            updated_at = NOW()
        WHERE id = NEW.credito_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_saldo_credito_on_pago"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_credito_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    estados_terminales TEXT[] := ARRAY['cancelado', 'vendido', 'remate', 'anulado', 'pagado'];
BEGIN
    -- REGLA 1: Si el crédito actual tiene estado terminal, no permitir cambios de estado
    IF OLD.estado = ANY(estados_terminales) THEN
        -- Solo permitir actualización de campos no críticos
        IF NEW.estado != OLD.estado THEN
            RAISE EXCEPTION 'No se puede cambiar el estado de un crédito %', OLD.estado
                USING HINT = 'El crédito ya está en estado terminal';
        END IF;
        
        -- No permitir cambio de montos en estados terminales
        IF NEW.monto_prestado != OLD.monto_prestado OR 
           NEW.saldo_pendiente != OLD.saldo_pendiente THEN
            RAISE EXCEPTION 'No se pueden modificar montos de un crédito %', OLD.estado
                USING HINT = 'El crédito ya está en estado terminal';
        END IF;
    END IF;
    
    -- REGLA 2: ANULADO siempre gana - si se intenta anular, permitirlo
    IF NEW.estado = 'anulado' THEN
        -- Anulación siempre permitida (es el estado de mayor prioridad)
        RETURN NEW;
    END IF;
    
    -- REGLA 3: No permitir "retroceder" de estados terminales a no terminales
    IF OLD.estado = ANY(estados_terminales) AND NOT (NEW.estado = ANY(estados_terminales)) THEN
        RAISE EXCEPTION 'No se puede revertir un crédito desde % a %', OLD.estado, NEW.estado
            USING HINT = 'Los estados terminales no pueden revertirse';
    END IF;
    
    -- Actualizar timestamp de modificación
    NEW._modified = NOW();
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_credito_update"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_credito_update"() IS 'Implementa Opción 2C de resolución de conflictos:
- Estados terminales (cancelado, vendido, remate, anulado, pagado) no pueden cambiar
- Montos no pueden modificarse en estados terminales
- ANULADO tiene máxima prioridad y siempre puede aplicarse
- Previene sincronización conflictiva desde dispositivos offline';



CREATE OR REPLACE FUNCTION "public"."validate_pago_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    credito_estado TEXT;
    estados_terminales TEXT[] := ARRAY['cancelado', 'vendido', 'remate', 'anulado'];
BEGIN
    -- Obtener el estado actual del crédito
    SELECT estado INTO credito_estado
    FROM public.creditos
    WHERE id = NEW.credito_id;
    
    -- No permitir pagos en créditos con estados terminales (excepto pagado)
    IF credito_estado = ANY(estados_terminales) THEN
        RAISE EXCEPTION 'No se pueden registrar pagos en un crédito %', credito_estado
            USING HINT = 'El crédito está en estado terminal';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_pago_insert"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_pago_insert"() IS 'Previene registro de pagos en créditos terminales para mantener integridad financiera';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tabla" "text" NOT NULL,
    "registro_id" "uuid" NOT NULL,
    "accion" "text" NOT NULL,
    "usuario_id" "uuid",
    "datos_anteriores" "jsonb",
    "datos_nuevos" "jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_log" IS 'Registro de auditoría para cambios críticos del sistema';



CREATE TABLE IF NOT EXISTS "public"."auditoria_transacciones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tabla_afectada" character varying(50) NOT NULL,
    "registro_id" "uuid" NOT NULL,
    "accion" character varying(20) NOT NULL,
    "usuario_id" "uuid",
    "empleado_id" "uuid",
    "datos_antes" "jsonb",
    "datos_despues" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "auditoria_accion_check" CHECK ((("accion")::"text" = ANY (ARRAY[('INSERT'::character varying)::"text", ('UPDATE'::character varying)::"text", ('DELETE'::character varying)::"text"])))
);


ALTER TABLE "public"."auditoria_transacciones" OWNER TO "postgres";


COMMENT ON TABLE "public"."auditoria_transacciones" IS 'Registro completo de todas las transacciones críticas del sistema';



CREATE TABLE IF NOT EXISTS "public"."boveda_central" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid",
    "saldo_total" numeric(15,2) DEFAULT 0 NOT NULL,
    "saldo_disponible" numeric(15,2) DEFAULT 0 NOT NULL,
    "saldo_asignado" numeric(15,2) DEFAULT 0 NOT NULL,
    "fecha_actualizacion" timestamp with time zone DEFAULT "now"(),
    "estado" character varying(50) DEFAULT 'activa'::character varying,
    CONSTRAINT "chk_boveda_saldos" CHECK (("saldo_total" = ("saldo_disponible" + "saldo_asignado")))
);


ALTER TABLE "public"."boveda_central" OWNER TO "postgres";


COMMENT ON TABLE "public"."boveda_central" IS 'SINGLETON: Bóveda central. RLS DESACTIVADO para desarrollo.';



CREATE TABLE IF NOT EXISTS "public"."cajas_operativas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "boveda_origen_id" "uuid",
    "numero_caja" integer NOT NULL,
    "estado" character varying(20) DEFAULT 'cerrada'::character varying NOT NULL,
    "saldo_inicial" numeric(15,2) DEFAULT 0,
    "saldo_actual" numeric(15,2) DEFAULT 0,
    "saldo_final_cierre" numeric(15,2),
    "diferencia_cierre" numeric(15,2),
    "fecha_apertura" timestamp with time zone DEFAULT "now"(),
    "fecha_cierre" timestamp with time zone,
    "observaciones_cierre" "text",
    "_deleted" boolean DEFAULT false NOT NULL,
    "_modified" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cajas_operativas" OWNER TO "postgres";


COMMENT ON TABLE "public"."cajas_operativas" IS 'Sesiones de trabajo de cajeros. Ciclo: abierta -> operando -> cerrada.';



COMMENT ON COLUMN "public"."cajas_operativas"."observaciones_cierre" IS 'Notas del cajero al cerrar turno (diferencias, incidencias, etc.)';



CREATE TABLE IF NOT EXISTS "public"."categorias_garantia" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "porcentaje_prestamo_maximo" numeric(5,2) DEFAULT 60.00
);


ALTER TABLE "public"."categorias_garantia" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clientes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid",
    "tipo_documento" character varying(20) NOT NULL,
    "numero_documento" character varying(20) NOT NULL,
    "nombres" character varying(100),
    "apellido_paterno" character varying(100),
    "apellido_materno" character varying(100),
    "email" character varying(100),
    "telefono_principal" character varying(20),
    "direccion" "text",
    "score_crediticio" integer DEFAULT 500,
    "activo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "persona_id" "uuid",
    "ubigeo_cod" character varying(6),
    "departamento" character varying(50),
    "provincia" character varying(50),
    "distrito" character varying(50),
    "_deleted" boolean DEFAULT false NOT NULL,
    "_modified" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."clientes" OWNER TO "postgres";


COMMENT ON COLUMN "public"."clientes"."ubigeo_cod" IS 'Código de 6 dígitos del distrito (INEI)';



CREATE TABLE IF NOT EXISTS "public"."personas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tipo_documento" character varying(10) DEFAULT 'DNI'::character varying NOT NULL,
    "numero_documento" character varying(20) NOT NULL,
    "nombres" character varying(200) NOT NULL,
    "apellido_paterno" character varying(100) NOT NULL,
    "apellido_materno" character varying(100) NOT NULL,
    "email" character varying(100),
    "telefono_principal" character varying(20),
    "telefono_secundario" character varying(20),
    "direccion" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."personas" OWNER TO "postgres";


COMMENT ON TABLE "public"."personas" IS 'Tabla maestra de personas físicas o jurídicas. Centraliza datos de identificación.';



CREATE OR REPLACE VIEW "public"."clientes_completo" AS
 SELECT "c"."id",
    "c"."persona_id",
    "c"."empresa_id",
    "c"."score_crediticio",
    "c"."activo",
    "c"."created_at",
    "p"."tipo_documento",
    "p"."numero_documento",
    "p"."nombres",
    "p"."apellido_paterno",
    "p"."apellido_materno",
    ((((("p"."nombres")::"text" || ' '::"text") || ("p"."apellido_paterno")::"text") || ' '::"text") || ("p"."apellido_materno")::"text") AS "nombre_completo",
    "p"."email",
    "p"."telefono_principal",
    "p"."telefono_secundario",
    "p"."direccion"
   FROM ("public"."clientes" "c"
     JOIN "public"."personas" "p" ON (("c"."persona_id" = "p"."id")));


ALTER VIEW "public"."clientes_completo" OWNER TO "postgres";


COMMENT ON VIEW "public"."clientes_completo" IS 'Vista desnormalizada de clientes con datos de persona. Usar en consultas.';



CREATE TABLE IF NOT EXISTS "public"."creditos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "codigo" character varying(50),
    "cliente_id" "uuid" NOT NULL,
    "garantia_id" "uuid",
    "caja_origen_id" "uuid",
    "empresa_id" "uuid",
    "monto_prestado" numeric(12,2) NOT NULL,
    "tasa_interes" numeric(5,2) NOT NULL,
    "periodo_dias" integer NOT NULL,
    "fecha_desembolso" timestamp without time zone DEFAULT "now"(),
    "fecha_vencimiento" "date" NOT NULL,
    "saldo_pendiente" numeric(12,2) NOT NULL,
    "interes_acumulado" numeric(12,2) DEFAULT 0,
    "estado" character varying(50) DEFAULT 'vigente'::character varying,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "estado_detallado" character varying(30) NOT NULL,
    "dias_transcurridos" integer,
    "interes_devengado_actual" numeric(12,2) DEFAULT 0,
    "codigo_credito" character varying(50),
    "fecha_inicio" "date",
    "observaciones" "text",
    "created_by" "uuid",
    "_deleted" boolean DEFAULT false NOT NULL,
    "_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "fecha_cancelacion" timestamp with time zone,
    CONSTRAINT "chk_estado_valido" CHECK ((("estado")::"text" = ANY (ARRAY[('vigente'::character varying)::"text", ('vencido'::character varying)::"text", ('en_mora'::character varying)::"text", ('pre_remate'::character varying)::"text", ('en_remate'::character varying)::"text", ('cancelado'::character varying)::"text", ('renovado'::character varying)::"text", ('anulado'::character varying)::"text", ('aprobado'::character varying)::"text"]))),
    CONSTRAINT "creditos_estado_detallado_check" CHECK ((("estado_detallado")::"text" = ANY (ARRAY[('vigente'::character varying)::"text", ('al_dia'::character varying)::"text", ('por_vencer'::character varying)::"text", ('vencido'::character varying)::"text", ('en_mora'::character varying)::"text", ('en_gracia'::character varying)::"text", ('pre_remate'::character varying)::"text", ('en_remate'::character varying)::"text", ('cancelado'::character varying)::"text", ('renovado'::character varying)::"text", ('ejecutado'::character varying)::"text", ('anulado'::character varying)::"text"])))
);


ALTER TABLE "public"."creditos" OWNER TO "postgres";


COMMENT ON COLUMN "public"."creditos"."estado_detallado" IS 'Estado detallado del ciclo de vida del crédito. Se actualiza automáticamente según fechas y pagos.';



COMMENT ON COLUMN "public"."creditos"."dias_transcurridos" IS 'Días transcurridos desde el desembolso hasta hoy (actualizado automáticamente por trigger)';



COMMENT ON COLUMN "public"."creditos"."interes_devengado_actual" IS 'Interés devengado hasta la fecha actual (actualizado automáticamente por trigger). Fórmula: Capital × (Tasa/100) × (Días/30)';



COMMENT ON COLUMN "public"."creditos"."codigo_credito" IS 'Alias de codigo para compatibilidad con código';



COMMENT ON COLUMN "public"."creditos"."observaciones" IS 'Notas administrativas del crédito';



COMMENT ON COLUMN "public"."creditos"."_deleted" IS 'Soft delete para sincronización RxDB (no eliminar físicamente)';



COMMENT ON COLUMN "public"."creditos"."_modified" IS 'Timestamp de última modificación para sincronización RxDB';



CREATE TABLE IF NOT EXISTS "public"."departamentos" (
    "codigo" character varying(2) NOT NULL,
    "nombre" character varying(50) NOT NULL,
    "activo" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."departamentos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."distritos" (
    "ubigeo_inei" character varying(6) NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "provincia_codigo" character varying(4) NOT NULL,
    "activo" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."distritos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empleados" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "persona_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "cargo" character varying(50) NOT NULL,
    "sucursal_id" "uuid",
    "activo" boolean DEFAULT true,
    "fecha_ingreso" "date" DEFAULT CURRENT_DATE,
    "fecha_salida" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."empleados" OWNER TO "postgres";


COMMENT ON TABLE "public"."empleados" IS 'Empleados de la empresa. Referencia a personas y auth.users.';



CREATE OR REPLACE VIEW "public"."empleados_completo" AS
 SELECT "e"."id",
    "e"."persona_id",
    "e"."user_id",
    "e"."cargo",
    "e"."sucursal_id",
    "e"."activo",
    "e"."fecha_ingreso",
    "e"."fecha_salida",
    "e"."created_at",
    "p"."tipo_documento",
    "p"."numero_documento",
    "p"."nombres",
    "p"."apellido_paterno",
    "p"."apellido_materno",
    ((((("p"."nombres")::"text" || ' '::"text") || ("p"."apellido_paterno")::"text") || ' '::"text") || ("p"."apellido_materno")::"text") AS "nombre_completo",
    "p"."email",
    "p"."telefono_principal",
    "p"."direccion"
   FROM ("public"."empleados" "e"
     JOIN "public"."personas" "p" ON (("e"."persona_id" = "p"."id")));


ALTER VIEW "public"."empleados_completo" OWNER TO "postgres";


COMMENT ON VIEW "public"."empleados_completo" IS 'Vista desnormalizada de empleados con datos de persona.';



CREATE TABLE IF NOT EXISTS "public"."empresas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ruc" character varying(11) NOT NULL,
    "razon_social" character varying(255) NOT NULL,
    "nombre_comercial" character varying(255),
    "direccion" "text",
    "telefono" character varying(20),
    "email" character varying(100),
    "logo_url" "text",
    "activo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."empresas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eventos_sistema" (
    "id" bigint NOT NULL,
    "agregado_tipo" character varying(50) NOT NULL,
    "agregado_id" "uuid" NOT NULL,
    "evento_tipo" character varying(100) NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "usuario_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eventos_sistema" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."eventos_sistema_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."eventos_sistema_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."eventos_sistema_id_seq" OWNED BY "public"."eventos_sistema"."id";



CREATE TABLE IF NOT EXISTS "public"."garantias" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid",
    "categoria_id" "uuid",
    "descripcion" "text" NOT NULL,
    "valor_tasacion" numeric(12,2) NOT NULL,
    "valor_prestamo_sugerido" numeric(12,2),
    "estado" character varying(50) DEFAULT 'custodia'::character varying,
    "fotos_urls" "text"[],
    "created_at" timestamp without time zone DEFAULT "now"(),
    "marca" character varying(100),
    "modelo" character varying(100),
    "serie" character varying(100),
    "subcategoria" character varying(100),
    "estado_bien" character varying(50),
    "anio" integer,
    "placa" character varying(20),
    "kilometraje" numeric(10,2),
    "area" numeric(10,2),
    "ubicacion" "text",
    "partida_registral" character varying(50),
    "peso" numeric(10,2),
    "quilataje" character varying(20),
    "capacidad" character varying(100),
    "fecha_venta" timestamp with time zone,
    "precio_venta" numeric(12,2),
    "credito_id" "uuid",
    "fotos" "text"[],
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "_deleted" boolean DEFAULT false NOT NULL,
    "_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "garantias_estado_check" CHECK ((("estado")::"text" = ANY (ARRAY[('custodia_caja'::character varying)::"text", ('en_transito'::character varying)::"text", ('custodia_boveda'::character varying)::"text", ('en_remate'::character varying)::"text", ('vendida'::character varying)::"text", ('devuelta'::character varying)::"text", ('custodia'::character varying)::"text", ('remate'::character varying)::"text"])))
);


ALTER TABLE "public"."garantias" OWNER TO "postgres";


COMMENT ON COLUMN "public"."garantias"."subcategoria" IS 'Subcategoría específica del bien (ej: Laptop Gamer, Sedan, Anillo)';



COMMENT ON COLUMN "public"."garantias"."estado_bien" IS 'Estado físico: NUEVO, EXCELENTE, BUENO, REGULAR, MALO';



COMMENT ON COLUMN "public"."garantias"."fecha_venta" IS 'Fecha en que se vendió la prenda en remate';



COMMENT ON COLUMN "public"."garantias"."precio_venta" IS 'Precio de venta en remate';



CREATE TABLE IF NOT EXISTS "public"."movimientos_boveda_auditoria" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "boveda_id" "uuid" NOT NULL,
    "tipo" character varying(50) NOT NULL,
    "monto" numeric(15,2) NOT NULL,
    "caja_operativa_id" "uuid",
    "usuario_responsable_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "saldo_anterior" numeric(15,2),
    "saldo_nuevo" numeric(15,2),
    "fecha" timestamp without time zone DEFAULT "now"(),
    "referencia" "text"
);


ALTER TABLE "public"."movimientos_boveda_auditoria" OWNER TO "postgres";


COMMENT ON TABLE "public"."movimientos_boveda_auditoria" IS 'APPEND-ONLY: Auditoría de ingresos externos (Yape, Bancos). Trazabilidad en metadata.';



COMMENT ON COLUMN "public"."movimientos_boveda_auditoria"."metadata" IS 'JSONB: { origen, canal, numero_operacion, evidencia_url, ... }. Crítico para trazabilidad.';



CREATE TABLE IF NOT EXISTS "public"."movimientos_caja_operativa" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "caja_operativa_id" "uuid" NOT NULL,
    "tipo" character varying(50) NOT NULL,
    "motivo" character varying(50) NOT NULL,
    "monto" numeric(15,2) NOT NULL,
    "saldo_anterior" numeric(15,2) NOT NULL,
    "saldo_nuevo" numeric(15,2) NOT NULL,
    "referencia_id" "uuid",
    "descripcion" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "usuario_id" "uuid" NOT NULL,
    "fecha" timestamp with time zone DEFAULT "now"(),
    "caja_id" "uuid",
    "anulado" boolean DEFAULT false,
    "motivo_anulacion" "text",
    "anulado_por" "uuid",
    "anulado_at" timestamp with time zone,
    "movimiento_reversion_id" "uuid",
    "es_reversion" boolean DEFAULT false,
    "movimiento_original_id" "uuid",
    "_deleted" boolean DEFAULT false NOT NULL,
    "_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_monto_positivo" CHECK (("monto" > (0)::numeric))
);


ALTER TABLE "public"."movimientos_caja_operativa" OWNER TO "postgres";


COMMENT ON TABLE "public"."movimientos_caja_operativa" IS 'APPEND-ONLY: Ledger inmutable. Cada centavo que circule. Nunca DELETE/UPDATE.';



COMMENT ON COLUMN "public"."movimientos_caja_operativa"."metadata" IS 'JSONB: Evidencia de medios de pago (YAPE, PLIN, etc). { medio_pago, numero_transaccion, ... }';



COMMENT ON COLUMN "public"."movimientos_caja_operativa"."_deleted" IS 'Soft delete para sincronización RxDB';



COMMENT ON COLUMN "public"."movimientos_caja_operativa"."_modified" IS 'Timestamp de última modificación para sincronización RxDB';



CREATE OR REPLACE VIEW "public"."movimientos_efectivos" AS
 SELECT "id",
    "caja_operativa_id",
    "tipo",
    "motivo",
    "monto",
    "saldo_anterior",
    "saldo_nuevo",
    "referencia_id",
    "descripcion",
    "metadata",
    "usuario_id",
    "fecha",
    "caja_id",
    "anulado",
    "motivo_anulacion",
    "anulado_por",
    "anulado_at",
    "movimiento_reversion_id",
    "es_reversion",
    "movimiento_original_id",
        CASE
            WHEN "anulado" THEN (0)::numeric
            ELSE
            CASE "tipo"
                WHEN 'INGRESO'::"text" THEN "monto"
                ELSE (- "monto")
            END
        END AS "efecto_neto"
   FROM "public"."movimientos_caja_operativa" "m"
  ORDER BY "fecha" DESC;


ALTER VIEW "public"."movimientos_efectivos" OWNER TO "postgres";


COMMENT ON VIEW "public"."movimientos_efectivos" IS 'Movimientos excluyendo anulados. Usar para cálculos de saldo.';



CREATE TABLE IF NOT EXISTS "public"."notificaciones_enviadas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "credito_id" "uuid" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "tipo_notificacion" character varying(50) NOT NULL,
    "mensaje_enviado" "text" NOT NULL,
    "telefono_destino" character varying(20) NOT NULL,
    "enviado_por" "uuid",
    "fecha_envio" timestamp with time zone DEFAULT "now"(),
    "estado" character varying(20) DEFAULT 'enviado'::character varying,
    "medio" character varying(20) DEFAULT 'whatsapp'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notificaciones_enviadas" OWNER TO "postgres";


COMMENT ON TABLE "public"."notificaciones_enviadas" IS 'Registro de todas las notificaciones enviadas a clientes';



CREATE TABLE IF NOT EXISTS "public"."notificaciones_pendientes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cliente_id" "uuid",
    "credito_id" "uuid",
    "tipo" "text" NOT NULL,
    "titulo" "text" NOT NULL,
    "mensaje" "text" NOT NULL,
    "monto" numeric(12,2),
    "telefono" "text",
    "email" "text",
    "estado" "text" DEFAULT 'pendiente'::"text",
    "fecha_envio" timestamp with time zone,
    "fecha_procesado" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notificaciones_pendientes" OWNER TO "postgres";


COMMENT ON TABLE "public"."notificaciones_pendientes" IS 'Notificaciones pendientes como excedentes de remate o vencimientos';



CREATE TABLE IF NOT EXISTS "public"."pagos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "credito_id" "uuid",
    "caja_operativa_id" "uuid",
    "monto_total" numeric(12,2) NOT NULL,
    "desglose_capital" numeric(12,2),
    "desglose_interes" numeric(12,2),
    "desglose_mora" numeric(12,2),
    "medio_pago" character varying(50),
    "metadata" "jsonb",
    "fecha_pago" timestamp without time zone DEFAULT "now"(),
    "tipo" character varying(50) DEFAULT 'PAGO'::character varying,
    "metodo_pago" character varying(50),
    "observaciones" "text",
    "usuario_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "anulado" boolean DEFAULT false,
    "motivo_anulacion" "text",
    "anulado_por" "uuid",
    "anulado_at" timestamp with time zone,
    "_deleted" boolean DEFAULT false NOT NULL,
    "_modified" timestamp with time zone DEFAULT "now"() NOT NULL,
    "monto" numeric(12,2)
);


ALTER TABLE "public"."pagos" OWNER TO "postgres";


COMMENT ON COLUMN "public"."pagos"."tipo" IS 'Tipo de pago: interes, capital, desempeno, mora, renovacion';



COMMENT ON COLUMN "public"."pagos"."metodo_pago" IS 'Método: efectivo, yape, plin, transferencia';



COMMENT ON COLUMN "public"."pagos"."usuario_id" IS 'Cajero que registró el pago';



COMMENT ON COLUMN "public"."pagos"."_deleted" IS 'Soft delete para sincronización RxDB';



COMMENT ON COLUMN "public"."pagos"."_modified" IS 'Timestamp de última modificación para sincronización RxDB';



COMMENT ON COLUMN "public"."pagos"."monto" IS 'Monto del pago (compatible con RxDB)';



CREATE OR REPLACE VIEW "public"."pagos_efectivos" AS
 SELECT "id",
    "credito_id",
    "caja_operativa_id",
    "monto_total",
    "desglose_capital",
    "desglose_interes",
    "desglose_mora",
    "medio_pago",
    "metadata",
    "fecha_pago",
    "tipo",
    "metodo_pago",
    "observaciones",
    "usuario_id",
    "created_at",
    "anulado",
    "motivo_anulacion",
    "anulado_por",
    "anulado_at"
   FROM "public"."pagos"
  WHERE (("anulado" = false) OR ("anulado" IS NULL));


ALTER VIEW "public"."pagos_efectivos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provincias" (
    "codigo" character varying(4) NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "departamento_codigo" character varying(2) NOT NULL,
    "activo" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."provincias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" character varying(50) NOT NULL,
    "descripcion" "text",
    "nivel_acceso" integer DEFAULT 1,
    "activo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sugerencias_catalogos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tipo" character varying(50) NOT NULL,
    "categoria_padre" character varying(100),
    "valor_sugerido" character varying(255) NOT NULL,
    "usuario_id" "uuid",
    "estado" character varying(20) DEFAULT 'pendiente'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sugerencias_catalogos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "yape_limite_diario" numeric(15,2) DEFAULT 500.00,
    "yape_exigir_evidencia" boolean DEFAULT true,
    "yape_destino_personal_permitido" boolean DEFAULT false,
    "tesoreria_separar_cuentas_socios" boolean DEFAULT true,
    "tesoreria_retiro_desde_caja" boolean DEFAULT false,
    "credito_renovacion_genera_nuevo_contrato" boolean DEFAULT false,
    "credito_calculo_interes_anticipado" "text" DEFAULT 'PERIODO_COMPLETO'::"text",
    "credito_liberacion_garantia_parcial" boolean DEFAULT false,
    "credito_interes_moratorio_diario" numeric(5,3) DEFAULT 0.5,
    "remate_precio_base_automatico" boolean DEFAULT true,
    "remate_devolver_excedente" boolean DEFAULT true,
    "caja_permiso_anular_recibo" boolean DEFAULT false,
    "caja_cierre_ciego" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid",
    "precio_oro_24k_pen" numeric(10,2) DEFAULT 220.00,
    "precio_oro_22k_pen" numeric(10,2) DEFAULT 200.00,
    "precio_oro_21k_pen" numeric(10,2) DEFAULT 190.00,
    "precio_oro_18k_pen" numeric(10,2) DEFAULT 165.00,
    "precio_oro_14k_pen" numeric(10,2) DEFAULT 128.00,
    "precio_oro_10k_pen" numeric(10,2) DEFAULT 92.00,
    "precio_oro_updated_at" timestamp with time zone DEFAULT "now"(),
    "precio_oro_source" character varying(50) DEFAULT 'manual'::character varying
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."system_settings" IS 'SINGLETON: Motor de Reglas. Admin ajusta comportamiento sin reprogramar.';



COMMENT ON COLUMN "public"."system_settings"."caja_cierre_ciego" IS 'TRUE = Cajero cierra sin ver saldo (estándar bancario). FALSE = Ver saldo.';



COMMENT ON COLUMN "public"."system_settings"."precio_oro_24k_pen" IS 'Precio del oro 24K por gramo en PEN (fuente: GoldAPI.io)';



COMMENT ON COLUMN "public"."system_settings"."precio_oro_updated_at" IS 'Última actualización del precio del oro';



COMMENT ON COLUMN "public"."system_settings"."precio_oro_source" IS 'Fuente del precio: manual o goldapi';



CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid",
    "email" character varying(100) NOT NULL,
    "nombres" character varying(100) NOT NULL,
    "apellido_paterno" character varying(100),
    "apellido_materno" character varying(100),
    "dni" character varying(8),
    "rol_id" "uuid",
    "rol" character varying(50),
    "activo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verificacion_whatsapp" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "telefono" character varying(9) NOT NULL,
    "codigo" character varying(6) NOT NULL,
    "creado_en" timestamp with time zone DEFAULT "now"(),
    "expira_en" timestamp with time zone NOT NULL,
    "verificado" boolean DEFAULT false,
    "creado_por" "uuid"
);


ALTER TABLE "public"."verificacion_whatsapp" OWNER TO "postgres";


COMMENT ON TABLE "public"."verificacion_whatsapp" IS 'Almacena códigos OTP para validación de teléfonos vía WhatsApp.';



COMMENT ON COLUMN "public"."verificacion_whatsapp"."telefono" IS 'Número de teléfono (9 dígitos) sin prefijo de país.';



COMMENT ON COLUMN "public"."verificacion_whatsapp"."codigo" IS 'Código numérico de 6 dígitos generado aleatoriamente.';



COMMENT ON COLUMN "public"."verificacion_whatsapp"."expira_en" IS 'Timestamp de expiración (usualmente 5 min desde creación).';



COMMENT ON COLUMN "public"."verificacion_whatsapp"."verificado" IS 'Flag que indica si el código ya fue canjeado exitosamente.';



CREATE OR REPLACE VIEW "public"."vista_creditos_intereses" AS
 SELECT "c"."id",
    "c"."codigo",
    "c"."monto_prestado",
    "c"."tasa_interes",
    "c"."dias_transcurridos",
    "c"."interes_devengado_actual",
    "c"."fecha_desembolso",
    "c"."fecha_vencimiento",
    "c"."saldo_pendiente",
    "c"."estado_detallado",
    "round"((("c"."monto_prestado" * ("c"."tasa_interes" / 100.0)) * (("c"."periodo_dias")::numeric / 30.0)), 2) AS "interes_total_vencimiento",
        CASE
            WHEN ("c"."periodo_dias" > 0) THEN "round"((((COALESCE("c"."dias_transcurridos", 0))::numeric / ("c"."periodo_dias")::numeric) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS "porcentaje_devengado",
    "cl"."nombres" AS "cliente_nombre",
    "cl"."numero_documento" AS "cliente_dni"
   FROM ("public"."creditos" "c"
     LEFT JOIN "public"."clientes" "cl" ON (("c"."cliente_id" = "cl"."id")))
  WHERE (("c"."estado_detallado")::"text" <> ALL (ARRAY[('cancelado'::character varying)::"text", ('ejecutado'::character varying)::"text", ('anulado'::character varying)::"text"]));


ALTER VIEW "public"."vista_creditos_intereses" OWNER TO "postgres";


COMMENT ON VIEW "public"."vista_creditos_intereses" IS 'Vista completa de créditos con información de intereses calculados';



ALTER TABLE ONLY "public"."eventos_sistema" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."eventos_sistema_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auditoria_transacciones"
    ADD CONSTRAINT "auditoria_transacciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boveda_central"
    ADD CONSTRAINT "boveda_central_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cajas_operativas"
    ADD CONSTRAINT "cajas_operativas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categorias_garantia"
    ADD CONSTRAINT "categorias_garantia_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_numero_documento_key" UNIQUE ("numero_documento");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creditos"
    ADD CONSTRAINT "creditos_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."creditos"
    ADD CONSTRAINT "creditos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departamentos"
    ADD CONSTRAINT "departamentos_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."distritos"
    ADD CONSTRAINT "distritos_pkey" PRIMARY KEY ("ubigeo_inei");



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_persona_id_unique" UNIQUE ("persona_id");



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_ruc_key" UNIQUE ("ruc");



ALTER TABLE ONLY "public"."eventos_sistema"
    ADD CONSTRAINT "eventos_sistema_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garantias"
    ADD CONSTRAINT "garantias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."movimientos_boveda_auditoria"
    ADD CONSTRAINT "movimientos_boveda_auditoria_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."movimientos_caja_operativa"
    ADD CONSTRAINT "movimientos_caja_operativa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notificaciones_enviadas"
    ADD CONSTRAINT "notificaciones_enviadas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notificaciones_pendientes"
    ADD CONSTRAINT "notificaciones_pendientes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pagos"
    ADD CONSTRAINT "pagos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."personas"
    ADD CONSTRAINT "personas_numero_documento_key" UNIQUE ("numero_documento");



ALTER TABLE ONLY "public"."personas"
    ADD CONSTRAINT "personas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."provincias"
    ADD CONSTRAINT "provincias_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sugerencias_catalogos"
    ADD CONSTRAINT "sugerencias_catalogos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verificacion_whatsapp"
    ADD CONSTRAINT "verificacion_whatsapp_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_log_created" ON "public"."audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_log_registro" ON "public"."audit_log" USING "btree" ("registro_id");



CREATE INDEX "idx_audit_log_tabla" ON "public"."audit_log" USING "btree" ("tabla");



CREATE INDEX "idx_audit_log_usuario" ON "public"."audit_log" USING "btree" ("usuario_id");



CREATE INDEX "idx_auditoria_empleado" ON "public"."auditoria_transacciones" USING "btree" ("empleado_id");



CREATE INDEX "idx_auditoria_registro" ON "public"."auditoria_transacciones" USING "btree" ("registro_id");



CREATE INDEX "idx_auditoria_tabla" ON "public"."auditoria_transacciones" USING "btree" ("tabla_afectada");



CREATE INDEX "idx_auditoria_tabla_registro" ON "public"."auditoria_transacciones" USING "btree" ("tabla_afectada", "registro_id");



CREATE INDEX "idx_auditoria_timestamp" ON "public"."auditoria_transacciones" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_auditoria_usuario" ON "public"."auditoria_transacciones" USING "btree" ("usuario_id");



CREATE INDEX "idx_cajas_operativas_estado" ON "public"."cajas_operativas" USING "btree" ("estado");



CREATE INDEX "idx_cajas_operativas_fecha_apertura" ON "public"."cajas_operativas" USING "btree" ("fecha_apertura");



CREATE INDEX "idx_cajas_operativas_usuario" ON "public"."cajas_operativas" USING "btree" ("usuario_id");



CREATE INDEX "idx_cajas_usuario_estado" ON "public"."cajas_operativas" USING "btree" ("usuario_id", "estado");



COMMENT ON INDEX "public"."idx_cajas_usuario_estado" IS 'Optimiza: buscar caja abierta de usuario (muy frecuente)';



CREATE INDEX "idx_clientes_activo_created" ON "public"."clientes" USING "btree" ("activo", "created_at" DESC);



CREATE INDEX "idx_clientes_deleted" ON "public"."clientes" USING "btree" ("_deleted") WHERE ("_deleted" = false);



CREATE INDEX "idx_clientes_documento" ON "public"."clientes" USING "btree" ("numero_documento");



CREATE INDEX "idx_clientes_modified" ON "public"."clientes" USING "btree" ("_modified");



CREATE INDEX "idx_clientes_persona" ON "public"."clientes" USING "btree" ("persona_id");



CREATE INDEX "idx_creditos_caja_origen" ON "public"."creditos" USING "btree" ("caja_origen_id");



CREATE INDEX "idx_creditos_cliente" ON "public"."creditos" USING "btree" ("cliente_id");



CREATE INDEX "idx_creditos_cliente_estado" ON "public"."creditos" USING "btree" ("cliente_id", "estado");



COMMENT ON INDEX "public"."idx_creditos_cliente_estado" IS 'Optimiza: buscar créditos de cliente por estado';



CREATE INDEX "idx_creditos_codigo" ON "public"."creditos" USING "btree" ("codigo_credito");



CREATE INDEX "idx_creditos_deleted" ON "public"."creditos" USING "btree" ("_deleted") WHERE ("_deleted" = false);



CREATE INDEX "idx_creditos_dias_transcurridos" ON "public"."creditos" USING "btree" ("dias_transcurridos");



CREATE INDEX "idx_creditos_estado" ON "public"."creditos" USING "btree" ("estado");



CREATE INDEX "idx_creditos_estado_detallado" ON "public"."creditos" USING "btree" ("estado_detallado");



COMMENT ON INDEX "public"."idx_creditos_estado_detallado" IS 'Optimiza: filtrar por estado_detallado en dashboard';



CREATE INDEX "idx_creditos_estado_vencimiento" ON "public"."creditos" USING "btree" ("estado", "fecha_vencimiento");



COMMENT ON INDEX "public"."idx_creditos_estado_vencimiento" IS 'Optimiza semáforo de riesgo (filtrado por estado)';



CREATE INDEX "idx_creditos_fecha_vencimiento" ON "public"."creditos" USING "btree" ("fecha_vencimiento");



COMMENT ON INDEX "public"."idx_creditos_fecha_vencimiento" IS 'Optimiza: ordenar créditos por vencimiento';



CREATE INDEX "idx_creditos_garantia" ON "public"."creditos" USING "btree" ("garantia_id");



CREATE INDEX "idx_creditos_modified" ON "public"."creditos" USING "btree" ("_modified");



CREATE INDEX "idx_empleados_cargo" ON "public"."empleados" USING "btree" ("cargo");



CREATE INDEX "idx_empleados_persona" ON "public"."empleados" USING "btree" ("persona_id");



CREATE INDEX "idx_empleados_persona_id" ON "public"."empleados" USING "btree" ("persona_id");



CREATE INDEX "idx_empleados_user_id" ON "public"."empleados" USING "btree" ("user_id");



CREATE INDEX "idx_eventos_agregado" ON "public"."eventos_sistema" USING "btree" ("agregado_tipo", "agregado_id");



CREATE INDEX "idx_garantias_cliente" ON "public"."garantias" USING "btree" ("cliente_id");



CREATE INDEX "idx_garantias_credito" ON "public"."garantias" USING "btree" ("credito_id");



CREATE INDEX "idx_garantias_deleted" ON "public"."garantias" USING "btree" ("_deleted") WHERE ("_deleted" = false);



CREATE INDEX "idx_garantias_estado" ON "public"."garantias" USING "btree" ("estado");



CREATE INDEX "idx_garantias_modified" ON "public"."garantias" USING "btree" ("_modified");



CREATE INDEX "idx_movimientos_anulado" ON "public"."movimientos_caja_operativa" USING "btree" ("anulado");



CREATE INDEX "idx_movimientos_boveda_boveda_id" ON "public"."movimientos_boveda_auditoria" USING "btree" ("boveda_id");



CREATE INDEX "idx_movimientos_boveda_fecha" ON "public"."movimientos_boveda_auditoria" USING "btree" ("fecha");



CREATE INDEX "idx_movimientos_boveda_metadata" ON "public"."movimientos_boveda_auditoria" USING "gin" ("metadata");



CREATE INDEX "idx_movimientos_boveda_tipo" ON "public"."movimientos_boveda_auditoria" USING "btree" ("tipo");



CREATE INDEX "idx_movimientos_boveda_usuario" ON "public"."movimientos_boveda_auditoria" USING "btree" ("usuario_responsable_id");



CREATE INDEX "idx_movimientos_caja_created" ON "public"."movimientos_caja_operativa" USING "btree" ("caja_operativa_id", "fecha" DESC);



CREATE INDEX "idx_movimientos_caja_id" ON "public"."movimientos_caja_operativa" USING "btree" ("caja_id");



CREATE INDEX "idx_movimientos_caja_operativa_caja" ON "public"."movimientos_caja_operativa" USING "btree" ("caja_operativa_id");



CREATE INDEX "idx_movimientos_caja_operativa_fecha" ON "public"."movimientos_caja_operativa" USING "btree" ("fecha");



CREATE INDEX "idx_movimientos_caja_operativa_referencia" ON "public"."movimientos_caja_operativa" USING "btree" ("referencia_id");



CREATE INDEX "idx_movimientos_caja_operativa_tipo" ON "public"."movimientos_caja_operativa" USING "btree" ("tipo");



CREATE INDEX "idx_movimientos_caja_operativa_usuario" ON "public"."movimientos_caja_operativa" USING "btree" ("usuario_id");



CREATE INDEX "idx_movimientos_deleted" ON "public"."movimientos_caja_operativa" USING "btree" ("_deleted") WHERE ("_deleted" = false);



CREATE INDEX "idx_movimientos_fecha" ON "public"."movimientos_caja_operativa" USING "btree" ("fecha" DESC);



CREATE INDEX "idx_movimientos_modified" ON "public"."movimientos_caja_operativa" USING "btree" ("_modified");



CREATE INDEX "idx_notif_cliente" ON "public"."notificaciones_pendientes" USING "btree" ("cliente_id");



CREATE INDEX "idx_notif_estado" ON "public"."notificaciones_pendientes" USING "btree" ("estado");



CREATE INDEX "idx_notif_tipo" ON "public"."notificaciones_pendientes" USING "btree" ("tipo");



CREATE INDEX "idx_notificaciones_cliente" ON "public"."notificaciones_enviadas" USING "btree" ("cliente_id");



CREATE INDEX "idx_notificaciones_credito" ON "public"."notificaciones_enviadas" USING "btree" ("credito_id");



CREATE INDEX "idx_notificaciones_fecha" ON "public"."notificaciones_enviadas" USING "btree" ("fecha_envio" DESC);



CREATE INDEX "idx_pagos_anulado" ON "public"."pagos" USING "btree" ("anulado");



CREATE INDEX "idx_pagos_caja" ON "public"."pagos" USING "btree" ("caja_operativa_id");



CREATE INDEX "idx_pagos_created_at" ON "public"."pagos" USING "btree" ("created_at");



CREATE INDEX "idx_pagos_credito" ON "public"."pagos" USING "btree" ("credito_id");



CREATE INDEX "idx_pagos_credito_id" ON "public"."pagos" USING "btree" ("credito_id");



CREATE INDEX "idx_pagos_deleted" ON "public"."pagos" USING "btree" ("_deleted") WHERE ("_deleted" = false);



CREATE INDEX "idx_pagos_fecha" ON "public"."pagos" USING "btree" ("fecha_pago" DESC);



CREATE INDEX "idx_pagos_modified" ON "public"."pagos" USING "btree" ("_modified");



CREATE INDEX "idx_pagos_tipo" ON "public"."pagos" USING "btree" ("tipo");



CREATE INDEX "idx_pagos_usuario" ON "public"."pagos" USING "btree" ("usuario_id");



CREATE INDEX "idx_pagos_usuario_id" ON "public"."pagos" USING "btree" ("usuario_id");



CREATE INDEX "idx_personas_apellido_paterno" ON "public"."personas" USING "btree" ("apellido_paterno");



CREATE INDEX "idx_personas_documento" ON "public"."personas" USING "btree" ("numero_documento");



CREATE INDEX "idx_personas_nombres" ON "public"."personas" USING "btree" ("nombres");



CREATE INDEX "idx_personas_numero_documento" ON "public"."personas" USING "btree" ("numero_documento");



CREATE INDEX "idx_system_settings_updated" ON "public"."system_settings" USING "btree" ("updated_at");



CREATE UNIQUE INDEX "idx_unique_active_caja" ON "public"."cajas_operativas" USING "btree" ("usuario_id") WHERE (("estado")::"text" = 'abierta'::"text");



CREATE INDEX "idx_usuarios_email" ON "public"."usuarios" USING "btree" ("email");



CREATE INDEX "idx_usuarios_rol" ON "public"."usuarios" USING "btree" ("rol");



CREATE INDEX "idx_verificacion_codigo" ON "public"."verificacion_whatsapp" USING "btree" ("telefono", "codigo") WHERE ("verificado" = false);



CREATE INDEX "idx_verificacion_expira" ON "public"."verificacion_whatsapp" USING "btree" ("expira_en");



CREATE INDEX "idx_verificacion_telefono" ON "public"."verificacion_whatsapp" USING "btree" ("telefono");



CREATE OR REPLACE TRIGGER "audit_cajas" AFTER INSERT OR DELETE OR UPDATE ON "public"."cajas_operativas" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "audit_creditos" AFTER INSERT OR DELETE OR UPDATE ON "public"."creditos" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "audit_empleados" AFTER INSERT OR DELETE OR UPDATE ON "public"."empleados" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "audit_garantias" AFTER INSERT OR DELETE OR UPDATE ON "public"."garantias" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "audit_pagos" AFTER INSERT OR DELETE OR UPDATE ON "public"."pagos" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "audit_personas" AFTER INSERT OR DELETE OR UPDATE ON "public"."personas" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "empleados_updated_at_trigger" BEFORE UPDATE ON "public"."empleados" FOR EACH ROW EXECUTE FUNCTION "public"."update_personas_updated_at"();



CREATE OR REPLACE TRIGGER "personas_updated_at_trigger" BEFORE UPDATE ON "public"."personas" FOR EACH ROW EXECUTE FUNCTION "public"."update_personas_updated_at"();



CREATE OR REPLACE TRIGGER "trg_check_boveda" BEFORE UPDATE ON "public"."boveda_central" FOR EACH ROW EXECUTE FUNCTION "public"."check_saldos_boveda"();



CREATE OR REPLACE TRIGGER "trg_procesar_pago_insert" BEFORE INSERT ON "public"."pagos" FOR EACH ROW EXECUTE FUNCTION "public"."procesar_pago_trigger_fn"();



CREATE OR REPLACE TRIGGER "trg_security_sod_creditos" BEFORE INSERT OR UPDATE ON "public"."creditos" FOR EACH ROW EXECUTE FUNCTION "public"."security_prevent_self_credit"();



CREATE OR REPLACE TRIGGER "trg_security_sod_pagos" BEFORE INSERT ON "public"."pagos" FOR EACH ROW EXECUTE FUNCTION "public"."security_prevent_self_payment"();



CREATE OR REPLACE TRIGGER "trg_sync_caja_ids" BEFORE INSERT OR UPDATE ON "public"."movimientos_caja_operativa" FOR EACH ROW EXECUTE FUNCTION "public"."sync_caja_ids"();



CREATE OR REPLACE TRIGGER "trg_update_saldo_credito" AFTER INSERT ON "public"."pagos" FOR EACH ROW EXECUTE FUNCTION "public"."update_saldo_credito_on_pago"();



CREATE OR REPLACE TRIGGER "trigger_actualizar_estado_credito" BEFORE INSERT OR UPDATE ON "public"."creditos" FOR EACH ROW EXECUTE FUNCTION "public"."actualizar_estado_credito"();



CREATE OR REPLACE TRIGGER "trigger_actualizar_interes" BEFORE INSERT OR UPDATE ON "public"."creditos" FOR EACH ROW EXECUTE FUNCTION "public"."actualizar_interes_devengado"();



CREATE OR REPLACE TRIGGER "trigger_validate_credito_update" BEFORE UPDATE ON "public"."creditos" FOR EACH ROW EXECUTE FUNCTION "public"."validate_credito_update"();



CREATE OR REPLACE TRIGGER "trigger_validate_pago_insert" BEFORE INSERT ON "public"."pagos" FOR EACH ROW EXECUTE FUNCTION "public"."validate_pago_insert"();



CREATE OR REPLACE TRIGGER "update_cajas_modified" BEFORE UPDATE ON "public"."cajas_operativas" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('_modified');



CREATE OR REPLACE TRIGGER "update_clientes_modified" BEFORE UPDATE ON "public"."clientes" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('_modified');



CREATE OR REPLACE TRIGGER "update_creditos_modified" BEFORE UPDATE ON "public"."creditos" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('_modified');



CREATE OR REPLACE TRIGGER "update_garantias_modified" BEFORE UPDATE ON "public"."garantias" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('_modified');



CREATE OR REPLACE TRIGGER "update_movimientos_modified" BEFORE UPDATE ON "public"."movimientos_caja_operativa" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('_modified');



CREATE OR REPLACE TRIGGER "update_pagos_modified" BEFORE UPDATE ON "public"."pagos" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('_modified');



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."auditoria_transacciones"
    ADD CONSTRAINT "auditoria_transacciones_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleados"("id");



ALTER TABLE ONLY "public"."auditoria_transacciones"
    ADD CONSTRAINT "auditoria_transacciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."boveda_central"
    ADD CONSTRAINT "boveda_central_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."cajas_operativas"
    ADD CONSTRAINT "cajas_operativas_boveda_origen_id_fkey" FOREIGN KEY ("boveda_origen_id") REFERENCES "public"."boveda_central"("id");



ALTER TABLE ONLY "public"."cajas_operativas"
    ADD CONSTRAINT "cajas_operativas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id");



ALTER TABLE ONLY "public"."creditos"
    ADD CONSTRAINT "creditos_caja_origen_id_fkey" FOREIGN KEY ("caja_origen_id") REFERENCES "public"."cajas_operativas"("id");



ALTER TABLE ONLY "public"."creditos"
    ADD CONSTRAINT "creditos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id");



ALTER TABLE ONLY "public"."creditos"
    ADD CONSTRAINT "creditos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."creditos"
    ADD CONSTRAINT "creditos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id");



ALTER TABLE ONLY "public"."creditos"
    ADD CONSTRAINT "creditos_garantia_id_fkey" FOREIGN KEY ("garantia_id") REFERENCES "public"."garantias"("id");



ALTER TABLE ONLY "public"."distritos"
    ADD CONSTRAINT "distritos_provincia_codigo_fkey" FOREIGN KEY ("provincia_codigo") REFERENCES "public"."provincias"("codigo");



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empleados"
    ADD CONSTRAINT "empleados_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."eventos_sistema"
    ADD CONSTRAINT "eventos_sistema_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."garantias"
    ADD CONSTRAINT "garantias_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_garantia"("id");



ALTER TABLE ONLY "public"."garantias"
    ADD CONSTRAINT "garantias_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id");



ALTER TABLE ONLY "public"."garantias"
    ADD CONSTRAINT "garantias_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "public"."creditos"("id");



ALTER TABLE ONLY "public"."movimientos_boveda_auditoria"
    ADD CONSTRAINT "movimientos_boveda_auditoria_boveda_id_fkey" FOREIGN KEY ("boveda_id") REFERENCES "public"."boveda_central"("id");



ALTER TABLE ONLY "public"."movimientos_boveda_auditoria"
    ADD CONSTRAINT "movimientos_boveda_auditoria_caja_operativa_id_fkey" FOREIGN KEY ("caja_operativa_id") REFERENCES "public"."cajas_operativas"("id");



ALTER TABLE ONLY "public"."movimientos_boveda_auditoria"
    ADD CONSTRAINT "movimientos_boveda_auditoria_usuario_responsable_id_fkey" FOREIGN KEY ("usuario_responsable_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."movimientos_caja_operativa"
    ADD CONSTRAINT "movimientos_caja_operativa_anulado_por_fkey" FOREIGN KEY ("anulado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."movimientos_caja_operativa"
    ADD CONSTRAINT "movimientos_caja_operativa_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "public"."cajas_operativas"("id");



ALTER TABLE ONLY "public"."movimientos_caja_operativa"
    ADD CONSTRAINT "movimientos_caja_operativa_caja_operativa_id_fkey" FOREIGN KEY ("caja_operativa_id") REFERENCES "public"."cajas_operativas"("id");



ALTER TABLE ONLY "public"."movimientos_caja_operativa"
    ADD CONSTRAINT "movimientos_caja_operativa_movimiento_original_id_fkey" FOREIGN KEY ("movimiento_original_id") REFERENCES "public"."movimientos_caja_operativa"("id");



ALTER TABLE ONLY "public"."movimientos_caja_operativa"
    ADD CONSTRAINT "movimientos_caja_operativa_movimiento_reversion_id_fkey" FOREIGN KEY ("movimiento_reversion_id") REFERENCES "public"."movimientos_caja_operativa"("id");



ALTER TABLE ONLY "public"."movimientos_caja_operativa"
    ADD CONSTRAINT "movimientos_caja_operativa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."notificaciones_enviadas"
    ADD CONSTRAINT "notificaciones_enviadas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notificaciones_enviadas"
    ADD CONSTRAINT "notificaciones_enviadas_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "public"."creditos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notificaciones_enviadas"
    ADD CONSTRAINT "notificaciones_enviadas_enviado_por_fkey" FOREIGN KEY ("enviado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notificaciones_pendientes"
    ADD CONSTRAINT "notificaciones_pendientes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id");



ALTER TABLE ONLY "public"."notificaciones_pendientes"
    ADD CONSTRAINT "notificaciones_pendientes_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "public"."creditos"("id");



ALTER TABLE ONLY "public"."pagos"
    ADD CONSTRAINT "pagos_anulado_por_fkey" FOREIGN KEY ("anulado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."pagos"
    ADD CONSTRAINT "pagos_caja_operativa_id_fkey" FOREIGN KEY ("caja_operativa_id") REFERENCES "public"."cajas_operativas"("id");



ALTER TABLE ONLY "public"."pagos"
    ADD CONSTRAINT "pagos_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "public"."creditos"("id");



ALTER TABLE ONLY "public"."pagos"
    ADD CONSTRAINT "pagos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."provincias"
    ADD CONSTRAINT "provincias_departamento_codigo_fkey" FOREIGN KEY ("departamento_codigo") REFERENCES "public"."departamentos"("codigo");



ALTER TABLE ONLY "public"."sugerencias_catalogos"
    ADD CONSTRAINT "sugerencias_catalogos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."verificacion_whatsapp"
    ADD CONSTRAINT "verificacion_whatsapp_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "auth"."users"("id");



CREATE POLICY "Admin maneja bóveda" ON "public"."boveda_central" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."rol")::"text" = 'admin'::"text")))));



CREATE POLICY "Admin ve todo cajas" ON "public"."cajas_operativas" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."rol")::"text" = 'admin'::"text")))));



CREATE POLICY "Admins can read audit_log" ON "public"."audit_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."rol")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('super_admin'::character varying)::"text"]))))));



CREATE POLICY "Authenticated users can insert audit_log" ON "public"."audit_log" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can manage notificaciones" ON "public"."notificaciones_pendientes" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Cajero ve su propia caja" ON "public"."cajas_operativas" FOR SELECT USING (("usuario_id" = "auth"."uid"()));



CREATE POLICY "Gerente lee bóveda" ON "public"."boveda_central" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."rol")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('gerente'::character varying)::"text"]))))));



CREATE POLICY "Lectura config" ON "public"."system_settings" FOR SELECT USING (true);



CREATE POLICY "Service role can do everything" ON "public"."verificacion_whatsapp" USING (true) WITH CHECK (true);



CREATE POLICY "Service role tiene acceso completo" ON "public"."boveda_central" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Solo admins actualizan config" ON "public"."system_settings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."rol")::"text" = 'admin'::"text")))));



CREATE POLICY "Usuarios autenticados pueden leer bóveda" ON "public"."boveda_central" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."movimientos_caja_operativa" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "movimientos_insert_authenticated" ON "public"."movimientos_caja_operativa" FOR INSERT TO "authenticated" WITH CHECK (true);



COMMENT ON POLICY "movimientos_insert_authenticated" ON "public"."movimientos_caja_operativa" IS 'Permite a usuarios autenticados insertar movimientos de caja. El control de acceso es validado en código.';



CREATE POLICY "movimientos_select_admin" ON "public"."movimientos_caja_operativa" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND (("usuarios"."rol")::"text" = ANY (ARRAY[('admin'::character varying)::"text", ('gerente'::character varying)::"text"]))))));



CREATE POLICY "movimientos_select_own_caja" ON "public"."movimientos_caja_operativa" FOR SELECT TO "authenticated" USING (("caja_operativa_id" IN ( SELECT "cajas_operativas"."id"
   FROM "public"."cajas_operativas"
  WHERE ("cajas_operativas"."usuario_id" = "auth"."uid"()))));



ALTER TABLE "public"."notificaciones_pendientes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verificacion_whatsapp" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."clientes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."creditos";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."garantias";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."movimientos_caja_operativa";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."pagos";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


































































































































































GRANT ALL ON FUNCTION "public"."actualizar_estado_credito"() TO "anon";
GRANT ALL ON FUNCTION "public"."actualizar_estado_credito"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."actualizar_estado_credito"() TO "service_role";



GRANT ALL ON FUNCTION "public"."actualizar_interes_devengado"() TO "anon";
GRANT ALL ON FUNCTION "public"."actualizar_interes_devengado"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."actualizar_interes_devengado"() TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_asignar_caja"("p_usuario_cajero_id" "uuid", "p_monto" numeric, "p_observacion" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_asignar_caja"("p_usuario_cajero_id" "uuid", "p_monto" numeric, "p_observacion" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_asignar_caja"("p_usuario_cajero_id" "uuid", "p_monto" numeric, "p_observacion" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_inyectar_capital"("p_monto" numeric, "p_origen" "text", "p_referencia" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_inyectar_capital"("p_monto" numeric, "p_origen" "text", "p_referencia" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_inyectar_capital"("p_monto" numeric, "p_origen" "text", "p_referencia" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."anular_pago"("p_pago_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."anular_pago"("p_pago_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."anular_pago"("p_pago_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "service_role";



GRANT ALL ON FUNCTION "public"."buscar_clientes_con_creditos"("p_search_term" "text", "p_is_dni" boolean, "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."buscar_clientes_con_creditos"("p_search_term" "text", "p_is_dni" boolean, "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."buscar_clientes_con_creditos"("p_search_term" "text", "p_is_dni" boolean, "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calcular_interes_actual"("p_credito_id" "uuid", "p_fecha_calculo" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calcular_interes_actual"("p_credito_id" "uuid", "p_fecha_calculo" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calcular_interes_actual"("p_credito_id" "uuid", "p_fecha_calculo" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."calcular_saldo_caja"("p_caja_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calcular_saldo_caja"("p_caja_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calcular_saldo_caja"("p_caja_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cerrar_caja_oficial"("p_caja_id" "uuid", "p_monto_fisico" numeric, "p_observaciones" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cerrar_caja_oficial"("p_caja_id" "uuid", "p_monto_fisico" numeric, "p_observaciones" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cerrar_caja_oficial"("p_caja_id" "uuid", "p_monto_fisico" numeric, "p_observaciones" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_saldos_boveda"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_saldos_boveda"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_saldos_boveda"() TO "service_role";



GRANT ALL ON FUNCTION "public"."conciliar_caja_dia"("p_fecha" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."conciliar_caja_dia"("p_fecha" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."conciliar_caja_dia"("p_fecha" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."crear_contrato_oficial"("p_caja_id" "uuid", "p_cliente_doc_tipo" "text", "p_cliente_doc_num" "text", "p_cliente_nombre" "text", "p_garantia_data" "jsonb", "p_contrato_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."crear_contrato_oficial"("p_caja_id" "uuid", "p_cliente_doc_tipo" "text", "p_cliente_doc_num" "text", "p_cliente_nombre" "text", "p_garantia_data" "jsonb", "p_contrato_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crear_contrato_oficial"("p_caja_id" "uuid", "p_cliente_doc_tipo" "text", "p_cliente_doc_num" "text", "p_cliente_nombre" "text", "p_garantia_data" "jsonb", "p_contrato_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."crear_credito_completo"("p_cliente_id" "uuid", "p_monto_prestamo" numeric, "p_valor_tasacion" numeric, "p_tasa_interes" numeric, "p_periodo_dias" integer, "p_fecha_inicio" timestamp with time zone, "p_descripcion_garantia" "text", "p_fotos" "text"[], "p_observaciones" "text", "p_usuario_id" "uuid", "p_caja_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."crear_credito_completo"("p_cliente_id" "uuid", "p_monto_prestamo" numeric, "p_valor_tasacion" numeric, "p_tasa_interes" numeric, "p_periodo_dias" integer, "p_fecha_inicio" timestamp with time zone, "p_descripcion_garantia" "text", "p_fotos" "text"[], "p_observaciones" "text", "p_usuario_id" "uuid", "p_caja_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crear_credito_completo"("p_cliente_id" "uuid", "p_monto_prestamo" numeric, "p_valor_tasacion" numeric, "p_tasa_interes" numeric, "p_periodo_dias" integer, "p_fecha_inicio" timestamp with time zone, "p_descripcion_garantia" "text", "p_fotos" "text"[], "p_observaciones" "text", "p_usuario_id" "uuid", "p_caja_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."detectar_actividad_sospechosa"() TO "anon";
GRANT ALL ON FUNCTION "public"."detectar_actividad_sospechosa"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."detectar_actividad_sospechosa"() TO "service_role";



GRANT ALL ON FUNCTION "public"."detectar_descuadres"("p_ultimos_dias" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."detectar_descuadres"("p_ultimos_dias" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."detectar_descuadres"("p_ultimos_dias" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generar_reporte_cierre"("p_fecha" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."generar_reporte_cierre"("p_fecha" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generar_reporte_cierre"("p_fecha" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_actividad_empleado"("p_empleado_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_actividad_empleado"("p_empleado_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_actividad_empleado"("p_empleado_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_auditoria_registro"("p_tabla" character varying, "p_registro_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_auditoria_registro"("p_tabla" character varying, "p_registro_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_auditoria_registro"("p_tabla" character varying, "p_registro_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_cartera_risk_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_cartera_risk_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_cartera_risk_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_contratos_renovables"("p_dias" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_contratos_renovables"("p_dias" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_contratos_renovables"("p_dias" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_contratos_vencimientos"("p_dias" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_contratos_vencimientos"("p_dias" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_contratos_vencimientos"("p_dias" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_historial_notificaciones"("p_credito_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_historial_notificaciones"("p_credito_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_historial_notificaciones"("p_credito_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_movimientos_dia"("p_fecha" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_movimientos_dia"("p_fecha" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_movimientos_dia"("p_fecha" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_or_create_persona"("p_tipo_documento" character varying, "p_numero_documento" character varying, "p_nombres" character varying, "p_apellido_paterno" character varying, "p_apellido_materno" character varying, "p_telefono" character varying, "p_email" character varying, "p_direccion" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_persona"("p_tipo_documento" character varying, "p_numero_documento" character varying, "p_nombres" character varying, "p_apellido_paterno" character varying, "p_apellido_materno" character varying, "p_telefono" character varying, "p_email" character varying, "p_direccion" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_persona"("p_tipo_documento" character varying, "p_numero_documento" character varying, "p_nombres" character varying, "p_apellido_paterno" character varying, "p_apellido_materno" character varying, "p_telefono" character varying, "p_email" character varying, "p_direccion" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_saldo_caja_efectivo"("p_caja_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_saldo_caja_efectivo"("p_caja_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_saldo_caja_efectivo"("p_caja_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_upcoming_expirations"("p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_upcoming_expirations"("p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_upcoming_expirations"("p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vencimientos_agrupados"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_vencimientos_agrupados"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vencimientos_agrupados"() TO "service_role";



GRANT ALL ON FUNCTION "public"."job_actualizar_estados_creditos"() TO "anon";
GRANT ALL ON FUNCTION "public"."job_actualizar_estados_creditos"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."job_actualizar_estados_creditos"() TO "service_role";



GRANT ALL ON FUNCTION "public"."limpiar_codigos_expirados"() TO "anon";
GRANT ALL ON FUNCTION "public"."limpiar_codigos_expirados"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."limpiar_codigos_expirados"() TO "service_role";



GRANT ALL ON FUNCTION "public"."procesar_pago_trigger_fn"() TO "anon";
GRANT ALL ON FUNCTION "public"."procesar_pago_trigger_fn"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."procesar_pago_trigger_fn"() TO "service_role";



GRANT ALL ON FUNCTION "public"."proyectar_interes"("p_credito_id" "uuid", "p_dias_adicionales" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."proyectar_interes"("p_credito_id" "uuid", "p_dias_adicionales" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."proyectar_interes"("p_credito_id" "uuid", "p_dias_adicionales" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."puede_anular_movimiento"("p_movimiento_id" "uuid", "p_usuario_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."puede_anular_movimiento"("p_movimiento_id" "uuid", "p_usuario_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."puede_anular_movimiento"("p_movimiento_id" "uuid", "p_usuario_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."puede_enviar_notificacion"("p_credito_id" "uuid", "p_horas_minimas" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."puede_enviar_notificacion"("p_credito_id" "uuid", "p_horas_minimas" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."puede_enviar_notificacion"("p_credito_id" "uuid", "p_horas_minimas" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."registrar_evento"("p_agregado_tipo" character varying, "p_agregado_id" "uuid", "p_evento_tipo" character varying, "p_payload" "jsonb", "p_usuario_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."registrar_evento"("p_agregado_tipo" character varying, "p_agregado_id" "uuid", "p_evento_tipo" character varying, "p_payload" "jsonb", "p_usuario_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."registrar_evento"("p_agregado_tipo" character varying, "p_agregado_id" "uuid", "p_evento_tipo" character varying, "p_payload" "jsonb", "p_usuario_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb", "p_usuario_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb", "p_usuario_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."registrar_pago_oficial"("p_caja_id" "uuid", "p_credito_id" "uuid", "p_monto_pago" numeric, "p_tipo_operacion" "text", "p_metodo_pago" "text", "p_metadata" "jsonb", "p_usuario_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."reversar_movimiento"("p_movimiento_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reversar_movimiento"("p_movimiento_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reversar_movimiento"("p_movimiento_id" "uuid", "p_motivo" "text", "p_usuario_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."security_prevent_self_credit"() TO "anon";
GRANT ALL ON FUNCTION "public"."security_prevent_self_credit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."security_prevent_self_credit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."security_prevent_self_payment"() TO "anon";
GRANT ALL ON FUNCTION "public"."security_prevent_self_payment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."security_prevent_self_payment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_caja_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_caja_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_caja_ids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_personas_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_personas_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_personas_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_saldo_credito_on_pago"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_saldo_credito_on_pago"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_saldo_credito_on_pago"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_credito_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_credito_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_credito_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_pago_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_pago_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_pago_insert"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."auditoria_transacciones" TO "anon";
GRANT ALL ON TABLE "public"."auditoria_transacciones" TO "authenticated";
GRANT ALL ON TABLE "public"."auditoria_transacciones" TO "service_role";



GRANT ALL ON TABLE "public"."boveda_central" TO "anon";
GRANT ALL ON TABLE "public"."boveda_central" TO "authenticated";
GRANT ALL ON TABLE "public"."boveda_central" TO "service_role";



GRANT ALL ON TABLE "public"."cajas_operativas" TO "anon";
GRANT ALL ON TABLE "public"."cajas_operativas" TO "authenticated";
GRANT ALL ON TABLE "public"."cajas_operativas" TO "service_role";



GRANT ALL ON TABLE "public"."categorias_garantia" TO "anon";
GRANT ALL ON TABLE "public"."categorias_garantia" TO "authenticated";
GRANT ALL ON TABLE "public"."categorias_garantia" TO "service_role";



GRANT ALL ON TABLE "public"."clientes" TO "anon";
GRANT ALL ON TABLE "public"."clientes" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes" TO "service_role";



GRANT ALL ON TABLE "public"."personas" TO "anon";
GRANT ALL ON TABLE "public"."personas" TO "authenticated";
GRANT ALL ON TABLE "public"."personas" TO "service_role";



GRANT ALL ON TABLE "public"."clientes_completo" TO "anon";
GRANT ALL ON TABLE "public"."clientes_completo" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes_completo" TO "service_role";



GRANT ALL ON TABLE "public"."creditos" TO "anon";
GRANT ALL ON TABLE "public"."creditos" TO "authenticated";
GRANT ALL ON TABLE "public"."creditos" TO "service_role";



GRANT ALL ON TABLE "public"."departamentos" TO "anon";
GRANT ALL ON TABLE "public"."departamentos" TO "authenticated";
GRANT ALL ON TABLE "public"."departamentos" TO "service_role";



GRANT ALL ON TABLE "public"."distritos" TO "anon";
GRANT ALL ON TABLE "public"."distritos" TO "authenticated";
GRANT ALL ON TABLE "public"."distritos" TO "service_role";



GRANT ALL ON TABLE "public"."empleados" TO "anon";
GRANT ALL ON TABLE "public"."empleados" TO "authenticated";
GRANT ALL ON TABLE "public"."empleados" TO "service_role";



GRANT ALL ON TABLE "public"."empleados_completo" TO "anon";
GRANT ALL ON TABLE "public"."empleados_completo" TO "authenticated";
GRANT ALL ON TABLE "public"."empleados_completo" TO "service_role";



GRANT ALL ON TABLE "public"."empresas" TO "anon";
GRANT ALL ON TABLE "public"."empresas" TO "authenticated";
GRANT ALL ON TABLE "public"."empresas" TO "service_role";



GRANT ALL ON TABLE "public"."eventos_sistema" TO "anon";
GRANT ALL ON TABLE "public"."eventos_sistema" TO "authenticated";
GRANT ALL ON TABLE "public"."eventos_sistema" TO "service_role";



GRANT ALL ON SEQUENCE "public"."eventos_sistema_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."eventos_sistema_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."eventos_sistema_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."garantias" TO "anon";
GRANT ALL ON TABLE "public"."garantias" TO "authenticated";
GRANT ALL ON TABLE "public"."garantias" TO "service_role";



GRANT ALL ON TABLE "public"."movimientos_boveda_auditoria" TO "anon";
GRANT ALL ON TABLE "public"."movimientos_boveda_auditoria" TO "authenticated";
GRANT ALL ON TABLE "public"."movimientos_boveda_auditoria" TO "service_role";



GRANT ALL ON TABLE "public"."movimientos_caja_operativa" TO "anon";
GRANT ALL ON TABLE "public"."movimientos_caja_operativa" TO "authenticated";
GRANT ALL ON TABLE "public"."movimientos_caja_operativa" TO "service_role";



GRANT ALL ON TABLE "public"."movimientos_efectivos" TO "anon";
GRANT ALL ON TABLE "public"."movimientos_efectivos" TO "authenticated";
GRANT ALL ON TABLE "public"."movimientos_efectivos" TO "service_role";



GRANT ALL ON TABLE "public"."notificaciones_enviadas" TO "anon";
GRANT ALL ON TABLE "public"."notificaciones_enviadas" TO "authenticated";
GRANT ALL ON TABLE "public"."notificaciones_enviadas" TO "service_role";



GRANT ALL ON TABLE "public"."notificaciones_pendientes" TO "anon";
GRANT ALL ON TABLE "public"."notificaciones_pendientes" TO "authenticated";
GRANT ALL ON TABLE "public"."notificaciones_pendientes" TO "service_role";



GRANT ALL ON TABLE "public"."pagos" TO "anon";
GRANT ALL ON TABLE "public"."pagos" TO "authenticated";
GRANT ALL ON TABLE "public"."pagos" TO "service_role";



GRANT ALL ON TABLE "public"."pagos_efectivos" TO "anon";
GRANT ALL ON TABLE "public"."pagos_efectivos" TO "authenticated";
GRANT ALL ON TABLE "public"."pagos_efectivos" TO "service_role";



GRANT ALL ON TABLE "public"."provincias" TO "anon";
GRANT ALL ON TABLE "public"."provincias" TO "authenticated";
GRANT ALL ON TABLE "public"."provincias" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."sugerencias_catalogos" TO "anon";
GRANT ALL ON TABLE "public"."sugerencias_catalogos" TO "authenticated";
GRANT ALL ON TABLE "public"."sugerencias_catalogos" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



GRANT ALL ON TABLE "public"."verificacion_whatsapp" TO "anon";
GRANT ALL ON TABLE "public"."verificacion_whatsapp" TO "authenticated";
GRANT ALL ON TABLE "public"."verificacion_whatsapp" TO "service_role";



GRANT ALL ON TABLE "public"."vista_creditos_intereses" TO "anon";
GRANT ALL ON TABLE "public"."vista_creditos_intereses" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_creditos_intereses" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































