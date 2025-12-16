"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, UserPlus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { buscarClientePorDNI, crearClienteDesdeEntidad, type PerfilCliente } from '@/lib/actions/clientes-actions'
import type { DatosEntidad } from '@/lib/apis/consultasperu'

interface Props {
    onClienteSeleccionado: (cliente: PerfilCliente) => void
    autoFocus?: boolean
}

export function BusquedaClienteRapida({ onClienteSeleccionado, autoFocus = true }: Props) {
    const [dni, setDni] = useState('')
    const [loading, setLoading] = useState(false)
    const [perfil, setPerfil] = useState<PerfilCliente | null>(null)
    const [datosRENIEC, setDatosRENIEC] = useState<DatosEntidad | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const lastInputTime = useRef<number>(0)

    // Auto-focus al montar
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus()
        }
    }, [autoFocus])

    // Detector de código de barras (entrada rápida)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const now = Date.now()
        const timeSinceLastKey = now - lastInputTime.current
        lastInputTime.current = now

        // Si la entrada es muy rápida (< 50ms entre teclas), es un lector de barras
        if (timeSinceLastKey < 50 && dni.length >= 7) {
            console.log('Código de barras detectado')
        }

        // Enter para buscar
        if (e.key === 'Enter' && dni.length === 8) {
            handleBuscar()
        }
    }

    const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8)
        setDni(value)
        setError(null)

        // Auto-búsqueda al completar 8 dígitos
        if (value.length === 8 && !loading) {
            setTimeout(() => handleBuscar(value), 300) // Debounce 300ms
        }
    }

    const handleBuscar = async (dniParam?: string) => {
        const dniToSearch = dniParam || dni

        if (dniToSearch.length !== 8) {
            setError('Ingrese los 8 dígitos del DNI')
            return
        }

        setLoading(true)
        setPerfil(null)
        setDatosRENIEC(null)
        setError(null)

        try {
            const resultado = await buscarClientePorDNI(dniToSearch)

            if (resultado.encontrado && resultado.perfil) {
                // Cliente existe en BD
                setPerfil(resultado.perfil)
                onClienteSeleccionado(resultado.perfil)
            } else {
                // Cliente NO existe - user needs to register manually
                setError('Cliente no encontrado. Use el botón de registro para crear el cliente.')
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setError(error.message || 'Error al buscar cliente')
        } finally {
            setLoading(false)
        }
    }

    const handleCrearCliente = async () => {
        if (!datosRENIEC) return

        setLoading(true)
        try {
            const nuevoCliente = await crearClienteDesdeEntidad(datosRENIEC)

            // Cliente creado exitosamente, usarlo directamente
            setPerfil(nuevoCliente)
            setDatosRENIEC(null)
            onClienteSeleccionado(nuevoCliente)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setError(error.message || 'Error al crear cliente')
            console.error(error) // Added console.error for debugging
        } finally {
            setLoading(false)
        }
    }

    const getEstadoBadge = (estado: string) => {
        const config: Record<string, { label: string; className: string }> = {
            NUEVO: { label: 'Cliente Nuevo', className: 'bg-blue-100 text-blue-800' },
            BUEN_CLIENTE: { label: 'Buen Cliente', className: 'bg-emerald-100 text-emerald-800' },
            REGULAR: { label: 'Regular', className: 'bg-slate-100 text-slate-800' },
            CON_DEUDA: { label: 'Con Deuda', className: 'bg-orange-100 text-orange-800' },
            MOROSO: { label: 'Moroso', className: 'bg-red-100 text-red-800' },
        }
        const { label, className } = config[estado] || config.REGULAR
        return <Badge className={className}>{label}</Badge>
    }

    return (
        <div className="space-y-4">
            {/* Input DNI */}
            <div className="space-y-2">
                <label className="text-sm font-medium">DNI del Cliente</label>
                <div className="relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={dni}
                        onChange={handleDniChange}
                        onKeyDown={handleKeyDown}
                        placeholder="00000000"
                        maxLength={8}
                        className="text-3xl font-mono tracking-widest text-center h-16"
                        disabled={loading}
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
                <p className="text-xs text-slate-500 text-center">
                    Ingrese o escanee el DNI con lector de código de barras
                </p>
            </div>

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Perfil de Cliente Existente */}
            {perfil && (
                <Card className="border-2 border-emerald-500 shadow-lg">
                    <CardHeader className="bg-emerald-50">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-emerald-600 text-white text-lg">
                                    {perfil.nombres?.charAt(0)}{perfil.apellido_paterno?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-bold text-xl text-slate-900">{perfil.nombre_completo}</h3>
                                <p className="text-sm text-slate-600">DNI: {perfil.numero_documento}</p>
                                {perfil.telefono_principal && (
                                    <p className="text-sm text-slate-600">Tel: {perfil.telefono_principal}</p>
                                )}
                            </div>
                            {/* TODO: Re-implement estado and verification badges when fields are added */}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {/* TODO: Re-add statistics when aggregated fields are available in ClienteCompleto */}
                        <div className="text-sm text-slate-600 py-4">
                            <p><strong>DNI:</strong> {perfil.numero_documento}</p>
                            <p><strong>Score Crediticio:</strong> {perfil.score_crediticio}/1000</p>
                            {perfil.email && <p><strong>Email:</strong> {perfil.email}</p>}
                        </div>
                        {/* TODO: Re-add last contracts section when contratos aggregation is available */}
                    </CardContent>
                </Card>
            )}

            {/* Datos de RENIEC - Cliente Nuevo */}
            {datosRENIEC && !perfil && (
                <Card className="border-2 border-blue-500 shadow-lg">
                    <CardHeader className="bg-blue-50">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-blue-600 text-white text-lg">
                                    {datosRENIEC.nombres.charAt(0)}{datosRENIEC.apellidos.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-bold text-xl text-slate-900">{datosRENIEC.nombre_completo}</h3>
                                <p className="text-sm text-slate-600">DNI: {datosRENIEC.numero_documento}</p>
                                <p className="text-xs text-slate-500">{datosRENIEC.distrito}, {datosRENIEC.provincia}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Verificado RENIEC
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <Alert className="bg-blue-50 border-blue-200">
                            <UserPlus className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Cliente verificado.</strong> Listo para registrar en un solo clic.
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={handleCrearCliente}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-md transition-all hover:scale-[1.02]"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                    Registrar y Usar Cliente
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
