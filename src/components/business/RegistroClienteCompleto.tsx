"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, CheckCircle2, Phone, Mail, MapPin, MessageSquare, Send } from 'lucide-react'
import { consultarEntidad, type DatosEntidad } from '@/lib/apis/consultasperu'
import { enviarCodigoWhatsapp, verificarCodigoWhatsapp } from '@/lib/actions/whatsapp-actions'
import { crearClienteDesdeEntidad } from '@/lib/actions/clientes-actions'
import { useRouter } from 'next/navigation'
import { obtenerDepartamentos, obtenerProvincias, obtenerDistritos, obtenerUbicacionDefault } from '@/lib/actions/ubicacion-actions'

interface RegistroClienteCompletoProps {
    initialTipoDoc?: 'DNI' | 'RUC' | 'CE'
    initialDNI?: string
    onClienteRegistrado?: (cliente: any) => void
    hideHeader?: boolean
}

export function RegistroClienteCompleto({ initialTipoDoc, initialDNI, onClienteRegistrado, hideHeader }: RegistroClienteCompletoProps = {}) {
    const router = useRouter()
    // Estado del formulario
    const [tipoDoc, setTipoDoc] = useState<'DNI' | 'RUC' | 'CE'>(initialTipoDoc || 'DNI')
    const [numeroDoc, setNumeroDoc] = useState(initialDNI || '')
    const [loading, setLoading] = useState(false)
    const [datosEntidad, setDatosEntidad] = useState<DatosEntidad | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Datos adicionales
    const [celular, setCelular] = useState('')
    const [email, setEmail] = useState('')
    const [direccion, setDireccion] = useState('')

    // Estado de validación WhatsApp
    const [whatsappStep, setWhatsappStep] = useState<'IDLE' | 'SENT' | 'VERIFIED'>('IDLE')
    const [codigoVerificacion, setCodigoVerificacion] = useState('')
    const [loadingWhatsapp, setLoadingWhatsapp] = useState(false)

    // Modo manual (cuando API falla)
    const [modoManual, setModoManual] = useState(false)
    const [nombreManual, setNombreManual] = useState('')
    const [apellidosManual, setApellidosManual] = useState('')

    // Ubicación (con IDs para cascada)
    const [departamentoId, setDepartamentoId] = useState('')
    const [provinciaId, setProvinciaId] = useState('')
    const [distritoId, setDistritoId] = useState('')
    const [departamentos, setDepartamentos] = useState<any[]>([])
    const [provincias, setProvincias] = useState<any[]>([])
    const [distritos, setDistritos] = useState<any[]>([])
    const [referencia, setReferencia] = useState('')

    // Auto-buscar si viene con datos pre-llenados (desde modal)
    useEffect(() => {
        if (initialDNI && initialTipoDoc && !datosEntidad && !loading) {
            handleBuscar()
        }
    }, []) // Solo al montar

    // Cargar departamentos y ubicación default al montar
    useEffect(() => {
        const cargarDatos = async () => {
            // Cargar departamentos
            const { departamentos: deps } = await obtenerDepartamentos()
            setDepartamentos(deps)

            // Cargar ubicación default (Junín > Huancayo > El Tambo)
            const ubicacionDefault = await obtenerUbicacionDefault()
            if (ubicacionDefault) {
                setDepartamentoId(ubicacionDefault.departamentoId)
                // Cargar provincias de Junín
                const { provincias: provs } = await obtenerProvincias(ubicacionDefault.departamentoId)
                setProvincias(provs)
                setProvinciaId(ubicacionDefault.provinciaId)
                // Cargar distritos de Huancayo
                if (ubicacionDefault.provinciaId) {
                    const { distritos: dists } = await obtenerDistritos(ubicacionDefault.provinciaId)
                    setDistritos(dists)
                    if (ubicacionDefault.distritoId) {
                        setDistritoId(ubicacionDefault.distritoId)
                    }
                }
            }
        }
        cargarDatos()
    }, [])

    const handleBuscar = async () => {
        if (!numeroDoc) return
        setLoading(true)
        setError(null)
        setDatosEntidad(null)
        setWhatsappStep('IDLE')

        try {
            if (tipoDoc === 'CE') {
                // Para CE no hay API gratuita confiable, permitir ingreso manual
                setDatosEntidad({
                    tipo_documento: 'CE' as any, // Ajuste temporal de tipos
                    numero_documento: numeroDoc,
                    nombre_completo: '',
                    direccion: '',
                    ubigeo: '',
                    departamento: '',
                    provincia: '',
                    distrito: '',
                    verificado_api: false
                } as any)
            } else {
                const resultado = await consultarEntidad(tipoDoc, numeroDoc)
                if (resultado) {
                    setDatosEntidad(resultado)
                    setDireccion(resultado.direccion || '') // Pre-llenar dirección
                    setModoManual(false)
                } else {
                    setError(`⚠️ No se encontró información para ${tipoDoc} ${numeroDoc}.`)
                    // Activar modo manual con datos básicos
                    setModoManual(true)
                    setDatosEntidad({
                        tipo_documento: tipoDoc,
                        numero_documento: numeroDoc,
                        nombre_completo: '', // Se llenará manualmente
                        direccion: '',
                        verificado_api: false
                    } as any)
                }
            }
        } catch (err) {
            setError('Error en la búsqueda.')
        } finally {
            setLoading(false)
        }
    }

    const handleEnviarCodigo = async () => {
        console.log('[DEBUG] handleEnviarCodigo iniciado')
        console.log('[DEBUG] Celular:', celular)

        if (!celular || celular.length !== 9) {
            setError('Ingrese un número de celular válido (9 dígitos)')
            return
        }
        setLoadingWhatsapp(true)
        setError(null)
        try {
            console.log('[DEBUG] Llamando enviarCodigoWhatsapp...')
            const res = await enviarCodigoWhatsapp(celular)
            console.log('[DEBUG] Respuesta recibida:', JSON.stringify(res))

            if (res.success) {
                console.log('[DEBUG] Éxito! Cambiando whatsappStep a SENT')

                // FORZAR actualización de estado
                setWhatsappStep('SENT')

                // Alert SIEMPRE para debug
                alert(`✅ CÓDIGO: ${res.debug_code || 'SIN CÓDIGO'}\n\nwhatsappStep cambiado a: SENT`)

                // Solo mostrar alerta si está en modo DEMO (debug_code presente)
                if (res.debug_code) {
                    console.log('[DEBUG] Modo demo, código:', res.debug_code)
                } else {
                    console.log('[DEBUG] Envío real exitoso')
                    setError(null)
                }
            } else {
                console.log('[DEBUG] Error en respuesta:', res.error)
                setError(res.error || 'Error enviando código')
            }
        } catch (err) {
            console.error('[DEBUG] Excepción capturada:', err)
            setError('Error de conexión WhatsApp')
        } finally {
            console.log('[DEBUG] Finalizando, loadingWhatsapp = false')
            setLoadingWhatsapp(false)
        }
    }

    const handleVerificarCodigo = async () => {
        setLoadingWhatsapp(true)
        try {
            const res = await verificarCodigoWhatsapp(celular, codigoVerificacion)
            if (res.success) {
                setWhatsappStep('VERIFIED')
                setError(null)
            } else {
                setError(res.error || 'Código incorrecto')
            }
        } catch (err) {
            setError('Error verificando código')
        } finally {
            setLoadingWhatsapp(false)
        }
    }

    const handleGuardarCliente = async () => {
        if (!datosEntidad) return
        setLoading(true)

        try {
            // Obtener nombres de ubicación desde los IDs seleccionados
            const departamentoNombre = departamentos.find(d => d.id === departamentoId)?.nombre || ''
            const provinciaNombre = provincias.find(p => p.id === provinciaId)?.nombre || ''
            const distritoNombre = distritos.find(d => d.id === distritoId)?.nombre || ''

            // Construir datos finales
            const datosFinales = {
                ...datosEntidad,
                // Si es modo manual, usar los campos manuales
                nombre_completo: modoManual ? `${nombreManual} ${apellidosManual}`.trim() : datosEntidad.nombre_completo,
                nombres: modoManual ? nombreManual : datosEntidad.nombres,
                apellidos: modoManual ? apellidosManual : datosEntidad.apellidos,
                celular,
                email,
                direccion: `${direccion}${referencia ? ' - ' + referencia : ''}`, // Combinar dirección con referencia
                departamento: departamentoNombre,
                provincia: provinciaNombre,
                distrito: distritoNombre,
                whatsapp_verificado: true
            }

            const res = await crearClienteDesdeEntidad(datosFinales)

            if (res.success && res.cliente) {
                if (onClienteRegistrado) {
                    // Modo modal: llamar callback
                    onClienteRegistrado(res.cliente)
                } else {
                    // Modo standalone: redirigir
                    router.push(`/dashboard/mostrador/nuevo-empeno?dni=${datosEntidad.numero_documento}`)
                }
            } else {
                setError(res.error || 'Error al guardar cliente')
            }
        } catch (err) {
            setError('Error inesperado al guardar cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={hideHeader ? "space-y-4" : "max-w-2xl mx-auto space-y-6"}>
            {/* Solo mostrar búsqueda si NO viene desde modal */}
            {!hideHeader && (
                <Card className="border-t-4 border-t-blue-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-blue-600" />
                            Identificación del Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Selector y Búsqueda */}
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <Label>Tipo Documento</Label>
                                <Select value={tipoDoc} onValueChange={(v: any) => setTipoDoc(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DNI">DNI (Natural)</SelectItem>
                                        <SelectItem value="RUC">RUC (Jurídica)</SelectItem>
                                        <SelectItem value="CE">Carnet Extranjería</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <Label>Número de Documento</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={numeroDoc}
                                        onChange={(e) => setNumeroDoc(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                                        placeholder={tipoDoc === 'DNI' ? '8 dígitos' : '11 dígitos'}
                                        className="font-mono text-lg"
                                        maxLength={tipoDoc === 'DNI' ? 8 : 11}
                                    />
                                    <Button onClick={handleBuscar} disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin" /> : <Search />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Formulario de Datos (Solo aparece si se encontró entidad O modo manual) */}
            {datosEntidad && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t-4 border-t-emerald-500 shadow-lg">
                    <CardHeader className="bg-slate-50 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                {modoManual ? (
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl text-slate-900">Registro Manual</h3>
                                        <p className="text-sm text-slate-600">Complete los datos del cliente manualmente</p>

                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <Label>Nombres *</Label>
                                                <Input
                                                    value={nombreManual}
                                                    onChange={(e) => setNombreManual(e.target.value)}
                                                    placeholder="Nombres completos"
                                                />
                                            </div>
                                            <div>
                                                <Label>Apellidos *</Label>
                                                <Input
                                                    value={apellidosManual}
                                                    onChange={(e) => setApellidosManual(e.target.value)}
                                                    placeholder="Apellidos completos"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-xl text-slate-900">
                                            {datosEntidad.nombre_completo || 'Nombre no disponible'}
                                        </h3>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline" className="bg-white">
                                                {datosEntidad.tipo_documento}: {datosEntidad.numero_documento}
                                            </Badge>
                                            {datosEntidad.verificado_api && (
                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Verificado {tipoDoc === 'RUC' ? 'SUNAT' : 'RENIEC'}
                                                </Badge>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                        {/* Sección de Contacto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Celular con Validación WhatsApp */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-slate-500" />
                                    Celular (WhatsApp) <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={celular}
                                        onChange={(e) => setCelular(e.target.value)}
                                        placeholder="999 999 999"
                                        disabled={whatsappStep === 'VERIFIED'}
                                        className={whatsappStep === 'VERIFIED' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium' : ''}
                                    />
                                    {whatsappStep === 'IDLE' && (
                                        <Button
                                            size="sm"
                                            onClick={handleEnviarCodigo}
                                            disabled={loadingWhatsapp || !celular}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {loadingWhatsapp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validar (Opcional)'}
                                        </Button>
                                    )}
                                    {whatsappStep === 'VERIFIED' && (
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                    )}
                                </div>

                                {/* DEBUG: Mostrar estado actual */}
                                <div className="text-xs text-gray-500 mt-1">
                                    Estado WhatsApp: {whatsappStep}
                                </div>

                                {/* Input de Código - SIEMPRE VISIBLE PARA DEBUG */}
                                <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                                    <Input
                                        placeholder="Código de 6 dígitos"
                                        value={codigoVerificacion}
                                        onChange={(e) => setCodigoVerificacion(e.target.value)}
                                        className="w-40"
                                        disabled={whatsappStep === 'IDLE'}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleVerificarCodigo}
                                        disabled={loadingWhatsapp || whatsappStep === 'IDLE'}
                                    >
                                        Verificar
                                    </Button>
                                </div>

                                {whatsappStep === 'SENT' && (
                                    <div className="text-xs bg-green-50 border border-green-200 text-green-700 p-2 rounded">
                                        ✅ Código enviado al WhatsApp +51{celular}. Ingrese el código recibido.
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                    Correo Electrónico
                                </Label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="cliente@ejemplo.com"
                                />
                            </div>

                            {/* Dirección Domiciliaria */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-600" />
                                    Dirección Domiciliaria
                                </Label>
                                <Input
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    placeholder="Dirección completa"
                                    className="w-full"
                                />
                            </div>

                            {/* Referencia */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-600" />
                                    Referencia
                                </Label>
                                <Input
                                    value={referencia}
                                    onChange={(e) => setReferencia(e.target.value)}
                                    placeholder="Ej: Al frente del mercado central, cerca de la plaza, etc."
                                    className="w-full"
                                />
                            </div>

                            {/* Ubicación Geográfica - Selects en Cascada */}
                            <div className="space-y-2">
                                <Label>Departamento *</Label>
                                <Select
                                    value={departamentoId}
                                    onValueChange={async (value) => {
                                        setDepartamentoId(value)
                                        setProvinciaId('')
                                        setDistritoId('')
                                        const { provincias: provs } = await obtenerProvincias(value)
                                        setProvincias(provs)
                                        setDistritos([])
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione departamento" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-[200px]">
                                        {departamentos.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Provincia *</Label>
                                <Select
                                    value={provinciaId}
                                    onValueChange={async (value) => {
                                        setProvinciaId(value)
                                        setDistritoId('')
                                        const { distritos: dists } = await obtenerDistritos(value)
                                        setDistritos(dists)
                                    }}
                                    disabled={!departamentoId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={departamentoId ? "Seleccione provincia" : "Primero seleccione departamento"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-[200px]">
                                        {provincias.map((prov) => (
                                            <SelectItem key={prov.id} value={prov.id}>
                                                {prov.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Distrito *</Label>
                                <Select
                                    value={distritoId}
                                    onValueChange={setDistritoId}
                                    disabled={!provinciaId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={provinciaId ? "Seleccione distrito" : "Primero seleccione provincia"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-[200px]">
                                        {distritos.map((dist) => (
                                            <SelectItem key={dist.id} value={dist.id}>
                                                {dist.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Botón Final */}
                        <div className="pt-4 border-t">
                            <Button
                                className="w-full h-12 text-lg"
                                disabled={!celular || celular.length !== 9}
                                onClick={handleGuardarCliente}
                            >
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Registrar Cliente {whatsappStep !== 'VERIFIED' ? '(Sin Validar)' : ''}
                                </span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
