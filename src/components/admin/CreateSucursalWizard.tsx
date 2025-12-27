'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    MapPin,
    Clock,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Phone,
    Mail,
    Navigation
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { SmartLocationSelector } from '@/components/ui/smart-location-selector'
import { cn } from '@/lib/utils'
import { crearSucursal } from '@/lib/actions/sucursales-actions'
import { toast } from 'sonner'

interface CreateSucursalWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

interface FormData {
    // Step 1: Datos Básicos
    codigo: string
    nombre: string
    tipo_sucursal: 'principal' | 'secundaria' | 'express'
    telefono: string
    telefono_secundario: string
    email: string
    // Step 2: Ubicación
    direccion: string
    referencia: string
    ubigeo_cod: string
    departamento: string
    provincia: string
    distrito: string
    // Step 3: Configuración
    horario_apertura: string
    horario_cierre: string
    dias_operacion: string[]
    auto_crear_caja: boolean
}

const INITIAL_FORM: FormData = {
    codigo: '',
    nombre: '',
    tipo_sucursal: 'secundaria',
    telefono: '',
    telefono_secundario: '',
    email: '',
    direccion: '',
    referencia: '',
    ubigeo_cod: '120114',
    departamento: 'Junín',
    provincia: 'Huancayo',
    distrito: 'El Tambo',
    horario_apertura: '09:00',
    horario_cierre: '19:00',
    dias_operacion: ['L', 'M', 'X', 'J', 'V', 'S'],
    auto_crear_caja: true
}

const DIAS = [
    { id: 'L', label: 'Lun' },
    { id: 'M', label: 'Mar' },
    { id: 'X', label: 'Mié' },
    { id: 'J', label: 'Jue' },
    { id: 'V', label: 'Vie' },
    { id: 'S', label: 'Sáb' },
    { id: 'D', label: 'Dom' },
]

const STEPS = [
    { id: 1, title: 'Datos Básicos', icon: Building2 },
    { id: 2, title: 'Ubicación', icon: MapPin },
    { id: 3, title: 'Configuración', icon: Clock },
]

