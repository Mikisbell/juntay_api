'use client'

import { useCotizador } from '@/hooks/useCotizador'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check, Save, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Steps
import IdentificacionStep from './steps/IdentificacionStep'
import TasacionStep from './steps/TasacionStep'
import CronogramaStep from './steps/CronogramaStep'
import AcuerdoStep from './steps/AcuerdoStep'
import ResumenStep from './steps/ResumenStep'

export default function CotizadorWizard() {
    const {
        step, setStep, cliente, setCliente,
        tipoBien, setTipoBien,
        gramaje, quilataje, setDatosOro,
        categoria, marca, modelo, estado, valorMercado, setDatosElectro,
        montoPrestamo, plazo, tasaInteres, setTasaInteres,
        detallesGarantia, setDetallesGarantia,
        frecuenciaPago, numeroCuotas, fechaInicio, cronograma, setFrecuenciaPago, setNumeroCuotas, setFechaInicio, setCronograma,
        restoreState, reset
    } = useCotizador()

    // Construct draft data object with only persistent fields
    const draftData = {
        step,
        cliente,
        tipoBien,
        gramaje, quilataje,
        categoria, marca, modelo, estado, valorMercado,
        montoPrestamo, plazo, tasaInteres,
        detallesGarantia,
        frecuenciaPago, numeroCuotas, fechaInicio, cronograma
    }

    const { lastSaved, isSaving, clearDraft, loadDraft } = useAutoSave(
        'empeno_draft',
        draftData,
        true, // Enabled
        30000 // Save every 30s or on change (debounced)
    )

    const [draftFound, setDraftFound] = useState(false)

    // Check for draft on mount
    useEffect(() => {
        const savedDraft = loadDraft()
        if (savedDraft && savedDraft.step > 1) {
            setDraftFound(true)
            toast.message('Borrador encontrado', {
                description: '¿Deseas restaurar tu última sesión?',
                action: {
                    label: 'Restaurar',
                    onClick: () => {
                        restoreState(savedDraft)
                        toast.success('Sesión restaurada correctamente')
                        setDraftFound(false)
                    }
                },
                cancel: {
                    label: 'Descartar',
                    onClick: () => {
                        clearDraft()
                        setDraftFound(false)
                    }
                },
                duration: 10000,
            })
        }
    }, []) // Run once on mount

    const handleManualSave = () => {
        // Force update by triggering a re-render or just rely on auto-save
        // Since useAutoSave saves on data change, we can just show a toast
        toast.success('Borrador guardado correctamente')
    }

    const handleDiscard = () => {
        if (confirm('¿Estás seguro de descartar el borrador y reiniciar?')) {
            clearDraft()
            reset()
            toast.success('Borrador descartado')
        }
    }

    const steps = [
        { number: 1, title: 'Identificación', component: IdentificacionStep },
        { number: 2, title: 'Evaluación', component: TasacionStep },
        { number: 3, title: 'Cronograma', component: CronogramaStep },
        { number: 4, title: 'Resumen', component: ResumenStep },
    ]

    const CurrentStepComponent = steps[step - 1].component

    return (
        <div className="w-full max-w-7xl mx-auto py-3 px-2 sm:px-4 lg:px-6">
            {/* Progress Bar */}
            <div className="mb-3 sm:mb-4">
                <div className="flex justify-between mb-2">
                    {steps.map((s) => (
                        <div
                            key={s.number}
                            className={`flex items-center gap-2 ${step >= s.number ? 'text-primary font-bold' : 'text-muted-foreground'
                                }`}
                        >
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2
                ${step >= s.number
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-muted-foreground'}
              `}>
                                {step > s.number ? <Check className="w-4 h-4" /> : s.number}
                            </div>
                            <span className="hidden sm:inline">{s.title}</span>
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <Card className="border-2 shadow-lg bg-white">
                <CardHeader className="border-b bg-white py-2 sm:py-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        Paso {step}: {steps[step - 1].title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {isSaving && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Guardando...
                            </span>
                        )}
                        {lastSaved && !isSaving && (
                            <span className="text-xs text-muted-foreground">
                                Guardado {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <Button variant="ghost" size="sm" onClick={handleDiscard} title="Descartar borrador">
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 min-h-[250px] sm:min-h-[300px] bg-white">
                    <CurrentStepComponent />
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-3">
                <Button
                    variant="outline"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="w-32"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atrás
                </Button>

                {step < 4 && (
                    <Button
                        onClick={() => setStep(Math.min(4, step + 1))}
                        className="w-32"
                        disabled={step === 1 && !cliente}
                    >
                        Siguiente
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    )
}
