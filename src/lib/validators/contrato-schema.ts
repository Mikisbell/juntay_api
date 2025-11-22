import { z } from "zod"

// Reglas de negocio validadas aquí
export const ContratoSchema = z.object({
    // Datos de Caja (Contexto)
    cajaId: z.string().uuid(),

    // Cliente
    cliente: z.object({
        tipoDoc: z.enum(["DNI", "RUC", "CE"]),
        numeroDoc: z.string().min(8, "Documento inválido"),
        nombreCompleto: z.string().min(3, "Nombre requerido"),
    }),

    // Garantía (Heredado del Cotizador)
    garantia: z.object({
        descripcion: z.string().min(5),
        categoria: z.enum(["ORO", "ELECTRO"]),
        valorTasacion: z.number().positive(),
        detalles: z.record(z.any()), // JSON con kilates, gramaje, etc.
    }),

    // Condiciones Financieras
    credito: z.object({
        montoPrestamo: z.number().positive("El préstamo debe ser mayor a 0"),
        tasaInteres: z.number().min(0).max(100),
        diasPlazo: z.number().int().min(1),
        fechaVencimiento: z.string().datetime(), // ISO String
    })
})

export type NuevaOperacion = z.infer<typeof ContratoSchema>
