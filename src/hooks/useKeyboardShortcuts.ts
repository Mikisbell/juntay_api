'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

/**
 * Hook global para atajos de teclado
 * Mejora la velocidad operacional del cajero
 */
export function useKeyboardShortcuts() {
    const router = useRouter()

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignorar si está escribiendo en un input/textarea
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return
            }

            // Ctrl+N: Nuevo Empeño
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault()
                router.push('/dashboard/mostrador/nuevo-empeno')
                toast.success('Abriendo Nuevo Empeño', { icon: '⚡' })
            }

            // F2: Buscar Cliente
            if (e.key === 'F2') {
                e.preventDefault()
                const searchInput = document.querySelector('[data-shortcut="buscar-cliente"]') as HTMLInputElement
                if (searchInput) {
                    searchInput.focus()
                    searchInput.select()
                } else {
                    router.push('/dashboard/clientes')
                }
                toast.info('Búsqueda de cliente activada', { icon: '🔍' })
            }

            // F3: Registrar Pago
            if (e.key === 'F3') {
                e.preventDefault()
                router.push('/dashboard/pagos')
                toast.success('Abriendo registro de pagos', { icon: '💰' })
            }

            // Ctrl+P: Imprimir (ya manejado por browser, solo mostramos hint)
            if (e.ctrlKey && e.key === 'p') {
                toast.info('Abriendo diálogo de impresión', { icon: '🖨️' })
            }

            // Ctrl+K: Búsqueda Global (CommandMenu)
            if (e.ctrlKey && e.key === 'k') {
                // Ya manejado por CommandMenu, pero agregamos feedback
                toast.info('Búsqueda global activada', { icon: '⌘' })
            }

            // ESC: Cerrar modales/diálogos
            if (e.key === 'Escape') {
                // Los componentes de shadcn ya manejan esto
                // Solo agregamos feedback visual
                const openDialogs = document.querySelectorAll('[role="dialog"]')
                if (openDialogs.length > 0) {
                    toast.info('Modal cerrado', { icon: '✕' })
                }
            }

            // F5: Dashboard (override del refresh)
            if (e.key === 'F5') {
                e.preventDefault()
                router.push('/dashboard')
                toast.success('Volviendo al Dashboard', { icon: '🏠' })
            }
        }

        // Mostrar ayuda de atajos (Shift+?)
        const handleHelp = (e: KeyboardEvent) => {
            if (e.shiftKey && e.key === '?') {
                e.preventDefault()
                mostrarAyudaAtajos()
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        window.addEventListener('keydown', handleHelp)

        return () => {
            window.removeEventListener('keydown', handleKeyPress)
            window.removeEventListener('keydown', handleHelp)
        }
    }, [router])
}

function mostrarAyudaAtajos() {
    const atajos = [
        'Ctrl+N → Nuevo Empeño',
        'F2 → Buscar Cliente',
        'F3 → Registrar Pago',
        'F5 → Dashboard',
        'Ctrl+K → Búsqueda Global',
        'ESC → Cerrar modal'
    ]

    toast.info(
        `⌨️ Atajos de Teclado\n\n${atajos.join('\n')}`,
        {
            duration: 8000,
            style: {
                whiteSpace: 'pre-line'
            }
        }
    )
}
