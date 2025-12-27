'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    MapPin,
    Phone,
    Check,
    Loader2,
    ChevronRight,
    ChevronLeft
} from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { crearSucursalAdmin } from '@/lib/actions/super-admin-actions'
import { SmartLocationSelector } from '@/components/ui/smart-location-selector'

interface CreateSucursalAdminWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    empresaId: string
    onSuccess?: () => void
}

interface FormData {
    codigo: string
    nombre: string
    direccion: string
    telefono: string
    tipo_sucursal: 'principal' | 'secundaria' | 'express'
    ubigeo_cod: string
    departamento: string
    provincia: string
    distrito: string
}

const INITIAL_FORM: FormData = {
    codigo: '',
    nombre: '',
    direccion: '',
    telefono: '',
    tipo_sucursal: 'secundaria',
    ubigeo_cod: '',
    departamento: '',
    provincia: '',
    distrito: ''
}

const TIPOS_SUCURSAL = [
    {
        id: 'principal',
        label: 'Sede Principal',
        description: 'Oficina central de operaciones',
        icon: '🏛️'
    },
    {
        id: 'secundaria',
        label: 'Sucursal',
        description: 'Punto de atención regular',
        icon: '🏢'
    },
    {
        id: 'express',
        label: 'Punto Express',
        description: 'Módulo de atención rápida',
        icon: '⚡'
    }
]

export function CreateSucursalAdminWizard({ open, onOpenChange, empresaId, onSuccess }: CreateSucursalAdminWizardProps) {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState<FormData>(INITIAL_FORM)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

    const resetForm = () => {
        setForm(INITIAL_FORM)
        setStep(1)
        setErrors({})
    }

    const handleClose = () => {
        resetForm()
        onOpenChange(false)
    }

    const validateStep = (stepNum: number): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {}

        if (stepNum === 1) {
            if (!form.codigo.trim()) newErrors.codigo = 'Requerido'
            if (!form.nombre.trim()) newErrors.nombre = 'Requerido'
            if (!form.direccion.trim()) newErrors.direccion = 'Requerido'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateStep(1)) return

        setLoading(true)
        try {
            const result = await crearSucursalAdmin({
                empresa_id: empresaId,
                codigo: form.codigo.toUpperCase(),
                nombre: form.nombre,
                direccion: form.direccion,
                telefono: form.telefono,
                tipo_sucursal: form.tipo_sucursal,
                ubigeo_cod: form.ubigeo_cod,
                departamento: form.departamento,
                provincia: form.provincia,
                distrito: form.distrito
            })

            if (result.success) {
                toast.success('¡Sucursal creada!', {
                    description: `${form.nombre} ha sido registrada exitosamente`
                })
                handleClose()
                onSuccess?.()
            } else {
                toast.error('Error', { description: result.error })
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-6">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        Nueva Sucursal
                    </SheetTitle>
                    <SheetDescription>
                        Añade un nuevo punto de operación a esta empresa
                    </SheetDescription>
                </SheetHeader>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-6">
                    <div className={cn(
                        "flex-1 h-1.5 rounded-full transition-colors",
                        step >= 1 ? "bg-purple-500" : "bg-muted"
                    )} />
                    <div className={cn(
                        "flex-1 h-1.5 rounded-full transition-colors",
                        step >= 2 ? "bg-purple-500" : "bg-muted"
                    )} />
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                        >
                            {/* Tipo de Sucursal */}
                            <div className="space-y-3">
                                <Label>Tipo de Sucursal</Label>
                                <RadioGroup
                                    value={form.tipo_sucursal}
                                    onValueChange={v => setForm({ ...form, tipo_sucursal: v as 'principal' | 'secundaria' | 'express' })}
                                    className="grid grid-cols-3 gap-2"
                                >
                                    {TIPOS_SUCURSAL.map(tipo => (
                                        <Label
                                            key={tipo.id}
                                            className={cn(
                                                "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all text-center",
                                                form.tipo_sucursal === tipo.id
                                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                                                    : "border-muted hover:border-muted-foreground/50"
                                            )}
                                        >
                                            <RadioGroupItem value={tipo.id} className="sr-only" />
                                            <span className="text-2xl mb-1">{tipo.icon}</span>
                                            <span className="font-medium text-xs">{tipo.label}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        Código *
                                    </Label>
                                    <Input
                                        placeholder="SUC-01"
                                        value={form.codigo}
                                        onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                                        className={cn("font-mono", errors.codigo ? 'border-red-500' : '')}
                                        maxLength={10}
                                    />
                                    {errors.codigo && <p className="text-xs text-red-500">{errors.codigo}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        Teléfono
                                    </Label>
                                    <Input
                                        placeholder="01-1234567"
                                        value={form.telefono}
                                        onChange={e => setForm({ ...form, telefono: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input
                                    placeholder="Sucursal Centro"
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    className={errors.nombre ? 'border-red-500' : ''}
                                />
                                {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Dirección *</Label>
                                <Input
                                    placeholder="Av. Principal 123"
                                    value={form.direccion}
                                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                                    className={errors.direccion ? 'border-red-500' : ''}
                                />
                                {errors.direccion && <p className="text-xs text-red-500">{errors.direccion}</p>}
                            </div>

                            <Button onClick={() => setStep(2)} className="w-full">
                                Continuar
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 2: Location */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    Ubicación Geográfica
                                </Label>
                                <SmartLocationSelector
                                    onLocationChange={(loc) => setForm(prev => ({
                                        ...prev,
                                        ubigeo_cod: loc.distritoId,
                                        departamento: loc.departamento,
                                        provincia: loc.provincia,
                                        distrito: loc.distrito
                                    }))}
                                    defaultValues={{
                                        departamentoId: '12',
                                        provinciaId: '1201',
                                        distritoId: '120114'
                                    }}
                                />
                            </div>

                            {/* Preview */}
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                                <h4 className="font-medium mb-2">Resumen</h4>
                                <div className="text-sm space-y-1 text-muted-foreground">
                                    <p>• <strong>{form.nombre || '—'}</strong> ({form.codigo || '—'})</p>
                                    <p>• Tipo: {TIPOS_SUCURSAL.find(t => t.id === form.tipo_sucursal)?.label}</p>
                                    <p>• {form.direccion || 'Sin dirección'}</p>
                                    {form.departamento && (
                                        <p>• {form.distrito}, {form.provincia}, {form.departamento}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Atrás
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Crear Sucursal
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    )
}
