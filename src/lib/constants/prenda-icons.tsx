/**
 * Prenda Icons Mapping
 * Maps garantía categories to Lucide icons for visual representation
 */

import {
    Gem,
    Smartphone,
    Laptop,
    Watch,
    Car,
    Tv,
    Guitar,
    Hammer,
    Package,
    type LucideIcon
} from 'lucide-react'

export type PrendaCategoria =
    | 'joyeria'
    | 'electronico'
    | 'celular'
    | 'laptop'
    | 'computadora'
    | 'reloj'
    | 'vehiculo'
    | 'moto'
    | 'electrodomestico'
    | 'instrumento'
    | 'herramienta'
    | 'otro'

interface PrendaIconConfig {
    icon: LucideIcon
    color: string
    bgColor: string
    label: string
}

export const PRENDA_ICONS: Record<string, PrendaIconConfig> = {
    // Joyería
    joyeria: {
        icon: Gem,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        label: 'Joyería'
    },
    oro: {
        icon: Gem,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Oro'
    },
    plata: {
        icon: Gem,
        color: 'text-slate-500',
        bgColor: 'bg-slate-100',
        label: 'Plata'
    },

    // Electrónicos
    celular: {
        icon: Smartphone,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'Celular'
    },
    smartphone: {
        icon: Smartphone,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'Smartphone'
    },
    laptop: {
        icon: Laptop,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
        label: 'Laptop'
    },
    computadora: {
        icon: Laptop,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
        label: 'Computadora'
    },
    electronico: {
        icon: Smartphone,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'Electrónico'
    },

    // Relojes
    reloj: {
        icon: Watch,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        label: 'Reloj'
    },

    // Vehículos
    vehiculo: {
        icon: Car,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        label: 'Vehículo'
    },
    moto: {
        icon: Car,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        label: 'Moto'
    },
    auto: {
        icon: Car,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        label: 'Auto'
    },

    // Electrodomésticos
    electrodomestico: {
        icon: Tv,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        label: 'Electrodoméstico'
    },
    tv: {
        icon: Tv,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        label: 'TV'
    },

    // Instrumentos
    instrumento: {
        icon: Guitar,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        label: 'Instrumento'
    },

    // Herramientas
    herramienta: {
        icon: Hammer,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: 'Herramienta'
    },

    // Default
    otro: {
        icon: Package,
        color: 'text-slate-500',
        bgColor: 'bg-slate-100',
        label: 'Otro'
    }
}

/**
 * Get icon config for a prenda category
 * Falls back to 'otro' if category not found
 */
export function getPrendaIcon(categoria: string | null | undefined): PrendaIconConfig {
    if (!categoria) return PRENDA_ICONS.otro

    const normalized = categoria.toLowerCase().trim()

    // Direct match
    if (PRENDA_ICONS[normalized]) {
        return PRENDA_ICONS[normalized]
    }

    // Partial match
    for (const [key, config] of Object.entries(PRENDA_ICONS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return config
        }
    }

    return PRENDA_ICONS.otro
}

/**
 * Status badge variant mapping for credits
 */
export const CREDIT_STATUS_VARIANTS: Record<string, string> = {
    'aprobado': 'activo',
    'vigente': 'vigente',
    'activo': 'activo',
    'por_vencer': 'por_vencer',
    'vencido': 'vencido',
    'en_mora': 'en_mora',
    'pagado': 'pagado',
    'cancelado': 'cancelado',
    'rechazado': 'destructive',
    'pendiente': 'secondary'
}

export function getCreditStatusVariant(estado: string | null | undefined): string {
    if (!estado) return 'secondary'
    const normalized = estado.toLowerCase().replace(/\s+/g, '_')
    return CREDIT_STATUS_VARIANTS[normalized] || 'secondary'
}
