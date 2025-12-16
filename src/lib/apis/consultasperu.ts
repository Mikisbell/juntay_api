'use server'

/**
 * Integración con ConsultasPeru API para validación de DNI
 * Documentación: https://api.consultasperu.com
 */

// Interface removed because unused

export interface DatosEntidad {
    tipo_documento: 'DNI' | 'RUC'
    numero_documento: string
    nombre_completo: string

    // Campos DNI
    nombres?: string
    apellidos?: string
    apellido_paterno?: string
    apellido_materno?: string

    // Campos RUC
    razon_social?: string
    estado?: string
    condicion?: string
    tipo_contribuyente?: string
    departamento?: string
    provincia?: string
    distrito?: string
    ubigeo?: string

    // Comunes
    direccion?: string
    verificado_api?: boolean

    // Campos adicionales para registro
    celular?: string
    email?: string
    whatsapp_verificado?: boolean
}

/**
 * Consulta DNI o RUC usando sistema de triple fallback
 * 
 * PRIORIDAD 1: APIsPERU (2,000 consultas gratis/mes) ⭐ MEJOR
 * PRIORIDAD 2: ApiPeruDev (100 consultas gratis/mes)
 * PRIORIDAD 3: apis.net.pe (ilimitado pero cobertura limitada)
 */
