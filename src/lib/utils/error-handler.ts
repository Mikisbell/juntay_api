import { toast } from "sonner"

export class AppError extends Error {
    public code: string
    public isOperational: boolean

    constructor(message: string, code: string = 'UNKNOWN_ERROR', isOperational: boolean = true) {
        super(message)
        this.code = code
        this.isOperational = isOperational
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

const ERROR_MESSAGES: Record<string, string> = {
    'NETWORK_ERROR': 'Error de conexión. Verifica tu internet.',
    'UNAUTHORIZED': 'Sesión expirada. Por favor inicia sesión nuevamente.',
    'FORBIDDEN': 'No tienes permisos para realizar esta acción.',
    'NOT_FOUND': 'El recurso solicitado no fue encontrado.',
    'VALIDATION_ERROR': 'Por favor verifica los datos ingresados.',
    'SERVER_ERROR': 'Ocurrió un error en el servidor. Intenta más tarde.',
    'TIMEOUT': 'La operación tardó demasiado. Intenta nuevamente.',
    'UNKNOWN_ERROR': 'Ocurrió un error inesperado.'
}

export const handleAppError = (error: unknown, customMessage?: string) => {
    console.error('App Error:', error)

    let message = customMessage || ERROR_MESSAGES['UNKNOWN_ERROR']
    let code = 'UNKNOWN_ERROR'

    if (error instanceof AppError) {
        message = error.message
        code = error.code
    } else if (error instanceof Error) {
        // Try to map common error messages
        if (error.message.includes('fetch') || error.message.includes('network')) {
            message = ERROR_MESSAGES['NETWORK_ERROR']
            code = 'NETWORK_ERROR'
        } else if (error.message.includes('timeout')) {
            message = ERROR_MESSAGES['TIMEOUT']
            code = 'TIMEOUT'
        } else {
            // Use the error message if it looks safe/readable, otherwise default
            message = error.message.length < 100 ? error.message : ERROR_MESSAGES['UNKNOWN_ERROR']
        }
    }

    toast.error(message, {
        description: code !== 'UNKNOWN_ERROR' ? `Código: ${code}` : undefined,
        duration: 5000,
    })

    return { message, code }
}

export const wrapApiCall = async <T>(
    promise: Promise<T>,
    errorMessage: string = 'Error en la operación'
): Promise<[T | null, Error | null]> => {
    try {
        const result = await promise
        return [result, null]
    } catch (error) {
        handleAppError(error, errorMessage)
        return [null, error instanceof Error ? error : new Error(String(error))]
    }
}
