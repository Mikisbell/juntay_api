"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { buscarPersonas } from "@/lib/actions/tesoreria-actions"

interface PersonSearchProps {
    onSelect: (personaId: string, nombre: string) => void
    placeholder?: string
}

export function PersonSearch({ onSelect, placeholder = "Buscar persona..." }: PersonSearchProps) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [query, setQuery] = useState("")
    const [personas, setPersonas] = useState<{ id: string, nombre_completo: string, numero_documento: string }[]>([])
    const [loading, setLoading] = useState(false)

    // Debounce manual simple si no existe hook
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true)
                try {
                    const resultados = await buscarPersonas(query)
                    setPersonas(resultados)
                } catch (error) {
                    console.error(error)
                    setPersonas([])
                } finally {
                    setLoading(false)
                }
            } else {
                setPersonas([])
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [query])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? personas.find((framework) => framework.id === value)?.nombre_completo || value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar por DNI o Nombre..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {loading && (
                            <div className="py-6 flex justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!loading && query.length < 2 && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Escribe al menos 2 caracteres
                            </div>
                        )}
                        {!loading && personas.length === 0 && query.length >= 2 && (
                            <CommandEmpty>No se encontraron personas.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {personas.map((persona) => (
                                <CommandItem
                                    key={persona.id}
                                    value={persona.id}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue)
                                        onSelect(persona.id, persona.nombre_completo)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === persona.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{persona.nombre_completo}</span>
                                        <span className="text-xs text-muted-foreground">{persona.numero_documento}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
