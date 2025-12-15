-- FIX: Add missing columns required by RPCs
-- 1. creditos.fecha_cancelacion used in DESEMPENO logic
-- 2. pagos.usuario_id used in registrar_pago_oficial

DO $$ 
BEGIN 
    -- 1. Add fecha_cancelacion to creditos if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creditos' AND column_name = 'fecha_cancelacion') THEN 
        ALTER TABLE public.creditos ADD COLUMN fecha_cancelacion TIMESTAMP WITH TIME ZONE; 
    END IF;

    -- 2. Add usuario_id to pagos if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pagos' AND column_name = 'usuario_id') THEN 
        ALTER TABLE public.pagos ADD COLUMN usuario_id UUID REFERENCES public.usuarios(id);
    END IF;
END $$;
