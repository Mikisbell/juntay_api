-- Migración: Actualizar RPCs de Caja para Multi-tenant
-- Fecha: 2025-12-20

-- 1. ADMIN_ASIGNAR_CAJA (Apertura)
CREATE OR REPLACE FUNCTION public.admin_asignar_caja(p_usuario_cajero_id uuid, p_monto numeric, p_observacion text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_caja_id UUID;
    v_boveda_id UUID;
    v_saldo_boveda DECIMAL;
    v_sucursal_id UUID;
    v_empresa_id UUID;
    v_caja_numero INT;
BEGIN
    -- 1. Obtener contexto del usuario (Empresa y Sucursal)
    -- Asumimos que el cajero pertenece a una sucursal activa
    SELECT s.id, s.empresa_id INTO v_sucursal_id, v_empresa_id
    FROM public.usuarios u
    JOIN public.sucursales s ON u.empresa_id = s.empresa_id -- Simplificación: usuario pertenece a empresa, asignamos sucursal principal o especifica si hubiera relación directa
    WHERE u.id = p_usuario_cajero_id
    LIMIT 1; 
    
    -- Corrección: Mejor obtener empresa del usuario directly, y luego buscar sucursal principal si no tiene asignada explícitamente
    SELECT empresa_id INTO v_empresa_id FROM public.usuarios WHERE id = p_usuario_cajero_id;
    
    IF v_empresa_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no tiene empresa asignada';
    END IF;

    -- Obtener sucursal principal de esa empresa (por ahora, luego se podrá elegir)
    SELECT id INTO v_sucursal_id FROM public.sucursales WHERE empresa_id = v_empresa_id AND es_principal = true LIMIT 1;

    -- 2. Buscar Bóveda Principal DE LA EMPRESA
    SELECT id, saldo INTO v_boveda_id, v_saldo_boveda
    FROM public.cuentas_financieras
    WHERE empresa_id = v_empresa_id 
    AND es_principal = true;

    IF v_boveda_id IS NULL THEN
        RAISE EXCEPTION 'No existe bóveda principal para esta empresa';
    END IF;

    IF v_saldo_boveda < p_monto THEN
        RAISE EXCEPTION 'Fondos insuficientes en Bóveda Principal (Saldo: %)', v_saldo_boveda;
    END IF;

    -- 3. Generar correlativo de caja para esta empresa
    SELECT COALESCE(MAX(numero_caja), 0) + 1 INTO v_caja_numero 
    FROM public.cajas_operativas
    WHERE empresa_id = v_empresa_id;

    -- 4. Crear Caja
    INSERT INTO public.cajas_operativas (
        usuario_id, 
        sucursal_id,
        boveda_origen_id, 
        empresa_id, -- NUEVO
        saldo_inicial, 
        saldo_actual, 
        estado, 
        fecha_apertura, 
        numero_caja
    ) VALUES (
        p_usuario_cajero_id,
        v_sucursal_id,
        v_boveda_id,
        v_empresa_id,
        p_monto,
        p_monto,
        'abierta',
        NOW(),
        v_caja_numero
    ) RETURNING id INTO v_caja_id;

    -- 5. Registrar Movimientos (Egreso Bóveda -> Ingreso Caja)
    
    -- 5.1 Egreso de Bóveda (update saldo)
    UPDATE public.cuentas_financieras 
    SET saldo = saldo - p_monto 
    WHERE id = v_boveda_id;

    -- 5.2 Insertar Operación Financiera (Bóveda)
    -- (Opcional, si tracking de bóveda estuviera en otra tabla, por ahora simplificado)

    RETURN v_caja_id;
END;
$function$;


-- 2. CERRAR_CAJA_OFICIAL
CREATE OR REPLACE FUNCTION public.cerrar_caja_oficial(p_caja_id uuid, p_monto_fisico numeric, p_observaciones text DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_caja RECORD;
    v_diferencia DECIMAL;
    v_boveda_id UUID;
    v_empresa_id UUID;
BEGIN
    SELECT * INTO v_caja FROM public.cajas_operativas WHERE id = p_caja_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caja no encontrada';
    END IF;

    IF v_caja.estado = 'cerrada' THEN
        RAISE EXCEPTION 'La caja ya está cerrada';
    END IF;
    
    v_empresa_id := v_caja.empresa_id;
    v_boveda_id := v_caja.boveda_origen_id;
    v_diferencia := p_monto_fisico - v_caja.saldo_actual;

    -- 1. Actualizar estado caja
    UPDATE public.cajas_operativas
    SET estado = 'cerrada',
        fecha_cierre = NOW()
    WHERE id = p_caja_id;

    -- 2. Devolver dinero a Bóveda
    UPDATE public.cuentas_financieras
    SET saldo = saldo + p_monto_fisico -- Se devuelve lo físico real
    WHERE id = v_boveda_id;

    -- 3. Log de cierre (Movimiento de cierre en caja)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id,
        tipo,
        motivo,
        monto,
        saldo_anterior,
        saldo_nuevo,
        descripcion,
        usuario_id,
        empresa_id
    ) VALUES (
        p_caja_id,
        'EGRESO',
        'CIERRE_CAJA',
        p_monto_fisico,
        v_caja.saldo_actual,
        0, -- Caja queda en 0 virtualmente al cerrar
        'Cierre de caja - Transferencia a Bóveda',
        auth.uid(),
        v_empresa_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'mensaje', 'Caja cerrada correctamente. Fondos transferidos a Bóveda.',
        'monto_transferido', p_monto_fisico,
        'diferencia', v_diferencia
    );
END;
$function$;
