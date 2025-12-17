'use client'

import { useCotizador } from '@/hooks/useCotizador'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, UserPlus, CheckCircle2, UserX, Loader2 } from 'lucide-react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { buscarClientePorDNI } from '@/lib/actions/clientes-actions'
import { consultarEntidad } from '@/lib/apis/consultasperu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RegistroClienteCompleto } from '@/components/business/RegistroClienteCompleto'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { debounce } from '@/lib/utils/performance'

import { handleAppError } from '@/lib/utils/error-handler'
import { CardGridSkeleton } from '@/components/ui/loading-skeleton'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { identificacionSchema, IdentificacionFormData } from '@/lib/validators/empeno-schemas'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export default function IdentificacionStep() {
    const { cliente, setCliente } = useCotizador()
    const [loading, setLoading] = useState(false)
    const [registroModalOpen, setRegistroModalOpen] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [datosEntidad, setDatosEntidad] = useState<any>(null)
    const [esClienteExistente, setEsClienteExistente] = useState(false)

    const searchParams = useSearchParams()
    const dniParam = searchParams.get('dni')

    const form = useForm<IdentificacionFormData>({
        resolver: zodResolver(identificacionSchema),
        defaultValues: {
            tipoDocumento: 'DNI',
            numeroDocumento: ''
        },
        mode: 'onChange'
    })

    // Use useWatch for reactive values instead of form.watch
    const tipoDoc = useWatch({ control: form.control, name: 'tipoDocumento' })
    const dniSearch = useWatch({ control: form.control, name: 'numeroDocumento' })

    useEffect(() => {
        if (dniParam) {
            form.setValue('numeroDocumento', dniParam)
            handleSearch(dniParam)
        }
    }, [dniParam])

    const handleSearch = async (dniOverride?: string) => {
        const dni = dniOverride || dniSearch
        if (!dni) {
            toast.error('Ingresa un número de documento')
            return
        }

        setLoading(true)
        setDatosEntidad(null)
        setEsClienteExistente(false)

        const loadingToast = toast.loading('Buscando cliente...')

        try {
            // 1. Buscar en nuestra BD de clientes
            const res = await buscarClientePorDNI(dni)

            if (res.encontrado && res.perfil) {
                // Ya es cliente nuestro
                setEsClienteExistente(true)
                setCliente({
                    id: res.perfil.id,
                    dni: res.perfil.numero_documento,
                    nombres: res.perfil.nombres || '',
                    apellido_paterno: res.perfil.apellido_paterno || '',
                    apellido_materno: res.perfil.apellido_materno || ''
                })
                // También guardar datos para mostrar
                setDatosEntidad({
                    nombre_completo: `${res.perfil.nombres || ''} ${res.perfil.apellido_paterno || ''} ${res.perfil.apellido_materno || ''}`.trim(),
                    numero_documento: res.perfil.numero_documento
                })
                toast.success('¡Cliente encontrado! Ya está registrado en el sistema', { id: loadingToast })
            } else {
                // No es cliente, buscar en RENIEC/SUNAT
                setCliente(null)
                setEsClienteExistente(false)

                if (tipoDoc !== 'CE') {
                    toast.loading(`Consultando ${tipoDoc === 'RUC' ? 'SUNAT' : 'RENIEC'}...`, { id: loadingToast })
                    const entidad = await consultarEntidad(tipoDoc, dni)
                    if (entidad) {
                        setDatosEntidad(entidad)
                        toast.success(`Persona encontrada en ${tipoDoc === 'RUC' ? 'SUNAT' : 'RENIEC'}`, { id: loadingToast })
                    } else {
                        toast.error('No se encontró información en ' + (tipoDoc === 'RUC' ? 'SUNAT' : 'RENIEC'), { id: loadingToast })
                    }
                } else {
                    toast.dismiss(loadingToast)
                }
            }
        } catch (error) {
            handleAppError(error, 'Error al buscar cliente')
            setCliente(null)
            setDatosEntidad(null)
        } finally {
            setLoading(false)
        }
    }

    const handleClienteRegistrado = (nuevoCliente: { id: string; numero_documento: string; nombres?: string; apellido_paterno?: string; apellido_materno?: string }) => {
        setCliente({
            id: nuevoCliente.id,
            dni: nuevoCliente.numero_documento,
            nombres: nuevoCliente.nombres || '',
            apellido_paterno: nuevoCliente.apellido_paterno || '',
            apellido_materno: nuevoCliente.apellido_materno || ''
        })
        setRegistroModalOpen(false)
        toast.success('✓ Cliente registrado exitosamente')
    }

    // Debounced search
    const debouncedSearch = useMemo(
        () => debounce((dni: string) => {
            if (dni && !form.formState.errors.numeroDocumento) {
                handleSearch(dni)
            }
        }, 300),
        [tipoDoc, form.formState.errors.numeroDocumento]
    )

    // Handle input change with debounce
    useEffect(() => {
        if (dniSearch && dniSearch.trim()) {
            debouncedSearch(dniSearch)
        }
    }, [dniSearch, debouncedSearch])

    return (
        <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
                <h3 className="text-lg font-medium mb-2">Buscar Cliente</h3>
                <p className="text-muted-foreground text-sm mb-6">
                    Ingrese el DNI o RUC del cliente para iniciar la operación.
                </p>

                <Form {...form}>
                    <form onSubmit={(e) => e.preventDefault()} className="flex gap-3 items-start">
                        {/* Selector de Tipo de Documento */}
                        <FormField
                            control={form.control}
                            name="tipoDocumento"
                            render={({ field }) => (
                                <FormItem className="w-48 text-left">
                                    <FormLabel>Tipo de Documento</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="DNI">DNI (Natural)</SelectItem>
                                            <SelectItem value="RUC">RUC (Jurídica)</SelectItem>
                                            <SelectItem value="CE">Carnet Extranjería</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo de búsqueda */}
                        <FormField
                            control={form.control}
                            name="numeroDocumento"
                            render={({ field }) => (
                                <FormItem className="flex-1 text-left">
                                    <FormLabel>Número de Documento</FormLabel>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input
                                                    placeholder={tipoDoc === 'DNI' ? '8 dígitos' : tipoDoc === 'RUC' ? '11 dígitos' : 'Número'}
                                                    className="pl-9"
                                                    {...field}
                                                    maxLength={tipoDoc === 'DNI' ? 8 : tipoDoc === 'RUC' ? 11 : 20}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !loading && !form.formState.errors.numeroDocumento) {
                                                            e.preventDefault()
                                                            handleSearch()
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => handleSearch()}
                                            disabled={loading || !!form.formState.errors.numeroDocumento}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Buscando...
                                                </>
                                            ) : (
                                                'Buscar'
                                            )}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>

            {/* Resultado de la Búsqueda */}
            {loading ? (
                <div className="max-w-lg mx-auto">
                    <CardGridSkeleton cards={1} />
                </div>
            ) : cliente && esClienteExistente ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 max-w-lg mx-auto">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-500 p-3 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-green-900 text-lg">Cliente Registrado</h4>
                                <Badge className="bg-green-600">Ya es cliente</Badge>
                            </div>
                            <p className="text-green-800 font-medium text-lg">
                                {datosEntidad?.nombre_completo}
                            </p>
                            <p className="text-green-700 text-sm mt-1">
                                {tipoDoc}: {datosEntidad?.numero_documento}
                            </p>
                            <p className="text-green-600 text-xs mt-3">
                                ✓ Puede continuar con el proceso de empeño
                            </p>
                        </div>
                    </div>
                </div>
            ) : datosEntidad && !esClienteExistente && !loading ? (
                <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-6 max-w-lg mx-auto">
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-500 p-3 rounded-full">
                            <UserX className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-amber-900 text-lg">Persona Encontrada</h4>
                                <Badge variant="outline" className="border-amber-600 text-amber-700">No es cliente aún</Badge>
                            </div>
                            <p className="text-amber-800 font-medium text-lg">
                                {datosEntidad.nombre_completo}
                            </p>
                            <p className="text-amber-700 text-sm mt-1">
                                {tipoDoc}: {datosEntidad.numero_documento}
                            </p>
                            {datosEntidad.verificado_api && (
                                <p className="text-amber-600 text-xs mt-1">
                                    ✓ Verificado en {tipoDoc === 'RUC' ? 'SUNAT' : 'RENIEC'}
                                </p>
                            )}
                            <Button
                                className="mt-4 w-full bg-amber-600 hover:bg-amber-700"
                                onClick={() => setRegistroModalOpen(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Registrar como Cliente
                            </Button>
                        </div>
                    </div>
                </div>
            ) : dniSearch && !loading && !datosEntidad && !cliente ? (
                <div className="text-center py-8 border-2 border-dashed border-red-300 rounded-lg max-w-lg mx-auto bg-red-50">
                    <UserX className="w-16 h-16 text-red-400 mx-auto mb-3" />
                    <p className="text-red-700 font-medium mb-2">No se encontró información</p>
                    <p className="text-red-600 text-sm mb-4">
                        No existe en {tipoDoc === 'RUC' ? 'SUNAT' : 'RENIEC'} ni en nuestros registros
                    </p>
                    <Button
                        variant="outline"
                        className="gap-2 border-red-400 text-red-700 hover:bg-red-100"
                        onClick={() => setRegistroModalOpen(true)}
                    >
                        <UserPlus className="w-4 h-4" />
                        Registrar Manualmente
                    </Button>
                </div>
            ) : null}

            <Dialog open={registroModalOpen} onOpenChange={setRegistroModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle>Registro de Nuevo Cliente</DialogTitle>
                    </DialogHeader>
                    <RegistroClienteCompleto
                        initialTipoDoc={tipoDoc}
                        initialDNI={dniSearch}
                        onClienteRegistrado={handleClienteRegistrado}
                        hideHeader={true}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
