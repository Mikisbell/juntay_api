import CotizadorWizard from '@/components/cotizador/CotizadorWizard'

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
