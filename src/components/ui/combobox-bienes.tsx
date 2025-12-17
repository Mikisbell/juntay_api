'use client'

import { useState, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { CATALOGO_BIENES, ItemCatalogo } from '@/lib/constants/catalogo-bienes'

interface ComboboxBienesProps {
    value: string
    onSelect: (item: ItemCatalogo | null) => void
    onCustomValue?: (value: string) => void
    placeholder?: string
    className?: string
    allowCustom?: boolean // Permite escribir valores personalizados
}

export function ComboboxBienes({
    value,
    onSelect,
    onCustomValue,
    placeholder = 'Buscar artículo...',
    className,
    allowCustom = true
}: ComboboxBienesProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    // Configurar Fuse.js para fuzzy search
    const fuse = useMemo(() => new Fuse(CATALOGO_BIENES, {
        keys: [
            { name: 'nombre', weight: 0.6 },
            { name: 'keywords', weight: 0.3 },
            { name: 'categoria', weight: 0.1 }
        ],
        threshold: 0.4, // 0 = exacto, 1 = muy fuzzy
        includeScore: true,
        minMatchCharLength: 2
    }), [])

    // Resultados de búsqueda
    const results = useMemo(() => {
        if (!search || search.length < 2) {
            // Mostrar primeros items por defecto
            return CATALOGO_BIENES.slice(0, 10)
        }

        const fuseResults = fuse.search(search)
        return fuseResults.slice(0, 15).map(r => r.item)
    }, [search, fuse])

    const handleSelect = useCallback((item: ItemCatalogo) => {
        onSelect(item)
        setSearch('')
        setOpen(false)
    }, [onSelect])

    const handleCustom = useCallback(() => {
        if (onCustomValue && search.length >= 3) {
            onCustomValue(search)
            setOpen(false)
        }
    }, [onCustomValue, search])

    const handleClear = useCallback(() => {
        onSelect(null)
        setSearch('')
    }, [onSelect])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between h-12 bg-slate-50', className)}
                >
                    <span className={cn('truncate', !value && 'text-muted-foreground')}>
                        {value || placeholder}
                    </span>
                    <div className="flex items-center gap-1">
                        {value && (
                            <X
                                className="h-4 w-4 opacity-50 hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClear()
                                }}
                            />
                        )}
                        <Search className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
                <div className="p-2 border-b">
                    <Input
                        placeholder="Escribe para buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9"
                        autoFocus
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {results.length === 0 && search.length >= 2 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No se encontraron resultados
                            {allowCustom && (
                                <Button
                                    variant="link"
                                    className="block mx-auto mt-2"
                                    onClick={handleCustom}
                                >
                                    Usar "{search}" como valor personalizado
                                </Button>
                            )}
                        </div>
                    )}

                    {results.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                'flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-100',
                                value === item.nombre && 'bg-slate-100'
                            )}
                            onClick={() => handleSelect(item)}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{item.nombre}</div>
                                <div className="text-xs text-muted-foreground">{item.categoria}</div>
                            </div>
                            {value === item.nombre && (
                                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                            )}
                        </div>
                    ))}

                    {/* Opción de valor personalizado si está permitido */}
                    {allowCustom && search.length >= 3 && !results.find(r => r.nombre.toLowerCase() === search.toLowerCase()) && (
                        <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-amber-50 border-t"
                            onClick={handleCustom}
                        >
                            <span className="text-amber-600 font-medium">+</span>
                            <div>
                                <div className="text-sm font-medium">Agregar: "{search}"</div>
                                <div className="text-xs text-muted-foreground">Artículo no catalogado</div>
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
