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
    subcategoria: z.string().min(1, "Selecciona una subcategoría"), // ✅ OBLIGATORIA para cálculo de valorMercado
    marcaBien: z.string().optional(), // Marca del bien (ej: Apple, Samsung) - opcional
    marca: z.string().optional(), // Mantener para compatibilidad, ahora opcional
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
    // Campos específicos para Vehículos
    anio: z.number().optional(),
    placa: z.string().optional(),
    kilometraje: z.number().optional(),
    // Campos específicos para Inmuebles
    area: z.number().optional(),
    ubicacion: z.string().optional(),
    partidaRegistral: z.string().optional(),
    // Campos específicos para Joyas
    peso: z.number().optional(),
    quilataje: z.string().optional(),
    // Campos específicos para Electrodomésticos
    capacidad: z.string().optional(),
    // Campos manuales para "Otro"
    subcategoria_manual: z.string().optional(),
    marca_manual: z.string().optional(),
}).superRefine((data, ctx) => {
    // Validación de monto vs valor mercado
    if (data.montoPrestamo > data.valorMercado) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El préstamo no puede exceder el valor de mercado",
            path: ["montoPrestamo"],
        })
    }

    // Validaciones para "Otro (Especificar)"
    if (data.subcategoria && data.subcategoria.startsWith('otro_')) {
        if (!data.subcategoria_manual) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Especifique la subcategoría",
                path: ["subcategoria_manual"]
            })
        }
    }

    if (data.marcaBien && data.marcaBien.startsWith('otra_')) {
        if (!data.marca_manual) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Especifique la marca",
                path: ["marca_manual"]
            })
        }
    }

    // Validaciones específicas por categoría
    if (data.categoria === 'vehiculos') {
        if (!data.anio) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El año es obligatorio", path: ["anio"] })
        if (!data.placa) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La placa es obligatoria", path: ["placa"] })
        if (!data.kilometraje) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El kilometraje es obligatorio", path: ["kilometraje"] })
    }

    if (data.categoria === 'inmuebles') {
        if (!data.area) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El área es obligatoria", path: ["area"] })
        if (!data.ubicacion) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La ubicación es obligatoria", path: ["ubicacion"] })
        if (!data.partidaRegistral) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La partida registral es obligatoria", path: ["partidaRegistral"] })
    }

    if (data.categoria === 'joyas') {
        if (!data.peso) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El peso es obligatorio", path: ["peso"] })
        if (!data.quilataje) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El quilataje es obligatorio", path: ["quilataje"] })
    }

    if (data.categoria === 'electrodomesticos') {
        if (!data.capacidad) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La capacidad es obligatoria", path: ["capacidad"] })
    }
})

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
        apellido_paterno: z.string().min(1, "El apellido paterno es obligatorio"),
        apellido_materno: z.string().min(1, "El apellido materno es obligatorio"),
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
