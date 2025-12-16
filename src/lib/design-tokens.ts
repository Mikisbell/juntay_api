/**
 * Design System Tokens - Sistema de diseño centralizado
 * Basado en análisis UX/UI para consistencia visual
 */

export const spacing = {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
} as const

export const typography = {
    // Headings
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-2xl font-semibold tracking-tight',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-semibold',

    // Body
    body: 'text-base',
    bodyLarge: 'text-lg',
    bodySmall: 'text-sm',

    // Special
    caption: 'text-xs text-slate-500',
    label: 'text-sm font-medium',
    code: 'font-mono text-sm',
} as const

export const cardVariants = {
    default: 'bg-white rounded-lg shadow-sm border border-slate-200 p-6',
    compact: 'bg-white rounded-lg shadow-sm border border-slate-200 p-4',
    elevated: 'bg-white rounded-lg shadow-lg border border-slate-200 p-6',
    gradient: 'bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-sm border border-slate-200 p-6',
} as const

export const buttonHierarchy = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-slate-100 text-slate-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
} as const

export const statusColors = {
    success: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700',
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-700',
    },
} as const

export const animations = {
    // Micro-animations
    cardHover: 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
    buttonPress: 'transition-all duration-150 active:scale-95',
    slideIn: 'animate-in fade-in slide-in-from-bottom-4 duration-300',
    fadeIn: 'animate-in fade-in duration-200',
} as const

export const borderRadius = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
} as const

// Helper function to combine classes safely
export const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ')
}
