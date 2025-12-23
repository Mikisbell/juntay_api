"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2, Search, ExternalLink } from "lucide-react"
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
import { consultarEntidad, type DatosEntidad } from "@/lib/apis/consultasperu"
import { crearClienteDesdeEntidad } from "@/lib/actions/clientes-actions"
import { toast } from "sonner"

interface PersonSearchProps {
    onSelect: (personaId: string, nombre: string) => void
    placeholder?: string
    /** Si true, permite crear cliente desde API si no existe en BD */
    allowCreateFromAPI?: boolean
}

export function PersonSearch({
    onSelect,
    placeholder = "Buscar persona...",
    allowCreateFromAPI = true
}: PersonSearchProps) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [query, setQuery] = useState("")
    const [personas, setPersonas] = useState<{ id: string, nombre_completo: string, numero_documento: string }[]>([])
    const [loading, setLoading] = useState(false)

    // Estado para búsqueda externa (RENIEC)
    const [loadingAPI, setLoadingAPI] = useState(false)
    const [datosExternos, setDatosExternos] = useState<DatosEntidad | null>(null)
    const [creatingClient, setCreatingClient] = useState(false)

    // Detectar si el query parece un DNI (8 dígitos)
    const isDNIQuery = /^\d{8}$/.test(query.trim())

    // Debounce para búsqueda local
    useEffect(() => {
        // Limpiar datos externos cuando cambia el query
        setDatosExternos(null)

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

    // Buscar en RENIEC cuando no hay resultados locales y es DNI
    const handleBuscarEnRENIEC = async () => {
        if (!isDNIQuery) return

        setLoadingAPI(true)
        try {
            const resultado = await consultarEntidad('DNI', query.trim())
            if (resultado) {
                setDatosExternos(resultado)
                toast.success('Persona encontrada en RENIEC')
            } else {
                toast.error('DNI no encontrado en RENIEC')
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al consultar RENIEC')
        } finally {
            setLoadingAPI(false)
        }
    }

    // Crear cliente desde datos de RENIEC y seleccionarlo
    const handleCrearYSeleccionar = async () => {
        if (!datosExternos) return

        setCreatingClient(true)
        try {
            const cliente = await crearClienteDesdeEntidad({
                tipo_documento: 'DNI',
                numero_documento: datosExternos.numero_documento,
                nombre_completo: datosExternos.nombre_completo,
                nombres: datosExternos.nombres,
                apellido_paterno: datosExternos.apellidos?.split(' ')[0],
                apellido_materno: datosExternos.apellidos?.split(' ').slice(1).join(' '),
            })

            if (cliente) {
                toast.success('Persona registrada correctamente')
                // Seleccionar automáticamente
                // cliente puede tener party_id o id dependiendo de la estructura
                const personId = cliente.party_id || cliente.id
                onSelect(personId, cliente.nombre_completo || datosExternos.nombre_completo)
                setOpen(false)
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al registrar persona')
        } finally {
            setCreatingClient(false)
        }
    }

    const noLocalResults = !loading && personas.length === 0 && query.length >= 2

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
            <PopoverContent className="w-full p-0" align="start">
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

                        {/* Resultados locales */}
                        {personas.length > 0 && (
                            <CommandGroup heading="En tu base de datos">
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
                        )}

                        {/* Sin resultados locales - mostrar opción RENIEC */}
                        {noLocalResults && !datosExternos && (
                            <div className="p-3 space-y-2">
                                <p className="text-sm text-muted-foreground text-center">
                                    No se encontró en tu base de datos
                                </p>

                                {isDNIQuery && allowCreateFromAPI && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                        onClick={handleBuscarEnRENIEC}
                                        disabled={loadingAPI}
                                    >
                                        {loadingAPI ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ExternalLink className="w-4 h-4" />
                                        )}
                                        Buscar DNI {query} en RENIEC
                                    </Button>
                                )}

                                {!isDNIQuery && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        💡 Ingresa un DNI de 8 dígitos para buscar en RENIEC
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Datos encontrados en RENIEC */}
                        {datosExternos && (
                            <div className="p-3 space-y-3 bg-blue-50 border-b border-blue-200">
                                <div className="flex items-center gap-2 text-sm text-blue-800">
                                    <Search className="w-4 h-4" />
                                    <span className="font-medium">Encontrado en RENIEC:</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-blue-200">
                                    <p className="font-semibold">{datosExternos.nombre_completo}</p>
                                    <p className="text-xs text-muted-foreground">DNI: {datosExternos.numero_documento}</p>
                                </div>

                                {allowCreateFromAPI && (
                                    <Button
                                        size="sm"
                                        className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                                        onClick={handleCrearYSeleccionar}
                                        disabled={creatingClient}
                                    >
                                        {creatingClient ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        Registrar y Seleccionar
                                    </Button>
                                )}
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
