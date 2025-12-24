'use client'

/**
 * ThemeToggle - Dark/Light mode toggle button
 * Uses next-themes for theme management
 */

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
    className?: string
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ThemeToggle({ className, size = 'icon' }: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size={size}
                className={cn('relative', className)}
                disabled
            >
                <div className="w-5 h-5 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full" />
            </Button>
        )
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <Button
            variant="ghost"
            size={size}
            className={cn(
                'relative overflow-hidden transition-all duration-300',
                className
            )}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {/* Sun icon */}
            <Sun
                className={cn(
                    'w-5 h-5 absolute transition-all duration-500 transform',
                    isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-90 scale-0 opacity-0'
                )}
            />

            {/* Moon icon */}
            <Moon
                className={cn(
                    'w-5 h-5 absolute transition-all duration-500 transform',
                    isDark
                        ? '-rotate-90 scale-0 opacity-0'
                        : 'rotate-0 scale-100 opacity-100'
                )}
            />

            {/* Invisible spacer */}
            <span className="w-5 h-5" />
        </Button>
    )
}

// Compact version for mobile/small spaces
export function ThemeToggleCompact({ className }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                'p-2 rounded-lg transition-colors',
                'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
                'dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800',
                className
            )}
            aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
    )
}
