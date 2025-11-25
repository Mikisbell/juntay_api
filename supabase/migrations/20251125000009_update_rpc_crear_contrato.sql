-- 🔧 Actualización del RPC crear_contrato_oficial para soportar campos nuevos de garantías
-- Versión: 3.1
-- Fecha: 2025-11-24
-- Cambio: Agregamos marca, modelo, serie, subcategoria, estado_bien a la inserción de garantías

CREATE OR REPLACE FUNCTION public.crear_contrato_oficial(
    p_caja_id UUID,              -- Quién está operando
    p_cliente_doc_tipo TEXT,     -- DNI/RUC
    p_cliente_doc_num TEXT,      -- Número documento
    p_cliente_nombre TEXT,       -- Nombre completo
    p_garantia_data JSONB,       -- { descripcion, categoria, valor_tasacion, estado, marca, modelo, serie }
    p_contrato_data JSONB        -- { monto, interes, dias, fecha_venc }
)
RETURNS UUID -- Retorna el ID del contrato creado
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cliente_id UUID;
    v_garantia_id UUID;
    v_contrato_id UUID;
    v_saldo_caja DECIMAL;
    v_monto_prestamo DECIMAL;
    v_usuario_id UUID;  -- ✅ NUEVO: guardar usuario_id de la caja
BEGIN
    -- 1. VALIDACIÓN PREVIA + Obtener usuario de la caja
    v_monto_prestamo := (p_contrato_data->>'monto')::DECIMAL;
    
    -- Obtener el usuario_id de la caja operativa
    SELECT usuario_id INTO v_usuario_id
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Caja no encontrada o sin usuario asignado: %', p_caja_id;
    END IF;
    
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
            (SELECT empresa_id FROM public.usuarios WHERE id = v_usuario_id)  -- ✅ CORREGIDO
        ) RETURNING id INTO v_cliente_id;
    END IF;

    -- 3. CREAR GARANTÍA (✨ ACTUALIZADO CON NUEVOS CAMPOS)
    INSERT INTO public.garantias (
        cliente_id,
        descripcion,
        valor_tasacion,      -- ← CAMPO CRÍTICO
        estado,
        categoria_id,
        fotos_urls,
        -- 🆕 NUEVOS CAMPOS (agregados en migración 20251125000006)
        marca,
        modelo,
        serie,
        subcategoria,
        estado_bien
    ) VALUES (
        v_cliente_id,
        p_garantia_data->>'descripcion',
        (p_garantia_data->>'valor_tasacion')::DECIMAL,  -- ← DEBE SER NOT NULL
        'custodia',
        NULL,  -- categoria_id (legacy, usar subcategoria en su lugar)
        (SELECT ARRAY(SELECT jsonb_array_elements_text(p_garantia_data->'fotos'))),
        -- 🆕 Valores de los nuevos campos
        p_garantia_data->>'marca',
        p_garantia_data->>'modelo',
        p_garantia_data->>'serie',
        p_garantia_data->>'subcategoria',
        COALESCE(p_garantia_data->>'estado_bien', p_garantia_data->>'estado', 'BUENO')  -- ✅ CORREGIDO: estado_bien
    ) RETURNING id INTO v_garantia_id;

    -- 4. CREAR CONTRATO
    INSERT INTO public.creditos (
        codigo,
        cliente_id,
        garantia_id,
        caja_origen_id,
        monto_prestado,
        tasa_interes,  -- ✅ CORREGIDO: era tasa_interes_mensual
        periodo_dias,
        fecha_vencimiento,
        saldo_pendiente,
        estado,
        estado_detallado  -- ✅ NUEVO: estado del ciclo de vida
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
        'vigente'  -- ✅ NUEVO: inicia como vigente
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
        v_usuario_id  -- ✅ CORREGIDO: usar v_usuario_id en vez de auth.uid()
    );

    RETURN v_contrato_id;
END;
$$;

-- Comentario para documentar el cambio
COMMENT ON FUNCTION public.crear_contrato_oficial IS 
'Versión 3.1: Actualizada para incluir campos detallados de garantías (marca, modelo, serie, subcategoria, estado_bien)';
