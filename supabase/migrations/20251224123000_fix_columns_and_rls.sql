-- Fix missing columns detected during analysis
ALTER TABLE public.creditos ADD COLUMN IF NOT EXISTS fecha_cancelacion timestamp with time zone;

ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS usuario_id uuid REFERENCES public.usuarios(id);

-- Update RLS for pagos if needed
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict to avoid errors (or use logic to check)
DROP POLICY IF EXISTS "Cajero ve sus pagos" ON public.pagos;
DROP POLICY IF EXISTS "Admin ve todos pagos" ON public.pagos;

CREATE POLICY "Cajero ve sus pagos" ON public.pagos
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Admin ve todos pagos" ON public.pagos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
    );
