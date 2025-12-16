// Sistema de categorías jerárquico INTELIGENTE para bienes en empeño
// Organizado por frecuencia de uso y valor comercial

export type CategoriaConfig = {
    value: string
    label: string
    icon: string
    subcategorias: SubcategoriaConfig[]
    camposEspecificos: string[] // Campos adicionales que requiere esta categoría
    precioBase: number // Precio referencial promedio
    orden: number // Para ordenar en el UI
}

export type SubcategoriaConfig = {
    value: string
    label: string
    precioBase: number
    factorDepreciacion?: number // Para vehículos: depreciación por año
    orden: number // Orden dentro de la categoría
}

// ============================================
// CATÁLOGO PRINCIPAL - 7 CATEGORÍAS
// Ordenadas por: Frecuencia de uso → Valor
// ============================================

export const CATEGORIAS_BIENES: CategoriaConfig[] = [
    // ========== CATEGORÍA 1: ELECTRÓNICA (MÁS COMÚN) ==========
    {
        value: 'electronica',
        label: 'Electrónica',
        icon: '💻',
        precioBase: 1500,
        orden: 1,
        camposEspecificos: [],
        subcategorias: [
            { value: 'celular', label: 'Celular / Smartphone', precioBase: 1500, orden: 1 },
            { value: 'laptop', label: 'Laptop / Notebook', precioBase: 2500, orden: 2 },
            { value: 'tablet', label: 'Tablet / iPad', precioBase: 800, orden: 3 },
            { value: 'smartwatch', label: 'Smartwatch / Reloj Inteligente', precioBase: 600, orden: 4 },
            { value: 'tv', label: 'TV / Smart TV', precioBase: 1200, orden: 5 },
            { value: 'pc_escritorio', label: 'PC de Escritorio / All-in-One', precioBase: 2000, orden: 6 },
            { value: 'consola', label: 'Consola de Videojuegos', precioBase: 1000, orden: 7 },
            { value: 'camara', label: 'Cámara Fotográfica / Video', precioBase: 1800, orden: 8 },
            { value: 'drone', label: 'Drone', precioBase: 1200, orden: 9 },
            { value: 'otro_electronico', label: 'Otro (Especificar)', precioBase: 1000, orden: 99 }
        ]
    },

    // ========== CATEGORÍA 2: ELECTRODOMÉSTICOS ==========
    {
        value: 'electrodomesticos',
        label: 'Electrodomésticos',
        icon: '🔌',
        precioBase: 800,
        orden: 2,
        camposEspecificos: ['capacidad'],
        subcategorias: [
            // Línea Blanca (más valiosos)
            { value: 'refrigeradora', label: 'Refrigeradora / Congelador', precioBase: 1500, orden: 1 },
            { value: 'lavadora', label: 'Lavadora / Secadora', precioBase: 1200, orden: 2 },
            { value: 'cocina', label: 'Cocina / Hornilla a Gas', precioBase: 800, orden: 3 },

            // Línea de Cocina
            { value: 'microondas', label: 'Microondas', precioBase: 300, orden: 4 },
            { value: 'licuadora', label: 'Licuadora', precioBase: 150, orden: 5 },
            { value: 'batidora', label: 'Batidora', precioBase: 120, orden: 6 },
            { value: 'horno_electrico', label: 'Horno Eléctrico', precioBase: 250, orden: 7 },
            { value: 'freidora_aire', label: 'Freidora de Aire', precioBase: 280, orden: 8 },

            // Línea de Limpieza
            { value: 'aspiradora', label: 'Aspiradora', precioBase: 400, orden: 9 },
            { value: 'plancha', label: 'Plancha', precioBase: 80, orden: 10 },

            // Audio/Confort
            { value: 'ventilador', label: 'Ventilador / Climatizador', precioBase: 120, orden: 11 },
            { value: 'aire_acondicionado', label: 'Aire Acondicionado', precioBase: 900, orden: 12 },
            { value: 'equipo_sonido', label: 'Equipo de Sonido / Minicomponente', precioBase: 600, orden: 13 },
            { value: 'parlante', label: 'Parlante / Bocina Bluetooth', precioBase: 300, orden: 14 },
            { value: 'auriculares', label: 'Auriculares / Audífonos', precioBase: 200, orden: 15 },
            { value: 'proyector', label: 'Proyector', precioBase: 1000, orden: 16 },

            { value: 'otro_electrodomestico', label: 'Otro (Especificar)', precioBase: 400, orden: 99 }
        ]
    },

    // ========== CATEGORÍA 3: VEHÍCULOS (ALTO VALOR) ==========
    {
        value: 'vehiculos',
        label: 'Vehículos',
        icon: '🚗',
        precioBase: 15000,
        orden: 3,
        camposEspecificos: ['año', 'placa', 'kilometraje'],
        subcategorias: [
            { value: 'auto', label: 'Auto / Sedán', precioBase: 18000, factorDepreciacion: 0.15, orden: 1 },
            { value: 'suv', label: 'SUV / Camioneta', precioBase: 25000, factorDepreciacion: 0.12, orden: 2 },
            { value: 'camioneta_trabajo', label: 'Camioneta de Trabajo', precioBase: 22000, factorDepreciacion: 0.14, orden: 3 },
            { value: 'moto', label: 'Motocicleta', precioBase: 3500, factorDepreciacion: 0.18, orden: 4 },
            { value: 'mototaxi', label: 'Mototaxi', precioBase: 4500, factorDepreciacion: 0.20, orden: 5 },
            { value: 'bicicleta_electrica', label: 'Bicicleta Eléctrica', precioBase: 1800, factorDepreciacion: 0.20, orden: 6 },
            { value: 'otro_vehiculo', label: 'Otro (Especificar)', precioBase: 10000, factorDepreciacion: 0.15, orden: 99 }
        ]
    },

    // ========== CATEGORÍA 4: JOYAS Y METALES PRECIOSOS ==========
    {
        value: 'joyas_oro',
        label: 'Joyas y Metales Preciosos',
        icon: '💍',
        precioBase: 3000,
        orden: 4,
        camposEspecificos: ['peso', 'quilates'],
        subcategorias: [
            { value: 'cadena', label: 'Cadena', precioBase: 2000, orden: 1 },
            { value: 'anillo', label: 'Anillo / Sortija', precioBase: 800, orden: 2 },
            { value: 'collar', label: 'Collar / Gargantilla', precioBase: 1500, orden: 3 },
            { value: 'pulsera', label: 'Pulsera / Brazalete', precioBase: 1000, orden: 4 },
            { value: 'arete', label: 'Aretes / Pendientes', precioBase: 600, orden: 5 },
            { value: 'reloj_oro', label: 'Reloj de Oro / Lujo', precioBase: 5000, orden: 6 },
            { value: 'otro_joya', label: 'Otro (Especificar)', precioBase: 1000, orden: 99 }
        ]
    },

    // ========== CATEGORÍA 5: HERRAMIENTAS Y EQUIPOS ==========
    {
        value: 'herramientas',
        label: 'Herramientas y Equipos',
        icon: '🔧',
        precioBase: 400,
        orden: 5,
        camposEspecificos: [],
        subcategorias: [
            // Herramientas Eléctricas
            { value: 'taladro', label: 'Taladro / Taladro Percutor', precioBase: 250, orden: 1 },
            { value: 'sierra', label: 'Sierra Eléctrica / Caladora', precioBase: 350, orden: 2 },
            { value: 'esmeril', label: 'Esmeril / Amoladora', precioBase: 200, orden: 3 },
            { value: 'lijadora', label: 'Lijadora', precioBase: 180, orden: 4 },

            // Equipos Industriales
            { value: 'soldadora', label: 'Soldadora / Equipo de Soldadura', precioBase: 500, orden: 5 },
            { value: 'compresor', label: 'Compresor de Aire', precioBase: 600, orden: 6 },
            { value: 'generador', label: 'Generador Eléctrico / Planta', precioBase: 1200, orden: 7 },
            { value: 'motobomba', label: 'Motobomba', precioBase: 400, orden: 8 },

            // Herramientas de Jardín
            { value: 'motosierra', label: 'Motosierra', precioBase: 450, orden: 9 },
            { value: 'cortadora_cesped', label: 'Cortadora de Césped', precioBase: 500, orden: 10 },

            { value: 'otro_herramienta', label: 'Otro (Especificar)', precioBase: 300, orden: 99 }
        ]
    },

    // ========== CATEGORÍA 6: INMUEBLES (REQUIERE PROCESO ESPECIAL) ==========
    {
        value: 'inmuebles',
        label: 'Inmuebles y Propiedades',
        icon: '🏠',
        precioBase: 150000,
        orden: 6,
        camposEspecificos: ['area', 'ubicacion', 'documento'],
        subcategorias: [
            { value: 'terreno', label: 'Terreno / Lote', precioBase: 50000, orden: 1 },
            { value: 'casa', label: 'Casa / Vivienda', precioBase: 180000, orden: 2 },
            { value: 'departamento', label: 'Departamento / Piso', precioBase: 120000, orden: 3 },
            { value: 'local_comercial', label: 'Local Comercial', precioBase: 200000, orden: 4 },
            { value: 'oficina', label: 'Oficina', precioBase: 150000, orden: 5 },
            { value: 'otro_inmueble', label: 'Otro (Especificar)', precioBase: 100000, orden: 99 }
        ]
    },

    // ========== CATEGORÍA 7: OTRO (CATCH-ALL) ==========
    {
        value: 'otro',
        label: 'Otros Bienes',
        icon: '📦',
        precioBase: 500,
        orden: 7,
        camposEspecificos: [],
        subcategorias: [
            { value: 'instrumento_musical', label: 'Instrumento Musical', precioBase: 800, orden: 1 },
            { value: 'mueble', label: 'Mueble', precioBase: 400, orden: 2 },
            { value: 'bicicleta', label: 'Bicicleta', precioBase: 300, orden: 3 },
            { value: 'equipo_deporte', label: 'Equipo Deportivo', precioBase: 350, orden: 4 },
            { value: 'billetera', label: 'Billetera / Cartera', precioBase: 200, orden: 5 },
            { value: 'otro_general', label: 'Otro (Especificar)', precioBase: 500, orden: 99 }
        ]
    }
]

