'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, CheckCircle2, User } from 'lucide-react'
import { useState } from 'react'
import { consultarEntidad } from '@/lib/apis/consultasperu'
import { buscarPersonas } from '@/lib/actions/tesoreria-actions'
import {
    DatosIdentificacion,
    PersonaSeleccionada,
    OrigenFondos
} from '@/hooks/useInversionistaForm'

// ============================================================================
// CONSTANTS
// ============================================================================

const ORIGENES_FONDOS: { value: OrigenFondos; label: string }[] = [
    { value: 'AHORROS', label: '💰 Ahorros personales' },
    { value: 'NEGOCIO', label: '🏪 Ganancias de negocio' },
    { value: 'VENTA_BIENES', label: '🏠 Venta de bienes' },
    { value: 'HERENCIA', label: '📜 Herencia' },
    { value: 'OTRO', label: '📋 Otro' }
]

// ============================================================================
// PROPS
// ============================================================================

interface StepIdentificacionProps {
    data: DatosIdentificacion
    onChange: (data: DatosIdentificacion) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepIdentificacion({ data, onChange }: StepIdentificacionProps) {
    const [searchDNI, setSearchDNI] = useState('')
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchError, setSearchError] = useState('')

    const handleSearch = async () => {
        if (searchDNI.length < 8) {
            setSearchError('DNI debe tener 8 dígitos')
            return
        }

        setSearchLoading(true)
        setSearchError('')

        try {
            // Primero buscar en BD local
            const personasExistentes = await buscarPersonas(searchDNI)

            if (personasExistentes.length > 0) {
                const persona = personasExistentes[0]
                // buscarPersonas returns: { id, nombre_completo, numero_documento }
                const nombreParts = persona.nombre_completo.split(' ')
                const nombres = nombreParts.slice(0, -2).join(' ') || nombreParts[0] || ''
                const apellidos = nombreParts.slice(-2).join(' ') || ''
                onChange({
                    ...data,
                    persona: {
                        id: persona.id,
                        nombres: nombres,
                        apellidos: apellidos,
                        dni: persona.numero_documento,
                        esNueva: false
                    }
                })
                return
            }

            // Si no existe, consultar RENIEC
            const datosReniec = await consultarEntidad('DNI', searchDNI)
            console.log('Respuesta RENIEC:', datosReniec)

            if (datosReniec && (datosReniec.nombres || datosReniec.nombre_completo)) {
                // Extraer nombres según lo que devuelva la API
                const nombres = datosReniec.nombres || datosReniec.nombre_completo?.split(',')[1]?.trim() || ''
                const apellidos = datosReniec.apellidos ||
                    `${datosReniec.apellido_paterno || ''} ${datosReniec.apellido_materno || ''}`.trim() ||
                    datosReniec.nombre_completo?.split(',')[0]?.trim() || ''

                onChange({
                    ...data,
                    persona: {
                        id: `temp_${searchDNI}`,
                        nombres: nombres,
                        apellidos: apellidos,
                        dni: searchDNI,
                        esNueva: true
                    }
                })
            } else {
                setSearchError('DNI no encontrado en RENIEC')
            }
        } catch (error) {
            console.error('Error buscando DNI:', error)
            setSearchError('Error al buscar')
        } finally {
            setSearchLoading(false)
        }
    }

    const handleClear = () => {
        setSearchDNI('')
        setSearchError('')
        onChange({
            ...data,
            persona: null
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center pb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">¿Quién invierte?</h3>
                <p className="text-sm text-muted-foreground">Identificación del inversionista</p>
            </div>

            {/* DNI Search */}
            <div className="space-y-2">
                <Label>Número de DNI</Label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="12345678"
                        value={searchDNI}
                        onChange={(e) => setSearchDNI(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        maxLength={8}
                        disabled={data.persona !== null}
                    />
                    {data.persona ? (
                        <Button variant="outline" onClick={handleClear}>
                            Cambiar
                        </Button>
                    ) : (
                        <Button onClick={handleSearch} disabled={searchLoading || searchDNI.length < 8}>
                            {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </Button>
                    )}
                </div>
                {searchError && <p className="text-sm text-red-500">{searchError}</p>}
            </div>

            {/* Person Card */}
            {data.persona && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="font-medium">{data.persona.nombres} {data.persona.apellidos}</div>
                            <div className="text-sm text-muted-foreground">
                                DNI: {data.persona.dni}
                                {data.persona.esNueva && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Nuevo</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Info */}
            {data.persona && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Teléfono (WhatsApp) *</Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm">
                                    +51
                                </span>
                                <Input
                                    type="tel"
                                    placeholder="999 888 777"
                                    value={data.telefono}
                                    onChange={(e) => onChange({ ...data, telefono: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                                    className="rounded-l-none"
                                    maxLength={9}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email (opcional)</Label>
                            <Input
                                type="email"
                                placeholder="email@ejemplo.com"
                                value={data.email}
                                onChange={(e) => onChange({ ...data, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>¿De dónde provienen los fondos? *</Label>
                        <Select
                            value={data.origenFondos}
                            onValueChange={(v) => onChange({ ...data, origenFondos: v as OrigenFondos })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el origen" />
                            </SelectTrigger>
                            <SelectContent>
                                {ORIGENES_FONDOS.map(item => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Ocupación</Label>
                        <Input
                            placeholder="Ej: Comerciante, Profesional, Empresario"
                            value={data.ocupacion}
                            onChange={(e) => onChange({ ...data, ocupacion: e.target.value })}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
