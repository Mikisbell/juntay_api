'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Sparkles,
    CreditCard
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
import { crearEmpresaAdmin } from '@/lib/actions/super-admin-actions'

interface CreateEmpresaWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

interface FormData {
    // Step 1: Company Data
    razon_social: string
    nombre_comercial: string
    ruc: string
    email: string
    telefono: string
    direccion: string
    // Step 2: Plan & Admin
    plan_id: 'free' | 'pro' | 'enterprise'
    admin_email: string
    admin_password: string
    crear_admin: boolean
}

const INITIAL_FORM: FormData = {
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    email: '',
    telefono: '',
    direccion: '',
    plan_id: 'free',
    admin_email: '',
    admin_password: '',
    crear_admin: false
}

const STEPS = [
    { id: 1, title: 'Datos de la Empresa', icon: Building2 },
    { id: 2, title: 'Plan y Administrador', icon: User }
]

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        features: ['1 sucursal', '3 usuarios', 'Soporte email'],
        color: 'from-slate-400 to-slate-500'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$99/mes',
        features: ['5 sucursales', '15 usuarios', 'Soporte prioritario', 'Reports avanzados'],
        color: 'from-blue-500 to-blue-600',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        features: ['Sucursales ilimitadas', 'Usuarios ilimitados', 'SLA 99.9%', 'Soporte dedicado'],
        color: 'from-purple-500 to-purple-600'
    }
]

