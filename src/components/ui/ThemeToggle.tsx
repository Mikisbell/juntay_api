'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

/**
 * ThemeToggle - Botón animado para cambiar entre light/dark mode
 * 
 * Features:
 * - Animación de rotación en el cambio
 * - Iconos sun/moon con transición suave
 * - Soporta system preference
 */
export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Evitar hydration mismatch
    useEffect(() => setMounted(true), [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <div className="h-4 w-4 animate-pulse bg-muted rounded-full" />
            </Button>
        )
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative overflow-hidden group"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
            {/* Sun icon - visible in dark mode */}
            <Sun
                className={`h-4 w-4 absolute transition-all duration-300 ease-out
                    ${isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'
                    }
                    text-amber-400 group-hover:text-amber-300
                `}
            />
            {/* Moon icon - visible in light mode */}
            <Moon
                className={`h-4 w-4 absolute transition-all duration-300 ease-out
                    ${isDark
                        ? 'rotate-90 scale-0 opacity-0'
                        : 'rotate-0 scale-100 opacity-100'
                    }
                    text-slate-600 group-hover:text-slate-800
                `}
            />
        </Button>
    )
}

/**
 * ThemeToggleWithLabel - Versión con texto para menús
 */
export function ThemeToggleWithLabel() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted) {
        return (
            <Button variant="ghost" className="w-full justify-start gap-2">
                <div className="h-4 w-4 animate-pulse bg-muted rounded-full" />
                <span className="text-muted-foreground">Cargando...</span>
            </Button>
        )
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            {isDark ? (
                <>
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span>Modo Claro</span>
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4 text-slate-600" />
                    <span>Modo Oscuro</span>
                </>
            )}
        </Button>
    )
}