export function CreateSucursalWizard({ open, onOpenChange, onSuccess }: CreateSucursalWizardProps) {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState<FormData>(INITIAL_FORM)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

    const updateForm = useCallback((updates: Partial<FormData>) => {
        setForm(prev => ({ ...prev, ...updates }))
        // Clear errors for updated fields
        const clearedErrors = Object.keys(updates).reduce((acc, key) => {
            acc[key as keyof FormData] = undefined
            return acc
        }, {} as Partial<Record<keyof FormData, string | undefined>>)
        setErrors(prev => ({ ...prev, ...clearedErrors }))
    }, [])

    const validateStep = (stepNum: number): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {}

        if (stepNum === 1) {
            if (!form.codigo.trim()) newErrors.codigo = 'Código requerido'
            if (!form.nombre.trim()) newErrors.nombre = 'Nombre requerido'
        }

        if (stepNum === 2) {
            if (!form.direccion.trim()) newErrors.direccion = 'Dirección requerida'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 3))
        }
    }

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async () => {
        if (!validateStep(3)) return

        setLoading(true)
        try {
            const result = await crearSucursal({
                codigo: form.codigo.toUpperCase(),
                nombre: form.nombre,
                direccion: form.direccion,
                telefono: form.telefono,
                ubigeo_cod: form.ubigeo_cod,
                departamento: form.departamento,
                provincia: form.provincia,
                distrito: form.distrito,
                // Enterprise fields (to be added to backend)
                // tipo_sucursal: form.tipo_sucursal,
                // referencia: form.referencia,
                // horario_apertura: form.horario_apertura,
                // horario_cierre: form.horario_cierre,
                // dias_operacion: form.dias_operacion,
                // auto_crear_caja: form.auto_crear_caja,
            })

            if (result.success) {
                toast.success('🎉 Sucursal creada exitosamente', {
                    description: `${form.nombre} está lista para operar`
                })
                onOpenChange(false)
                setForm(INITIAL_FORM)
                setStep(1)
                onSuccess?.()
            } else {
                toast.error('Error al crear sucursal', {
                    description: result.error
                })
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        // Reset after animation
        setTimeout(() => {
            setForm(INITIAL_FORM)
            setStep(1)
            setErrors({})
        }, 300)
    }

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="h-5 w-5 text-primary" />
                        Nueva Sucursal
                    </SheetTitle>
                    <SheetDescription>
                        Configure los detalles de la nueva sucursal en 3 simples pasos
                    </SheetDescription>
                </SheetHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 px-4">
                    {STEPS.map((s, idx) => (
                        <div key={s.id} className="flex items-center">
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                                step === s.id && "border-primary bg-primary text-white",
                                step > s.id && "border-green-500 bg-green-500 text-white",
                                step < s.id && "border-muted-foreground/30 text-muted-foreground"
                            )}>
                                {step > s.id ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <s.icon className="h-5 w-5" />
                                )}
                            </div>
                            <span className={cn(
                                "ml-2 text-sm font-medium hidden sm:block",
                                step >= s.id ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {s.title}
                            </span>
                            {idx < STEPS.length - 1 && (
                                <div className={cn(
                                    "w-12 h-0.5 mx-2",
                                    step > s.id ? "bg-green-500" : "bg-muted-foreground/30"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Step 1: Datos Básicos */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="codigo">Código *</Label>
                                        <Input
                                            id="codigo"
                                            placeholder="SUC-01"
                                            value={form.codigo}
                                            onChange={e => updateForm({ codigo: e.target.value.toUpperCase() })}
                                            className={cn(errors.codigo && "border-red-500")}
                                        />
                                        {errors.codigo && <p className="text-xs text-red-500">{errors.codigo}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="sucursal@empresa.com"
                                                value={form.email}
                                                onChange={e => updateForm({ email: e.target.value })}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre de la Sucursal *</Label>
                                    <Input
                                        id="nombre"
                                        placeholder="Sucursal Centro"
                                        value={form.nombre}
                                        onChange={e => updateForm({ nombre: e.target.value })}
                                        className={cn(errors.nombre && "border-red-500")}
                                    />
                                    {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                                </div>

                                <div className="space-y-3">
                                    <Label>Tipo de Sucursal</Label>
                                    <RadioGroup
                                        value={form.tipo_sucursal}
                                        onValueChange={(v) => updateForm({ tipo_sucursal: v as FormData['tipo_sucursal'] })}
                                        className="grid grid-cols-3 gap-3"
                                    >
                                        {[
                                            { value: 'principal', label: 'Principal', desc: 'Sede central' },
                                            { value: 'secundaria', label: 'Secundaria', desc: 'Sucursal regular' },
                                            { value: 'express', label: 'Express', desc: 'Punto rápido' },
                                        ].map(opt => (
                                            <label
                                                key={opt.value}
                                                className={cn(
                                                    "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                                                    form.tipo_sucursal === opt.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-muted hover:border-muted-foreground/50"
                                                )}
                                            >
                                                <RadioGroupItem value={opt.value} className="sr-only" />
                                                <span className="font-medium text-sm">{opt.label}</span>
                                                <span className="text-xs text-muted-foreground">{opt.desc}</span>
                                            </label>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono Principal</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="telefono"
                                                placeholder="064-123456"
                                                value={form.telefono}
                                                onChange={e => updateForm({ telefono: e.target.value })}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono2">Teléfono Secundario</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="telefono2"
                                                placeholder="964-123456"
                                                value={form.telefono_secundario}
                                                onChange={e => updateForm({ telefono_secundario: e.target.value })}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Ubicación */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Navigation className="h-4 w-4" />
                                        Ubicación Geográfica
                                    </Label>
                                    <SmartLocationSelector
                                        onLocationChange={(loc) => updateForm({
                                            ubigeo_cod: loc.distritoId,
                                            departamento: loc.departamento,
                                            provincia: loc.provincia,
                                            distrito: loc.distrito
                                        })}
                                        defaultValues={{
                                            departamentoId: '12',
                                            provinciaId: '1201',
                                            distritoId: '120114'
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="direccion">Dirección Exacta *</Label>
                                    <Input
                                        id="direccion"
                                        placeholder="Av. Huancavelica 1234"
                                        value={form.direccion}
                                        onChange={e => updateForm({ direccion: e.target.value })}
                                        className={cn(errors.direccion && "border-red-500")}
                                    />
                                    {errors.direccion && <p className="text-xs text-red-500">{errors.direccion}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="referencia">Referencia</Label>
                                    <Textarea
                                        id="referencia"
                                        placeholder="Frente al Centro Comercial, a 2 cuadras del parque..."
                                        value={form.referencia}
                                        onChange={e => updateForm({ referencia: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                {/* Location Preview */}
                                <div className="p-4 bg-muted/50 rounded-lg border">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium">{form.direccion || 'Dirección no especificada'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {form.distrito}, {form.provincia} - {form.departamento}
                                            </p>
                                            {form.referencia && (
                                                <p className="text-sm text-muted-foreground mt-1 italic">
                                                    Ref: {form.referencia}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Configuración */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Días de Operación</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {DIAS.map(dia => (
                                            <label
                                                key={dia.id}
                                                className={cn(
                                                    "w-12 h-12 flex items-center justify-center rounded-lg border-2 cursor-pointer transition-all text-sm font-medium",
                                                    form.dias_operacion.includes(dia.id)
                                                        ? "border-primary bg-primary text-white"
                                                        : "border-muted hover:border-muted-foreground/50"
                                                )}
                                            >
                                                <Checkbox
                                                    checked={form.dias_operacion.includes(dia.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            updateForm({ dias_operacion: [...form.dias_operacion, dia.id] })
                                                        } else {
                                                            updateForm({ dias_operacion: form.dias_operacion.filter(d => d !== dia.id) })
                                                        }
                                                    }}
                                                    className="sr-only"
                                                />
                                                {dia.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="horario_apertura">Hora de Apertura</Label>
                                        <Input
                                            id="horario_apertura"
                                            type="time"
                                            value={form.horario_apertura}
                                            onChange={e => updateForm({ horario_apertura: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="horario_cierre">Hora de Cierre</Label>
                                        <Input
                                            id="horario_cierre"
                                            type="time"
                                            value={form.horario_cierre}
                                            onChange={e => updateForm({ horario_cierre: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Configuración Adicional</Label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                                            <Checkbox
                                                checked={form.auto_crear_caja}
                                                onCheckedChange={(checked) => updateForm({ auto_crear_caja: !!checked })}
                                            />
                                            <div>
                                                <p className="font-medium text-sm">Crear caja operativa automáticamente</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Se creará una caja con saldo inicial de S/ 0.00
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Resumen
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Código:</span> {form.codigo || '-'}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Tipo:</span> {form.tipo_sucursal}
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Nombre:</span> {form.nombre || '-'}
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Ubicación:</span> {form.distrito}, {form.provincia}
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Horario:</span> {form.horario_apertura} - {form.horario_cierre}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={step === 1 ? handleClose : handleBack}
                    >
                        {step === 1 ? 'Cancelar' : (
                            <>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Anterior
                            </>
                        )}
                    </Button>

                    {step < 3 ? (
                        <Button onClick={handleNext}>
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            Crear Sucursal
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
