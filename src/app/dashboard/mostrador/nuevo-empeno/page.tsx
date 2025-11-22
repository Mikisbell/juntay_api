'use client'

import dynamic from 'next/dynamic'
import { WizardSkeleton } from '@/components/ui/loading-skeleton'

// Lazy load the wizard - reduces initial bundle by ~60%
const CotizadorWizard = dynamic(
    () => import('@/components/cotizador/CotizadorWizard'),
    {
        loading: () => <WizardSkeleton />,
        ssr: false // Wizard is fully client-side interactive
    }
)

export default function NuevoEmpenoPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Nuevo Empeño</h1>
                <p className="text-slate-600">
                    Complete los pasos para registrar una nueva operación.
                </p>
            </div>

            <CotizadorWizard />
        </div>
    )
}
