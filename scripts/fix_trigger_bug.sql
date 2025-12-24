CREATE OR REPLACE FUNCTION public.trigger_actualizar_intereses_v2()
RETURNS TRIGGER AS $$
DECLARE
    v_calculo RECORD;
BEGIN
    -- Skip complex calculation on INSERT (row doesn't exist yet for query)
    IF TG_OP = 'INSERT' THEN
        NEW.dias_transcurridos := 0;
        NEW.interes_devengado_actual := 0;
        NEW.interes_mora_acumulado := 0;
        NEW.dias_en_mora := 0;
        NEW.dias_en_gracia_usados := 0;
        NEW.fecha_ultimo_recalculo := CURRENT_DATE;
        RETURN NEW;
    END IF;

    -- Obtener cálculo completo (On UPDATE)
    SELECT * INTO v_calculo
    FROM public.calcular_interes_completo(NEW.id, CURRENT_DATE);
    
    IF v_calculo IS NOT NULL THEN
        NEW.dias_transcurridos := v_calculo.dias_desde_desembolso;
        NEW.interes_devengado_actual := v_calculo.interes_regular;
        NEW.interes_mora_acumulado := v_calculo.interes_mora;
        NEW.dias_en_mora := v_calculo.dias_en_mora;
        NEW.dias_en_gracia_usados := v_calculo.dias_en_gracia;
        NEW.fecha_ultimo_recalculo := CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
