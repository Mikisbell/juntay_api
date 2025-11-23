-- 1. Create table for catalog suggestions
CREATE TABLE IF NOT EXISTS public.sugerencias_catalogos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo varchar(50) NOT NULL, -- 'subcategoria' | 'marca'
    categoria_padre varchar(100), -- 'electronica', 'celular', etc.
    valor_sugerido varchar(255) NOT NULL,
    usuario_id uuid REFERENCES public.usuarios(id),
    estado varchar(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Update RPC to handle new logic
CREATE OR REPLACE FUNCTION public.crear_contrato_oficial(
    p_caja_id UUID,
    p_cliente_doc_tipo TEXT,
    p_cliente_doc_num TEXT,
    p_cliente_nombre TEXT,
    p_garantia_data JSONB,       -- { descripcion, categoria, subcategoria, marca, ... }
    p_contrato_data JSONB        -- { monto, interes, dias, fecha_venc }
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cliente_id UUID;
    v_garantia_id UUID;
    v_contrato_id UUID;
    v_monto_prestamo DECIMAL;
    
    -- Variables para lógica de "Otro"
    v_subcategoria TEXT;
    v_marca TEXT;
    v_subcategoria_manual TEXT;
    v_marca_manual TEXT;
    v_final_subcategoria TEXT;
    v_final_marca TEXT;
BEGIN
    v_monto_prestamo := (p_contrato_data->>'monto')::DECIMAL;

    -- 1. GESTIÓN DE CLIENTE
    SELECT id INTO v_cliente_id 
    FROM public.clientes 
    WHERE numero_documento = p_cliente_doc_num;

    IF v_cliente_id IS NULL THEN
        INSERT INTO public.clientes (
            tipo_documento, numero_documento, nombres, 
            empresa_id
        ) VALUES (
            p_cliente_doc_tipo, p_cliente_doc_num, p_cliente_nombre, 
            (SELECT empresa_id FROM public.usuarios WHERE id = auth.uid())
        ) RETURNING id INTO v_cliente_id;
    END IF;

    -- 2. LÓGICA INTELIGENTE PARA "OTRO (ESPECIFICAR)"
    v_subcategoria := p_garantia_data->>'subcategoria';
    v_marca := p_garantia_data->>'marcaBien'; -- Nota: el frontend manda 'marcaBien'
    v_subcategoria_manual := p_garantia_data->>'subcategoria_manual';
    v_marca_manual := p_garantia_data->>'marca_manual';

    -- Procesar Subcategoría
    IF v_subcategoria LIKE 'otro_%' AND v_subcategoria_manual IS NOT NULL THEN
        v_final_subcategoria := v_subcategoria_manual;
        -- Guardar sugerencia
        INSERT INTO public.sugerencias_catalogos (tipo, categoria_padre, valor_sugerido, usuario_id)
        VALUES ('subcategoria', p_garantia_data->>'categoria', v_subcategoria_manual, auth.uid());
    ELSE
        v_final_subcategoria := v_subcategoria;
    END IF;

    -- Procesar Marca
    IF v_marca LIKE 'otra_%' AND v_marca_manual IS NOT NULL THEN
        v_final_marca := v_marca_manual;
        -- Guardar sugerencia
        INSERT INTO public.sugerencias_catalogos (tipo, categoria_padre, valor_sugerido, usuario_id)
        VALUES ('marca', v_subcategoria, v_marca_manual, auth.uid());
    ELSE
        v_final_marca := v_marca;
    END IF;

    -- 3. CREAR GARANTÍA (Con todos los campos nuevos)
    INSERT INTO public.garantias (
        cliente_id,
        descripcion,
        valor_tasacion,
        estado,
        -- Campos nuevos
        subcategoria,
        marca,
        modelo,
        serie,
        estado_bien,
        anio,
        placa,
        kilometraje,
        area,
        ubicacion,
        partida_registral,
        peso,
        quilataje,
        fotos_urls
    ) VALUES (
        v_cliente_id,
        p_garantia_data->>'descripcion',
        (p_garantia_data->>'valorMercado')::DECIMAL, -- Nota: frontend manda valorMercado
        'custodia',
        -- Valores procesados
        v_final_subcategoria,
        v_final_marca,
        p_garantia_data->>'modelo',
        p_garantia_data->>'serie',
        p_garantia_data->>'estado_bien',
        (p_garantia_data->>'anio')::INTEGER,
        p_garantia_data->>'placa',
        (p_garantia_data->>'kilometraje')::DECIMAL,
        (p_garantia_data->>'area')::DECIMAL,
        p_garantia_data->>'ubicacion',
        p_garantia_data->>'partidaRegistral',
        (p_garantia_data->>'peso')::DECIMAL,
        p_garantia_data->>'quilataje',
        (SELECT ARRAY(SELECT jsonb_array_elements_text(p_garantia_data->'fotos')))
    ) RETURNING id INTO v_garantia_id;

    -- 4. CREAR CONTRATO
    INSERT INTO public.creditos (
        codigo,
        cliente_id,
        garantia_id,
        caja_origen_id,
        monto_prestado,
        tasa_interes, -- Corregido nombre columna si es necesario, asumo tasa_interes
        periodo_dias,
        fecha_vencimiento,
        saldo_pendiente,
        estado
    ) VALUES (
        'CON-' || substr(md5(random()::text), 1, 6),
        v_cliente_id,
        v_garantia_id,
        p_caja_id,
        v_monto_prestamo,
        (p_contrato_data->>'tasaInteres')::DECIMAL, -- Frontend manda tasaInteres
        (p_contrato_data->>'dias')::INT,
        (p_contrato_data->>'fechaVencimiento')::DATE, -- Frontend manda fechaVencimiento? Verificar
        v_monto_prestamo,
        'vigente'
    ) RETURNING id INTO v_contrato_id;

    -- 5. MOVER EL DINERO
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
        auth.uid()
    );

    RETURN v_contrato_id;
END;
$$;