export function CreateEmpresaWizard({ open, onOpenChange, onSuccess }: CreateEmpresaWizardProps) {
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
            if (!form.nombre_comercial.trim()) newErrors.nombre_comercial = 'Requerido'
            if (!form.razon_social.trim()) newErrors.razon_social = 'Requerido'
            if (!form.ruc.trim()) {
                newErrors.ruc = 'Requerido'
            } else if (!/^\d{11}$/.test(form.ruc)) {
                newErrors.ruc = 'RUC debe tener 11 dígitos'
            }
            if (!form.email.trim()) {
                newErrors.email = 'Requerido'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                newErrors.email = 'Email inválido'
            }
        }

        if (stepNum === 2 && form.crear_admin) {
            if (!form.admin_email.trim()) {
                newErrors.admin_email = 'Requerido'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email)) {
                newErrors.admin_email = 'Email inválido'
            }
            if (form.admin_password && form.admin_password.length < 6) {
                newErrors.admin_password = 'Mínimo 6 caracteres'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        setStep(step - 1)
    }

    const handleSubmit = async () => {
        if (!validateStep(2)) return

        setLoading(true)
        try {
            const result = await crearEmpresaAdmin({
                razon_social: form.razon_social,
                nombre_comercial: form.nombre_comercial,
                ruc: form.ruc,
                email: form.email,
                telefono: form.telefono,
                direccion: form.direccion,
                plan_id: form.plan_id,
                admin_email: form.crear_admin ? form.admin_email : undefined,
                admin_password: form.crear_admin ? form.admin_password : undefined
            })

            if (result.success) {
                toast.success('¡Empresa creada exitosamente!', {
                    description: 'Se ha creado la empresa con su sucursal principal'
                })
                handleClose()
                onSuccess?.()
            } else {
                toast.error('Error al crear empresa', {
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

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="pb-6">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        Nueva Empresa
                    </SheetTitle>
                    <SheetDescription>
                        Registra un nuevo tenant en la plataforma JUNTAY
                    </SheetDescription>
                </SheetHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {STEPS.map((s, idx) => (
                        <div key={s.id} className="flex items-center flex-1">
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                        step >= s.id
                                            ? "bg-blue-600 text-white"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {step > s.id ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <s.icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-sm font-medium hidden sm:block",
                                    step >= s.id ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {s.title}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={cn(
                                    "flex-1 h-0.5 mx-4 transition-colors",
                                    step > s.id ? "bg-blue-600" : "bg-muted"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Company Data */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    Nombre Comercial *
                                </Label>
                                <Input
                                    placeholder="Ej: Financiera Huancayo"
                                    value={form.nombre_comercial}
                                    onChange={e => setForm({ ...form, nombre_comercial: e.target.value })}
                                    className={errors.nombre_comercial ? 'border-red-500' : ''}
                                />
                                {errors.nombre_comercial && (
                                    <p className="text-xs text-red-500">{errors.nombre_comercial}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Razón Social *
                                </Label>
                                <Input
                                    placeholder="Ej: FINANCIERA HUANCAYO S.A.C."
                                    value={form.razon_social}
                                    onChange={e => setForm({ ...form, razon_social: e.target.value })}
                                    className={errors.razon_social ? 'border-red-500' : ''}
                                />
                                {errors.razon_social && (
                                    <p className="text-xs text-red-500">{errors.razon_social}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        RUC *
                                    </Label>
                                    <Input
                                        placeholder="20XXXXXXXXX"
                                        maxLength={11}
                                        value={form.ruc}
                                        onChange={e => setForm({ ...form, ruc: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                                        className={cn("font-mono", errors.ruc ? 'border-red-500' : '')}
                                    />
                                    {errors.ruc && (
                                        <p className="text-xs text-red-500">{errors.ruc}</p>
                                    )}
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
                                <Label className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    Email Corporativo *
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="contacto@empresa.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    Dirección (Sede Principal)
                                </Label>
                                <Input
                                    placeholder="Av. Principal 123, Lima"
                                    value={form.direccion}
                                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                                />
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleNext} className="w-full">
                                    Continuar
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Plan & Admin */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Plan Selection */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-base">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    Plan de Suscripción
                                </Label>
                                <RadioGroup
                                    value={form.plan_id}
                                    onValueChange={v => setForm({ ...form, plan_id: v as 'free' | 'pro' | 'enterprise' })}
                                    className="grid gap-3"
                                >
                                    {PLANS.map(plan => (
                                        <Label
                                            key={plan.id}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                                form.plan_id === plan.id
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                    : "border-muted hover:border-muted-foreground/50"
                                            )}
                                        >
                                            <RadioGroupItem value={plan.id} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{plan.name}</span>
                                                    {plan.popular && (
                                                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                                            Popular
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {plan.features.slice(0, 2).join(' • ')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{plan.price}</div>
                                            </div>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Create Admin Toggle */}
                            <div className="space-y-4">
                                <Label
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                        form.crear_admin
                                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                                            : "border-muted"
                                    )}
                                    onClick={() => setForm({ ...form, crear_admin: !form.crear_admin })}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                        form.crear_admin
                                            ? "bg-green-500 border-green-500"
                                            : "border-muted-foreground"
                                    )}>
                                        {form.crear_admin && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    <div>
                                        <div className="font-medium">Crear Usuario Administrador</div>
                                        <div className="text-sm text-muted-foreground">
                                            Se creará un usuario con rol admin para esta empresa
                                        </div>
                                    </div>
                                </Label>

                                {form.crear_admin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pl-9"
                                    >
                                        <div className="space-y-2">
                                            <Label>Email del Admin *</Label>
                                            <Input
                                                type="email"
                                                placeholder="admin@empresa.com"
                                                value={form.admin_email}
                                                onChange={e => setForm({ ...form, admin_email: e.target.value })}
                                                className={errors.admin_email ? 'border-red-500' : ''}
                                            />
                                            {errors.admin_email && (
                                                <p className="text-xs text-red-500">{errors.admin_email}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contraseña Temporal</Label>
                                            <Input
                                                type="password"
                                                placeholder="Dejar vacío para generar automática"
                                                value={form.admin_password}
                                                onChange={e => setForm({ ...form, admin_password: e.target.value })}
                                                className={errors.admin_password ? 'border-red-500' : ''}
                                            />
                                            {errors.admin_password && (
                                                <p className="text-xs text-red-500">{errors.admin_password}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Si deja vacío, se usará &quot;TempPass123!&quot;
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Summary Card */}
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                                <h4 className="font-medium mb-2">Resumen</h4>
                                <div className="text-sm space-y-1 text-muted-foreground">
                                    <p>• <strong>{form.nombre_comercial || '—'}</strong></p>
                                    <p>• RUC: {form.ruc || '—'}</p>
                                    <p>• Plan: {PLANS.find(p => p.id === form.plan_id)?.name}</p>
                                    <p>• Se creará con Sede Principal automáticamente</p>
                                    {form.crear_admin && form.admin_email && (
                                        <p>• Admin: {form.admin_email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={handleBack} className="flex-1">
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Atrás
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Crear Empresa
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