export async function consultarEntidad(tipo: 'DNI' | 'RUC', numero: string): Promise<DatosEntidad | null> {
    // Validar formato
    if (tipo === 'DNI' && !/^\d{8}$/.test(numero)) {
        console.error('DNI inválido:', numero)
        return null
    }
    if (tipo === 'RUC' && !/^\d{11}$/.test(numero)) {
        console.error('RUC inválido:', numero)
        return null
    }

    // PRIORIDAD 1: APISPERU (2,000 consultas/mes)
    const apisPeruToken = process.env.APISPERU_TOKEN
    if (apisPeruToken) {
        try {
            console.log(`🔍 [APIsPERU] Consultando ${tipo}: ${numero}`)
            const endpoint = tipo === 'DNI' ? 'dni' : 'ruc'

            const response = await fetch(`https://dniruc.apisperu.com/api/v1/${endpoint}/${numero}?token=${apisPeruToken}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                next: { revalidate: 3600 }
            })

            if (response.ok) {
                const result = await response.json()

                // APIsPERU devuelve los campos directamente (no tiene success/data wrapper)
                if (result && (result.dni || result.ruc)) {
                    console.log(`✅ [APIsPERU] ${tipo} encontrado`)

                    if (tipo === 'DNI') {
                        return {
                            tipo_documento: 'DNI',
                            numero_documento: result.dni,
                            nombre_completo: `${result.apellidoPaterno} ${result.apellidoMaterno}, ${result.nombres}`,
                            nombres: result.nombres,
                            apellidos: `${result.apellidoPaterno} ${result.apellidoMaterno}`,
                            direccion: '',
                            ubigeo: '',
                            departamento: '',
                            provincia: '',
                            distrito: '',
                            verificado_api: true,
                        }
                    } else { // RUC
                        return {
                            tipo_documento: 'RUC',
                            numero_documento: result.ruc,
                            nombre_completo: result.razonSocial,
                            direccion: result.direccion || '',
                            ubigeo: result.ubigeo || '',
                            departamento: result.departamento || '',
                            provincia: result.provincia || '',
                            distrito: result.distrito || '',
                            estado: result.estado,
                            condicion: result.condicion,
                            verificado_api: true,
                        }
                    }
                } else {
                    console.warn(`⚠️ [APIsPERU] ${tipo} no encontrado en base de datos`)
                }
            } else {
                console.warn(`⚠️ [APIsPERU] Error HTTP ${response.status}`)
            }
        } catch (error) {
            console.error(`⚠️ [APIsPERU] Error:`, error)
        }
    } else {
        console.log('ℹ️ [APIsPERU] Token no configurado, probando ApiPeruDev...')
    }

    // PRIORIDAD 2: APIPERUDEV (100 consultas/mes)
    const apiPeruDevToken = process.env.APIPERU_DEV_TOKEN
    if (apiPeruDevToken) {
        try {
            console.log(`🔍 [ApiPeruDev] Consultando ${tipo}: ${numero}`)
            const endpoint = tipo === 'DNI' ? 'dni' : 'ruc'
            const bodyKey = tipo === 'DNI' ? 'dni' : 'ruc'

            const response = await fetch(`https://apiperu.dev/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiPeruDevToken}`
                },
                body: JSON.stringify({ [bodyKey]: numero }),
                next: { revalidate: 3600 }
            })

            if (response.ok) {
                const result = await response.json()

                if (result.success && result.data) {
                    console.log(`✅ [ApiPeruDev] ${tipo} encontrado`)

                    if (tipo === 'DNI') {
                        return {
                            tipo_documento: 'DNI',
                            numero_documento: result.data.numero,
                            nombre_completo: result.data.nombre_completo,
                            nombres: result.data.nombres,
                            apellidos: `${result.data.apellido_paterno} ${result.data.apellido_materno}`,
                            direccion: '',
                            ubigeo: '',
                            departamento: '',
                            provincia: '',
                            distrito: '',
                            verificado_api: true,
                        }
                    } else { // RUC
                        return {
                            tipo_documento: 'RUC',
                            numero_documento: result.data.ruc,
                            nombre_completo: result.data.nombre_o_razon_social,
                            direccion: result.data.direccion || '',
                            ubigeo: result.data.ubigeo?.[2] || '',
                            departamento: result.data.departamento || '',
                            provincia: result.data.provincia || '',
                            distrito: result.data.distrito || '',
                            estado: result.data.estado,
                            condicion: result.data.condicion,
                            verificado_api: true,
                        }
                    }
                } else {
                    console.warn(`⚠️ [ApiPeruDev] ${tipo} no encontrado en base de datos`)
                }
            } else {
                console.warn(`⚠️ [ApiPeruDev] Error HTTP ${response.status}`)
            }
        } catch (error) {
            console.error(`⚠️ [ApiPeruDev] Error:`, error)
        }
    } else {
        console.log('ℹ️ [ApiPeruDev] Token no configurado, usando API gratuita final')
    }

    // PRIORIDAD 3: FALLBACK FINAL (apis.net.pe - Ilimitado pero datos limitados)
    try {
        console.log(`🔍 [Fallback Final] Consultando ${tipo}: ${numero} en apis.net.pe`)
        const endpoint = tipo === 'DNI' ? 'dni' : 'ruc'
        const response = await fetch(`https://api.apis.net.pe/v1/${endpoint}?numero=${numero}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 3600 }
        })

        if (!response.ok) {
            console.error('Error HTTP:', response.status)
            return null
        }

        const data = await response.json()
        if (!data || !data.numeroDocumento) {
            return null
        }

        console.log(`✅ [Fallback Final] ${tipo} encontrado`)

        if (tipo === 'DNI') {
            return {
                tipo_documento: 'DNI',
                numero_documento: data.numeroDocumento,
                nombre_completo: data.nombre,
                nombres: data.nombres,
                apellidos: `${data.apellidoPaterno} ${data.apellidoMaterno}`,
                direccion: data.direccion || '',
                ubigeo: data.ubigeo || '',
                departamento: data.departamento || '',
                provincia: data.provincia || '',
                distrito: data.distrito || '',
                verificado_api: true,
            }
        } else { // tipo === 'RUC'
            return {
                tipo_documento: 'RUC',
                numero_documento: data.numeroDocumento,
                nombre_completo: data.nombre,
                direccion: data.direccion || '',
                ubigeo: data.ubigeo || '',
                departamento: data.departamento || '',
                provincia: data.provincia || '',
                distrito: data.distrito || '',
                estado: data.estado,
                condicion: data.condicion,
                verificado_api: true,
            }
        }
    } catch (error) {
        console.error(`Error consultando ${tipo} en API gratuita final:`, error)
        return null
    }
}

// Mantener compatibilidad hacia atrás temporalmente
export const consultarDNI = async (dni: string) => consultarEntidad('DNI', dni)


/**
 * Valida si un DNI existe en RENIEC
 */
export async function validarDNI(dni: string): Promise<boolean> {
    const resultado = await consultarDNI(dni)
    return resultado !== null
}
