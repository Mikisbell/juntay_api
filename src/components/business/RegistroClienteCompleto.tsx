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
import { toast } from 'sonner'
import { consultarEntidad, type DatosEntidad } from '@/lib/apis/consultasperu'
import { enviarCodigoWhatsapp, verificarCodigoWhatsapp } from '@/lib/actions/whatsapp-actions'
import { crearClienteDesdeEntidad } from '@/lib/actions/clientes-actions'
import { useRouter } from 'next/navigation'
import { obtenerDepartamentos, obtenerProvincias, obtenerDistritos, obtenerUbicacionDefault } from '@/lib/actions/ubicacion-actions'
import { SmartLocationSelector } from '@/components/ui/smart-location-selector'
import { SmartPasteInput } from '@/components/ui/smart-paste-input'

interface RegistroClienteCompletoProps {
    initialTipoDoc?: 'DNI' | 'RUC' | 'CE'
    initialDNI?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClienteRegistrado?: (cliente: any) => void
    hideHeader?: boolean
    disablePersistence?: boolean
    embedded?: boolean
}

export function RegistroClienteCompleto({
    initialTipoDoc,
    initialDNI,
    onClienteRegistrado,
    hideHeader,
    disablePersistence = false,
    embedded = false
}: RegistroClienteCompletoProps = {}) {
    const router = useRouter()
    // Estado del formulario
    const [tipoDoc, setTipoDoc] = useState<'DNI' | 'RUC' | 'CE'>(initialTipoDoc || 'DNI')
    const [numeroDoc, setNumeroDoc] = useState(initialDNI || '')
    const [loading, setLoading] = useState(false)
    const [datosEntidad, setDatosEntidad] = useState<DatosEntidad | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Datos adicionales
    const [celular, setCelular] = useState('')
    const [celularReferencia, setCelularReferencia] = useState('') // Teléfono de familiar/emergencia
    const [parentescoReferencia, setParentescoReferencia] = useState('') // Parentesco: Esposa, Padre, etc.
    const [parentescoOtro, setParentescoOtro] = useState('') // Texto personalizado si elige "Otro"
    const [email, setEmail] = useState('')
    const [direccion, setDireccion] = useState('')

    const PARENTESCOS = ['Esposa/o', 'Padre', 'Madre', 'Hermano/a', 'Hijo/a', 'Abuelo/a', 'Tío/a', 'Primo/a', 'Amigo/a', 'Vecino/a', 'Otro']

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [departamentos, setDepartamentos] = useState<any[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [provincias, setProvincias] = useState<any[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [distritos, setDistritos] = useState<any[]>([])
    const [referencia, setReferencia] = useState('')

    // Auto-buscar si viene con datos pre-llenados (desde modal)
    useEffect(() => {
        if (initialDNI && initialTipoDoc && !datosEntidad && !loading) {
            handleBuscar()
        }
    }, []) // Solo al montar

    // ============================================
    // PERSISTENCIA: Guardar y restaurar formulario
    // ============================================
    const STORAGE_KEY = 'juntay_registro_cliente_draft'

    // Restaurar datos guardados al montar
    useEffect(() => {
        if (disablePersistence) return // No restaurar si está deshabilitado

        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved && !initialDNI) { // No restaurar si viene con datos del modal
            try {
                const data = JSON.parse(saved)
                if (data.numeroDoc) setNumeroDoc(data.numeroDoc)
                if (data.tipoDoc) setTipoDoc(data.tipoDoc)
                if (data.celular) setCelular(data.celular)
                if (data.celularReferencia) setCelularReferencia(data.celularReferencia)
                if (data.email) setEmail(data.email)
                if (data.direccion) setDireccion(data.direccion)
                if (data.referencia) setReferencia(data.referencia)
                if (data.nombreManual) setNombreManual(data.nombreManual)
                if (data.apellidosManual) setApellidosManual(data.apellidosManual)
                if (data.modoManual) setModoManual(data.modoManual)
                if (data.datosEntidad) setDatosEntidad(data.datosEntidad)
            } catch (e) {
                console.error('Error restaurando draft:', e)
            }
        }
    }, [initialDNI, disablePersistence])

    // Guardar cada cambio
    useEffect(() => {
        const draft = {
            numeroDoc, tipoDoc, celular, celularReferencia, email, direccion, referencia,
            nombreManual, apellidosManual, modoManual, datosEntidad
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    }, [numeroDoc, tipoDoc, celular, celularReferencia, email, direccion, referencia, nombreManual, apellidosManual, modoManual, datosEntidad])

    // Limpiar draft después de guardar exitoso
    const limpiarDraft = () => {
        localStorage.removeItem(STORAGE_KEY)
    }

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
            // 1. PRIMERO: Buscar en base de datos local (Cliente ya registrado)
            if (tipoDoc === 'DNI') {
                const { buscarClientePorDNI } = await import('@/lib/actions/clientes-actions')
                const local = await buscarClientePorDNI(numeroDoc)

                if (local.encontrado && local.perfil) {
                    toast.success('Cliente encontrado en base de datos', {
                        description: `Seleccionando a ${local.perfil.nombres}`
                    })

                    // Auto-seleccionar y limpiar draft
                    if (onClienteRegistrado) {
                        onClienteRegistrado(local.perfil)
                        limpiarDraft()
                        setNumeroDoc('') // Reset visual
                        return // Salir, ya terminamos
                    }
                }
            }

            // 2. SEGUNDO: Si no existe, buscar en API Externa (RENIEC/SUNAT)
            if (tipoDoc === 'CE') {
                // Para CE no hay API gratuita confiable, permitir ingreso manual
                setDatosEntidad({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    tipo_documento: 'CE' as any,
                    numero_documento: numeroDoc,
                    nombre_completo: '',
                    direccion: '',
                    ubigeo: '',
                    departamento: '',
                    provincia: '',
                    distrito: '',
                    verificado_api: false
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any)
                }
            }
        } catch (err) {
            console.error(err)
            setError('Error en la búsqueda.')
        } finally {
            setLoading(false)
        }
    }

    // Función para limpiar todo (Reset manual)
    const handleLimpiar = () => {
        setNumeroDoc('')
        setTipoDoc('DNI')
        setDatosEntidad(null)
        setReferencia('')
        setCelular('')
        setCelularReferencia('')
        setEmail('')
        setDireccion('')
        setNombreManual('')
        setApellidosManual('')
        setModoManual(false)
        setError(null)
        limpiarDraft()
    }

    const handleEnviarCodigo = async () => {
        if (!celular || celular.length !== 9) {
            setError('Ingrese un número de celular válido (9 dígitos)')
            return
        }

        setLoadingWhatsapp(true)
        setError(null)

        try {
            const res = await enviarCodigoWhatsapp(celular)

            if (res.success) {
                setWhatsappStep('SENT')
                toast.success('Código enviado por WhatsApp', {
                    description: `Revisa tu WhatsApp +51${celular}`
                })
            } else {
                setError(res.error || 'Error enviando código')
                toast.error('Error', {
                    description: res.error || 'No se pudo enviar el código'
                })
            }
        } catch (err) {
            console.error('Error enviando código:', err)
            setError('Error de conexión WhatsApp')
            toast.error('Error de conexión')
        } finally {
            setLoadingWhatsapp(false)
        }
    }

    const handleVerificarCodigo = async () => {
        if (!codigoVerificacion || codigoVerificacion.length !== 6) {
            setError('Ingrese un código de 6 dígitos')
            return
        }

        setLoadingWhatsapp(true)
        setError(null)

        try {
            const res = await verificarCodigoWhatsapp(celular, codigoVerificacion)

            if (res.success) {
                setWhatsappStep('VERIFIED')
                setCodigoVerificacion('')
                toast.success('¡Teléfono verificado!', {
                    description: 'WhatsApp validado correctamente'
                })
            } else {
                // Código incorrecto o expirado
                setCodigoVerificacion('') // Limpiar para reintentar
                setError(res.error || 'Código incorrecto')
                toast.error('Código inválido', {
                    description: res.error || 'Verifica el código e intenta nuevamente',
                    action: {
                        label: 'Reenviar',
                        onClick: () => {
                            setWhatsappStep('IDLE')
                            handleEnviarCodigo()
                        }
                    }
                })
            }
        } catch (err) {
            console.error('Error verificando código:', err)
            setError('Error verificando código')
            toast.error('Error de verificación')
        } finally {
            setLoadingWhatsapp(false)
        }
    }

    const handleGuardarCliente = async () => {
        if (!datosEntidad) return

        // Validar campos requeridos
        if (!numeroDoc) {
            setError('Número de documento es requerido')
            return
        }
        if (modoManual && (!nombreManual || !apellidosManual)) {
            setError('Nombres y apellidos son requeridos')
            return
        }

        setLoading(true)

        try {
            // Obtener nombres de ubicación desde los IDs seleccionados
            const departamentoNombre = departamentos.find(d => d.id === departamentoId)?.nombre || ''
            const provinciaNombre = provincias.find(p => p.id === provinciaId)?.nombre || ''
            const distritoNombre = distritos.find(d => d.id === distritoId)?.nombre || ''

            // Construir datos finales - ASEGURAR tipo_documento y numero_documento
            const datosFinales = {
                ...datosEntidad,
                // CRÍTICO: Usar valores del estado si datosEntidad no los tiene
                tipo_documento: datosEntidad.tipo_documento || tipoDoc,
                numero_documento: datosEntidad.numero_documento || numeroDoc,
                // Si es modo manual, usar los campos manuales
                nombre_completo: modoManual ? `${nombreManual} ${apellidosManual}`.trim() : (datosEntidad.nombre_completo || `${nombreManual} ${apellidosManual}`.trim()),
                nombres: modoManual ? nombreManual : (datosEntidad.nombres || nombreManual || 'SIN NOMBRE'),
                apellidos: modoManual ? apellidosManual : (datosEntidad.apellidos || apellidosManual || ''),
                telefono: celular,
                telefono_secundario: celularReferencia, // Teléfono de referencia/familiar
                parentesco_referencia: parentescoReferencia === 'Otro' && parentescoOtro
                    ? `Otro: ${parentescoOtro}`
                    : parentescoReferencia, // Parentesco: Esposa, Padre, o "Otro: [texto]"
                email,
                direccion: `${direccion}${referencia ? ' - ' + referencia : ''}`,
                departamento: departamentoNombre,
                provincia: provinciaNombre,
                distrito: distritoNombre,
                ubigeo_cod: distritoId,
                whatsapp_verificado: true
            }

            // DEBUG: Validar que tipo_documento existe
            console.log('📋 datosFinales:', {
                tipo_documento: datosFinales.tipo_documento,
                numero_documento: datosFinales.numero_documento,
                tipoDoc_estado: tipoDoc,
                numeroDoc_estado: numeroDoc
            })

            // Validación final antes de enviar
            if (!datosFinales.tipo_documento || !datosFinales.numero_documento) {
                setError('Error: Tipo o número de documento no definido. Por favor recarga la página.')
                setLoading(false)
                return
            }

            const nuevoCliente = await crearClienteDesdeEntidad(datosFinales)

            // Limpiar el borrador guardado
            limpiarDraft()

            if (onClienteRegistrado) {
                // Modo embedded: notificar al padre
                onClienteRegistrado(nuevoCliente)
            } else {
                // Modo standalone: navegar a detalle
                router.push(`/dashboard/clientes/${nuevoCliente.id}`)
                toast.success('Cliente registrado exitosamente')
            }
        } catch (err) {
            setError('Error inesperado al guardar cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={hideHeader && !embedded ? "space-y-4" : embedded ? "space-y-4" : "max-w-2xl mx-auto space-y-6"}>
            {/* Mostrar búsqueda si no está oculto el header O si está en modo embedded */}
            {(!hideHeader || embedded) && (
                embedded ? (
                    // Layout minimalista para Smart POS (Embedded)
                    <div className="space-y-4 animate-in fade-in">
                        <SmartPasteInput
                            onDataExtracted={(data) => {
                                if (data.dni) {
                                    setTipoDoc('DNI')
                                    setNumeroDoc(data.dni)
                                    if (data.dni.length === 8) {
                                        setTimeout(() => {
                                            const btn = document.getElementById('btn-buscar-cliente')
                                            if (btn) btn.click()
                                        }, 100)
                                    }
                                }
                                if (data.celular) setCelular(data.celular)
                                if (data.nombres) {
                                    setModoManual(true)
                                    const parts = data.nombres.split(' ')
                                    if (parts.length > 2) {
                                        setNombreManual(parts.slice(0, 2).join(' '))
                                        setApellidosManual(parts.slice(2).join(' '))
                                    } else {
                                        setNombreManual(data.nombres)
                                    }
                                    setDatosEntidad({
                                        tipo_documento: 'DNI',
                                        numero_documento: data.dni || 'SIN-DNI',
                                        nombre_completo: data.nombres,
                                        nombres: data.nombres,
                                        apellidos: '',
                                        verificado_api: false,
                                        direccion: '',
                                        ubigeo: ''
                                    })
                                }
                            }}
                        />
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <Label>Tipo Documento</Label>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                                    <Button id="btn-buscar-cliente" onClick={handleBuscar} disabled={loading} title="Buscar Cliente">
                                        {loading ? <Loader2 className="animate-spin" /> : <Search />}
                                    </Button>
                                    <Button variant="ghost" onClick={handleLimpiar} title="Limpiar formulario">
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                ) : (
                    // Layout Estándar con Card (Original)
                    <Card className="border-t-4 border-t-blue-600 shadow-lg">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                                <Search className="h-5 w-5 text-blue-600" />
                                Búsqueda de Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <SmartPasteInput
                                onDataExtracted={(data) => {
                                    if (data.dni) {
                                        setTipoDoc('DNI')
                                        setNumeroDoc(data.dni)
                                        // Trigger search automatically if we have a full DNI
                                        if (data.dni.length === 8) {
                                            // Small delay to let state update
                                            setTimeout(() => {
                                                const btn = document.getElementById('btn-buscar-cliente')
                                                if (btn) btn.click()
                                            }, 100)
                                        }
                                    }
                                    if (data.celular) setCelular(data.celular)
                                    if (data.nombres) {
                                        setModoManual(true)
                                        // Try to split names if possible, otherwise put everything in names
                                        const parts = data.nombres.split(' ')
                                        if (parts.length > 2) {
                                            setNombreManual(parts.slice(0, 2).join(' '))
                                            setApellidosManual(parts.slice(2).join(' '))
                                        } else {
                                            setNombreManual(data.nombres)
                                        }
                                        // Create a fake entity to show the form
                                        setDatosEntidad({
                                            tipo_documento: 'DNI',
                                            numero_documento: data.dni || 'SIN-DNI',
                                            nombre_completo: data.nombres,
                                            nombres: data.nombres,
                                            apellidos: '',
                                            verificado_api: false,
                                            direccion: '',
                                            ubigeo: ''
                                        })
                                    }
                                }}
                            />

                            {/* Selector y Búsqueda */}
                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <Label>Tipo Documento</Label>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                                        <Button id="btn-buscar-cliente" onClick={handleBuscar} disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin" /> : <Search />}
                                        </Button>
                                        <Button variant="ghost" onClick={handleLimpiar} title="Limpiar formulario">
                                            Limpiar
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
                )
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

                                {/* Input de Código - Solo visible cuando se envió */}
                                {whatsappStep === 'SENT' && (
                                    <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Código de 6 dígitos"
                                                value={codigoVerificacion}
                                                onChange={(e) => setCodigoVerificacion(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && codigoVerificacion.length === 6) {
                                                        handleVerificarCodigo()
                                                    }
                                                }}
                                                maxLength={6}
                                                className="w-40 text-center text-lg font-mono"
                                                autoFocus
                                            />
                                            <Button
                                                size="sm"
                                                onClick={handleVerificarCodigo}
                                                disabled={loadingWhatsapp || codigoVerificacion.length !== 6}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {loadingWhatsapp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-green-700 bg-green-50 px-2 py-1 rounded">
                                                ✓ Código enviado a +51{celular}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setWhatsappStep('IDLE')
                                                    handleEnviarCodigo()
                                                }}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                Reenviar código
                                            </button>
                                        </div>
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

                            {/* Teléfono Referencia Familiar + Parentesco */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-slate-500" />
                                    Tel. Referencia Familiar
                                </Label>
                                <div className="flex gap-2 flex-wrap">
                                    <Input
                                        value={celularReferencia}
                                        onChange={(e) => setCelularReferencia(e.target.value)}
                                        placeholder="987654321"
                                        maxLength={9}
                                        className="w-28"
                                    />
                                    <Select value={parentescoReferencia} onValueChange={(v) => {
                                        setParentescoReferencia(v)
                                        if (v !== 'Otro') setParentescoOtro('')
                                    }}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Parentesco" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PARENTESCOS.map((p) => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Campo adicional si elige "Otro" - aparece a la derecha */}
                                    {parentescoReferencia === 'Otro' && (
                                        <Input
                                            value={parentescoOtro}
                                            onChange={(e) => setParentescoOtro(e.target.value)}
                                            placeholder="Especifique..."
                                            className="flex-1 min-w-[100px]"
                                        />
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400">Contacto alternativo en caso de emergencia</p>
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

                            {/* Ubicación Geográfica - Smart Component */}
                            <div className="pt-2">
                                <SmartLocationSelector
                                    defaultValues={{
                                        departamentoId: '12', // Default Junín
                                        provinciaId: '1201',  // Default Huancayo
                                        distritoId: '120114'  // Default El Tambo
                                    }}
                                    onLocationChange={(loc) => {
                                        setDepartamentoId(loc.departamentoId)
                                        setProvinciaId(loc.provinciaId)
                                        setDistritoId(loc.distritoId)

                                        // Actualizar form values ocultos si es necesario
                                        // form.setValue('departamento', loc.departamento)
                                    }}
                                />
                            </div>
                        </div>

                        {/* Botón Final */}
                        <div className="pt-4 border-t space-y-2">
                            {(!celular || celular.length !== 9) && (
                                <p className="text-sm text-amber-600 text-center">
                                    ⚠️ Ingresa un celular de 9 dígitos para continuar
                                </p>
                            )}
                            <Button
                                className="w-full h-12 text-lg"
                                disabled={!celular || celular.length !== 9}
                                onClick={handleGuardarCliente}
                            >
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Registrar Cliente {whatsappStep !== 'VERIFIED' ? '(Sin Validar WhatsApp)' : '✓'}
                                </span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