// Helper para obtener configuración de categoría
export function getCategoriaConfig(categoriaValue: string): CategoriaConfig | undefined {
    return CATEGORIAS_BIENES.find(c => c.value === categoriaValue)
}

// Helper para obtener subcategoría
export function getSubcategoriaConfig(categoriaValue: string, subcategoriaValue: string): SubcategoriaConfig | undefined {
    const categoria = getCategoriaConfig(categoriaValue)
    return categoria?.subcategorias.find(s => s.value === subcategoriaValue)
}

// Factores de ajuste por estado del bien
export const FACTORES_ESTADO = {
    'NUEVO': 1.0,
    'EXCELENTE': 0.85,
    'BUENO': 0.70,
    'REGULAR': 0.50,
    'MALO': 0.30
} as const

// Tipo para precios de oro dinámicos (desde API)
export type PreciosOroPorQuilate = {
    24: number
    22?: number
    21?: number
    18: number
    14: number
    10: number
}

// Precios por defecto (fallback si no hay API) - Dic 2024
const PRECIOS_ORO_DEFAULT: PreciosOroPorQuilate = {
    24: 505,
    22: 463,
    21: 442,
    18: 379,
    14: 295,
    10: 211
}

// Calcular valor de mercado INTELIGENTE
export function calcularValorMercado(params: {
    categoria: string
    subcategoria?: string
    marca?: string
    estado: string
    año?: number // Para vehículos
    area?: number // Para inmuebles (m²)
    peso?: number // Para joyas (gramos)
    quilates?: number // Para joyas
    precioFactorMarca?: number // Factor de la marca (viene de marcas-por-subcategoria.ts)
    preciosOro?: PreciosOroPorQuilate // Precios dinámicos del oro (desde GoldAPI)
}): number {
    const config = getCategoriaConfig(params.categoria)
    if (!config) return 500

    // 1. Obtener precio base de subcategoría o categoría
    let precioBase = config.precioBase
    if (params.subcategoria) {
        const subConfig = getSubcategoriaConfig(params.categoria, params.subcategoria)
        if (subConfig) {
            precioBase = subConfig.precioBase

            // 2. Para vehículos: aplicar depreciación por año
            if (params.año && subConfig.factorDepreciacion) {
                const añosAntiguedad = new Date().getFullYear() - params.año
                const depreciacion = Math.pow(1 - subConfig.factorDepreciacion, añosAntiguedad)
                precioBase = precioBase * depreciacion
            }
        }
    }

    // 3. Para inmuebles: ajustar por área (precio por m²)
    if (params.categoria === 'inmuebles' && params.area) {
        const precioPorM2 = precioBase / 100 // Asumimos 100m² como base
        precioBase = precioPorM2 * params.area
    }

    // 4. Para joyas: ajustar por peso y quilates
    if (params.categoria === 'joyas_oro' && params.peso && params.quilates) {
        // Usar precios dinámicos si están disponibles, sino defaults
        const preciosActivos = params.preciosOro || PRECIOS_ORO_DEFAULT
        const precioOro = preciosActivos[params.quilates as keyof typeof preciosActivos] || preciosActivos[18]
        precioBase = params.peso * precioOro
    }

    // 5. Ajustar por MARCA (factor premium/económico)
    if (params.precioFactorMarca) {
        precioBase = precioBase * params.precioFactorMarca
    }

    // 6. Ajustar por ESTADO
    const factorEstado = FACTORES_ESTADO[params.estado as keyof typeof FACTORES_ESTADO] || 0.5

    return Math.round(precioBase * factorEstado)
}

// Obtener categorías ordenadas
export function getCategoriasOrdenadas(): CategoriaConfig[] {
    return [...CATEGORIAS_BIENES].sort((a, b) => a.orden - b.orden)
}

// Obtener subcategorías ordenadas de una categoría
export function getSubcategoriasOrdenadas(categoriaValue: string): SubcategoriaConfig[] {
    const categoria = getCategoriaConfig(categoriaValue)
    if (!categoria) return []
    return [...categoria.subcategorias].sort((a, b) => a.orden - b.orden)
}
