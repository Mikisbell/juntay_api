'use client'

import { useCotizador } from '@/hooks/useCotizador'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

// Steps
import IdentificacionStep from './steps/IdentificacionStep'
import TasacionStep from './steps/TasacionStep'
import CronogramaStep from './steps/CronogramaStep'
import AcuerdoStep from './steps/AcuerdoStep'
import ResumenStep from './steps/ResumenStep'

export default function CotizadorWizard() {
    const { step, setStep, cliente } = useCotizador()

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
