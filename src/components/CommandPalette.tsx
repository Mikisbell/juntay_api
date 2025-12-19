'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search, PlusCircle, Wallet, RefreshCw, Users,
    FileText, Settings, BarChart3, X, ArrowRight,
    Clock, TrendingUp, Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface CommandItem {
    id: string
    title: string
    subtitle?: string
    icon: React.ReactNode
    action: () => void
    category: 'navigation' | 'action' | 'search'
    keywords?: string[]
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [searchResults, setSearchResults] = useState<{ id: string; nombre: string; dni: string }[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const supabase = createClient()

    // Command definitions
    const commands: CommandItem[] = [
        // Navigation
        {
            id: 'home',
            title: 'Ir a Dashboard',
            icon: <Home className="h-4 w-4" />,
            action: () => router.push('/dashboard'),
            category: 'navigation',
            keywords: ['inicio', 'home', 'dashboard']
        },
        {
            id: 'clients',
            title: 'Ver Clientes',
            subtitle: 'Gestión de cartera',
            icon: <Users className="h-4 w-4" />,
            action: () => router.push('/dashboard/clientes'),
            category: 'navigation',
            keywords: ['clientes', 'cartera', 'personas']
        },
        {
            id: 'contracts',
            title: 'Ver Contratos',
            icon: <FileText className="h-4 w-4" />,
            action: () => router.push('/dashboard/contratos'),
            category: 'navigation',
            keywords: ['contratos', 'creditos', 'prestamos']
        },
        {
            id: 'reports',
            title: 'Ver Reportes',
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => router.push('/dashboard/reportes'),
            category: 'navigation',
            keywords: ['reportes', 'estadisticas', 'analisis']
        },
        {
            id: 'settings',
            title: 'Configuración',
            icon: <Settings className="h-4 w-4" />,
            action: () => router.push('/dashboard/configuracion'),
            category: 'navigation',
            keywords: ['configuracion', 'ajustes', 'settings']
        },
        // Actions
        {
            id: 'new-credit',
            title: 'Nuevo Crédito',
            subtitle: 'Crear nuevo empeño',
            icon: <PlusCircle className="h-4 w-4 text-blue-500" />,
            action: () => router.push('/dashboard/mostrador/nuevo-empeno'),
            category: 'action',
            keywords: ['nuevo', 'credito', 'empeno', 'crear']
        },
        {
            id: 'receive-payment',
            title: 'Recibir Pago',
            subtitle: 'Cobrar cuota',
            icon: <Wallet className="h-4 w-4 text-emerald-500" />,
            action: () => router.push('/dashboard/clientes?f=critico'),
            category: 'action',
            keywords: ['pago', 'cobrar', 'cuota', 'recibir']
        },
        {
            id: 'renew',
            title: 'Renovar Contrato',
            icon: <RefreshCw className="h-4 w-4 text-amber-500" />,
            action: () => router.push('/dashboard/clientes?f=alerta'),
            category: 'action',
            keywords: ['renovar', 'extender', 'refinanciar']
        },
        {
            id: 'overdue',
            title: 'Ver Vencidos',
            subtitle: 'Contratos en mora',
            icon: <Clock className="h-4 w-4 text-red-500" />,
            action: () => router.push('/dashboard/clientes?f=critico'),
            category: 'action',
            keywords: ['vencidos', 'mora', 'atrasados', 'critico']
        },
        {
            id: 'expiring',
            title: 'Ver Por Vencer',
            subtitle: 'Próximos 7 días',
            icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
            action: () => router.push('/dashboard/clientes?f=alerta'),
            category: 'action',
            keywords: ['vencer', 'proximos', 'alerta']
        }
    ]

    // Filter commands based on query
    const filteredCommands = query
        ? commands.filter(cmd => {
            const searchLower = query.toLowerCase()
            return cmd.title.toLowerCase().includes(searchLower) ||
                cmd.subtitle?.toLowerCase().includes(searchLower) ||
                cmd.keywords?.some(k => k.includes(searchLower))
        })
        : commands

    // Search clients in DB
    const searchClients = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const { data } = await supabase
                .from('clientes')
                .select('id, nombres, apellido_paterno, numero_documento')
                .or(`nombres.ilike.%${searchQuery}%,apellido_paterno.ilike.%${searchQuery}%,numero_documento.ilike.%${searchQuery}%`)
                .limit(5)

            const clientArray = data as Array<{ id: string; nombres: string; apellido_paterno: string; numero_documento: string }> || []
            setSearchResults(clientArray.map(c => ({
                id: c.id,
                nombre: `${c.nombres} ${c.apellido_paterno}`,
                dni: c.numero_documento
            })))
        } catch (error) {
            console.error('Error searching clients:', error)
        } finally {
            setIsSearching(false)
        }
    }, [supabase])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                searchClients(query)
            } else {
                setSearchResults([])
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query, searchClients])

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
            setQuery('')
            setSelectedIndex(0)
        }
    }, [isOpen])

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            const totalItems = filteredCommands.length + searchResults.length

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev => (prev + 1) % totalItems)
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
                    break
                case 'Enter':
                    e.preventDefault()
                    if (selectedIndex < filteredCommands.length) {
                        filteredCommands[selectedIndex].action()
                        onClose()
                    } else if (searchResults[selectedIndex - filteredCommands.length]) {
                        const client = searchResults[selectedIndex - filteredCommands.length]
                        router.push(`/dashboard/clientes/${client.id}`)
                        onClose()
                    }
                    break
                case 'Escape':
                    onClose()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, filteredCommands, searchResults, selectedIndex, onClose, router])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Palette */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar cliente, acción o navegar..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 text-lg text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto py-2">
                    {/* Commands */}
                    {filteredCommands.length > 0 && (
                        <div className="px-2">
                            <p className="px-2 py-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Acciones
                            </p>
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => {
                                        cmd.action()
                                        onClose()
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                                        selectedIndex === index
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'hover:bg-slate-50 text-slate-700'
                                    )}
                                >
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center',
                                        selectedIndex === index ? 'bg-blue-100' : 'bg-slate-100'
                                    )}>
                                        {cmd.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{cmd.title}</p>
                                        {cmd.subtitle && (
                                            <p className="text-xs text-slate-400">{cmd.subtitle}</p>
                                        )}
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Client Search Results */}
                    {searchResults.length > 0 && (
                        <div className="px-2 mt-2 pt-2 border-t border-slate-100">
                            <p className="px-2 py-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Clientes
                            </p>
                            {searchResults.map((client, index) => {
                                const realIndex = filteredCommands.length + index
                                return (
                                    <button
                                        key={client.id}
                                        onClick={() => {
                                            router.push(`/dashboard/clientes/${client.id}`)
                                            onClose()
                                        }}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                                            selectedIndex === realIndex
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'hover:bg-slate-50 text-slate-700'
                                        )}
                                    >
                                        <div className={cn(
                                            'w-8 h-8 rounded-lg flex items-center justify-center',
                                            selectedIndex === realIndex ? 'bg-blue-100' : 'bg-slate-100'
                                        )}>
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{client.nombre}</p>
                                            <p className="text-xs text-slate-400">DNI: {client.dni}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300" />
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Loading */}
                    {isSearching && (
                        <div className="px-4 py-3 text-sm text-slate-400">
                            Buscando clientes...
                        </div>
                    )}

                    {/* Empty state */}
                    {query && filteredCommands.length === 0 && searchResults.length === 0 && !isSearching && (
                        <div className="px-4 py-8 text-center text-slate-400">
                            <p>No se encontraron resultados para &quot;{query}&quot;</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">↓</kbd>
                            navegar
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">Enter</kbd>
                            seleccionar
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">Esc</kbd>
                        cerrar
                    </span>
                </div>
            </div>
        </div>
    )
}

// Hook to use command palette anywhere
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev)
    }
}
