import { z } from 'zod'

/**
 * Schema de validación para el paso de identificación del cliente
 */
export const identificacionSchema = z.object({
    tipoDocumento: z.enum(['DNI', 'RUC', 'CE']),
    numeroDocumento: z.string()
        .min(1, "El número de documento es obligatorio")
        .refine((val) => {
            const tipo = val.length === 8 ? 'DNI' : val.length === 11 ? 'RUC' : 'unknown'
            return tipo !== 'unknown'
        }, "Debe tener 8 dígitos (DNI) u 11 dígitos (RUC)")
        .refine((val) => /^\d+$/.test(val), "Solo se permiten números"),
})

/**
 * Schema de validación para el paso de tasación y evaluación del bien
 */
export const tasacionSchema = z.object({
    categoria: z.string().min(1, "Selecciona una categoría"),
    marca: z.string().min(1, "La marca es obligatoria"),
    modelo: z.string().min(1, "El modelo es obligatorio"),
    serie: z.string().optional(),
    estado_bien: z.enum(['NUEVO', 'EXCELENTE', 'BUENO', 'REGULAR', 'MALO']),
    descripcion: z.string().optional(),
    valorMercado: z.number()
        .positive("El valor debe ser mayor a 0")
        .max(1000000, "Valor excesivo, verifica el monto"),
    montoPrestamo: z.number()
        .positive("El monto debe ser mayor a 0"),
    tasaInteres: z.number()
        .min(0, "La tasa no puede ser negativa")
        .max(100, "La tasa no puede exceder 100%"),
    fotos: z.array(z.string()).optional(),
}).refine(
    (data) => data.montoPrestamo <= data.valorMercado,
    {
        message: "El préstamo no puede exceder el valor de mercado",
        path: ["montoPrestamo"],
    }
)

/**
 * Schema de validación para el paso de cronograma de pagos
 */
export const cronogramaSchema = z.object({
    frecuenciaPago: z.enum(['DIARIO', 'SEMANAL', 'QUINCENAL', 'TRES_SEMANAS', 'MENSUAL']),
    numeroCuotas: z.number()
        .int("Debe ser un número entero")
        .positive("Debe tener al menos 1 cuota")
        .max(120, "Máximo 120 cuotas permitidas"),
    fechaInicio: z.date()
        .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
            message: "La fecha no puede ser del pasado",
        }),
})

/**
 * Schema completo del empeño (combinación de todos los pasos)
 */
export const empenoCompletoSchema = z.object({
    // Paso 1: Identificación
    cliente: z.object({
        id: z.string().optional(),
        dni: z.string(),
        nombres: z.string().min(1, "Los nombres son obligatorios"),
        apellidos: z.string().min(1, "Los apellidos son obligatorios"),
    }),

    // Paso 2: Tasación
    detallesGarantia: tasacionSchema,

    // Paso 3: Cronograma
    condicionesPago: cronogramaSchema,

    // Paso 4: Confirmación
    opciones: z.object({
        enviarWhatsapp: z.boolean().optional(),
        imprimirAuto: z.boolean().optional(),
    }).optional(),
})

// Tipos TypeScript derivados de los schemas
export type IdentificacionFormData = z.infer<typeof identificacionSchema>
export type TasacionFormData = z.infer<typeof tasacionSchema>
export type CronogramaFormData = z.infer<typeof cronogramaSchema>
export type EmpenoCompletoData = z.infer<typeof empenoCompletoSchema>
