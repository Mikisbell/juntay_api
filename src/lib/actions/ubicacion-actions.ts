'use server'

// Usamos API pública de ubigeos de Perú
const UBIGEO_API = 'https://api.apis.net.pe/v1/ubigeo'

interface UbigeoItem {
    id: string;
    nombre: string;
}

export async function obtenerDepartamentos() {
    try {
        const response = await fetch(`${UBIGEO_API}/departamentos`, {
            cache: 'force-cache' // Cache permanente
        })
        const data = await response.json()

        // Convertir al formato esperado
        const departamentos = (data as UbigeoItem[]).map((dept) => ({
            id: dept.id,
            nombre: dept.nombre
        }))

        return { success: true, departamentos }
    } catch (error) {
        console.error('Error obteniendo departamentos:', error)
        return { success: false, departamentos: [] }
    }
}

export async function obtenerProvincias(departamentoId: string) {
    try {
        const response = await fetch(`${UBIGEO_API}/departamento/${departamentoId}/provincias`, {
            cache: 'force-cache'
        })
        const data = await response.json()

        const provincias = (data as UbigeoItem[]).map((prov) => ({
            id: prov.id,
            nombre: prov.nombre
        }))

        return { success: true, provincias }
    } catch (error) {
        console.error('Error obteniendo provincias:', error)
        return { success: false, provincias: [] }
    }
}

export async function obtenerDistritos(provinciaId: string) {
    try {
        const response = await fetch(`${UBIGEO_API}/provincia/${provinciaId}/distritos`, {
            cache: 'force-cache'
        })
        const data = await response.json()

        const distritos = (data as UbigeoItem[]).map((dist) => ({
            id: dist.id,
            nombre: dist.nombre
        }))

        return { success: true, distritos }
    } catch (error) {
        console.error('Error obteniendo distritos:', error)
        return { success: false, distritos: [] }
    }
}

// Obtener IDs por defecto de Junín > Huancayo > El Tambo
export async function obtenerUbicacionDefault() {
    try {
        // Buscar Junín (código conocido: 12)
        const junin = '12'

        // Buscar Huancayo en Junín
        const { provincias } = await obtenerProvincias(junin)
        const huancayo = provincias.find(p => p.nombre.toLowerCase().includes('huancayo'))

        if (!huancayo) return null

        // Buscar El Tambo en Huancayo
        const { distritos } = await obtenerDistritos(huancayo.id)
        const elTambo = distritos.find(d => d.nombre.toLowerCase().includes('tambo'))

        return {
            departamentoId: junin,
            provinciaId: huancayo.id,
            distritoId: elTambo?.id || null
        }
    } catch (error) {
        console.error('Error obteniendo ubicación default:', error)
        return null
    }
}
