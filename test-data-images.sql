-- Actualizar garantías con imágenes de prueba
UPDATE garantias 
SET fotos = '[
    "https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop"
]'::jsonb
WHERE id IN (
    SELECT garantia_id FROM creditos WHERE codigo = 'CON-2024-001'
);

UPDATE garantias 
SET fotos = '[
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop"
]'::jsonb
WHERE id IN (
    SELECT garantia_id FROM creditos WHERE codigo = 'CON-2024-002'
);

-- Asegurar tasas de interés y montos
UPDATE creditos
SET tasa_interes = 5.0,
    interes_devengado_actual = monto_prestado * 0.05
WHERE fecha_vencimiento >= CURRENT_DATE;
